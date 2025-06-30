import { Heart, Clock, Car, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountdownTimer } from './CountdownTimer';
import { LazyCarImage } from './LazyCarImage';
import { useAuctions } from '@/contexts/AuctionContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useLocation } from 'wouter';
import { useState, useEffect, useMemo, memo } from 'react';


interface ActiveAuctionsProps {
  searchQuery?: string;
  customListings?: any[];
}

export function ActiveAuctions({ searchQuery = "", customListings }: ActiveAuctionsProps) {
  const { auctions, loading } = useAuctions();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  

  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("recent");

  const ITEMS_PER_PAGE = 20;



  // Use custom listings if provided, otherwise use filtered auctions
  const sourceAuctions = customListings || auctions;
  
  // Memoize filtered and sorted auctions for better performance
  const displayedAuctions = useMemo(() => {
    // First filter for active auctions only
    const activeAuctions = sourceAuctions.filter((auction: any) => auction.status === 'active');
    
    // Then filter by search query (lot number or car name)
    const filteredAuctions = activeAuctions.filter((auction: any) => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      const lotMatch = auction.lotNumber?.toLowerCase().includes(query);
      const carNameMatch = `${auction.make} ${auction.model}`.toLowerCase().includes(query);
      
      return lotMatch || carNameMatch;
    });

    // Sort auctions based on selected criteria
    const sortedAuctions = [...filteredAuctions].sort((a: any, b: any) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.currentBid || '0') - parseFloat(b.currentBid || '0');
        case "price-high":
          return parseFloat(b.currentBid || '0') - parseFloat(a.currentBid || '0');
        case "year-new":
          return b.year - a.year;
        case "year-old":
          return a.year - b.year;
        case "time-ending":
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        case "recent":
        default:
          return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
      }
    });

    // Calculate displayed auctions based on current page
    return sortedAuctions.slice(0, page * ITEMS_PER_PAGE);
  }, [sourceAuctions, searchQuery, sortBy, page]);

  const handleToggleFavorite = async (auctionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorite(auctionId)) {
        await removeFromFavorites(auctionId);
      } else {
        await addToFavorites(auctionId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Reset pagination when sorting changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [sortBy]);

  // Handle scroll to load more real data
  useEffect(() => {
    const handleScroll = () => {
      if (
        !loadingMore && 
        hasMore && 
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000
      ) {
        setLoadingMore(true);
        
        // Load more items immediately
        const nextPage = page + 1;
        const totalAvailable = sourceAuctions.length;
        
        if (nextPage * ITEMS_PER_PAGE >= totalAvailable) {
          setHasMore(false);
        }
        
        setPage(nextPage);
        setLoadingMore(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, loadingMore, hasMore, auctions.length]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-20">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200" />
            <CardContent className="p-3">
              <div className="h-3 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-20">
      {/* Sorting Controls */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Сортировка:</span>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">По умолчанию</SelectItem>
            <SelectItem value="price-low">Дешевые</SelectItem>
            <SelectItem value="price-high">Дорогие</SelectItem>
            <SelectItem value="year-new">Новые</SelectItem>
            <SelectItem value="year-old">Старые</SelectItem>
            <SelectItem value="time-ending">Скоро закончатся</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {displayedAuctions.map((auction, index) => (
          <Card
            key={`${auction.id}-${index}`}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setLocation(`/auction/${auction.id}`)}
          >
            <div className="relative">
              <LazyCarImage
                listingId={auction.id}
                make={auction.make}
                model={auction.model}
                year={auction.year}
                className="h-32"
              />
              <div className="absolute top-2 left-2">
                <CountdownTimer 
                  endTime={auction.endTime || auction.auctionEndTime} 
                  size="small"
                />
              </div>
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 bg-black/50 text-white hover:bg-black/70"
                  onClick={(e) => handleToggleFavorite(auction.id, e)}
                >
                  <Heart className={`h-3 w-3 ${isFavorite(auction.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="mb-1">
                <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {auction.lotNumber}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">
                {auction.make} {auction.model}
              </h3>
              <div className="text-xs text-gray-600 mb-2 space-y-0.5">
                <p>Год: {auction.year}</p>
                <p>Пробег: {auction.mileage.toLocaleString()} км</p>
              </div>
              
              {/* Индикаторы статуса */}
              <div className="flex flex-wrap gap-1 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  auction.customsCleared 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {auction.customsCleared ? '✓ Растаможен' : '✗ Не растаможен'}
                </span>
                
                <span className={`text-xs px-2 py-1 rounded-full ${
                  auction.recycled 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {auction.recycled ? 'Утилизация: есть' : 'Утилизация: нет'}
                </span>
                
                <span className={`text-xs px-2 py-1 rounded-full ${
                  auction.technicalInspectionValid 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {auction.technicalInspectionValid 
                    ? `ТО до ${auction.technicalInspectionDate}` 
                    : 'ТО: нет'}
                </span>
                
                <span className={`text-xs px-2 py-1 rounded-full ${
                  auction.tinted 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {auction.tinted 
                    ? `Тонировка (${auction.tintingDate || 'есть'})` 
                    : 'Тонировка: нет'}
                </span>
              </div>
              <div className="mb-2">
                {(auction.currentBid && auction.currentBid !== '0' && auction.currentBid !== '' && !isNaN(parseFloat(auction.currentBid))) ? (
                  <>
                    <p className="text-xs text-gray-500">Текущая ставка</p>
                    <p className="text-sm font-bold text-green-600">
                      {parseFloat(auction.currentBid).toLocaleString()} Сомони
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">Стартовая цена</p>
                    <p className="text-sm font-bold text-blue-600">
                      {parseFloat(auction.startingPrice || '0').toLocaleString()} Сомони
                    </p>
                  </>
                )}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{auction.bidCount} ставок</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Loading more indicator */}
      {loadingMore && (
        <div className="text-center mt-8 p-4">
          <p className="text-gray-500">Загружаем еще автомобили...</p>
        </div>
      )}
      
      {/* Show message when no auctions available */}
      {displayedAuctions.length === 0 && !loading && (
        <div className="text-center mt-8 p-8 bg-gray-50 rounded-lg">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          {searchQuery.trim() ? (
            <>
              <p className="text-gray-600 text-lg mb-2">Не нашли подходящий автомобиль</p>
              <div className="max-w-sm mx-auto">
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-lg mb-2">Нет активных аукционов</p>
              <p className="text-gray-500 text-sm">Новые автомобили появятся скоро</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
