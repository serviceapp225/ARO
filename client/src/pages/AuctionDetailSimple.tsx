import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import type { User } from '@shared/schema';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Heart, Share2, Eye, Car, Users, Calendar, MapPin, Fuel, Palette, Settings, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuctions } from "@/contexts/AuctionContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function AuctionDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { auctions } = useAuctions();
  const { user: currentUser } = useAuth();
  
  // Fetch current user activation status from database
  const { data: serverUser } = useQuery<User>({
    queryKey: [`/api/users/${(currentUser as any)?.userId}`],
    enabled: !!currentUser && !!(currentUser as any)?.userId,
  });
  
  const [bidAmount, setBidAmount] = useState("");
  const [auctionEndTime, setAuctionEndTime] = useState<Date | null>(null);
  const [isTimerReady, setIsTimerReady] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current auction data
  const { data: currentAuction, refetch: refetchAuction } = useQuery({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
  });

  // Fetch real bidding history
  const { data: realBiddingHistory = [] } = useQuery({
    queryKey: [`/api/listings/${id}/bids`],
    enabled: !!id,
  });

  // Get unique bidder IDs to fetch user data
  const bidderIds = Array.isArray(realBiddingHistory) 
    ? (realBiddingHistory as any[]).map(bid => bid.bidderId).filter((id, index, arr) => arr.indexOf(id) === index)
    : [];

  // Use a single query to fetch all user data when bidderIds change
  const { data: usersData = [] } = useQuery({
    queryKey: ['users', bidderIds.sort().join(',')],
    queryFn: async () => {
      if (bidderIds.length === 0) return [];
      
      const userPromises = bidderIds.map(id => 
        fetch(`/api/users/${id}`).then(res => res.ok ? res.json() : null)
      );
      
      const users = await Promise.all(userPromises);
      return users.filter(Boolean);
    },
    enabled: bidderIds.length > 0,
  });

  // Create a map of user data by ID
  const userDataMap = usersData.reduce((acc: Record<number, any>, user: any) => {
    if (user && user.id) {
      acc[user.id] = user;
    }
    return acc;
  }, {});

  // Sort bids by amount (highest first) to show current winning bid at top
  const sortedBids = Array.isArray(realBiddingHistory) ? 
    (realBiddingHistory as any[]).sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)) : [];



  // Bid mutation with celebration effects
  const bidMutation = useMutation({
    mutationFn: async (bidData: { bidderId: number; amount: string }) => {
      const response = await apiRequest('POST', `/api/listings/${id}/bids`, bidData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Trigger celebration effects
      setShowConfetti(true);
      setCurrentPrice(parseFloat(variables.amount));
      
      // Automatically add to favorites when placing a bid
      if (!isFavorite(id!)) {
        addToFavorites(id!);
      }
      
      // Show success toast
      toast({
        title: "🎉 Ставка принята!",
        description: `Ваша ставка ${parseFloat(variables.amount).toLocaleString()} Сомони была успешно размещена.`,
        duration: 4000,
      });
      
      // Refetch auction data and bidding history to get updated price
      refetchAuction();
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}/bids`] });
      
      // Reset bid amount
      setBidAmount("");
    },
    onError: (error: any) => {
      console.error("Error placing bid:", error);
      
      // Parse error message from apiRequest format "400: {...}"
      let errorData: any = {};
      try {
        const errorText = error.message.split(': ')[1];
        if (errorText) {
          errorData = JSON.parse(errorText);
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }
      
      console.error("Parsed error data:", errorData);
      
      // Check for specific error types
      if (errorData.error === "Already highest bidder") {
        toast({
          title: "Вы уже лидируете",
          description: errorData.message || "Вы уже лидируете в аукционе с максимальной ставкой.",
          variant: "destructive",
          duration: 3000,
        });
      } else if (errorData.error === "Bid too low") {
        toast({
          title: "Ставка слишком низкая",
          description: errorData.message || "Ваша ставка должна быть выше текущей максимальной ставки.",
          variant: "destructive",
          duration: 3000,
        });
      } else if (error.message.includes("завершен") || errorData.message?.includes("завершен")) {
        toast({
          title: "Аукцион завершен",
          description: "К сожалению, ваша ставка не была высокой. Аукцион уже завершен.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Ошибка",
          description: errorData.message || error.message || "Не удалось разместить ставку. Попробуйте снова.",
          variant: "destructive",
          duration: 3000,
        });
      }
    },
  });

  // Helper function to determine condition by mileage
  const getConditionByMileage = (miles: number) => {
    if (miles <= 10000) return "Новое";
    if (miles <= 50000) return "Хорошее";
    return "Удовлетворительное";
  };

  // Use only real auction data from the database
  const auction = currentAuction as any;

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Initialize auction end time from real data
  useEffect(() => {
    if (auction?.auctionEndTime && !auctionEndTime) {
      const endTime = new Date(auction.auctionEndTime);
      setAuctionEndTime(endTime);
      setIsTimerReady(true);
    }
  }, [auction, auctionEndTime]);

  // Handle auction end callback
  const handleAuctionEnd = useCallback(() => {
    const bidsArray = sortedBids || [];
    
    if (bidsArray.length === 0) {
      // If no bids were placed, remove from favorites
      if (isFavorite(id!)) {
        removeFromFavorites(id!);
      }
      return;
    }

    // Find highest bid (first in sorted array)
    const highestBid = bidsArray[0];
    const currentUserId = (currentUser as any)?.userId;
    const isWinner = currentUserId && highestBid.bidderId === currentUserId;

    if (isWinner) {
      // User won the auction
      toast({
        title: "🎉 Поздравляем! Вы выиграли аукцион!",
        description: `Ваша ставка ${parseFloat(highestBid.amount).toLocaleString()} Сомони была наивысшей.`,
        duration: 8000,
      });
      setShowConfetti(true);
    } else {
      // User didn't win, remove from favorites
      if (isFavorite(id!)) {
        removeFromFavorites(id!);
        toast({
          title: "Аукцион завершен",
          description: "К сожалению, ваша ставка не была наивысшей. Аукцион завершен.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  }, [sortedBids, id, isFavorite, removeFromFavorites, toast]);

  // Handle bid submission
  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Войдите в систему",
        description: "Для участия в аукционе необходимо войти в систему",
        variant: "destructive",
        duration: 3000,
      });
      setLocation('/login');
      return;
    }
    
    // Check if user is active before allowing bid submission - use server data if available
    const isUserActive = serverUser?.isActive ?? (currentUser as any)?.isActive ?? false;
    if (!isUserActive) {
      setShowActivationDialog(true);
      return;
    }
    
    if (!bidAmount || !auction) return;
    
    const newBidAmount = parseFloat(bidAmount);
    const currentHighestBid = auction.currentBid ? parseFloat(auction.currentBid) : parseFloat(auction.startingPrice);
    
    if (newBidAmount <= currentHighestBid) {
      toast({
        title: "Неверная ставка",
        description: `Ставка должна быть больше текущей цены ${currentHighestBid.toLocaleString()} Сомони`,
        variant: "destructive",
      });
      return;
    }

    // Get current user ID from auth context
    const userId = (currentUser as any)?.userId;
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Не удается определить пользователя",
        variant: "destructive",
      });
      return;
    }

    // Place the bid using current user ID
    bidMutation.mutate({
      bidderId: userId,
      amount: bidAmount
    }, {
      onSuccess: () => {
        // Автоматически добавляем в избранное при размещении ставки
        if (!isFavorite(id!)) {
          addToFavorites(id!);
          toast({
            title: "Добавлено в избранное",
            description: "Аукцион автоматически добавлен в избранное",
            duration: 2000,
          });
        }
      },
      onError: (error: any) => {
        if (error.status === 403 && error.data?.error === "Account not activated") {
          // Show activation dialog
          setShowActivationDialog(true);
        } else {
          toast({
            title: "Ошибка",
            description: "Не удалось сделать ставку. Попробуйте еще раз.",
            variant: "destructive",
          });
        }
      }
    });
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (!id) return;
    
    if (isFavorite(id)) {
      removeFromFavorites(id);
      toast({
        title: "Удалено из избранного",
        description: "Аукцион удален из ваших избранных",
      });
    } else {
      addToFavorites(id);
      toast({
        title: "Добавлено в избранное",
        description: "Аукцион добавлен в ваши избранные",
      });
    }
  };

  // Navigation handlers
  const goBack = () => setLocation("/");

  // Image gallery handlers
  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const nextImage = () => {
    if (auction?.photos) {
      setCurrentImageIndex((prev) => (prev + 1) % auction.photos.length);
    }
  };

  const prevImage = () => {
    if (auction?.photos) {
      setCurrentImageIndex((prev) => (prev - 1 + auction.photos.length) % auction.photos.length);
    }
  };

  // Touch and mouse handlers for gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!mouseStart || !mouseEnd || !isDragging) {
      setIsDragging(false);
      return;
    }
    
    const distance = mouseStart - mouseEnd;
    const isLeftDrag = distance > 50;
    const isRightDrag = distance < -50;

    if (isLeftDrag) nextImage();
    if (isRightDrag) prevImage();
    
    setIsDragging(false);
  };

  if (!auction) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={goBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к аукционам
          </Button>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Аукцион не найден</p>
          </div>
        </div>
      </div>
    );
  }

  const currentHighestBid = auction.currentBid ? parseFloat(auction.currentBid) : parseFloat(auction.startingPrice);
  const condition = getConditionByMileage(auction.mileage);

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <ConfettiEffect isActive={showConfetti} />}
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleFavoriteToggle}
            >
              <Heart className={`h-4 w-4 ${isFavorite(id!) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-3 gap-6">
        {/* Left Column - Images */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
            {/* Main Image */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
              {auction.photos && auction.photos.length > 0 ? (
                <img
                  src={auction.photos[0]}
                  alt={`${auction.make} ${auction.model}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openGallery(0)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {/* Image Counter */}
              {auction.photos && auction.photos.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  {auction.photos.length}
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            {auction.photos && auction.photos.length > 1 && (
              <div className="p-4 grid grid-cols-4 gap-2">
                {auction.photos.slice(1, 5).map((photo: string, index: number) => (
                  <img
                    key={index + 1}
                    src={photo}
                    alt={`${auction.make} ${auction.model} ${index + 2}`}
                    className="aspect-video object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openGallery(index + 1)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Характеристики автомобиля</span>
                <Badge variant="outline">{condition}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Марка:</span>
                  <span className="font-medium">{auction.make}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Модель:</span>
                  <span className="font-medium">{auction.model}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Год:</span>
                  <span className="font-medium">{auction.year}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Пробег:</span>
                  <span className="font-medium">{auction.mileage.toLocaleString()} км</span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Двигатель:</span>
                  <span className="font-medium">{auction.engine || 'Не указан'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Трансмиссия:</span>
                  <span className="font-medium">{auction.transmission || 'Не указана'}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Топливо:</span>
                  <span className="font-medium">{auction.fuelType || 'Не указано'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Тип кузова:</span>
                  <span className="font-medium">{auction.bodyType || 'Не указан'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Цвет:</span>
                  <span className="font-medium">{auction.color || 'Не указан'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Местоположение:</span>
                  <span className="font-medium">{auction.location || 'Не указано'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">VIN:</span>
                  <span className="font-medium font-mono text-xs">{auction.vin || 'Не указан'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Растаможен:</span>
                  <span className="font-medium">{auction.customsCleared ? 'Да' : 'Нет'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Техосмотр:</span>
                  <span className="font-medium">{auction.technicalInspectionValid ? 'Действителен' : 'Не действителен'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {auction.description && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {auction.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Bidding History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                История ставок ({sortedBids.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedBids.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Ставок пока нет. Станьте первым!
                </p>
              ) : (
                <div className="space-y-3">
                  {sortedBids.slice(0, 5).map((bid: any, index: number) => (
                    <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          index === 0 ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{
                            userDataMap[bid.bidderId]?.fullName || 'Участник аукциона'
                          }</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bid.createdAt).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{parseFloat(bid.amount).toLocaleString()} Сомони</p>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            Лидирует
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bidding */}
        <div className="space-y-6">
          {/* Auction Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Лот #{auction.lotNumber}</Badge>
                <Badge variant="secondary">Активный</Badge>
              </div>
              <CardTitle className="text-xl">
                {auction.make} {auction.model}
              </CardTitle>
              <p className="text-muted-foreground">Год: {auction.year}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Аукцион завершится через:</p>
                {isTimerReady && auctionEndTime && (
                  <CountdownTimer 
                    endTime={auctionEndTime} 
                    onTimeUp={handleAuctionEnd}
                  />
                )}
              </div>

              <Separator />

              {/* Current Price */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Текущая цена</p>
                <p className="text-3xl font-bold text-green-600">
                  {currentHighestBid.toLocaleString()} Сомони
                </p>
                <p className="text-sm text-muted-foreground">
                  Ставок: {sortedBids.length}
                </p>
              </div>

              <Separator />

              {/* Bid Form */}
              <form onSubmit={handleBidSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Ваша ставка</label>
                  <Input
                    type="number"
                    placeholder={`Минимум ${(currentHighestBid + 100).toLocaleString()}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="mt-1"
                    min={currentHighestBid + 100}
                    step="100"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={bidMutation.isPending || !bidAmount}
                >
                  {bidMutation.isPending ? "Размещение..." : "Сделать ставку"}
                </Button>
              </form>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Ставка должна превышать текущую цену минимум на 100 Сомони</p>
                <p>• Отозвать ставку невозможно</p>
                <p>• Победитель определяется наивысшей ставкой</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {isGalleryOpen && auction.photos && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 text-white z-10 bg-black/50 p-2 rounded-full hover:bg-black/70"
            >
              ✕
            </button>
            
            <button
              onClick={prevImage}
              className="absolute left-4 text-white z-10 bg-black/50 p-2 rounded-full hover:bg-black/70"
            >
              ←
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 text-white z-10 bg-black/50 p-2 rounded-full hover:bg-black/70"
            >
              →
            </button>

            <img
              src={auction.photos[currentImageIndex]}
              alt={`${auction.make} ${auction.model}`}
              className="max-w-full max-h-full object-contain cursor-grab"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              draggable={false}
            />

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded">
              {currentImageIndex + 1} / {auction.photos.length}
            </div>
          </div>
        </div>
      )}

      {/* Activation Dialog */}
      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600">⚠️</span>
              </div>
              Аккаунт не активирован
            </DialogTitle>
            <DialogDescription>
              Для активации аккаунта необходимо пройти верификацию. Обратитесь в службу поддержки через WhatsApp или по номеру 9000000.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col items-center space-y-3 mt-4">
            <Button 
              onClick={() => {
                window.open("https://wa.me/992000000000?text=Здравствуйте! Мне нужно активировать аккаунт на AUTOBID.TJ", "_blank");
                setShowActivationDialog(false);
              }}
              className="bg-green-600 hover:bg-green-700 w-full max-w-xs"
            >
              Связаться с поддержкой
            </Button>
            <Button variant="outline" onClick={() => setShowActivationDialog(false)} className="w-full max-w-xs">
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}