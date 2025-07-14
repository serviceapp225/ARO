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
  const conversationId = urlParams.get('conversationId');

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

  // Эффект для автоматического выбора разговора при наличии conversationId
  useEffect(() => {
    if (conversationId && conversations) {
      const targetConversation = conversations.find(c => c.id === parseInt(conversationId));
      if (targetConversation) {
        setSelectedConversation(targetConversation.id);
        // Очищаем URL параметры
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [conversationId, conversations]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Современный заголовок с градиентом */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Сообщения
                </h1>
                <p className="text-gray-600 text-sm">Общение с продавцами автомобилей</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/50 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Онлайн</span>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент - только переписки */}
      <div className="max-w-4xl mx-auto p-6 pb-24">
        <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">

          
          <div className="p-4 space-y-4">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
                {/* Заголовок переписки */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/90 transition-all duration-300"
                  onClick={() => setSelectedConversation(selectedConversation === conversation.id ? null : conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-blue-200/50">
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600">
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.otherUser.fullName}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-xs text-white font-bold">
                              {conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-blue-600 font-medium mb-2">
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

                {/* Развернутая переписка */}
                {selectedConversation === conversation.id && (
                  <div className="border-t border-white/30 bg-gradient-to-b from-white/50 to-white/30">
                    {/* Сообщения */}
                    <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <span className="ml-2 text-gray-600">Загрузка сообщений...</span>
                          </div>
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
                              className={`max-w-xs px-4 py-3 rounded-2xl shadow-md relative ${
                                message.senderId === user?.userId
                                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                                  : "bg-white/90 text-gray-900"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.senderId === user?.userId
                                    ? "text-white/80"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatDate(message.createdAt)}
                              </p>
                              {/* Хвостик сообщения */}
                              <div className={`absolute top-3 w-3 h-3 transform rotate-45 ${
                                message.senderId === user?.userId
                                  ? "bg-gradient-to-br from-blue-500 to-purple-600 -right-1"
                                  : "bg-white/90 -left-1"
                              }`}></div>
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
                    <div className="p-4 border-t border-white/30 bg-white/40">
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Input
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Введите сообщение..."
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            className="bg-white/80 border-white/30 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                            disabled={sendMessageMutation.isPending}
                          />
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || sendMessageMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl px-6 py-3 shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {sendMessageMutation.isPending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}