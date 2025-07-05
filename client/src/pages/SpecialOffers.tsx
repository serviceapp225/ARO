import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Star, Sparkles, Crown, Heart, Clock, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CountdownTimer } from "@/components/CountdownTimer";
import { LazyCarImage } from "@/components/LazyCarImage";

export default function SpecialOffers() {
  const [, setLocation] = useLocation();

  // Получаем активные аукционы с высоким количеством ставок (особые предложения)
  const { data: specialOffers, isLoading } = useQuery({
    queryKey: ['/api/listings'],
    select: (data: any[]) => {
      // Фильтруем только активные аукционы и сортируем по количеству ставок
      return data
        .filter(listing => listing.status === 'active')
        .sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0))
        .slice(0, 12); // Топ 12 особых предложений
    },
    staleTime: 30000,
    gcTime: 300000,
  });

  // Получаем количество ставок для каждого лота
  const { data: bidCounts } = useQuery({
    queryKey: ['/api/bid-counts'],
    select: (data: Record<number, number>) => data || {},
    staleTime: 30000,
  });

  const isAuctionCompleted = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  const getSpecialBadge = (bidCount: number) => {
    if (bidCount >= 20) return { text: "🔥 ТОП ВЫБОР", color: "bg-red-500" };
    if (bidCount >= 10) return { text: "⭐ ПОПУЛЯРНЫЙ", color: "bg-orange-500" };
    if (bidCount >= 5) return { text: "✨ АКТУАЛЬНЫЙ", color: "bg-blue-500" };
    return { text: "🆕 НОВИНКА", color: "bg-green-500" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 page-content">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h1 className="text-lg font-semibold text-purple-900">Специальные предложения</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-purple-900">Особые предложения</h2>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Самые популярные автомобили с активными торгами и особыми условиями
          </p>
        </div>

        {/* Special Offers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialOffers?.map((offer: any) => {
              const bidCount = bidCounts?.[offer.id] || 0;
              const specialBadge = getSpecialBadge(bidCount);
              const currentBid = offer.currentBid ? parseFloat(offer.currentBid) : parseFloat(offer.startingPrice);
              
              return (
                <Card 
                  key={offer.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-purple-100 hover:border-purple-200 bg-white"
                  onClick={() => setLocation(`/auction/${offer.id}`)}
                >
                  <div className="relative">
                    <LazyCarImage
                      listingId={offer.id.toString()}
                      make={offer.make}
                      model={offer.model}
                      year={offer.year}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Special Badge */}
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold text-white ${specialBadge.color}`}>
                      {specialBadge.text}
                    </div>
                    
                    {/* Favorite Button */}
                    <div className="absolute top-3 right-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to favorites logic
                        }}
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>
                    
                    {/* Countdown Timer */}
                    <div className="absolute bottom-3 left-3">
                      {!isAuctionCompleted(offer.endTime) ? (
                        <CountdownTimer endTime={offer.endTime} size="small" />
                      ) : (
                        <div className="bg-gray-800/90 text-white px-2 py-1 rounded text-xs font-semibold">
                          ЗАВЕРШЕН
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {offer.lotNumber}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye className="w-3 h-3" />
                            {Math.floor(Math.random() * 100) + 50}
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {offer.make} {offer.model}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {offer.year} • {offer.mileage.toLocaleString()} км • Душанбе
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {offer.bodyType || 'Седан'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {offer.fuelType || 'Бензин'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {offer.transmission || 'Автомат'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Текущая ставка:</span>
                          <span className="text-lg font-bold text-purple-600">
                            {currentBid.toLocaleString()} TJS
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Users className="w-4 h-4" />
                            {bidCount} ставок
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            {isAuctionCompleted(offer.endTime) ? 'Завершен' : 'Активен'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!specialOffers || specialOffers.length === 0) && (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Специальных предложений пока нет
            </h3>
            <p className="text-gray-600 mb-6">
              Следите за обновлениями, скоро появятся новые особые предложения
            </p>
            <Button onClick={() => setLocation("/")}>
              Вернуться к аукционам
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}