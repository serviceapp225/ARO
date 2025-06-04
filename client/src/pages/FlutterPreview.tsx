import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Timer, Shield, Car } from "lucide-react";

export function FlutterPreview() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Container */}
      <div className="max-w-sm mx-auto bg-white shadow-lg">
        {/* Top Header */}
        <div className="flex justify-between items-center p-4 bg-white">
          <h1 className="text-xl font-bold text-gray-900">AUTOAUCTION</h1>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>

        {/* Sell Car Section */}
        <div className="px-4 pb-4 flex justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg">
            Sell Your Car
          </Button>
        </div>

        {/* Main Content */}
        <div className="px-4 space-y-6">
          {/* Advertisement Banners */}
          <div className="space-y-4">
            {/* Large Main Banner */}
            <div className="relative h-44 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-5 text-white overflow-hidden">
              <div className="absolute right-[-20px] top-[-10px]">
                <Car className="w-28 h-28 text-white opacity-20" />
              </div>
              <div className="relative z-10 space-y-2">
                <h2 className="text-xl font-bold">ПРЕМИУМ АУКЦИОН</h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Эксклюзивные автомобили<br />
                  от проверенных дилеров
                </p>
                <div className="mt-4">
                  <span className="bg-white text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                    Участвовать →
                  </span>
                </div>
              </div>
            </div>



            {/* Security Banner */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-bold text-green-800">Безопасные сделки</h3>
                  <p className="text-sm text-green-600">Все автомобили проходят проверку</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Auctions */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Active Auctions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-28 bg-gray-200 flex items-center justify-center">
                    <Car className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="font-bold text-sm">BMW X5 2020</h3>
                    <p className="text-xs text-gray-600">2020</p>
                    <p className="text-sm font-bold text-green-600">${45 + index}00</p>
                    <div className="bg-orange-100 px-2 py-1 rounded text-xs text-orange-700 font-medium inline-block">
                      2h {30 + index}m
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom Padding */}
          <div className="h-20"></div>
        </div>
      </div>
    </div>
  );
}