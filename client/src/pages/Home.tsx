import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { BrandCarousel } from '@/components/BrandCarousel';
import { ActiveAuctions } from '@/components/ActiveAuctions';
import { SellYourCar } from '@/components/SellYourCar';
import { Footer } from '@/components/Footer';
import { AuctionDetailModal } from '@/components/AuctionDetailModal';
import { BannerDisplay } from '@/components/BannerDisplay';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <HeroSection onSearch={setSearchQuery} />
      <BrandCarousel />
      <ActiveAuctions searchQuery={searchQuery} />
      <SellYourCar />
      <Footer />
      <AuctionDetailModal />
    </div>
  );
}
