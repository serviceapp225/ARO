import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ConversationData {
  id: number;
  listingId: number;
  listing: {
    id: number;
    make: string;
    model: string;
    year: number;
    lotNumber: string;
    photos: string[];
  };
  otherUser: {
    id: number;
    fullName: string;
    email: string;
  };
  lastMessage?: {
    id: number;
    content: string;
    createdAt: string;
    senderId: number;
  };
  unreadCount: number;
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  sender: {
    id: number;
    fullName: string;
    email: string;
  };
}

// Функция для форматирования даты
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Автоматическое обновление счетчика непрочитанных сообщений при открытии страницы
  useEffect(() => {
    if (user?.userId) {
      console.log(`📖 Пользователь открыл страницу сообщений - отмечаем посещение`);
      
      // Отмечаем посещение страницы сообщений
      apiRequest('POST', '/api/demo/mark-messages-visited', { userId: user.userId })
        .then(() => {
          console.log(`✅ Посещение страницы сообщений отмечено`);
          
          // ПРИНУДИТЕЛЬНО обновляем счетчик непрочитанных сообщений
          // 1. Удаляем старые данные из кэша
          queryClient.removeQueries({ queryKey: [`/api/messages/unread-count/${user.userId}`] });
          
          // 2. Принудительно загружаем новые данные
          queryClient.refetchQueries({ queryKey: [`/api/messages/unread-count/${user.userId}`] });
          
          // 3. Устанавливаем новое значение напрямую в кэш
          queryClient.setQueryData([`/api/messages/unread-count/${user.userId}`], { count: 0 });
          
          console.log(`🔄 Счетчик непрочитанных сообщений принудительно обновлен до 0`);
        })
        .catch(error => {
          console.error(`❌ Ошибка отметки посещения:`, error);
        });
    }
  }, [user?.userId, queryClient]);

  // Получение URL параметров
  const urlParams = new URLSearchParams(window.location.search);
  const buyerId = urlParams.get('buyerId');
  const sellerId = urlParams.get('sellerId');
  const listingId = urlParams.get('listingId');

  // Мутация для создания разговора
  const createConversationMutation = useMutation({
    mutationFn: async (data: { buyerId: number; sellerId: number; listingId: number }) => {
      const res = await apiRequest('POST', '/api/conversations', data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", user?.userId] });
      setSelectedConversation(data.id);
      // Очищаем URL параметры
      window.history.replaceState({}, '', window.location.pathname);
      toast({
        title: "Разговор создан",
        description: "Вы можете начать общение с продавцом",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать разговор",
        variant: "destructive",
      });
    },
  });

  // Получение списка переписок
  const { data: conversations, isLoading: conversationsLoading } = useQuery<ConversationData[]>({
    queryKey: ["/api/conversations", user?.userId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/conversations?userId=${user?.userId}`);
      return res.json();
    },
    enabled: !!user?.userId,
  });

  // Эффект для автоматического создания разговора при наличии параметров
  useEffect(() => {
    if (buyerId && sellerId && listingId && user && !createConversationMutation.isPending) {
      createConversationMutation.mutate({
        buyerId: parseInt(buyerId),
        sellerId: parseInt(sellerId),
        listingId: parseInt(listingId),
      });
    }
  }, [buyerId, sellerId, listingId, user]);

  // Получение сообщений для выбранной переписки
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    queryFn: async () => {
      console.log(`🔍 Получаем сообщения для переписки ${selectedConversation}`);
      const res = await apiRequest('GET', `/api/conversations/${selectedConversation}/messages`);
      const result = await res.json();
      console.log(`✅ Получены сообщения:`, result);
      return result;
    },
    enabled: !!selectedConversation,
    staleTime: 0, // Всегда обновляем данные
    gcTime: 0, // Не кэшируем
  });

  // Автоматическое отмечение сообщений как прочитанных при открытии переписки
  useEffect(() => {
    if (selectedConversation && messages && messages.length > 0 && user?.userId) {
      console.log(`📖 Отмечаем сообщения как прочитанные для переписки ${selectedConversation}`);
      // Находим все непрочитанные сообщения от других пользователей
      const unreadMessages = messages.filter(msg => msg.senderId !== user.userId);
      
      // Отмечаем каждое непрочитанное сообщение как прочитанное
      unreadMessages.forEach(async (message) => {
        try {
          await apiRequest('PATCH', `/api/conversations/${selectedConversation}/messages/${message.id}/read`);
          console.log(`✅ Сообщение ${message.id} отмечено как прочитанное`);
        } catch (error) {
          console.error(`❌ Ошибка отметки сообщения ${message.id} как прочитанного:`, error);
        }
      });

      // Обновляем список переписок и счетчик через 500мс для обновления счетчика
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/conversations", user.userId] });
        queryClient.invalidateQueries({ queryKey: [`/api/messages/unread-count/${user.userId}`] });
      }, 500);
    }
  }, [selectedConversation, messages, user?.userId, queryClient]);

  // Мутация для отправки сообщения
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; content: string }) => {
      console.log(`📤 Отправка сообщения: conversationId=${data.conversationId}, content="${data.content}", senderId=${user?.userId}`);
      const res = await apiRequest('POST', `/api/conversations/${data.conversationId}/messages`, { 
        content: data.content,
        senderId: user?.userId 
      });
      const result = await res.json();
      console.log(`✅ Ответ сервера:`, result);
      return result;
    },
    onSuccess: () => {
      console.log(`✅ Сообщение отправлено успешно, обновляем кэш и принудительно загружаем сообщения`);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", user?.userId] });
      refetchMessages(); // Принудительно загружаем сообщения
      setMessageText("");
    },
    onError: (error: any) => {
      console.error(`❌ Ошибка отправки сообщения:`, error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить сообщение",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageText,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Сегодня";
    } else if (diffDays === 2) {
      return "Вчера";
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  // Состояние загрузки
  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] pb-24">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-500">Загрузка переписок...</p>
        </div>
      </div>
    );
  }

  // Нет переписок
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] pb-24">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Нет сообщений
          </h2>
          <p className="text-gray-500 mb-4">
            Когда вы начнете общение с продавцами, ваши переписки появятся здесь
          </p>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок страницы */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            Сообщения - Новый дизайн
          </h1>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-6xl mx-auto p-4 pb-24">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Список переписок */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Переписки</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 border-b border-gray-100 ${
                      selectedConversation === conversation.id
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.otherUser.fullName}
                          </h3>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {conversation.listing.make} {conversation.listing.model} {conversation.listing.year}
                        </p>
                        
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Область сообщений */}
            <div className="flex-1 flex flex-col">
              {/* Заголовок переписки */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                {selectedConversation && conversations.find(c => c.id === selectedConversation) ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {conversations.find(c => c.id === selectedConversation)?.otherUser.fullName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {conversations.find(c => c.id === selectedConversation)?.listing.make}{" "}
                        {conversations.find(c => c.id === selectedConversation)?.listing.model}{" "}
                        {conversations.find(c => c.id === selectedConversation)?.listing.year}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2">
                    <p className="text-gray-500">Выберите переписку для начала общения</p>
                  </div>
                )}
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {!selectedConversation ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Выберите переписку
                      </h2>
                      <p className="text-gray-500">
                        Нажмите на переписку слева, чтобы начать общение
                      </p>
                    </div>
                  </div>
                ) : messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500">Загрузка сообщений...</p>
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.userId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                          message.senderId === user?.userId
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === user?.userId
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500">Нет сообщений</p>
                  </div>
                )}
              </div>

              {/* Поле ввода */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={
                      conversationsLoading 
                        ? "Загрузка переписок..." 
                        : selectedConversation 
                          ? "Введите сообщение..." 
                          : "Сначала выберите переписку"
                    }
                    onKeyPress={(e) => e.key === "Enter" && selectedConversation && handleSendMessage()}
                    className="flex-1"
                    disabled={sendMessageMutation.isPending || !selectedConversation || conversationsLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending || !selectedConversation || conversationsLoading}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sendMessageMutation.isPending ? "Отправка..." : "Отправить"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}