import { Bell, Trash2, Car, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAlerts } from "@/contexts/AlertsContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@shared/schema';

export function UserAlerts() {
  const { alerts, removeAlert, toggleAlert } = useAlerts();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock user ID - в реальном приложении будет из контекста авторизации
  const userId = 3;

  const { data: allNotifications = [] } = useQuery<Notification[]>({
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
        description: "Уведомление о создании поиска удалено",
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

  const handleDeleteAlert = (alertId: number) => {
    removeAlert(alertId);
    toast({
      title: "Уведомление удалено",
      description: "Уведомление успешно удалено",
    });
  };

  const handleToggleAlert = (alertId: number) => {
    toggleAlert(alertId);
    toast({
      title: "Статус изменен",
      description: "Статус уведомления обновлен",
    });
  };

  const formatAlertDescription = (alert: any): string => {
    const parts = [];
    
    parts.push(alert.make.toUpperCase());
    
    if (alert.model) {
      parts.push(alert.model.toUpperCase());
    }
    
    if (alert.minYear || alert.maxYear) {
      if (alert.minYear && alert.maxYear) {
        parts.push(`${alert.minYear}-${alert.maxYear} г.`);
      } else if (alert.minYear) {
        parts.push(`от ${alert.minYear} г.`);
      } else if (alert.maxYear) {
        parts.push(`до ${alert.maxYear} г.`);
      }
    }
    
    if (alert.minPrice || alert.maxPrice) {
      if (alert.minPrice && alert.maxPrice) {
        parts.push(`$${alert.minPrice}-${alert.maxPrice}`);
      } else if (alert.minPrice) {
        parts.push(`от $${alert.minPrice}`);
      } else if (alert.maxPrice) {
        parts.push(`до $${alert.maxPrice}`);
      }
    }
    
    return parts.join(' • ');
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Мои поисковые запросы</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Car className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">У вас пока нет сохранённых поисковых запросов</p>
            <p className="text-sm text-gray-400">
              Создайте поисковый запрос на главной странице "Аукционы", чтобы получать уведомления о подходящих машинах
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Мои поисковые запросы</span>
            <Badge variant="secondary" className="ml-2">
              {alerts.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Car className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">
                  {formatAlertDescription(alert)}
                </span>
                <Badge variant={alert.isActive ? "default" : "secondary"}>
                  {alert.isActive ? "Активно" : "Отключено"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                Создано {new Date(alert.createdAt).toLocaleDateString('ru-RU')} • 
                {alert.isActive ? ' Получите уведомление когда появится подходящая машина' : ' Уведомления приостановлены'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleAlert(alert.id)}
              >
                {alert.isActive ? "Отключить" : "Включить"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteAlert(alert.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Created search alert notifications */}
        {searchAlertNotifications.length > 0 && (
          <>
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                История создания поисков
              </h4>
              <div className="space-y-3">
                {searchAlertNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg ${
                      !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Search className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h5>
                          <p className={`text-xs mt-1 ${
                            !notification.isRead ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt!).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}