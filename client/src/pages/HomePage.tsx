import { MessageCircle, Search, Timer, Shield, Car, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { SellCarSection } from "@/components/SellCarSection";
import { SellCarBanner } from "@/components/SellCarBanner";
import { AdvertisementCarousel } from "@/components/AdvertisementCarousel";
import { TopHeader } from "@/components/TopHeader";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { loadFastLoginData, prepareFastLogin } from "@/lib/fastLogin";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const [showSecondaryContent, setShowSecondaryContent] = useState(false);
  const { user } = useAuth();

  // Ultra-fast loading optimization
  useEffect(() => {
    if (user?.userId) {
      // Try to load cached data immediately
      const cachedData = loadFastLoginData(user.userId);
      if (!cachedData) {
        // Prepare data for next time
        prepareFastLogin(user.userId);
      }
    }

    // Load secondary content after minimal delay
    const timer = setTimeout(() => {
      setShowSecondaryContent(true);
    }, 25);

    return () => clearTimeout(timer);
  }, [user?.userId]);

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

        {/* Sell Car Section - Lazy loaded */}
        {showSecondaryContent && <SellCarSection />}

        {/* Advertisement Carousel - Lazy loaded */}
        {showSecondaryContent && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Специальные предложения
            </h2>
            <AdvertisementCarousel />
          </section>
        )}

        {/* Sell Car Banner */}
        <SellCarBanner />

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