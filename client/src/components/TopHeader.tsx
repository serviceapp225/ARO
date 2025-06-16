import { ArrowLeft } from "lucide-react";
import { useLocation, Link } from "wouter";
import { NotificationBell } from "./NotificationBell";

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

  // Mock user ID for now - in real app this would come from auth context
  const currentUserId = 3; // Using buyer user from storage

  const getTitle = () => {
    if (title) return title;
    
    switch (location) {
      case "/":
      case "/home":
        return "AUTOAUCTION";
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
        return "AUTOAUCTION";
    }
  };

  // Hide notifications on auction-related and profile pages
  const shouldHideNotifications = () => {
    if (!showNotifications) return true;
    
    // Hide on auction detail pages (pattern: /auction/*)
    if (location.startsWith('/auction/')) return true;
    
    // Hide on profile and related pages
    if (location === '/profile') return true;
    if (location === '/favorites') return true;
    if (location === '/bids') return true;
    if (location === '/sell') return true;
    
    return false;
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <Link href={backPath}>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
        )}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {getTitle()}
        </h1>
      </div>

      {!shouldHideNotifications() && (
        <NotificationBell userId={currentUserId} />
      )}
    </header>
  );
}