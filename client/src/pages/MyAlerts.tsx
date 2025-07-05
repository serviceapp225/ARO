import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Trash2, Car, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface CarAlert {
  id: number;
  userId: number;
  make: string;
  model: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  createdAt: string;
}

export default function MyAlerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const userId = 3; // Mock user ID

  // Получаем список уведомлений пользователя
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['/api/car-alerts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/car-alerts/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    }
  });

  // Мутация для удаления уведомления
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await fetch(`/api/car-alerts/${alertId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete alert');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/car-alerts', userId] });
      toast({
        title: "Уведомление удалено",
        description: "Уведомление успешно удалено",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить уведомление",
        variant: "destructive",
      });
    }
  });

  const formatAlertDescription = (alert: CarAlert) => {
    const parts = [];
    if (alert.make) parts.push(`Марка: ${alert.make}`);
    if (alert.model) parts.push(`Модель: ${alert.model}`);
    if (alert.minYear) parts.push(`Год от: ${alert.minYear}`);
    if (alert.maxYear) parts.push(`Год до: ${alert.maxYear}`);
    if (alert.minPrice) parts.push(`Цена от: $${alert.minPrice}`);
    if (alert.maxPrice) parts.push(`Цена до: $${alert.maxPrice}`);
    return parts.join(', ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 main-content">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Мои уведомления</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка уведомлений...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет активных уведомлений
              </h3>
              <p className="text-gray-600 mb-6">
                Создайте уведомление при поиске автомобилей, чтобы получать информацию о новых объявлениях
              </p>
              <Link href="/auctions">
                <Button>
                  <Car className="w-4 h-4 mr-2" />
                  Перейти к поиску
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Активные уведомления ({alerts.length})
                  </h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Вы получите уведомление, когда появятся автомобили по указанным критериям
                </p>
              </div>

              {alerts.map((alert: CarAlert) => (
                <div key={alert.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Car className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">
                          Поиск автомобиля
                        </h3>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-700">
                          {formatAlertDescription(alert)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Создано: {formatDate(alert.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Активно
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                      disabled={deleteAlertMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}