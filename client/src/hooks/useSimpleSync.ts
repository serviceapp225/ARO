import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function useSimpleSync() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Каждую секунду обновляем данные для быстрого отображения цен
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryClient]);

  return { isActive: true };
}