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
  
  // Единая функция для получения ID пользователя
  const getCurrentUserId = useCallback(() => {
    if (!user?.phoneNumber) return null;
    
    const phoneToUserIdMap: Record<string, number> = {
      "+992 (90) 333-13-32": 4,   // Пользователь 992903331332 (АДМИН)
      "+992 (11) 111-11-11": 3,
      "+992 (22) 222-22-22": 18,
      "+992 (41) 111-11-11": 15,
      "+992 (88) 888-88-88": 17,
      "+992 (88) 747-77-00": 19,  // Пользователь 19
      "+992 (93) 805-88-33": 20,  // Пользователь 20
      "+992 (98) 766-77-39": 22,  // Пользователь 22
      "+992903331332": 4,
      "+992111111111": 3,
      "+992222222222": 18,
      "+992411111111": 15,
      "+992888888888": 17,
      "+992887477700": 19,
      "+992938058833": 20,
      "+992987667739": 22
    };
    
    return phoneToUserIdMap[user?.phoneNumber || ''] || null;
  }, [user?.phoneNumber]);
  
  // Мемоизированный результат для оптимизации
  const currentUserId = getCurrentUserId();
  
  const connect = useCallback(() => {
    // Не создавать новое соединение если уже есть активное
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔌 WebSocket уже подключен, пропускаем');
      setIsConnected(true);
      return;
    }
    
    // Закрываем предыдущее соединение если есть
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
      console.log('🔌 Создание нового WebSocket соединения:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionQuality('excellent');
        console.log('🔌 WebSocket подключен для real-time аукционов');
        
        // Отправляем пинг каждые 60 секунд для экономии ресурсов
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 60000);
        
        // ВАЖНО: Идентифицируем пользователя для уведомлений
        if (currentUserId) {
          const identifyMessage = {
            type: 'identify_user',
            userId: currentUserId
          };
          console.log('👤 Идентификация пользователя для уведомлений:', identifyMessage);
          wsRef.current.send(JSON.stringify(identifyMessage));
        } else {
          // Пользователь не определен при подключении - это нормально при загрузке
          console.log('👤 Пользователь не определен при WebSocket подключении');
        }
        
        // Повторно подключаемся к аукциону если был активен
        if (currentListingRef.current) {
          const message = {
            type: 'join_auction',
            listingId: currentListingRef.current,
            userId: currentUserId || null
          };
          console.log('🔄 Переподключение к аукциону:', message);
          wsRef.current.send(JSON.stringify(message));
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📩 Получено WebSocket сообщение:', message);
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
  }, [user]);
  
  // Переподключение при изменении пользователя
  useEffect(() => {
    if (currentUserId && wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔄 Пользователь загружен, отправляем идентификацию:', currentUserId);
      const identifyMessage = {
        type: 'identify_user',
        userId: currentUserId
      };
      wsRef.current.send(JSON.stringify(identifyMessage));
    }
  }, [currentUserId]);
  
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    // Детальная отладка для поиска "user is not defined"
    console.log('🔍 handleWebSocketMessage - user:', user);
    console.log('🔍 handleWebSocketMessage - typeof user:', typeof user);
    console.log('🔍 handleWebSocketMessage - currentUserId:', currentUserId);
    console.log('🔍 handleWebSocketMessage - typeof currentUserId:', typeof currentUserId);
    
    switch (message.type) {
      case 'connected':
        console.log('✅ WebSocket соединение установлено');
        // Принудительно обновляем статус соединения
        setIsConnected(true);
        setConnectionQuality('excellent');
        break;
        
      case 'user_identified':
        console.log('👤 Пользователь успешно идентифицирован для WebSocket уведомлений:', message.userId);
        break;
        
      case 'joined_auction':
        setParticipantCount(message.data?.participantCount || 0);
        // console.log(`👥 Подключен к аукциону ${message.listingId}, участников: ${message.data?.participantCount}`);
        break;
        
      case 'bid_update':
        console.log('💰 WebSocket обновление: принудительное обновление кэша для аукциона', message.listingId, ', новая ставка:', message.data?.bid?.amount, 'сомони');
        setLastBidUpdate({
          ...message,
          receivedAt: Date.now()
        });
        
        // Плавно обновляем данные в кэше без полной очистки (убираем моргание)
        if (message.listingId && message.data?.bid) {
          const newBid = message.data.bid;
          const newAmount = parseFloat(newBid.amount);
          
          // Плавно обновляем список аукционов
          queryClient.setQueryData(['/api/listings'], (oldListings: any) => {
            if (Array.isArray(oldListings)) {
              return oldListings.map((listing: any) => {
                if (listing.id === message.listingId) {
                  return {
                    ...listing,
                    currentBid: newAmount.toString(),
                    bidCount: (listing.bidCount || 0) + 1
                  };
                }
                return listing;
              });
            }
            return oldListings;
          });
          
          // Плавно обновляем данные конкретного аукциона
          queryClient.setQueryData([`/api/listings/${message.listingId}`], (oldData: any) => {
            if (oldData) {
              return {
                ...oldData,
                currentBid: newAmount.toString(),
                bidCount: (oldData.bidCount || 0) + 1
              };
            }
            return oldData;
          });

          // Принудительно обновляем данные аукциона для мгновенной синхронизации
          queryClient.invalidateQueries({ queryKey: [`/api/listings/${message.listingId}`] });
          
          // Плавно обновляем ставки
          queryClient.setQueryData([`/api/listings/${message.listingId}/bids`], (oldBids: any) => {
            if (Array.isArray(oldBids)) {
              const existingBid = oldBids.find(bid => bid.id === newBid.id);
              if (!existingBid) {
                return [newBid, ...oldBids];
              }
            }
            return oldBids;
          });
        }
        break;
        
      case 'notification':
        // Обработка уведомлений от WebSocket
        if (message.data && currentUserId) {
          const notification = message.data;
          
          // Показываем уведомление только если оно для текущего пользователя
          // Проверяем оба варианта поля: userId (клиентский) и user_id (серверный из БД)
          const notificationUserId = notification.userId || notification.user_id;
          console.log('📞 Получено WebSocket уведомление, для пользователя:', notificationUserId, ', текущий пользователь:', currentUserId);
          
          if (notificationUserId === currentUserId) {
            console.log('🔔 Уведомление для текущего пользователя, показываем:', notification);
            
            // Обновляем кэш уведомлений для колокольчика (только если пользователь валиден)
            if (currentUserId && typeof currentUserId === 'number') {
              queryClient.invalidateQueries({ queryKey: [`/api/notifications/${currentUserId}`] });
            }
            
            // Показываем браузерное уведомление если разрешено
            if (Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico'
              });
            }
          } else {
            console.log('❌ Уведомление НЕ для текущего пользователя, игнорируем');
          }
        }
        break;

      case 'bid_outbid':
        // НОВАЯ СИСТЕМА: Уведомления о перебитых ставках
        console.log('🏆 Получено уведомление о перебитой ставке:', message);
        
        // Динамически импортируем toast
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: "Ваша ставка перебита!",
            description: message.message,
            variant: "destructive",
            duration: 3000,
          });
        });
        
        // КРИТИЧЕСКИ ВАЖНО: Принудительно обновляем кэш уведомлений для колокольчика
        if (currentUserId && typeof currentUserId === 'number') {
          console.log('🔔 Принудительно обновляем кэш уведомлений для колокольчика после WebSocket bid_outbid');
          
          // Убираем кэш и принудительно перезагружаем
          queryClient.removeQueries({ queryKey: [`/api/notifications/${currentUserId}`] });
          queryClient.invalidateQueries({ queryKey: [`/api/notifications/${currentUserId}`] });
          
          // Принудительно обновляем данные НЕМЕДЛЕННО для максимальной скорости
          queryClient.refetchQueries({ queryKey: [`/api/notifications/${currentUserId}`] });
          
          // Дополнительное обновление через 50мс для гарантии
          setTimeout(() => {
            queryClient.refetchQueries({ queryKey: [`/api/notifications/${currentUserId}`] });
          }, 50);
        }
        
        // Показываем браузерное уведомление если разрешено
        if (Notification.permission === 'granted') {
          new Notification('Ваша ставка перебита!', {
            body: message.message,
            icon: '/favicon.ico'
          });
        }
        break;
        
      case 'bid_processed':
        // Подтверждение обработки ставки через WebSocket
        console.log('✅ Подтверждение обработки ставки:', message);
        if (message.success) {
          console.log('🎉 Ставка успешно обработана:', message.message);
        } else {
          console.error('❌ Ошибка обработки ставки:', message.message);
        }
        break;
        
      case 'new_message':
        // НОВАЯ СИСТЕМА: Мгновенные уведомления о новых сообщениях
        console.log('💬 Получено уведомление о новом сообщении:', message);
        
        if (currentUserId && typeof currentUserId === 'number') {
          console.log('🔄 REAL-TIME: Обновляем кэш сообщений для пользователя', currentUserId);
          
          // Мгновенно обновляем кэш переписок (правильный queryKey)
          queryClient.invalidateQueries({ queryKey: ["/api/conversations", currentUserId] });
          
          // Если текущая переписка открыта, обновляем сообщения
          if (message.data?.conversationId) {
            console.log('🔄 REAL-TIME: Обновляем сообщения переписки', message.data.conversationId);
            queryClient.invalidateQueries({ 
              queryKey: ["/api/conversations", message.data.conversationId, "messages"] 
            });
          }
          
          // Обновляем счетчик непрочитанных сообщений
          queryClient.invalidateQueries({ queryKey: [`/api/messages/unread-count/${currentUserId}`] });
          
          // КРИТИЧНО: Сигнализируем странице сообщений об обновлении через localStorage
          console.log('🔄 REAL-TIME: Отправляем сигнал странице сообщений для принудительного обновления');
          localStorage.setItem('force-refresh-messages', Date.now().toString());
          
          // Динамически импортируем toast для показа уведомления
          import('@/hooks/use-toast').then(({ toast }) => {
            toast({
              title: "💬 Новое сообщение",
              description: `От ${message.data?.senderName || 'пользователя'}`,
              duration: 3000,
            });
          });
        }
        break;
        
      case 'new_message_notification':
        // НОВАЯ СИСТЕМА: Мгновенные уведомления о новых сообщениях
        console.log('💬 Получено уведомление о новом сообщении:', message);
        
        if (currentUserId && typeof currentUserId === 'number') {
          console.log('🔄 REAL-TIME: МГНОВЕННО перезагружаем все данные для пользователя', currentUserId);
          
          // ПРИНУДИТЕЛЬНО перезагружаем переписки для немедленного обновления
          queryClient.refetchQueries({ queryKey: ["/api/conversations", currentUserId] });
          
          // Если текущая переписка открыта, ПРИНУДИТЕЛЬНО перезагружаем сообщения
          if (message.messageData?.conversationId) {
            console.log('🔄 REAL-TIME: ПРИНУДИТЕЛЬНО перезагружаем сообщения переписки', message.messageData.conversationId);
            queryClient.refetchQueries({ 
              queryKey: [`/api/conversations/${message.messageData.conversationId}/messages`] 
            });
          }
          
          // ПРИНУДИТЕЛЬНО перезагружаем счетчик непрочитанных сообщений
          queryClient.refetchQueries({ queryKey: [`/api/messages/unread-count/${currentUserId}`] });
          
          // КРИТИЧНО: Сигнализируем странице сообщений об обновлении через localStorage
          console.log('🔄 REAL-TIME: Отправляем сигнал странице сообщений для принудительного обновления');
          localStorage.setItem('force-refresh-messages', Date.now().toString());
          
          // Динамически импортируем toast для показа уведомления
          import('@/hooks/use-toast').then(({ toast }) => {
            toast({
              title: "💬 Новое сообщение",
              description: `От ${message.messageData?.senderName || 'пользователя'}`,
              duration: 3000,
            });
          });
        }
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
    console.log(`🎯 Попытка подключения к аукциону ${listingId}, пользователь:`, currentUserId || 'загружается');
    console.log('📊 Состояние WebSocket:', wsRef.current?.readyState, 'isConnected:', isConnected);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'join_auction',
        listingId,
        userId: currentUserId || null
      };
      console.log('📤 Отправляем сообщение join_auction:', message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.log('⚠️ WebSocket не подключен, подключаемся и будем ждать...');
      // Если WebSocket не подключен, подключаемся
      connect();
      
      // Ждем подключения и повторяем попытку
      const retryInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          clearInterval(retryInterval);
          const message = {
            type: 'join_auction',
            listingId,
            userId: currentUserId || null
          };
          console.log('📤 Отправляем сообщение join_auction после подключения:', message);
          wsRef.current.send(JSON.stringify(message));
        }
      }, 100);
      
      // Отменяем попытки через 5 секунд
      setTimeout(() => clearInterval(retryInterval), 5000);
    }
  }, [user, connect, isConnected]);
  
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