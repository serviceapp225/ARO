import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Percent, Gift, Crown } from 'lucide-react';

interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  buttonText: string;
  offerType: number; // 1 = Скидки, 2 = Акции, 3 = Премиум услуги
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function SpecialOffersCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Загрузка специальных предложений
  const { data: offers = [], isLoading } = useQuery<SpecialOffer[]>({
    queryKey: ['/api/special-offers'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Группировка предложений по типам
  const groupedOffers = {
    1: offers.filter(offer => offer.offerType === 1 && offer.isActive), // Скидки
    2: offers.filter(offer => offer.offerType === 2 && offer.isActive), // Акции
    3: offers.filter(offer => offer.offerType === 3 && offer.isActive)  // Премиум услуги
  };

  // Автоматическая ротация слайдов
  useEffect(() => {
    if (offers.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 4000); // Переключение каждые 4 секунды

    return () => clearInterval(interval);
  }, [offers.length]);

  const getIcon = (type: number) => {
    switch (type) {
      case 1: return <Percent className="h-6 w-6" />;
      case 2: return <Gift className="h-6 w-6" />;
      case 3: return <Crown className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getGradient = (type: number) => {
    switch (type) {
      case 1: return 'from-red-500 to-pink-600'; // Скидки - красный градиент
      case 2: return 'from-green-500 to-emerald-600'; // Акции - зеленый градиент  
      case 3: return 'from-purple-500 to-indigo-600'; // Премиум - фиолетовый градиент
      default: return 'from-blue-500 to-cyan-600';
    }
  };

  const getTypeName = (type: number) => {
    switch (type) {
      case 1: return 'Скидки';
      case 2: return 'Акции';
      case 3: return 'Премиум услуги';
      default: return 'Предложения';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full mb-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return null; // Не показываем карусель если нет предложений
  }

  const renderOfferCard = (type: number) => {
    const typeOffers = groupedOffers[type as keyof typeof groupedOffers];
    const offer = typeOffers[0]; // Берем первое активное предложение этого типа
    
    if (!offer) {
      // Показываем заглушку если нет предложений этого типа
      return (
        <Card className="h-full">
          <CardContent className={`p-6 h-full flex flex-col justify-between bg-gradient-to-r ${getGradient(type)} text-white`}>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                {getIcon(type)}
              </div>
              <h3 className="text-lg font-bold mb-2">{getTypeName(type)}</h3>
              <p className="text-sm opacity-90">Скоро появятся новые предложения</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
              disabled
            >
              Ожидается
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="h-full transform transition-transform duration-300 hover:scale-105">
        <CardContent className={`p-6 h-full flex flex-col justify-between bg-gradient-to-r ${getGradient(type)} text-white`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getIcon(type)}
                <span className="text-sm font-medium opacity-90">{getTypeName(type)}</span>
              </div>
              {offer.order > 0 && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  #{offer.order}
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-bold mb-2 line-clamp-2">{offer.title}</h3>
            <p className="text-sm opacity-90 line-clamp-3 mb-4">{offer.description}</p>
          </div>
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => {
              if (offer.linkUrl) {
                window.open(offer.linkUrl, '_blank');
              }
            }}
            disabled={!offer.linkUrl}
          >
            {offer.buttonText}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Специальные предложения
        </h2>
        <p className="text-gray-600 text-center mt-2">
          Эксклюзивные возможности для наших клиентов
        </p>
      </div>

      {/* Карусель из трех типов предложений */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((type) => (
          <div key={type}>
            {renderOfferCard(type)}
          </div>
        ))}
      </div>

      {/* Индикаторы слайдов */}
      <div className="flex justify-center mt-6 space-x-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-blue-600 scale-110'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Счетчик активных предложений */}
      {offers.length > 0 && (
        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">
            Всего активных предложений: {offers.length}
          </span>
        </div>
      )}
    </div>
  );
}