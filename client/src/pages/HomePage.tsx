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
            className="absolute right-0 top-0 w-full h-full opacity-30 bg-cover bg-center bg-no-repeat rounded-2xl"
            style={{
              backgroundImage: `url('data:image/svg+xml;base64,${btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" fill="none">
                  <defs>
                    <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:rgba(255,255,255,0.8)" />
                      <stop offset="50%" style="stop-color:rgba(255,255,255,0.6)" />
                      <stop offset="100%" style="stop-color:rgba(255,255,255,0.4)" />
                    </linearGradient>
                  </defs>
                  
                  <!-- Modern Car Silhouette -->
                  <path d="M100 280 L140 220 L260 200 L400 190 L540 200 L640 240 L700 300 L640 340 L540 330 L400 330 L260 330 L140 330 Z" fill="url(#carGradient)"/>
                  
                  <!-- Wheels -->
                  <circle cx="240" cy="330" r="36" fill="rgba(255,255,255,0.9)"/>
                  <circle cx="240" cy="330" r="24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="4"/>
                  <circle cx="560" cy="330" r="36" fill="rgba(255,255,255,0.9)"/>
                  <circle cx="560" cy="330" r="24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="4"/>
                  
                  <!-- Car Body Details -->
                  <path d="M160 260 L220 230 L360 220 L500 230 L600 270" stroke="rgba(255,255,255,0.8)" stroke-width="6"/>
                  
                  <!-- Windows -->
                  <path d="M220 250 L280 225 L360 220 L440 225 L500 250 L480 270 L400 270 L280 270 Z" fill="rgba(255,255,255,0.6)"/>
                  
                  <!-- Windshield -->
                  <path d="M150 270 L210 235 L280 230 L270 270 L200 280 Z" fill="rgba(255,255,255,0.5)"/>
                  
                  <!-- Headlights -->
                  <ellipse cx="120" cy="260" rx="16" ry="24" fill="rgba(255,255,255,0.9)"/>
                  <ellipse cx="680" cy="280" rx="12" ry="16" fill="rgba(255,255,255,0.8)"/>
                  
                  <!-- Grille -->
                  <rect x="90" y="250" width="40" height="30" fill="rgba(255,255,255,0.8)"/>
                  <line x1="96" y1="256" x2="124" y2="256" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
                  <line x1="96" y1="266" x2="124" y2="266" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
                  <line x1="96" y1="276" x2="124" y2="276" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
                  
                  <!-- Side Details -->
                  <path d="M140 270 L180 260 L300 256 L440 260 L560 280" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
                  <path d="M160 290 L200 285 L320 282 L460 285 L540 295" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
                </svg>
              `)}`
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