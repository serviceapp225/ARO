import { useState, useEffect } from "react";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SimpleAlertButton from "@/components/SimpleAlertButton";

import { CAR_MAKES, getModelsForMake } from "@shared/car-data";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [forceRefresh, setForceRefresh] = useState(0);
  const queryClient = useQueryClient();
  const [searchFilters, setSearchFilters] = useState({
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
    priceTo: ""
  });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => (currentYear - i).toString());
  
  const bodyTypes = ["Седан", "Кроссовер", "Внедорожник", "Хэтчбек", "Универсал", "Минивен", "Купе", "Кабриолет", "Пикап"];
  const fuelTypes = ["Бензин", "Дизель", "Гибрид", "Электро"];
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

  const clearFilter = (field: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: "" }));
  };

  const clearAllFilters = () => {
    setSearchFilters({
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
      priceTo: ""
    });
  };

  // Build search filters for API
  const buildSearchFilters = () => {
    const filters: any = {};
    
    if (searchQuery.trim()) {
      filters.query = searchQuery.trim();
    }
    
    if (searchFilters.brand) {
      // Найти марку с учетом регистра
      const brandName = CAR_MAKES.find(make => make.toLowerCase() === searchFilters.brand.toLowerCase());
      if (brandName) {
        filters.make = brandName;
      }
    }
    
    if (searchFilters.yearFrom) {
      filters.minYear = parseInt(searchFilters.yearFrom);
    }
    
    if (searchFilters.yearTo) {
      filters.maxYear = parseInt(searchFilters.yearTo);
    }
    
    if (searchFilters.priceFrom) {
      filters.minPrice = parseFloat(searchFilters.priceFrom);
    }
    
    if (searchFilters.priceTo) {
      filters.maxPrice = parseFloat(searchFilters.priceTo);
    }
    
    return filters;
  };

  // Search query with filters
  const searchQueryParams = buildSearchFilters();
  const activeFiltersCount = Object.values(searchFilters).filter(Boolean).length;
  const hasSearchCriteria = activeFiltersCount > 0 || Object.keys(searchQueryParams).length > 0;
  
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/listings/search', JSON.stringify(searchFilters), forceRefresh],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Добавляем поиск по тексту
      if (searchQuery.trim()) {
        params.append('query', searchQuery.trim());
      }
      
      // Добавляем фильтр по марке
      if (searchFilters.brand) {
        params.append('make', searchFilters.brand);
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
    enabled: hasSearchCriteria && forceRefresh > 0,
    staleTime: 0,
    refetchOnMount: true
  });

  const handleSearch = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/listings/search'] });
    setForceRefresh(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Поиск автомобилей</h1>
          <p className="text-neutral-600 mt-1">Найдите автомобиль по параметрам</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Параметры поиска
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </CardTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Очистить все
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Поиск по номеру лота и названию */}
              <div className="space-y-2">
                <Label>Поиск по номеру лота или названию автомобиля</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Введите номер лота (например: 724583) или название автомобиля (Toyota Camry)"
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Введите 6-значный номер лота для быстрого поиска или название автомобиля
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Марка</Label>
                  <div className="flex gap-2">
                    <Select value={searchFilters.brand} onValueChange={(value) => handleFilterChange("brand", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите марку" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAR_MAKES.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {searchFilters.brand && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("brand")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Модель</Label>
                  <div className="flex gap-2">
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
                    {searchFilters.model && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("model")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Год выпуска</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2">
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
                    {searchFilters.yearFrom && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("yearFrom")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
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
                    {searchFilters.yearTo && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("yearTo")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Тип кузова</Label>
                <div className="flex gap-2">
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
                  {searchFilters.bodyType && (
                    <Button variant="ghost" size="sm" onClick={() => clearFilter("bodyType")}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип топлива</Label>
                  <div className="flex gap-2">
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
                    {searchFilters.fuelType && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("fuelType")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Трансмиссия</Label>
                  <div className="flex gap-2">
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
                    {searchFilters.transmission && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("transmission")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Объем двигателя (л)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="От"
                      value={searchFilters.engineVolumeFrom}
                      onChange={(e) => handleFilterChange("engineVolumeFrom", e.target.value)}
                    />
                    {searchFilters.engineVolumeFrom && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("engineVolumeFrom")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="До"
                      value={searchFilters.engineVolumeTo}
                      onChange={(e) => handleFilterChange("engineVolumeTo", e.target.value)}
                    />
                    {searchFilters.engineVolumeTo && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("engineVolumeTo")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Пробег (км)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <Select value={searchFilters.mileageFrom} onValueChange={(value) => handleFilterChange("mileageFrom", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="От" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="25000">25,000</SelectItem>
                        <SelectItem value="50000">50,000</SelectItem>
                        <SelectItem value="75000">75,000</SelectItem>
                        <SelectItem value="100000">100,000</SelectItem>
                        <SelectItem value="150000">150,000</SelectItem>
                        <SelectItem value="200000">200,000</SelectItem>
                        <SelectItem value="250000">250,000</SelectItem>
                      </SelectContent>
                    </Select>
                    {searchFilters.mileageFrom && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("mileageFrom")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={searchFilters.mileageTo} onValueChange={(value) => handleFilterChange("mileageTo", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="До" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25000">25,000</SelectItem>
                        <SelectItem value="50000">50,000</SelectItem>
                        <SelectItem value="75000">75,000</SelectItem>
                        <SelectItem value="100000">100,000</SelectItem>
                        <SelectItem value="150000">150,000</SelectItem>
                        <SelectItem value="200000">200,000</SelectItem>
                        <SelectItem value="250000">250,000</SelectItem>
                        <SelectItem value="300000">300,000</SelectItem>
                      </SelectContent>
                    </Select>
                    {searchFilters.mileageTo && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("mileageTo")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Цена ($)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="От"
                      value={searchFilters.priceFrom}
                      onChange={(e) => handleFilterChange("priceFrom", e.target.value)}
                    />
                    {searchFilters.priceFrom && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("priceFrom")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="До"
                      value={searchFilters.priceTo}
                      onChange={(e) => handleFilterChange("priceTo", e.target.value)}
                    />
                    {searchFilters.priceTo && (
                      <Button variant="ghost" size="sm" onClick={() => clearFilter("priceTo")}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Button onClick={handleSearch} className="w-full bg-red-600 hover:bg-red-700 text-lg py-3">
                <SearchIcon className="w-5 h-5 mr-2" />
                Найти автомобили
              </Button>
            </CardContent>
          </Card>

          {activeFiltersCount > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-neutral-600">Активные фильтры:</span>
                  {Object.entries(searchFilters).map(([key, value]) => {
                    if (!value) return null;
                    const labels: Record<string, string> = {
                      brand: "Марка",
                      model: "Модель",
                      yearFrom: "Год с",
                      yearTo: "Год по", 
                      bodyType: "Кузов",
                      fuelType: "Топливо",
                      transmission: "КПП",
                      engineVolumeFrom: "Объем с",
                      engineVolumeTo: "Объем до",
                      mileageFrom: "Пробег с",
                      mileageTo: "Пробег до",
                      priceFrom: "Цена с",
                      priceTo: "Цена до"
                    };
                    return (
                      <Badge key={key} variant="secondary" className="gap-1">
                        {labels[key]}: {value}
                        <button onClick={() => clearFilter(key)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">
                Результаты поиска
              </h2>
              {activeFiltersCount > 0 && (
                <div className="w-64">
                </div>
              )}
            </div>
            {/* Search Results */}
            {forceRefresh > 0 && activeFiltersCount > 0 ? (
              <div>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                        <div className="space-y-2">
                          <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                          <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Найдено {searchResults.length} автомобилей
                    </p>
                    <ActiveAuctions customListings={searchResults} />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ничего не найдено
                    </h3>
                    <p className="text-gray-600">
                      По заданным критериям автомобили не найдены
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeFiltersCount > 0 ? "Нажмите кнопку 'Поиск' для начала поиска" : "Введите параметры поиска"}
                </h3>
                <p className="text-gray-600">
                  {activeFiltersCount > 0 ? "Фильтры настроены, теперь запустите поиск" : "Используйте фильтры выше для поиска автомобилей"}
                </p>
              </div>
            )}
            
            {/* Показать кнопку уведомления, если есть фильтры но мало результатов */}
            {forceRefresh > 0 && activeFiltersCount > 0 && !isLoading && searchResults.length < 3 && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Не нашли подходящий автомобиль?
                </h3>
                <p className="text-gray-600 mb-4">
                  Создайте уведомление и мы сообщим, когда появится автомобиль с нужными параметрами
                </p>
                <div className="max-w-sm mx-auto">
                  <SimpleAlertButton searchFilters={searchFilters} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}