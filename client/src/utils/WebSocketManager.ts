// Глобальный менеджер WebSocket соединений для избежания множественных подключений
class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageHandlers: Set<(message: any) => void> = new Set();
  private connectionHandlers: Set<() => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentUserId: number | null = null;

  private constructor() {
    // Приватный конструктор для singleton
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  // Подключение к WebSocket (создается только одно соединение)
  connect(userId?: number) {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      console.log('🔌 WebSocket уже подключен, переиспользуем соединение');
      if (userId && userId !== this.currentUserId) {
        this.identifyUser(userId);
      }
      // Уведомляем обработчики о готовности соединения
      this.connectionHandlers.forEach(handler => handler());
      return;
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('🔄 WebSocket подключается, ждем...');
      return;
    }

    try {
      // Определяем базовый URL для Capacitor приложения и production
      const isCapacitor = (window as any).Capacitor?.isNativePlatform?.();
      const isReplit = window.location.hostname.includes('replit.app');
      
      let baseUrl = window.location.host;
      let protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      if (isCapacitor) {
        baseUrl = 'autobidtj-serviceapp225.replit.app';
        protocol = 'wss:';
      } else if (isReplit) {
        // Для production Replit всегда используем wss
        protocol = 'wss:';
      }
      
      const wsUrl = `${protocol}//${baseUrl}/ws`;
      
      console.log('🔌 Создание ЕДИНОГО WebSocket соединения:', wsUrl);
      console.log('🔍 Debug: isCapacitor:', isCapacitor, 'isReplit:', isReplit, 'protocol:', protocol);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ ЕДИНОЕ WebSocket соединение установлено');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Идентифицируем пользователя
        if (userId) {
          this.identifyUser(userId);
        }
        
        // Уведомляем все обработчики о подключении
        this.connectionHandlers.forEach(handler => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 WebSocket сообщение получено:', message.type);
          
          // Передаем сообщение всем зарегистрированным обработчикам
          this.messageHandlers.forEach(handler => {
            try {
              handler(message);
            } catch (error) {
              console.error('Ошибка в обработчике сообщения:', error);
            }
          });
        } catch (error) {
          console.error('Ошибка обработки WebSocket сообщения:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('❌ WebSocket соединение закрыто');
        this.isConnected = false;
        this.ws = null;
        
        // Автоматическое переподключение
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Переподключение WebSocket (попытка ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.connect(this.currentUserId || undefined);
          }, Math.min(1000 * this.reconnectAttempts, 5000)); // Экспоненциальная задержка до 5 сек
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket ошибка:', error);
        this.isConnected = false;
      };

    } catch (error) {
      console.error('❌ Ошибка создания WebSocket:', error);
    }
  }

  // Идентификация пользователя
  private identifyUser(userId: number) {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.currentUserId = userId;
      console.log('👤 Идентификация пользователя через ЕДИНОЕ соединение:', userId);
      this.ws.send(JSON.stringify({
        type: 'identify_user',
        userId: userId
      }));
    }
  }

  // Отправка сообщения
  send(message: any) {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket не подключен, сообщение не отправлено:', message);
    }
  }

  // Подписка на сообщения
  addMessageHandler(handler: (message: any) => void) {
    this.messageHandlers.add(handler);
    
    // Возвращаем функцию для отписки
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  // Подписка на события подключения
  addConnectionHandler(handler: () => void) {
    this.connectionHandlers.add(handler);
    
    // Возвращаем функцию для отписки
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  // Проверка состояния подключения
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws?.readyState,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Принудительное отключение (используется при выходе из приложения)
  disconnect() {
    console.log('🔌 Принудительное отключение WebSocket');
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.currentUserId = null;
    this.messageHandlers.clear();
    this.connectionHandlers.clear();
  }
}

export default WebSocketManager;