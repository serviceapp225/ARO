import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function useSimpleSync() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Каждую секунду принудительно обновляем данные для быстрой синхронизации
    intervalRef.current = setInterval(() => {
      queryClient.removeQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.refetchQueries({ queryKey: ['/api/listings'] });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryClient]);

  return { isActive: true };
}