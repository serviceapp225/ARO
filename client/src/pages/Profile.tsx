import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Car, Gavel, Heart } from 'lucide-react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'buyer',
    joinDate: 'January 2024',
    avatar: '/api/placeholder/100/100'
  };

  const myListings = [
    {
      id: 1,
      title: '2020 BMW M3',
      status: 'active',
      currentBid: 85000,
      endDate: '2024-12-20',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300'
    }
  ];

  const myBids = [
    {
      id: 1,
      title: '2019 Porsche 911',
      myBid: 145000,
      currentBid: 147000,
      status: 'outbid',
      endDate: '2024-12-18',
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=300'
    }
  ];

  const favorites = [
    {
      id: 1,
      title: '2021 Tesla Model S',
      currentBid: 75000,
      endDate: '2024-12-22',
      image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=300'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-neutral-900">{user.name}</h1>
                  <p className="text-neutral-600">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary" className="capitalize">
                      {user.role}
                    </Badge>
                    <span className="text-sm text-neutral-500">
                      Member since {user.joinDate}
                    </span>
                  </div>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="bids">My Bids</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2">
                      <Car className="w-5 h-5" />
                      <span>Active Listings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {myListings.filter(l => l.status === 'active').length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2">
                      <Gavel className="w-5 h-5" />
                      <span>Active Bids</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-600">
                      {myBids.length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="w-5 h-5" />
                      <span>Favorites</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {favorites.length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="listings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  {myListings.length === 0 ? (
                    <div className="text-center py-8">
                      <Car className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-500">No listings yet</p>
                      <Button className="mt-4">Create Your First Listing</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myListings.map((listing) => (
                        <div key={listing.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img 
                            src={listing.image} 
                            alt={listing.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-sm text-neutral-500">
                              Current bid: ${listing.currentBid.toLocaleString()}
                            </p>
                          </div>
                          <Badge 
                            variant={listing.status === 'active' ? 'default' : 'secondary'}
                          >
                            {listing.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bids" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Bids</CardTitle>
                </CardHeader>
                <CardContent>
                  {myBids.length === 0 ? (
                    <div className="text-center py-8">
                      <Gavel className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-500">No bids placed yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myBids.map((bid) => (
                        <div key={bid.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img 
                            src={bid.image} 
                            alt={bid.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{bid.title}</h3>
                            <p className="text-sm text-neutral-500">
                              My bid: ${bid.myBid.toLocaleString()} | 
                              Current: ${bid.currentBid.toLocaleString()}
                            </p>
                          </div>
                          <Badge 
                            variant={bid.status === 'winning' ? 'default' : 'destructive'}
                          >
                            {bid.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Auctions</CardTitle>
                </CardHeader>
                <CardContent>
                  {favorites.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-500">No favorites yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {favorites.map((favorite) => (
                        <div key={favorite.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img 
                            src={favorite.image} 
                            alt={favorite.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{favorite.title}</h3>
                            <p className="text-sm text-neutral-500">
                              Current bid: ${favorite.currentBid.toLocaleString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            View Auction
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
