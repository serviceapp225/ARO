import { useQuery } from "@tanstack/react-query";
import type { Bid } from "@shared/schema";

export function useBidUpdates(listingId: number) {
  return useQuery<Bid[]>({
    queryKey: ['/api/listings', listingId, 'bids'],
    refetchInterval: 1000, // Обновление каждую секунду
    staleTime: 0, // Данные всегда считаются устаревшими
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchIntervalInBackground: true, // Обновление даже когда вкладка не активна
  });
}