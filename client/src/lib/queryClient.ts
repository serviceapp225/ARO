import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Try to parse error response for better error messages
    try {
      const errorData = JSON.parse(text);
      if (errorData.error === "Already highest bidder") {
        throw new Error("Already highest bidder");
      }
      if (errorData.message) {
        throw new Error(errorData.message);
      }
    } catch (parseError) {
      // If JSON parsing fails, use original text
    }
    
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Определяем базовый URL для Capacitor приложения
  const isCapacitor = (window as any).Capacitor?.isNativePlatform?.();
  const baseUrl = isCapacitor ? 'https://autobidtj-serviceapp225.replit.app' : '';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  // Получаем информацию о пользователе из localStorage для аутентификации
  const userStr = localStorage.getItem('demo-user') || localStorage.getItem('currentUser');
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.userId) {
        headers['x-user-id'] = user.userId.toString();
      }
      if (user.email) {
        headers['x-user-email'] = user.email;
      }
    } catch (error) {
      console.warn('Ошибка парсинга пользователя из localStorage:', error);
    }
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Определяем базовый URL для Capacitor приложения  
    const isCapacitor = (window as any).Capacitor?.isNativePlatform?.();
    const baseUrl = isCapacitor ? 'https://autobidtj-serviceapp225.replit.app' : '';
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    // Получаем информацию о пользователе для GET запросов
    const userStr = localStorage.getItem('demo-user') || localStorage.getItem('currentUser');
    const headers: HeadersInit = {};
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.userId) {
          headers['x-user-id'] = user.userId.toString();
        }
        if (user.email) {
          headers['x-user-email'] = user.email;
        }
      } catch (error) {
        console.warn('Ошибка парсинга пользователя из localStorage в getQueryFn:', error);
      }
    }

    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Кастомный persister с размерным лимитом для localStorage
const persistOptions = {
  persister: {
    persistClient: async (client: any) => {
      try {
        // Ограничиваем размер кэша до 5MB (увеличиваем лимит чтобы избежать очистки)
        const clientStr = JSON.stringify(client);
        if (clientStr.length > 5 * 1024 * 1024) { // 5MB лимит
          console.warn('🧹 TanStack Query кэш превышает 5MB, выборочно очищаем старые запросы');
          // Вместо полной очистки удаляем только старые запросы
          queryClient.removeQueries({
            predicate: (query) => {
              const age = Date.now() - (query.state.dataUpdatedAt || 0);
              // Не удаляем критические запросы аукционов и списков
              const isCritical = query.queryKey[0] === '/api/listings' || 
                                String(query.queryKey[0]).includes('/api/listings/');
              return !isCritical && age > 30 * 60 * 1000; // Удаляем только некритичные данные старше 30 минут
            }
          });
          return;
        }
        
        const dataWithTimestamp = {
          data: client,
          timestamp: Date.now()
        };
        localStorage.setItem('tanstack-query-cache', JSON.stringify(dataWithTimestamp));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('🧹 localStorage переполнен при сохранении кэша, выборочная очистка');
          // Вместо полной очистки делаем выборочную очистку старых данных
          queryClient.removeQueries({
            predicate: (query) => {
              const age = Date.now() - (query.state.dataUpdatedAt || 0);
              // Не удаляем критические запросы аукционов и списков
              const isCritical = query.queryKey[0] === '/api/listings' || 
                                String(query.queryKey[0]).includes('/api/listings/');
              return !isCritical && age > 30 * 60 * 1000; // Удаляем только некритичные данные старше 30 минут
            }
          });
          
          // Очищаем только старые кэши из localStorage
          try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const key = localStorage.key(i);
              if (key && key.includes('tanstack')) {
                const stored = localStorage.getItem(key);
                if (stored) {
                  try {
                    const parsed = JSON.parse(stored);
                    const age = Date.now() - (parsed.timestamp || 0);
                    if (age > 30 * 60 * 1000) { // Старше 30 минут
                      localStorage.removeItem(key);
                    }
                  } catch (parseError) {
                    localStorage.removeItem(key); // Удаляем поврежденные данные
                  }
                }
              }
            }
          } catch (cleanupError) {
            console.error('❌ Ошибка очистки кэша:', cleanupError);
          }
        } else {
          console.error('❌ Ошибка сохранения кэша:', error);
        }
      }
    },
    restoreClient: async () => {
      try {
        const stored = localStorage.getItem('tanstack-query-cache');
        if (!stored) return undefined;
        
        const parsed = JSON.parse(stored);
        
        // Проверяем возраст кэша (максимум 1 час)
        if (parsed.timestamp && parsed.data) {
          const age = Date.now() - parsed.timestamp;
          const maxAge = 60 * 60 * 1000; // 1 час
          
          if (age > maxAge) {
            localStorage.removeItem('tanstack-query-cache');
            return undefined;
          }
          return parsed.data;
        }
        
        return parsed; // Старый формат
      } catch (error) {
        console.error('❌ Ошибка восстановления кэша:', error);
        localStorage.removeItem('tanstack-query-cache');
        return undefined;
      }
    },
    removeClient: async () => {
      localStorage.removeItem('tanstack-query-cache');
    }
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 0, // Никогда не кэшируем для мгновенных обновлений ставок
      gcTime: 60000, // 1 минута в памяти
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
