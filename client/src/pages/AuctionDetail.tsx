import { useParams, useLocation } from "wouter";
import { ArrowLeft, Heart, MessageCircle, Eye, Car, Calendar, Gauge, Users, Phone, Clock, X, ChevronLeft, ChevronRight, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuctions } from "@/contexts/AuctionContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { AutoImageCarousel } from "@/components/AutoImageCarousel";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { AnimatedPrice } from "@/components/AnimatedPrice";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuctionWebSocket } from "@/hooks/useAuctionWebSocket";

export default function AuctionDetail() {
  const { id } = useParams();
  const { auctions } = useAuctions();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // WebSocket для real-time обновлений
  const { 
    isConnected: wsConnected, 
    connectionQuality, 
    joinAuction, 
    leaveAuction, 
    lastBidUpdate,
    participantCount,
    isHotAuction 
  } = useAuctionWebSocket();

  // Translation functions for car characteristics
  const translateTransmission = (transmission: string) => {
    const translations = {
      'automatic': 'Автомат',
      'manual': 'Механика', 
      'cvt': 'Вариатор'
    };
    return translations[transmission as keyof typeof translations] || transmission || 'Не указана';
  };

  const translateFuelType = (fuelType: string) => {
    const translations = {
      'gasoline': 'Бензин',
      'diesel': 'Дизель',
      'gas': 'Газ',
      'gas_gasoline': 'Газ+бензин',
      'hybrid': 'Гибрид',
      'electric': 'Электро'
    };
    return translations[fuelType as keyof typeof translations] || fuelType || 'Не указано';
  };

  const translateBodyType = (bodyType: string) => {
    const translations = {
      'sedan': 'Седан',
      'crossover': 'Кроссовер',
      'suv': 'Внедорожник',
      'hatchback': 'Хэтчбек',
      'wagon': 'Универсал',
      'minivan': 'Минивен',
      'coupe': 'Купе',
      'convertible': 'Кабриолет',
      'pickup': 'Пикап'
    };
    return translations[bodyType as keyof typeof translations] || bodyType || 'Не указан';
  };

  const translateDriveType = (driveType: string) => {
    const translations = {
      'front': 'Передний',
      'rear': 'Задний', 
      'all': 'Полный'
    };
    return translations[driveType as keyof typeof translations] || driveType || 'Не указан';
  };

  const translateColor = (color: string) => {
    const translations = {
      'white': 'Белый',
      'black': 'Черный',
      'silver': 'Серебристый',
      'gray': 'Серый',
      'red': 'Красный',
      'blue': 'Синий',
      'green': 'Зеленый',
      'yellow': 'Желтый',
      'brown': 'Коричневый',
      'gold': 'Золотистый',
      'other': 'Другой'
    };
    return translations[color as keyof typeof translations] || color || 'Не указан';
  };

  const translateCondition = (condition: string) => {
    const translations = {
      'excellent': 'Отличное',
      'very_good': 'Очень хорошее',
      'good': 'Хорошее',
      'satisfactory': 'Удовлетворительное',
      'requires_repair': 'Требует ремонта',
      'accident': 'После ДТП',
      'not_running': 'Не на ходу'
    };
    return translations[condition as keyof typeof translations] || condition || 'Не указано';
  };

  // Fetch current auction data with optimized caching
  const { data: currentAuction, refetch: refetchAuction } = useQuery({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
    staleTime: 1000, // Consider data fresh for 1 second
    refetchInterval: 3000, // Обновление аукциона каждые 3 секунды
    refetchIntervalInBackground: true,
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch real bidding history with fast updates
  const { data: realBiddingHistory = [] } = useQuery({
    queryKey: [`/api/listings/${id}/bids`],
    enabled: !!id,
    refetchInterval: 2000, // Обновление ставок каждые 2 секундынд для максимальной скорости
    staleTime: 2000, // Данные свежие 2 секунды
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false, // Не обновлять в фоне для экономии ресурсов
  });

  // Sort bids by amount (highest first) to show current winning bid at top
  const sortedBids = (realBiddingHistory as any[]).sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

  // Bid mutation with celebration effects
  const bidMutation = useMutation({
    mutationFn: async (bidData: { bidderId: number; amount: string }) => {
      const response = await fetch(`/api/listings/${id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bidData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to place bid');
      }
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
        description: `Ваша ставка ${parseFloat(variables.amount).toLocaleString()} Сомони успешно размещена`,
        duration: 3000,
      });
      
      // Refetch auction data and bidding history to get updated price
      refetchAuction();
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}/bids`] });
      
      // Update auction context data for favorites page
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      
      // Reset bid amount
      setBidAmount("");
    },
    onError: (error: Error) => {
      // Check if auction ended
      if (error.message.includes("завершен")) {
        toast({
          title: "Аукцион завершен",
          description: "К сожалению, ваша ставка не была высокой. Аукцион уже завершен.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось разместить ставку. Попробуйте снова.",
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

  // Use real auction data from database
  const auction = currentAuction as any;

  const currentBid = auction ? (auction.currentBid ? parseFloat(auction.currentBid) : parseFloat(auction.startingPrice || '0')) : 0;
  const condition = auction ? getConditionByMileage(auction.mileage) : "Неизвестно";

  // Прокрутка к верху страницы при загрузке
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Инициализация времени окончания аукциона
  useEffect(() => {
    if (!auctionEndTime && auction?.auctionEndTime) {
      const endTime = new Date(auction.auctionEndTime);
      setAuctionEndTime(endTime);
      setIsTimerReady(true);
    }
  }, [auction, auctionEndTime]);

  // WebSocket подключение к аукциону
  useEffect(() => {
    if (auction?.id) {
      joinAuction(parseInt(auction.id));
      
      return () => {
        leaveAuction();
      };
    }
  }, [auction?.id, joinAuction, leaveAuction]);

  // Обработка real-time обновлений ставок
  useEffect(() => {
    if (lastBidUpdate && lastBidUpdate.listingId === parseInt(id || '0')) {
      console.log('🔥 Real-time обновление ставки:', lastBidUpdate);
      
      // Агрессивное принудительное обновление кэша
      queryClient.removeQueries({ queryKey: [`/api/listings/${id}/bids`] });
      queryClient.removeQueries({ queryKey: [`/api/listings/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}/bids`] });
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}`] });
      
      // Принудительно запрашиваем свежие данные
      queryClient.refetchQueries({ queryKey: [`/api/listings/${id}/bids`], type: 'all' });
      queryClient.refetchQueries({ queryKey: [`/api/listings/${id}`], type: 'all' });
      
      // Обновляем цену без перезагрузки
      if (lastBidUpdate.data?.bid?.amount) {
        setCurrentPrice(parseFloat(lastBidUpdate.data.bid.amount));
        
        // Показываем уведомление о новой ставке
        toast({
          title: "🔥 Новая ставка!",
          description: `${parseFloat(lastBidUpdate.data.bid.amount).toLocaleString()} Сомони`,
          duration: 2000,
        });
      }
    }
  }, [lastBidUpdate, id, queryClient, toast]);

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

  // Функция для обработки окончания аукциона
  const handleAuctionEnd = () => {
    const bidsArray = sortedBids || [];
    
    if (bidsArray.length === 0) {
      // Если ставок не было, просто удаляем из избранного
      if (isFavorite(id!)) {
        removeFromFavorites(id!);
      }
      return;
    }

    // Находим наивысшую ставку (первая в отсортированном массиве)
    const highestBid = bidsArray[0];

    // Проверяем, является ли текущий пользователь (ID 3) победителем
    const currentUserId = 3;
    const isWinner = highestBid.bidderId === currentUserId;

    if (isWinner) {
      // Показываем сообщение о победе
      toast({
        title: "🏆 Поздравляем! Вы победили!",
        description: `Вы выиграли аукцион со ставкой ${parseFloat(highestBid.amount).toLocaleString()} Сомони`,
        duration: 10000,
      });
    } else {
      // Удаляем из избранного, если пользователь не победил
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
        // Auction has ended - handle favorites management
        handleAuctionEnd();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [auctionEndTime, handleAuctionEnd]);

  // Функция для автоматического продления времени аукциона при ставке в последние секунды
  const extendAuctionIfNeeded = () => {
    if (auctionEndTime) {
      const timeRemaining = auctionEndTime.getTime() - new Date().getTime();
      const tenSeconds = 10 * 1000; // 10 секунд в миллисекундах
      
      if (timeRemaining <= tenSeconds && timeRemaining > 0) {
        // Продлеваем аукцион на 10 секунд от текущего времени окончания
        const newEndTime = new Date(auctionEndTime.getTime() + tenSeconds);
        setAuctionEndTime(newEndTime);
        
        toast({
          title: "⏰ Аукцион продлен!",
          description: "Время продлено на 10 секунд из-за новой ставки",
          duration: 3000,
        });
        
        console.log("Аукцион продлен на 10 секунд из-за ставки в последние 10 секунд");
      }
    }
  };

  const handlePlaceBid = () => {
    if (!bidAmount || bidMutation.isPending) return;
    
    // Check if auction has ended
    if (auctionEndTime && auctionEndTime <= new Date()) {
      toast({
        title: "Аукцион завершен",
        description: "К сожалению, ваша ставка не была высокой. Аукцион уже завершен.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    const bidValue = parseFloat(bidAmount);
    const currentBidValue = (currentAuction as any)?.currentBid ? parseFloat((currentAuction as any).currentBid) : parseFloat(auction.currentBid || '0');
    
    if (bidValue <= currentBidValue) {
      toast({
        title: "Ставка слишком низкая",
        description: `Минимальная ставка: ${(currentBidValue + 100).toLocaleString()} Сомони`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    extendAuctionIfNeeded();
    
    // Place bid using real API with user ID 3 (buyer user)
    bidMutation.mutate({
      bidderId: 3,
      amount: bidAmount
    });
  };

  const handleQuickBid = (amount: number) => {
    const newBidAmount = parseFloat(auction.currentBid || '0') + amount;
    extendAuctionIfNeeded();
    setBidAmount(newBidAmount.toString());
  };

  const handleWhatsAppContact = () => {
    window.open(`https://wa.me/?text=Интересует автомобиль ${auction.make} ${auction.model} ${auction.year} года`, '_blank');
  };

  const handleToggleFavorite = () => {
    const auctionId = id || "1";
    if (isFavorite(auctionId)) {
      removeFromFavorites(auctionId);
    } else {
      addToFavorites(auctionId);
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
    setCurrentImageIndex((prev) => 
      prev === 0 ? 0 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? 0 : 0
    );
  };

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

  // Минимальное расстояние для регистрации свайпа
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
    }
    if (isRightSwipe) {
      prevImage();
    }
  };

  // Обработчики мыши для десктопа
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMouseEnd(null);
    setMouseStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!isDragging || !mouseStart || !mouseEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = mouseStart - mouseEnd;
    const isLeftDrag = distance > minSwipeDistance;
    const isRightDrag = distance < -minSwipeDistance;

    if (isLeftDrag) {
      nextImage();
    }
    if (isRightDrag) {
      prevImage();
    }
    
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isGalleryOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isGalleryOpen]);

  return (
    <div className="min-h-screen bg-gray-50 page-content">
      {/* Confetti Effect */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-2">
            {/* WebSocket индикатор */}
            <div className="flex items-center gap-1">
              {wsConnected ? (
                <div className="flex items-center gap-1">
                  <Wifi className="w-4 h-4 text-green-600" />
                  {isHotAuction && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                      🔥 LIVE
                    </span>
                  )}
                  {participantCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {participantCount} участника
                    </span>
                  )}
                </div>
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleToggleFavorite}>
              <Heart className={`w-5 h-5 ${isFavorite(id || "1") ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleWhatsAppContact}>
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="overflow-hidden">
          <div className="relative h-64">
            <div 
              className="h-64 cursor-pointer"
              onClick={() => openGallery(0)}
            >
              <AutoImageCarousel 
                images={auction?.imageUrl ? [auction.imageUrl] : []} 
                alt={`${auction?.year} ${auction?.make} ${auction?.model}`}
                className="h-64"
                autoPlayInterval={3000}
              />
            </div>

            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
              Нажмите для просмотра галереи
            </div>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {auction?.imageUrl ? 1 : 0} фото
            </div>
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
                  {auction.make} {auction.model}
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
                <Badge variant="outline" className={`${(auction as any).recycled ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-orange-700 bg-orange-50 border-orange-200'}`}>
                  {(auction as any).recycled ? 'Утилизация: есть' : 'Утилизация: нет'}
                </Badge>
                <Badge variant="outline" className={`${(auction as any).technicalInspectionValid ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                  {(auction as any).technicalInspectionValid ? `Техосмотр до ${(auction as any).technicalInspectionDate}` : 'Техосмотр: нет'}
                </Badge>
                <Badge variant="outline" className={`${(auction as any).tinted ? 'text-indigo-700 bg-indigo-50 border-indigo-200' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                  {(auction as any).tinted ? `Тонировка ${(auction as any).tintingDate}` : 'Тонировка: нет'}
                </Badge>
              </div>
            </div>

            {/* Основные характеристики */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Основная информация */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Основная информация
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Год выпуска</span>
                    <span className="font-semibold text-gray-900">{auction.year}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Пробег</span>
                    <span className="font-semibold text-gray-900">{auction.mileage.toLocaleString()} км</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Состояние</span>
                    <span className="font-semibold text-green-600">{translateCondition(auction.condition)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Город</span>
                    <span className="font-semibold text-gray-900">{auction.location}</span>
                  </div>
                </div>
              </div>

              {/* Технические характеристики */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Технические характеристики
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Двигатель</span>
                    <span className="font-semibold text-gray-900">{auction.engine || 'Не указан'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">КПП</span>
                    <span className="font-semibold text-gray-900">{translateTransmission(auction.transmission)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Привод</span>
                    <span className="font-semibold text-gray-900">{translateDriveType(auction.driveType)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Топливо</span>
                    <span className="font-semibold text-gray-900">{translateFuelType(auction.fuelType)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Дополнительная информация
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                  <span className="text-gray-600 font-medium">Кузов</span>
                  <span className="font-semibold text-gray-900">{translateBodyType(auction.bodyType)}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                  <span className="text-gray-600 font-medium">Цвет</span>
                  <span className="font-semibold text-gray-900">{translateColor(auction.color)}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                  <span className="text-gray-600 font-medium">VIN</span>
                  <span className="font-semibold text-gray-900 font-mono text-sm">{auction.vin || 'Не указан'}</span>
                </div>
              </div>
            </div>

            {/* Статистика аукциона */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-3">Статистика аукциона</h3>
              <div className="flex items-center justify-center gap-16">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{auction.bidCount}</div>
                  <div className="text-sm text-gray-600">Ставок</div>
                </div>
                <div className="text-center">
                  <AnimatedPrice 
                    value={(currentAuction as any)?.currentBid ? parseFloat((currentAuction as any).currentBid) : (auction.currentBid ? parseFloat(auction.currentBid) : parseFloat(auction.startingPrice || '0'))}
                    className="text-2xl font-bold text-green-600"
                    onPriceUpdate={() => {
                      // Additional celebration effects when price updates
                      setTimeout(() => setShowConfetti(false), 3000);
                    }}
                  />
                  <div className="text-sm text-gray-600">Текущая ставка</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Время до окончания
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {!isTimerReady ? (
              <div className="grid grid-cols-4 gap-3 text-center">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 border">
                    <div className="text-xl font-bold text-gray-400 animate-pulse">--</div>
                    <div className="text-xs text-gray-400">загрузка</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="text-xl font-bold text-gray-900">{timeLeft.days}</div>
                  <div className="text-xs text-gray-600">дней</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="text-xl font-bold text-gray-900">{timeLeft.hours}</div>
                  <div className="text-xs text-gray-600">часов</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="text-xl font-bold text-gray-900">{timeLeft.minutes}</div>
                  <div className="text-xs text-gray-600">минут</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-xl font-bold text-blue-600">{timeLeft.seconds}</div>
                  <div className="text-xs text-blue-600">секунд</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Текущая ставка</CardTitle>
                <p className="text-white/80 text-sm mt-1">Сделайте свою ставку сейчас</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {(auction.currentBid ? parseFloat(auction.currentBid) : parseFloat(auction.startingPrice || '0')).toLocaleString()} Сомони
              </div>
              <p className="text-gray-600 text-sm bg-gray-50 rounded-lg px-3 py-2 inline-block">
                Следующая ставка от {((auction.currentBid ? parseFloat(auction.currentBid) : parseFloat(auction.startingPrice || '0')) + 500).toLocaleString()} Сомони
              </p>
              
              {/* Reserve Price Information */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {false ? (
                  <div className="space-y-2">
                    <div className={`text-sm font-medium px-3 py-2 rounded-lg bg-orange-100 text-orange-700`}>
                      {false ? (
                        <>✓ Резервная цена достигнута</>
                      ) : (
                        <>⚠ Резервная цена не достигнута</>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-2 rounded-lg inline-block">
                    🔥 Продажа без резерва!
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Введите вашу ставку"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1 text-lg font-semibold"
                />
                <Button 
                  onClick={handlePlaceBid}
                  disabled={!bidAmount || bidMutation.isPending || parseInt(bidAmount) <= auction.currentBid}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  {bidMutation.isPending ? "Размещение..." : "Сделать ставку"}
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleQuickBid(500)}
                  className="text-sm"
                >
                  +500 Сомони
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleQuickBid(1000)}
                  className="text-sm"
                >
                  +1,000 Сомони
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleQuickBid(2500)}
                  className="text-sm"
                >
                  +2,500 Сомони
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>



        <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">История ставок</CardTitle>
                <p className="text-white/80 text-sm mt-1">Активность участников аукциона</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {sortedBids.length > 0 ? sortedBids.map((bid: any, index: number) => (
                <div 
                  key={bid.id || index}
                  className={`flex justify-between items-center p-4 rounded-xl transition-all duration-200 ${
                    index === 0
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-md' 
                      : 'bg-white border border-gray-100 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {bid.bidder?.username || `Участник #${bid.bidderId}`}
                        {index === 0 && (
                          <Badge className="bg-green-600 text-white text-xs px-2 py-1">
                            👑 Лидирует
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(bid.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      index === 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {parseFloat(bid.amount).toLocaleString()} Сомони
                    </div>
                    {index === 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        Текущая ставка
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


      </main>

      {/* Полноэкранная галерея */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Кнопка закрытия */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-60 text-white hover:bg-white/20"
              onClick={closeGallery}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Кнопка предыдущего изображения */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-60 text-white hover:bg-white/20"
              onClick={prevImage}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            {/* Кнопка следующего изображения */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-60 text-white hover:bg-white/20"
              onClick={nextImage}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>

            {/* Текущее изображение */}
            <div 
              className={`w-full h-full flex items-center justify-center p-8 touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
            >
              <img
                src={auction?.imageUrl || ''}
                alt={`${auction.year} ${auction.make} ${auction.model} - фото ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none pointer-events-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                draggable={false}
              />
            </div>

            {/* Индикатор текущего изображения */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {auction.imageUrl && (
                <button
                  className="w-3 h-3 rounded-full bg-white transition-all"
                />
              )}
            </div>

            {/* Информация о фото */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white text-center">
              <p className="text-lg font-medium">
                {auction?.make} {auction?.model}
              </p>
              <p className="text-sm opacity-80">
                Фото 1 из {auction?.imageUrl ? 1 : 0}
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