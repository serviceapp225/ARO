import { MessageCircle, Search, Timer, Shield, Car, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { SellCarSection } from "@/components/SellCarSection";
import { AdvertisementCarousel } from "@/components/AdvertisementCarousel";
import { TopHeader } from "@/components/TopHeader";
import { Link } from "wouter";
import { useState } from "react";
import { useLocation } from "wouter";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск будет обрабатываться компонентом ActiveAuctions
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      <TopHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Search Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Найдите автомобиль своей мечты
            </h1>
            <p className="text-gray-600">
              Более 1000 автомобилей на аукционе каждый день
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                type="text"
                placeholder="Поиск по номеру лота, марке или модели автомобиля..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-0 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Найти
              </Button>
            </div>
          </form>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div className="bg-emerald-50 rounded-2xl p-4">
              <div className="text-2xl font-bold text-emerald-700">1200+</div>
              <div className="text-sm text-emerald-600">Активных лотов</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="text-2xl font-bold text-blue-700">98%</div>
              <div className="text-sm text-blue-600">Довольных клиентов</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4">
              <div className="text-2xl font-bold text-purple-700">24/7</div>
              <div className="text-sm text-purple-600">Поддержка</div>
            </div>
          </div>
        </div>

        {/* Sell Car Section */}
        <SellCarSection />

        {/* Advertisement Carousel */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Специальные предложения
            </h2>
            <div className="text-sm text-gray-500">
              Обновляется каждый день
            </div>
          </div>
          <AdvertisementCarousel />
        </section>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Security Banner */}
          <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-emerald-100 rounded-full p-3">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-800 text-lg mb-2">Безопасные сделки</h3>
                  <p className="text-emerald-700 text-sm">
                    Все транзакции защищены системой гарантий
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Check */}
          <Card className="bg-gradient-to-br from-blue-50 to-sky-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800 text-lg mb-2">Проверка качества</h3>
                  <p className="text-blue-700 text-sm">
                    Каждый автомобиль проходит техническую экспертизу
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-800 text-lg mb-2">Поддержка 24/7</h3>
                  <p className="text-purple-700 text-sm">
                    Наша команда готова помочь в любое время
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Auctions Section */}
        <section className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Активные аукционы
            </h2>
            <div className="flex items-center text-emerald-600">
              <Timer className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Торги идут прямо сейчас</span>
            </div>
          </div>
          <ActiveAuctions searchQuery={searchQuery} />
        </section>
      </main>
    </div>
  );
}