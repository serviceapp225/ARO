import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuctions } from '@/contexts/AuctionContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { AutoImageCarousel } from '@/components/AutoImageCarousel';
import { 
  ArrowLeft, Car, Heart, Clock, TrendingUp, 
  Users, MapPin, Calendar, Gauge, Fuel, 
  Settings, Palette, Hash, Camera,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export default function AuctionDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [auctionEndTime, setAuctionEndTime] = useState<Date | null>(null);
  const [isTimerReady, setIsTimerReady] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [showBidInput, setShowBidInput] = useState(false);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current auction data
  const { data: currentAuction, refetch: refetchAuction } = useQuery({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
  });

  // Fetch real bidding history
  const { data: bidsData } = useQuery({
    queryKey: [`/api/listings/${id}/bids`],
    enabled: !!id,
  });

  const { 
    auctions
  } = useAuctions();
  
  const { 
    isFavorite, 
    addToFavorites, 
    removeFromFavorites 
  } = useFavorites();
  
  const { user: currentUser } = useAuth();

  // Use real auction data from database
  const auction = currentAuction as any;
  const sortedBids = Array.isArray(bidsData) ? bidsData : [];

  const currentBid = auction ? (auction.currentBid ? parseFloat(auction.currentBid) : parseFloat(auction.startingPrice)) : 0;
  
  const getConditionByMileage = (mileage: number): string => {
    const miles = mileage || 0;
    if (miles <= 10000) return "Отличное";
    if (miles <= 30000) return "Очень хорошее";
    if (miles <= 50000) return "Хорошее";
    return "Удовлетворительное";
  };
  
  const condition = auction ? getConditionByMileage(auction.mileage) : "Неизвестно";

  // All useEffect hooks - placed after state initialization but before conditional returns
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!auctionEndTime && auction?.auctionEndTime) {
      const endTime = new Date(auction.auctionEndTime);
      setAuctionEndTime(endTime);
      setIsTimerReady(true);
    }
  }, [auction, auctionEndTime]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!auctionEndTime) return;
      
      const difference = auctionEndTime.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (isTimerReady) {
          handleAuctionEnd();
        }
      }
    };

    if (isTimerReady) {
      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [auctionEndTime, isTimerReady]);

  useEffect(() => {
    if (auction && auction.currentBid) {
      const newPrice = parseFloat(auction.currentBid);
      if (newPrice !== currentPrice) {
        setCurrentPrice(newPrice);
        setBidAmount((newPrice + 1000).toString());
      }
    } else if (auction && auction.startingPrice) {
      const startPrice = parseFloat(auction.startingPrice);
      if (startPrice !== currentPrice) {
        setCurrentPrice(startPrice);
        setBidAmount((startPrice + 1000).toString());
      }
    }
  }, [auction, currentPrice]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      
      if (e.key === 'Escape') {
        closeGallery();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen]);

  // Function definitions
  const handleAuctionEnd = () => {
    const bidsArray = sortedBids || [];
    
    if (bidsArray.length === 0) {
      if (isFavorite(id!)) {
        removeFromFavorites(id!);
      }
      return;
    }

    const highestBid = bidsArray[0];
    const isWinner = currentUser && highestBid.bidderId === 3; // Demo user ID

    if (isWinner) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      toast({
        title: "🏆 Поздравляем! Вы победили!",
        description: `Вы выиграли аукцион со ставкой $${parseFloat(highestBid.amount).toLocaleString()}`,
        duration: 10000,
      });
    } else {
      if (isFavorite(id!)) {
        removeFromFavorites(id!);
        toast({
          title: "Аукцион завершен",
          description: "К сожалению, вы не выиграли этот аукцион",
          duration: 5000,
        });
      }
    }
  };

  const calculateTimeLeft = (endDate: string) => {
    if (!endDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const endTime = new Date(endDate);
    const currentTime = new Date();
    const difference = endTime.getTime() - currentTime.getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const handlePlaceBid = async () => {
    if (!currentUser) {
      toast({
        title: "Войдите в систему",
        description: "Для участия в аукционе необходимо войти в систему",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const timeLeftData = calculateTimeLeft(auction.auctionEndTime);
    const isAuctionEnded = timeLeftData.days === 0 && timeLeftData.hours === 0 && 
                          timeLeftData.minutes === 0 && timeLeftData.seconds === 0;
    
    if (isAuctionEnded) {
      toast({
        title: "Аукцион завершен",
        description: "К сожалению, ваша ставка не была высокой. Аукцион уже завершен.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    const bidValue = parseFloat(bidAmount);
    const currentBidValue = (currentAuction as any)?.currentBid ? parseFloat((currentAuction as any).currentBid) : auction.currentBid;
    
    if (bidValue <= currentBidValue) {
      toast({
        title: "Ставка слишком низкая",
        description: `Минимальная ставка: $${(currentBidValue + 100).toLocaleString()}`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsPlacingBid(true);
    
    try {
      // Place bid using API
      const response = await fetch(`/api/listings/${id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bidValue.toString(),
          bidderId: 3, // Using demo user ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place bid');
      }
      
      toast({
        title: "Ставка размещена!",
        description: `Ваша ставка $${bidValue.toLocaleString()} принята`,
        duration: 3000,
      });
      
      setBidAmount((bidValue + 1000).toString());
      setShowBidInput(false);
      
      await refetchAuction();
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}/bids`] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось разместить ставку. Попробуйте еще раз.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleFavoriteToggle = () => {
    if (!currentUser) {
      toast({
        title: "Войдите в систему",
        description: "Для добавления в избранное необходимо войти в систему",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (isFavorite(id!)) {
      removeFromFavorites(id!);
      toast({
        title: "Удалено из избранного",
        description: "Аукцион удален из вашего списка избранного",
        duration: 2000,
      });
    } else {
      addToFavorites(id!);
      toast({
        title: "Добавлено в избранное",
        description: "Аукцион добавлен в ваш список избранного",
        duration: 2000,
      });
    }
  };

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const nextImage = () => {
    if (auction?.photos && auction.photos.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % auction.photos.length);
    }
  };

  const prevImage = () => {
    if (auction?.photos && auction.photos.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + auction.photos.length) % auction.photos.length);
    }
  };

  // Touch and mouse handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!mouseStart || !mouseEnd || !isDragging) {
      setIsDragging(false);
      return;
    }
    
    const distance = mouseStart - mouseEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
    
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  // Show loading state while auction data is loading
  if (!auction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Загрузка аукциона...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Пожалуйста, подождите
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="hover:bg-blue-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к аукционам
            </Button>
            
            <div className="flex items-center gap-2">
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
      </div>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden relative">
            <div 
              className="h-64 cursor-pointer"
              onClick={() => openGallery(0)}
            >
              <AutoImageCarousel 
                images={auction?.photos || []} 
                alt={`${auction?.year} ${auction?.make} ${auction?.model}`}
                className="h-64"
                autoPlayInterval={3000}
              />
            </div>

            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
              Нажмите для просмотра галереи
            </div>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {auction?.photos?.length || 0} фото
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Характеристики автомобиля</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Полная информация о транспортном средстве</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Заголовок автомобиля */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {auction.year} {auction.make} {auction.model}
                  </h1>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Активный
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-blue-700 bg-blue-50 border-blue-200">
                    Лот № {auction.lotNumber}
                  </Badge>
                  <Badge variant="outline" className={`${auction.customsCleared ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                    {auction.customsCleared ? '✓ Растаможен' : '✗ Не растаможен'}
                  </Badge>
                </div>
              </div>

              {/* Основные характеристики */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Основные характеристики
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Пробег</span>
                    <span className="font-semibold text-gray-900">{auction.mileage?.toLocaleString()} км</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Состояние</span>
                    <span className="font-semibold text-gray-900">{condition}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Двигатель</span>
                    <span className="font-semibold text-gray-900">{auction.engine || 'Не указан'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Коробка</span>
                    <span className="font-semibold text-gray-900">{auction.transmission || 'Не указана'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Привод</span>
                    <span className="font-semibold text-gray-900">Передний привод</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Топливо</span>
                    <span className="font-semibold text-gray-900">{auction.fuelType || 'Не указано'}</span>
                  </div>
                </div>
              </div>

              {/* Внешний вид */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  Внешний вид и идентификация
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Кузов</span>
                    <span className="font-semibold text-gray-900">{auction.bodyType || 'Не указан'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Цвет</span>
                    <span className="font-semibold text-gray-900">{auction.color || 'Не указан'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">VIN</span>
                    <span className="font-semibold text-gray-900 font-mono text-sm">{auction.vin || 'Не указан'}</span>
                  </div>
                </div>
              </div>

              {/* Местоположение */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Местоположение
                </h3>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                  <span className="text-gray-600 font-medium">Город</span>
                  <span className="font-semibold text-gray-900">{auction.location || 'Не указан'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Auction Info */}
        <div className="space-y-6">
          {/* Bidding Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Текущая ставка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  ${currentBid.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Стартовая цена: ${parseFloat(auction.startingPrice).toLocaleString()}
                </p>
              </div>

              {/* Auction Timer */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Время до окончания</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-xl font-bold text-blue-600">{timeLeft.days}</div>
                    <div className="text-xs text-gray-600">дни</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">{timeLeft.hours}</div>
                    <div className="text-xs text-gray-600">часы</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">{timeLeft.minutes}</div>
                    <div className="text-xs text-gray-600">мин</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">{timeLeft.seconds}</div>
                    <div className="text-xs text-gray-600">сек</div>
                  </div>
                </div>
              </div>

              {/* Bidding Controls */}
              {!showBidInput ? (
                <Button 
                  onClick={() => setShowBidInput(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                  size="lg"
                >
                  Сделать ставку
                </Button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ваша ставка (минимум: ${(currentBid + 100).toLocaleString()})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Введите сумму"
                        min={currentBid + 100}
                        step="100"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePlaceBid}
                      disabled={isPlacingBid || !bidAmount || parseFloat(bidAmount) <= currentBid}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isPlacingBid ? "Размещение..." : "Подтвердить ставку"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBidInput(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bidding History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                История ставок
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sortedBids && sortedBids.length > 0 ? sortedBids.map((bid: any, index: number) => (
                  <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        index === 0 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Участник #{bid.bidderId}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(bid.createdAt).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${index === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                        ${parseFloat(bid.amount).toLocaleString()}
                      </div>
                      {index === 0 && (
                        <div className="text-xs text-green-600 font-medium">
                          Лидирующая ставка
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Пока нет ставок</p>
                    <p className="text-sm">Станьте первым участником!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Full Screen Gallery */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 text-white z-10 bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
            
            <button
              onClick={prevImage}
              className="absolute left-4 text-white z-10 bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 text-white z-10 bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div
              className="max-w-full max-h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
            >
              <img
                src={auction?.photos?.[currentImageIndex] || ''}
                alt={`${auction.year} ${auction.make} ${auction.model} - фото ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none pointer-events-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                draggable={false}
              />
            </div>

            {/* Image indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {auction?.photos?.map((_: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Image info */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white text-center">
              <p className="text-lg font-medium">
                {auction?.year} {auction?.make} {auction?.model}
              </p>
              <p className="text-sm opacity-80">
                Фото {currentImageIndex + 1} из {auction?.photos?.length || 0}
              </p>
              <p className="text-xs opacity-60 mt-1">
                Листайте пальцем или перетаскивайте мышью
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}