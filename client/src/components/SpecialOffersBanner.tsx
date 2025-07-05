import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import carBannerSvg from "@/assets/car-banner.svg";
import { useState, useEffect } from "react";

export function SpecialOffersBanner() {
  const [, setLocation] = useLocation();
  
  // Красивые фотографии автомобилей для ротации
  const carImages = [
    'https://images.unsplash.com/photo-1580414068983-d3e8c8f7f5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Luxury BMW
    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Mercedes luxury
    'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Audi premium
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Tesla Model S
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Ротация изображений каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [carImages.length]);
  
  const handleClick = () => {
    console.log('КЛИК РАБОТАЕТ! Переход на специальные предложения');
    setLocation('/special-offers');
  };

  return (
    <div 
      onClick={handleClick}
      className="relative h-44 rounded-2xl p-6 text-white overflow-hidden shadow-2xl cursor-pointer hover:shadow-3xl transition-all duration-300"
    >
      {/* Background with Rotating Car Photos */}
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%), url('${carImages[currentImageIndex]}'), url('${carBannerSvg}')`
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-2">
        <h2 className="text-2xl font-bold text-white h-8 flex items-center">
          Специальные предложения
        </h2>
        <p className="text-base leading-relaxed opacity-90 text-white h-12 flex items-center">
          Лучшие автомобили с особыми условиями сделки
        </p>
        <div className="mt-4">
          <span 
            className="px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-1 min-w-[180px] justify-center"
            style={{ 
              backgroundColor: '#ffffff',
              color: '#059669' 
            }}
          >
            <Sparkles className="w-4 h-4" />
            Смотреть предложения →
          </span>
        </div>
      </div>
    </div>
  );
}