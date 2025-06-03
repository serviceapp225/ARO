import { useParams } from "wouter";
import { ArrowLeft, Heart, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ImageCarousel } from "@/components/ImageCarousel";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useAuctions } from "@/contexts/AuctionContext";
import { useState } from "react";

export default function AuctionDetail() {
  const { id } = useParams();
  const { auctions } = useAuctions();
  const [bidAmount, setBidAmount] = useState("");
  
  // Find the auction by ID
  const auction = auctions.find(a => a.id === id);
  
  if (!auction) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-20 flex items-center justify-center">
        <p className="text-neutral-600">Аукцион не найден</p>
      </div>
    );
  }

  const handlePlaceBid = () => {
    // TODO: Implement bid placement
    console.log("Placing bid:", bidAmount);
  };

  const handleWhatsAppContact = () => {
    // TODO: Open WhatsApp with pre-filled message
    window.open(`https://wa.me/?text=Интересует автомобиль ${auction.year} ${auction.make} ${auction.model}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Eye className="w-5 h-5" />
              <span className="ml-1">247</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Image Carousel */}
        <Card>
          <CardContent className="p-0">
            <ImageCarousel 
              images={auction.photos} 
              alt={`${auction.year} ${auction.make} ${auction.model}`}
              className="h-64 md:h-80"
            />
          </CardContent>
        </Card>

        {/* Car Title and Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">
              {auction.year} {auction.make} {auction.model}
            </h1>
            <Badge variant={auction.status === 'active' ? 'default' : 'secondary'}>
              {auction.status === 'active' ? 'Активен' : 'Завершен'}
            </Badge>
          </div>
          
          {/* Countdown Timer */}
          <CountdownTimer 
            endTime={auction.endTime}
            size="large"
          />
        </div>

        {/* Car Specs */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Характеристики
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-neutral-500">Год выпуска</span>
                <p className="font-medium">{auction.year}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Пробег</span>
                <p className="font-medium">{auction.mileage.toLocaleString()} км</p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Топливо</span>
                <p className="font-medium">Бензин</p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">КПП</span>
                <p className="font-medium">Автомат</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">
              Описание
            </h2>
            <p className="text-neutral-700 leading-relaxed">
              Отличный автомобиль в хорошем состоянии. Регулярное техническое обслуживание, 
              полная история сервиса. Все системы работают исправно. Кузов без повреждений, 
              салон в отличном состоянии.
            </p>
          </CardContent>
        </Card>

        {/* Bidding Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-neutral-500">Текущая ставка</p>
                <p className="text-3xl font-bold text-emerald-600 font-mono">
                  ${auction.currentBid.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">Ставок</p>
                <p className="text-2xl font-semibold text-neutral-700">
                  {auction.bidCount}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`Минимум $${(auction.currentBid + 100).toLocaleString()}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handlePlaceBid}
                  disabled={!bidAmount || parseInt(bidAmount) <= auction.currentBid}
                  className="px-6"
                >
                  Сделать ставку
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full text-green-600 border-green-600 hover:bg-green-50"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Связаться в WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Similar Cars Section */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            Похожие автомобили
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auctions.slice(0, 4).map((similarAuction) => (
              <Card key={similarAuction.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-video bg-neutral-100 rounded-lg mb-3 overflow-hidden">
                    <img 
                      src={similarAuction.photos[0]} 
                      alt={`${similarAuction.year} ${similarAuction.make} ${similarAuction.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    {similarAuction.year} {similarAuction.make} {similarAuction.model}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-2">
                    {similarAuction.mileage.toLocaleString()} км
                  </p>
                  <p className="text-lg font-bold text-emerald-600 font-mono">
                    ${similarAuction.currentBid.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}