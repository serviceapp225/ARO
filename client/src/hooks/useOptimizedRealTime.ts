import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import WebSocketManager from '@/utils/WebSocketManager';

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
  const wsManager = WebSocketManager.getInstance();
  const lastDataUpdateRef = useRef(Date.now());
  const unsubscribeMessageRef = useRef<(() => void) | null>(null);
  const unsubscribeConnectionRef = useRef<(() => void) | null>(null);

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
        console.log('🔄 Умное фоновое обновление данных');
        
        // Загружаем новые данные в фоне
        const response = await fetch('/api/listings');
        const newData = await response.json();
        
        // Сравниваем с текущими данными
        const currentData = queryClient.getQueryData(['/api/listings']);
        
        if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
          console.log('✅ Обнаружены изменения, плавно обновляем');
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
  }, [queryClient]);

  // Мягкое принудительное обновление без агрессивной очистки
  const gentleForceUpdate = useCallback(async () => {
    console.log('🔄 Мягкое принудительное обновление');
    await smartUpdateAuctionData();
  }, [smartUpdateAuctionData]);

  // Обработчик WebSocket сообщений
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'bid_update') {
      console.log('💰 Получено обновление ставки:', message.listingId);
      smartUpdateAuctionData(message.listingId?.toString());
    } else if (message.type === 'auction_update') {
      console.log('🏁 Получено обновление аукциона');
      smartUpdateAuctionData();
    } else if (message.type === 'listing_update') {
      console.log('📝 Получено обновление объявления:', message);
      console.log('📊 Данные для обновления:', message.data);
      
      // КРИТИЧНО: Обновляем главный кэш списка /api/listings для мгновенного обновления карточек
      if (message.data && message.data.id) {
        queryClient.setQueryData(['/api/listings'], (oldListings: any) => {
          if (Array.isArray(oldListings)) {
            console.log('🔄 Обновляем главный список аукционов через WebSocket для ID:', message.data.id);
            return oldListings.map((listing: any) => {
              if (listing.id === message.data.id) {
                console.log('✅ Найден аукцион для обновления:', {
                  oldCurrentBid: listing.currentBid,
                  newCurrentBid: message.data.currentBid,
                  oldBidCount: listing.bidCount || 0,
                  newBidCount: message.data.bidCount || 0
                });
                return {
                  ...listing,
                  currentBid: message.data.currentBid || listing.currentBid,
                  bidCount: message.data.bidCount !== undefined ? message.data.bidCount : listing.bidCount
                };
              }
              return listing;
            });
          }
          return oldListings;
        });
        
        // ДОПОЛНИТЕЛЬНО: Обновляем индивидуальный кэш аукциона
        const listingId = message.data.id.toString();
        queryClient.setQueryData(['/api/listings', listingId], (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              currentBid: message.data.currentBid || oldData.currentBid,
              bidCount: message.data.bidCount !== undefined ? message.data.bidCount : oldData.bidCount
            };
          }
          return oldData;
        });
      }
      
      console.log('🔄 Принудительное обновление через smartUpdateAuctionData');
      smartUpdateAuctionData();
    }
  }, [smartUpdateAuctionData]);

  // Получение статуса подключения
  const getConnectionStatus = useCallback(() => {
    return wsManager.getConnectionStatus();
  }, [wsManager]);

  // Fallback polling (только если WebSocket недоступен)
  const { data: pollingData } = useQuery({
    queryKey: ['/api/bid-updates/timestamp'],
    enabled: enablePolling && !getConnectionStatus().isConnected,
    refetchInterval: pollingInterval,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (enablePolling && pollingData && !getConnectionStatus().isConnected) {
      console.log('🔄 Fallback polling обновление');
      smartUpdateAuctionData();
    }
  }, [pollingData, enablePolling, smartUpdateAuctionData, getConnectionStatus]);

  // Инициализация WebSocket через менеджер
  useEffect(() => {
    if (enableWebSocket) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.userId;

      console.log('🔌 Инициализация ЕДИНОГО WebSocket соединения');
      
      // Подписываемся на сообщения WebSocket
      unsubscribeMessageRef.current = wsManager.addMessageHandler(handleWebSocketMessage);
      
      // Подключаемся (или переиспользуем существующее соединение)
      wsManager.connect(userId);

      // Cleanup при размонтировании
      return () => {
        if (unsubscribeMessageRef.current) {
          unsubscribeMessageRef.current();
          unsubscribeMessageRef.current = null;
        }
      };
    }
  }, [enableWebSocket, handleWebSocketMessage, wsManager]);

  // Возвращаем статус подключения и функции управления
  return {
    isConnected: getConnectionStatus().isConnected,
    reconnectAttempts: getConnectionStatus().reconnectAttempts,
    forceUpdate: gentleForceUpdate,
    wsManager
  };
}