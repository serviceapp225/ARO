import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  // Simple fetch function without complex logic
  const loadListings = async () => {
    try {
      const response = await fetch('/api/listings');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setListings(data);
        }
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load once on mount, then refresh every 30 seconds
  useEffect(() => {
    loadListings();
    
    const interval = setInterval(loadListings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Transform listings to auctions format
  const auctions: Auction[] = listings.map((listing: any) => ({
    id: listing.id.toString(),
    lotNumber: listing.lotNumber || 'N/A',
    make: listing.make || 'Unknown',
    model: listing.model || 'Unknown', 
    year: listing.year || new Date().getFullYear(),
    mileage: listing.mileage || 0,
    photos: Array.isArray(listing.photos) ? listing.photos : [],
    currentBid: parseFloat(listing.currentBid) || 0,
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
    condition: listing.condition || 'good'
  }));

  const refreshAuctions = () => {
    loadListings();
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