import { useState } from 'react';
import { Heart, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CountdownTimer } from './CountdownTimer';
import { ImageCarousel } from './ImageCarousel';
import { useAuctions } from '@/contexts/AuctionContext';
import { useToast } from '@/hooks/use-toast';

export function AuctionDetailModal() {
  const { selectedAuction, setSelectedAuction } = useAuctions();
  const [bidAmount, setBidAmount] = useState('');
  const { toast } = useToast();

  if (!selectedAuction) return null;

  const minimumBid = parseFloat(selectedAuction.currentBid?.toString() || '0') + 1;

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    const bid = parseFloat(bidAmount);
    
    if (bid < minimumBid) {
      toast({
        title: "Ставка слишком низкая",
        description: `Минимальная ставка ${minimumBid.toLocaleString()} Сомони`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ставка размещена!",
      description: `Ваша ставка ${bid.toLocaleString()} Сомони принята.`,
    });
    
    setBidAmount('');
  };

  const handleFavorite = () => {
    toast({
      title: "Added to Favorites",
      description: "This auction has been added to your favorites.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Auction link copied to clipboard.",
    });
  };

  // Mock bid history with real user names
  const currentBidValue = parseFloat(selectedAuction.currentBid?.toString() || '0');
  const bidHistory = [
    { bidder: 'Алексей Петров', amount: currentBidValue, time: '2 минуты назад' },
    { bidder: 'Мария Иванова', amount: currentBidValue - 500, time: '5 минут назад' },
    { bidder: 'Дмитрий Козлов', amount: currentBidValue - 1000, time: '8 минут назад' },
  ];

  return (
    <Dialog open={true} onOpenChange={() => setSelectedAuction(null)}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        {/* Photo Carousel */}
        <div className="relative h-96 bg-neutral-100">
          <ImageCarousel
            images={selectedAuction.photos}
            alt={`${selectedAuction.year} ${selectedAuction.make} ${selectedAuction.model}`}
            className="h-full"
          />
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Vehicle Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                  {selectedAuction.make} {selectedAuction.model}
                </h2>
                <div className="text-neutral-600 space-y-1">
                  <p>Год: {selectedAuction.year}</p>
                  <p>Пробег: {selectedAuction.mileage.toLocaleString()} км</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-neutral-700 leading-relaxed">
                  Этот превосходный {selectedAuction.make} {selectedAuction.model} - настоящий шедевр автомобильной инженерии. 
                  С пробегом всего {selectedAuction.mileage.toLocaleString()} км, этот автомобиль представляет совершенство в 
                  производительности и роскоши. Включает премиальный интерьер, передовые системы безопасности и исключительное качество сборки.
                </p>
              </div>

              {/* Bid History */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Bids</h3>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {bidHistory.map((bid, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {bid.bidder.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{bid.bidder}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-emerald-600 font-mono">
                          {bid.amount.toLocaleString()} Сомони
                        </div>
                        <div className="text-sm text-neutral-500">{bid.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bidding Panel */}
            <div className="space-y-6">
              {/* Timer */}
              <CountdownTimer 
                endTime={selectedAuction.endTime} 
                size="large"
                onTimeUp={() => toast({ title: "Auction Ended", description: "This auction has concluded." })}
              />

              {/* Current Bid */}
              <div className="text-center p-6 bg-emerald-50 rounded-2xl">
                <div className="text-sm text-neutral-600 mb-1">Текущая наивысшая ставка</div>
                <div className="text-4xl font-bold text-emerald-600 font-mono mb-2">
                  {selectedAuction.currentBid.toLocaleString()} Сомони
                </div>
                <div className="text-sm text-neutral-600">
                  Ставок размещено: {selectedAuction.bidCount}
                </div>
              </div>

              {/* Place Bid */}
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Сумма вашей ставки
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 text-lg">
                      Сомони
                    </span>
                    <Input
                      type="number"
                      placeholder={minimumBid.toString()}
                      min={minimumBid}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="pl-20 py-4 text-lg font-mono"
                      required
                    />
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    Минимальная ставка: {minimumBid.toLocaleString()} Сомони
                  </p>
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 py-4 text-lg"
                >
                  Сделать ставку
                </Button>
                
                <p className="text-xs text-neutral-500 text-center">
                  Делая ставку, вы соглашаетесь с условиями использования
                </p>
              </form>

              {/* Quick Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleFavorite}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  В избранное
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Поделиться
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
          onClick={() => setSelectedAuction(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
