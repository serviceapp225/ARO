import { ArrowLeft, Trophy, Calendar, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { LazyCarImage } from "@/components/LazyCarImage";

interface UserWin {
  id: number;
  userId: number;
  listingId: number;
  winningBid: string;
  wonAt: string;
  listing?: {
    make: string;
    model: string;
    year: number;
    photos: string[];
    lotNumber: string;
  };
}

export default function MyWins() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: wins = [], isLoading } = useQuery<UserWin[]>({
    queryKey: [`/api/users/${(user as any)?.userId}/wins`],
    enabled: !!user && !!(user as any)?.userId,
    staleTime: 30000, // Данные актуальны 30 секунд
    gcTime: 60000, // В кэше 1 минута
  });

  const handleGoBack = () => {
    setLocation("/profile");
  };

  const handleViewAuction = (listingId: number) => {
    setLocation(`/auction/${listingId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Мои выигрыши</h1>
              <p className="text-gray-600">Все выигранные мною аукционы</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мои выигрыши</h1>
            <p className="text-gray-600">Все выигранные мною аукционы</p>
          </div>
        </div>

        {wins.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Пока нет выигрышей
              </h3>
              <p className="text-gray-600 mb-6">
                Участвуйте в аукционах, чтобы выиграть автомобили
              </p>
              <Button onClick={() => setLocation("/")}>
                Посмотреть аукционы
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {wins.map((win) => (
              <Card 
                key={win.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewAuction(win.listingId)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Car Image */}
                    <div className="relative w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {win.listing?.photos && win.listing.photos.length > 0 ? (
                        <LazyCarImage
                          listingId={String(win.listingId)}
                          make={win.listing.make}
                          model={win.listing.model}
                          year={win.listing.year}
                          photos={win.listing.photos}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Win Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {win.listing ? `${win.listing.make} ${win.listing.model}` : 'Автомобиль'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {win.listing?.year && (
                              <span>{win.listing.year} г.</span>
                            )}
                            {win.listing?.lotNumber && (
                              <span>• Лот #{win.listing.lotNumber}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800 flex-shrink-0">
                          <Trophy className="w-3 h-3 mr-1" />
                          ВЫИГРАНО
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {parseFloat(win.winningBid).toLocaleString()} Сомони
                          </p>
                          <p className="text-sm text-gray-600">Выигрышная ставка</p>
                        </div>
                        
                        <div className="text-right text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(win.wonAt).toLocaleDateString('ru-RU')}
                          </div>
                          <p className="mt-1">
                            {new Date(win.wonAt).toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}