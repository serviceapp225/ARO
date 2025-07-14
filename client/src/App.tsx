import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuctionProvider } from "@/contexts/AuctionContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { AlertsProvider } from "@/contexts/AlertsContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { useAuctionWebSocket } from "@/hooks/useAuctionWebSocket";
import HomePage from "@/pages/HomePage";
import AuctionFeed from "@/pages/AuctionFeed";
import AuctionDetail from "@/pages/AuctionDetailFixed";
import Favorites from "@/pages/Favorites";
import SellCar from "@/pages/SellCar";
import MyBids from "@/pages/MyBids";
import MyWins from "@/pages/MyWins";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import MyAlerts from "@/pages/MyAlerts";
import UserData from "@/pages/UserData";
import MySales from "@/pages/MySalesSimple";
import LanguageSelector from "@/components/LanguageSelector";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Login from "@/pages/Login";
import AdminPanel from "@/pages/AdminPanel";
import SpecialOffers from "@/pages/SpecialOffers";
import Messages from "@/pages/Messages";

import NotFound from "@/pages/not-found";
import { FlutterPreview } from "@/pages/FlutterPreview";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ScrollToTop } from "@/components/ScrollToTop";

function Router() {
  const [location] = useLocation();
  
  // Глобальный WebSocket для мгновенного обновления карточек на всех страницах
  useAuctionWebSocket();
  
  // Предзагружаем критически важные данные для мгновенной загрузки
  useEffect(() => {
    // Предзагружаем рекламную карусель
    queryClient.prefetchQuery({
      queryKey: ['/api/advertisement-carousel'],
      queryFn: async () => {
        const response = await fetch('/api/advertisement-carousel');
        if (response.ok) return response.json();
        return [];
      },
      staleTime: Infinity,
    });
    
    // Предзагружаем основные аукционы для быстрого переключения
    queryClient.prefetchQuery({
      queryKey: ['/api/listings'],
      queryFn: async () => {
        const response = await fetch('/api/listings');
        if (response.ok) return response.json();
        return [];
      },
      staleTime: 300000, // 5 минут
    });
    
    // Предзагружаем секцию продажи авто
    queryClient.prefetchQuery({
      queryKey: ['/api/sell-car-section'],
      queryFn: async () => {
        const response = await fetch('/api/sell-car-section');
        if (response.ok) return response.json();
        return {};
      },
      staleTime: Infinity,
    });
  }, []);
  
  // Скрываем нижнюю навигацию на странице входа
  const hideBottomNav = location === '/login';
  
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/auctions" component={AuctionFeed} />
        <Route path="/auction/:id" component={AuctionDetail} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/sell" component={SellCar} />
        <Route path="/bids" component={MyBids} />
        <Route path="/my-wins" component={MyWins} />
        <Route path="/profile" component={Profile} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/my-alerts" component={MyAlerts} />
        <Route path="/user-data" component={UserData} />
        <Route path="/my-sales" component={MySales} />
        <Route path="/language" component={LanguageSelector} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/login" component={Login} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/special-offers" component={SpecialOffers} />
        <Route path="/messages" component={Messages} />

        <Route path="/flutter-preview" component={FlutterPreview} />
        <Route component={NotFound} />
      </Switch>
      {!hideBottomNav && <BottomNavigation />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <UserDataProvider>
            <AlertsProvider>
              <FavoritesProvider>
                <AuctionProvider>
                  <Toaster />
                  <Router />
                </AuctionProvider>
              </FavoritesProvider>
            </AlertsProvider>
          </UserDataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
