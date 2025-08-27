import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import placeholderCarImage from "@/assets/default-car-placeholder.jpg";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

// Тип данных баннера
interface SellCarBannerData {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  backgroundImageUrl?: string;
  rotationImage1?: string;
  rotationImage2?: string;
  rotationImage3?: string;
  rotationImage4?: string;
  rotationInterval?: number;
}

export function SellCarBanner() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Ультра-оптимизированная загрузка банера
  const { data: bannerData } = useQuery<SellCarBannerData>({
    queryKey: ['/api/sell-car-banner'],
    enabled: true,
    staleTime: 10 * 60 * 1000, // Данные свежи 10 минут - баннер статичный
    gcTime: 30 * 60 * 1000, // Кэш живет 30 минут
    refetchInterval: false, // Отключаем авто-обновления - баннер статичный
    refetchOnWindowFocus: false, // Не обновляем при фокусе
    refetchOnMount: false, // Используем кэш при монтировании
  });
  
  // Функция для получения оптимизированного URL изображения баннера продажи
  const getOptimizedImageUrl = (imageType: 'background' | 'rotation1' | 'rotation2' | 'rotation3' | 'rotation4'): string => {
    if (!bannerData?.id) return '';
    return `/api/images/sell-car-banner/${bannerData.id}/${imageType}`;
  };

  // Изображения для ротации из API endpoints (оптимизированные)
  const getCarImages = () => {
    if (!bannerData) {
      return []; // Без данных не показываем изображения
    }
    
    // Собираем изображения из локальных API endpoints
    const images = [];
    if (bannerData.rotationImage1) images.push(getOptimizedImageUrl('rotation1'));
    if (bannerData.rotationImage2) images.push(getOptimizedImageUrl('rotation2'));
    if (bannerData.rotationImage3) images.push(getOptimizedImageUrl('rotation3'));
    if (bannerData.rotationImage4) images.push(getOptimizedImageUrl('rotation4'));
    
    // Если есть дополнительные изображения, используем их, иначе основное
    return images.length > 0 ? images : (bannerData.backgroundImageUrl ? [getOptimizedImageUrl('background')] : []);
  };
  
  const carImages = getCarImages();
  const rotationInterval = (bannerData?.rotationInterval || 3) * 1000; // Конвертируем в миллисекунды
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Состояние загрузки изображений с оптимизацией
  const [imageLoadState, setImageLoadState] = useState<{[url: string]: 'loading' | 'loaded' | 'error'}>({});
  const [hasAnyLoadedImage, setHasAnyLoadedImage] = useState(false);
  
  // Сброс индекса при смене набора изображений
  useEffect(() => {
    if (hasAnyLoadedImage && carImages.length > 0) {
      // Находим первое загруженное изображение и устанавливаем его как текущее
      const firstLoadedIndex = carImages.findIndex(imageUrl => imageLoadState[imageUrl] === 'loaded');
      if (firstLoadedIndex !== -1) {
        setCurrentImageIndex(firstLoadedIndex);
      }
    }
  }, [hasAnyLoadedImage, carImages, imageLoadState]);
  
  // Предзагрузка изображений с приоритетом первого
  useEffect(() => {
    if (carImages.length === 0) return;
    
    // Сначала загружаем первое изображение приоритетно
    const firstImage = carImages[0];
    if (firstImage && !imageLoadState[firstImage]) {
      setImageLoadState(prev => ({ ...prev, [firstImage]: 'loading' }));
      
      const img = new Image();
      img.onload = () => {
        setImageLoadState(prev => ({ ...prev, [firstImage]: 'loaded' }));
        setHasAnyLoadedImage(true);
      };
      img.onerror = () => {
        setImageLoadState(prev => ({ ...prev, [firstImage]: 'error' }));
      };
      img.crossOrigin = 'anonymous';
      img.src = firstImage;
    }
    
    // Остальные изображения загружаем параллельно
    carImages.slice(1).forEach((imageUrl) => {
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

  // Ротация изображений с настраиваемым интервалом - только для загруженных изображений
  useEffect(() => {
    if (!hasAnyLoadedImage || carImages.length <= 1) return; // Не ротируем если нет загруженных изображений
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        // Находим следующее загруженное изображение
        let nextIndex = (prev + 1) % carImages.length;
        let attempts = 0;
        
        // Ищем следующее загруженное изображение (максимум carImages.length попыток)
        while (imageLoadState[carImages[nextIndex]] !== 'loaded' && attempts < carImages.length) {
          nextIndex = (nextIndex + 1) % carImages.length;
          attempts++;
        }
        
        return nextIndex;
      });
    }, rotationInterval);
    
    return () => clearInterval(interval);
  }, [hasAnyLoadedImage, carImages.length, rotationInterval, imageLoadState]);
  
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
      {/* SVG fallback - показывается до загрузки реальных изображений */}
      <div 
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
          hasAnyLoadedImage ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%), url('${placeholderCarImage}')`
        }}
      />
      
      {/* Реальные изображения с плавным появлением */}
      {carImages.map((imageUrl, index) => (
        <div
          key={`${imageUrl}-${index}`}
          className={`absolute inset-0 rounded-2xl bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            hasAnyLoadedImage && index === currentImageIndex && imageLoadState[imageUrl] === 'loaded' 
              ? 'opacity-100' 
              : 'opacity-0'
          }`}
          style={{
            backgroundImage: imageLoadState[imageUrl] === 'loaded' 
              ? `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%), url('${imageUrl}')`
              : 'none'
          }}
        />
      ))}
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-2">
        <h2 className="text-2xl font-bold text-white h-8 flex items-center">
          {bannerData?.title || "Продай свое авто"}
        </h2>
        <p className="text-base leading-relaxed opacity-90 text-white h-12 flex items-center">
          {bannerData?.description || "Получи максимальную цену за свой автомобиль на нашем аукционе"}
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
            {bannerData?.buttonText || "Начать продажу"}
          </span>
        </div>
      </div>
    </div>
  );
}