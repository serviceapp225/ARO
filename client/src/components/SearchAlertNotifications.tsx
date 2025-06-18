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
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${userId}`] });
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>История создания поисковых запросов</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-gray-500">
            Загрузка...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (searchAlertNotifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>История создания поисковых запросов</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">Пока нет истории создания поисковых запросов</p>
            <p className="text-sm text-gray-400">
              Здесь будут отображаться уведомления о созданных вами поисковых запросах
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>История создания поисковых запросов</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {searchAlertNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border rounded-lg ${
              !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`text-sm font-medium ${
                        !notification.isRead ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        !notification.isRead ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(notification.createdAt!)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}