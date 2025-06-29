import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import type { CarAlert } from '@shared/schema';

interface SearchAlertNotificationsProps {
  userId: number;
}

export function SearchAlertNotifications({ userId }: SearchAlertNotificationsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  
  const handleDelete = (alertId: number) => {
    // Предотвращаем множественные клики
    if (deletingIds.has(alertId) || deleteCarAlertMutation.isPending) {
      return;
    }
    deleteCarAlertMutation.mutate(alertId);
  };

  const { data: carAlerts = [], isLoading } = useQuery<CarAlert[]>({
    queryKey: ['/api/car-alerts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/car-alerts/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch car alerts');
      return response.json();
    },
    staleTime: 0, // Всегда считать данные устаревшими для немедленного обновления
    gcTime: 60000, // Сократить кэш до 1 минуты для более частой очистки
    refetchOnWindowFocus: true, // Обновлять при фокусе окна
    refetchOnMount: true, // Всегда перезапрашивать при монтировании
    refetchInterval: false, // Отключить автообновление по таймеру
    retry: 2,
    retryDelay: 1000,
  });

  const deleteCarAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      try {
        const response = await fetch(`/api/car-alerts/${alertId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            // Запрос уже удален, считаем это успехом
            return {};
          }
          const errorText = await response.text();
          console.error('Delete error response:', response.status, errorText);
          throw new Error(`Ошибка удаления: ${response.status}`);
        }
        return {};
      } catch (error) {
        console.error('Delete mutation error:', error);
        throw error;
      }
    },
    onMutate: async (alertId) => {
      // Проверяем, не удаляется ли уже этот элемент
      if (deletingIds.has(alertId)) {
        throw new Error('Элемент уже удаляется');
      }
      
      // Добавляем в список удаляемых для показа индикатора загрузки
      setDeletingIds((prev: Set<number>) => new Set(prev).add(alertId));
      
      // Отменяем существующие запросы
      await queryClient.cancelQueries({ queryKey: ['/api/car-alerts', userId] });
      
      // Получаем предыдущие данные для возможного отката
      const previousAlerts = queryClient.getQueryData<CarAlert[]>(['/api/car-alerts', userId]);
      
      // Немедленно удаляем из UI (оптимистическое обновление)
      queryClient.setQueryData<CarAlert[]>(['/api/car-alerts', userId], (old = []) =>
        old.filter(alert => alert.id !== alertId)
      );
      
      return { previousAlerts };
    },
    onError: (error, alertId, context) => {
      console.error('Delete alert error:', error);
      
      // Принудительно убираем из списка удаляемых
      setDeletingIds((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
      
      // Откатываем изменения при ошибке
      if (context?.previousAlerts) {
        queryClient.setQueryData(['/api/car-alerts', userId], context.previousAlerts);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      // Игнорируем ошибку "уже удаляется" - это нормальное поведение
      if (errorMessage !== 'Элемент уже удаляется') {
        toast({
          title: "Ошибка при удалении",
          description: errorMessage,
          variant: "destructive", 
          duration: 3000,
        });
      }
    },
    onSuccess: async (_, alertId) => {
      // Убираем из списка удаляемых
      setDeletingIds((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
      
      // Полностью очищаем кэш и принудительно перезагружаем данные
      queryClient.removeQueries({ queryKey: ['/api/car-alerts', userId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/car-alerts', userId] });
      
      toast({
        title: "Поисковый запрос удален",
        duration: 1000, // Автоматически исчезает через 1 секунду
      });
    },
    onSettled: async (data, error, alertId) => {
      // Принудительно убираем из списка удаляемых в любом случае
      setDeletingIds((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
      
      // Принудительно перезагружаем данные в любом случае
      setTimeout(async () => {
        queryClient.removeQueries({ queryKey: ['/api/car-alerts', userId] });
        queryClient.removeQueries({ queryKey: ['/api/car-alerts'] });
        await queryClient.refetchQueries({ queryKey: ['/api/car-alerts', userId] });
      }, 100);
    }
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCarAlert = (alert: CarAlert) => {
    let description = alert.make?.toUpperCase() || 'Любая марка';
    if (alert.model) {
      description += ` ${alert.model}`;
    }
    if (alert.minYear || alert.maxYear) {
      description += ` (${alert.minYear || 'любой'}-${alert.maxYear || 'любой'} г.)`;
    }
    if (alert.minPrice || alert.maxPrice) {
      description += ` $${alert.minPrice || '0'}-${alert.maxPrice || '∞'}`;
    }
    return description;
  };

  if (isLoading) {
    return (
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-4 bg-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Сохраненные поисковые запросы</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка сохраненных запросов...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (carAlerts.length === 0) {
    return (
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-4 bg-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Сохраненные поисковые запросы</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет сохраненных запросов</h3>
            <p className="text-gray-600 mb-4">Вы еще не создали ни одного поискового запроса</p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-lg mx-auto">
              <p className="text-sm text-gray-700">
                Создайте поисковые запросы на главной странице для отслеживания новых автомобилей
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader className="pb-4 bg-gray-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Сохраненные поисковые запросы</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {carAlerts.map((alert) => (
          <div
            key={alert.id}
            className="group p-5 border border-gray-200 rounded-xl transition-all duration-200 bg-gray-50 hover:bg-gray-100 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-600">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Поисковый запрос
                        {alert.isActive && (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                        )}
                      </h4>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-gray-200">
                      <p className="text-sm text-gray-700 font-medium">
                        {formatCarAlert(alert)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      Создан {formatDate(alert.createdAt!)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(alert.id)}
                  disabled={deletingIds.has(alert.id) || deleteCarAlertMutation.isPending}
                  className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingIds.has(alert.id) ? (
                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}