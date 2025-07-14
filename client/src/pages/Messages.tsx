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

      {/* Основной контент с современными карточками */}
      <div className="max-w-7xl mx-auto p-6 pb-24">
        <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="flex h-full">
            {/* Стильный список переписок */}
            <div className="w-1/3 border-r border-white/30 flex flex-col bg-gradient-to-b from-white/80 to-white/40">
              <div className="p-6 border-b border-white/30 bg-white/50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  Переписки
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`relative p-4 cursor-pointer transition-all duration-300 rounded-2xl group hover:shadow-lg ${
                      selectedConversation === conversation.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                        : "bg-white/70 hover:bg-white/90 backdrop-blur-sm"
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className={`w-12 h-12 ring-2 transition-all ${
                          selectedConversation === conversation.id 
                            ? "ring-white/50" 
                            : "ring-blue-200/50"
                        }`}>
                          <AvatarFallback className={`${
                            selectedConversation === conversation.id
                              ? "bg-white/20 text-white"
                              : "bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600"
                          }`}>
                            <User className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold truncate ${
                            selectedConversation === conversation.id 
                              ? "text-white" 
                              : "text-gray-900"
                          }`}>
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
                        
                        <p className={`text-sm mb-2 font-medium ${
                          selectedConversation === conversation.id 
                            ? "text-white/90" 
                            : "text-blue-600"
                        }`}>
                          {conversation.listing.make} {conversation.listing.model} {conversation.listing.year}
                        </p>
                        
                        {conversation.lastMessage && (
                          <p className={`text-sm truncate ${
                            selectedConversation === conversation.id 
                              ? "text-white/80" 
                              : "text-gray-500"
                          }`}>
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Область сообщений с современным дизайном */}
            <div className="flex-1 flex flex-col bg-gradient-to-b from-white/30 to-white/10">
              {/* Заголовок активной переписки */}
              <div className="p-6 border-b border-white/30 bg-white/50 backdrop-blur-sm flex-shrink-0">
                {selectedConversation && conversations.find(c => c.id === selectedConversation) ? (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-14 h-14 ring-2 ring-blue-200/50">
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600">
                          <User className="w-7 h-7" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {conversations.find(c => c.id === selectedConversation)?.otherUser.fullName}
                      </h2>
                      <p className="text-blue-600 font-medium">
                        {conversations.find(c => c.id === selectedConversation)?.listing.make}{" "}
                        {conversations.find(c => c.id === selectedConversation)?.listing.model}{" "}
                        {conversations.find(c => c.id === selectedConversation)?.listing.year}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-white/50 rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Активен</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <p className="text-gray-500 text-lg">Выберите переписку для начала общения</p>
                  </div>
                )}
              </div>

              {/* Сообщения с красивыми пузырями */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-white/20">
                {!selectedConversation ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                        <MessageCircle className="w-12 h-12 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Выберите переписку
                      </h2>
                      <p className="text-gray-600 text-lg">
                        Нажмите на переписку слева, чтобы начать общение
                      </p>
                    </div>
                  </div>
                ) : messagesLoading ? (
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
                        className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg backdrop-blur-sm relative ${
                          message.senderId === user?.userId
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-4"
                            : "bg-white/80 text-gray-900 mr-4"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.senderId === user?.userId
                              ? "text-white/80"
                              : "text-gray-500"
                          }`}
                        >
                          {formatDate(message.createdAt)}
                        </p>
                        {/* Хвостик сообщения */}
                        <div className={`absolute top-4 w-4 h-4 transform rotate-45 ${
                          message.senderId === user?.userId
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 -right-1"
                            : "bg-white/80 -left-1"
                        }`}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500 text-lg">Нет сообщений</p>
                  </div>
                )}
              </div>

              {/* Современное поле ввода */}
              <div className="p-6 border-t border-white/30 bg-white/50 backdrop-blur-sm flex-shrink-0">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
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
                      className="bg-white/80 border-white/30 rounded-2xl px-6 py-4 text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
                      disabled={sendMessageMutation.isPending || !selectedConversation || conversationsLoading}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending || !selectedConversation || conversationsLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl px-8 py-4 text-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {sendMessageMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Отправка...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Отправить
                      </div>
                    )}
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