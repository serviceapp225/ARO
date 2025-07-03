import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import type { SellCarBanner } from "@shared/schema";

export function DynamicSellCarBanner() {
  const [, setLocation] = useLocation();

  // Загружаем данные баннера из API
  const { data: banner, isLoading } = useQuery<SellCarBanner>({
    queryKey: ['/api/sell-car-banner'],
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });

  // Не показываем баннер если он неактивен или загружается
  if (isLoading || !banner || !banner.isActive) {
    return null;
  }

  const handleClick = () => {
    setLocation(banner.linkUrl);
  };

  return (
    <div 
      onClick={handleClick}
      className="relative h-44 rounded-2xl p-6 text-white overflow-hidden shadow-2xl cursor-pointer hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]"
      style={{
        background: 'transparent',
        color: banner.textColor || '#ffffff',
      }}
    >
      {/* Background Image */}
      {banner.backgroundImageUrl && (
        <div 
          className="absolute inset-0 rounded-2xl bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${banner.backgroundImageUrl}')`,
          }}
        />
      )}
      
      {/* Minimal dark overlay for text readability */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 100%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-3">
        <h2 className="text-2xl font-bold drop-shadow-lg text-white">
          {banner.title}
        </h2>
        <p className="text-base leading-relaxed opacity-95 drop-shadow-md max-w-md text-white">
          {banner.description}
        </p>
        <div className="mt-4">
          <span 
            className="px-6 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            style={{ 
              backgroundColor: banner.textColor === '#ffffff' ? '#059669' : '#ffffff',
              color: banner.textColor === '#ffffff' ? '#ffffff' : '#059669',
            }}
          >
            <Plus className="w-4 h-4" />
            {banner.buttonText}
          </span>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 rounded-full bg-white/5 blur-lg"></div>
    </div>
  );
}