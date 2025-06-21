import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Eye, Users, TrendingUp, Car, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function MySales() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Получаем продажи текущего пользователя
  const { data: myListings, isLoading, error } = useQuery({
    queryKey: [`/api/listings/seller/${(user as any)?.userId}`],
    enabled: !!(user as any)?.userId,
  });

  const listings = Array.isArray(myListings) ? myListings : [];

  // Debug info
  console.log('MySales - user:', user);
  console.log('MySales - myListings:', myListings);
  console.log('MySales - isLoading:', isLoading);
  console.log('MySales - error:', error);
  console.log('MySales - isArray check:', Array.isArray(myListings));
  console.log('MySales - length:', myListings?.length);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-4">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Необходимо войти
          </h2>
          <p className="text-gray-500 mb-4">
            Войдите для просмотра ваших продаж
          </p>
          <Link href="/login">
            <Button className="w-full">Войти</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/profile")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Мои продажи</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                У вас пока нет объявлений
              </h2>
              <p className="text-gray-500 mb-6">
                Разместите первое объявление о продаже автомобиля
              </p>
              <Button 
                onClick={() => setLocation("/sell")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Подать объявление
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myListings?.map((listing: any) => (
                <div key={listing.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Car Photo */}
                      <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                        {listing.photos && listing.photos.length > 0 ? (
                          <img 
                            src={listing.photos[0]} 
                            alt={`${listing.make} ${listing.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Car Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {listing.make} {listing.model} {listing.year}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            listing.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : listing.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {listing.status === 'active' ? 'Активен' : 
                             listing.status === 'pending' ? 'На модерации' : 
                             listing.status === 'sold' ? 'Продан' : 'Завершен'}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-2">
                          Лот №{listing.lotNumber}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{listing.currentBid ? parseFloat(listing.currentBid).toLocaleString() : parseFloat(listing.startingPrice).toLocaleString()} сомони</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{listing.bidCount || 0} ставок</span>
                          </div>
                          {listing.status === 'active' && listing.auctionEndTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(listing.auctionEndTime) > new Date() 
                                  ? `До ${new Date(listing.auctionEndTime).toLocaleDateString()}`
                                  : 'Завершен'
                                }
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/auction/${listing.id}`)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Посмотреть
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}