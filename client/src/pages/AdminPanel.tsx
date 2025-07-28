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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, User as UserIcon, Car, Bell, Settings, CheckCircle, XCircle, AlertCircle, Edit, Search, Image, Plus, Eye, ChevronUp, RefreshCw, Award, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import { UserDetailModal } from '@/components/UserDetailModal';
import { ListingEditModal } from '@/components/ListingEditModal';
import type { User, CarListing, Notification, AdvertisementCarousel } from '@shared/schema';

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Проверяем права доступа - только пользователь 992903331332
  const hasAdminAccess = user?.email?.includes('992903331332') || 
                         user?.phoneNumber?.includes('333-13-32');

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 page-content">
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
          <TabsList className="flex flex-col w-full h-auto">
            <TabsTrigger value="users" className="flex items-center gap-2 w-full justify-start">
              <UserIcon className="h-4 w-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2 w-full justify-start">
              <CheckCircle className="h-4 w-4" />
              Модерация объявлений
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2 w-full justify-start">
              <Car className="h-4 w-4" />
              Объявления
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 w-full justify-start">
              <Bell className="h-4 w-4" />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="sell-banner" className="flex items-center gap-2 w-full justify-start">
              <Plus className="h-4 w-4" />
              Баннер "Продай авто"
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2 w-full justify-start">
              <Settings className="h-4 w-4" />
              Баннеры
            </TabsTrigger>
            <TabsTrigger value="ad-carousel" className="flex items-center gap-2 w-full justify-start">
              <Plus className="h-4 w-4" />
              Реклама-карусель
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex items-center gap-2 w-full justify-start">
              <Trash2 className="h-4 w-4" />
              Архив
            </TabsTrigger>
            <TabsTrigger value="wins" className="flex items-center gap-2 w-full justify-start">
              <Award className="h-4 w-4" />
              Выигрыши
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2 w-full justify-start">
              <Gift className="h-4 w-4" />
              Рефералы
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 w-full justify-start">
              <Settings className="h-4 w-4" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="moderation">
            <ModerationManagement />
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

          <TabsContent value="ad-carousel">
            <AdvertisementCarouselManagement />
          </TabsContent>

          <TabsContent value="archive">
            <ArchiveManagement />
          </TabsContent>

          <TabsContent value="wins">
            <WinsSection />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralsSection />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Кнопка прокрутки наверх */}
      <ScrollToTopButton />
    </div>
  );
}

// Компонент для модерации объявлений
function ModerationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingListing, setEditingListing] = useState<CarListing | null>(null);

  // Получение объявлений ожидающих одобрения
  const { data: pendingListings = [], isLoading, error: pendingError } = useQuery<CarListing[]>({
    queryKey: ['/api/admin/listings/pending-approval'],
    queryFn: async () => {
      console.log('🔄 Загружаем объявления на модерацию...');
      const response = await fetch('/api/admin/listings/pending-approval');
      if (!response.ok) throw new Error('Failed to fetch pending listings');
      const data = await response.json();
      console.log('📋 Получены данные модерации:', data);
      return data;
    },
    staleTime: 0, // Всегда загружаем свежие данные
    gcTime: 0, // Не кэшируем вообще
    refetchInterval: 5000, // автообновление каждые 5 секунд
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Мутация одобрения объявления
  const approveMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to approve listing');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Объявление одобрено",
        description: "Объявление теперь доступно в публичном каталоге",
        variant: "default",
        duration: 1000
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings/pending-approval'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка одобрения",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Мутация отклонения объявления
  const rejectMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await fetch(`/api/admin/listings/${listingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to reject listing');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Объявление отклонено",
        description: "Заявка на объявление была отклонена",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings/pending-approval'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка отклонения",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Мутация обновления объявления
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update listing');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Объявление обновлено",
        description: "Изменения сохранены успешно",
        variant: "default"
      });
      setEditingListing(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings/pending-approval'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Мутация удаления объявления
  const deleteMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete listing');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Объявление удалено",
        description: "Объявление было успешно удалено из системы",
        variant: "default",
        duration: 1000
      });
      // Обновляем все кэши объявлений
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings/pending-approval'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.refetchQueries({ queryKey: ['/api/listings'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Модерация объявлений</CardTitle>
          <CardDescription>Загрузка объявлений ожидающих одобрения...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Модерация объявлений</CardTitle>
            <CardDescription>
              Объявления ожидающие одобрения: {pendingListings.length}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log('🔄 Принудительное обновление модерации...');
              queryClient.removeQueries({ queryKey: ['/api/admin/listings/pending-approval'] });
              queryClient.invalidateQueries({ queryKey: ['/api/admin/listings/pending-approval'] });
            }}
          >
            🔄 Обновить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {pendingError && (
          <div className="text-center py-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Ошибка: {pendingError.message}</p>
          </div>
        )}
        {pendingListings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Нет объявлений ожидающих модерации</p>
            <p className="text-xs text-gray-400 mt-2">Debug: Загружено {pendingListings.length} объявлений</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingListings.map((listing) => (
              <div key={listing.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Заголовок */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800">
                        Ожидает одобрения
                      </Badge>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Лот #{listing.lotNumber}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {listing.make} {listing.model} {listing.year}
                    </h3>
                  </div>
                  
                  {/* Кнопки управления */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingListing(listing)}
                      disabled={approveMutation.isPending || rejectMutation.isPending || updateMutation.isPending}
                      className="flex items-center justify-center gap-2 h-10 font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                      Редактировать
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approveMutation.mutate(listing.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending || updateMutation.isPending}
                      className="flex items-center justify-center gap-2 h-10 font-medium bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(listing.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                      className="flex items-center justify-center gap-2 h-10 font-medium bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700"
                    >
                      <XCircle className="h-4 w-4" />
                      Отклонить
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={approveMutation.isPending || rejectMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                          className="flex items-center justify-center gap-2 h-10 font-medium bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Удалить
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить объявление "{listing.make} {listing.model}"? 
                            Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(listing.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Модальное окно редактирования */}
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onUpdate={(data) => updateMutation.mutate({ id: editingListing.id, data })}
          isUpdating={updateMutation.isPending}
        />
      )}
    </Card>
  );
}

// Компонент модального окна для редактирования объявления в модерации
function EditListingModal({ listing, onClose, onUpdate, isUpdating }: {
  listing: CarListing;
  onClose: () => void;
  onUpdate: (data: any) => void;
  isUpdating: boolean;
}) {
  const [formData, setFormData] = useState({
    make: listing.make,
    model: listing.model,
    year: listing.year,
    mileage: listing.mileage,
    description: listing.description,
    startingPrice: listing.startingPrice,
    reservePrice: listing.reservePrice ? String(listing.reservePrice) : '',
    auctionDuration: Math.round((listing.auctionDuration || 168) / 24),
    condition: listing.condition || 'good',
    location: listing.location || '',
    engine: listing.engine || '',
    transmission: listing.transmission || '',
    fuelType: listing.fuelType || '',
    bodyType: listing.bodyType || '',
    driveType: listing.driveType || '',
    color: listing.color || '',
    customsCleared: listing.customsCleared || false,
    recycled: listing.recycled || false,
    technicalInspectionValid: listing.technicalInspectionValid || false,
    tinted: listing.tinted || false,
    photos: listing.photos || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Конвертируем дни обратно в часы для сохранения в базе данных
    const dataToSend = {
      ...formData,
      auctionDuration: formData.auctionDuration * 24
    };
    onUpdate(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 pb-24">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Редактировать объявление</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Марка</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Модель</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="year">Год</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mileage">Пробег (км)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startingPrice">Начальная цена (сомони)</Label>
                <Input
                  id="startingPrice"
                  value={formData.startingPrice}
                  onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reservePrice">Резервная цена (сомони)</Label>
                <Input
                  id="reservePrice"
                  value={formData.reservePrice}
                  onChange={(e) => setFormData({ ...formData, reservePrice: e.target.value })}
                  placeholder="Не указана"
                />
              </div>
              <div>
                <Label htmlFor="auctionDuration">Продолжительность аукциона (дни)</Label>
                <div className="space-y-2">
                  <Input
                    id="auctionDuration"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.auctionDuration}
                    onChange={(e) => setFormData({ ...formData, auctionDuration: parseInt(e.target.value) || 7 })}
                    required
                  />
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <div>
                      Продавец выбрал: {formData.auctionDuration} {formData.auctionDuration === 1 ? 'день' : formData.auctionDuration < 5 ? 'дня' : 'дней'}
                    </div>
                    {listing.auctionStartTime && (
                      <div>
                        Начало: {new Date(listing.auctionStartTime).toLocaleString('ru-RU')}
                      </div>
                    )}
                    {listing.auctionEndTime && (
                      <div>
                        Окончание: {new Date(listing.auctionEndTime).toLocaleString('ru-RU')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="condition">Состояние</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Отличное</SelectItem>
                    <SelectItem value="very_good">Очень хорошее</SelectItem>
                    <SelectItem value="good">Хорошее</SelectItem>
                    <SelectItem value="fair">Удовлетворительное</SelectItem>
                    <SelectItem value="poor">Плохое</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Местоположение</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="color">Цвет</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            {/* Секция фотографий */}
            <div>
              <Label className="text-base font-medium">Фотографии ({formData.photos.length} шт.)</Label>
              {formData.photos && formData.photos.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Фото ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPhotos = formData.photos.filter((_, i) => i !== index);
                          setFormData({ ...formData, photos: newPhotos });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mt-2">Фотографии не загружены</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="customsCleared"
                    checked={formData.customsCleared}
                    onChange={(e) => setFormData({ ...formData, customsCleared: e.target.checked })}
                  />
                  <Label htmlFor="customsCleared">Растаможен</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recycled"
                    checked={formData.recycled}
                    onChange={(e) => setFormData({ ...formData, recycled: e.target.checked })}
                  />
                  <Label htmlFor="recycled">Утилизирован</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="technicalInspectionValid"
                    checked={formData.technicalInspectionValid}
                    onChange={(e) => setFormData({ ...formData, technicalInspectionValid: e.target.checked })}
                  />
                  <Label htmlFor="technicalInspectionValid">Техосмотр пройден</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tinted"
                    checked={formData.tinted}
                    onChange={(e) => setFormData({ ...formData, tinted: e.target.checked })}
                  />
                  <Label htmlFor="tinted">Тонировка</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Компонент управления пользователями
function UsersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleRefreshUsers = () => {
    console.log('Обновление списка пользователей...');
    // Принудительное обновление кэша
    queryClient.removeQueries({ queryKey: ['/api/admin/users'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    queryClient.refetchQueries({ queryKey: ['/api/admin/users'] });
    
    toast({
      title: "Список обновлен",
      description: "Данные пользователей обновлены",
      duration: 1000
    });
  };

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    refetchInterval: 3000, // Обновляем каждые 3 секунды
    staleTime: 0, // Данные всегда считаются устаревшими
    gcTime: 1000, // Очищаем кэш через 1 секунду
  });



  if (isLoading) {
    return <div className="text-center py-8">Загрузка пользователей...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Управление пользователями
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshUsers}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить
            </Button>
          </CardTitle>
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
                      <p className="font-medium">{user.fullName || user?.phoneNumber}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {user?.phoneNumber} • {user.role}
                      </p>
                      {(user as any).isInvited && (
                        <p className="text-xs text-green-600">
                          Приглашен: {(user as any).invitedBy}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={(user.isActive || false) ? 'default' : 'secondary'}>
                        {(user.isActive || false) ? 'Активен' : 'Неактивен'}
                      </Badge>
                      {(user as any).isInvited && (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Реферал
                        </Badge>
                      )}
                    </div>
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

  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete listing');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Объявление удалено",
        description: "Объявление было успешно удалено из системы",
        variant: "default",
        duration: 1000
      });
      // Обновляем все кэши объявлений
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.refetchQueries({ queryKey: ['/api/listings'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const endAuctionMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await fetch(`/api/admin/listings/${listingId}/end-auction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to end auction');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🏆 Аукцион завершен",
        description: data.winner ? 
          `Победитель: ID ${data.winner}, ставка: ${parseFloat(data.winningAmount).toLocaleString()} Сомони` : 
          "Аукцион завершен без ставок",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/archived-listings'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка завершения аукциона",
        description: error.message,
        variant: "destructive"
      });
    }
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
                <div key={listing.id} className="flex flex-col md:flex-row md:items-start md:justify-between p-4 md:p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Основная информация */}
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex-shrink-0 overflow-hidden">
                      {listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0 ? (
                        <img 
                          src={listing.photos[0]} 
                          alt={`${listing.make} ${listing.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {listing.make} {listing.model}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-2">
                        {listing.year} год
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                        <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
                          Лот #{listing.lotNumber}
                        </span>
                        <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">•</span>
                        <span className="text-sm md:text-base font-semibold text-blue-600 dark:text-blue-400">
                          {listing.currentBid} Сомони
                        </span>
                      </div>
                      <Badge 
                        variant={
                          listing.status === 'pending' ? 'secondary' :
                          listing.status === 'active' ? 'default' :
                          listing.status === 'ended' ? 'outline' : 'destructive'
                        }
                        className="text-xs px-2 md:px-3 py-1 w-fit"
                      >
                        {listing.status === 'pending' ? 'На модерации' :
                         listing.status === 'active' ? 'Активен' :
                         listing.status === 'ended' ? 'Завершен' : 'Отклонен'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Управление на мобильных */}
                <div className="flex flex-col gap-3 w-full md:w-40">
                  <div className="flex flex-row md:flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedListingId(listing.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 md:gap-2 h-8 md:h-9 text-xs md:text-sm font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                    >
                      <Edit className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Редактировать</span>
                      <span className="sm:hidden">Ред.</span>
                    </Button>
                    
                    {listing.status === 'active' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={endAuctionMutation.isPending}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1 md:gap-2 h-8 md:h-9 text-xs md:text-sm font-medium bg-amber-600 hover:bg-amber-700 border-amber-600 hover:border-amber-700"
                          >
                            <Award className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Завершить</span>
                            <span className="sm:hidden">Конец</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Завершить аукцион</AlertDialogTitle>
                            <AlertDialogDescription>
                              Завершить аукцион "{listing.make} {listing.model}"? 
                              Будет определен победитель по самой высокой ставке.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => endAuctionMutation.mutate(listing.id)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              Завершить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteListingMutation.isPending}
                          className="flex-1 md:flex-none flex items-center justify-center gap-1 md:gap-2 h-8 md:h-9 text-xs md:text-sm font-medium bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          Удалить
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить объявление "{listing.make} {listing.model}"? 
                            Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteListingMutation.mutate(listing.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                      Статус аукциона
                    </Label>
                    <Select
                      value={listing.status}
                      onValueChange={(status) => 
                        updateListingStatusMutation.mutate({ listingId: listing.id, status })
                      }
                      disabled={updateListingStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-full h-8 md:h-9 text-xs md:text-sm">
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
    if (banner && typeof banner === 'object') {
      setFormData({
        title: (banner as any).title || '',
        description: (banner as any).description || '',
        buttonText: (banner as any).buttonText || '',
        linkUrl: (banner as any).linkUrl || '',
        backgroundImageUrl: (banner as any).backgroundImageUrl || '',
        gradientFrom: (banner as any).gradientFrom || '',
        gradientTo: (banner as any).gradientTo || '',
        textColor: (banner as any).textColor || '',
        isActive: (banner as any).isActive !== false,
        overlayOpacity: (banner as any).overlayOpacity || 60
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
    if (banner && typeof banner === 'object') {
      setFormData({
        title: (banner as any).title || '',
        description: (banner as any).description || '',
        buttonText: (banner as any).buttonText || '',
        linkUrl: (banner as any).linkUrl || '',
        backgroundImageUrl: (banner as any).backgroundImageUrl || '',
        gradientFrom: (banner as any).gradientFrom || '',
        gradientTo: (banner as any).gradientTo || '',
        textColor: (banner as any).textColor || '',
        isActive: (banner as any).isActive !== false,
        overlayOpacity: (banner as any).overlayOpacity || 60
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
          onClick={() => {
            if (isEditing) {
              handleCancel();
            } else {
              setIsEditing(true);
            }
          }}
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
                background: `linear-gradient(135deg, ${(banner as any).gradientFrom || '#059669'} 0%, ${(banner as any).gradientTo || '#047857'} 100%)`,
              }}
            >
              {(banner as any).backgroundImageUrl && (
                <div 
                  className="absolute inset-0 rounded-2xl bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('${(banner as any).backgroundImageUrl}')`,
                    opacity: ((banner as any).overlayOpacity || 60) / 100,
                  }}
                />
              )}
              
              <div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${(banner as any).gradientFrom || '#059669'}CC 0%, ${(banner as any).gradientTo || '#047857'}CC 100%)`,
                }}
              />
              
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-3">
                <h2 className="text-2xl font-bold drop-shadow-lg text-white">
                  {(banner as any).title}
                </h2>
                <p className="text-base leading-relaxed opacity-95 drop-shadow-md max-w-md text-white">
                  {(banner as any).description}
                </p>
                <div className="mt-4">
                  <span className="px-6 py-3 rounded-full text-sm font-bold bg-white text-green-600 shadow-lg inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {(banner as any).buttonText}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Статус:</span>
                <Badge variant={(banner as any).isActive ? 'default' : 'secondary'} className="ml-2">
                  {(banner as any).isActive ? 'Активный' : 'Неактивный'}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Ссылка:</span>
                <span className="ml-2 text-blue-600">{(banner as any).linkUrl}</span>
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
                <Label htmlFor="linkUrl">Ссылка (относительный путь)</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="/sell"
                />
                <p className="text-xs text-gray-500">Введите относительный путь, например: /sell или /create-listing</p>
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradientFrom">Цвет начала</Label>
                  <Input
                    id="gradientFrom"
                    type="color"
                    value={formData.gradientFrom}
                    onChange={(e) => setFormData({ ...formData, gradientFrom: e.target.value })}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradientTo">Цвет конца</Label>
                  <Input
                    id="gradientTo"
                    type="color"
                    value={formData.gradientTo}
                    onChange={(e) => setFormData({ ...formData, gradientTo: e.target.value })}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overlayOpacity">Прозрачность (%)</Label>
                  <Input
                    id="overlayOpacity"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.overlayOpacity}
                    onChange={(e) => setFormData({ ...formData, overlayOpacity: parseInt(e.target.value) || 60 })}
                    className="h-10"
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
                  <Label htmlFor="isActive">Активный</Label>
                </div>
              </div>

              {/* Кнопки управления */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <Button
                  type="submit"
                  disabled={updateBannerMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base font-medium"
                >
                  {updateBannerMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="px-6 py-2 text-base"
                >
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

// Компонент управления рекламной каруселью
function AdvertisementCarouselManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<AdvertisementCarousel | null>(null);
  const [deletingItem, setDeletingItem] = useState<AdvertisementCarousel | null>(null);
  const [formKey, setFormKey] = useState(0); // Для принудительного обновления формы
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: 'Узнать больше',
    order: 1,
    isActive: true,
  });

  const { data: carouselItems = [], isLoading } = useQuery<AdvertisementCarousel[]>({
    queryKey: ['/api/admin/advertisement-carousel'],
    staleTime: 1000, // 1 секунда - мгновенное обновление для админа
    refetchInterval: 5000, // Обновляем каждые 5 секунд
  });



  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/advertisement-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create item');
      return response.json();
    },
    onSuccess: () => {
      // Принудительно очищаем все кэши
      queryClient.removeQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      queryClient.removeQueries({ queryKey: ['/api/advertisement-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisement-carousel'] });
      
      // Принудительно перезагружаем данные
      queryClient.refetchQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      
      handleCancel();
      toast({
        title: "Успешно",
        description: "Рекламное объявление создано",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать объявление",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/advertisement-carousel/${editingItem?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update item');
      return response.json();
    },
    onSuccess: async (updatedItem) => {
      // Принудительно очищаем все кэши
      queryClient.removeQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      queryClient.removeQueries({ queryKey: ['/api/advertisement-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisement-carousel'] });
      
      // Принудительно перезагружаем данные
      await queryClient.refetchQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      
      // Получаем свежие данные с сервера и обновляем форму
      if (editingItem) {
        const response = await fetch(`/api/admin/advertisement-carousel/${editingItem.id}`);
        if (response.ok) {
          const freshItem = await response.json();
          setEditingItem(freshItem);
          setFormData({
            title: freshItem.title,
            description: freshItem.description || '',
            imageUrl: freshItem.imageUrl,
            linkUrl: freshItem.linkUrl || '',
            buttonText: freshItem.buttonText || 'Узнать больше',
            order: freshItem.order || 1,
            isActive: freshItem.isActive || true,
          });
          setFormKey(prev => prev + 1); // Принудительно обновляем форму
        }
      }
      
      toast({
        title: "Успешно",
        description: "Рекламное объявление обновлено",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить объявление",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/advertisement-carousel/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
    },
    onSuccess: () => {
      // Принудительно очищаем все кэши
      queryClient.removeQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      queryClient.removeQueries({ queryKey: ['/api/advertisement-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisement-carousel'] });
      
      // Принудительно перезагружаем данные
      queryClient.refetchQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      
      toast({
        title: "Успешно",
        description: "Рекламное объявление удалено",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить объявление",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItemMutation.mutate(formData);
    } else {
      createItemMutation.mutate(formData);
    }
  };

  const handleEdit = async (item: AdvertisementCarousel) => {
    // Сначала получаем свежие данные с сервера
    const response = await fetch(`/api/admin/advertisement-carousel/${item.id}`);
    if (response.ok) {
      const freshItem = await response.json();
      setEditingItem(freshItem);
      setFormData({
        title: freshItem.title,
        description: freshItem.description || '',
        imageUrl: freshItem.imageUrl,
        linkUrl: freshItem.linkUrl || '',
        buttonText: freshItem.buttonText || 'Узнать больше',
        order: freshItem.order || 1,
        isActive: freshItem.isActive,
      });
    } else {
      // Fallback к кэшированным данным
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        imageUrl: item.imageUrl,
        linkUrl: item.linkUrl || '',
        buttonText: item.buttonText || 'Узнать больше',
        order: item.order || 1,
        isActive: item.isActive || true,
      });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      buttonText: 'Узнать больше',
      order: 1,
      isActive: true,
    });
    // Принудительно обновляем данные
    queryClient.refetchQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
  };

  const handleDelete = (item: AdvertisementCarousel) => {
    setDeletingItem(item);
  };

  const confirmDelete = () => {
    if (deletingItem) {
      deleteItemMutation.mutate(deletingItem.id);
      setDeletingItem(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Максимум 3 активных объявления
        </p>
        <Button onClick={() => setEditingItem({} as AdvertisementCarousel)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить объявление
        </Button>
      </div>

      {/* Форма редактирования */}
      {editingItem && (
        <Card key={formKey}>
          <CardHeader>
            <CardTitle>
              {editingItem.id ? 'Редактировать объявление' : 'Новое объявление'}
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
                    placeholder="Приведи своего друга - получи подарок"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Текст кнопки</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Узнать больше"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Подробное описание предложения..."
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkUrl">Ссылка (необязательно)</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="home, sell, favorites (автоматически добавляется /)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Примеры: home → /home, sell → /sell, favorites → /favorites
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Порядок показа (1-3)</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="3"
                    required
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
                  <Label htmlFor="isActive">Активное</Label>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <Button
                  type="submit"
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-base font-medium"
                >
                  {createItemMutation.isPending || updateItemMutation.isPending
                    ? 'Сохранение...'
                    : editingItem.id
                    ? 'Обновить'
                    : 'Создать'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="px-6 py-2 text-base"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Список объявлений */}
      <div className="grid gap-4">
        {carouselItems && carouselItems.length > 0 ? (
          carouselItems.map((item) => (
            <Card key={item.id} className={`${!item.isActive ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <span className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        #{item.order}
                      </span>
                      {item.isActive && (
                        <span className="text-sm bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-1 rounded">
                          Активно
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                    <div className="text-sm text-gray-500">
                      <div>Кнопка: {item.buttonText}</div>
                      {item.linkUrl && <div>Ссылка: {item.linkUrl}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {item.imageUrl && (
                  <div className="mt-4 pt-4 border-t">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
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
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Рекламные объявления не найдены</p>
              <p className="text-sm text-gray-400 mt-1">Создайте первое объявление</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Модальное окно для подтверждения удаления */}
      <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить рекламное объявление "{deletingItem?.title}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

// Компонент для управления архивом
function ArchiveManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingArchived, setDeletingArchived] = useState<any>(null);
  
  // Запросы для получения данных
  const { data: archivedListings, isLoading: isLoadingArchived } = useQuery({
    queryKey: ['/api/archived-listings'],
    queryFn: async () => {
      const response = await fetch('/api/archived-listings');
      if (!response.ok) throw new Error('Failed to fetch archived listings');
      return response.json();
    }
  });

  // Мутация для архивирования просроченных аукционов
  const archiveExpiredMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/archive-expired', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to archive expired listings');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Архивирование завершено",
        description: `Архивировано ${data.archivedCount} просроченных аукционов`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/archived-listings'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка архивирования",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Мутация для перезапуска аукциона
  const restartListingMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await fetch(`/api/restart-listing/${listingId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.userId?.toString() || user?.id?.toString() || '4',
          'x-user-email': user?.email || '+992 (90) 333-13-32@autoauction.tj'
        }
      });
      if (!response.ok) throw new Error('Failed to restart listing');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Аукцион перезапущен",
        description: "Создан новый аукцион с новым номером лота",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/archived-listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка перезапуска",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Мутация для удаления архивированного аукциона
  const deleteArchivedMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await fetch(`/api/archived-listings/${listingId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete archived listing');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Аукцион удален",
        description: "Архивированный аукцион удален навсегда",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/archived-listings'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoadingArchived) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Загрузка архива...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка архивирования */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Архив аукционов</h2>
          <p className="text-gray-600">Завершенные аукционы старше 24 часов</p>
        </div>
        <Button
          onClick={() => archiveExpiredMutation.mutate()}
          disabled={archiveExpiredMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {archiveExpiredMutation.isPending ? 'Архивирую...' : 'Архивировать просроченные'}
        </Button>
      </div>

      {/* Статистика архива */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Статистика архива</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {archivedListings?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Архивированных аукционов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {archivedListings?.filter((l: any) => l.currentBid)?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Со ставками</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список архивированных аукционов */}
      <div className="space-y-4">
        {archivedListings && archivedListings.length > 0 ? (
          archivedListings.map((listing: any) => (
            <Card key={listing.id} className="border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {listing.make} {listing.model} ({listing.year})
                      </h3>
                      <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                        Архивирован
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>Лот: {listing.lotNumber}</div>
                      <div>Пробег: {listing.mileage.toLocaleString()} км</div>
                      <div>Стартовая цена: ${listing.startingPrice}</div>
                      <div>
                        {listing.currentBid ? (
                          <span className="text-green-600 font-semibold">
                            Финальная ставка: ${listing.currentBid}
                          </span>
                        ) : (
                          <span className="text-gray-500">Без ставок</span>
                        )}
                      </div>
                    </div>
                    {listing.endedAt && (
                      <div className="mt-2 text-xs text-gray-500">
                        Завершен: {new Date(listing.endedAt).toLocaleString('ru-RU')}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => restartListingMutation.mutate(listing.id)}
                      disabled={restartListingMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Перезапустить
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteArchivedMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить навсегда</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите навсегда удалить архивированный аукцион "{listing.make} {listing.model}"? 
                            Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteArchivedMutation.mutate(listing.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Удалить навсегда
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Архив пуст
              </h3>
              <p className="text-gray-500">
                Архивированные аукционы будут отображаться здесь
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Компонент кнопки прокрутки наверх
// Раздел "Выигрыши"
function WinsSection() {
  const { data: wins = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/wins'],
    staleTime: 1000, // 1 секунда
    refetchInterval: 3000, // Автообновление каждые 3 секунды
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number | string) => {
    return `${Number(price).toLocaleString()} сомони`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Все выигрыши аукционов
            </CardTitle>
            <CardDescription>
              Полный список побед с информацией о победителях
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка выигрышей...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Все выигрыши аукционов ({wins.length})
              </CardTitle>
              <CardDescription>
                Полный список побед с информацией о победителях
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {wins.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Пока нет завершенных аукционов с победителями</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wins.map((win: any) => (
                <div key={win.id} className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          🏆 ПОБЕДА
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Лот #{win.listing.lotNumber}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {win.listing.make} {win.listing.model}
                          </h3>
                          <p className="text-gray-600">
                            {win.listing.year} год
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-green-600">
                            Победитель: {win.winnerName}
                          </p>
                          {win.winnerPhone && (
                            <p className="text-sm text-gray-600">
                              📞 {win.winnerPhone}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-bold text-lg text-green-600">
                            {formatPrice(win.winningBid)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(win.wonAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {win.listing.photos && win.listing.photos.length > 0 ? (
                        <img 
                          src={win.listing.photos[0]} 
                          alt={`${win.listing.make} ${win.listing.model}`}
                          className="w-20 h-16 object-cover rounded-lg border-2 border-yellow-300"
                        />
                      ) : (
                        <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-yellow-300">
                          <Car className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white p-0"
          size="sm"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}

// Компонент управления реферальной системой
function ReferralsSection() {
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    staleTime: 1000,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  // Фильтруем пользователей-рефералов
  const referredUsers = users.filter(user => (user as any).isInvited);
  const referrers = users.filter(user => 
    referredUsers.some(ref => (ref as any).invitedBy === user?.phoneNumber)
  );

  // Статистика по рефералам
  const stats = {
    totalReferrals: referredUsers.length,
    activeReferrals: referredUsers.filter(user => user.isActive).length,
    uniqueReferrers: referrers.length
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего рефералов</p>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
              </div>
              <Gift className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Активные рефералы</p>
                <p className="text-2xl font-bold">{stats.activeReferrals}</p>
              </div>
              <UserIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Приглашающих</p>
                <p className="text-2xl font-bold">{stats.uniqueReferrers}</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список рефералов */}
      <Card>
        <CardHeader>
          <CardTitle>Приглашенные пользователи</CardTitle>
          <CardDescription>
            Пользователи, зарегистрированные по реферальной программе
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referredUsers.length > 0 ? (
            <div className="space-y-3">
              {referredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{user.fullName || user?.phoneNumber}</p>
                        <p className="text-sm text-gray-600">
                          Пригласил: {(user as any).invitedBy}
                        </p>
                        <p className="text-xs text-gray-500">
                          Регистрация: {new Date(user.createdAt!).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Реферал
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Рефералов пока нет</p>
              <p className="text-sm mt-1">Когда появятся приглашенные пользователи, они отобразятся здесь</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Список приглашающих */}
      {referrers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Активные приглашающие</CardTitle>
            <CardDescription>
              Пользователи, которые приглашают других в систему
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrers.map((referrer) => {
                const referredCount = referredUsers.filter(
                  ref => (ref as any).invitedBy === referrer.phoneNumber
                ).length;
                
                return (
                  <div key={referrer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{referrer.fullName || referrer.phoneNumber}</p>
                          <p className="text-sm text-gray-600">
                            {referrer.phoneNumber} • {referrer.role}
                          </p>
                          <p className="text-xs text-blue-600">
                            Пригласил: {referredCount} пользовател{referredCount === 1 ? 'я' : referredCount < 5 ? 'ей' : 'ей'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={referrer.isActive ? 'default' : 'secondary'}>
                        {referrer.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        Приглашающий
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}