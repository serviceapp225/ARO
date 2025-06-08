import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
  favorites: Set<string>;
  addToFavorites: (id: string) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getFavoritesList: () => string[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Загружаем избранное из localStorage при инициализации
  useEffect(() => {
    const savedFavorites = localStorage.getItem('auction-favorites');
    if (savedFavorites) {
      try {
        const favoritesArray = JSON.parse(savedFavorites);
        setFavorites(new Set(favoritesArray));
      } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
      }
    }
  }, []);

  // Сохраняем избранное в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('auction-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const addToFavorites = (id: string) => {
    setFavorites(prev => new Set(prev).add(id));
  };

  const removeFromFavorites = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.delete(id);
      return newFavorites;
    });
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
      getFavoritesList
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