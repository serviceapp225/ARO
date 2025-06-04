import { MessageCircle, Search, Timer, Shield, Car, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { AdvertisementBanner } from "@/components/AdvertisementBanner";
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with App Name and WhatsApp */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AUTOAUCTION</h1>
          <a 
            href="https://wa.me/992900000000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-green-600" />
          </a>
        </div>
      </header>

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

        {/* Sell Car Section */}
        <div className="relative h-44 rounded-2xl p-6 text-white overflow-hidden shadow-2xl">
          {/* Dark Car Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')`
            }}
          ></div>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl"></div>
          
          {/* Content */}
          <div className="relative z-10 space-y-2">
            
            <h2 className="text-2xl font-bold">Продай свое авто</h2>
            <p className="text-white/80 text-base leading-relaxed">
              Получи максимальную цену за свой<br />
              автомобиль на нашем аукционе
            </p>
            <div className="mt-4">
              <Link href="/sell">
                <span className="bg-white text-emerald-700 px-4 py-2 rounded-full text-sm font-bold hover:bg-emerald-50 transition-colors duration-300 cursor-pointer inline-flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Начать продажу →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Advertisement Banner */}
        <div className="space-y-4">
          <AdvertisementBanner />



          {/* Security Banner */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <h3 className="font-bold text-green-800 text-lg">Безопасные сделки</h3>
              </div>
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