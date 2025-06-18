import { ArrowLeft, Bell, Search, Sparkles, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAlerts } from "@/components/UserAlerts";
import { SearchAlertNotifications } from "@/components/SearchAlertNotifications";
import { useLocation } from "wouter";

export default function Notifications() {
  const [, setLocation] = useLocation();
  
  // Mock user ID - в реальном приложении будет из контекста авторизации
  const userId = 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/profile")}
            className="hover:bg-blue-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Поисковые уведомления
            </h1>
          </div>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Умные уведомления о поиске автомобилей
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Настройте персональные критерии поиска и получайте мгновенные уведомления о новых автомобилях, которые идеально подходят вам
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Точный поиск</h3>
                <p className="text-sm text-gray-600">
                  Настройте марку, модель, год выпуска и ценовой диапазон для максимально точных результатов
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Мгновенные уведомления</h3>
                <p className="text-sm text-gray-600">
                  Получайте уведомления в колокольчике сразу после появления подходящих автомобилей
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">История поисков</h3>
                <p className="text-sm text-gray-600">
                  Отслеживайте все созданные поисковые запросы и управляйте ими в одном месте
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Info card with improved design */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Как работают поисковые уведомления</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Создайте поисковые запросы с нужными критериями на главной странице "Аукционы". 
                    Когда появится подходящая машина, вы получите уведомление в колокольчике 
                    <Bell className="w-4 h-4 inline mx-1" /> в верхней части экрана с возможностью сразу перейти к объявлению.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content sections with improved spacing */}
          <div className="space-y-8">
            <UserAlerts />
            <SearchAlertNotifications userId={userId} />
          </div>
        </div>
      </main>
    </div>
  );
}