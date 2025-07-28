import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
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

  const res = await fetch(url, {
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

    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
