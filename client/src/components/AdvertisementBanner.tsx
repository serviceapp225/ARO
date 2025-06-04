import { useState, useEffect } from "react";
import { Car, Star, Trophy, Zap, Shield, Gift } from "lucide-react";

const bannerVariants = [
  {
    id: 1,
    gradient: "from-blue-600 to-purple-700",
    icon: Car,
    title: "ПРОДАЙ СВОЕ АВТО",
    subtitle: "По достойной цене\nбез посредников",
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
  },
  {
    id: 7,
    gradient: "from-emerald-600 to-cyan-700",
    icon: Car,
    title: "ПРОДАЙ ВЫГОДНО",
    subtitle: "Твое авто достойно\nлучшей цены на рынке",
    buttonText: "Оценить авто →",
    bgColor: "emerald-700"
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
      {/* Car Background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15">
        <svg className="w-80 h-40" viewBox="0 0 350 180" fill="none">
          {/* Sports Car Body */}
          <path d="M40 130 L55 105 L90 95 L150 90 L220 92 L280 100 L310 120 L320 140 L300 155 L280 150 L220 150 L150 150 L90 150 L55 150 Z" fill="white"/>
          
          {/* Wheels */}
          <circle cx="105" cy="150" r="15" fill="white"/>
          <circle cx="105" cy="150" r="10" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
          <circle cx="265" cy="150" r="15" fill="white"/>
          <circle cx="265" cy="150" r="10" fill="none" stroke="white" strokeWidth="2" opacity="0.8"/>
          
          {/* Car Roof Line */}
          <path d="M65 125 L95 110 L140 105 L200 107 L260 115 L290 130" stroke="white" strokeWidth="2" opacity="0.9"/>
          
          {/* Windows */}
          <path d="M110 115 L140 108 L180 106 L220 108 L250 118 L240 125 L200 125 L140 125 Z" fill="white" opacity="0.7"/>
          
          {/* Windshield */}
          <path d="M75 125 L105 112 L140 110 L135 125 L100 128 Z" fill="white" opacity="0.6"/>
          
          {/* Headlights */}
          <ellipse cx="45" cy="125" rx="6" ry="10" fill="white" opacity="0.9"/>
          <ellipse cx="315" cy="135" rx="4" ry="6" fill="white" opacity="0.8"/>
          
          {/* Side Details */}
          <path d="M70 135 L90 130 L150 128 L220 130 L280 135" stroke="white" strokeWidth="1" opacity="0.6"/>
          <path d="M80 140 L100 138 L160 136 L230 138 L270 142" stroke="white" strokeWidth="1" opacity="0.5"/>
        </svg>
      </div>
      
      {/* Icon overlay */}
      <div className="absolute right-[-10px] top-[-5px] opacity-20">
        <IconComponent className="w-20 h-20 text-white" />
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