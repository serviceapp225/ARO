import { MessageCircle, Search, Timer, Shield, Car, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { AdvertisementBanner } from "@/components/AdvertisementBanner";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with App Name and WhatsApp */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AUTOAUCTION</h1>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Sell Car Section */}
        <div className="relative h-44 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl p-6 text-white overflow-hidden shadow-2xl">
          {/* Car Background Image */}
          <div 
            className="absolute right-0 top-0 w-full h-full opacity-20 bg-cover bg-right bg-no-repeat rounded-2xl"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')`
            }}
          ></div>
          
          {/* Content */}
          <div className="relative z-10 space-y-2">
            <div className="absolute right-[-20px] top-[-10px]">
              <Car className="w-28 h-28 text-white opacity-20" />
            </div>
            
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
          <ActiveAuctions />
        </section>
      </main>
    </div>
  );
}