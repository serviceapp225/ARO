// ОТКЛЮЧЕНО: Хук заменен на WebSocket real-time обновления через useOptimizedRealTime
// Оставляю для совместимости, но не выполняет никаких операций

export function usePollingSync(intervalMs: number = 200) {
  console.log('⚠️ usePollingSync отключен - используется WebSocket real-time обновления');
  
  // Возвращаем пустую функцию для совместимости
  return {
    isActive: false,
    lastUpdate: Date.now()
  };
}