import { Car } from "lucide-react";

export function SellCarBanner() {
  const handleClick = () => {
    console.log('КЛИК РАБОТАЕТ! Переход на /sell');
    window.location.href = '/sell';
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Продайте свой автомобиль
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            Более 2000 покупателей ждут ваше предложение
          </p>
          <div className="flex items-center space-x-4 text-gray-500 text-xs">
            <span className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
              95% успешных продаж
            </span>
            <span className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
              24ч средний срок
            </span>
          </div>
        </div>
        <div className="ml-4 bg-blue-50 p-3 rounded-xl">
          <Car className="w-8 h-8 text-blue-600" />
        </div>
      </div>
    </div>
  );
}