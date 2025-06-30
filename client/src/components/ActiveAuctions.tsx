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
import { useQueryClient } from '@tanstack/react-query';


interface ActiveAuctionsProps {
  searchQuery?: string;
  customListings?: any[];
}

export function ActiveAuctions({ searchQuery = "", customListings }: ActiveAuctionsProps) {
  const { auctions, loading } = useAuctions();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const queryClient = useQueryClient();

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

  // Fast navigation with preloading
  const handleCardClick = async (auctionId: number) => {
    // Preload auction data and bids immediately
    queryClient.prefetchQuery({
      queryKey: [`/api/listings/${auctionId}`],
      staleTime: 30000, // Keep fresh for 30 seconds
    });
    
    queryClient.prefetchQuery({
      queryKey: [`/api/listings/${auctionId}/bids`],
      staleTime: 1000, // Bids need frequent updates
    });

    // Navigate immediately
    setLocation(`/auction/${auctionId}`);
  };

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
          <Card key={i} className="animate-pulse rounded-xl overflow-hidden">
            <div className="h-48 bg-gray-200" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-3" />
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded mb-3" />
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
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
            className="group relative rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => handleCardClick(auction.id)}
          >
            <div className="relative">
              <LazyCarImage
                listingId={auction.id}
                make={auction.make}
                model={auction.model}
                year={auction.year}
                className="h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
              
              <div className="absolute top-3 left-3">
                <CountdownTimer 
                  endTime={auction.endTime || auction.auctionEndTime} 
                  size="small"
                />
              </div>
              
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                  onClick={(e) => handleToggleFavorite(auction.id, e)}
                >
                  <Heart className={`h-4 w-4 ${isFavorite(auction.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </Button>
              </div>
              
              {/* Status Badge */}
              <div className="absolute bottom-3 left-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                  auction.bidCount > 5 ? 'bg-red-600' :
                  auction.bidCount > 2 ? 'bg-orange-600' :
                  'bg-green-600'
                }`}>
                  {auction.bidCount > 5 ? 'ГОРЯЧИЙ АУКЦИОН' :
                   auction.bidCount > 2 ? 'АКТИВНЫЙ' :
                   'НОВЫЙ'}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="mb-2">
                <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {auction.lotNumber}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {auction.make} {auction.model}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {auction.year} • {auction.mileage.toLocaleString()} км • {auction.location || 'Душанбе'}
              </p>
              
              {/* Compact status indicators */}
              <div className="flex flex-wrap gap-1 mb-3">
                {auction.customsCleared && (
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                    Растаможен
                  </span>
                )}
                {auction.recycled && (
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                    Утилизация
                  </span>
                )}
                {auction.technicalInspectionValid && (
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                    ТО до {auction.technicalInspectionDate || 'н/д'}
                  </span>
                )}
                {auction.tinted && (
                  <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700">
                    Тонировка {auction.tintingDate ? `до ${auction.tintingDate}` : ''}
                  </span>
                )}
              </div>
              
              {/* Price section */}
              <div className="flex justify-between items-center">
                <div>
                  {(auction.currentBid && auction.currentBid !== '0' && auction.currentBid !== '' && !isNaN(parseFloat(auction.currentBid))) ? (
                    <span className="text-blue-600 font-bold">
                      от {parseFloat(auction.currentBid).toLocaleString()} с.
                    </span>
                  ) : (
                    <span className="text-blue-600 font-bold">
                      от {parseFloat(auction.startingPrice || '0').toLocaleString()} с.
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {auction.bidCount} ставок
                </span>
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
