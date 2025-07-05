import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { BrandCarousel } from '@/components/BrandCarousel';
import { ActiveAuctions } from '@/components/ActiveAuctions';
import { SellCarTripleCarousel } from '@/components/SellCarTripleCarousel';
import { SecondTripleCarousel } from '@/components/SecondTripleCarousel';
import { SellYourCar } from '@/components/SellYourCar';
import { Footer } from '@/components/Footer';
import { AuctionDetailModal } from '@/components/AuctionDetailModal';


export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <HeroSection onSearch={setSearchQuery} />
      
      {/* Main content area */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            <BrandCarousel />
            <SellCarTripleCarousel />
            <SecondTripleCarousel />
            <ActiveAuctions searchQuery={searchQuery} />
            <SellYourCar />
          </div>
          
          {/* Пустая боковая панель */}
          <div className="lg:col-span-1 space-y-6">
            {/* Банеры удалены */}
          </div>
        </div>
      </div>
      
      <Footer />
      <AuctionDetailModal />
    </div>
  );
}
