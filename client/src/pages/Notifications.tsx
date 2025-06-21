import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchAlertNotifications } from "@/components/SearchAlertNotifications";
import { useLocation } from "wouter";

export default function Notifications() {
  const [, setLocation] = useLocation();
  
  // Mock user ID - в реальном приложении будет из контекста авторизации
  const userId = 3;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/profile")}
            className="hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900">
            Уведомления
          </h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <SearchAlertNotifications userId={userId} />
        </div>
      </main>
    </div>
  );
}