import { Car, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

export function SellCarBanner() {
  const [, setLocation] = useLocation();

  const handleNavigation = () => {
    console.log('Переход на /sell');
    setLocation('/sell');
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-6 md:p-8 text-white shadow-lg mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="bg-white/20 rounded-full p-3">
            <Car className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">
              Продайте свой автомобиль
            </h2>
            <p className="text-blue-100 text-lg">
              Получите лучшую цену на нашем аукционе
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleNavigation}
          className="inline-flex items-center bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
        >
          Начать продажу
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
        <div className="text-center">
          <div className="text-2xl font-bold">2000+</div>
          <div className="text-blue-100 text-sm">Покупателей</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">95%</div>
          <div className="text-blue-100 text-sm">Успешных продаж</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">24ч</div>
          <div className="text-blue-100 text-sm">Средний срок</div>
        </div>
      </div>
    </div>
  );
}