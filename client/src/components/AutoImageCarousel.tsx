import { useState, useEffect } from 'react';
import { Car } from 'lucide-react';

interface AutoImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  autoPlayInterval?: number;
}

export function AutoImageCarousel({ 
  images, 
  alt, 
  className = "", 
  autoPlayInterval = 3000 
}: AutoImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!images || images.length <= 1) return;

    // Добавляем случайную задержку для каждой карточки (0-2 секунды)
    const randomDelay = Math.random() * 2000;
    let interval: NodeJS.Timeout;
    
    const initialTimer = setTimeout(() => {
      // Начинаем интервал после случайной задержки
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, autoPlayInterval);
    }, randomDelay);

    return () => {
      clearTimeout(initialTimer);
      if (interval) clearInterval(interval);
    };
  }, [images, autoPlayInterval]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setLoadedImages(prev => new Set(prev).add(currentIndex));
    setImageError(false);
  };

  if (!images || images.length === 0 || imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <Car className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img 
        src={images[currentIndex]} 
        alt={`${alt} - Image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-500"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      
      {/* Индикаторы точек (только для отображения) */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}