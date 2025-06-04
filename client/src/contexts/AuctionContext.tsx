import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
        lotNumber: '001',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        mileage: 45000,
        photos: ['/car1.jpg'],
        currentBid: 17800,
        bidCount: 23,
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'active',
        customsCleared: true
      },
      {
        id: '2',
        lotNumber: '002',
        make: 'Honda',
        model: 'CR-V',
        year: 2019,
        mileage: 52000,
        photos: ['/car2.jpg'],
        currentBid: 21200,
        bidCount: 18,
        endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: 'active',
        customsCleared: false
      },
      {
        id: '3',
        lotNumber: '003',
        make: 'BMW',
        model: 'X3',
        year: 2021,
        mileage: 28000,
        photos: ['/car3.jpg'],
        currentBid: 34200,
        bidCount: 12,
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'active',
        customsCleared: true
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
