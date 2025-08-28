import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptimizedRealTime } from "@/hooks/useOptimizedRealTime";
import WebSocketManager from "@/utils/WebSocketManager";

interface Auction {
  id: string;
  lotNumber: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  photos: string[];
  currentBid: number;
  startingPrice: string;
  bidCount: number;
  endTime: Date;
  status: 'active' | 'ended' | 'pending';
  customsCleared: boolean;
  recycled: boolean;
  technicalInspectionValid: boolean;
  technicalInspectionDate?: string;
  tinted: boolean;
  tintingDate?: string;
  condition?: string;
  fuelType?: string;
  electricRange?: number;
  batteryCapacity?: number;
  location?: string;
}

interface AuctionContextType {
  auctions: Auction[];
  loading: boolean;
  selectedAuction: Auction | null;
  setSelectedAuction: (auction: Auction | null) => void;
  refreshAuctions: () => void;
  updateAuctionRealTime: (listingId: number, updates: Partial<Auction>) => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const queryClient = useQueryClient();

  // Оптимизированная система real-time обновлений
  const { isConnected, forceUpdate } = useOptimizedRealTime({
    enableWebSocket: true,
    enablePolling: false, // Отключаем polling, так как WebSocket работает
    pollingInterval: 5000, // Fallback только если WebSocket недоступен
  });

  // Используем глобальный WebSocketManager для избежания дублирования соединений
  useEffect(() => {
    const handleBidUpdate = (message: any) => {
      if (message.type === 'bid_placed') {
        console.log('📩 Обновление ставки через WebSocketManager:', message);
        // Мгновенно обновляем карточку аукциона
        updateAuctionCard(message.listingId, {
          currentBid: parseFloat(message.currentBid) || 0,
          bidCount: message.bidCount || 0
        });
      } else if (message.type === 'listing_approved') {
        console.log('🎉 Новое объявление одобрено:', message);
        // Обновляем список объявлений при одобрении модератором
        queryClient.invalidateQueries({
          queryKey: ['/api/listings']
        });
      }
    };

    // Подписываемся на сообщения через глобальный WebSocketManager
    const wsManager = WebSocketManager.getInstance();
    const unsubscribe = wsManager.addMessageHandler(handleBidUpdate);
    
    return unsubscribe;
  }, []);

  // Функция для мгновенного обновления карточки аукциона
  const updateAuctionCard = (listingId: number, updates: Partial<{ currentBid: number; bidCount: number }>) => {
    console.log('⚡ Мгновенное обновление карточки:', listingId, updates);
    
    // Обновляем кэш listings в React Query
    queryClient.setQueryData(['/api/listings'], (oldData: any[]) => {
      if (!Array.isArray(oldData)) return oldData;
      
      return oldData.map(listing => 
        listing.id === listingId 
          ? { 
              ...listing, 
              currentBid: updates.currentBid?.toString() || listing.currentBid,
              bidCount: updates.bidCount || listing.bidCount
            }
          : listing
      );
    });
  };

  // Обновить конкретный аукцион (для внешнего использования)
  const updateAuctionRealTime = (listingId: number, updates: Partial<Auction>) => {
    updateAuctionCard(listingId, {
      currentBid: updates.currentBid,
      bidCount: updates.bidCount
    });
  };

  // Ультра-оптимизированный запрос данных для главной страницы
  const { data: listings = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/listings'],
    staleTime: 5 * 60 * 1000, // Данные свежи 5 минут - WebSocket управляет обновлениями
    gcTime: 15 * 60 * 1000, // Кэш живет 15 минут
    refetchOnWindowFocus: false, // WebSocket обеспечивает актуальность
    refetchOnMount: false, // Используем кэшированные данные
    refetchOnReconnect: true, // Обновляем только при восстановлении соединения
    refetchInterval: false, // Полностью полагаемся на WebSocket
    retry: 2, // Меньше попыток
    retryDelay: 1000, // Быстрые попытки
  });

  // Transform listings to auctions format  
  const auctions: Auction[] = Array.isArray(listings) ? listings.map((listing: any) => {
    const endTime = new Date(listing.auctionEndTime || Date.now() + 86400000);
    const isExpired = endTime <= new Date();
    
    return {
      id: listing.id.toString(),
      lotNumber: listing.lotNumber || 'N/A',
      make: listing.make || 'Unknown',
      model: listing.model || 'Unknown', 
      year: listing.year || new Date().getFullYear(),
      mileage: listing.mileage || 0,
      photos: Array.isArray(listing.photos) ? listing.photos : [],
      currentBid: parseFloat(listing.currentBid) || parseFloat(listing.startingPrice) || 0,
      startingPrice: listing.startingPrice || '0',
      bidCount: listing.bidCount || 0,
      endTime: endTime,
      status: (listing.status === 'ended' || isExpired) ? 'ended' : listing.status,
      customsCleared: listing.customsCleared || false,
      recycled: listing.recycled || false,
      technicalInspectionValid: listing.technicalInspectionValid || false,
      technicalInspectionDate: listing.technicalInspectionDate,
      tinted: listing.tinted || false,
      tintingDate: listing.tintingDate,
      condition: listing.condition || 'good',
      fuelType: listing.fuelType,
      electricRange: listing.electricRange,
      batteryCapacity: listing.batteryCapacity,
      location: listing.location
    };
  }) : [];

  const refreshAuctions = () => {
    forceUpdate(); // Используем оптимизированное обновление
    refetch();
  };

  return (
    <AuctionContext.Provider value={{
      auctions,
      loading: isLoading,
      selectedAuction,
      setSelectedAuction,
      refreshAuctions,
      updateAuctionRealTime
    }}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuctions() {
  const context = useContext(AuctionContext);
  if (context === undefined) {
    throw new Error('useAuctions must be used within an AuctionProvider');
  }
  return context;
}