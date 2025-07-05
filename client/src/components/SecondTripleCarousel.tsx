import { useState, useEffect } from "react";
import { Gift, Star, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface SecondCarouselItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
  carouselNumber: number; // 1, 2, или 3
}

export function SecondTripleCarousel() {
  const [, setLocation] = useLocation();
  const [currentSlides, setCurrentSlides] = useState([0, 0, 0]);
  
  // Загружаем данные каруселей
  const { data: carouselItems = [], isLoading } = useQuery<SecondCarouselItem[]>({
    queryKey: ['/api/second-carousel'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Группируем элементы по номеру карусели
  const carouselGroups = [
    carouselItems.filter(item => item.carouselNumber === 1 && item.isActive).sort((a, b) => a.order - b.order),
    carouselItems.filter(item => item.carouselNumber === 2 && item.isActive).sort((a, b) => a.order - b.order),
    carouselItems.filter(item => item.carouselNumber === 3 && item.isActive).sort((a, b) => a.order - b.order),
  ];

  // Дефолтные данные для каруселей
  const defaultCarousels = [
    {
      title: "Приведи друга",
      description: "Получи бонус за каждого друга",
      buttonText: "Пригласить друга",
      gradient: "from-green-600 to-emerald-700",
      icon: Gift,
      linkUrl: "/referral"
    },
    {
      title: "Горячие аукционы", 
      description: "Эксклюзивные автомобили",
      buttonText: "Смотреть аукционы",
      gradient: "from-red-600 to-orange-700",
      icon: Star,
      linkUrl: "/hot-auctions"
    },
    {
      title: "Стань экспертом",
      description: "Оценивай авто и зарабатывай",
      buttonText: "Начать экспертизу",
      gradient: "from-blue-600 to-indigo-700", 
      icon: Award,
      linkUrl: "/expert"
    }
  ];

  // Автоматическое переключение слайдов
  useEffect(() => {
    const intervals = carouselGroups.map((group, carouselIndex) => {
      if (group.length <= 1) return null;
      
      return setInterval(() => {
        setCurrentSlides(prev => {
          const newSlides = [...prev];
          newSlides[carouselIndex] = (newSlides[carouselIndex] + 1) % group.length;
          return newSlides;
        });
      }, 5000 + carouselIndex * 1500);
    });

    return () => {
      intervals.forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [carouselGroups]);

  const handleCarouselClick = (carouselIndex: number) => {
    const currentGroup = carouselGroups[carouselIndex];
    const currentItem = currentGroup[currentSlides[carouselIndex]];
    
    if (currentItem?.linkUrl) {
      if (currentItem.linkUrl.startsWith('http')) {
        window.open(currentItem.linkUrl, '_blank');
      } else {
        setLocation(currentItem.linkUrl);
      }
    } else {
      // Дефолтная ссылка
      setLocation(defaultCarousels[carouselIndex].linkUrl);
    }
  };

  const navigateSlide = (carouselIndex: number, direction: 'prev' | 'next') => {
    const groupLength = carouselGroups[carouselIndex].length;
    if (groupLength <= 1) return;

    setCurrentSlides(prev => {
      const newSlides = [...prev];
      if (direction === 'next') {
        newSlides[carouselIndex] = (newSlides[carouselIndex] + 1) % groupLength;
      } else {
        newSlides[carouselIndex] = (newSlides[carouselIndex] - 1 + groupLength) % groupLength;
      }
      return newSlides;
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-44 rounded-2xl animate-pulse bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {carouselGroups.map((group, carouselIndex) => {
        const currentItem = group[currentSlides[carouselIndex]];
        const defaultData = defaultCarousels[carouselIndex];
        const IconComponent = defaultData.icon;
        
        // Используем кастомные данные если есть, иначе дефолтные
        const displayData = currentItem || {
          title: defaultData.title,
          description: defaultData.description,
          buttonText: defaultData.buttonText,
          imageUrl: `https://images.unsplash.com/photo-${carouselIndex === 0 ? '1573164713714-d95e436ab8d6' : carouselIndex === 1 ? '1581092335397-9583eb92d232' : '1556742049-0ca65d6fa6c9'}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
        };

        return (
          <div
            key={carouselIndex}
            onClick={() => handleCarouselClick(carouselIndex)}
            className="relative h-44 rounded-2xl p-6 text-white overflow-hidden shadow-2xl cursor-pointer hover:shadow-3xl transition-all duration-300"
            style={{ height: '176px' }}
          >
            <div 
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${defaultData.gradient} bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out`}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%), url('${displayData.imageUrl}')`
              }}
            />
            
            {/* Навигационные кнопки */}
            {group.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateSlide(carouselIndex, 'prev');
                  }}
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateSlide(carouselIndex, 'next');
                  }}
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </>
            )}
            
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-2">
              <h2 className="text-xl font-bold text-white">
                {displayData.title}
              </h2>
              <p className="text-sm leading-relaxed opacity-90 text-white">
                {displayData.description}
              </p>
              <div className="mt-2">
                <span 
                  className="px-3 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: carouselIndex === 0 ? '#059669' : carouselIndex === 1 ? '#dc2626' : '#2563eb'
                  }}
                >
                  <IconComponent className="w-3 h-3" />
                  {displayData.buttonText} →
                </span>
              </div>
            </div>

            {/* Индикаторы слайдов */}
            {group.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {group.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlides[carouselIndex] 
                        ? 'bg-white' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlides(prev => {
                        const newSlides = [...prev];
                        newSlides[carouselIndex] = index;
                        return newSlides;
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}