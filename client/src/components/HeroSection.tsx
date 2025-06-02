import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <section className="bg-gradient-to-br from-primary to-blue-800 text-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Find Your Dream Car at Auction
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-blue-100">
            Bid on premium vehicles from trusted sellers worldwide
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <Input 
                  type="text"
                  placeholder="Search by make, model, or year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 text-neutral-900 placeholder-neutral-500 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button 
                type="submit"
                className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-semibold"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-100">2,847</div>
              <div className="text-blue-200">Active Auctions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-100">$2.4M</div>
              <div className="text-blue-200">Cars Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-100">15,000+</div>
              <div className="text-blue-200">Happy Bidders</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
