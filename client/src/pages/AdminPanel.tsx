import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopHeader } from "@/components/TopHeader";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Users, 
  Car, 
  AlertTriangle,
  Ban,
  CheckSquare,
  Clock,
  Search,
  Filter
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PendingListing {
  id: number;
  lotNumber: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  photos: string[];
  sellerName: string;
  sellerId: number;
  createdAt: string;
  status: string;
}

interface User {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminStats {
  pendingListings: number;
  activeAuctions: number;
  totalUsers: number;
  bannedUsers: number;
}

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Fetch admin stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch pending listings
  const { data: pendingListings, isLoading: loadingListings } = useQuery<PendingListing[]>({
    queryKey: ["/api/admin/pending-listings"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch all users
  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Moderation mutations
  const approveListing = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to approve listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Объявление одобрено", description: "Объявление опубликовано на аукционе" });
    },
  });

  const rejectListing = useMutation({
    mutationFn: async ({ listingId, reason }: { listingId: number; reason: string }) => {
      const response = await fetch(`/api/admin/listings/${listingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to reject listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Объявление отклонено", description: "Продавец получит уведомление" });
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Статус пользователя обновлен" });
    },
  });

  const handleApproveListing = (listingId: number) => {
    approveListing.mutate(listingId);
  };

  const handleRejectListing = (listingId: number, reason: string) => {
    rejectListing.mutate({ listingId, reason });
  };

  const handleToggleUser = (userId: number, currentStatus: boolean) => {
    toggleUserStatus.mutate({ userId, isActive: !currentStatus });
  };

  const filteredListings = pendingListings?.filter(listing => {
    const matchesSearch = listing.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.lotNumber.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users?.filter(user => {
    return user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.phoneNumber.includes(searchQuery) ||
           user.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopHeader title="Административная панель" showNotifications={false} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Обзор</TabsTrigger>
            <TabsTrigger value="listings">Модерация</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.pendingListings || 0}</p>
                      <p className="text-sm text-gray-600">На модерации</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.activeAuctions || 0}</p>
                      <p className="text-sm text-gray-600">Активные аукционы</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                      <p className="text-sm text-gray-600">Всего пользователей</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Ban className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats?.bannedUsers || 0}</p>
                      <p className="text-sm text-gray-600">Заблокированные</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Последние действия</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Объявление #382806 одобрено</p>
                      <p className="text-sm text-gray-600">2 минуты назад</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Пользователь +992111111111 заблокирован</p>
                      <p className="text-sm text-gray-600">15 минут назад</p>
                    </div>
                    <Ban className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Moderation Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Поиск по марке, модели или номеру лота..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">На модерации</SelectItem>
                  <SelectItem value="approved">Одобренные</SelectItem>
                  <SelectItem value="rejected">Отклоненные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadingListings ? (
              <div className="text-center py-8">Загрузка объявлений...</div>
            ) : (
              <div className="space-y-4">
                {filteredListings?.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/4">
                          {listing.photos.length > 0 && (
                            <img
                              src={listing.photos[0]}
                              alt={`${listing.make} ${listing.model}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )}
                        </div>
                        <div className="md:w-1/2 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {listing.make} {listing.model} {listing.year}
                            </h3>
                            <Badge variant={listing.status === 'pending' ? 'default' : 'secondary'}>
                              {listing.status === 'pending' ? 'На модерации' : listing.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600">Лот №{listing.lotNumber}</p>
                          <p className="text-gray-600">Пробег: {listing.mileage.toLocaleString()} км</p>
                          <p className="text-gray-600">Продавец: {listing.sellerName}</p>
                          <p className="text-sm text-gray-500">
                            Подано: {new Date(listing.createdAt).toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <div className="md:w-1/4 flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(`/auction/${listing.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Просмотр
                          </Button>
                          {listing.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveListing(listing.id)}
                                disabled={approveListing.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Одобрить
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  const reason = prompt("Причина отклонения:");
                                  if (reason) handleRejectListing(listing.id, reason);
                                }}
                                disabled={rejectListing.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Отклонить
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredListings?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Объявления не найдены
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex gap-4">
              <Input
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            {loadingUsers ? (
              <div className="text-center py-8">Загрузка пользователей...</div>
            ) : (
              <div className="space-y-4">
                {filteredUsers?.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{user.fullName || 'Без имени'}</h3>
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                              {user.isActive ? 'Активен' : 'Заблокирован'}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{user.phoneNumber}</p>
                          {user.email && <p className="text-gray-600">{user.email}</p>}
                          <p className="text-sm text-gray-500">
                            Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={user.isActive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleUser(user.id, user.isActive)}
                            disabled={toggleUserStatus.isPending}
                          >
                            {user.isActive ? (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Заблокировать
                              </>
                            ) : (
                              <>
                                <CheckSquare className="h-4 w-4 mr-2" />
                                Разблокировать
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredUsers?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Пользователи не найдены
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}