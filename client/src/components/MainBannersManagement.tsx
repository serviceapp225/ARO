import { Card, CardContent } from "@/components/ui/card";
import { Car } from "lucide-react";

export function MainBannersManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Car className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Система банеров отключена
              </h3>
              <p className="text-gray-500">
                Все банеры удалены. Главная страница отображается без рекламных блоков.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}