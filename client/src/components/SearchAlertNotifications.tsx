import { Check, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import type { Notification } from '@shared/schema';

interface SearchAlertNotificationsProps {
  userId: number;
}

export function SearchAlertNotifications({ userId }: SearchAlertNotificationsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allNotifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${userId}`],
    staleTime: 30000,
  });

  // Фильтруем только уведомления о созданных поисковых запросах
  const searchAlertNotifications = allNotifications.filter(n => n.type === 'alert_created');

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete notification error:', response.status, errorData);
        throw new Error(`Failed to delete notification: ${response.status} ${errorData}`);
      }
      // For 204 No Content, don't try to parse JSON
      if (response.status === 204) {
        return {};
      }
      return response.json();
    },
    onMutate: async (notificationId) => {
      // Отменяем исходящие запросы чтобы не перезаписать наше оптимистическое обновление
      await queryClient.cancelQueries({ queryKey: [`/api/notifications/${userId}`] });

      // Получаем предыдущие данные для возврата при ошибке
      const previousNotifications = queryClient.getQueryData([`/api/notifications/${userId}`]);

      // Оптимистично удаляем уведомление из UI
      queryClient.setQueryData([`/api/notifications/${userId}`], (old: Notification[] = []) =>
        old.filter(notification => notification.id !== notificationId)
      );

      return { previousNotifications };
    },
    onSuccess: () => {
      toast({
        title: "Уведомление удалено", 
        description: "Уведомление успешно удалено",
        duration: 2000,
      });
    },
    onSettled: () => {
      // Всегда обновляем данные после завершения мутации
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${userId}`] });
    },
    onError: (error: Error, _, context) => {
      // Восстанавливаем предыдущие данные при ошибке
      if (context?.previousNotifications) {
        queryClient.setQueryData([`/api/notifications/${userId}`], context.previousNotifications);
      }
      
      console.error('Delete notification mutation error:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось удалить уведомление: ${error.message}`,
        variant: "destructive",
        duration: 2000,
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${userId}`] });
    },
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

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">История создания поисковых запросов</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка истории...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (searchAlertNotifications.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">История создания поисковых запросов</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">История пуста</h3>
            <p className="text-gray-600 mb-4">Пока нет истории создания поисковых запросов</p>
            <div className="bg-purple-50 rounded-lg p-4 max-w-lg mx-auto">
              <p className="text-sm text-purple-700">
                📝 Здесь будут отображаться уведомления о созданных вами поисковых запросах
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">История создания поисковых запросов</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {searchAlertNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`group p-5 border border-gray-200 rounded-xl transition-all duration-200 ${
              !notification.isRead 
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:shadow-md' 
                : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !notification.isRead 
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100' 
                    : 'bg-gray-200'
                }`}>
                  <Search className={`w-4 h-4 ${
                    !notification.isRead ? 'text-purple-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`text-sm font-semibold ${
                        !notification.isRead ? 'text-purple-900' : 'text-gray-900'
                      }`}>
                        {notification.title}
                        {!notification.isRead && (
                          <span className="inline-block w-2 h-2 bg-purple-500 rounded-full ml-2"></span>
                        )}
                      </h4>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      !notification.isRead ? 'bg-white/60' : 'bg-white/80'
                    }`}>
                      <p className={`text-sm ${
                        !notification.isRead ? 'text-purple-700' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      🕒 {formatDate(notification.createdAt!)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {!notification.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteNotificationMutation.mutate(notification.id)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}