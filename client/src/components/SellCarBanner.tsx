import { Car, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function SellCarBanner() {
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
          
          <div style={{zIndex: 9999, position: 'relative'}}>
            <a 
              href="/sell"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'white',
                color: '#2563eb',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                cursor: 'pointer',
                zIndex: 9999,
                position: 'relative'
              }}
              onMouseDown={() => console.log('mousedown')}
              onClick={() => console.log('click')}
            >
              Начать продажу
              <ArrowRight className="w-5 h-5 ml-2" style={{marginLeft: '8px'}} />
            </a>
          </div>
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