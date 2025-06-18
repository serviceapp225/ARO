import { Bell, Trash2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAlerts } from "@/contexts/AlertsContext";

export function UserAlerts() {
  const { alerts, removeAlert, toggleAlert } = useAlerts();
  const { toast } = useToast();

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
      </CardContent>
    </Card>
  );
}