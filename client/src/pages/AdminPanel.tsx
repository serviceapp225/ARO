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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, User as UserIcon, Car, Bell, Settings, CheckCircle, XCircle, AlertCircle, Edit, Edit2, Search, Image, Plus, Eye, ChevronUp } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">У вас нет прав для доступа к админ панели</p>
          <Link href="/">
            <Button className="mt-4">Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Админ панель</h1>
          <Link href="/">
            <Button variant="outline">
              Вернуться на главную
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="listings">Объявления</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="banners">Баннеры</TabsTrigger>
            <TabsTrigger value="second-carousel">Вторая карусель</TabsTrigger>
            <TabsTrigger value="archive">Архив</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="listings" className="space-y-4">
            <ListingsManagement />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationsManagement />
          </TabsContent>

          <TabsContent value="banners" className="space-y-4">
            <BannersManagement />
          </TabsContent>

          <TabsContent value="second-carousel" className="space-y-4">
            <SecondCarouselManagement />
          </TabsContent>

          <TabsContent value="archive" className="space-y-4">
            <ArchiveManagement />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <AdminStats />
          </TabsContent>
        </Tabs>
      </div>
      <ScrollToTopButton />
    </div>
  );
}

// Управление пользователями
function UsersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Пользователь обновлен",
        description: "Статус пользователя изменен успешно",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const filteredUsers = users?.filter((user: User) =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="text-center py-8">Загрузка пользователей...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление пользователями</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск пользователей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user: User) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-10 h-10 text-gray-400" />
                  <div>
                    <CardTitle className="text-lg">{user.fullName}</CardTitle>
                    <CardDescription>{user.phoneNumber}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Активен" : "Заблокирован"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={user.isActive ? "destructive" : "default"}
                    onClick={() => updateUserMutation.mutate({ 
                      id: user.id, 
                      isActive: !user.isActive 
                    })}
                    disabled={updateUserMutation.isPending}
                  >
                    {user.isActive ? "Заблокировать" : "Разблокировать"}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

// Управление объявлениями
function ListingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/admin/listings'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateListingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update listing');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Объявление обновлено",
        description: "Статус объявления изменен успешно",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
    },
  });

  const filteredListings = listings?.filter((listing: CarListing) =>
    listing.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.lotNumber?.includes(searchTerm)
  ) || [];

  if (isLoading) {
    return <div className="text-center py-8">Загрузка объявлений...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление объявлениями</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск по марке, модели или номеру лота..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredListings.map((listing: CarListing) => (
          <Card key={listing.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Car className="w-10 h-10 text-gray-400" />
                  <div>
                    <CardTitle className="text-lg">{listing.make} {listing.model}</CardTitle>
                    <CardDescription>
                      Лот #{listing.lotNumber} • {listing.year} • ${listing.startingPrice}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    listing.status === 'active' ? 'default' :
                    listing.status === 'pending' ? 'secondary' :
                    listing.status === 'ended' ? 'outline' : 'destructive'
                  }>
                    {listing.status === 'active' ? 'Активно' :
                     listing.status === 'pending' ? 'Ожидает' :
                     listing.status === 'ended' ? 'Завершено' : 'Отклонено'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedListing(listing);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Select onValueChange={(value) => 
                    updateListingMutation.mutate({ id: listing.id, status: value })
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Ожидает</SelectItem>
                      <SelectItem value="active">Активно</SelectItem>
                      <SelectItem value="ended">Завершено</SelectItem>
                      <SelectItem value="rejected">Отклонено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {selectedListing && (
        <ListingEditModal
          listing={selectedListing}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedListing(null);
          }}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
          }}
        />
      )}
    </div>
  );
}

// Управление уведомлениями
function NotificationsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/admin/notifications'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Уведомление удалено",
        description: "Уведомление успешно удалено",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Загрузка уведомлений...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Управление уведомлениями</h2>
      
      <div className="grid gap-4">
        {notifications?.map((notification: Notification) => (
          <Card key={notification.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Bell className="w-8 h-8 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <CardDescription>{notification.message}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={notification.isRead ? "outline" : "default"}>
                    {notification.isRead ? "Прочитано" : "Не прочитано"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteNotificationMutation.mutate(notification.id)}
                    disabled={deleteNotificationMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Управление баннерами
function BannersManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Управление баннерами</h2>
      <Card>
        <CardHeader>
          <CardTitle>Функция временно недоступна</CardTitle>
          <CardDescription>
            Управление баннерами будет доступно в следующих версиях
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// Управление второй каруселью
function SecondCarouselManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedCarousel, setSelectedCarousel] = useState<number>(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: 'Подробнее',
    carouselNumber: 1,
    isActive: true,
    order: 0
  });

  const { data: carouselItems, isLoading } = useQuery({
    queryKey: ['/api/admin/second-carousel'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/second-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create item');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Элемент создан",
        description: "Новый элемент карусели добавлен успешно",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/second-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/second-carousel'] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/second-carousel/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update item');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Элемент обновлен",
        description: "Изменения сохранены успешно",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/second-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/second-carousel'] });
      setEditingItem(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/second-carousel/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete item');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Элемент удален",
        description: "Элемент карусели удален успешно",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/second-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/second-carousel'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      buttonText: 'Подробнее',
      carouselNumber: 1,
      isActive: true,
      order: 0
    });
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await updateItemMutation.mutateAsync({ id: editingItem.id, data: formData });
    } else {
      await createItemMutation.mutateAsync(formData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      linkUrl: item.linkUrl || '',
      buttonText: item.buttonText || 'Подробнее',
      carouselNumber: item.carouselNumber || 1,
      isActive: item.isActive || true,
      order: item.order || 0
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
      await deleteItemMutation.mutateAsync(id);
    }
  };

  const filteredItems = carouselItems?.filter((item: any) => 
    item.carouselNumber === selectedCarousel
  ) || [];

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление второй каруселью</h2>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить элемент
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={selectedCarousel === 1 ? "default" : "outline"}
          onClick={() => setSelectedCarousel(1)}
        >
          Карусель 1: Приведи друга
        </Button>
        <Button
          variant={selectedCarousel === 2 ? "default" : "outline"}
          onClick={() => setSelectedCarousel(2)}
        >
          Карусель 2: Горячие аукционы
        </Button>
        <Button
          variant={selectedCarousel === 3 ? "default" : "outline"}
          onClick={() => setSelectedCarousel(3)}
        >
          Карусель 3: Стань экспертом
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item: any) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Активный" : "Неактивный"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Порядок: {item.order}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isCreating && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Редактировать элемент' : 'Создать новый элемент'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Введите заголовок"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="buttonText">Текст кнопки</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                    placeholder="Текст кнопки"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Введите описание"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageUrl">URL изображения</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="linkUrl">URL ссылки</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                    placeholder="/page-url"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="carouselNumber">Номер карусели</Label>
                  <Select
                    value={formData.carouselNumber.toString()}
                    onValueChange={(value) => setFormData({...formData, carouselNumber: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите карусель" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Карусель 1</SelectItem>
                      <SelectItem value="2">Карусель 2</SelectItem>
                      <SelectItem value="3">Карусель 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="order">Порядок</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    min="0"
                    max="10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <Label htmlFor="isActive">Активный</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                >
                  {createItemMutation.isPending || updateItemMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Архив
function ArchiveManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Управление архивом</h2>
      <Card>
        <CardHeader>
          <CardTitle>Архив завершенных аукционов</CardTitle>
          <CardDescription>
            Здесь отображаются завершенные и архивные аукционы
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// Статистика
function AdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return <div className="text-center py-8">Загрузка статистики...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Статистика платформы</h2>
      
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
            <CardTitle className="text-sm font-medium">Ожидающие модерации</CardTitle>
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
    </div>
  );
}

// Кнопка прокрутки вверх
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <Button
          className="fixed bottom-4 right-4 z-50 rounded-full p-3 shadow-lg"
          onClick={scrollToTop}
          size="sm"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}