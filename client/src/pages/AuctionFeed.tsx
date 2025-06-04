import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActiveAuctions } from "@/components/ActiveAuctions";

export default function AuctionFeed() {
  const [sortBy, setSortBy] = useState("new");

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Активные аукционы</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">


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