import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Хук для агрессивного polling синхронизации
export function usePollingSync(intervalMs: number = 200) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(async () => {
        const now = Date.now();
        
        // Проверяем, прошло ли достаточно времени с последнего обновления
        if (now - lastUpdateRef.current > intervalMs) {
          try {
            // Принудительное обновление данных
            await queryClient.refetchQueries({ 
              queryKey: ['/api/listings'],
              type: 'active' 
            });
            
            lastUpdateRef.current = now;
            // console.log('🔄 Принудительная синхронизация данных');
          } catch (error) {
            console.error('Ошибка синхронизации:', error);
          }
        }
      }, intervalMs);
    };

    startPolling();

    // Очистка при размонтировании
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs, queryClient]);

  // Функция для принудительного обновления
  const forceSync = () => {
    queryClient.removeQueries({ queryKey: ['/api/listings'] });
    queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
    queryClient.refetchQueries({ queryKey: ['/api/listings'] });
    lastUpdateRef.current = Date.now();
    console.log('⚡ Принудительная синхронизация данных');
  };

  return { forceSync };
}