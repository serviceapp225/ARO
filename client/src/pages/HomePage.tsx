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

        {/* Advertisement Carousel - Optimized loading */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Специальные предложения
          </h2>
          <div 
            className="relative rounded-xl p-8 text-white text-center overflow-hidden min-h-[200px] bg-gradient-to-br from-blue-600 to-purple-700 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.8) 100%), url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85'), url('${premiumCarsSvg}')`
            }}
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Автомобили премиум-класса</h3>
              <p className="text-blue-100 mb-4">Найдите автомобиль своей мечты на наших эксклюзивных аукционах</p>
              <Button 
                onClick={() => setLocation('/')} 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-2"
              >
                Смотреть аукционы
              </Button>
            </div>
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