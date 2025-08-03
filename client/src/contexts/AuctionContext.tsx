import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOptimizedRealTime } from "@/hooks/useOptimizedRealTime";

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
  status: 'active' | 'ended';
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
}

interface AuctionContextType {
  auctions: Auction[];
  loading: boolean;
  selectedAuction: Auction | null;
  setSelectedAuction: (auction: Auction | null) => void;
  refreshAuctions: () => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  // Оптимизированная система real-time обновлений
  const { isConnected, forceUpdate } = useOptimizedRealTime({
    enableWebSocket: true,
    enablePolling: false, // Отключаем polling, так как WebSocket работает
    pollingInterval: 5000, // Fallback только если WebSocket недоступен
  });

  // Оптимистичный запрос данных с быстрым обновлением для карточек
  const { data: listings = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/listings'],
    staleTime: 2000, // Данные считаются свежими только 2 секунды для быстрого обновления цен
    gcTime: 300000, // Кэш живет 5 минут
    refetchOnWindowFocus: true, // Обновляем при возврате на страницу
    refetchOnMount: true, // Получаем свежие данные при загрузке
    refetchOnReconnect: true, // Обновляем при восстановлении соединения
    refetchInterval: 3000, // Принудительно обновляем каждые 3 секунды для актуальных цен на карточках
    retry: 3, // Повторные попытки при ошибках
    retryDelay: 2000, // Задержка между попытками 2 секунды
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
      status: (listing.status === 'ended' || isExpired) ? 'ended' : 'active',
      customsCleared: listing.customsCleared || false,
      recycled: listing.recycled || false,
      technicalInspectionValid: listing.technicalInspectionValid || false,
      technicalInspectionDate: listing.technicalInspectionDate,
      tinted: listing.tinted || false,
      tintingDate: listing.tintingDate,
      condition: listing.condition || 'good',
      fuelType: listing.fuelType,
      electricRange: listing.electricRange,
      batteryCapacity: listing.batteryCapacity
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
      refreshAuctions
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