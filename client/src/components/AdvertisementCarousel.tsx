import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdvertisementCarouselData {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  isActive: boolean;
  order: number;
}

export function AdvertisementCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Максимально агрессивное кэширование для мгновенной загрузки
  const { data: carouselItems = [], isLoading } = useQuery<AdvertisementCarouselData[]>({
    queryKey: ['/api/advertisement-carousel'],
    enabled: true,
    queryFn: async () => {
      const response = await fetch('/api/advertisement-carousel');
      if (!response.ok) throw new Error('Failed to fetch advertisement carousel');
      return response.json();
    },
    staleTime: Infinity, // Никогда не считать данные устаревшими
    gcTime: Infinity, // Никогда не удалять из кэша
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false, // Не повторять запросы для ускорения
  });

  useEffect(() => {
    if (carouselItems.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
      }, 5000); // Auto-advance every 5 seconds

      return () => clearInterval(timer);
    }
  }, [carouselItems.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!carouselItems.length) {
    return null;
  }

  return (
    <div className="w-full">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-48 overflow-hidden">
            {carouselItems.map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                  index === currentSlide ? 'translate-x-0' : 
                  index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                }`}
              >
                <div 
                  className="relative h-full bg-gradient-to-br from-blue-600 to-purple-700"
                  style={{ 
                    backgroundImage: item.imageUrl ? `url('${item.imageUrl}')` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-2 p-6">
                    <h2 className="text-2xl font-bold text-white">
                      {item.title}
                    </h2>
                    {item.description && (
                      <p className="text-base text-white opacity-90 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    {item.linkUrl && (
                      <div className="mt-4">
                        <a href={item.linkUrl} className="inline-block">
                          <span className="px-4 py-2 rounded-full text-sm font-bold bg-white text-emerald-700 hover:bg-gray-100 transition-all duration-300 cursor-pointer inline-flex items-center gap-1">
                            {item.buttonText || 'Подробнее'} →
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}



            {/* Dots indicator */}
            {carouselItems.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-white'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}