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
          {/* Car Background */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15">
            <svg className="w-80 h-40" viewBox="0 0 320 160" fill="none">
              <path d="M40 120 L60 95 L120 85 L180 90 L230 95 L270 115 L300 135 L270 150 L230 145 L180 145 L120 145 L60 145 Z" fill="white"/>
              <circle cx="100" cy="145" r="12" fill="white"/>
              <circle cx="230" cy="145" r="12" fill="white"/>
              <path d="M70 110 L105 100 L165 95 L225 100 L260 120" stroke="white" strokeWidth="2"/>
              <rect x="115" y="100" width="30" height="20" fill="white" opacity="0.7"/>
              <rect x="165" y="100" width="30" height="20" fill="white" opacity="0.7"/>
            </svg>
          </div>
          
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