import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { User as UserIcon, Globe, Bell, Heart, HelpCircle, FileText, LogOut, Camera, Edit, ChevronRight, MessageCircle, Building2, UserCheck, Shield, ShieldX, Settings, Car } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function Profile() {
  const { user, logout } = useAuth();
  const { userData, updateUserData } = useUserData();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Загружаем актуальные данные пользователя с сервера
  const { data: serverUser } = useQuery<User>({
    queryKey: [`/api/users/${(user as any)?.userId}`],
    enabled: !!user && !!(user as any)?.userId,
  });
  
  // Используем данные с сервера, если они доступны, иначе данные из контекста
  const currentUser = serverUser || user;
  const isUserActive = serverUser?.isActive ?? (user as any)?.isActive ?? false;

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }
      
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      // Создаем URL для отображения изображения
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        updateUserData({ profilePhoto: imageDataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };
  
  const menuItems = [
    { icon: UserIcon, label: "Мои данные", action: () => setLocation("/user-data") },
    { icon: Car, label: "Мои продажи", action: () => setLocation("/my-sales") },
    { icon: Bell, label: "Поисковые уведомления", action: () => setLocation("/notifications") },
    ...(currentUser?.role === 'admin' ? [{ icon: Settings, label: "Админ панель", action: () => setLocation("/admin") }] : []),
    { icon: Globe, label: "Поменять язык", action: () => setLocation("/language") },
    { icon: HelpCircle, label: "Правила и условия", action: () => setLocation("/terms") },
    { icon: FileText, label: "Политика конфиденциальности", action: () => setLocation("/privacy") },
    { icon: MessageCircle, label: "Связаться с оператором", action: () => window.open("https://wa.me/992900000000", "_blank") },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-4">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
          <h1 className="text-2xl font-bold text-gray-900 text-center">Профиль</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header with Photo, Name and Phone */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="text-center">
              {/* Profile Photo */}
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mx-auto">
                  {userData.profilePhoto ? (
                    <img 
                      src={userData.profilePhoto} 
                      alt="Фото профиля" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-gray-600" />
                  )}
                </div>
                <button 
                  onClick={handleCameraClick}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
              
              {/* Name and Phone */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user?.fullName || userData.fullName || 'Не указано'}
              </h2>
              <p className="text-gray-600 text-lg mb-3">{user?.phoneNumber || userData.phoneNumber}</p>
              
              {/* Account Type and Status Badges */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  userData.accountType === 'dealer' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {userData.accountType === 'dealer' ? (
                    <Building2 className="w-4 h-4 mr-2" />
                  ) : (
                    <UserCheck className="w-4 h-4 mr-2" />
                  )}
                  {userData.accountType === 'dealer' ? 'Дилер' : 'Частное лицо'}
                </div>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isUserActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isUserActive ? (
                    <Shield className="w-4 h-4 mr-2" />
                  ) : (
                    <ShieldX className="w-4 h-4 mr-2" />
                  )}
                  {isUserActive ? 'Активирован' : 'Не активирован'}
                </div>
              </div>
            </div>
          </div>

          {/* Activation Status Notice */}
          {!isUserActive && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <ShieldX className="w-4 h-4 text-yellow-600" />
                </div>
                <h3 className="font-medium text-yellow-800 mb-2">Аккаунт не активирован</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Для активации аккаунта необходимо пройти верификацию. Обратитесь в службу поддержки через WhatsApp или по номеру 9000000.
                </p>
                <button
                  onClick={() => window.open("https://wa.me/992000000000?text=Здравствуйте! Мне нужно активировать аккаунт на AUTOBID.TJ", "_blank")}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  Связаться с поддержкой
                </button>
              </div>
            </div>
          )}

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
              onClick={async () => {
                await logout();
                setLocation('/home');
              }}
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