import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Auction {
  id: string;
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
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'carListings'),
      where('status', '==', 'active'),
      orderBy('auctionEndTime', 'asc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const auctionData: Auction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        auctionData.push({
          id: doc.id,
          make: data.make,
          model: data.model,
          year: data.year,
          mileage: data.mileage,
          photos: data.photos || [],
          currentBid: parseFloat(data.currentBid || data.startingPrice || '0'),
          bidCount: data.bidCount || 0,
          endTime: data.auctionEndTime?.toDate() || new Date(),
          status: data.status,
        });
      });
      setAuctions(auctionData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuctionContext.Provider value={{ auctions, loading, selectedAuction, setSelectedAuction }}>
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
