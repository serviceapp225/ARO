import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Car, X, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  listingId?: number;
  alertId?: number;
  isRead: boolean;
  createdAt: string;
}

interface AllNotificationsProps {
  userId: number;
}

export function AllNotifications({ userId }: AllNotificationsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', userId],
    queryFn: async () => {
      const response = await fetch(`/api/notifications/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    staleTime: 0,
    gcTime: 60000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return {};
    },
    onMutate: async (notificationId) => {
      if (deletingIds.has(notificationId)) {
        throw new Error('Уведомление уже удаляется');
      }
      
      setDeletingIds((prev: Set<number>) => new Set(prev).add(notificationId));
      
      await queryClient.cancelQueries({ queryKey: ['/api/notifications', userId] });
      
      const previousNotifications = queryClient.getQueryData<Notification[]>(['/api/notifications', userId]);
      
      queryClient.setQueryData<Notification[]>(['/api/notifications', userId], (old = []) =>
        old.filter(notification => notification.id !== notificationId)
      );
      
      return { previousNotifications };
    },
    onError: (error, notificationId, context) => {
      console.error('Delete notification error:', error);
      
      setDeletingIds((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      
      if (context?.previousNotifications) {
        queryClient.setQueryData(['/api/notifications', userId], context.previousNotifications);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      if (errorMessage !== 'Уведомление уже удаляется') {
        toast({
          title: "Ошибка при удалении",
          description: errorMessage,
          variant: "destructive", 
          duration: 3000,
        });
      }
    },
    onSuccess: async (_, notificationId) => {
      setDeletingIds((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      
      queryClient.removeQueries({ queryKey: ['/api/notifications', userId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/notifications', userId] });
      
      toast({
        title: "Уведомление удалено",
        duration: 1000,
      });
    },
    onSettled: async (data, error, notificationId) => {
      setDeletingIds((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      
      queryClient.removeQueries({ queryKey: ['/api/notifications', userId] });
      
      setTimeout(() => {
        queryClient.removeQueries({ queryKey: ['/api/notifications', userId] });
      }, 100);
    }
  });

  const handleDelete = (notificationId: number) => {
    if (deletingIds.has(notificationId) || deleteNotificationMutation.isPending) {
      return;
    }
    deleteNotificationMutation.mutate(notificationId);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_outbid':
        return <Car className="w-4 h-4 text-orange-600" />;
      case 'alert_create':
        return <Bell className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'bid_outbid':
        return 'border-orange-200 bg-orange-50';
      case 'alert_create':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <Card className="border shadow-sm bg-white">
        <CardContent>
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка уведомлений...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="border shadow-sm bg-white">
        <CardHeader className="pb-4 bg-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Уведомления</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет уведомлений</h3>
            <p className="text-gray-600 mb-4">У вас пока нет уведомлений</p>
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
          <span className="text-xl font-bold text-gray-900">Уведомления ({notifications.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`group p-5 border rounded-xl transition-all duration-200 hover:shadow-md ${getNotificationColor(notification.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="mb-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                        {!notification.isRead && (
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-2"></span>
                        )}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleDelete(notification.id)}
                disabled={deletingIds.has(notification.id) || deleteNotificationMutation.isPending}
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                {deletingIds.has(notification.id) ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}