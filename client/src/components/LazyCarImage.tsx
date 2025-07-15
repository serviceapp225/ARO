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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Используем React Query для МАКСИМАЛЬНОГО кэширования фотографий
  const { data: photoData, isLoading: loading, error } = useQuery({
    queryKey: [`/api/listings/${listingId}/photos`],
    staleTime: 60 * 60 * 1000, // 1 час кэширования фотографий
    gcTime: 2 * 60 * 60 * 1000, // 2 часа в памяти
    retry: 0, // Не повторять запросы для скорости
  });

  const photos = photoData?.photos || [];

  // Автоматическая ротация отключена для максимальной производительности
  // useEffect(() => {
  //   if (photos.length <= 1) return;
  //   
  //   const intervalId = setInterval(() => {
  //     setCurrentImageIndex((prevIndex) => (prevIndex + 1) % photos.length);
  //   }, 3000); // 3 секунды
  //
  //   return () => clearInterval(intervalId);
  // }, [photos.length]);

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