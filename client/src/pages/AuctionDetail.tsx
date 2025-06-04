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

  // Create mock auction data based on ID
  const createMockAuction = (carId: string) => {
    const carData = {
      "1": { lotNumber: "847293", make: "Toyota", model: "Camry", year: 2020, mileage: 45000, engine: "2.5L", transmission: "Автоматическая", fuelType: "Бензин", bodyType: "Седан", color: "Белый", location: "Душанбе" },
      "2": { lotNumber: "561847", make: "Honda", model: "CR-V", year: 2019, mileage: 52000, engine: "1.5L Turbo", transmission: "Автоматическая", fuelType: "Бензин", bodyType: "Кроссовер", color: "Серебристый", location: "Худжанд" },
      "3": { lotNumber: "329054", make: "BMW", model: "X3", year: 2021, mileage: 28000, engine: "2.0L Twin Turbo", transmission: "Автоматическая", fuelType: "Бензин", bodyType: "Внедорожник", color: "Черный металлик", location: "Душанбе" }
    };

    const car = carData[carId as keyof typeof carData] || carData["1"];
    
    return {
      id: carId,
      lotNumber: car.lotNumber,
      make: car.make,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      currentBid: 47500,
      bidCount: 23,
      reservePrice: 50000,
      hasReserve: true,
      reserveMet: false,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      photos: ['/car1.jpg', '/car2.jpg', '/car3.jpg'],
      status: 'active' as const,
      specifications: {
        lotNumber: car.lotNumber,
        engine: car.engine,
        transmission: car.transmission,
        drivetrain: "Передний привод",
        fuelType: car.fuelType,
        bodyType: car.bodyType,
        color: car.color,
        city: car.location,
        condition: getConditionByMileage(car.mileage),
        vin: "ABC123456789",
        customsCleared: true
      },
      seller: `Официальный дилер ${car.make}`,
      location: car.location,
      views: 342
    };
  };

  const mockAuction = createMockAuction(id || "1");

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
      const endTime = auction?.endTime || mockAuction.endTime;
      const difference = endTime.getTime() - new Date().getTime();
      
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
  }, [id]); // Changed dependency to id instead of auction.endTime

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
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
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

        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Характеристики автомобиля</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Полная информация о транспортном средстве</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Заголовок автомобиля */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {auction.year} {auction.make} {auction.model}
                </h1>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Активный
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-blue-700 bg-blue-50 border-blue-200">
                  Лот № {mockAuction.specifications.lotNumber}
                </Badge>
                <Badge variant="outline" className={`${mockAuction.specifications.customsCleared ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                  {mockAuction.specifications.customsCleared ? '✓ Растаможен' : '✗ Не растаможен'}
                </Badge>
                <Badge variant="outline" className={`${auction.recycled ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-orange-700 bg-orange-50 border-orange-200'}`}>
                  {auction.recycled ? 'Утилизация: есть' : 'Утилизация: нет'}
                </Badge>
                <Badge variant="outline" className={`${auction.technicalInspectionValid ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                  {auction.technicalInspectionValid ? `Техосмотр до ${auction.technicalInspectionDate}` : 'Техосмотр: нет'}
                </Badge>
              </div>
            </div>

            {/* Основные характеристики */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Основная информация */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Основная информация
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Год выпуска</span>
                    <span className="font-semibold text-gray-900">{auction.year}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Пробег</span>
                    <span className="font-semibold text-gray-900">{auction.mileage.toLocaleString()} км</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Состояние</span>
                    <span className="font-semibold text-green-600">{mockAuction.specifications.condition}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Город</span>
                    <span className="font-semibold text-gray-900">{mockAuction.specifications.city}</span>
                  </div>
                </div>
              </div>

              {/* Технические характеристики */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Технические характеристики
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Двигатель</span>
                    <span className="font-semibold text-gray-900">{mockAuction.specifications.engine}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">КПП</span>
                    <span className="font-semibold text-gray-900">{mockAuction.specifications.transmission}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Привод</span>
                    <span className="font-semibold text-gray-900">{mockAuction.specifications.drivetrain}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                    <span className="text-gray-600 font-medium">Топливо</span>
                    <span className="font-semibold text-gray-900">{mockAuction.specifications.fuelType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Дополнительная информация
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                  <span className="text-gray-600 font-medium">Кузов</span>
                  <span className="font-semibold text-gray-900">{mockAuction.specifications.bodyType}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                  <span className="text-gray-600 font-medium">Цвет</span>
                  <span className="font-semibold text-gray-900">{mockAuction.specifications.color}</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-white border border-gray-100">
                  <span className="text-gray-600 font-medium">VIN</span>
                  <span className="font-semibold text-gray-900 font-mono text-sm">{mockAuction.specifications.vin}</span>
                </div>
              </div>
            </div>

            {/* Статистика аукциона */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-3">Статистика аукциона</h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{auction.bidCount}</div>
                  <div className="text-sm text-gray-600">Ставок</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${auction.currentBid.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Текущая ставка</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{mockAuction.views}</div>
                  <div className="text-sm text-gray-600">Просмотров</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 border-red-100">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Время до окончания аукциона</CardTitle>
                <p className="text-white/80 text-sm mt-1">Не упустите свой шанс!</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4 shadow-lg">
                <div className="text-3xl font-bold mb-1">{timeLeft.days}</div>
                <div className="text-sm opacity-90">дней</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 shadow-lg">
                <div className="text-3xl font-bold mb-1">{timeLeft.hours}</div>
                <div className="text-sm opacity-90">часов</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-4 shadow-lg">
                <div className="text-3xl font-bold mb-1">{timeLeft.minutes}</div>
                <div className="text-sm opacity-90">минут</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-4 shadow-lg animate-pulse">
                <div className="text-3xl font-bold mb-1">{timeLeft.seconds}</div>
                <div className="text-sm opacity-90">секунд</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-red-600 font-medium text-sm">
                ⏰ Аукцион завершится автоматически
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Текущая ставка</CardTitle>
                <p className="text-white/80 text-sm mt-1">Сделайте свою ставку сейчас</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${auction.currentBid.toLocaleString()}
              </div>
              <p className="text-gray-600 text-sm bg-gray-50 rounded-lg px-3 py-2 inline-block">
                Следующая ставка от ${(auction.currentBid + 500).toLocaleString()}
              </p>
              
              {/* Reserve Price Information */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {mockAuction.hasReserve ? (
                  <div className="space-y-2">
                    <div className={`text-sm font-medium px-3 py-2 rounded-lg ${mockAuction.reserveMet ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {mockAuction.reserveMet ? (
                        <>✓ Резервная цена достигнута</>
                      ) : (
                        <>⚠ Резервная цена не достигнута</>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-2 rounded-lg inline-block">
                    🔥 Продажа без резерва!
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Введите вашу ставку"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1 text-lg font-semibold"
                />
                <Button 
                  onClick={handlePlaceBid}
                  disabled={!bidAmount || parseInt(bidAmount) <= auction.currentBid}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  Сделать ставку
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setBidAmount((auction.currentBid + 500).toString())}
                  className="text-sm"
                >
                  +$500
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setBidAmount((auction.currentBid + 1000).toString())}
                  className="text-sm"
                >
                  +$1,000
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setBidAmount((auction.currentBid + 2500).toString())}
                  className="text-sm"
                >
                  +$2,500
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>



        <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">История ставок</CardTitle>
                <p className="text-white/80 text-sm mt-1">Активность участников аукциона</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {biddingHistory.map((bid, index) => (
                <div 
                  key={index}
                  className={`flex justify-between items-center p-4 rounded-xl transition-all duration-200 ${
                    bid.isWinning 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-md' 
                      : 'bg-white border border-gray-100 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      bid.isWinning ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {bid.bidder}
                        {bid.isWinning && (
                          <Badge className="bg-green-600 text-white text-xs px-2 py-1">
                            👑 Лидирует
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {bid.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      bid.isWinning ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      ${bid.amount.toLocaleString()}
                    </div>
                    {index === 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        Текущая ставка
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Статистика участников */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-purple-100">
              <h4 className="font-semibold text-gray-900 mb-3">Статистика участников</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{biddingHistory.length}</div>
                  <div className="text-sm text-gray-600">Всего ставок</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{new Set(biddingHistory.map(bid => bid.bidder)).size}</div>
                  <div className="text-sm text-gray-600">Участников</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


      </main>
    </div>
  );
}