import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import DriftingCarLoader from "@/components/DriftingCarLoader";

export default function LoaderTest() {
  const [showLoader, setShowLoader] = useState(false);

  const handleShowLoader = () => {
    setShowLoader(true);
    // Скрыть через 3 секунды
    setTimeout(() => {
      setShowLoader(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      {showLoader && <DriftingCarLoader message="Тестируем анимацию дрифта!" />}
      
      <div className="max-w-md mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold">Тест анимации загрузки</h1>
        <p className="text-muted-foreground">
          Нажми кнопку чтобы увидеть анимацию дрифтующей машинки
        </p>
        
        <Button 
          onClick={handleShowLoader}
          size="lg"
          className="w-full"
          disabled={showLoader}
        >
          {showLoader ? "Показываем анимацию..." : "Показать анимацию дрифта"}
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Анимация будет показываться 3 секунды
        </div>
      </div>
    </div>
  );
}