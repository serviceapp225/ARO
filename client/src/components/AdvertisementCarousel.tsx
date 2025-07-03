import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';

interface AdvertisementItem {
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
  const [isPaused, setIsPaused] = useState(false);

  const { data: advertisements = [], isLoading } = useQuery<AdvertisementItem[]>({
    queryKey: ['/api/advertisement-carousel'],
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Фильтруем только активные объявления и сортируем по порядку
  const activeAds = advertisements
    .filter(ad => ad.isActive)
    .sort((a, b) => a.order - b.order);

  // Автоматическое переключение каждые 5 секунд
  useEffect(() => {
    if (activeAds.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeAds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeAds.length, isPaused]);

  // Ручное переключение слайдов
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeAds.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeAds.length) % activeAds.length);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <Card className="h-64 animate-pulse">
          <CardContent className="p-6">
            <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeAds.length === 0) {
    return null;
  }

  const currentAd = activeAds[currentSlide];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <Card 
        className="relative overflow-hidden group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <CardContent className="p-0">
          <div className="relative h-64 md:h-80 lg:h-96">
            {/* Фоновое изображение */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${currentAd.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Контент */}
            <div className="relative z-10 flex items-center justify-between h-full p-6 md:p-8">
              <div className="flex-1 text-white">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                  {currentAd.title}
                </h3>
                <p className="text-lg md:text-xl mb-6 max-w-2xl">
                  {currentAd.description}
                </p>
                {currentAd.linkUrl && (
                  <Link to={currentAd.linkUrl}>
                    <Button 
                      size="lg" 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 text-lg"
                    >
                      {currentAd.buttonText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Кнопки навигации */}
            {activeAds.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Индикаторы слайдов */}
          {activeAds.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {activeAds.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}