import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface OptimizedDataHook {
  isLoading: boolean;
  error: string | null;
}

export function useOptimizedData(userId?: number): OptimizedDataHook {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (!userId) return;
    
    // Очищаем предыдущий таймаут
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    setIsLoading(true);
    setError(null);
    
    // Дебаунсинг загрузки данных
    loadingTimeoutRef.current = setTimeout(async () => {
      try {
        // Предварительно загружаем только критичные данные
        const criticalQueries = [
          `/api/listings`,
          `/api/users/${userId}`,
          `/api/notifications/${userId}`
        ];
        
        // Загружаем данные пакетами, а не все сразу
        await Promise.all(
          criticalQueries.map(query => 
            queryClient.prefetchQuery({
              queryKey: [query],
              staleTime: 30000 // 30 секунд кэша
            })
          )
        );
        
        // Загружаем некритичные данные с задержкой
        setTimeout(() => {
          const secondaryQueries = [
            `/api/users/${userId}/favorites`,
            `/api/advertisement-carousel`,
            `/api/sell-car-section`
          ];
          
          secondaryQueries.forEach(query => {
            queryClient.prefetchQuery({
              queryKey: [query],
              staleTime: 60000 // 1 минута кэша
            });
          });
        }, 100);
        
      } catch (err) {
        setError('Ошибка загрузки данных');
      } finally {
        setIsLoading(false);
      }
    }, 150); // 150ms дебаунс
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [userId, queryClient]);
  
  return { isLoading, error };
}