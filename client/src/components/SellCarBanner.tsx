import { Plus } from "lucide-react";
import { useLocation } from "wouter";

export function SellCarBanner() {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    console.log('КЛИК РАБОТАЕТ! Переход на /sell');
    setLocation('/sell');
  };

  return (
    <div 
      onClick={handleClick}
      className="relative h-44 rounded-2xl p-6 text-white overflow-hidden shadow-2xl cursor-pointer hover:shadow-3xl transition-all duration-300"
    >
      {/* Fast Gradient Background */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)'
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          Продай свое авто
        </h2>
        <p className="text-base leading-relaxed opacity-90 text-white">
          Получи максимальную цену за свой автомобиль на нашем аукционе
        </p>
        <div className="mt-4">
          <span 
            className="px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
            style={{ 
              backgroundColor: '#ffffff',
              color: '#059669' 
            }}
          >
            <Plus className="w-4 h-4" />
            Начать продажу →
          </span>
        </div>
      </div>
    </div>
  );
}