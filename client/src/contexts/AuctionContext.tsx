import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

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

  // Use TanStack Query for data fetching with optimized caching
  const { data: listings = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/listings'],
    refetchInterval: 2000, // Обновление каждые 2 секунды для быстрых цен
    staleTime: 5000, // Данные свежи 5 секунд для быстрого переключения
    gcTime: 60000, // Кэшируем 1 минуту для мгновенного возврата
    refetchOnWindowFocus: 'always', // Всегда обновлять при фокусе
    refetchOnMount: 'always', // Всегда обновлять при монтировании
    refetchOnReconnect: true,
  });

  // Transform listings to auctions format  
  const auctions: Auction[] = Array.isArray(listings) ? listings.map((listing: any) => ({
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
    endTime: new Date(listing.auctionEndTime || Date.now() + 86400000),
    status: listing.status === 'active' ? 'active' : 'ended',
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
  })) : [];

  const refreshAuctions = () => {
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