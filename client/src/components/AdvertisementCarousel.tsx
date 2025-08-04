import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Phone, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ReferralModal } from './ReferralModal';

// Глобальный кэш состояний загрузки изображений
const globalImageCache = new Map<string, 'loading' | 'loaded' | 'error'>();
const globalPreloadedImages = new Set<string>();
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdvertisementItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  rotationImage1?: string;
  rotationImage2?: string;
  rotationImage3?: string;
  rotationImage4?: string;
  rotationInterval?: number;
  linkUrl: string;
  buttonText: string;
  isActive: boolean;
  order: number;
}

export function AdvertisementCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [, setLocation] = useLocation();

  const { data: advertisements = [], isLoading } = useQuery<AdvertisementItem[]>({
    queryKey: ['/api/advertisement-carousel'],
    staleTime: 30 * 1000, // 30 секунд - оптимизированное кэширование
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
    refetchOnWindowFocus: false, // Не обновляем при фокусе
    refetchOnMount: true, // Обновляем при монтировании
  });

  // Фильтруем только активные объявления и сортируем по порядку
  const activeAds = advertisements
    .filter(ad => ad.isActive)
    .sort((a, b) => a.order - b.order);

  const currentAd = activeAds[currentSlide];

  // Функция для получения массива изображений для ротации
  const getRotationImages = (ad: AdvertisementItem): string[] => {
    const images: string[] = [ad.imageUrl]; // Основное изображение всегда первое
    
    if (ad.rotationImage1) images.push(ad.rotationImage1);
    if (ad.rotationImage2) images.push(ad.rotationImage2);
    if (ad.rotationImage3) images.push(ad.rotationImage3);
    if (ad.rotationImage4) images.push(ad.rotationImage4);
    
    return images;
  };

  // Получаем текущее изображение для отображения
  const getCurrentImage = (): string => {
    if (!currentAd) return '';
    const images = getRotationImages(currentAd);
    return images[currentImageIndex % images.length] || currentAd.imageUrl;
  };

  // Логирование загрузки карусели для отладки
  console.log('🎠 Активные объявления карусели:', activeAds.length);
  
  // Проверяем URL изображения при наличии
  if (activeAds.length > 0 && activeAds[0].imageUrl) {
    console.log('🔗 Загружаем изображение карусели:', activeAds[0].imageUrl);
  }

  // Локальное состояние для принудительного рендера при изменении кэша
  const [, forceUpdate] = useState({});

  // Функция для получения состояния загрузки из глобального кэша
  const getImageLoadState = (imageUrl: string): 'loading' | 'loaded' | 'error' | 'none' => {
    return globalImageCache.get(imageUrl) || 'none';
  };

  // Глобальная предзагрузка изображений с постоянным кэшированием
  useEffect(() => {
    activeAds.forEach((ad) => {
      // Предзагрузка основного изображения и всех изображений ротации
      const allImages = getRotationImages(ad);
      
      allImages.forEach((imageUrl) => {
        if (imageUrl && !globalPreloadedImages.has(imageUrl)) {
          // Отмечаем как предзагружаемое
          globalPreloadedImages.add(imageUrl);
          
          // Проверяем, есть ли уже в кэше
          if (!globalImageCache.has(imageUrl)) {
            globalImageCache.set(imageUrl, 'loading');
            
            const img = new Image();
            img.onload = () => {
              globalImageCache.set(imageUrl, 'loaded');
              forceUpdate({}); // Принудительно обновляем компонент
            };
            img.onerror = () => {
              globalImageCache.set(imageUrl, 'error');
              forceUpdate({}); // Принудительно обновляем компонент
            };
            
            // Добавляем кэш-заголовки для браузера и предзагружаем
            img.crossOrigin = 'anonymous';
            img.loading = 'eager'; // Загружать сразу
            img.src = imageUrl;
          }
        }
      });
    });
  }, [activeAds]);

  // Дополнительная предзагрузка при монтировании компонента
  useEffect(() => {
    // Предзагружаем изображения заранее для мгновенного отображения
    activeAds.forEach((ad) => {
      if (ad.imageUrl && getImageLoadState(ad.imageUrl) === 'none') {
        // Создаем link элемент для браузерного предзагрузки
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = ad.imageUrl;
        document.head.appendChild(link);
        
        // Убираем link через 5 секунд
        setTimeout(() => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        }, 5000);
      }
    });
  }, []);

  // Автоматическое переключение слайдов каждые 5 секунд
  useEffect(() => {
    if (activeAds.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeAds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeAds.length, isPaused]);

  // Автоматическая ротация изображений внутри текущего слайда
  useEffect(() => {
    if (!currentAd || isPaused) return;

    const images = getRotationImages(currentAd);
    if (images.length <= 1) return; // Нет дополнительных изображений для ротации

    const interval = (currentAd.rotationInterval || 3) * 1000;
    const rotationInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(rotationInterval);
  }, [currentAd, isPaused]);

  // Сброс индекса изображения при смене слайда
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentSlide]);

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

  const handleSupportClick = () => {
    setShowSupportModal(true);
  };

  const handlePhoneCall = () => {
    window.location.href = 'tel:+992903331332';
    setShowSupportModal(false);
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/992903331332', '_blank');
    setShowSupportModal(false);
  };

  const handleClick = () => {
    // Проверяем, это ли реферальная карточка
    if (currentAd?.title.includes('друга') || currentAd?.title.includes('1000 Сомони')) {
      setShowReferralModal(true);
      return;
    }
    
    // Проверяем, это ли карточка поддержки
    if (currentAd?.title.includes('помощь') || currentAd?.title.includes('Поддержка')) {
      // Показываем модальное окно с вариантами связи
      handleSupportClick();
      return;
    }
    
    if (currentAd?.linkUrl) {
      let url = currentAd.linkUrl.trim();
      
      // Если это телефонная ссылка (tel:), открываем в системе
      if (url.startsWith('tel:')) {
        console.log('📞 Телефонная ссылка карусели:', url);
        window.location.href = url;
        return;
      }
      
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

  // Проверяем состояние изображения для отладки
  if (currentAd) {
    const imageState = getImageLoadState(currentAd.imageUrl);
    if (imageState === 'error') {
      console.warn('⚠️ Ошибка загрузки изображения карусели:', currentAd.imageUrl);
    }
  }

  return (
    <div 
      className="relative h-44 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleClick}
    >
      {/* Overlay slide system */}
      <div className="relative h-full">
        {activeAds.map((ad, index) => (
          <div
            key={ad.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentSlide 
                ? 'translate-x-0 opacity-100' 
                : index < currentSlide 
                  ? '-translate-x-full opacity-0' 
                  : 'translate-x-full opacity-0'
            }`}
          >
            <div className="relative h-full p-6 text-white">
              {/* Background Image with Loading State - Приоритетная загрузка */}
              <div 
                className={`absolute inset-0 rounded-2xl bg-cover bg-center bg-no-repeat transition-opacity duration-200 ${
                  getImageLoadState(getCurrentImage()) === 'loaded' 
                    ? 'opacity-100' 
                    : getImageLoadState(getCurrentImage()) === 'error'
                    ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 opacity-100'
                    : 'bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 opacity-60'
                }`}
                style={{
                  backgroundImage: getImageLoadState(getCurrentImage()) === 'loaded' ? `url('${getCurrentImage()}')` : undefined,
                }}
              />
              
              {/* Loading Indicator */}
              {getImageLoadState(ad.imageUrl) === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin opacity-75"></div>
                </div>
              )}
              
              {/* Minimal dark overlay for text readability */}
              <div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 100%)',
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-3">
                <h2 className="text-2xl font-bold drop-shadow-lg text-white text-center max-w-md leading-tight">
                  {ad.title}
                </h2>
                {ad.description && (
                  <p className="text-base leading-relaxed opacity-95 drop-shadow-md max-w-md text-white text-center">
                    {ad.description}
                  </p>
                )}
                {ad.linkUrl && (
                  <div className="mt-4">
                    <span className="px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-1 min-w-[180px] justify-center shadow-lg hover:shadow-xl transform hover:scale-105 bg-white text-blue-600">
                      {ad.buttonText}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 blur-xl"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 rounded-full bg-white/5 blur-lg"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Кнопки навигации */}
      {activeAds.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/30 text-white opacity-0 hover:opacity-100 transition-all duration-300"
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
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/30 text-white opacity-0 hover:opacity-100 transition-all duration-300"
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
      
      
      {/* Модальное окно реферальной системы */}
      <ReferralModal 
        isOpen={showReferralModal} 
        onClose={() => setShowReferralModal(false)} 
      />
      
      {/* Модальное окно поддержки */}
      <AlertDialog open={showSupportModal} onOpenChange={(open) => {
        if (!open) {
          setShowSupportModal(false);
        }
      }}>
        <AlertDialogContent 
          className="sm:max-w-[425px]"
          onClick={(e) => e.stopPropagation()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">Свяжитесь с нами</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Выберите удобный способ связи с нашей службой поддержки
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2">
            <Button 
              onClick={handlePhoneCall}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="mr-2 h-4 w-4" />
              Позвонить
            </Button>
            <Button 
              onClick={handleWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSupportModal(false);
              }}
              variant="outline"
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Отмена
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}