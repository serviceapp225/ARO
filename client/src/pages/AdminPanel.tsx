import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, User as UserIcon, Car, Bell, Settings, CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import { UserDetailModal } from '@/components/UserDetailModal';
import type { User, CarListing, Notification } from '@shared/schema';

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Проверяем права доступа - только пользователь 992000000000
  const hasAdminAccess = user?.email?.includes('992000000000') || 
                         user?.phoneNumber?.includes('000-00-00');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Доступ запрещен</CardTitle>
            <CardDescription>
              У вас нет прав доступа к админ панели
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button variant="outline">На главную</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Админ панель
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Управление платформой автоаукциона
          </p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Объявления
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Баннеры
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="listings">
            <ListingsManagement />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsManagement />
          </TabsContent>

          <TabsContent value="banners">
            <BannersManagement />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Компонент управления пользователями
function UsersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Статус пользователя обновлен' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось обновить статус', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Загрузка пользователей...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Управление пользователями</CardTitle>
          <CardDescription>
            Активация и деактивация пользователей системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{user.fullName || 'Без имени'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {user.phoneNumber} • {user.role}
                      </p>
                    </div>
                    <Badge variant={(user.isActive || false) ? 'default' : 'secondary'}>
                      {(user.isActive || false) ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`user-${user.id}`} className="text-sm">
                    {user.isActive ? 'Активен' : 'Заблокирован'}
                  </Label>
                  <Switch
                    id={`user-${user.id}`}
                    checked={user.isActive || false}
                    onCheckedChange={(isActive) => 
                      updateUserStatusMutation.mutate({ userId: user.id, isActive })
                    }
                    disabled={updateUserStatusMutation.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Компонент управления объявлениями
function ListingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery<CarListing[]>({
    queryKey: ['/api/admin/listings'],
  });

  const updateListingStatusMutation = useMutation({
    mutationFn: async ({ listingId, status }: { listingId: number; status: string }) => {
      const response = await fetch(`/api/admin/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update listing status');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Статус объявления обновлен' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
    },
    onError: () => {
      toast({ title: 'Ошибка', description: 'Не удалось обновить статус', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Загрузка объявлений...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Управление объявлениями</CardTitle>
          <CardDescription>
            Модерация объявлений и управление статусами аукционов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0">
                      {listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0 ? (
                        <img 
                          src={listing.photos[0]} 
                          alt={`${listing.make} ${listing.model}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {listing.make} {listing.model} {listing.year}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Лот #{listing.lotNumber} • {listing.currentBid} Сомони
                      </p>
                      <Badge variant={
                        listing.status === 'pending' ? 'secondary' :
                        listing.status === 'active' ? 'default' :
                        listing.status === 'ended' ? 'outline' : 'destructive'
                      }>
                        {listing.status === 'pending' ? 'На модерации' :
                         listing.status === 'active' ? 'Активен' :
                         listing.status === 'ended' ? 'Завершен' : 'Отклонен'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={listing.status}
                    onValueChange={(status) => 
                      updateListingStatusMutation.mutate({ listingId: listing.id, status })
                    }
                    disabled={updateListingStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">На модерации</SelectItem>
                      <SelectItem value="active">Активен</SelectItem>
                      <SelectItem value="ended">Завершен</SelectItem>
                      <SelectItem value="rejected">Отклонен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Компонент управления уведомлениями
function NotificationsManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление уведомлениями</CardTitle>
        <CardDescription>
          Системные уведомления и их настройки
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300">
          Раздел в разработке. Здесь будет управление системными уведомлениями.
        </p>
      </CardContent>
    </Card>
  );
}

// Компонент управления баннерами
function BannersManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление баннерами</CardTitle>
        <CardDescription>
          Рекламные баннеры и объявления
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300">
          Раздел в разработке. Здесь будет управление баннерами.
        </p>
      </CardContent>
    </Card>
  );
}

// Интерфейс для статистики
interface AdminStatsData {
  totalUsers: number;
  activeAuctions: number;
  pendingListings: number;
  bannedUsers: number;
}

// Компонент статистики
function AdminStats() {
  const { data: stats, isLoading } = useQuery<AdminStatsData>({
    queryKey: ['/api/admin/stats'],
  });

  if (isLoading) {
    return <div className="text-center py-8">Загрузка статистики...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
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
          <CardTitle className="text-sm font-medium">Заблокированных</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.bannedUsers || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}