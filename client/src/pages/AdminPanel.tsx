import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Users, Car, Bell, Shield, ShieldX, UserCheck, UserX, Search, Filter, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { BannerManagement } from '@/components/BannerManagement';

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface CarListing {
  id: number;
  make: string;
  model: string;
  year: number;
  status: string;
  sellerId: number;
  lotNumber: string;
  currentBid: string;
  createdAt: string;
}

interface AdminStats {
  pendingListings: number;
  activeAuctions: number;
  totalUsers: number;
  bannedUsers: number;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'banners'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Запросы данных
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    staleTime: 30000,
    enabled: user?.role === 'admin',
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    staleTime: 30000,
    enabled: user?.role === 'admin',
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery<CarListing[]>({
    queryKey: ['/api/admin/listings'],
    staleTime: 30000,
    enabled: user?.role === 'admin',
  });

  // Мутации для управления пользователями
  const toggleUserActivation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Статус пользователя обновлен",
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Ошибка при обновлении статуса",
        variant: "destructive",
        duration: 2000,
      });
    }
  });

  // Мутации для управления объявлениями
  const updateListingStatus = useMutation({
    mutationFn: async ({ listingId, status }: { listingId: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/listings/${listingId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Статус объявления обновлен",
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: "Ошибка при обновлении статуса",
        variant: "destructive",
        duration: 2000,
      });
    }
  });

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesFilter;
  });

  // Фильтрация объявлений
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.lotNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || listing.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string, isActive?: boolean) => {
    if (typeof isActive !== 'undefined') {
      return isActive ? (
        <Badge className="bg-green-100 text-green-800">Активен</Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800">Заблокирован</Badge>
      );
    }

    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">На модерации</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активное</Badge>;
      case 'ended':
        return <Badge className="bg-gray-100 text-gray-800">Завершено</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Отклонено</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Проверка доступа админа
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-4">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Доступ запрещен
          </h2>
          <p className="text-gray-500 mb-4">
            У вас нет прав доступа к административной панели
          </p>
          <Button onClick={() => setLocation('/')}>
            На главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Админ панель</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Обзор
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Пользователи
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'listings'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Объявления
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'banners'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Банеры
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.totalUsers || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Заблокированные</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {statsLoading ? '...' : stats?.bannedUsers || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активные аукционы</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : stats?.activeAuctions || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">На модерации</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {statsLoading ? '...' : stats?.pendingListings || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск по email или имени пользователя..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Заблокированные</option>
              </select>
            </div>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>Пользователи ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usersLoading ? (
                    <div className="text-center py-8">Загрузка...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Пользователи не найдены</div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">Роль: {user.role}</div>
                            <div className="text-xs text-gray-400">Создан: {formatDate(user.createdAt)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge('', user.isActive)}
                          <Button
                            variant={user.isActive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleUserActivation.mutate({ 
                              userId: user.id, 
                              isActive: !user.isActive 
                            })}
                            disabled={toggleUserActivation.isPending}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="w-4 h-4 mr-1" />
                                Заблокировать
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Активировать
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск по марке, модели или номеру лота..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Все статусы</option>
                <option value="pending">На модерации</option>
                <option value="active">Активные</option>
                <option value="ended">Завершенные</option>
                <option value="rejected">Отклоненные</option>
              </select>
            </div>

            {/* Listings List */}
            <Card>
              <CardHeader>
                <CardTitle>Объявления ({filteredListings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {listingsLoading ? (
                    <div className="text-center py-8">Загрузка...</div>
                  ) : filteredListings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Объявления не найдены</div>
                  ) : (
                    filteredListings.map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-medium">
                              {listing.make} {listing.model} ({listing.year})
                            </div>
                            <div className="text-sm text-gray-500">Лот: {listing.lotNumber}</div>
                            <div className="text-sm text-gray-500">
                              Текущая ставка: ${listing.currentBid || 'Нет ставок'}
                            </div>
                            <div className="text-xs text-gray-400">Создано: {formatDate(listing.createdAt)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(listing.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/auction/${listing.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Просмотр
                          </Button>
                          {listing.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => updateListingStatus.mutate({ 
                                  listingId: listing.id, 
                                  status: 'active' 
                                })}
                                disabled={updateListingStatus.isPending}
                              >
                                Одобрить
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => updateListingStatus.mutate({ 
                                  listingId: listing.id, 
                                  status: 'rejected' 
                                })}
                                disabled={updateListingStatus.isPending}
                              >
                                Отклонить
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <BannerManagement />
          </div>
        )}
      </main>
    </div>
  );
}