import { useState, useEffect } from "react";
import { Car, Star, Trophy, Zap, Shield, Gift } from "lucide-react";

// Function to get banner images
const getBannerImage = (bannerId: number) => {
  const images = [
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Blue sports car
    'https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Green SUV
    'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Orange/red car
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Purple luxury car
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Indigo classic car
    'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Yellow car
    'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'  // Emerald car
  ];
  return images[(bannerId - 1) % images.length];
};

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
    <div className="relative h-44 rounded-2xl p-6 text-white overflow-hidden transition-all duration-500 shadow-2xl">
      {/* Dynamic Car Background Images */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl transition-all duration-500"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')`
        }}
      ></div>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl"></div>
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