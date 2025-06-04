import { Link, useLocation } from "wouter";
import { Home, Gavel, Heart, Plus, User } from "lucide-react";

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/home", icon: Home, label: "Главная" },
    { path: "/auctions", icon: Gavel, label: "Аукционы" },
    { path: "/sell", icon: Plus, label: "Продать", isCenter: true },
    { path: "/favorites", icon: Heart, label: "Избранное" },
    { path: "/profile", icon: User, label: "Профиль" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path === "/home" && location === "/");
          const Icon = item.icon;
          
          if (item.isCenter) {
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex flex-col items-center p-3 min-w-0 flex-1"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isActive ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium mt-1 text-blue-600">{item.label}</span>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center p-2 min-w-0 flex-1 ${
                isActive ? "text-primary" : "text-neutral-500"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}