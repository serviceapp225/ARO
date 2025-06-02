import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Users, Car, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  // Mock data
  const pendingListings = [
    {
      id: 1,
      title: '2020 BMW M3',
      seller: 'john_doe87',
      submitDate: '2024-12-15',
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200'
    },
    {
      id: 2,
      title: '2019 Mercedes C63',
      seller: 'car_enthusiast',
      submitDate: '2024-12-14',
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=200'
    }
  ];

  const users = [
    {
      id: 1,
      username: 'john_doe87',
      email: 'john@example.com',
      role: 'seller',
      status: 'active',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      username: 'car_enthusiast',
      email: 'enthusiast@example.com',
      role: 'buyer',
      status: 'active',
      joinDate: '2024-02-20'
    }
  ];

  const handleApproveListing = (listingId: number) => {
    toast({
      title: "Listing Approved",
      description: "The car listing has been approved and is now live.",
    });
  };

  const handleRejectListing = (listingId: number) => {
    toast({
      title: "Listing Rejected",
      description: "The car listing has been rejected.",
      variant: "destructive",
    });
  };

  const handleUserAction = (userId: number, action: 'ban' | 'unban') => {
    toast({
      title: action === 'ban' ? "User Banned" : "User Unbanned",
      description: `User has been ${action}ned successfully.`,
      variant: action === 'ban' ? "destructive" : "default",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Admin Panel</h1>
          
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span>Pending Listings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {pendingListings.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-emerald-500" />
                  <span>Active Auctions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">24</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Total Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">156</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span>Banned Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">3</div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending Listings</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Car Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingListings.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                      <p className="text-neutral-500">No pending listings</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingListings.map((listing) => (
                        <div key={listing.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img 
                            src={listing.image} 
                            alt={listing.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{listing.title}</h3>
                            <p className="text-neutral-600">
                              Seller: {listing.seller}
                            </p>
                            <p className="text-sm text-neutral-500">
                              Submitted: {listing.submitDate}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproveListing(listing.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRejectListing(listing.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{user.username}</h3>
                          <p className="text-neutral-600">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="capitalize">
                              {user.role}
                            </Badge>
                            <Badge 
                              variant={user.status === 'active' ? 'default' : 'destructive'}
                            >
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-neutral-500">
                            Joined: {user.joinDate}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUserAction(user.id, 'ban')}
                            >
                              Ban User
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Sales This Month:</span>
                        <span className="font-semibold">$2,450,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Auctions:</span>
                        <span className="font-semibold">85</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Sale Price:</span>
                        <span className="font-semibold">$28,824</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>New Registrations:</span>
                        <span className="font-semibold">42</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Bidders:</span>
                        <span className="font-semibold">234</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Listings:</span>
                        <span className="font-semibold">18</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
