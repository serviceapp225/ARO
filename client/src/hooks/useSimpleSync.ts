import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function useSimpleSync() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Редкая синхронизация каждые 30 секунд как fallback (WebSocket основной источник)
    intervalRef.current = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryClient]);

  return { isActive: true };
}