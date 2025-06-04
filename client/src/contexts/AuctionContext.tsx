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
    // Temporary demo data - will be replaced with real API
    const demoAuctions: Auction[] = [
      {
        id: '1',
        make: 'BMW',
        model: 'X5',
        year: 2020,
        mileage: 45000,
        photos: ['/car1.jpg'],
        currentBid: 47500,
        bidCount: 23,
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: '2',
        make: 'Mercedes',
        model: 'C-Class',
        year: 2021,
        mileage: 32000,
        photos: ['/car2.jpg'],
        currentBid: 35000,
        bidCount: 18,
        endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: '3',
        make: 'Audi',
        model: 'A4',
        year: 2019,
        mileage: 55000,
        photos: ['/car3.jpg'],
        currentBid: 28000,
        bidCount: 12,
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'active'
      }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setAuctions(demoAuctions);
      setLoading(false);
    }, 1000);

    // Firebase integration will be enabled when keys are configured
    // return () => {}; // No cleanup needed for demo data
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
