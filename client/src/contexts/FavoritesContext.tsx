import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface FavoritesContextType {
  favorites: Set<string>;
  addToFavorites: (listingId: string) => Promise<void>;
  removeFromFavorites: (listingId: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  getFavoritesList: () => string[];
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current user ID
  const getCurrentUserId = () => {
    return (user as any)?.userId || null;
  };

  const userId = getCurrentUserId();

  // Fetch favorites from database with smart caching
  const { data: favoritesData, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/favorites`],
    enabled: !!userId,
    staleTime: 60000, // 1 минута кэша
    gcTime: 300000, // 5 минут в памяти (было cacheTime в v4)
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/favorites`);
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return response.json();
    }
  });

  // Update local favorites when data changes
  useEffect(() => {
    if (favoritesData) {
      const favoriteIds = favoritesData.map((fav: any) => fav.listingId.toString());
      setFavorites(new Set(favoriteIds));
    }
  }, [favoritesData]);

  // Add to favorites mutation
  const addMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!userId) throw new Error('User not authenticated');
      
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          listingId: parseInt(listingId)
        })
      });
      
      if (!response.ok) throw new Error('Failed to add favorite');
      return response.json();
    },
    onSuccess: (data, listingId) => {
      setFavorites(prev => new Set(prev).add(listingId));
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/favorites`] });
    }
  });

  // Remove from favorites mutation
  const removeMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!userId) throw new Error('User not authenticated');
      
      // Find the favorite ID to delete
      const favorite = favoritesData?.find((fav: any) => fav.listingId.toString() === listingId);
      if (!favorite) throw new Error('Favorite not found');
      
      const response = await fetch(`/api/favorites/${favorite.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to remove favorite');
    },
    onSuccess: (data, listingId) => {
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.delete(listingId);
        return newFavorites;
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/favorites`] });
    }
  });

  const addToFavorites = async (listingId: string) => {
    await addMutation.mutateAsync(listingId);
  };

  const removeFromFavorites = async (listingId: string) => {
    await removeMutation.mutateAsync(listingId);
  };

  const isFavorite = (id: string) => {
    return favorites.has(id);
  };

  const getFavoritesList = () => {
    return Array.from(favorites);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      getFavoritesList,
      isLoading
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}