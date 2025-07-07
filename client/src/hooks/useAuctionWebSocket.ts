import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  listingId?: number;
  data?: any;
  message?: string;
  timestamp?: number;
}

interface AuctionWebSocketHook {
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  joinAuction: (listingId: number) => void;
  leaveAuction: () => void;
  lastBidUpdate: any;
  participantCount: number;
  isHotAuction: boolean;
}

export function useAuctionWebSocket(): AuctionWebSocketHook {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');
  const [lastBidUpdate, setLastBidUpdate] = useState<any>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isHotAuction, setIsHotAuction] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const currentListingRef = useRef<number | null>(null);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/auction`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionQuality('excellent');
        // console.log('🔌 WebSocket подключен для real-time аукционов');
        
        // Отправляем пинг каждые 60 секунд для экономии ресурсов
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 60000);
        
        // Повторно подключаемся к аукциону если был активен
        if (currentListingRef.current) {
          joinAuction(currentListingRef.current);
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          // console.log('📩 Получено WebSocket сообщение:', message);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Ошибка парсинга WebSocket сообщения:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        setConnectionQuality('disconnected');
        // console.log('🔌 WebSocket отключен, попытка переподключения...');
        
        // Автоматическое переподключение через 10 секунд для стабильности
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 10000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
        setConnectionQuality('poor');
      };
      
    } catch (error) {
      console.error('Ошибка создания WebSocket соединения:', error);
      setConnectionQuality('disconnected');
    }
  }, []);
  
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'connected':
        // console.log('✅ WebSocket соединение установлено');
        break;
        
      case 'joined_auction':
        setParticipantCount(message.data?.participantCount || 0);
        // console.log(`👥 Подключен к аукциону ${message.listingId}, участников: ${message.data?.participantCount}`);
        break;
        
      case 'bid_update':
        // console.log('🔥 Получено WebSocket сообщение bid_update:', message);
        setLastBidUpdate({
          ...message,
          receivedAt: Date.now()
        });
        
        // Мгновенно обновляем кэш списка аукционов для отображения новых ставок в карточках
        queryClient.removeQueries({ queryKey: ['/api/listings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
        queryClient.refetchQueries({ queryKey: ['/api/listings'] });
        
        // console.log(`💰 Новая ставка в real-time: ${message.data?.bid?.amount} сомони`);
        break;
        
      case 'hot_auction_mode':
        setIsHotAuction(message.data?.isHot || false);
        console.log(`🔥 Режим горячего аукциона: ${message.data?.isHot ? 'ВКЛЮЧЕН' : 'отключен'}`);
        break;
        
      case 'auction_ended':
        console.log(`🏁 Аукцион ${message.listingId} завершен`);
        setIsHotAuction(false);
        break;
        
      case 'pong':
        // Пинг-понг для проверки соединения
        break;
        
      default:
        console.log('Неизвестное WebSocket сообщение:', message);
    }
  };
  
  const joinAuction = useCallback((listingId: number) => {
    currentListingRef.current = listingId;
    console.log(`🎯 Попытка подключения к аукциону ${listingId}, пользователь:`, (user as any)?.userId);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'join_auction',
        listingId,
        userId: (user as any)?.userId
      };
      console.log('📤 Отправляем сообщение join_auction:', message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.log('⚠️ WebSocket не подключен, подключаемся...');
      // Если WebSocket не подключен, подключаемся
      connect();
    }
  }, [user, connect]);
  
  const leaveAuction = useCallback(() => {
    currentListingRef.current = null;
    setParticipantCount(0);
    setIsHotAuction(false);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'leave_auction'
      }));
    }
  }, []);
  
  // Инициализация при монтировании
  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);
  
  // Мониторинг качества соединения
  useEffect(() => {
    if (!isConnected) {
      setConnectionQuality('disconnected');
    } else {
      // Можно добавить логику для определения качества соединения
      // например, на основе задержки ping-pong
      setConnectionQuality('excellent');
    }
  }, [isConnected]);
  
  return {
    isConnected,
    connectionQuality,
    joinAuction,
    leaveAuction,
    lastBidUpdate,
    participantCount,
    isHotAuction
  };
}