import { useState } from "react";
import { Clock, Trophy, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountdownTimer } from "@/components/CountdownTimer";

export default function MyBids() {
  const [activeTab, setActiveTab] = useState("active");

  // Mock data for user's bids
  const activeBids = [
    {
      id: "1",
      carTitle: "2020 Toyota Camry",
      currentBid: 18500,
      myBid: 18000,
      bidCount: 7,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
      isWinning: false,
      status: "outbid"
    },
    {
      id: "2",
      carTitle: "2019 BMW X5",
      currentBid: 35000,
      myBid: 35000,
      bidCount: 12,
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
      isWinning: true,
      status: "winning"
    }
  ];

  const completedBids = [
    {
      id: "3",
      carTitle: "2018 Honda Accord",
      finalBid: 16500,
      myBid: 16000,
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400",
      result: "lost"
    },
    {
      id: "4",
      carTitle: "2021 Mercedes C-Class",
      finalBid: 28000,
      myBid: 28000,
      endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400",
      result: "won"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Мои ставки</h1>
          <p className="text-neutral-600 mt-1">История участия в аукционах</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active">Активные ({activeBids.length})</TabsTrigger>
            <TabsTrigger value="completed">Завершенные ({completedBids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeBids.length > 0 ? (
              activeBids.map((bid) => (
                <Card key={bid.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-32 h-24 bg-neutral-100">
                        <img 
                          src={bid.image} 
                          alt={bid.carTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-neutral-900">{bid.carTitle}</h3>
                          <Badge 
                            variant={bid.isWinning ? "default" : "secondary"}
                            className={bid.isWinning ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                          >
                            {bid.isWinning ? "Лидируете" : "Перебили"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-neutral-500">Моя ставка</p>
                            <p className="font-semibold text-neutral-900">${bid.myBid.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Текущая ставка</p>
                            <p className="font-semibold text-emerald-600">${bid.currentBid.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <CountdownTimer endTime={bid.endTime} size="small" />
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Смотреть
                            </Button>
                            {!bid.isWinning && (
                              <Button size="sm">
                                Повысить ставку
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                    Нет активных ставок
                  </h3>
                  <p className="text-neutral-500 mb-4">
                    Участвуйте в аукционах, чтобы найти автомобиль своей мечты
                  </p>
                  <Button>
                    Перейти к аукционам
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBids.length > 0 ? (
              completedBids.map((bid) => (
                <Card key={bid.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-32 h-24 bg-neutral-100">
                        <img 
                          src={bid.image} 
                          alt={bid.carTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-neutral-900">{bid.carTitle}</h3>
                          <Badge 
                            variant={bid.result === "won" ? "default" : "secondary"}
                            className={bid.result === "won" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                          >
                            {bid.result === "won" ? (
                              <><Trophy className="w-3 h-3 mr-1" />Выиграли</>
                            ) : (
                              <><X className="w-3 h-3 mr-1" />Проиграли</>
                            )}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-neutral-500">Моя ставка</p>
                            <p className="font-semibold text-neutral-900">${bid.myBid.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Финальная цена</p>
                            <p className="font-semibold text-neutral-900">${bid.finalBid.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-neutral-500">
                            Завершен {bid.endDate.toLocaleDateString('ru-RU')}
                          </p>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Подробности
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                    Нет завершенных ставок
                  </h3>
                  <p className="text-neutral-500">
                    История ваших участий в аукционах появится здесь
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}