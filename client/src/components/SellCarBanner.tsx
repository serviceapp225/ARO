import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import carBannerSvg from "@/assets/car-banner.svg";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function SellCarBanner() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Красивые фотографии автомобилей для ротации
  const carImages = [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Modern sports car
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Luxury sedan
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Electric car
    'https://images.unsplash.com/photo-1494976688153-ca3ce1b3c7ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Classic car
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
    console.log('КЛИК РАБОТАЕТ! Переход на /sell');
    
    // Проверяем авторизацию перед переходом на страницу продажи
    if (!user) {
      console.log('Пользователь не авторизован, перенаправляем на /login');
      setLocation('/login');
      return;
    }
    
    setLocation('/sell');
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
          Продай свое авто
        </h2>
        <p className="text-base leading-relaxed opacity-90 text-white h-12 flex items-center">
          Получи максимальную цену за свой автомобиль на нашем аукционе
        </p>
        <div className="mt-4">
          <span 
            className="px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-1 min-w-[180px] justify-center"
            style={{ 
              backgroundColor: '#ffffff',
              color: '#059669' 
            }}
          >
            <Plus className="w-4 h-4" />
            Начать продажу
          </span>
        </div>
      </div>
    </div>
  );
}