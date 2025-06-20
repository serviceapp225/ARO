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

  // Clear all cache on mount
  useEffect(() => {
    queryClient.clear();
  }, []);

  // Fetch listings using React Query with aggressive cache clearing
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['/api/listings'],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1
  });

  // Debug logging
  console.log("AuctionContext:", {
    isArray: Array.isArray(listings),
    count: Array.isArray(listings) ? listings.length : 0,
    loading: isLoading
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
    queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
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