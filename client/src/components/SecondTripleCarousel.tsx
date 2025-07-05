import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, Award, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface DefaultCarouselData {
  title: string;
  description: string;
  buttonText: string;
  gradient: string;
  icon: typeof Users;
}

export function SecondTripleCarousel() {
  const [currentSlides, setCurrentSlides] = useState([0, 0, 0]);

  const { data: carouselData, isLoading } = useQuery<SecondCarouselItem[]>({
    queryKey: ['/api/second-carousel'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Дефолтные данные для каждой карусели
  const defaultCarousels: DefaultCarouselData[] = [
    {
      title: "Приведи друга",
      description: "Получи бонус 500 сомони за каждого друга, который купит автомобиль через платформу",
      buttonText: "Пригласить друга",
      gradient: "from-purple-600 to-pink-600",
      icon: Users
    },
    {
      title: "Горячие аукционы",
      description: "Не упусти последние часы торгов! Самые популярные автомобили со скидкой до 30%",
      buttonText: "Смотреть аукционы",
      gradient: "from-orange-500 to-red-600",
      icon: TrendingUp
    },
    {
      title: "Стань экспертом",
      description: "Изучи курс оценщика автомобилей и зарабатывай 5000+ сомони в месяц",
      buttonText: "Начать обучение",
      gradient: "from-blue-600 to-indigo-600",
      icon: Award
    }
  ];

  // Группируем данные по номеру карусели
  const carouselGroups = [[], [], []] as SecondCarouselItem[][];
  
  if (carouselData) {
    carouselData.forEach(item => {
      if (item.isActive && item.carouselNumber >= 1 && item.carouselNumber <= 3) {
        carouselGroups[item.carouselNumber - 1].push(item);
      }
    });
    
    // Сортируем каждую группу по order
    carouselGroups.forEach(group => {
      group.sort((a, b) => a.order - b.order);
    });
  }

  // Автоматическое переключение для каждой карусели
  useEffect(() => {
    const intervals = carouselGroups.map((group, index) => {
      if (group.length > 1) {
        const interval = (4 + index) * 1000; // 4s, 5s, 6s для каждой карусели
        return setInterval(() => {
          setCurrentSlides(prev => {
            const newSlides = [...prev];
            newSlides[index] = (newSlides[index] + 1) % group.length;
            return newSlides;
          });
        }, interval);
      }
      return null;
    });

    return () => {
      intervals.forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [carouselData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Специальные предложения</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map((carouselIndex) => {
        const group = carouselGroups[carouselIndex] || [];
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
            className="relative bg-white/10 backdrop-blur-sm rounded-2xl h-32 overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url(${displayData.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onClick={() => {
              if (currentItem && currentItem.linkUrl) {
                window.location.href = currentItem.linkUrl;
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
              <div className="h-full flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="w-4 h-4 text-white/90" />
                    <h3 className="text-sm font-bold text-white">{displayData.title}</h3>
                  </div>
                  <p className="text-xs text-white/90 leading-tight line-clamp-2">
                    {displayData.description}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <button className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full hover:bg-white/30 transition-colors whitespace-nowrap">
                    {displayData.buttonText}
                  </button>
                  
                  {group.length > 1 && (
                    <div className="flex gap-1">
                      {group.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentSlides[carouselIndex] ? 'bg-white' : 'bg-white/40'
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
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}