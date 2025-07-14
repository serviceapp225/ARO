import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Send, ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  // Получение списка переписок
  const { data: conversations, isLoading: conversationsLoading } = useQuery<ConversationData[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  // Получение сообщений для выбранной переписки
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      // TODO: Реализовать отправку сообщения
      setMessageText("");
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
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
      <div className="flex items-center justify-center min-h-[400px]">
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
      <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="max-w-6xl mx-auto p-4 h-screen flex">
      {/* Список переписок */}
      <div className="w-1/3 border-r border-gray-200 pr-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Сообщения
        </h1>
        
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedConversation === conversation.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 flex flex-col pl-4">
        {selectedConversation ? (
          <>
            {/* Заголовок переписки */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              {conversations.find(c => c.id === selectedConversation) && (
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
              )}
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messagesLoading ? (
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
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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
            <div className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Введите сообщение..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Отправить
              </Button>
            </div>
          </>
        ) : (
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
        )}
      </div>
    </div>
  );
}