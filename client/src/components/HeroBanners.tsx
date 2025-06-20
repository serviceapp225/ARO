import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Shield } from "lucide-react";
import { useLocation } from "wouter";

interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export function HeroBanners() {
  const [, setLocation] = useLocation();

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['/api/banners', 'main'],
    queryFn: async () => {
      const response = await fetch('/api/banners?position=main');
      if (!response.ok) throw new Error('Failed to fetch banners');
      return response.json();
    },
    staleTime: 5000, // 5 секунд - быстрое обновление
    refetchOnWindowFocus: true,
    refetchInterval: 10000 // Автообновление каждые 10 секунд
  });

  // Сортируем банеры по порядку и берем первые 3
  const mainBanners = banners
    .filter(b => b.position === 'main' && b.isActive)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  // Дефолтные банеры если нет в базе
  const defaultBanners = [
    {
      id: 0,
      title: "Продай свое авто",
      description: "Получи максимальную цену за свой автомобиль на нашем аукционе",
      imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=300&fit=crop",
      linkUrl: "/sell-car",
      order: 1
    },
    {
      id: 0,
      title: "Специальное предложение",
      description: "Скидка до 15% на комиссию при продаже автомобиля до конца месяца",
      imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=300&fit=crop",
      linkUrl: "/special-offer",
      order: 2
    },
    {
      id: 0,
      title: "Безопасные сделки",
      description: "Гарантия безопасности всех транзакций на платформе",
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=300&fit=crop",
      linkUrl: "/safety",
      order: 3
    }
  ];

  const displayBanners = mainBanners.length > 0 ? mainBanners : defaultBanners;

  const handleBannerClick = (banner: any, index: number) => {
    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith('http')) {
        window.open(banner.linkUrl, '_blank');
      } else {
        setLocation(banner.linkUrl);
      }
    } else {
      // Дефолтные действия
      switch (index) {
        case 0:
          setLocation('/sell-car');
          break;
        case 1:
          setLocation('/special-offer');
          break;
        case 2:
          setLocation('/safety');
          break;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-0">
                <div className="h-48 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Первый банер - "Продай свое авто" - темная тема */}
        {displayBanners[0] && (
          <Card 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleBannerClick(displayBanners[0], 0)}
          >
            <CardContent className="p-0">
              <div className="relative h-48 bg-black text-white">
                <img 
                  src={displayBanners[0].imageUrl} 
                  alt={displayBanners[0].title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-between p-8">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-3">{displayBanners[0].title}</h2>
                    <p className="text-lg opacity-90 mb-4">{displayBanners[0].description}</p>
                    <Button 
                      className="bg-white text-black hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBannerClick(displayBanners[0], 0);
                      }}
                    >
                      Начать продажу
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Второй банер - "Специальное предложение" - синий градиент */}
        {displayBanners[1] && (
          <Card 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleBannerClick(displayBanners[1], 1)}
          >
            <CardContent className="p-0">
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                <div className="absolute inset-0 flex items-center justify-between p-8">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-3">{displayBanners[1].title}</h2>
                    <p className="text-lg opacity-90 mb-4">{displayBanners[1].description}</p>
                    <Button 
                      variant="secondary"
                      className="bg-white text-blue-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBannerClick(displayBanners[1], 1);
                      }}
                    >
                      Продать авто
                    </Button>
                  </div>
                  {/* Декоративный круг */}
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full"></div>
                  </div>
                </div>
                {/* Индикаторы */}
                <div className="absolute bottom-4 left-8 flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white bg-opacity-50 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Третий банер - "Безопасные сделки" - светло-зеленый */}
        {displayBanners[2] && (
          <Card 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-green-200"
            onClick={() => handleBannerClick(displayBanners[2], 2)}
          >
            <CardContent className="p-0">
              <div className="relative h-16 bg-green-50 text-green-800 flex items-center px-8">
                <Shield className="h-6 w-6 text-green-600 mr-3" />
                <span className="font-semibold text-lg">{displayBanners[2].title}</span>
                {displayBanners[2].description && (
                  <span className="ml-4 text-green-600 hidden sm:inline">
                    - {displayBanners[2].description}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}