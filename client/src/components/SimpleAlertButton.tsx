import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SimpleAlertButtonProps {
  searchFilters?: {
    brand?: string;
    model?: string;
    yearFrom?: string;
    yearTo?: string;
    priceFrom?: string;
    priceTo?: string;
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
    customsCleared?: string;
  };
}

export default function SimpleAlertButton({ searchFilters = {} }: SimpleAlertButtonProps) {
  const [isCreated, setIsCreated] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Mock user ID - в реальном приложении будет из контекста авторизации
  const userId = 3;

  const createAlertMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/car-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          make: searchFilters.brand || null,
          model: searchFilters.model || null,
          minPrice: searchFilters.priceFrom || null,
          maxPrice: searchFilters.priceTo || null,
          minYear: searchFilters.yearFrom ? parseInt(searchFilters.yearFrom) : null,
          maxYear: searchFilters.yearTo ? parseInt(searchFilters.yearTo) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка создания уведомления');
      }

      return response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/car-alerts'] });
      setIsCreated(true);
      
      // Создаем уведомление о создании поискового запроса для отображения в профиле
      try {
        const alertDescription = [
          searchFilters.brand && `марка: ${searchFilters.brand}`,
          searchFilters.model && `модель: ${searchFilters.model}`,
          searchFilters.yearFrom && `год от: ${searchFilters.yearFrom}`,
          searchFilters.yearTo && `год до: ${searchFilters.yearTo}`,
          searchFilters.priceFrom && `цена от: $${searchFilters.priceFrom}`,
          searchFilters.priceTo && `цена до: $${searchFilters.priceTo}`
        ].filter(Boolean).join(', ');

        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: "Создан поисковый запрос",
            message: `Вы будете получать уведомления о машинах: ${alertDescription}`,
            type: "alert_created",
            isRead: false
          }),
        });
      } catch (error) {
        console.error('Ошибка создания уведомления:', error);
      }
      
      toast({
        title: "Поисковый запрос сохранён",
        description: "Мы сообщим вам в колокольчике о новых автомобилях по вашим параметрам",
        duration: 3000,
      });
      
      // Сбрасываем состояние через 3 секунды
      setTimeout(() => setIsCreated(false), 3000);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать уведомление. Попробуйте снова.",
        variant: "destructive",
      });
    }
  });

  const handleCreateAlert = () => {
    createAlertMutation.mutate();
  };

  if (isCreated) {
    return (
      <Button disabled className="bg-green-600 text-white">
        <Check className="h-4 w-4 mr-2" />
        Уведомление создано
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleCreateAlert}
      disabled={createAlertMutation.isPending}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Bell className="h-4 w-4 mr-2" />
      {createAlertMutation.isPending ? "Создаем..." : "Уведомить когда появится"}
    </Button>
  );
}