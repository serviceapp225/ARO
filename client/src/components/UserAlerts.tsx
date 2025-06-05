import { useState } from "react";
import { Bell, Trash2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CarAlert {
  id: number;
  make: string;
  model: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  minYear: number | null;
  maxYear: number | null;
  isActive: boolean;
  createdAt: string;
}

export function UserAlerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Mock user ID - в реальном приложении будет из контекста авторизации
  const userId = 1;

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['/api/car-alerts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/car-alerts?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки уведомлений');
      }
      return response.json();
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await fetch(`/api/car-alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления уведомления');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/car-alerts'] });
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

  const formatAlertDescription = (alert: CarAlert): string => {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Мои уведомления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Мои уведомления
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">У вас нет активных уведомлений</p>
            <p className="text-sm text-gray-400">
              Создайте уведомление на странице поиска автомобилей
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {formatAlertDescription(alert)}
                    </span>
                    {alert.isActive && (
                      <Badge className="bg-green-100 text-green-700">
                        Активно
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Создано: {new Date(alert.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAlertMutation.mutate(alert.id)}
                  disabled={deleteAlertMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}