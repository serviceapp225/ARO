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
      // Auto-set yearTo when yearFrom is selected
      if (field === 'yearFrom' && value && !prev.yearTo) {
        newFilters.yearTo = currentYear.toString();
      }
      return newFilters;
    });
  };

  const hasActiveFilters = Object.values(searchFilters).some(value => value !== "");

  // Получаем все аукционы и фильтруем их на клиенте
  const { data: allAuctions = [], isLoading: auctionsLoading } = useQuery({
    queryKey: ['/api/listings'],
    queryFn: async () => {
      const response = await fetch('/api/listings');
      if (!response.ok) throw new Error('Failed to fetch auctions');
      return response.json();
    },
    staleTime: 30000
  });

  // Фильтруем аукционы по выбранным критериям
  const searchResults = allAuctions.filter((auction: any) => {
    // Фильтр по тексту (поиск в марке, модели, номере лота)
    if (searchFilters.query.trim()) {
      const query = searchFilters.query.toLowerCase();
      const searchText = `${auction.make} ${auction.model} ${auction.lotNumber}`.toLowerCase();
      if (!searchText.includes(query)) {
        return false;
      }
    }
    
    // Фильтр по марке
    if (searchFilters.brand) {
      if (auction.make.toLowerCase() !== searchFilters.brand.toLowerCase()) {
        return false;
      }
    }
    
    // Фильтр по модели
    if (searchFilters.model && auction.model !== searchFilters.model) {
      return false;
    }
    
    // Фильтр по году
    if (searchFilters.yearFrom && auction.year < parseInt(searchFilters.yearFrom)) {
      return false;
    }
    if (searchFilters.yearTo && auction.year > parseInt(searchFilters.yearTo)) {
      return false;
    }
    
    // Фильтр по цене
    if (searchFilters.priceFrom && parseFloat(auction.startingPrice) < parseFloat(searchFilters.priceFrom)) {
      return false;
    }
    if (searchFilters.priceTo && parseFloat(auction.startingPrice) > parseFloat(searchFilters.priceTo)) {
      return false;
    }
    
    return true;
  });

  const searchLoading = auctionsLoading;

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
              <ActiveAuctions customListings={searchResults} />
            )}
            
            {!searchLoading && searchResults.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Не нашли подходящий автомобиль?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Мы отправим уведомление, когда появятся автомобили по вашим критериям
                  </p>
                  <SimpleAlertButton searchFilters={searchFilters} />
                </div>
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