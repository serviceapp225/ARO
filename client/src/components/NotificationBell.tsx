import { useState, useEffect } from 'react';
import { Bell, X, Car, Trash2, Gavel } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import type { Notification } from '@shared/schema';
import { useAuctionWebSocket } from '@/hooks/useAuctionWebSocket';

interface NotificationBellProps {
  userId: number;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Подключаемся к WebSocket для мгновенного обновления уведомлений
  useAuctionWebSocket();
  
  // Загружаем список удаленных уведомлений из localStorage с временными метками
  const [deletedNotificationIds, setDeletedNotificationIds] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(`deletedNotifications_${userId}`);
      const result = stored ? new Set<number>(JSON.parse(stored)) : new Set<number>();

      return result;
    } catch {
      console.log('Failed to load deleted notifications from localStorage');
      return new Set<number>();
    }
  });



  // Сохраняем изменения в localStorage
  const updateDeletedNotifications = (newSet: Set<number>) => {
    setDeletedNotificationIds(newSet);
    try {
      const arrayData: number[] = [];
      newSet.forEach(id => arrayData.push(id));
      const key = `deletedNotifications_${userId}`;
      localStorage.setItem(key, JSON.stringify(arrayData));

    } catch (error) {
      console.warn('Failed to save deleted notifications to localStorage:', error);
    }
  };
  
  // Manual refetch when opening notifications
  const handleToggleOpen = () => {
    const newOpenState = !isOpen;
    setIsOpen(newOpenState);
    
    // Only fetch if we have no data at all
    if (newOpenState && !allNotifications.length) {
      queryClient.refetchQueries({ queryKey: [`/api/notifications/${userId}`] });
    }
  };

  const [, setLocation] = useLocation();

  const { data: allNotifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/notifications/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      return data;
    },
    enabled: true,
    refetchInterval: 30 * 1000, // Стабильные 30 секунд - полагаемся на WebSocket для обновлений
    staleTime: 2 * 60 * 1000, // Данные актуальны 2 минуты
    refetchOnWindowFocus: false, // НЕ обновлять при фокусе
    refetchOnMount: false, // Не перезапрашивать при переходах
    gcTime: 5 * 60 * 1000, // Кэш хранится 5 минут для стабильности
  });

  // НЕ очищаем удаленные уведомления автоматически
  // Пользователь удалил их намеренно, они должны оставаться скрытыми
  // пока не будут очищены вручную или не истечет срок хранения

  // Показываем уведомления о ставках и найденных машинах, исключаем уведомления о создании поисковых запросов
  const notifications = allNotifications.filter(n => {
    // Исключаем уведомления о создании поисковых запросов
    if (n.type === 'alert_created') return false;
    
    // Проверяем localStorage для индивидуально удаленных уведомлений
    return !deletedNotificationIds.has(n.id);
  });



  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${userId}`] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }
      return notificationId;
    },
    onMutate: async (notificationId: number) => {
      // Немедленно добавляем в список удаленных для мгновенного скрытия
      const newSet = new Set(deletedNotificationIds).add(notificationId);
      updateDeletedNotifications(newSet);
    },
    onSuccess: () => {
      // Не делаем никаких дополнительных обновлений кэша
      // Уведомление уже скрыто через onMutate, этого достаточно
    },
    onError: (error, notificationId) => {
      console.error('Failed to delete notification:', error);
      // При ошибке убираем из списка удаленных
      const newSet = new Set(deletedNotificationIds);
      newSet.delete(notificationId);
      updateDeletedNotifications(newSet);
    },
  });



  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to auction page for both car_found and bid_outbid notifications
    if ((notification.type === 'car_found' || notification.type === 'bid_outbid') && notification.listingId) {
      setIsOpen(false);
      setLocation(`/auction/${notification.listingId}`);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Уведомления</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Загрузка...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm mb-1">Нет новых уведомлений</p>
                <p className="text-xs">Создайте поисковые запросы в разделе "Аукционы" для получения уведомлений о подходящих машинах</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 opacity-100 transform translate-y-0 ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  style={{ animation: 'fadeIn 0.2s ease-in-out' }}
                >
                  <div className="flex items-start gap-3">
                    {notification.type === 'car_found' && (
                      <Car className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    )}
                    {notification.type === 'bid_outbid' && (
                      <Gavel className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    {notification.type !== 'car_found' && notification.type !== 'bid_outbid' && (
                      <Bell className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead 
                            ? 'text-blue-900 dark:text-blue-100' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        !notification.isRead 
                          ? 'text-blue-700 dark:text-blue-200' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDate(notification.createdAt!)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('🗑️ Удаление уведомления:', notification.id);
                        deleteNotificationMutation.mutate(notification.id);
                      }}
                      disabled={deleteNotificationMutation.isPending}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 z-10"
                      title="Удалить уведомление"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}