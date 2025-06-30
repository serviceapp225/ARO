import { useState, useEffect } from "react";
import { Car, Users, Gift, Star, Crown, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PremiumBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    {
      id: 1,
      title: "Эксклюзивные аукционы",
      subtitle: "Уникальные автомобили от проверенных дилеров",
      description: "Лимитированные модели, классические авто и редкие экземпляры",
      icon: <Crown className="w-8 h-8" />,
      buttonText: "Посмотреть эксклюзив",
      gradient: "from-purple-600 to-blue-700",
      bgImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "Премиум автомобили",
      subtitle: "Для истинных ценителей качества",
      description: "BMW, Mercedes, Audi и другие премиальные бренды",
      icon: <Star className="w-8 h-8" />,
      buttonText: "Смотреть премиум",
      gradient: "from-blue-600 to-indigo-700", 
      bgImage: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      title: "Приведи друга - получи подарок",
      subtitle: "Зарабатывай на рефералах",
      description: "1000 сомони за каждого активного друга",
      icon: <Gift className="w-8 h-8" />,
      buttonText: "Пригласить друга",
      gradient: "from-emerald-600 to-green-700",
      bgImage: "https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  // Автоматическое переключение каждые 5 секунд
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentBanner = bannerSlides[currentSlide];

  return (
    <div className="w-full">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-52 overflow-hidden">
            <div
              className={`relative h-full bg-gradient-to-br ${currentBanner.gradient} transition-all duration-700`}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%), url('${currentBanner.bgImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-4 p-6">
                <div className="text-white opacity-90 mb-2">
                  {currentBanner.icon}
                </div>
                
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {currentBanner.title}
                </h2>
                
                <div className="mt-4">
                  <Button
                    className="px-4 py-1.5 bg-white text-gray-800 hover:bg-gray-100 font-bold rounded-full transition-all duration-300 inline-flex items-center gap-1 shadow-lg hover:shadow-xl tracking-wide text-sm"
                  >
                    {currentBanner.buttonText} →
                  </Button>
                </div>
              </div>
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-white'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}