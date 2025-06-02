import { Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CountdownTimer } from './CountdownTimer';
import { ImageCarousel } from './ImageCarousel';
import { useAuctions } from '@/contexts/AuctionContext';

export function ActiveAuctions() {
  const { auctions, loading, setSelectedAuction } = useAuctions();

  if (loading) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-neutral-900">Активные аукционы</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-neutral-200" />
                <CardContent className="p-6">
                  <div className="h-4 bg-neutral-200 rounded mb-2" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3 mb-4" />
                  <div className="flex justify-between">
                    <div className="h-8 bg-neutral-200 rounded w-20" />
                    <div className="h-8 bg-neutral-200 rounded w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-neutral-900">Активные аукционы</h2>
          <a href="/search" className="text-primary font-semibold hover:underline">
            Смотреть все
          </a>
        </div>

        {auctions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">В данный момент нет активных аукционов.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions.slice(0, 6).map((auction) => (
              <Card
                key={auction.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => setSelectedAuction(auction)}
              >
                <div className="relative">
                  <ImageCarousel
                    images={auction.photos}
                    alt={`${auction.year} ${auction.make} ${auction.model}`}
                    className="h-48 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <CountdownTimer endTime={auction.endTime} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {auction.year} {auction.make} {auction.model}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {auction.mileage.toLocaleString()} км
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-500">Текущая ставка</p>
                      <p className="text-2xl font-bold text-emerald-600 font-mono">
                        ${auction.currentBid.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-500">Ставки</p>
                      <p className="text-lg font-semibold text-neutral-700">
                        {auction.bidCount}
                      </p>
                    </div>
                  </div>
                  <Button className="w-full bg-primary hover:bg-blue-800">
                    Смотреть и сделать ставку
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
