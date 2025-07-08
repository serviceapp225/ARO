import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface OptimisticBid {
  listingId: number;
  amount: string;
  timestamp: number;
}

// Хук для оптимистичного обновления ставок
export function useOptimisticBids() {
  const [optimisticBids, setOptimisticBids] = useState<Map<number, OptimisticBid>>(new Map());
  const queryClient = useQueryClient();

  // Функция для добавления оптимистичной ставки
  const addOptimisticBid = (listingId: number, amount: string) => {
    const bid: OptimisticBid = {
      listingId,
      amount,
      timestamp: Date.now()
    };
    
    setOptimisticBids(prev => new Map(prev).set(listingId, bid));
    
    // Мгновенно обновляем данные в кэше TanStack Query
    queryClient.setQueryData(['/api/listings'], (oldData: any[]) => {
      if (!oldData) return oldData;
      
      return oldData.map(listing => 
        listing.id === listingId 
          ? { ...listing, currentBid: amount }
          : listing
      );
    });
    
    console.log(`🚀 Оптимистичная ставка ${amount} для аукциона ${listingId}`);
    
    // Удаляем оптимистичную ставку через 3 секунды
    setTimeout(() => {
      setOptimisticBids(prev => {
        const newMap = new Map(prev);
        newMap.delete(listingId);
        return newMap;
      });
    }, 3000);
  };

  // Получить оптимистичную ставку для конкретного аукциона
  const getOptimisticBid = (listingId: number) => {
    return optimisticBids.get(listingId);
  };

  return {
    addOptimisticBid,
    getOptimisticBid,
    optimisticBids
  };
}