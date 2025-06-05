import { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

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
}

interface AuctionContextType {
  auctions: Auction[];
  loading: boolean;
  selectedAuction: Auction | null;
  setSelectedAuction: (auction: Auction | null) => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export function AuctionProvider({ children }: { children: ReactNode }) {
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  // Fetch real data from API
  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/listings'],
    select: (data: any[]) => data.map(listing => ({
      id: listing.id.toString(),
      lotNumber: `LOT${listing.id.toString().padStart(6, '0')}`,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      mileage: listing.mileage,
      photos: listing.photos || [],
      currentBid: parseFloat(listing.currentBid || listing.startingPrice),
      bidCount: Math.floor(Math.random() * 25) + 1, // Mock bid count for now
      endTime: new Date(listing.auctionEndTime),
      status: listing.status as 'active' | 'ended'
    }))
  });

  const auctions = listings || [];

  return (
    <AuctionContext.Provider value={{ auctions, loading: isLoading, selectedAuction, setSelectedAuction }}>
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