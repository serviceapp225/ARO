import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function useTimestampSync() {
  const queryClient = useQueryClient();
  const lastTimestamp = useRef<number>(0);

  // Получаем timestamp последней ставки
  const { data: timestampData } = useQuery({
    queryKey: ['/api/bid-updates/timestamp'],
    refetchInterval: 500, // Проверяем каждые 500мс
    staleTime: 0, // Всегда считаем данные устаревшими
    gcTime: 0, // Не кэшируем
  });

  useEffect(() => {
    if (timestampData?.timestamp && timestampData.timestamp > lastTimestamp.current) {
      console.log('🚀 Обнаружена новая ставка - принудительное обновление карточек');
      console.log('📊 Timestamp:', timestampData.timestamp, 'Последний:', lastTimestamp.current);
      
      // Максимально агрессивное обновление
      queryClient.removeQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.refetchQueries({ queryKey: ['/api/listings'] });
      
      // Обновляем timestamp
      lastTimestamp.current = timestampData.timestamp;
    }
  }, [timestampData, queryClient]);

  return {
    lastUpdate: timestampData?.timestamp || 0,
    isActive: true
  };
}