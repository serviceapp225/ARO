import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, lazy, Suspense } from "react";
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
// SellCar загружается динамически для уменьшения размера основного бандла
// MyBids, MyWins, Profile, UserData загружаются динамически
import Notifications from "@/pages/Notifications";
import MyAlerts from "@/pages/MyAlerts";
import MySales from "@/pages/MySalesSimple";
import LanguageSelector from "@/components/LanguageSelector";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Login from "@/pages/Login";
// AdminPanel загружается динамически для уменьшения размера основного бандла
import SpecialOffers from "@/pages/SpecialOffers";
// Messages загружается динамически для уменьшения размера основного бандла

import NotFound from "@/pages/not-found";
import { FlutterPreview } from "@/pages/FlutterPreview";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ScrollToTop } from "@/components/ScrollToTop";

// Динамические импорты для оптимизации размера бандла
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const SellCar = lazy(() => import("@/pages/SellCar"));
const Messages = lazy(() => import("@/pages/Messages"));
const MyBids = lazy(() => import("@/pages/MyBids"));
const MyWins = lazy(() => import("@/pages/MyWins"));
const Profile = lazy(() => import("@/pages/Profile"));
const UserData = lazy(() => import("@/pages/UserData"));

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
        <Route path="/sell">
          <Suspense fallback={<div className="flex justify-center items-center h-96">Загрузка...</div>}>
            <SellCar />
          </Suspense>
        </Route>
        <Route path="/bids">
          <Suspense fallback={<div className="flex justify-center items-center h-96">Загрузка...</div>}>
            <MyBids />
          </Suspense>
        </Route>
        <Route path="/my-wins">
          <Suspense fallback={<div className="flex justify-center items-center h-96">Загрузка...</div>}>
            <MyWins />
          </Suspense>
        </Route>
        <Route path="/profile">
          <Suspense fallback={<div className="flex justify-center items-center h-96">Загрузка...</div>}>
            <Profile />
          </Suspense>
        </Route>
        <Route path="/notifications" component={Notifications} />
        <Route path="/my-alerts" component={MyAlerts} />
        <Route path="/user-data">
          <Suspense fallback={<div className="flex justify-center items-center h-96">Загрузка...</div>}>
            <UserData />
          </Suspense>
        </Route>
        <Route path="/my-sales" component={MySales} />
        <Route path="/language" component={LanguageSelector} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/login" component={Login} />
        <Route path="/admin">
          <Suspense fallback={<div className="flex justify-center items-center h-96">Загрузка админки...</div>}>
            <AdminPanel />
          </Suspense>
        </Route>
        <Route path="/special-offers" component={SpecialOffers} />
        <Route path="/messages">
          <Suspense fallback={<div className="flex justify-center items-center h-96">Загрузка...</div>}>
            <Messages />
          </Suspense>
        </Route>

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
