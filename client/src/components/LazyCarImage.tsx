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

  useEffect(() => {
    // Проверяем кэш в localStorage
    const cacheKey = `photos_${listingId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const cacheTime = cachedData.timestamp;
        const now = Date.now();
        
        // Если кэш свежий (менее 5 минут), используем его
        if (now - cacheTime < 300000) {
          setPhotos(cachedData.photos || []);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Игнорируем ошибки парсинга кэша
      }
    }

    // Загружаем фотографии с задержкой для ленивой загрузки
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
    }, Math.random() * 500 + 100); // Случайная задержка от 100 до 600мс

    return () => clearTimeout(timer);
  }, [listingId]);

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
        src={photos[0]} 
        alt={`${year} ${make} ${model}`}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}