import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { User, Car, Trophy, Heart, Settings, LogOut, Edit, Eye, Calendar } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for user's listings and won auctions
  const myListings = [
    {
      id: "1",
      title: "2020 Toyota Camry XLE",
      currentBid: 18500,
      bidCount: 7,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
      status: "active"
    },
    {
      id: "2", 
      title: "2018 Honda Civic Si",
      finalPrice: 16000,
      bidCount: 12,
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400",
      status: "sold"
    }
  ];

  const wonAuctions = [
    {
      id: "3",
      title: "2019 BMW X3 xDrive30i", 
      winningBid: 32000,
      purchaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400"
    },
    {
      id: "4",
      title: "2021 Mercedes C-Class",
      winningBid: 28000, 
      purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400"
    }
  ];

  const stats = [
    { label: "Активные объявления", value: myListings.filter(l => l.status === 'active').length.toString(), icon: Car },
    { label: "Выигранные аукционы", value: wonAuctions.length.toString(), icon: Trophy },
    { label: "Избранное", value: "8", icon: Heart },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center pb-20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-700 mb-2">
              Необходимо войти
            </h2>
            <p className="text-neutral-500 mb-4">
              Войдите для доступа к профилю и управления аукционами
            </p>
            <Button className="w-full">Войти</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Профиль</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-neutral-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    {user.username}
                  </h2>
                  <p className="text-neutral-600 mb-3">{user.email}</p>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="capitalize">
                      {user.role === 'buyer' ? 'Покупатель' : 'Продавец'}
                    </Badge>
                    <Badge variant="outline">Подтвержден</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Настройки
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="listings">Мои объявления</TabsTrigger>
              <TabsTrigger value="won">Покупки</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-6 text-center">
                      <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <div className="text-3xl font-bold text-neutral-900 mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-neutral-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Последняя активность</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-900">
                          Размещен 2020 Toyota Camry
                        </p>
                        <p className="text-sm text-neutral-500">2 часа назад</p>
                      </div>
                      <Badge variant="outline">Размещено</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-900">
                          Выиграли аукцион 2019 BMW X3
                        </p>
                        <p className="text-sm text-neutral-500">1 день назад</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Выиграно</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-900">
                          Ставка на 2021 Mercedes C-Class
                        </p>
                        <p className="text-sm text-neutral-500">3 дня назад</p>
                      </div>
                      <Badge variant="secondary">Ставка</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings" className="space-y-4">
              {myListings.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-32 h-24 bg-neutral-100">
                        <img 
                          src={listing.image} 
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-neutral-900">{listing.title}</h3>
                          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                            {listing.status === 'active' ? 'Активен' : 'Продан'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-neutral-500">
                              {listing.status === 'active' ? 'Текущая ставка' : 'Продан за'}
                            </p>
                            <p className="font-semibold text-emerald-600">
                              ${(listing.currentBid || listing.finalPrice).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Ставок</p>
                            <p className="font-semibold text-neutral-900">{listing.bidCount}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-neutral-500">
                            {listing.status === 'active' 
                              ? `Заканчивается ${listing.endTime.toLocaleDateString('ru-RU')}`
                              : `Продан ${listing.endDate.toLocaleDateString('ru-RU')}`
                            }
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Смотреть
                            </Button>
                            {listing.status === 'active' && (
                              <Button size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Редактировать
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="won" className="space-y-4">
              {wonAuctions.map((auction) => (
                <Card key={auction.id}>
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-32 h-24 bg-neutral-100">
                        <img 
                          src={auction.image} 
                          alt={auction.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-neutral-900">{auction.title}</h3>
                          <Badge className="bg-green-100 text-green-700">
                            <Trophy className="w-3 h-3 mr-1" />
                            Выиграно
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-neutral-500">Выигрышная ставка</p>
                            <p className="font-semibold text-emerald-600">
                              ${auction.winningBid.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Дата покупки</p>
                            <p className="font-semibold text-neutral-900">
                              {auction.purchaseDate.toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-neutral-500 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Куплен {auction.purchaseDate.toLocaleDateString('ru-RU')}
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
              ))}
            </TabsContent>
          </Tabs>

          {/* Logout Button */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <Button variant="outline" onClick={logout} className="w-full text-red-600 border-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Выйти из аккаунта
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}