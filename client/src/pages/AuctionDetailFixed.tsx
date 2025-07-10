import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuctions } from '@/contexts/AuctionContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAuctionWebSocket } from '@/hooks/useAuctionWebSocket';
import { AutoImageCarousel } from '@/components/AutoImageCarousel';
import { BidConfirmationDialog } from '@/components/BidConfirmationDialog';
import { ReservePriceIndicator } from '@/components/ReservePriceIndicator';
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
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showBidConfirmation, setShowBidConfirmation] = useState(false);
  const [pendingBidAmount, setPendingBidAmount] = useState("");
  const [hasShownEndNotification, setHasShownEndNotification] = useState(false);
  
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



  // Fetch current auction data
  const { data: currentAuction, refetch: refetchAuction } = useQuery({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    refetchIntervalInBackground: true,
  });

  // Fetch real bidding history with auto-refresh
  const { data: bidsData } = useQuery({
    queryKey: [`/api/listings/${id}/bids`],
    enabled: !!id,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time feel
    refetchIntervalInBackground: true,
    staleTime: 1000, // Данные устаревают через 1 секунду
    gcTime: 5000, // В кэше только 5 секунд
  });

  // Get unique bidder IDs to fetch user data
  const bidderIds = Array.isArray(bidsData) 
    ? (bidsData as any[]).map(bid => bid.bidderId).filter((id, index, arr) => arr.indexOf(id) === index)
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

  const { 
    auctions
  } = useAuctions();
  
  const { 
    isFavorite, 
    addToFavorites, 
    removeFromFavorites 
  } = useFavorites();
  
  const { user: currentUser } = useAuth();

  // Fetch current user activation status from database
  const { data: serverUser } = useQuery<User>({
    queryKey: [`/api/users/${(currentUser as any)?.userId}`],
    enabled: !!currentUser && !!(currentUser as any)?.userId,
  });

  // Use real auction data from database
  const auction = currentAuction as any;
  const sortedBids = Array.isArray(bidsData) ? bidsData : [];

  // Вычисляем текущую ставку из реальных данных
  const getCurrentBid = () => {
    if (Array.isArray(bidsData) && bidsData.length > 0) {
      // Находим максимальную ставку из истории ставок
      const maxBid = Math.max(...bidsData.map((bid: any) => parseFloat(bid.amount)));
      return maxBid;
    }
    // Если ставок нет, используем стартовую цену
    return auction ? parseFloat(auction.startingPrice) : 0;
  };
  
  const currentBid = getCurrentBid();
  
  const condition = auction ? translateCondition(auction.condition) : "Неизвестно";

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

  // WebSocket подключение к аукциону
  useEffect(() => {
    if (auction?.id) {
      joinAuction(parseInt(auction.id));
      
      return () => {
        leaveAuction();
      };
    }
  }, [auction?.id, joinAuction, leaveAuction]);

  // Обработка real-time обновлений ставок через WebSocket
  useEffect(() => {
    if (lastBidUpdate && lastBidUpdate.listingId === parseInt(id || '0')) {
      console.log('🔥 Real-time обновление ставки:', lastBidUpdate);
      
      // Немедленно обновляем состояние без перерисовки
      if (lastBidUpdate.data?.bid?.amount) {
        const newAmount = parseFloat(lastBidUpdate.data.bid.amount);
        console.log('💰 Обновляю цену с', currentPrice, 'на', newAmount);
        setCurrentPrice(newAmount);
        setBidAmount((newAmount + 1000).toString());
        
        // Показываем уведомление о новой ставке
        toast({
          title: "🔥 Новая ставка!",
          description: `${newAmount.toLocaleString()} Сомони`,
          duration: 2000,
        });
      }
      
      // Мгновенное обновление кэша для максимальной скорости
      queryClient.removeQueries({ queryKey: [`/api/listings/${id}/bids`] });
      queryClient.removeQueries({ queryKey: [`/api/listings/${id}`] });
      queryClient.removeQueries({ queryKey: ['/api/listings'] });
      
      // Принудительное мгновенное обновление данных аукциона для характеристик
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}/bids`] });
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      
      // Принудительное обновление данных аукциона для синхронизации характеристик
      refetchAuction();
    }
  }, [lastBidUpdate, id, queryClient, toast, refetchAuction]);

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

  // Синхронизация теперь происходит автоматически через реальные данные ставок

  useEffect(() => {
    // Обновляем currentPrice на основе реальной текущей ставки
    if (currentBid && currentBid !== currentPrice) {
      setCurrentPrice(currentBid);
      setBidAmount((currentBid + 1000).toString());
    }
  }, [currentBid, currentPrice]);

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
    // Проверяем, было ли уже показано уведомление о завершении
    if (hasShownEndNotification) {
      return;
    }

    const bidsArray = sortedBids || [];
    
    if (bidsArray.length === 0) {
      if (isFavorite(id!)) {
        removeFromFavorites(id!);
      }
      setHasShownEndNotification(true);
      return;
    }

    const highestBid = bidsArray[0];
    const userId = (currentUser as any)?.userId || (currentUser as any)?.id;
    const isWinner = currentUser && userId && highestBid.bidderId === userId;

    if (isWinner) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      toast({
        title: "🏆 Поздравляем! Вы победили!",
        description: `Вы выиграли аукцион со ставкой ${parseFloat(highestBid.amount).toLocaleString()} Сомони`,
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
    
    // Устанавливаем флаг, что уведомление уже показано
    setHasShownEndNotification(true);
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
      // Перенаправляем на страницу входа
      setLocation('/login');
      return;
    }

    // Check if user is active before allowing bid - use server data if available
    const isUserActive = serverUser?.isActive ?? (currentUser as any)?.isActive ?? false;
    if (!isUserActive) {
      setShowActivationDialog(true);
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
        description: `Минимальная ставка: ${(currentBidValue + 100).toLocaleString()} Сомони`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Показываем диалог подтверждения
    setPendingBidAmount(bidAmount);
    setShowBidConfirmation(true);
  };

  const handleConfirmBid = async () => {
    setShowBidConfirmation(false);
    setIsPlacingBid(true);
    
    const bidValue = parseFloat(pendingBidAmount);
    
    // Проверяем, лидирует ли пользователь уже сейчас
    const userId = (currentUser as any)?.userId || (currentUser as any)?.id;
    const userIsCurrentLeader = sortedBids && sortedBids.length > 0 && sortedBids[0].bidderId === userId;
    
    // Показываем эффекты только если пользователь НЕ лидирует сейчас
    // Если лидирует - тихая ставка без эффектов
    const shouldShowEffects = !userIsCurrentLeader;
    
    if (shouldShowEffects) {
      // Play celebration sound and show confetti only for non-leaders
      setShowConfetti(true);
      
      try {
        import('@assets/celebration_1750167957407.mp3').then((audioModule) => {
          const audio = new Audio(audioModule.default);
          audio.volume = 0.7;
          audio.play().catch(() => {
            console.log('Audio playback failed, using fallback');
            // Fallback to generated sound if custom audio fails
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const duration = 1.5;
              const sampleRate = audioContext.sampleRate;
              const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
              const data = buffer.getChannelData(0);
              
              for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const envelope = Math.exp(-t * 3) * (1 - Math.exp(-t * 10));
                const freq1 = 440 * (1 + t * 0.8);
                const freq2 = 550 * (1 + t * 0.6); 
                const wave = Math.sin(2 * Math.PI * freq1 * t) * 0.3 + Math.sin(2 * Math.PI * freq2 * t) * 0.2;
                data[i] = wave * envelope * 0.15;
              }
              
              const source = audioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContext.destination);
              source.start();
            } catch (fallbackError) {
              console.log('Fallback audio also failed');
            }
          });
        }).catch(() => {
          console.log('Custom audio import failed, using fallback');
          // Fallback to generated sound
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const duration = 1.5;
            const sampleRate = audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
              const t = i / sampleRate;
              const envelope = Math.exp(-t * 3) * (1 - Math.exp(-t * 10));
              const freq1 = 440 * (1 + t * 0.8);
              const freq2 = 550 * (1 + t * 0.6); 
              const wave = Math.sin(2 * Math.PI * freq1 * t) * 0.3 + Math.sin(2 * Math.PI * freq2 * t) * 0.2;
              data[i] = wave * envelope * 0.15;
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
          } catch (fallbackError) {
            console.log('All audio options failed');
          }
        });
      } catch (e) {
        console.log('Audio system not available');
      }
      
      setTimeout(() => setShowConfetti(false), 1500);
    }
    
    try {
      if (!userId) {
        console.error('User ID not found in auth context:', currentUser);
        toast({
          title: "Ошибка",
          description: "Не удается определить пользователя. Попробуйте перезагрузить страницу.",
          variant: "destructive",
        });
        return;
      }

      // Place bid using API
      const response = await fetch(`/api/listings/${id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bidValue.toString(),
          bidderId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403 && errorData.error === "Account not activated") {
          // Show activation dialog
          setShowActivationDialog(true);
          return;
        }
        
        // Handle specific error types with user-friendly messages
        if (errorData.error === "Already highest bidder") {
          toast({
            title: "Вы уже лидируете",
            description: "Вы уже сделали максимальную ставку в данном аукционе.",
            variant: "destructive",
            duration: 4000,
          });
          return;
        } else if (errorData.error === "Bid too low") {
          toast({
            title: "Ставка слишком низкая",
            description: "Ваша ставка должна быть выше текущей максимальной ставки.",
            variant: "destructive",
            duration: 4000,
          });
          return;
        }
        
        throw new Error(errorData.message || 'Failed to place bid');
      }
      
      // Ставка размещена успешно, данные обновятся автоматически
      
      // Показываем соответствующее уведомление
      if (userIsCurrentLeader) {
        // Пользователь уже лидирует - тихое уведомление
        toast({
          title: "Вы лидируете",
          description: `Ваша ставка ${bidValue.toLocaleString()} Сомони принята.`,
          duration: 2000,
        });
      } else {
        // Обычная ставка - стандартное уведомление
        toast({
          title: "Ставка принята",
          description: `Ваша ставка ${bidValue.toLocaleString()} Сомони принята.`,
          duration: 2000,
        });
      }
      
      // Автоматически добавляем в избранное при размещении ставки
      if (!isFavorite(id!)) {
        addToFavorites(id!);
        toast({
          title: "Добавлено в избранное",
          description: "Аукцион автоматически добавлен в избранное",
          duration: 2000,
        });
      }
      
      // Мгновенно обновляем локальное состояние для быстрой реакции
      queryClient.setQueryData([`/api/listings/${id}`], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            currentBid: bidValue.toString(),
            bidCount: (oldData.bidCount || 0) + 1
          };
        }
        return oldData;
      });
      

      
      setBidAmount((bidValue + 1000).toString());
      setShowBidInput(false);
      
      // Также обновляем список аукционов мгновенно
      queryClient.setQueryData(['/api/listings'], (oldData: any) => {
        if (oldData && Array.isArray(oldData)) {
          return oldData.map((listing: any) => 
            listing.id === parseInt(id!) 
              ? { ...listing, currentBid: bidValue.toString(), bidCount: (listing.bidCount || 0) + 1 }
              : listing
          );
        }
        return oldData;
      });
      
      // Обновляем данные в фоне для синхронизации с сервером
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}/bids`] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось разместить ставку. Попробуйте еще раз.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsPlacingBid(false);
      setBidAmount("");
      setPendingBidAmount("");
    }
  };

  const handleCancelBid = () => {
    setShowBidConfirmation(false);
    setPendingBidAmount("");
  };

  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      toast({
        title: "Войдите в систему",
        description: "Для добавления в избранное необходимо войти в систему",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      if (isFavorite(id!)) {
        await removeFromFavorites(id!);
        toast({
          title: "Удалено из избранного",
          description: "Аукцион удален из вашего списка избранного",
          duration: 2000,
        });
      } else {
        await addToFavorites(id!);
        toast({
          title: "Добавлено в избранное",
          description: "Аукцион добавлен в ваш список избранного",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить избранное",
        variant: "destructive",
        duration: 3000,
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

  // Skip loading screen for faster navigation
  if (!auction) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 page-content">
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
                  {/* Electric car range - показывается ПЕРВЫМ для электромобилей */}
                  {(auction.fuelType === 'Электро' || auction.fuelType === 'electric') && auction.electricRange && (
                    <Badge variant="outline" className="text-blue-700 bg-blue-100 border-blue-200">
                      ⚡ Запас хода: {auction.electricRange} км
                    </Badge>
                  )}
                  <Badge variant="outline" className={`${auction.customsCleared ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                    {auction.customsCleared ? '✓ Растаможен' : '✗ Не растаможен'}
                  </Badge>
                  <Badge variant="outline" className={`${auction.recycled ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-orange-700 bg-orange-50 border-orange-200'}`}>
                    {auction.recycled ? 'Утилизация: есть' : 'Утилизация: нет'}
                  </Badge>
                  <Badge variant="outline" className={`${auction.technicalInspectionValid ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                    {auction.technicalInspectionValid ? `Техосмотр до ${auction.technicalInspectionDate}` : 'Техосмотр: нет'}
                  </Badge>
                  <Badge variant="outline" className={`${auction.tinted ? 'text-indigo-700 bg-indigo-50 border-indigo-200' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                    {auction.tinted ? `Тонировка (${auction.tintingDate || 'дата не указана'})` : 'Тонировка: нет'}
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
                    <span className="text-gray-600 font-medium">Год выпуска</span>
                    <span className="font-semibold text-gray-900">{auction.year}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Пробег</span>
                    <span className="font-semibold text-gray-900">{auction.mileage?.toLocaleString()} км</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Состояние</span>
                    <span className="font-semibold text-gray-900">{translateCondition(auction.condition)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Двигатель</span>
                    <span className="font-semibold text-gray-900">{auction.engine || 'Не указан'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Коробка</span>
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
                  {/* Характеристики электромобиля */}
                  {(auction.fuelType === 'Электро' || auction.fuelType === 'electric') && (
                    <>
                      {auction.batteryCapacity && (
                        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-blue-50 border border-blue-200">
                          <span className="text-blue-700 font-medium">Батарея</span>
                          <span className="font-semibold text-blue-900">{auction.batteryCapacity} кВт·ч</span>
                        </div>
                      )}
                      {auction.electricRange && (
                        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-blue-50 border border-blue-200">
                          <span className="text-blue-700 font-medium">Запас хода</span>
                          <span className="font-semibold text-blue-900">{auction.electricRange} км</span>
                        </div>
                      )}
                    </>
                  )}
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
                  {currentBid.toLocaleString()} Сомони
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Стартовая цена: {parseFloat(auction.startingPrice).toLocaleString()} Сомони
                </p>
                
                {/* Reserve Price Indicator */}
                <div className="mt-3">
                  <ReservePriceIndicator
                    reservePrice={auction.reservePrice}
                    currentBid={currentBid.toString()}
                    startingPrice={auction.startingPrice}
                    size="md"
                    showProgress={false}
                  />
                </div>
              </div>

              {/* Auction Timer or Winner Congratulations */}
              {(() => {
                const isAuctionEnded = auction.status === 'ended' || auction.status === 'archived';
                const highestBid = sortedBids && sortedBids.length > 0 ? sortedBids[0] : null;
                const userId = (currentUser as any)?.userId || (currentUser as any)?.id;
                const isWinner = isAuctionEnded && highestBid && userId && highestBid.bidderId === userId;
                
                if (isAuctionEnded && isWinner) {
                  return (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">🏆</span>
                        </div>
                        <span className="font-bold text-green-800 text-lg">Поздравляем! Вы выиграли!</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {parseFloat(highestBid.amount).toLocaleString()} Сомони
                        </div>
                        <div className="text-sm text-green-700 mb-2">
                          Ваша выигрышная ставка
                        </div>
                        <div className="text-xs text-green-600">
                          Аукцион завершен {new Date(auction.endDate || auction.auctionEndTime).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  );
                } else if (isAuctionEnded) {
                  return (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">Аукцион завершен</span>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium text-gray-600 mb-1">
                          Торги окончены
                        </div>
                        <div className="text-sm text-gray-500">
                          Завершен {new Date(auction.endDate || auction.auctionEndTime).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
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
                  );
                }
              })()}

              {/* Bidding Controls */}
              {(() => {
                const isAuctionEnded = auction.status === 'ended' || auction.status === 'archived';
                
                if (isAuctionEnded) {
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-gray-600 font-medium mb-2">Аукцион завершен</div>
                      <p className="text-sm text-gray-500">
                        Торги по данному лоту окончены
                      </p>
                    </div>
                  );
                } else if (auction.sellerId === (currentUser as any)?.userId) {
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <div className="text-blue-800 font-medium mb-2">Ваш автомобиль</div>
                      <p className="text-sm text-blue-600">
                        Вы не можете делать ставки на собственный автомобиль
                      </p>
                    </div>
                  );
                } else if (!showBidInput) {
                  return (
                    <Button 
                      onClick={() => {
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
                        
                        // Check if user is active before showing bid input
                        if (!currentUser.isActive) {
                          setShowActivationDialog(true);
                          return;
                        }
                        
                        setShowBidInput(true);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                      size="lg"
                    >
                      Сделать ставку
                    </Button>
                  );
                } else {
                  return (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ваша ставка (минимум: {(currentBid + 100).toLocaleString()} Сомони)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Сомони</span>
                          <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full pl-20 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  );
                }
              })()}
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
                          {
                            userDataMap[bid.bidderId]?.fullName && userDataMap[bid.bidderId]?.fullName.trim() !== '' 
                              ? userDataMap[bid.bidderId]?.fullName 
                              : "(не указано)"
                          }
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(bid.createdAt).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${index === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                        {parseFloat(bid.amount).toLocaleString()} Сомони
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
                {auction?.make} {auction?.model}
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

      {/* Epic Celebration Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden bg-black bg-opacity-20">
          {/* Central Explosion */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Glowing Ring */}
              <div className="w-32 h-32 border-4 border-yellow-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-0 w-32 h-32 border-4 border-blue-400 rounded-full animate-ping opacity-50" style={{animationDelay: '0.5s'}}></div>
              
              {/* Center Trophy */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl animate-bounce filter drop-shadow-lg">🏆</div>
              </div>
            </div>
          </div>

          {/* Particle Explosion */}
          {[...Array(60)].map((_, i) => {
            const angle = (360 / 60) * i;
            const distance = 150 + Math.random() * 200;
            const size = Math.random() * 8 + 4;
            const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FD79A8', '#A29BFE'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            return (
              <div
                key={i}
                className="absolute rounded-full animate-pulse"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: color,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  boxShadow: `0 0 ${size * 2}px ${color}`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            );
          })}

          {/* Floating Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white font-bold text-2xl animate-bounce mt-32">
              <div className="text-lg">Ставка принята!</div>
            </div>
          </div>

          {/* Sparkles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute text-yellow-400 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                fontSize: `${Math.random() * 20 + 15}px`
              }}
            >
              ✨
            </div>
          ))}
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

      {/* Диалог подтверждения ставки */}
      <BidConfirmationDialog
        isOpen={showBidConfirmation}
        onConfirm={handleConfirmBid}
        onCancel={handleCancelBid}
        bidAmount={pendingBidAmount}
        currentBid={auction.currentBid?.toString() || '0'}
        carTitle={`${auction?.make} ${auction?.model} ${auction?.year}`}
      />
    </div>
  );
}