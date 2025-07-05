import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface CarouselItem {
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

export function SellCarTripleCarousel() {
  const [, setLocation] = useLocation();
  const [currentSlides, setCurrentSlides] = useState([0, 0, 0]); // текущий слайд для каждой карусели
  
  // Загружаем данные каруселей
  const { data: carouselItems = [], isLoading } = useQuery<CarouselItem[]>({
    queryKey: ['/api/sell-car-carousel'],
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });

  // Группируем элементы по номеру карусели
  const carouselGroups = [
    carouselItems.filter(item => item.carouselNumber === 1 && item.isActive).sort((a, b) => a.order - b.order),
    carouselItems.filter(item => item.carouselNumber === 2 && item.isActive).sort((a, b) => a.order - b.order),
    carouselItems.filter(item => item.carouselNumber === 3 && item.isActive).sort((a, b) => a.order - b.order),
  ];

  // Автоматическое переключение слайдов каждые 5 секунд
  useEffect(() => {
    const intervals = carouselGroups.map((group, carouselIndex) => {
      if (group.length <= 1) return null;
      
      return setInterval(() => {
        setCurrentSlides(prev => {
          const newSlides = [...prev];
          newSlides[carouselIndex] = (newSlides[carouselIndex] + 1) % group.length;
          return newSlides;
        });
      }, 5000 + carouselIndex * 1000); // Смещение для каждой карусели
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
      // Дефолтная ссылка на продажу авто
      setLocation('/sell');
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
        
        // Если нет элементов в группе, показываем дефолтный баннер "Продай свое авто"
        if (!currentItem) {
          return (
            <div
              key={carouselIndex}
              onClick={() => setLocation('/sell')}
              className="relative h-44 rounded-2xl p-6 text-white overflow-hidden shadow-2xl cursor-pointer hover:shadow-3xl transition-all duration-300"
              style={{ height: '176px' }}
            >
              <div 
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%), url('https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')`
                }}
              />
              
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-2">
                <h2 className="text-xl font-bold text-white">
                  Продай свое авто
                </h2>
                <p className="text-sm leading-relaxed opacity-90 text-white">
                  Получи максимальную цену
                </p>
                <div className="mt-2">
                  <span 
                    className="px-3 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: '#059669' 
                    }}
                  >
                    <Plus className="w-3 h-3" />
                    Начать продажу →
                  </span>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={carouselIndex}
            onClick={() => handleCarouselClick(carouselIndex)}
            className="relative h-44 rounded-2xl p-6 text-white overflow-hidden shadow-2xl cursor-pointer hover:shadow-3xl transition-all duration-300"
            style={{ height: '176px' }}
          >
            <div 
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%), url('${currentItem.imageUrl}')`
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
                {currentItem.title}
              </h2>
              <p className="text-sm leading-relaxed opacity-90 text-white">
                {currentItem.description}
              </p>
              <div className="mt-2">
                <span 
                  className="px-3 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: '#059669' 
                  }}
                >
                  <Plus className="w-3 h-3" />
                  {currentItem.buttonText} →
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