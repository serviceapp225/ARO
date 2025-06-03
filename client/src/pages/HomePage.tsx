import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ActiveAuctions } from "@/components/ActiveAuctions";
import { BrandCarousel } from "@/components/BrandCarousel";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header with App Name and WhatsApp */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">AUTOAUCTION</h1>
          <Button variant="ghost" size="sm" className="text-green-600">
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Announcement Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Добро пожаловать на аукцион автомобилей!
            </h2>
            <p className="text-blue-700">
              Найдите автомобиль своей мечты или продайте свой по лучшей цене
            </p>
          </CardContent>
        </Card>

        {/* Current Auctions Section */}
        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            Текущие аукционы
          </h2>
          <ActiveAuctions />
        </section>

        {/* Popular Brands Section */}
        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            Популярные марки
          </h2>
          <BrandCarousel />
        </section>
      </main>
    </div>
  );
}