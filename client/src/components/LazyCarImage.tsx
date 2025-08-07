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
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

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

  // Сбрасываем imageLoaded при смене фотографии
  useEffect(() => {
    setImageLoaded(false);
  }, [currentImageIndex]);

  // Автоматическая ротация фотографий каждые 3 секунды (только если есть фотографии)
  useEffect(() => {
    if (!isVisible || photos.length <= 1) return;
    
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [photos.length, isVisible]);

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
    <div ref={imgRef} className={`relative ${className}`}>
      <img 
        src={photos[currentImageIndex]} 
        alt={`${year} ${make} ${model}`}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => console.error(`Ошибка загрузки фото ${currentImageIndex} для ${make} ${model}`)}
      />
      
      {/* Индикатор загрузки */}
      {!imageLoaded && (
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
      
      {/* Индикатор количества фотографий */}
      {photos.length > 1 && imageLoaded && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentImageIndex + 1}/{photos.length}
        </div>
      )}
    </div>
  );
}