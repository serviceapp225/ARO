import { ArrowLeft, Gavel } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useLocation, Link } from "wouter";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/contexts/AuthContext";

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
  const [location] = useLocation();
  const { user } = useAuth();

  // Determine current user ID based on phone number
  const getCurrentUserId = () => {
    if (!user?.phoneNumber) return 18;
    
    // Map phone numbers to user IDs (based on actual database IDs)
    const phoneToUserIdMap: Record<string, number> = {
      "+992 (22) 222-22-22": 18,  // Sony Vaio0
      "+992 (88) 888-88-88": 17,  // Тестовый пользователь
      "+992222222222": 18,
      "+992888888888": 17
    };
    
    return phoneToUserIdMap[user.phoneNumber] || 18;
  };

  const currentUserId = getCurrentUserId();

  const getTitle = () => {
    if (title) return title;
    
    switch (location) {
      case "/":
      case "/home":
        return "AUTOBID.TJ";
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
      default:
        return "AUTOBID.TJ";
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

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between pt-safe mobile-nav">
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
            onClick={() => window.open('https://wa.me/992000000000', '_blank')}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
            title="Связаться через WhatsApp"
          >
            <FaWhatsapp className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Центр - название */}
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        {(getTitle() === "AUTOBID.TJ") && (
          <Gavel className="w-5 h-5" />
        )}
        {getTitle()}
      </h1>

      {/* Правая часть */}
      <div className="flex items-center">
        {!shouldHideNotifications() && (
          <NotificationBell userId={currentUserId} />
        )}
      </div>
    </header>
  );
}