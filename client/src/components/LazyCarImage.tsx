import { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface LazyCarImageProps {
  listingId: string;
  make: string;
  model: string;
  year: number;
  className?: string;
}

export function LazyCarImage({ listingId, make, model, year, className = "" }: LazyCarImageProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Проверяем кэш в localStorage
    const cacheKey = `photos_${listingId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const cacheTime = cachedData.timestamp;
        const now = Date.now();
        
        // Увеличиваем время кэширования до 10 минут для лучшей производительности
        if (now - cacheTime < 600000) {
          setPhotos(cachedData.photos || []);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Игнорируем ошибки парсинга кэша
      }
    }

    // Загружаем фотографии с оптимизированной задержкой
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}/photos`);
        if (response.ok) {
          const data = await response.json();
          if (data.photos && data.photos.length > 0) {
            setPhotos(data.photos);
            // Сохраняем в кэш
            localStorage.setItem(cacheKey, JSON.stringify({
              photos: data.photos,
              timestamp: Date.now()
            }));
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, Math.random() * 200 + 50); // Уменьшенная задержка от 50 до 250мс

    return () => clearTimeout(timer);
  }, [listingId]);

  // Автоматическая ротация фотографий каждые 3 секунды
  useEffect(() => {
    if (photos.length <= 1) return;
    
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 3000); // 3 секунды

    return () => clearInterval(intervalId);
  }, [photos.length]);

  if (loading || error || photos.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <Car className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img 
        src={photos[currentImageIndex]} 
        alt={`${year} ${make} ${model}`}
        className="w-full h-full object-cover transition-opacity duration-500"
        onError={() => setError(true)}
      />
      {/* Индикатор количества фотографий */}
      {photos.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentImageIndex + 1}/{photos.length}
        </div>
      )}
    </div>
  );
}