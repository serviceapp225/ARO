import { Link, useLocation } from "wouter";
import { Home, Gavel, Search, Plus, User } from "lucide-react";

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/home", icon: Home, label: "Главная" },
    { path: "/auctions", icon: Gavel, label: "Аукционы" },
    { path: "/search", icon: Search, label: "Поиск" },
    { path: "/sell", icon: Plus, label: "Продать" },
    { path: "/profile", icon: User, label: "Профиль" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path === "/home" && location === "/");
          const Icon = item.icon;
          
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