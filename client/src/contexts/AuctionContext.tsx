import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
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

  // Fetch real data from API with automatic refresh
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['/api/listings'],
    staleTime: 2000, // Consider data fresh for 2 seconds
    gcTime: 60000, // Keep in cache for 1 minute
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 3000, // Auto-refetch every 3 seconds
    select: (data: any[]) => data.map(listing => ({
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
      technicalInspectionDate: listing.technicalInspectionDate
    }))
  });

  const auctions = listings || [];

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