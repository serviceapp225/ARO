import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Car, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  phoneNumber?: string;
  createdAt: string;
}

interface CarListing {
  id: number;
  make: string;
  model: string;
  year: number;
  sellerId: number;
  status: string;
  startingPrice: string;
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'listings'>('stats');

  // Проверка админских прав
  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Доступ запрещен</h2>
            <p className="text-gray-600">У вас нет прав для доступа к админ панели.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Получение статистики
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  // Получение пользователей
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // Получение объявлений на модерацию
  const { data: pendingListings } = useQuery<CarListing[]>({
    queryKey: ['/api/admin/listings/pending'],
    queryFn: async () => {
      const response = await fetch('/api/admin/listings?status=pending');
      if (!response.ok) throw new Error('Failed to fetch pending listings');
      return response.json();
    },
  });

  // Мутация для изменения статуса пользователя
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "Статус пользователя обновлен" });
    },
    onError: () => {
      toast({ title: "Ошибка при обновлении статуса", variant: "destructive" });
    },
  });

  // Мутация для модерации объявлений
  const moderateListingMutation = useMutation({
    mutationFn: async ({ listingId, status }: { listingId: number; status: string }) => {
      const response = await fetch(`/api/admin/listings/${listingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to moderate listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "Статус объявления обновлен" });
    },
    onError: () => {
      toast({ title: "Ошибка при модерации объявления", variant: "destructive" });
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Админ панель</h1>
        <p className="text-gray-600">Управление пользователями и объявлениями</p>
      </div>

      {/* Навигационные табы */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'stats'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          Статистика
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Пользователи ({users?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'listings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Car className="h-4 w-4 inline mr-2" />
          Модерация ({pendingListings?.length || 0})
        </button>
      </div>

      {/* Контент табов */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные аукционы</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeAuctions || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">На модерации</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingListings || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заблокированные</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.bannedUsers || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Управление пользователями</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{user.fullName || user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.phoneNumber && (
                          <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                          {user.isActive ? 'Активен' : 'Заблокирован'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={user.isActive ? "destructive" : "default"}
                      onClick={() => toggleUserStatusMutation.mutate({
                        userId: user.id,
                        isActive: !user.isActive
                      })}
                      disabled={toggleUserStatusMutation.isPending}
                    >
                      {user.isActive ? 'Заблокировать' : 'Активировать'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'listings' && (
        <Card>
          <CardHeader>
            <CardTitle>Модерация объявлений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingListings?.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{listing.make} {listing.model} {listing.year}</h3>
                    <p className="text-sm text-gray-600">
                      Стартовая цена: {listing.startingPrice} сомони
                    </p>
                    <p className="text-xs text-gray-500">
                      Создано: {new Date(listing.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => moderateListingMutation.mutate({
                        listingId: listing.id,
                        status: 'active'
                      })}
                      disabled={moderateListingMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => moderateListingMutation.mutate({
                        listingId: listing.id,
                        status: 'rejected'
                      })}
                      disabled={moderateListingMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Отклонить
                    </Button>
                  </div>
                </div>
              ))}
              {!pendingListings?.length && (
                <div className="text-center py-8 text-gray-500">
                  Нет объявлений на модерации
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}