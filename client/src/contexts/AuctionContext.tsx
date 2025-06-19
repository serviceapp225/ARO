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

  // Fetch real data from API with automatic refresh
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['/api/listings'],
    staleTime: 0, // Always consider data stale to force fresh requests
    gcTime: 0, // No cache time - always fresh
    refetchOnWindowFocus: true,
    refetchInterval: 1000, // Refetch every second
    retry: 3,
    retryDelay: 1000,
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
    technicalInspectionDate: listing.technicalInspectionDate
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