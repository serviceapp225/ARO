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
        parts.push(`${alert.minPrice}-${alert.maxPrice} Сомони`);
      } else if (alert.minPrice) {
        parts.push(`от ${alert.minPrice} Сомони`);
      } else if (alert.maxPrice) {
        parts.push(`до ${alert.maxPrice} Сомони`);
      }
    }
    
    return parts.join(' • ');
  };

  if (alerts.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Мои поисковые запросы</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Начните отслеживать автомобили</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              У вас пока нет сохранённых поисковых запросов
            </p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-lg mx-auto">
              <p className="text-sm text-blue-700">
                💡 Создайте поисковый запрос на главной странице "Аукционы", чтобы получать уведомления о подходящих машинах
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Мои поисковые запросы</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              {alerts.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="group p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-lg">
                    {formatAlertDescription(alert)}
                  </span>
                  <Badge 
                    variant={alert.isActive ? "default" : "secondary"}
                    className={alert.isActive 
                      ? "bg-green-100 text-green-700 hover:bg-green-200" 
                      : "bg-gray-100 text-gray-600"
                    }
                  >
                    {alert.isActive ? "🟢 Активно" : "⭕ Отключено"}
                  </Badge>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Создано:</span> {new Date(alert.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {alert.isActive 
                      ? '🔔 Получите уведомление когда появится подходящая машина' 
                      : '🔕 Уведомления приостановлены'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleAlert(alert.id)}
                  className={alert.isActive 
                    ? "border-orange-300 text-orange-600 hover:bg-orange-50" 
                    : "border-green-300 text-green-600 hover:bg-green-50"
                  }
                >
                  {alert.isActive ? "Отключить" : "Включить"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteAlert(alert.id)}
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