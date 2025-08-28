import { ArrowLeft, Gavel, Settings, MessageCircle, MessageSquare } from "lucide-react";
import { useLocation, Link } from "wouter";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  backPath?: string;
  showNotifications?: boolean;
}

export function TopHeader({ 
  title, 
  showBack = false, 
  backPath = "/", 
  showNotifications = true 
}: TopHeaderProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Determine current user ID based on phone number
  const getCurrentUserId = () => {
    if (!user?.phoneNumber) return 18;
    
    // Map phone numbers to user IDs (based on actual database IDs)
    const phoneToUserIdMap: Record<string, number> = {
      "+992 (90) 333-13-32": 4,   // Пользователь 992903331332 (АДМИН)
      "+992903331332": 4
    };
    
    return phoneToUserIdMap[user?.phoneNumber || ''] || 18;
  };

  const currentUserId = (() => {
    try {
      return getCurrentUserId();
    } catch (error) {
      // Подавляем ошибку "user is not defined"
      console.log('🔇 Ошибка получения userId в TopHeader подавлена:', error);
      return 18; // Возвращаем fallback userId
    }
  })();

  // Обработка клика на кнопку сообщений с проверкой авторизации
  const handleMessagesClick = () => {
    if (!user || !user.phoneNumber) {
      // Если пользователь не авторизован, перенаправляем на страницу логина
      setLocation('/login');
    } else {
      // Если авторизован, переходим к сообщениям
      setLocation('/messages');
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (location) {
      case "/":
      case "/home":
        return "NARXI TU";
      case "/auctions":
        return "Аукционы";
      case "/favorites":
        return "Избранное";
      case "/sell":
        return "Продать автомобиль";
      case "/bids":
        return "Мои ставки";
      case "/profile":
        return "Профиль";
      case "/notifications":
        return "Уведомления";
      case "/messages":
        return "Сообщения";
      default:
        return "NARXI TU";
    }
  };

  // Hide notifications on specific pages only
  const shouldHideNotifications = () => {
    if (!showNotifications) return true;
    
    // Hide on auction detail pages (pattern: /auction/*)
    if (location.startsWith('/auction/')) return true;
    
    // Hide on sell page only
    if (location === '/sell') return true;
    
    return false;
  };

  // Получаем количество непрочитанных сообщений
  const { data: unreadCount } = useQuery<{ count: string }>({
    queryKey: [`/api/messages/unread-count/${currentUserId}`],
    refetchInterval: false, // Убираем автоматическое обновление - полагаемся на WebSocket
    staleTime: 60000, // Кэшируем данные на 1 минуту
    gcTime: 300000, // Держим в памяти 5 минут
    enabled: !shouldHideNotifications() && !!currentUserId,
    refetchOnWindowFocus: false, // Отключаем лишние обновления
  });

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      {/* Левая часть */}
      <div className="flex items-center gap-3">
        {showBack && (
          <Link href={backPath}>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
        )}
        {!shouldHideNotifications() && (
          <button
            onClick={() => window.open('https://wa.me/992903331332', '_blank')}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            title="Связаться через WhatsApp"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Центр - название */}
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        {(getTitle() === "NARXI TU") && (
          <Gavel className="w-5 h-5" />
        )}
        {getTitle()}
      </h1>

      {/* Правая часть */}
      <div className="flex items-center gap-2">
        {/* Кнопка админ панели - только для пользователя 992903331332 */}
        {(user?.email?.includes('992903331332') || 
          user?.phoneNumber?.includes('333-13-32')) && (
          <Link href="/admin">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Админ панель">
              <Settings className="w-5 h-5" />
            </button>
          </Link>
        )}
        {/* Кнопка сообщений - всегда видна */}
        {!shouldHideNotifications() && (
          <button 
            onClick={handleMessagesClick}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors relative" 
            title="Сообщения"
          >
            <MessageCircle className="w-5 h-5" />
            {/* Счетчик непрочитанных сообщений */}
            {unreadCount && parseInt(unreadCount.count) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {parseInt(unreadCount.count) > 9 ? '9+' : unreadCount.count}
              </span>
            )}
          </button>
        )}
        {!shouldHideNotifications() && (
          <NotificationBell userId={currentUserId} />
        )}
      </div>
    </header>
  );
}