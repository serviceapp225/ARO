import { useParams, useLocation } from "wouter";
import { ArrowLeft, Heart, MessageCircle, Eye, Car, Calendar, Gauge, Users, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuctions } from "@/contexts/AuctionContext";
import { useState, useEffect } from "react";

export default function AuctionDetail() {
  const { id } = useParams();
  const { auctions } = useAuctions();
  const [, setLocation] = useLocation();
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Mock auction data with detailed specifications
  const getConditionByMileage = (miles: number) => {
    if (miles <= 10000) return "Новое";
    if (miles <= 50000) return "Хорошее";
    return "Удовлетворительное";
  };

  const mockAuction = {
    id: id,
    make: "BMW",
    model: "X5",
    year: 2020,
    mileage: 45000,
    currentBid: 47500,
    bidCount: 23,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    photos: ['/car1.jpg', '/car2.jpg', '/car3.jpg'],
    status: 'active' as const,
    specifications: {
      engine: "3.0L Twin Turbo",
      transmission: "Автоматическая 8-ступенчатая",
      drivetrain: "Полный привод (xDrive)",
      fuelType: "Бензин",
      bodyType: "Кроссовер",
      color: "Черный металлик",
      city: "Москва",
      condition: getConditionByMileage(45000),
      vin: "WBXPC9C59WP123456"
    },
    seller: "Официальный дилер BMW",
    location: "Москва, Россия",
    views: 342
  };

  const auction = auctions.find(a => a.id === id) || mockAuction;

  const biddingHistory = [
    { bidder: "Александр К.", amount: 47500, time: "2 минуты назад", isWinning: true },
    { bidder: "Марина С.", amount: 46800, time: "15 минут назад", isWinning: false },
    { bidder: "Дмитрий П.", amount: 46200, time: "32 минуты назад", isWinning: false },
    { bidder: "Елена В.", amount: 45500, time: "1 час назад", isWinning: false },
    { bidder: "Сергей Н.", amount: 45000, time: "2 часа назад", isWinning: false },
    { bidder: "Анна М.", amount: 44200, time: "3 часа назад", isWinning: false },
    { bidder: "Игорь З.", amount: 43500, time: "5 часов назад", isWinning: false },
  ];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = auction.endTime.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  const handlePlaceBid = () => {
    if (parseInt(bidAmount) > auction.currentBid) {
      console.log("Placing bid:", bidAmount);
      setBidAmount("");
    }
  };

  const handleWhatsAppContact = () => {
    window.open(`https://wa.me/?text=Интересует автомобиль ${auction.year} ${auction.make} ${auction.model}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleWhatsAppContact}>
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="overflow-hidden">
          <div className="relative h-64 bg-gray-200 flex items-center justify-center">
            <Car className="w-16 h-16 text-gray-400" />
            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {mockAuction.views}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Характеристики автомобиля</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {auction.year} {auction.make} {auction.model}
              </h1>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Активный
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Год выпуска:</span>
                <span className="font-medium">{auction.year}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Пробег:</span>
                <span className="font-medium">{auction.mileage.toLocaleString()} км</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Двигатель:</span>
                <span className="font-medium">{mockAuction.specifications.engine}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">КПП:</span>
                <span className="font-medium">{mockAuction.specifications.transmission}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Привод:</span>
                <span className="font-medium">{mockAuction.specifications.drivetrain}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Топливо:</span>
                <span className="font-medium">{mockAuction.specifications.fuelType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Кузов:</span>
                <span className="font-medium">{mockAuction.specifications.bodyType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Цвет:</span>
                <span className="font-medium">{mockAuction.specifications.color}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Город:</span>
                <span className="font-medium">{mockAuction.specifications.city}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Состояние:</span>
                <span className="font-medium">{mockAuction.specifications.condition}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">VIN:</span>
                <span className="font-medium font-mono">{mockAuction.specifications.vin}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Просмотров:</span>
                <span className="font-medium">{mockAuction.views}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Ставки:</span>
                <span className="font-medium">{auction.bidCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Время до окончания аукциона
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-blue-600 text-white rounded-lg p-4">
                <div className="text-2xl font-bold">{timeLeft.days}</div>
                <div className="text-sm">дней</div>
              </div>
              <div className="bg-blue-600 text-white rounded-lg p-4">
                <div className="text-2xl font-bold">{timeLeft.hours}</div>
                <div className="text-sm">часов</div>
              </div>
              <div className="bg-blue-600 text-white rounded-lg p-4">
                <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                <div className="text-sm">минут</div>
              </div>
              <div className="bg-blue-600 text-white rounded-lg p-4">
                <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                <div className="text-sm">секунд</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Текущая ставка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ${auction.currentBid.toLocaleString()}
              </div>
              <p className="text-gray-600 text-sm">
                Следующая ставка от ${(auction.currentBid + 500).toLocaleString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Введите вашу ставку"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handlePlaceBid}
                disabled={!bidAmount || parseInt(bidAmount) <= auction.currentBid}
                className="bg-green-600 hover:bg-green-700"
              >
                Сделать ставку
              </Button>
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardHeader>
            <CardTitle>История ставок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {biddingHistory.map((bid, index) => (
                <div 
                  key={index}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    bid.isWinning ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {bid.bidder}
                      {bid.isWinning && (
                        <Badge className="bg-green-600 text-white text-xs">
                          Лидирует
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{bid.time}</div>
                  </div>
                  <div className={`text-lg font-bold ${
                    bid.isWinning ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    ${bid.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


      </main>
    </div>
  );
}