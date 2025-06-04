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
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10">
        <svg className="w-80 h-40" viewBox="0 0 320 160" fill="none">
          <path d="M40 120 L60 95 L120 85 L180 90 L230 95 L270 115 L300 135 L270 150 L230 145 L180 145 L120 145 L60 145 Z" fill="white"/>
          <circle cx="100" cy="145" r="12" fill="white"/>
          <circle cx="230" cy="145" r="12" fill="white"/>
          <path d="M70 110 L105 100 L165 95 L225 100 L260 120" stroke="white" strokeWidth="2"/>
          <rect x="115" y="100" width="30" height="20" fill="white" opacity="0.7"/>
          <rect x="165" y="100" width="30" height="20" fill="white" opacity="0.7"/>
          <path d="M80 120 L90 110 L110 105 L130 110 L140 120" fill="white" opacity="0.8"/>
          <path d="M200 120 L210 110 L230 105 L250 110 L260 120" fill="white" opacity="0.8"/>
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