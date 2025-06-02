import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search as SearchIcon, Filter } from 'lucide-react';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    make: '',
    priceRange: '',
    year: '',
    mileage: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching:', { searchQuery, filters });
  };

  // Mock search results
  const searchResults = [
    {
      id: 1,
      title: '2020 Porsche 911 Turbo S',
      make: 'Porsche',
      year: 2020,
      mileage: 15000,
      currentBid: 145500,
      endTime: '2h 34m',
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400'
    },
    {
      id: 2,
      title: '2019 BMW M3',
      make: 'BMW',
      year: 2019,
      mileage: 22000,
      currentBid: 75000,
      endTime: '1d 12h',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'
    },
    {
      id: 3,
      title: '2021 Tesla Model S',
      make: 'Tesla',
      year: 2021,
      mileage: 8500,
      currentBid: 85000,
      endTime: '3d 5h',
      image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400'
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Search Auctions</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <Input
                      placeholder="Search by make, model, or keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <Select value={filters.make} onValueChange={(value) => setFilters(prev => ({ ...prev, make: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Make" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bmw">BMW</SelectItem>
                      <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                      <SelectItem value="audi">Audi</SelectItem>
                      <SelectItem value="porsche">Porsche</SelectItem>
                      <SelectItem value="tesla">Tesla</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-50000">$0 - $50,000</SelectItem>
                      <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100000-200000">$100,000 - $200,000</SelectItem>
                      <SelectItem value="200000+">$200,000+</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filters.year} onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2020">2020</SelectItem>
                      <SelectItem value="older">Older</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button type="submit" className="bg-primary hover:bg-blue-800">
                    <SearchIcon className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
          
          {/* Search Results */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">
              {searchResults.length} Results Found
            </h2>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((auction) => (
              <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative">
                  <img 
                    src={auction.image} 
                    alt={auction.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {auction.endTime} left
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    {auction.title}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {auction.mileage.toLocaleString()} miles
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-500">Current Bid</p>
                      <p className="text-xl font-bold text-emerald-600 font-mono">
                        ${auction.currentBid.toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <Button variant="outline" disabled>Previous</Button>
              <Button variant="outline" className="bg-primary text-white">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
