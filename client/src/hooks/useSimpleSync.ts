import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function useSimpleSync() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Каждые 10 секунд обновляем данные для отображения цен (более стабильно)
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryClient]);

  return { isActive: true };
}