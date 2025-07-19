import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

interface SellCarSectionData {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  backgroundImageUrl: string;
  linkUrl: string;
  isActive: boolean;
  overlayOpacity: number;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

export function SellCarSection() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: section, isLoading } = useQuery<SellCarSectionData>({
    queryKey: ['/api/sell-car-section'],
    queryFn: async () => {
      const response = await fetch('/api/sell-car-section');
      if (!response.ok) throw new Error('Failed to fetch sell car section');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes stale time
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if cached
  });

  // Default fallback data
  const defaultSection = {
    title: "Продай свое авто",
    subtitle: "Получи максимальную цену за свой автомобиль на нашем аукционе",
    buttonText: "Начать продажу",
    backgroundImageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    linkUrl: "/sell",
    isActive: true,
    overlayOpacity: 40,
    textColor: "#ffffff",
    buttonColor: "#ffffff",
    buttonTextColor: "#059669"
  };

  // Function to convert color names to hex or return as is
  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      'white': '#ffffff',
      'black': '#000000',
      'emerald-700': '#059669',
      'emerald-600': '#059669',
      'blue-600': '#2563eb',
      'red-600': '#dc2626',
      'green-600': '#16a34a',
      'gray-800': '#1f2937',
      'gray-900': '#111827'
    };
    return colorMap[color] || color;
  };

  const sectionData = section || defaultSection;

  // Функция для программного клика по кнопке "Продать" в навигации
  const handleSellClick = () => {
    // Находим кнопку "Продать" в навигации и кликаем по ней
    const sellButton = document.querySelector('nav a[href="/sell"]');
    if (sellButton) {
      (sellButton as HTMLElement).click();
    }
  };

  if (!sectionData.isActive) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="relative h-44 rounded-2xl bg-gray-200 animate-pulse">
        <div className="absolute inset-0 rounded-2xl bg-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="relative h-44 rounded-2xl p-6 text-white overflow-hidden shadow-2xl">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
        style={{
          backgroundImage: `url('${sectionData.backgroundImageUrl}')`
        }}
      ></div>
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black rounded-2xl"
        style={{
          opacity: sectionData.overlayOpacity / 100
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-2">
        <h2 
          className="text-2xl font-bold"
          style={{ color: getColorValue(sectionData.textColor) }}
        >
          {sectionData.title}
        </h2>
        <p 
          className="text-base leading-relaxed opacity-90"
          style={{ color: getColorValue(sectionData.textColor) }}
        >
          {sectionData.subtitle}
        </p>
        <div className="mt-4">
          <span 
            onClick={handleSellClick}
            className={`px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-1`}
            style={{ 
              backgroundColor: getColorValue(sectionData.buttonColor),
              color: getColorValue(sectionData.buttonTextColor) 
            }}
          >
            <Plus className="w-4 h-4" />
            {sectionData.buttonText} →
          </span>
        </div>
      </div>
    </div>
  );
}