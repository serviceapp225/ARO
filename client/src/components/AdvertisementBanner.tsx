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
      {/* Sports Car Background Image */}
      <div 
        className="absolute right-0 top-0 w-full h-full opacity-25 bg-cover bg-center bg-no-repeat rounded-2xl"
        style={{
          backgroundImage: `url('data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" fill="none">
              <defs>
                <linearGradient id="sportsCarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:rgba(255,255,255,0.9)" />
                  <stop offset="50%" style="stop-color:rgba(255,255,255,0.7)" />
                  <stop offset="100%" style="stop-color:rgba(255,255,255,0.5)" />
                </linearGradient>
              </defs>
              
              <!-- Sports Car Silhouette -->
              <path d="M80 200 L100 160 L140 140 L200 130 L300 128 L400 135 L480 155 L520 185 L500 220 L480 215 L400 215 L300 215 L200 215 L140 215 L100 215 Z" fill="url(#sportsCarGradient)"/>
              
              <!-- Low Profile Wheels -->
              <circle cx="180" cy="215" r="25" fill="rgba(255,255,255,0.95)"/>
              <circle cx="180" cy="215" r="18" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3"/>
              <circle cx="420" cy="215" r="25" fill="rgba(255,255,255,0.95)"/>
              <circle cx="420" cy="215" r="18" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3"/>
              
              <!-- Sporty Roof Line -->
              <path d="M110 180 L150 155 L220 145 L320 143 L420 150 L470 175" stroke="rgba(255,255,255,0.9)" stroke-width="4"/>
              
              <!-- Sleek Windows -->
              <path d="M160 165 L200 150 L280 148 L360 150 L420 165 L400 180 L320 180 L200 180 Z" fill="rgba(255,255,255,0.7)"/>
              
              <!-- Angular Windshield -->}
              <path d="M120 185 L160 160 L200 155 L195 185 L150 190 Z" fill="rgba(255,255,255,0.6)"/>
              
              <!-- Aggressive Headlights -->
              <polygon points="90,185 110,175 115,190 95,195" fill="rgba(255,255,255,0.95)"/>
              <polygon points="505,195 515,185 520,200 510,205" fill="rgba(255,255,255,0.9)"/>
              
              <!-- Sport Grille -->
              <rect x="70" y="180" width="25" height="20" fill="rgba(255,255,255,0.9)"/>
              <line x1="73" y1="184" x2="92" y2="184" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
              <line x1="73" y1="190" x2="92" y2="190" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
              <line x1="73" y1="196" x2="92" y2="196" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>
              
              <!-- Aerodynamic Side Lines -->
              <path d="M110 190 L140 185 L220 182 L340 185 L450 195" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
              <path d="M130 200 L160 198 L240 196 L360 198 L430 202" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
            </svg>
          `)}`
        }}
      ></div>
      
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