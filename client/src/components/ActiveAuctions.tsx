import { Heart, Clock, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CountdownTimer } from './CountdownTimer';
import { ImageCarousel } from './ImageCarousel';
import { useAuctions } from '@/contexts/AuctionContext';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';

export function ActiveAuctions() {
  const { auctions, loading } = useAuctions();
  const [, setLocation] = useLocation();
  const [displayCount, setDisplayCount] = useState(20);

  // Generate additional auction items for infinite scroll
  const generateExtraAuctions = (count: number) => {
    const carModels = [
      { make: 'BMW', model: 'X5', year: 2020 },
      { make: 'Mercedes', model: 'C-Class', year: 2021 },
      { make: 'Audi', model: 'A4', year: 2019 },
      { make: 'Toyota', model: 'Camry', year: 2022 },
      { make: 'Honda', model: 'Civic', year: 2020 },
      { make: 'Lexus', model: 'RX', year: 2021 },
      { make: 'Porsche', model: '911', year: 2020 },
      { make: 'Volvo', model: 'XC90', year: 2019 },
    ];

    return Array.from({ length: count }, (_, i) => {
      const carModel = carModels[i % carModels.length];
      return {
        id: `extra-${i}`,
        make: carModel.make,
        model: carModel.model,
        year: carModel.year,
        mileage: Math.floor(Math.random() * 50000) + 10000,
        photos: ['/placeholder-car.jpg'],
        currentBid: Math.floor(Math.random() * 50000) + 15000,
        bidCount: Math.floor(Math.random() * 15) + 1,
        endTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        status: 'active' as const
      };
    });
  };

  const allAuctions = [...auctions, ...generateExtraAuctions(displayCount)];

  // Handle scroll to load more
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        setDisplayCount(prev => prev + 10);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-20">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200" />
            <CardContent className="p-3">
              <div className="h-3 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 mb-20">
      {allAuctions.slice(0, displayCount).map((auction, index) => (
        <Card
          key={`${auction.id}-${index}`}
          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation(`/auction/${auction.id}`)}
        >
          <div className="relative">
            <div className="h-32 bg-gray-200 flex items-center justify-center">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            <div className="absolute top-2 left-2">
              <CountdownTimer endTime={auction.endTime} size="small" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white hover:bg-black/70"
            >
              <Heart className="h-3 w-3" />
            </Button>
          </div>
          <CardContent className="p-3">
            <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">
              {auction.year} {auction.make} {auction.model}
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              {auction.mileage.toLocaleString()} км
            </p>
            <div className="mb-2">
              <p className="text-xs text-gray-500">Текущая ставка</p>
              <p className="text-sm font-bold text-green-600">
                ${auction.currentBid.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{auction.bidCount} ставок</span>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                2h {Math.floor(Math.random() * 60)}m
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
