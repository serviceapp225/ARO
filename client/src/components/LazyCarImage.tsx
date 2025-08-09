import { useState, useEffect, useRef } from 'react';
import { Car } from 'lucide-react';
import defaultCarPlaceholder from '@/assets/default-car-placeholder.jpg';

interface LazyCarImageProps {
  listingId: string;
  make: string;
  model: string;
  year: number;
  photos?: string[]; // Фотографии приходят прямо из props
  className?: string;
}

export function LazyCarImage({ listingId, make, model, year, photos = [], className = "" }: LazyCarImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Функция для плавного изменения индекса
  const changeImageIndex = (newIndex: number) => {
    if (isTransitioning || newIndex === currentImageIndex) return;
    
    setIsTransitioning(true);
    
    // Создаем эффект crossfade
    setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  // Intersection Observer для ленивой загрузки
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Предзагрузка следующих изображений для плавных переходов
  useEffect(() => {
    if (!isVisible || photos.length <= 1) return;
    
    photos.forEach((photo, index) => {
      if (!loadedImages.has(index)) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(index));
        };
        img.src = photo;
      }
    });
  }, [photos, isVisible, loadedImages]);

  // Автоматическая ротация фотографий каждые 3 секунды (только если есть фотографии)
  useEffect(() => {
    if (!isVisible || photos.length <= 1 || isTransitioning) return;
    
    const intervalId = setInterval(() => {
      const nextIndex = (currentImageIndex + 1) % photos.length;
      changeImageIndex(nextIndex);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [photos.length, isVisible, currentImageIndex, isTransitioning]);

  // Показываем placeholder если нет фотографий или еще не видимо
  if (!isVisible || photos.length === 0) {
    return (
      <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
        <img 
          src={defaultCarPlaceholder}
          alt="Автомобиль под тканью"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-white/90 text-gray-700 text-sm px-3 py-1 rounded-full">
            Загрузка...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Основное изображение с плавными crossfade переходами */}
      <img 
        key={`car-image-${currentImageIndex}`}
        src={photos[currentImageIndex]} 
        alt={`${year} ${make} ${model}`}
        className={`w-full h-full object-cover select-none transition-all duration-300 ease-out ${
          loadedImages.has(currentImageIndex)
            ? (isTransitioning ? 'opacity-30 scale-105' : 'opacity-100 scale-100')
            : 'opacity-0'
        }`}
        loading="lazy"
        onLoad={() => setLoadedImages(prev => new Set(prev).add(currentImageIndex))}
        onError={() => console.error(`Ошибка загрузки фото ${currentImageIndex} для ${make} ${model}`)}
      />
      
      {/* Индикатор загрузки только для первого изображения */}
      {!loadedImages.has(currentImageIndex) && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <img 
            src={defaultCarPlaceholder}
            alt="Автомобиль под тканью"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 text-gray-700 text-sm px-3 py-1 rounded-full animate-pulse">
              Загрузка фото...
            </div>
          </div>
        </div>
      )}
      
      {/* Индикатор количества фотографий с улучшенным дизайном */}
      {photos.length > 1 && loadedImages.has(currentImageIndex) && (
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm transition-all duration-200">
          {currentImageIndex + 1}/{photos.length}
        </div>
      )}
    </div>
  );
}