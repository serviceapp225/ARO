import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export function SellCarBanner() {
  const [, setLocation] = useLocation();

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Background image */}
          <div 
            className="h-48 bg-cover bg-center relative"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=300&fit=crop')"
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <Car className="h-12 w-12 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white">
                  Продайте свой автомобиль
                </h2>
                
                <p className="text-white/90 text-sm max-w-md">
                  Быстро и выгодно на AUTOBID.TJ. Миллионы покупателей ждут именно ваш автомобиль!
                </p>
                
                <Button 
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                  onClick={() => setLocation('/sell-car')}
                >
                  Начать продажу
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}