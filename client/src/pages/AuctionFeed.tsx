import { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ActiveAuctions } from "@/components/ActiveAuctions";

export default function AuctionFeed() {
  const [sortBy, setSortBy] = useState("new");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedTransmission, setSelectedTransmission] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");

  const clearFilters = () => {
    setSelectedBrand("");
    setSelectedYear("");
    setSelectedPrice("");
    setSelectedTransmission("");
    setSelectedFuel("");
  };

  const activeFiltersCount = [selectedBrand, selectedYear, selectedPrice, selectedTransmission, selectedFuel]
    .filter(Boolean).length;

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Все аукционы</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filters Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-neutral-600" />
                <span className="font-medium">Фильтры</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Очистить
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Марка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toyota">Toyota</SelectItem>
                  <SelectItem value="bmw">BMW</SelectItem>
                  <SelectItem value="mercedes">Mercedes</SelectItem>
                  <SelectItem value="audi">Audi</SelectItem>
                  <SelectItem value="volkswagen">Volkswagen</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Год" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                  <SelectItem value="2019">2019</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger>
                  <SelectValue placeholder="Цена" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-10000">До $10,000</SelectItem>
                  <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                  <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
                  <SelectItem value="50000+">Свыше $50,000</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedTransmission} onValueChange={setSelectedTransmission}>
                <SelectTrigger>
                  <SelectValue placeholder="КПП" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Автомат</SelectItem>
                  <SelectItem value="manual">Механика</SelectItem>
                  <SelectItem value="cvt">Вариатор</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFuel} onValueChange={setSelectedFuel}>
                <SelectTrigger>
                  <SelectValue placeholder="Топливо" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Бензин</SelectItem>
                  <SelectItem value="diesel">Дизель</SelectItem>
                  <SelectItem value="hybrid">Гибрид</SelectItem>
                  <SelectItem value="electric">Электро</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sort Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Активные аукционы
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