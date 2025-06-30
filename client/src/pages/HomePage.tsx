import { MessageCircle, Search, Timer, Shield, Car, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { SellCarBanner } from "@/components/SellCarBanner";
import { AdvertisementCarousel } from "@/components/AdvertisementCarousel";
import { TopHeader } from "@/components/TopHeader";
import { Link } from "wouter";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import premiumCarsSvg from "@/assets/premium-cars.svg";


export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск будет обрабатываться компонентом ActiveAuctions
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Напишите номер лота или название автомобиля"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-base border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Sell Car Banner */}
        <SellCarBanner />

        {/* Premium Cars Carousel */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Автомобили премиум-класса
          </h2>
          <p className="text-gray-600 mb-6">Найдите автомобиль своей мечты на наших эксклюзивных аукционах</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Премиум карточка 1 */}
            <div className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div 
                className="h-48 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')`
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                <div className="absolute top-3 left-3">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    ГОРЯЧИЙ АУКЦИОН
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">BMW M4 Competition</h3>
                <p className="text-gray-600 text-sm mb-3">2023 • 5,000 км • Спорткар</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">от 45,000 $</span>
                  <span className="text-xs text-gray-500">2 дня до окончания</span>
                </div>
              </div>
            </div>

            {/* Премиум карточка 2 */}
            <div className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div 
                className="h-48 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')`
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                <div className="absolute top-3 left-3">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    НОВИНКА
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">Mercedes-AMG GT</h3>
                <p className="text-gray-600 text-sm mb-3">2024 • 1,200 км • Купе</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">от 68,000 $</span>
                  <span className="text-xs text-gray-500">5 часов до окончания</span>
                </div>
              </div>
            </div>

            {/* Премиум карточка 3 */}
            <div className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <div 
                className="h-48 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')`
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                <div className="absolute top-3 left-3">
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    ЭКСКЛЮЗИВ
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">Porsche 911 Turbo S</h3>
                <p className="text-gray-600 text-sm mb-3">2024 • 800 км • Спорткар</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">от 92,000 $</span>
                  <span className="text-xs text-gray-500">1 день до окончания</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Button 
              onClick={() => setLocation('/')} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl"
            >
              Посмотреть все премиум аукционы
            </Button>
          </div>
        </section>

        {/* Security Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <h3 className="font-bold text-green-800 text-lg">Безопасные сделки</h3>
            </div>
          </div>
        </div>

        {/* Active Auctions Section */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Активные аукционы
          </h2>
          <ActiveAuctions searchQuery={searchQuery} />
        </section>
      </main>
    </div>
  );
}