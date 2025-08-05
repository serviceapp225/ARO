import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import carBannerSvg from "@/assets/car-banner.svg";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export function SellCarBanner() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Загружаем данные банера из API
  const { data: bannerData } = useQuery({
    queryKey: ['/api/sell-car-banner'],
    enabled: true,
    staleTime: 0, // Данные сразу становятся устаревшими
    refetchInterval: 10000, // Обновляем каждые 10 секунд
  });
  
  // Изображения для ротации - приоритет загруженным файлам над URL
  const getCarImages = () => {
    if (!bannerData) {
      return []; // Без данных не показываем изображения
    }
    
    // Собираем изображения из админ панели - приоритет загруженным данным
    const images = [];
    
    // Проверяем сначала загруженные изображения (base64 данные), потом URL
    if ((bannerData as any).rotationImage1Data) {
      images.push((bannerData as any).rotationImage1Data);
    } else if ((bannerData as any).rotationImage1) {
      images.push((bannerData as any).rotationImage1);
    }
    
    if ((bannerData as any).rotationImage2Data) {
      images.push((bannerData as any).rotationImage2Data);
    } else if ((bannerData as any).rotationImage2) {
      images.push((bannerData as any).rotationImage2);
    }
    
    if ((bannerData as any).rotationImage3Data) {
      images.push((bannerData as any).rotationImage3Data);
    } else if ((bannerData as any).rotationImage3) {
      images.push((bannerData as any).rotationImage3);
    }
    
    if ((bannerData as any).rotationImage4Data) {
      images.push((bannerData as any).rotationImage4Data);
    } else if ((bannerData as any).rotationImage4) {
      images.push((bannerData as any).rotationImage4);
    }
    
    // Если нет изображений ротации, используем фоновое изображение
    if (images.length === 0) {
      if ((bannerData as any).backgroundImageData) {
        images.push((bannerData as any).backgroundImageData);
      } else if ((bannerData as any).backgroundImageUrl) {
        images.push((bannerData as any).backgroundImageUrl);
      }
    }
    
    return images;
  };
  
  const carImages = getCarImages();
  const rotationInterval = ((bannerData as any)?.rotationInterval || 3) * 1000; // Конвертируем в миллисекунды
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Состояние загрузки изображений (как в карусели)
  const [imageLoadState, setImageLoadState] = useState<{[url: string]: 'loading' | 'loaded' | 'error'}>({});
  
  // Предзагрузка изображений (как в карусели)
  useEffect(() => {
    carImages.forEach((imageUrl) => {
      if (imageUrl && !imageLoadState[imageUrl]) {
        setImageLoadState(prev => ({ ...prev, [imageUrl]: 'loading' }));
        
        const img = new Image();
        img.onload = () => {
          setImageLoadState(prev => ({ ...prev, [imageUrl]: 'loaded' }));
        };
        img.onerror = () => {
          setImageLoadState(prev => ({ ...prev, [imageUrl]: 'error' }));
        };
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
      }
    });
  }, [carImages]);

  // Ротация изображений с настраиваемым интервалом
  useEffect(() => {
    if (carImages.length <= 1) return; // Не ротируем если одно изображение или меньше
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carImages.length);
    }, rotationInterval);
    
    return () => clearInterval(interval);
  }, [carImages.length, rotationInterval]);
  
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
      {/* Фоновые изображения с плавными переходами */}
      {carImages.length > 0 ? (
        carImages.map((imageUrl, index) => (
          <div
            key={`${imageUrl}-${index}`}
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: imageLoadState[imageUrl] === 'loaded' 
                ? `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%), url('${imageUrl}')`
                : `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)`
            }}
          />
        ))
      ) : (
        // Fallback к SVG если нет изображений из API
        <div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%), url('${carBannerSvg}')`
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-2">
        <h2 className="text-2xl font-bold text-white h-8 flex items-center">
          {(bannerData as any)?.title || "Продай свое авто"}
        </h2>
        <p className="text-base leading-relaxed opacity-90 text-white h-12 flex items-center">
          {(bannerData as any)?.description || "Получи максимальную цену за свой автомобиль на нашем аукционе"}
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
            {(bannerData as any)?.buttonText || "Начать продажу"}
          </span>
        </div>
      </div>
    </div>
  );
}