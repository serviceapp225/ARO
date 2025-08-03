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

  // Умное обновление данных без агрессивной очистки кэша
  const smartUpdateAuctionData = useCallback(async (listingId?: string) => {
    lastDataUpdateRef.current = Date.now();
    
    try {
      if (listingId) {
        // Обновляем конкретный аукцион
        console.log(`🔄 Умное обновление аукциона ${listingId}`);
        queryClient.invalidateQueries({ queryKey: [`/api/listings/${listingId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/listings/${listingId}/bids`] });
      } else {
        // Фоновое обновление всех данных без очистки кэша
        console.log('🔄 Фоновое обновление списка аукционов');
        
        // Загружаем новые данные в фоне
        const response = await fetch('/api/listings');
        const newData = await response.json();
        
        // Сравниваем с текущими данными
        const currentData = queryClient.getQueryData(['/api/listings']);
        
        if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
          console.log('✅ Данные изменились, плавно обновляем');
          queryClient.setQueryData(['/api/listings'], newData);
        } else {
          console.log('📋 Данные не изменились, обновление не требуется');
        }
      }
    } catch (error) {
      console.error('⚠️ Ошибка умного обновления:', error);
      // Fallback к обычному обновлению при ошибке
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
    }
  }, [queryClient, lastDataUpdateRef]);

  // Мягкое принудительное обновление без агрессивной очистки
  const gentleForceUpdate = useCallback(async () => {
    console.log('🔄 Мягкое принудительное обновление');
    await smartUpdateAuctionData();
  }, [smartUpdateAuctionData]);

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
            smartUpdateAuctionData(message.listingId?.toString());
          } else if (message.type === 'auction_update') {
            console.log('🏁 Получено обновление аукциона:', message);
            smartUpdateAuctionData();
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
  }, [enableWebSocket, smartUpdateAuctionData]);

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
      smartUpdateAuctionData();
    }
  }, [pollingData, enablePolling, smartUpdateAuctionData]);

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
    forceUpdate: gentleForceUpdate,
    smartUpdate: smartUpdateAuctionData
  };
}