import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';

interface RealTimeConfig {
  enableWebSocket?: boolean;
  enablePolling?: boolean;
  pollingInterval?: number;
  retryAttempts?: number;
}

export function useOptimizedRealTime(config: RealTimeConfig = {}) {
  const {
    enableWebSocket = true,
    enablePolling = false, // Отключаем дублирующий polling по умолчанию
    pollingInterval = 5000, // Увеличиваем интервал как fallback
    retryAttempts = 3
  } = config;

  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);
  const lastDataUpdateRef = useRef(Date.now());
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Оптимизированное обновление данных с отслеживанием времени
  const invalidateAuctionData = useCallback((listingId?: string) => {
    lastDataUpdateRef.current = Date.now();
    const keys = listingId 
      ? [`/api/listings/${listingId}`, `/api/listings/${listingId}/bids`]
      : ['/api/listings'];
    
    keys.forEach(key => {
      queryClient.removeQueries({ queryKey: [key] });
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }, [queryClient]);

  // Принудительное обновление при обнаружении "застревания"
  const forceUpdate = useCallback(() => {
    console.log('🔄 Принудительное обновление всех данных');
    lastDataUpdateRef.current = Date.now();
    queryClient.removeQueries({ queryKey: ['/api/listings'] });
    queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
    queryClient.refetchQueries({ queryKey: ['/api/listings'] });
  }, [queryClient]);

  // WebSocket подключение
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket || isConnectedRef.current) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🔌 WebSocket подключен для обновлений');
        isConnectedRef.current = true;
        
        // Отправляем идентификацию пользователя
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.userId) {
          wsRef.current?.send(JSON.stringify({
            type: 'identify_user',
            userId: user.userId
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'bid_update') {
            console.log('💰 Получено обновление ставки:', message);
            invalidateAuctionData(message.listingId?.toString());
          } else if (message.type === 'auction_update') {
            console.log('🏁 Получено обновление аукциона:', message);
            invalidateAuctionData();
          }
        } catch (error) {
          console.error('Ошибка обработки WebSocket сообщения:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('❌ WebSocket отключен');
        isConnectedRef.current = false;
        
        // Переподключение через 3 секунды
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
        isConnectedRef.current = false;
      };

    } catch (error) {
      console.error('Ошибка подключения WebSocket:', error);
    }
  }, [enableWebSocket, invalidateAuctionData]);

  // Fallback polling (только если WebSocket недоступен)
  const { data: pollingData } = useQuery({
    queryKey: ['/api/bid-updates/timestamp'],
    enabled: enablePolling && !isConnectedRef.current,
    refetchInterval: pollingInterval,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (enablePolling && pollingData && !isConnectedRef.current) {
      console.log('🔄 Fallback polling обновление');
      invalidateAuctionData();
    }
  }, [pollingData, enablePolling, invalidateAuctionData]);

  // Инициализация
  useEffect(() => {
    if (enableWebSocket) {
      connectWebSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        isConnectedRef.current = false;
        wsRef.current.close();
      }
    };
  }, [connectWebSocket, enableWebSocket]);



  return {
    isConnected: isConnectedRef.current,
    forceUpdate,
    invalidateAuctionData
  };
}