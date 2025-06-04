import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, Globe, Bell, Heart, HelpCircle, FileText, LogOut, Camera, Edit, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { icon: Globe, label: "Поменять язык", action: () => console.log("Язык") },
    { icon: Bell, label: "Уведомления", action: () => console.log("Уведомления") },
    { icon: Heart, label: "Мой Вишлист", action: () => console.log("Вишлист") },
    { icon: HelpCircle, label: "Помощь", action: () => console.log("Помощь") },
    { icon: FileText, label: "Документы", action: () => console.log("Документы") },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-4">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Необходимо войти
          </h2>
          <p className="text-gray-500 mb-4">
            Войдите для доступа к профилю
          </p>
          <Link href="/login">
            <Button className="w-full">Войти</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header with Name and Phone Only */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user.email?.split('@')[0] || 'Пользователь'}
              </h2>
              <p className="text-gray-600 text-lg">+992 (90) 123-45-67</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-2xl shadow-sm mb-6">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index === 0 ? 'rounded-t-2xl' : ''
                } ${index === menuItems.length - 1 ? 'rounded-b-2xl' : 'border-b border-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="bg-white rounded-2xl shadow-sm">
            <button
              onClick={logout}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-medium">Выйти</span>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}