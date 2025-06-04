import { useState, useEffect } from "react";
import { Car, Star, Trophy, Zap, Shield, Gift } from "lucide-react";

const bannerVariants = [
  {
    id: 1,
    gradient: "from-blue-600 to-purple-700",
    icon: Car,
    title: "БЫСТРАЯ ПРОДАЖА",
    subtitle: "Продайте авто за 24 часа\nбез лишних хлопот",
    buttonText: "Продать сейчас →",
    bgColor: "blue-700"
  },
  {
    id: 2,
    gradient: "from-green-600 to-teal-700",
    icon: Shield,
    title: "ГАРАНТИЯ КАЧЕСТВА",
    subtitle: "Проверенные автомобили\nс полной историей",
    buttonText: "Смотреть каталог →",
    bgColor: "green-700"
  },
  {
    id: 3,
    gradient: "from-orange-600 to-red-700",
    icon: Trophy,
    title: "ЛУЧШИЕ ЦЕНЫ",
    subtitle: "Самые выгодные предложения\nна рынке авто",
    buttonText: "Найти авто →",
    bgColor: "orange-700"
  },
  {
    id: 4,
    gradient: "from-purple-600 to-pink-700",
    icon: Star,
    title: "VIP АУКЦИОНЫ",
    subtitle: "Эксклюзивные автомобили\nдля особых клиентов",
    buttonText: "Участвовать →",
    bgColor: "purple-700"
  },
  {
    id: 5,
    gradient: "from-indigo-600 to-blue-700",
    icon: Zap,
    title: "БЫСТРЫЙ СТАРТ",
    subtitle: "Регистрируйтесь и получите\nбонус на первую покупку",
    buttonText: "Получить бонус →",
    bgColor: "indigo-700"
  },
  {
    id: 6,
    gradient: "from-yellow-600 to-orange-700",
    icon: Gift,
    title: "АКЦИЯ МЕСЯЦА",
    subtitle: "Скидка 5% на все\nпремиум автомобили",
    buttonText: "Узнать больше →",
    bgColor: "yellow-700"
  }
];

export function AdvertisementBanner() {
  const [currentBanner, setCurrentBanner] = useState(bannerVariants[0]);

  useEffect(() => {
    // Change banner every 5 seconds
    const interval = setInterval(() => {
      setCurrentBanner(prev => {
        const currentIndex = bannerVariants.findIndex(b => b.id === prev.id);
        const nextIndex = (currentIndex + 1) % bannerVariants.length;
        return bannerVariants[nextIndex];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const IconComponent = currentBanner.icon;

  return (
    <div className={`relative h-44 bg-gradient-to-br ${currentBanner.gradient} rounded-2xl p-6 text-white overflow-hidden transition-all duration-500`}>
      <div className="absolute right-[-20px] top-[-10px]">
        <IconComponent className="w-28 h-28 text-white opacity-20" />
      </div>
      <div className="relative z-10 space-y-2">
        <h2 className="text-2xl font-bold">{currentBanner.title}</h2>
        <p className="text-white/80 text-base leading-relaxed whitespace-pre-line">
          {currentBanner.subtitle}
        </p>
        <div className="mt-4">
          <span className={`bg-white text-${currentBanner.bgColor} px-4 py-2 rounded-full text-sm font-bold`}>
            {currentBanner.buttonText}
          </span>
        </div>
      </div>
      
      {/* Indicator dots */}
      <div className="absolute bottom-4 left-6 flex space-x-2">
        {bannerVariants.map((banner) => (
          <div
            key={banner.id}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              banner.id === currentBanner.id ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}