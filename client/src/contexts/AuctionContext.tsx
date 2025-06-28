import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface Auction {
  id: string;
  lotNumber: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  photos: string[];
  currentBid: number;
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
  const queryClient = useQueryClient();
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  // Fetch listings with smart caching
  const fetchListings = useCallback(async (forceRefresh = false) => {
    try {
      // Сначала проверяем есть ли данные в React Query кэше
      const cachedData = queryClient.getQueryData(['/api/listings']);
      if (cachedData && !forceRefresh && Array.isArray(cachedData)) {
        setListings(cachedData);
        setIsLoading(false);
        return;
      }

      // Только показываем loading при принудительном обновлении или первой загрузке
      if (forceRefresh || listings.length === 0) {
        setIsLoading(true);
      }
      
      const response = await fetch('/api/listings', {
        cache: forceRefresh ? 'no-cache' : 'default',
        headers: forceRefresh ? {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // Проверяем, изменились ли данные на самом деле
          const dataHash = JSON.stringify(data).length;
          if (dataHash !== lastUpdateTime || listings.length === 0) {
            setListings(data);
            setLastUpdateTime(dataHash);
          }
        } else {
          setListings([]);
        }
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, lastUpdateTime, listings.length]);

  useEffect(() => {
    fetchListings(true); // Первая загрузка с индикатором
    // Фоновые обновления каждые 2 минуты без индикатора загрузки
    const interval = setInterval(() => fetchListings(false), 120000);
    return () => clearInterval(interval);
  }, [fetchListings]);

  // Debug logging (can be removed in production)
  // console.log("AuctionContext:", listings?.length, "listings loaded");
  
  // Transform listings data to auction format
  const auctions: Auction[] = Array.isArray(listings) ? listings.map((listing: any) => ({
    id: listing.id.toString(),
    lotNumber: listing.lotNumber,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    mileage: listing.mileage,
    photos: listing.photos || [],
    currentBid: parseFloat(listing.currentBid || listing.startingPrice),
    bidCount: listing.bidCount || 0,
    endTime: new Date(listing.auctionEndTime),
    status: listing.status as 'active' | 'ended',
    customsCleared: listing.customsCleared || false,
    recycled: listing.recycled || false,
    technicalInspectionValid: listing.technicalInspectionValid || false,
    technicalInspectionDate: listing.technicalInspectionDate,
    tinted: listing.tinted || false,
    tintingDate: listing.tintingDate,
    condition: listing.condition
  })) : [];



  const refreshAuctions = useCallback((forceRefresh = false) => {
    fetchListings(forceRefresh);
  }, [fetchListings]);

  return (
    <AuctionContext.Provider value={{ auctions, loading: isLoading, selectedAuction, setSelectedAuction, refreshAuctions }}>
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