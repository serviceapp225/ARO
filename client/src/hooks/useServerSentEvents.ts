import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hook для Server-Sent Events как альтернатива WebSocket
export function useServerSentEvents() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const connectSSE = () => {
      // Создаем SSE подключение к серверу
      const eventSource = new EventSource('/api/events/bids');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('📡 SSE подключен для мгновенного обновления');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 SSE получил обновление:', data);
          
          if (data.type === 'bid_update') {
            setLastUpdate(data);
            
            // Мгновенно обновляем все данные
            queryClient.removeQueries({ queryKey: ['/api/listings'] });
            queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
            queryClient.refetchQueries({ queryKey: ['/api/listings'] });
            
            console.log('⚡ SSE принудительно обновил карточки');
          }
        } catch (error) {
          console.error('Ошибка обработки SSE:', error);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        // console.log('❌ SSE отключен, переподключение...');
        
        // Переподключение через 2 секунды
        setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            connectSSE();
          }
        }, 2000);
      };
    };

    connectSSE();

    // Очистка при размонтировании
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        setIsConnected(false);
      }
    };
  }, [queryClient]);

  return { isConnected, lastUpdate };
}