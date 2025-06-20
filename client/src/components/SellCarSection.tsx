import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

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
  const { data: section, isLoading } = useQuery<SellCarSectionData>({
    queryKey: ['/api/sell-car-section'],
    queryFn: async () => {
      const response = await fetch('/api/sell-car-section');
      if (!response.ok) throw new Error('Failed to fetch sell car section');
      return response.json();
    }
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
    textColor: "white",
    buttonColor: "white",
    buttonTextColor: "emerald-700"
  };

  const sectionData = section || defaultSection;

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
      <div className="relative z-10 space-y-2">
        <h2 
          className="text-2xl font-bold"
          style={{ color: sectionData.textColor }}
        >
          {sectionData.title}
        </h2>
        <p 
          className="text-base leading-relaxed opacity-90"
          style={{ color: sectionData.textColor }}
        >
          {sectionData.subtitle}
        </p>
        <div className="mt-4">
          <Link href={sectionData.linkUrl}>
            <span 
              className={`px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-1`}
              style={{ 
                backgroundColor: sectionData.buttonColor,
                color: sectionData.buttonTextColor 
              }}
            >
              <Plus className="w-4 h-4" />
              {sectionData.buttonText} →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}