import { Camera, Gavel, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AddCarModal } from './AddCarModal';

export function SellYourCar() {
  const [showAddCarModal, setShowAddCarModal] = useState(false);

  const features = [
    {
      icon: Camera,
      title: 'Загрузите фото',
      description: 'Добавьте до 5 качественных фотографий вашего автомобиля',
    },
    {
      icon: Gavel,
      title: 'Установите резерв',
      description: 'Выберите стартовую цену и продолжительность аукциона',
    },
    {
      icon: DollarSign,
      title: 'Получите оплату',
      description: 'Безопасная обработка платежей после завершения аукциона',
    },
  ];

  return (
    <>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6">
              Продайте свой автомобиль
            </h2>
            <p className="text-xl text-neutral-600 mb-8">
              Найдите тысячи квалифицированных покупателей и получите лучшую цену за ваш автомобиль
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="text-primary text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <Button 
              size="lg"
              className="bg-red-600 hover:bg-red-700 px-8 py-4 text-lg"
              onClick={() => setShowAddCarModal(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Добавить автомобиль
            </Button>
          </div>
        </div>
      </section>

      <AddCarModal 
        open={showAddCarModal}
        onOpenChange={setShowAddCarModal}
      />
    </>
  );
}
