import { MessageCircle, Search, Timer, Shield, Car, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { SellCarBanner } from "@/components/SellCarBanner";
import { AdvertisementCarousel } from "@/components/AdvertisementCarousel";
import { TopHeader } from "@/components/TopHeader";
import { Link } from "wouter";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import premiumCarsSvg from "@/assets/premium-cars.svg";


export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Поэтапная загрузка для мгновенного отображения основных элементов
  // Убрали загрузку sell-car-banner, используем статический компонент

  const { data: carouselData, isLoading: carouselLoading } = useQuery({
    queryKey: ['/api/advertisement-carousel'],
    staleTime: 30 * 60 * 1000, // 30 минут кэширования для рекламы
    gcTime: 60 * 60 * 1000, // 1 час в памяти
  });

  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/listings'],
    staleTime: 10 * 1000, // Объявления остаются свежими 10 секунд
    gcTime: 2 * 60 * 1000, // 2 минуты в памяти для быстрого возврата
  });

  // Показываем скелетон только пока критические данные (объявления) не загрузились
  const isPageLoading = listingsLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск будет обрабатываться компонентом ActiveAuctions
  };

  // Показываем скелетон пока данные загружаются
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 main-content">
        <TopHeader />
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Search Section */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Banner Skeleton */}
          <div className="h-44 rounded-2xl bg-gray-200 animate-pulse"></div>

          {/* Carousel Skeleton */}
          <div className="h-44 rounded-2xl bg-gray-200 animate-pulse"></div>

          {/* Security Banner Skeleton */}
          <div className="h-16 rounded-xl bg-gray-200 animate-pulse"></div>

          {/* Auctions Skeleton */}
          <div className="space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 main-content">
      <TopHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Section - всегда показываем первым */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Напишите номер лота или название автомобиля"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-base border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Hero Section - горизонтальная раскладка для планшетов и десктопа */}
        <div className="hero-section flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Sell Car Banner - первый элемент (слева на десктопе) */}
          <div className="sell-banner-container md:flex-1">
            <SellCarBanner />
          </div>

          {/* Advertisement Carousel - второй элемент (справа на десктопе) */}
          <div className="carousel-container md:flex-1">
            {carouselLoading ? (
              <div className="h-44 rounded-2xl bg-gray-200 animate-pulse"></div>
            ) : (
              <AdvertisementCarousel />
            )}
          </div>
        </div>

        {/* Security Banner - статическое содержимое, всегда показываем */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <h3 className="font-bold text-green-800 text-lg">Безопасные сделки</h3>
            </div>
          </div>
        </div>

        {/* Active Auctions Section - критическое содержимое */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Активные аукционы
          </h2>
          <ActiveAuctions searchQuery={searchQuery} />
        </section>
        
        {/* Дополнительный отступ для нижних кнопок навигации */}
        <div className="h-24"></div>
      </main>
    </div>
  );
}