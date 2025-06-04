import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { CAR_MAKES, getModelsForMake } from "@shared/car-data";

export default function AuctionFeed() {
  const [sortBy, setSortBy] = useState("new");
  const [showFilters, setShowFilters] = useState(false);
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

  const hasActiveFilters = Object.values(searchFilters).some(value => value !== "");

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
      priceTo: ""
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Активные аукционы</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          {/* Filter Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Найди свой будущий автомобиль
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {Object.values(searchFilters).filter(Boolean).length}
                </Badge>
              )}
            </h3>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                <X className="w-4 h-4 mr-1" />
                Очистить все
              </Button>
            )}
          </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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


          </div>
        </div>

        {/* Sort and Results Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Результаты поиска
          </h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Новые</SelectItem>
              <SelectItem value="ending">Заканчиваются</SelectItem>
              <SelectItem value="price-low">Низкая цена</SelectItem>
              <SelectItem value="price-high">Высокая цена</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auctions Grid */}
        <ActiveAuctions />
      </main>
    </div>
  );
}