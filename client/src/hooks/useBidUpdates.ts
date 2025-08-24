import { useQuery } from "@tanstack/react-query";
import type { Bid } from "@shared/schema";

export function useBidUpdates(listingId: number) {
  return useQuery<Bid[]>({
    queryKey: ['/api/listings', listingId, 'bids'],
    // Убираем refetchInterval - используем только WebSocket для обновлений ставок
    staleTime: 10000, // Данные свежие 10 секунд, WebSocket обновляет мгновенно
    refetchOnWindowFocus: true,
    refetchOnMount: false, // Не перезапрашивать при переходах
    // Убираем refetchIntervalInBackground - WebSocket работает в фоне
  });
}