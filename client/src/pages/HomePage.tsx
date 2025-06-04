import { MessageCircle, Search, Timer, Shield, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { AdvertisementBanner } from "@/components/AdvertisementBanner";

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
        {/* Sell Car Button */}
        <div className="flex justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg">
            Sell Your Car
          </Button>
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