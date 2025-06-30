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

export function TripleCarouselBanner() {
  const [activeCarousel, setActiveCarousel] = useState(0); // 0, 1, 2 для трех каруселей
  const [currentSlides, setCurrentSlides] = useState([0, 0, 0]); // текущий слайд для каждой карусели
  
  // Максимально агрессивное кэширование для мгновенной загрузки
  const { data: carouselItems = [], isLoading } = useQuery<AdvertisementCarouselData[]>({
    queryKey: ['/api/advertisement-carousel'],
    enabled: true,
    queryFn: async () => {
      const response = await fetch('/api/advertisement-carousel');
      if (!response.ok) throw new Error('Failed to fetch advertisement carousel');
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
  });

  // Автоматическое переключение слайдов
  useEffect(() => {
    if (carouselItems.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlides(prev => {
          const newSlides = [...prev];
          newSlides[activeCarousel] = (newSlides[activeCarousel] + 1) % carouselItems.length;
          return newSlides;
        });
      }, 4000); // Каждые 4 секунды

      return () => clearInterval(timer);
    }
  }, [carouselItems.length, activeCarousel]);

  const switchCarousel = (carouselIndex: number) => {
    setActiveCarousel(carouselIndex);
  };

  const nextSlide = () => {
    setCurrentSlides(prev => {
      const newSlides = [...prev];
      newSlides[activeCarousel] = (newSlides[activeCarousel] + 1) % carouselItems.length;
      return newSlides;
    });
  };

  const prevSlide = () => {
    setCurrentSlides(prev => {
      const newSlides = [...prev];
      newSlides[activeCarousel] = (newSlides[activeCarousel] - 1 + carouselItems.length) % carouselItems.length;
      return newSlides;
    });
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

  const currentItem = carouselItems[currentSlides[activeCarousel]] || carouselItems[0];

  return (
    <div className="w-full">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Carousel Tabs */}
          <div className="flex border-b bg-gray-50">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => switchCarousel(index)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeCarousel === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Реклама {index + 1}
              </button>
            ))}
          </div>

          {/* Carousel Content */}
          <div className="relative h-48 overflow-hidden">
            <div
              className="relative h-full bg-gradient-to-br from-blue-600 to-purple-700"
              style={{ 
                backgroundImage: currentItem?.imageUrl ? `url('${currentItem.imageUrl}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-2 p-6">
                <h2 className="text-2xl font-bold text-white">
                  {currentItem?.title || `Карусель ${activeCarousel + 1}`}
                </h2>
                {currentItem?.description && (
                  <p className="text-base text-white opacity-90 leading-relaxed">
                    {currentItem.description}
                  </p>
                )}
                {currentItem?.linkUrl && (
                  <div className="mt-4">
                    <a href={currentItem.linkUrl} className="inline-block">
                      <span className="px-4 py-2 rounded-full text-sm font-bold bg-white text-emerald-700 hover:bg-gray-100 transition-all duration-300 cursor-pointer inline-flex items-center gap-1">
                        {currentItem.buttonText || 'Подробнее'} →
                      </span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation arrows */}
            {carouselItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 text-white hover:bg-black/70"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 text-white hover:bg-black/70"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Slide indicators */}
            {carouselItems.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlides(prev => {
                        const newSlides = [...prev];
                        newSlides[activeCarousel] = index;
                        return newSlides;
                      });
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlides[activeCarousel]
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