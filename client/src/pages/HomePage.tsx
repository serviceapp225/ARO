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
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
          {/* Car Background */}
          <div className="absolute inset-0 opacity-15">
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-48" viewBox="0 0 400 200" fill="none">
              <path d="M50 150 L80 120 L150 110 L220 115 L280 120 L320 140 L350 160 L320 180 L280 175 L220 175 L150 175 L80 175 Z" fill="white" opacity="0.3"/>
              <circle cx="120" cy="175" r="15" fill="white" opacity="0.4"/>
              <circle cx="280" cy="175" r="15" fill="white" opacity="0.4"/>
              <path d="M90 140 L130 125 L200 120 L270 125 L310 145" stroke="white" strokeWidth="2" opacity="0.5"/>
              <rect x="140" y="125" width="40" height="25" fill="white" opacity="0.2"/>
              <rect x="200" y="125" width="40" height="25" fill="white" opacity="0.2"/>
            </svg>
          </div>
          
          {/* Content */}
          <div className="relative z-10 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-2">
              <Car className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold">Продай свое авто</h2>
            <p className="text-emerald-100 text-lg max-w-md mx-auto">
              Получи максимальную цену за свой автомобиль на нашем аукционе
            </p>
            
            <Link href="/sell">
              <Button className="mt-6 bg-white text-emerald-700 hover:bg-emerald-50 py-3 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto">
                <Plus className="w-5 h-5" />
                Начать продажу
              </Button>
            </Link>
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