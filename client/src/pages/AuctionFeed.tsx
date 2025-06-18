import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SimpleAlertButton from "@/components/SimpleAlertButton";

import { CAR_MAKES, getModelsForMake } from "@shared/car-data";
import { useLocation } from "wouter";

export default function AuctionFeed() {
  const [location] = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const queryClient = useQueryClient();
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    brand: "",
    model: "",
    yearFrom: "",
    yearTo: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
    engineVolumeFrom: "",
    engineVolumeTo: "",
    mileageFrom: "",
    mileageTo: "",
    priceFrom: "",
    priceTo: "",
    customsCleared: ""
  });

  // Обработка параметров поиска из URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchFilters(prev => ({ ...prev, query: searchQuery }));
    }
  }, [location]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => (currentYear - i).toString());
  
  const bodyTypes = ["Седан", "Кроссовер", "Внедорожник", "Хэтчбек", "Универсал", "Минивен", "Купе", "Кабриолет", "Пикап"];
  const fuelTypes = ["Бензин", "Дизель", "Газ", "Газ+Бензин", "Гибрид", "Электро"];
  const transmissions = ["Автомат", "Механика", "Вариатор"];

  const handleFilterChange = (field: string, value: string) => {
    setSearchFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      // Reset model when brand changes
      if (field === 'brand') {
        newFilters.model = '';
      }
      return newFilters;
    });
  };

  const hasActiveFilters = Object.values(searchFilters).some(value => value !== "");

  // API запрос для поиска по критериям
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['/api/listings/search', JSON.stringify(searchFilters), forceRefresh],
    queryFn: async () => {
      console.log('Executing search with filters:', searchFilters);
      const params = new URLSearchParams();
      
      // Добавляем поиск по тексту
      if (searchFilters.query.trim()) {
        params.append('query', searchFilters.query.trim());
      }
      
      // Добавляем фильтр по марке
      if (searchFilters.brand) {
        const brandName = CAR_MAKES.find(make => make.toLowerCase() === searchFilters.brand.toLowerCase());
        if (brandName) {
          params.append('make', brandName);
        }
      }
      
      // Добавляем фильтр по модели
      if (searchFilters.model) {
        params.append('model', searchFilters.model);
      }
      
      // Добавляем другие фильтры
      if (searchFilters.yearFrom) {
        params.append('minYear', searchFilters.yearFrom);
      }
      
      if (searchFilters.yearTo) {
        params.append('maxYear', searchFilters.yearTo);
      }
      
      if (searchFilters.priceFrom) {
        params.append('minPrice', searchFilters.priceFrom);
      }
      
      if (searchFilters.priceTo) {
        params.append('maxPrice', searchFilters.priceTo);
      }
      
      const response = await fetch(`/api/listings/search?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: hasActiveFilters,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const handleSearch = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/listings/search'] });
    setForceRefresh(prev => prev + 1);
  };

  const clearFilters = () => {
    setSearchFilters({
      query: "",
      brand: "",
      model: "",
      yearFrom: "",
      yearTo: "",
      bodyType: "",
      fuelType: "",
      transmission: "",
      engineVolumeFrom: "",
      engineVolumeTo: "",
      mileageFrom: "",
      mileageTo: "",
      priceFrom: "",
      priceTo: "",
      customsCleared: ""
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-neutral-900 text-center">Найди свой будущий автомобиль</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          {/* Filter Header */}
          {hasActiveFilters && (
            <div className="flex justify-end mb-6">
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                <X className="w-4 h-4 mr-1" />
                Очистить все
              </Button>
            </div>
          )}

          {/* All Filters Visible */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Марка
                </label>
                <Select value={searchFilters.brand} onValueChange={(value) => handleFilterChange("brand", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите марку" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_MAKES.map((brand) => (
                      <SelectItem key={brand} value={brand.toLowerCase()}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Модель
                </label>
                <Select 
                  value={searchFilters.model} 
                  onValueChange={(value) => handleFilterChange("model", value)}
                  disabled={!searchFilters.brand}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={searchFilters.brand ? "Выберите модель" : "Сначала выберите марку"} />
                  </SelectTrigger>
                  <SelectContent>
                    {searchFilters.brand && getModelsForMake(
                      CAR_MAKES.find(make => make.toLowerCase() === searchFilters.brand) || ''
                    ).map((model) => (
                      <SelectItem key={model} value={model.toLowerCase()}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Год выпуска
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Select value={searchFilters.yearFrom} onValueChange={(value) => handleFilterChange("yearFrom", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="С" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={searchFilters.yearTo} onValueChange={(value) => handleFilterChange("yearTo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="По" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип кузова
              </label>
              <Select value={searchFilters.bodyType} onValueChange={(value) => handleFilterChange("bodyType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип кузова" />
                </SelectTrigger>
                <SelectContent>
                  {bodyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип топлива
                </label>
                <Select value={searchFilters.fuelType} onValueChange={(value) => handleFilterChange("fuelType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Тип топлива" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Трансмиссия
                </label>
                <Select value={searchFilters.transmission} onValueChange={(value) => handleFilterChange("transmission", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="КПП" />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Растаможен
                </label>
                <Select value={searchFilters.customsCleared} onValueChange={(value) => handleFilterChange("customsCleared", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Растаможен" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Да</SelectItem>
                    <SelectItem value="no">Нет</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Объем двигателя (л)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="От"
                  value={searchFilters.engineVolumeFrom}
                  onChange={(e) => handleFilterChange("engineVolumeFrom", e.target.value)}
                />
                
                <Input
                  type="number"
                  step="0.1"
                  placeholder="До"
                  value={searchFilters.engineVolumeTo}
                  onChange={(e) => handleFilterChange("engineVolumeTo", e.target.value)}
                />
              </div>
            </div>

            {/* Search and Clear Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              {hasActiveFilters && (
                <div className="text-center text-sm text-gray-600 mb-2">
                  Нажмите кнопку "Поиск" для применения фильтров
                </div>
              )}
              
              <Button 
                onClick={handleSearch}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
                disabled={!hasActiveFilters}
              >
                <Search className="w-5 h-5 mr-2" />
                Найти автомобили
              </Button>
              
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Очистить все фильтры
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search Results or All Auctions */}
        {hasActiveFilters ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Результаты поиска ({searchResults.length})
              </h2>
              {searchLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Поиск автомобилей...</p>
                </div>
              )}
            </div>
            
            {!searchLoading && searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((listing: any) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      {listing.images && listing.images.length > 0 ? (
                        <img 
                          src={listing.images[0]} 
                          alt={`${listing.make} ${listing.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Фото отсутствует
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                        #{listing.lotNumber}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {listing.make} {listing.model}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p>{listing.year} г. • {listing.mileage?.toLocaleString()} км</p>
                        <p>{listing.engineVolume}л • {listing.fuelType}</p>
                        <p>{listing.transmission} • {listing.bodyType}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Текущая ставка</p>
                          <p className="font-bold text-lg text-red-600">
                            ${listing.currentBid?.toLocaleString() || listing.startingPrice?.toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          onClick={() => window.location.href = `/auction/${listing.id}`}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Участвовать
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            

            
            {/* Показать кнопку уведомления, если есть фильтры но мало результатов */}
            {hasActiveFilters && !searchLoading && searchResults.length < 3 && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Не нашли подходящий автомобиль?
                </h3>
                <p className="text-gray-600 mb-4">
                  Мы отправим уведомление, когда появятся автомобили по вашим критериям
                </p>
                <SimpleAlertButton 
                  searchFilters={{
                    brand: searchFilters.brand,
                    model: searchFilters.model,
                    yearFrom: searchFilters.yearFrom,
                    yearTo: searchFilters.yearTo,
                    priceFrom: searchFilters.priceFrom,
                    priceTo: searchFilters.priceTo,
                    bodyType: searchFilters.bodyType,
                    fuelType: searchFilters.fuelType,
                    transmission: searchFilters.transmission,
                    customsCleared: searchFilters.customsCleared
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Auctions Grid */}
            <ActiveAuctions />
          </>
        )}


      </main>
    </div>
  );
}