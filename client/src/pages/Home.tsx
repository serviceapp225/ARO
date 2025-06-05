import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { BrandCarousel } from '@/components/BrandCarousel';
import { ActiveAuctions } from '@/components/ActiveAuctions';
import { SellYourCar } from '@/components/SellYourCar';
import { Footer } from '@/components/Footer';
import { AuctionDetailModal } from '@/components/AuctionDetailModal';
import FloatingNotificationButton from '@/components/FloatingNotificationButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <HeroSection />
      <BrandCarousel />
      <ActiveAuctions />
      <SellYourCar />
      <Footer />
      <AuctionDetailModal />
      <FloatingNotificationButton />
    </div>
  );
}
