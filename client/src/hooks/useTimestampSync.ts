// ОТКЛЮЧЕНО: Хук заменен на WebSocket real-time обновления через useOptimizedRealTime
// Оставляю для совместимости, но не выполняет никаких запросов

export function useTimestampSync() {
  console.log('⚠️ useTimestampSync отключен - используется WebSocket real-time обновления');
  
  // Возвращаем пустые данные для совместимости
  return {
    lastUpdate: Date.now(),
    isActive: false
  };
}