import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import url from 'url';

interface WebSocketClient {
  ws: WebSocket;
  userId?: number;
  listingId?: number;
  lastPing: number;
}

interface AuctionRoom {
  listingId: number;
  clients: Set<WebSocketClient>;
  lastUpdate: number;
  isHotAuction: boolean; // Последняя минута
}

class AuctionWebSocketManager {
  private wss: WebSocketServer;
  private rooms: Map<number, AuctionRoom> = new Map();
  private clients: Set<WebSocketClient> = new Set();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      clientTracking: false
    });
    
    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Heartbeat для очистки мертвых соединений
    this.heartbeatInterval = setInterval(() => {
      this.cleanup();
    }, 30000); // Каждые 30 секунд
    
    console.log('🔌 WebSocket сервер запущен для real-time аукционов');
  }

  private handleConnection(ws: WebSocket, request: any) {
    const client: WebSocketClient = {
      ws,
      lastPing: Date.now()
    };
    
    this.clients.add(client);
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(client, message);
      } catch (error) {
        console.error('Ошибка парсинга WebSocket сообщения:', error);
      }
    });
    
    ws.on('close', () => {
      this.removeClient(client);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket ошибка:', error);
      this.removeClient(client);
    });
    
    // Отправляем приветствие
    this.sendMessage(client, {
      type: 'connected',
      message: 'WebSocket подключен для real-time обновлений'
    });
  }

  private handleMessage(client: WebSocketClient, message: any) {
    console.log('📨 WebSocket сообщение от клиента:', message);
    
    switch (message.type) {
      case 'join_auction':
        console.log(`🎯 Клиент присоединяется к аукциону ${message.listingId}, пользователь ${message.userId || 'не определен'}`);
        this.joinAuction(client, message.listingId, message.userId);
        break;
      case 'leave_auction':
        console.log('🚪 Клиент покидает аукцион');
        this.leaveAuction(client);
        break;
      case 'ping':
        client.lastPing = Date.now();
        this.sendMessage(client, { type: 'pong' });
        break;
      case 'identify_user':
        // Идентификация пользователя для уведомлений
        if (message.userId) {
          client.userId = message.userId;
          console.log(`👤 Клиент идентифицирован как пользователь ${message.userId}`);
          this.sendMessage(client, { 
            type: 'user_identified', 
            userId: message.userId,
            message: 'Пользователь успешно идентифицирован для уведомлений' 
          });
        }
        break;
      case 'place_bid':
        // НОВАЯ СИСТЕМА: Обработка ставок через WebSocket
        if (message.listingId && message.amount && message.bidderId) {
          console.log(`🎯 НОВАЯ СТАВКА через WebSocket: Аукцион ${message.listingId}, пользователь ${message.bidderId}, сумма ${message.amount}`);
          this.handleBidPlacement(message.listingId, message.bidderId, message.amount, client);
        }
        break;
      case 'bid_placement':
        // НОВАЯ СИСТЕМА: Уведомления о размещении ставки
        if (message.listingId && message.amount && message.bidderId) {
          console.log(`💰 Уведомление о размещении ставки: Аукцион ${message.listingId}, пользователь ${message.bidderId}, сумма ${message.amount}`);
          this.handleBidPlacement(message.listingId, message.bidderId, message.amount, client);
        }
        break;
    }
  }

  private joinAuction(client: WebSocketClient, listingId: number, userId?: number) {
    // Покидаем предыдущую комнату
    this.leaveAuction(client);
    
    client.listingId = listingId;
    client.userId = userId;
    
    // Создаем комнату если не существует
    if (!this.rooms.has(listingId)) {
      this.rooms.set(listingId, {
        listingId,
        clients: new Set(),
        lastUpdate: Date.now(),
        isHotAuction: false
      });
    }
    
    const room = this.rooms.get(listingId)!;
    room.clients.add(client);
    
    console.log(`👥 Пользователь ${userId || 'гость'} подключился к аукциону ${listingId} (${room.clients.size} активных)`);
    
    this.sendMessage(client, {
      type: 'joined_auction',
      listingId,
      participantCount: room.clients.size
    });
  }

  private leaveAuction(client: WebSocketClient) {
    if (client.listingId) {
      const room = this.rooms.get(client.listingId);
      if (room) {
        room.clients.delete(client);
        
        // Удаляем пустую комнату
        if (room.clients.size === 0) {
          this.rooms.delete(client.listingId);
        }
      }
      
      client.listingId = undefined;
      client.userId = undefined;
    }
  }

  private removeClient(client: WebSocketClient) {
    this.leaveAuction(client);
    this.clients.delete(client);
  }

  private sendMessage(client: WebSocketClient, message: any) {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Ошибка отправки WebSocket сообщения:', error);
        this.removeClient(client);
      }
    }
  }

  private cleanup() {
    const now = Date.now();
    const deadClients: WebSocketClient[] = [];
    
    this.clients.forEach((client) => {
      // Удаляем клиентов без пинга более 60 секунд
      if (now - client.lastPing > 60000 || client.ws.readyState !== WebSocket.OPEN) {
        deadClients.push(client);
      }
    });
    
    deadClients.forEach(client => this.removeClient(client));
    
    if (deadClients.length > 0) {
      console.log(`🧹 Очищено ${deadClients.length} неактивных WebSocket соединений`);
    }
  }

  // Публичные методы для отправки обновлений

  public broadcastBidUpdate(listingId: number, bidData: any) {
    const room = this.rooms.get(listingId);
    console.log(`📡 broadcastBidUpdate: аукцион ${listingId}, комната найдена: ${!!room}`);
    
    if (!room) {
      console.log(`❌ Комната для аукциона ${listingId} не найдена! Доступные комнаты: ${Array.from(this.rooms.keys())}`);
      return;
    }

    console.log(`👥 Отправляем bid_update в комнату ${listingId} для ${room.clients.size} клиентов`);

    const message = {
      type: 'bid_update',
      listingId,
      data: bidData,
      timestamp: Date.now()
    };

    this.broadcastToRoom(room, message);
    room.lastUpdate = Date.now();
    
    console.log(`✅ bid_update отправлено для аукциона ${listingId}`);
  }

  public broadcastAuctionEnd(listingId: number, finalData: any) {
    const room = this.rooms.get(listingId);
    if (!room) return;

    const message = {
      type: 'auction_ended',
      listingId,
      data: finalData,
      timestamp: Date.now()
    };

    this.broadcastToRoom(room, message);
  }

  public sendNotificationToUser(userId: number, notification: any) {
    // Находим всех клиентов этого пользователя
    let notificationSent = false;
    let activeClients = 0;
    let totalClients = 0;
    
    console.log(`🔍 Поиск клиентов для пользователя ${userId}:`);
    
    this.clients.forEach((client) => {
      totalClients++;
      if (client.userId === userId) {
        console.log(`  • Найден клиент пользователя ${userId}, статус WebSocket: ${client.ws.readyState === WebSocket.OPEN ? 'OPEN' : 'CLOSED'}`);
        if (client.ws.readyState === WebSocket.OPEN) {
          activeClients++;
          this.sendMessage(client, {
            type: 'notification',
            data: notification,
            timestamp: Date.now()
          });
          notificationSent = true;
          console.log(`  ✅ Уведомление отправлено пользователю ${userId}`);
        }
      }
    });
    
    console.log(`📊 Статус для пользователя ${userId}: активных клиентов ${activeClients}, всего клиентов WebSocket: ${totalClients}`);
    
    if (!notificationSent) {
      console.log(`⚠️ Пользователь ${userId} не подключен к WebSocket, уведомление не отправлено`);
    }
  }

  public setHotAuction(listingId: number, isHot: boolean) {
    const room = this.rooms.get(listingId);
    if (room) {
      room.isHotAuction = isHot;
      
      // Уведомляем участников о режиме "горячего" аукциона
      this.broadcastToRoom(room, {
        type: 'hot_auction_mode',
        listingId,
        isHot,
        message: isHot ? 'Последняя минута! Ставки в реальном времени' : 'Обычный режим ставок'
      });
      
      console.log(`🔥 Аукцион ${listingId} переведен в ${isHot ? 'горячий' : 'обычный'} режим`);
    }
  }

  private broadcastToRoom(room: AuctionRoom, message: any) {
    const deadClients: WebSocketClient[] = [];
    
    room.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(client, message);
      } else {
        deadClients.push(client);
      }
    });
    
    // Удаляем мертвые соединения
    deadClients.forEach(client => room.clients.delete(client));
  }

  // НОВЫЙ МЕТОД: Обработка ставок через WebSocket с уведомлениями
  async handleBidPlacement(listingId: number, bidderId: number, amount: string, client: WebSocketClient) {
    try {
      console.log(`💰 Обработка WebSocket ставки: аукцион ${listingId}, пользователь ${bidderId}, сумма ${amount}`);
      
      // Импортируем storage напрямую
      const { storage } = await import('./storage');
      
      // Получаем всех участников этого аукциона (кто делал ставки)
      const allBids = await storage.getBidsForListing(listingId);
      const uniqueBidders = new Set<number>();
      allBids.forEach(bid => {
        if (bid.bidderId !== bidderId) { // Исключаем текущего участника
          uniqueBidders.add(bid.bidderId);
        }
      });
      
      console.log(`📢 Найдено ${uniqueBidders.size} участников для уведомления о перебитии ставки`);
      console.log(`👥 Участники:`, Array.from(uniqueBidders));
      
      // Получаем информацию об аукционе для уведомления
      const listing = await storage.getListing(listingId);
      if (!listing) {
        console.error(`❌ Аукцион ${listingId} не найден`);
        return;
      }
      
      // Отправляем уведомления всем перебитым участникам через WebSocket
      for (const participantId of uniqueBidders) {
        const carTitle = `${listing.make} ${listing.model} ${listing.year}`;
        const formattedAmount = parseInt(amount).toLocaleString('ru-RU');
        
        const notification = {
          type: 'bid_outbid',
          listingId: listingId,
          listingTitle: carTitle,
          newAmount: amount,
          message: `🔔 Ваша ставка перебита ${carTitle} Сделайте новую ставку выше ${formattedAmount} сомони!`
        };
        
        // Отправляем уведомление через WebSocket всем подключенным клиентам этого пользователя
        this.sendNotificationToUserAdvanced(participantId, notification);
        
        // Уведомления теперь создаются только в HTTP API при создании ставки
        console.log(`🔕 WebSocket создание уведомлений отключено - используем только HTTP API`);
        // Убрано дублирующее создание уведомлений через WebSocket
      }
      
      // Подтверждаем клиенту успешную обработку
      this.sendMessage(client, {
        type: 'bid_processed',
        success: true,
        message: `Ставка ${amount} Сомони обработана, уведомлено ${uniqueBidders.size} участников`
      });
      
    } catch (error) {
      console.error('❌ Ошибка обработки WebSocket ставки:', error);
      this.sendMessage(client, {
        type: 'bid_processed',
        success: false,
        message: 'Ошибка обработки ставки'
      });
    }
  }
  
  // Отправка уведомления конкретному пользователю (улучшенная версия)
  private sendNotificationToUserAdvanced(userId: number, notification: any) {
    let sentCount = 0;
    
    // Ищем всех клиентов этого пользователя
    this.clients.forEach(client => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(client, notification);
        sentCount++;
      }
    });
    
    console.log(`📬 Уведомление отправлено пользователю ${userId} на ${sentCount} устройств`);
  }

  public getStats() {
    return {
      totalClients: this.clients.size,
      activeRooms: this.rooms.size,
      hotAuctions: Array.from(this.rooms.values()).filter(room => room.isHotAuction).length
    };
  }

  public shutdown() {
    clearInterval(this.heartbeatInterval);
    this.wss.close();
    console.log('🔌 WebSocket сервер остановлен');
  }
}

export default AuctionWebSocketManager;