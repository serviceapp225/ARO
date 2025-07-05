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
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });

  console.log('SecondTripleCarousel rendering, isLoading:', isLoading, 'data:', carouselData);

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
      description: "Пройди курс оценки автомобилей и зарабатывай на экспертизе до 200$ в месяц",
      buttonText: "Начать обучение",
      gradient: "from-blue-600 to-indigo-600",
      icon: Award
    }
  ];

  // Группировка данных по каруселям
  const carouselGroups = [
    carouselData?.filter(item => item.carouselNumber === 1 && item.isActive) || [],
    carouselData?.filter(item => item.carouselNumber === 2 && item.isActive) || [],
    carouselData?.filter(item => item.carouselNumber === 3 && item.isActive) || []
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
        window.location.href = currentItem.linkUrl;
      }
    } else {
      // Дефолтные ссылки для каждой карусели
      const defaultUrls = ['/invite', '/auctions', '/expert'];
      window.location.href = defaultUrls[carouselIndex];
    }
  };

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
    <div className="space-y-4 bg-red-100 border-4 border-red-500 p-4">
      <h2 className="text-2xl font-bold text-red-800 mb-4">🔴 ВТОРОЙ БАННЕР - Специальные предложения</h2>
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
                      setCurrentSlides(prev => {
                        const newSlides = [...prev];
                        newSlides[carouselIndex] = newSlides[carouselIndex] === 0 ? group.length - 1 : newSlides[carouselIndex] - 1;
                        return newSlides;
                      });
                    }}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlides(prev => {
                        const newSlides = [...prev];
                        newSlides[carouselIndex] = (newSlides[carouselIndex] + 1) % group.length;
                        return newSlides;
                      });
                    }}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </>
              )}
              
              {/* Контент */}
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {displayData.title}
                  </h3>
                </div>
                
                <p className="text-white/90 text-sm mb-4 flex-1">
                  {displayData.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-xs bg-white/10 px-2 py-1 rounded">
                    {displayData.buttonText}
                  </span>
                  
                  {/* Индикаторы слайдов */}
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
          );
        })}
      </div>
    </div>
  );
}