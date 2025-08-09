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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [autoPlayPaused, setAutoPlayPaused] = useState(false);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Функция для плавного изменения индекса
  const changeIndex = (newIndex: number) => {
    if (isTransitioning || newIndex === currentIndex) return;
    
    setIsTransitioning(true);
    
    // Создаем небольшую задержку для fade эффекта
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  useEffect(() => {
    if (!images || images.length <= 1 || autoPlayPaused) return;

    // Добавляем случайную задержку для каждой карточки (0-2 секунды)
    const randomDelay = Math.random() * 2000;
    let interval: NodeJS.Timeout;
    
    const initialTimer = setTimeout(() => {
      // Начинаем интервал после случайной задержки
      interval = setInterval(() => {
        changeIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
      }, autoPlayInterval);
    }, randomDelay);

    return () => {
      clearTimeout(initialTimer);
      if (interval) clearInterval(interval);
    };
  }, [images, autoPlayInterval, autoPlayPaused, currentIndex, isTransitioning]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setLoadedImages(prev => new Set(prev).add(currentIndex));
    setImageError(false);
  };

  // Минимальное расстояние для регистрации свайпа
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setAutoPlayPaused(true); // Приостанавливаем автопроигрывание при взаимодействии
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setAutoPlayPaused(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      changeIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    }
    if (isRightSwipe) {
      changeIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    }

    // Возобновляем автопроигрывание через 3 секунды после взаимодействия
    setTimeout(() => setAutoPlayPaused(false), 3000);
  };

  // Обработчики мыши для десктопа
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setAutoPlayPaused(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!isDragging || !mouseStart || !mouseEnd) {
      setIsDragging(false);
      setAutoPlayPaused(false);
      return;
    }
    
    const distance = mouseStart - mouseEnd;
    const isLeftDrag = distance > minSwipeDistance;
    const isRightDrag = distance < -minSwipeDistance;

    if (isLeftDrag) {
      changeIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    }
    if (isRightDrag) {
      changeIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    }
    
    setIsDragging(false);
    setTimeout(() => setAutoPlayPaused(false), 3000);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    setAutoPlayPaused(false);
  };

  if (!images || images.length === 0 || imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <Car className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div 
      className={`relative touch-none overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* Основное изображение с плавными переходами */}
      <img 
        key={`image-${currentIndex}`}
        src={images[currentIndex]} 
        alt={`${alt} - Image ${currentIndex + 1}`}
        className={`w-full h-full object-cover select-none transition-all duration-300 ease-out ${
          isTransitioning ? 'opacity-30 scale-105' : 'opacity-100 scale-100'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        draggable={false}
      />
      
      {/* Индикаторы точек с улучшенными переходами */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 bg-black/20 rounded-full px-2 py-1 backdrop-blur-sm">
          {images.map((_, index) => (
            <div
              key={index}
              className={`rounded-full transition-all duration-300 ease-out ${
                index === currentIndex 
                  ? 'w-2 h-2 bg-white scale-110 shadow-sm' 
                  : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}