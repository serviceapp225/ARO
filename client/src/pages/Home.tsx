import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { BrandCarousel } from '@/components/BrandCarousel';
import { ActiveAuctions } from '@/components/ActiveAuctions';
import { SellYourCar } from '@/components/SellYourCar';
import { Footer } from '@/components/Footer';
import { AuctionDetailModal } from '@/components/AuctionDetailModal';
import { BannerDisplay } from '@/components/BannerDisplay';
import { SellCarBanner } from '@/components/SellCarBanner';
import { HeroBanners } from '@/components/HeroBanners';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <HeroSection onSearch={setSearchQuery} />
      
      {/* Hero Banners - Main promotional banners */}
      <HeroBanners />
      
      {/* Main content area */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            <BrandCarousel />
            <ActiveAuctions searchQuery={searchQuery} />
            <SellYourCar />
          </div>
          
          {/* Sidebar with additional banners */}
          <div className="lg:col-span-1 space-y-6">
            <BannerDisplay position="sidebar" className="sticky top-4" />
          </div>
        </div>
      </div>
      
      <Footer />
      <AuctionDetailModal />
    </div>
  );
}
