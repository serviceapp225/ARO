import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ReferralModal } from './ReferralModal';

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
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [, setLocation] = useLocation();

  const { data: advertisements = [], isLoading } = useQuery<AdvertisementItem[]>({
    queryKey: ['/api/advertisement-carousel'],
    staleTime: 10 * 1000, // 10 секунд - быстрое обновление для админ изменений
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
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

  const handleClick = () => {
    // Проверяем, это ли реферальная карточка
    if (currentAd?.title.includes('друга') || currentAd?.title.includes('1000 Сомони')) {
      setShowReferralModal(true);
      return;
    }
    
    if (currentAd?.linkUrl) {
      let url = currentAd.linkUrl.trim();
      
      // Если это внешняя ссылка (начинается с http), открываем в новой вкладке
      if (url.startsWith('http')) {
        console.log('🔗 Внешняя ссылка карусели:', url);
        window.open(url, '_blank');
        return;
      }
      
      // Для внутренних ссылок добавляем / если нужно
      if (!url.startsWith('/')) {
        url = `/${url}`;
      }
      
      // Проверяем, что это валидный внутренний роут
      const validRoutes = ['/', '/home', '/auctions', '/favorites', '/sell', '/bids', '/profile', '/notifications', '/my-alerts', '/user-data', '/my-sales', '/terms', '/privacy', '/login', '/admin', '/special-offers'];
      
      if (validRoutes.includes(url)) {
        console.log('🔗 Внутренняя навигация карусели:', url);
        setLocation(url);
      } else {
        console.log('❌ Неверный роут карусели:', url, 'Перенаправляем на главную');
        setLocation('/');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-44 rounded-2xl animate-pulse bg-gray-200 dark:bg-gray-700"></div>
    );
  }

  if (activeAds.length === 0) {
    return null;
  }

  const currentAd = activeAds[currentSlide];

  return (
    <div 
      className="relative h-44 rounded-2xl p-6 text-white overflow-hidden cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleClick}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 rounded-2xl bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${currentAd.imageUrl}')`,
        }}
      />
      
      {/* Minimal dark overlay for text readability */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 100%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-3">
        {/* Специальное оформление для реферальной рекламы */}
        {(currentAd.title.includes('друга') || currentAd.title.includes('1000 Сомони')) ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-extrabold text-green-600 text-center max-w-md leading-tight mb-2">
              {currentAd.title}
            </h2>
            <div className="text-sm text-gray-700 font-medium">
              🎁 Реферальная программа AUTOBID.TJ
            </div>
          </div>
        ) : (
          <h2 className="text-2xl font-bold drop-shadow-lg text-white text-center max-w-md leading-tight">
            {currentAd.title}
          </h2>
        )}
        {currentAd.description && (
          <p className="text-base leading-relaxed opacity-95 drop-shadow-md max-w-md text-white text-center">
            {currentAd.description}
          </p>
        )}
        {currentAd.linkUrl && (
          <div className="mt-4">
            {(currentAd.title.includes('друга') || currentAd.title.includes('1000 Сомони')) ? (
              <span className="px-6 py-3 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-2 min-w-[200px] justify-center shadow-xl hover:shadow-2xl transform hover:scale-105 bg-gradient-to-r from-green-500 to-green-600 text-white">
                🤝 {currentAd.buttonText}
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-1 min-w-[180px] justify-center shadow-lg hover:shadow-xl transform hover:scale-105 bg-white text-blue-600">
                {currentAd.buttonText}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 rounded-full bg-white/5 blur-lg"></div>
      
      {/* Кнопки навигации */}
      {activeAds.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/30 text-white opacity-0 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/30 text-white opacity-0 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

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
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
            />
          ))}
        </div>
      )}
      
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 rounded-full bg-white/5 blur-lg"></div>
      
      {/* Модальное окно реферальной системы */}
      <ReferralModal 
        isOpen={showReferralModal} 
        onClose={() => setShowReferralModal(false)} 
      />
    </div>
  );
}