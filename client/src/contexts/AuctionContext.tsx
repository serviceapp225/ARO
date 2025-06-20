import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

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
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  
  // Clear cache on mount to ensure fresh data
  useEffect(() => {
    queryClient.removeQueries({ queryKey: ['/api/listings'] });
  }, []);

  // Fetch real data from API with reasonable refresh
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['/api/listings'],
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
    retryDelay: 2000,
    enabled: true,
    refetchOnMount: true
  });

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



  const refreshAuctions = useCallback(() => {
    refetch();
  }, [refetch]);

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