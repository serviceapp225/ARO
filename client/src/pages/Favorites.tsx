import { useState, useEffect } from "react";
import { Heart, Trash2, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuctions } from "@/contexts/AuctionContext";
import { CountdownTimer } from "@/components/CountdownTimer";


interface FavoriteCar {
  id: string;
  lotNumber: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  image: string;
  timeLeft: string;
  currentBid: number;
  location: string;
  addedDate: string;
}

export default function Favorites() {
  const [sortBy, setSortBy] = useState("recent");
  const [, setLocation] = useLocation();
  const { getFavoritesList, removeFromFavorites } = useFavorites();
  const { auctions, refreshAuctions } = useAuctions();
  
  // Auto-refresh data when favorites page is accessed
  useEffect(() => {
    refreshAuctions();
  }, []); // Empty dependency array to run only once on mount
  
  // Get favorite auctions from the auction list
  const favoriteIds = getFavoritesList();
  const favoriteAuctions = auctions.filter(auction => favoriteIds.includes(auction.id));
  
  // Helper function to check if auction is completed
  const isAuctionCompleted = (endTime: Date | string) => {
    return new Date(endTime) <= new Date();
  };

  const removeFavorite = async (id: string) => {
    try {
      await removeFromFavorites(id);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const goToAuction = (id: string) => {
    setLocation(`/auction/${id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const sortedFavorites = [...favoriteAuctions].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.currentBid - b.currentBid;
      case "price-high":
        return b.currentBid - a.currentBid;
      case "year-new":
        return b.year - a.year;
      case "year-old":
        return a.year - b.year;
      case "recent":
      default:
        return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Избранное</h1>
              <p className="text-neutral-600 mt-1">
                {favoriteAuctions.length} {favoriteAuctions.length === 1 ? 'автомобиль' : 'автомобилей'}
              </p>
            </div>
            <Heart className="w-6 h-6 text-red-500 fill-current" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {favoriteAuctions.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Нет избранных автомобилей
            </h3>
            <p className="text-gray-500 mb-6">
              Добавьте автомобили в избранное, чтобы быстро находить их
            </p>
            <Button onClick={() => setLocation("/")}>
              Перейти к аукционам
            </Button>
          </div>
        ) : (
          <>
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Мои избранные
              </h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Недавно добавленные</SelectItem>
                  <SelectItem value="price-low">Цена: по возрастанию</SelectItem>
                  <SelectItem value="price-high">Цена: по убыванию</SelectItem>
                  <SelectItem value="year-new">Год: новые</SelectItem>
                  <SelectItem value="year-old">Год: старые</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedFavorites.map((car) => (
                <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => goToAuction(car.id)}>
                  <div className="relative">
                    <img
                      src={car.photos[0] || "/api/placeholder/300/200"}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(car.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      {isAuctionCompleted(car.endTime) ? (
                        <div className="bg-gray-800/90 text-white px-2 py-1 rounded text-xs font-semibold">
                          ЗАВЕРШЕН
                        </div>
                      ) : (
                        <CountdownTimer endTime={car.endTime} size="small" />
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {car.lotNumber}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg text-neutral-900">
                          {car.make} {car.model}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {car.year} • {car.mileage.toLocaleString()} км • Душанбе
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          Седан
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Бензин
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Автомат
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Текущая ставка:</span>
                          <span className="font-bold text-blue-600">{formatPrice(car.currentBid)} Сомони</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToAuction(car.id);
                        }}
                      >
                        Посмотреть характеристики
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
      </div>
  );
}