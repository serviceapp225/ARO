import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Advertisement {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor: string;
}

const advertisements: Advertisement[] = [
  {
    id: 1,
    title: "Специальное предложение",
    description: "Скидка до 15% на комиссию при продаже автомобиля до конца месяца",
    imageUrl: "/api/placeholder/400/200",
    ctaText: "Продать авто",
    ctaLink: "/sell-car",
    backgroundColor: "bg-gradient-to-r from-blue-500 to-blue-600"
  },
  {
    id: 2,
    title: "Премиум размещение",
    description: "Увеличьте шансы продажи с премиум размещением вашего объявления",
    imageUrl: "/api/placeholder/400/200",
    ctaText: "Узнать больше",
    ctaLink: "/premium",
    backgroundColor: "bg-gradient-to-r from-purple-500 to-purple-600"
  },
  {
    id: 3,
    title: "Автомобили из Европы",
    description: "Большой выбор автомобилей с европейскими документами",
    imageUrl: "/api/placeholder/400/200",
    ctaText: "Смотреть каталог",
    ctaLink: "/search?region=europe",
    backgroundColor: "bg-gradient-to-r from-green-500 to-green-600"
  }
];

export function AdvertisementBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Автоматическое переключение баннеров каждые 5 секунд
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % advertisements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);



  const currentAd = advertisements[currentIndex];

  const handleCTAClick = () => {
    window.open(currentAd.ctaLink, '_self');
  };

  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-lg mb-6"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Основной баннер */}
      <div className={`${currentAd.backgroundColor} text-white p-6 md:p-8 min-h-[200px] flex items-center`}>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {currentAd.title}
          </h2>
          <p className="text-lg md:text-xl mb-4 opacity-90">
            {currentAd.description}
          </p>
          <Button 
            onClick={handleCTAClick}
            variant="secondary"
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
          >
            {currentAd.ctaText}
          </Button>
        </div>
        
        {/* Декоративный элемент */}
        <div className="hidden md:block flex-shrink-0 ml-6">
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-20 h-20 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>



      {/* Индикаторы (только для отображения) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {advertisements.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}