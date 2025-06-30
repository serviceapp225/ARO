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
            className="relative rounded-xl p-8 text-white text-center overflow-hidden min-h-[200px] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(147,51,234,0.9) 100%), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><linearGradient id="carBg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%233b82f6"/><stop offset="100%" style="stop-color:%239333ea"/></linearGradient></defs><rect width="1200" height="600" fill="url(%23carBg)"/><g transform="translate(200,200)"><path d="M100 150 L200 120 L400 120 L500 130 L600 150 L650 170 L680 190 L650 210 L600 230 L100 230 Z" fill="%23ffffff" opacity="0.15"/><circle cx="200" cy="220" r="25" fill="%23ffffff" opacity="0.2"/><circle cx="500" cy="220" r="25" fill="%23ffffff" opacity="0.2"/><rect x="220" y="140" width="260" height="60" rx="5" fill="%23ffffff" opacity="0.1"/><path d="M150 170 L250 160 L350 160 L450 170" stroke="%23ffffff" stroke-width="2" opacity="0.2" fill="none"/></g><g transform="translate(50,350)"><circle cx="50" cy="50" r="3" fill="%23ffffff" opacity="0.3"/><circle cx="150" cy="30" r="2" fill="%23ffffff" opacity="0.4"/><circle cx="250" cy="70" r="1.5" fill="%23ffffff" opacity="0.5"/></g></svg>')`
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