import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, User as UserIcon, Car, Bell, Settings, CheckCircle, XCircle, AlertCircle, Edit, Search, Image, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import { UserDetailModal } from '@/components/UserDetailModal';
import { ListingEditModal } from '@/components/ListingEditModal';
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
            <TabsTrigger value="sell-banner" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Баннер "Продай авто"
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

          <TabsContent value="sell-banner">
            <SellBannerManagement />
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
                      <p className="font-medium">{user.fullName || 'Имя не указано'}</p>
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUserId(user.id)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Редактировать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <UserDetailModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}

// Компонент управления объявлениями
function ListingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [searchLotNumber, setSearchLotNumber] = useState('');

  const { data: allListings = [], isLoading } = useQuery<CarListing[]>({
    queryKey: ['/api/admin/listings'],
  });

  // Фильтрация объявлений по номеру лота
  const listings = allListings.filter(listing => 
    searchLotNumber === '' || 
    listing.lotNumber?.toLowerCase().includes(searchLotNumber.toLowerCase())
  );

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
          {/* Поиск по номеру лота */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по номеру лота..."
                value={searchLotNumber}
                onChange={(e) => setSearchLotNumber(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchLotNumber && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Найдено объявлений: {listings.length}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchLotNumber ? 'Объявления с таким номером лота не найдены' : 'Нет объявлений'}
              </div>
            ) : (
              listings.map((listing) => (
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedListingId(listing.id)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Редактировать
                  </Button>
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <ListingEditModal
        listingId={selectedListingId}
        isOpen={!!selectedListingId}
        onClose={() => setSelectedListingId(null)}
      />
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



// Интерфейс для статистики
interface AdminStatsData {
  totalUsers: number;
  activeAuctions: number;
  pendingListings: number;
  bannedUsers: number;
}

// Компонент управления баннером "Продай свое авто"
function SellBannerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Состояние формы
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buttonText: '',
    linkUrl: '',
    backgroundImageUrl: '',
    gradientFrom: '',
    gradientTo: '',
    textColor: '',
    isActive: true,
    overlayOpacity: 60
  });

  // Получение данных баннера
  const { data: banner, isLoading: bannerLoading } = useQuery({
    queryKey: ['/api/sell-car-banner'],
    staleTime: 30000,
  });

  // Заполняем форму данными баннера при загрузке
  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        buttonText: banner.buttonText || '',
        linkUrl: banner.linkUrl || '',
        backgroundImageUrl: banner.backgroundImageUrl || '',
        gradientFrom: banner.gradientFrom || '',
        gradientTo: banner.gradientTo || '',
        textColor: banner.textColor || '',
        isActive: banner.isActive !== false,
        overlayOpacity: banner.overlayOpacity || 60
      });
    }
  }, [banner]);

  // Мутация для обновления баннера
  const updateBannerMutation = useMutation({
    mutationFn: async (bannerData: any) => {
      const response = await fetch('/api/admin/sell-car-banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData),
      });
      if (!response.ok) throw new Error('Ошибка обновления баннера');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Баннер обновлен успешно",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sell-car-banner'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить баннер",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBannerMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        buttonText: banner.buttonText || '',
        linkUrl: banner.linkUrl || '',
        backgroundImageUrl: banner.backgroundImageUrl || '',
        gradientFrom: banner.gradientFrom || '',
        gradientTo: banner.gradientTo || '',
        textColor: banner.textColor || '',
        isActive: banner.isActive !== false,
        overlayOpacity: banner.overlayOpacity || 60
      });
    }
    setIsEditing(false);
  };

  if (bannerLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Управление баннером "Продай свое авто"</h2>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          {isEditing ? 'Отменить' : 'Редактировать'}
        </Button>
      </div>

      {/* Предварительный просмотр */}
      {banner && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Предварительный просмотр</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="relative h-44 rounded-2xl p-6 text-white overflow-hidden shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${banner.gradientFrom || '#059669'} 0%, ${banner.gradientTo || '#047857'} 100%)`,
              }}
            >
              {banner.backgroundImageUrl && (
                <div 
                  className="absolute inset-0 rounded-2xl bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('${banner.backgroundImageUrl}')`,
                    opacity: (banner.overlayOpacity || 60) / 100,
                  }}
                />
              )}
              
              <div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${banner.gradientFrom || '#059669'}CC 0%, ${banner.gradientTo || '#047857'}CC 100%)`,
                }}
              />
              
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-3">
                <h2 className="text-2xl font-bold drop-shadow-lg text-white">
                  {banner.title}
                </h2>
                <p className="text-base leading-relaxed opacity-95 drop-shadow-md max-w-md text-white">
                  {banner.description}
                </p>
                <div className="mt-4">
                  <span className="px-6 py-3 rounded-full text-sm font-bold bg-white text-green-600 shadow-lg inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {banner.buttonText}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Статус:</span>
                <Badge variant={banner.isActive ? 'default' : 'secondary'} className="ml-2">
                  {banner.isActive ? 'Активный' : 'Неактивный'}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Ссылка:</span>
                <span className="ml-2 text-blue-600">{banner.linkUrl}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Форма редактирования */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Редактировать баннер</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Продай свое авто"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Текст кнопки</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Начать продажу"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Получи максимальную цену за свой автомобиль на нашем аукционе"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkUrl">Ссылка</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="/sell"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundImageUrl">URL фонового изображения</Label>
                <Input
                  id="backgroundImageUrl"
                  value={formData.backgroundImageUrl}
                  onChange={(e) => setFormData({ ...formData, backgroundImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=300&fit=crop"
                  type="url"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradientFrom">Цвет градиента (начало)</Label>
                  <Input
                    id="gradientFrom"
                    type="color"
                    value={formData.gradientFrom}
                    onChange={(e) => setFormData({ ...formData, gradientFrom: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradientTo">Цвет градиента (конец)</Label>
                  <Input
                    id="gradientTo"
                    type="color"
                    value={formData.gradientTo}
                    onChange={(e) => setFormData({ ...formData, gradientTo: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor">Цвет текста</Label>
                  <Input
                    id="textColor"
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="overlayOpacity">Прозрачность наложения (%)</Label>
                  <Input
                    id="overlayOpacity"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.overlayOpacity}
                    onChange={(e) => setFormData({ ...formData, overlayOpacity: parseInt(e.target.value) || 60 })}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive">Активный баннер</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateBannerMutation.isPending}
                >
                  {updateBannerMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Компонент управления баннерами
function BannersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Состояние формы
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'main',
    isActive: true,
    order: 1
  });

  // Получение баннеров
  const { data: banners, isLoading: bannersLoading } = useQuery({
    queryKey: ['/api/admin/banners'],
    staleTime: 30000,
  });

  // Мутация для создания баннера
  const createBannerMutation = useMutation({
    mutationFn: async (bannerData: any) => {
      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData),
      });
      if (!response.ok) throw new Error('Ошибка создания баннера');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Баннер создан успешно",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banners'] });
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать баннер",
        variant: "destructive",
      });
    },
  });

  // Мутация для обновления баннера
  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Ошибка обновления баннера');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Баннер обновлен успешно",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banners'] });
      setEditingBanner(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить баннер",
        variant: "destructive",
      });
    },
  });

  // Мутация для удаления баннера
  const deleteBannerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Ошибка удаления баннера');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Баннер удален успешно",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banners'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить баннер",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'main',
      isActive: true,
      order: 1
    });
  };

  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      position: banner.position || 'main',
      isActive: banner.isActive !== false,
      order: banner.order || 1
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, data: formData });
    } else {
      createBannerMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setEditingBanner(null);
    setIsCreating(false);
    resetForm();
  };

  if (bannersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Управление баннерами</h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
          disabled={isCreating || editingBanner}
        >
          <Plus className="w-4 h-4" />
          Создать баннер
        </Button>
      </div>

      {/* Форма создания/редактирования */}
      {(isCreating || editingBanner) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBanner ? 'Редактировать баннер' : 'Создать новый баннер'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Заголовок баннера"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Позиция</Label>
                  <Select 
                    value={formData.position} 
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите позицию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Главная страница</SelectItem>
                      <SelectItem value="sidebar">Боковая панель</SelectItem>
                      <SelectItem value="footer">Подвал</SelectItem>
                      <SelectItem value="header">Заголовок</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание баннера"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL изображения</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkUrl">Ссылка (необязательно)</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Порядок отображения</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive">Активный баннер</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                >
                  {createBannerMutation.isPending || updateBannerMutation.isPending
                    ? 'Сохранение...'
                    : editingBanner
                    ? 'Обновить'
                    : 'Создать'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Список баннеров */}
      <div className="grid gap-4">
        {banners && banners.length > 0 ? (
          banners.map((banner: any) => (
            <Card key={banner.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{banner.title}</h3>
                      <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                        {banner.isActive ? 'Активный' : 'Неактивный'}
                      </Badge>
                      <Badge variant="outline">{banner.position}</Badge>
                    </div>
                    
                    {banner.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{banner.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {banner.imageUrl && (
                        <span className="flex items-center gap-1">
                          <Image className="w-4 h-4" />
                          Изображение
                        </span>
                      )}
                      {banner.linkUrl && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          Ссылка
                        </span>
                      )}
                      <span>Порядок: {banner.order}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(banner)}
                      disabled={isCreating || editingBanner}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteBannerMutation.mutate(banner.id)}
                      disabled={deleteBannerMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {banner.imageUrl && (
                  <div className="mt-4 pt-4 border-t">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="max-w-xs h-20 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Баннеры не найдены</p>
              <p className="text-sm text-gray-400 mt-1">Создайте первый баннер</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
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