// Утилита для управления индикатором "+1" новых сообщений

export const setHasNewMessages = (userId: number) => {
  localStorage.setItem(`hasNewMessages_${userId}`, 'true');
  console.log(`📩 Установлен индикатор "+1" для пользователя ${userId}`);
};

export const clearHasNewMessages = (userId: number) => {
  localStorage.removeItem(`hasNewMessages_${userId}`);
  console.log(`🔄 Очищен индикатор "+1" для пользователя ${userId}`);
};

export const getHasNewMessages = (userId: number): boolean => {
  const hasNew = localStorage.getItem(`hasNewMessages_${userId}`) === 'true';
  console.log(`📊 Статус индикатора "+1" для пользователя ${userId}: ${hasNew}`);
  return hasNew;
};