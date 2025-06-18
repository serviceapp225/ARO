import { ArrowLeft, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAlerts } from "@/components/UserAlerts";
import { useLocation } from "wouter";

export default function Notifications() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Поисковые уведомления</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Info card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Как работают поисковые уведомления</h3>
                  <p className="text-sm text-blue-700">
                    Создайте поисковые запросы с нужными критериями. Когда появится подходящая машина, 
                    вы получите уведомление в колокольчике <Bell className="w-4 h-4 inline mx-1" /> в верхней части экрана.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User alerts */}
          <UserAlerts />
        </div>
      </main>
    </div>
  );
}