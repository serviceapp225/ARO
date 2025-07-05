import { useQuery } from "@tanstack/react-query";
import type { Bid } from "@shared/schema";

export function useBidUpdates(listingId: number) {
  return useQuery<Bid[]>({
    queryKey: ['/api/listings', listingId, 'bids'],
    refetchInterval: 10000, // Обновление каждые 10 секунд для скорости
    staleTime: 0, // Данные всегда считаются устаревшими
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchIntervalInBackground: true, // Обновление даже когда вкладка не активна
  });
}