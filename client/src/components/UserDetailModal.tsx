import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User, Document, CarListing } from '@shared/schema';
import { User2, FileText, Trash2, Upload, X, Car, Edit, Eye, Camera, Calendar, ZoomIn } from 'lucide-react';
import { ListingEditModal } from '@/components/ListingEditModal';

interface UserDetailModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ userId, isOpen, onClose }: UserDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [editingListingId, setEditingListingId] = useState<number | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Document form state
  const [documentType, setDocumentType] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  
  // Image viewing state
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: [`/api/admin/users/${userId}`],
    enabled: !!userId && isOpen,
  });

  // Fetch user documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: [`/api/admin/users/${userId}/documents`],
    enabled: !!userId && isOpen,
  });

  // Fetch user listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery<CarListing[]>({
    queryKey: [`/api/admin/users/${userId}/listings`],
    enabled: !!userId && isOpen,
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhoneNumber(user?.phoneNumber || '');
      setIsActive(user.isActive || false);
    }
  }, [user]);

  // Update user profile mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { fullName: string; email: string; phoneNumber: string }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: 'Профиль пользователя обновлен',
        duration: 1000 // Автоматически исчезает через 1 секунду
      });
      // Обновляем кэш админ панели
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      // Обновляем кэш основного профиля пользователя
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
    },
    onError: () => {
      toast({ title: 'Ошибка при обновлении профиля', variant: 'destructive' });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Ошибка удаления: ${response.status} - ${errorData}`);
      }
      return true; // Успешное удаление
    },
    onSuccess: () => {
      toast({ 
        title: 'Пользователь удален',
        description: 'Пользователь и все связанные данные успешно удалены',
        duration: 2000
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      onClose();
    },
    onError: (error) => {
      console.error('Delete user error:', error);
      toast({ 
        title: 'Ошибка при удалении пользователя', 
        description: error.message,
        variant: 'destructive',
        duration: 5000
      });
    },
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to update user status');
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: 'Статус пользователя обновлен',
        duration: 1000 // Автоматически исчезает через 1 секунду
      });
      // Обновляем кэш админ панели
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      // Обновляем кэш основного профиля пользователя
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
    },
    onError: () => {
      toast({ title: 'Ошибка при обновлении статуса', variant: 'destructive' });
    },
  });

  // Add document mutation
  const addDocumentMutation = useMutation({
    mutationFn: async (document: { type: string; title: string; content: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(document),
      });
      if (!response.ok) throw new Error('Failed to add document');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Документ добавлен' });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/documents`] });
      setDocumentType('');
      setDocumentTitle('');
      setDocumentContent('');
    },
    onError: () => {
      toast({ title: 'Ошибка при добавлении документа', variant: 'destructive' });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/admin/users/${userId}/documents/${documentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Документ удален' });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/documents`] });
    },
    onError: () => {
      toast({ title: 'Ошибка при удалении документа', variant: 'destructive' });
    },
  });

  const handleUpdateProfile = () => {
    updateUserMutation.mutate({
      fullName,
      email,
      phoneNumber,
    });
  };

  const handleStatusChange = (newStatus: boolean) => {
    setIsActive(newStatus);
    updateUserStatusMutation.mutate(newStatus);
  };

  const handleDeleteUser = () => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
      deleteUserMutation.mutate();
    }
  };

  const handleAddDocument = () => {
    if (!documentType || !documentTitle || !documentContent) {
      toast({ title: 'Заполните все поля документа', variant: 'destructive' });
      return;
    }
    addDocumentMutation.mutate({
      type: documentType,
      title: documentTitle,
      content: documentContent,
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      passport: 'Паспорт',
      license: 'Водительские права',
      identity: 'Удостоверение личности',
      policy: 'Полис',
      other: 'Другое'
    };
    return types[type as keyof typeof types] || type;
  };

  // Определение типа документа паспорта по названию
  const getPassportType = (title: string) => {
    if (title.includes('передняя') || title.includes('передний')) {
      return 'front';
    } else if (title.includes('задняя') || title.includes('задний')) {
      return 'back';
    }
    return 'unknown';
  };

  // Получение изображения документа 
  const getDocumentImage = (document: any) => {
    if (document.content && document.content.startsWith('data:image/')) {
      return document.content;
    }
    return null;
  };

  // Группировка документов паспорта
  const passportDocuments = documents.filter(doc => doc.type === 'passport' || doc.title?.toLowerCase().includes('паспорт'));
  const otherDocuments = documents.filter(doc => doc.type !== 'passport' && !doc.title?.toLowerCase().includes('паспорт'));

  if (!isOpen || !userId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User2 className="w-5 h-5" />
            Управление пользователем {user?.fullName || `ID: ${userId}`}
          </DialogTitle>
          <DialogDescription>
            Редактирование профиля пользователя и управление документами
          </DialogDescription>
        </DialogHeader>

        {userLoading ? (
          <div className="p-8 text-center">Загрузка...</div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
              <TabsTrigger value="listings">Объявления</TabsTrigger>
              <TabsTrigger value="documents">Документы</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Информация о пользователе</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Полное имя</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Введите полное имя"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Введите email"
                      />
                    </div>
                  </div>

                  <div>
                    <div>
                      <Label htmlFor="phoneNumber">Номер телефона</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Введите номер телефона"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <Label htmlFor="user-status" className="text-sm font-medium">
                        Статус аккаунта
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {isActive ? 'Пользователь активен и может использовать платформу' : 'Аккаунт заблокирован'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="user-status" className="text-sm">
                        {isActive ? 'Активен' : 'Заблокирован'}
                      </Label>
                      <Switch
                        id="user-status"
                        checked={isActive}
                        onCheckedChange={handleStatusChange}
                        disabled={updateUserStatusMutation.isPending}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteUser}
                      disabled={deleteUserMutation.isPending}
                    >
                      {deleteUserMutation.isPending ? 'Удаление...' : 'Удалить пользователя'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика пользователя</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Статус:</span>
                    <Badge variant={user?.isActive ? 'default' : 'destructive'}>
                      {user?.isActive ? 'Активен' : 'Заблокирован'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Роль:</span>
                    <Badge variant="outline">{user?.role}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Дата регистрации:</span>
                    <span className="text-sm text-gray-500">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Объявления пользователя ({listings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {listingsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      Загрузка объявлений...
                    </div>
                  ) : !listings || listings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Car className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      У пользователя пока нет объявлений
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {listings.map((listing) => (
                        <Card key={listing.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            {/* Заголовок с кнопками */}
                            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                  {listing.make} {listing.model} {listing.year}
                                </h4>
                                <Badge 
                                  variant={
                                    listing.status === 'active' ? 'default' : 
                                    listing.status === 'pending' ? 'secondary' :
                                    listing.status === 'ended' ? 'outline' : 'destructive'
                                  }
                                  className="px-3 py-1"
                                >
                                  {listing.status === 'active' ? 'АКТИВНЫЙ' :
                                   listing.status === 'pending' ? 'НА МОДЕРАЦИИ' :
                                   listing.status === 'ended' ? 'ЗАВЕРШЕН' : 'ОТКЛОНЕН'}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`/auction/${listing.id}`, '_blank')}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  Просмотр
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingListingId(listing.id)}
                                  className="flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Редактировать
                                </Button>
                              </div>
                            </div>

                            {/* Основная информация */}
                            <div className="p-6">
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                {/* Блок 1: Основные данные */}
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Основное</h5>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex flex-col">
                                      <span className="text-gray-500 text-xs">Лот №</span>
                                      <span className="font-medium">{listing.lotNumber}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-gray-500 text-xs">Пробег</span>
                                      <span className="font-medium">{listing.mileage ? `${listing.mileage.toLocaleString()} км` : 'Не указан'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-gray-500 text-xs">Состояние</span>
                                      <span className="font-medium">{listing.condition || 'Не указано'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Блок 2: Финансы */}
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Цены</h5>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex flex-col">
                                      <span className="text-gray-500 text-xs">Стартовая цена</span>
                                      <span className="font-bold text-green-600">${Number(listing.startingPrice).toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-gray-500 text-xs">Текущая ставка</span>
                                      <span className="font-bold text-blue-600">
                                        {listing.currentBid ? `$${Number(listing.currentBid).toLocaleString()}` : 'Нет ставок'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Блок 3: Технические характеристики */}
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Техника</h5>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex flex-col">
                                      <span className="text-gray-500 text-xs">Двигатель</span>
                                      <span className="font-medium">{listing.engine || 'Не указан'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-gray-500 text-xs">КПП</span>
                                      <span className="font-medium">{listing.transmission || 'Не указана'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-gray-500 text-xs">Топливо</span>
                                      <span className="font-medium">{listing.fuelType || 'Не указано'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Блок 4: Даты и местоположение */}
                                <div className="space-y-3">
                                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Дополнительно</h5>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex flex-col">
                                      <span className="text-gray-500 text-xs">Местоположение</span>
                                      <span className="font-medium">{listing.location || 'Не указано'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-gray-500 text-xs">Создано</span>
                                      <span className="font-medium">
                                        {listing.createdAt instanceof Date ? listing.createdAt.toLocaleDateString('ru-RU') : 'Не указано'}
                                      </span>
                                    </div>
                                    {listing.auctionEndTime && (
                                      <div className="flex flex-col">
                                        <span className="text-gray-500 text-xs">Окончание</span>
                                        <span className="font-medium">
                                          {listing.auctionEndTime instanceof Date ? listing.auctionEndTime.toLocaleDateString('ru-RU') : 'Не указано'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Описание */}
                              {listing.description && (
                                <div className="border-t pt-4">
                                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide mb-2">Описание</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{listing.description}</p>
                                </div>
                              )}

                              {/* Дополнительные характеристики */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Растаможен</span>
                                  <Badge variant={listing.customsCleared ? 'default' : 'secondary'}>
                                    {listing.customsCleared ? 'Да' : 'Нет'}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Утилизирован</span>
                                  <Badge variant={listing.recycled ? 'default' : 'secondary'}>
                                    {listing.recycled ? 'Да' : 'Нет'}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Техосмотр</span>
                                  <Badge variant={listing.technicalInspectionValid ? 'default' : 'secondary'}>
                                    {listing.technicalInspectionValid ? 'Действителен' : 'Недействителен'}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Тонировка</span>
                                  <Badge variant={listing.tinted ? 'default' : 'secondary'}>
                                    {listing.tinted ? 'Есть' : 'Нет'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Добавить документ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="documentType">Тип документа</Label>
                      <select
                        id="documentType"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Выберите тип</option>
                        <option value="passport">Паспорт</option>
                        <option value="license">Водительские права</option>
                        <option value="identity">Удостоверение личности</option>
                        <option value="policy">Полис</option>
                        <option value="other">Другое</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="documentTitle">Название документа</Label>
                      <Input
                        id="documentTitle"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        placeholder="Введите название"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="documentContent">Содержание/Описание</Label>
                    <Textarea
                      id="documentContent"
                      value={documentContent}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      placeholder="Введите описание или содержание документа"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleAddDocument}
                    disabled={addDocumentMutation.isPending}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {addDocumentMutation.isPending ? 'Добавление...' : 'Добавить документ'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Документы пользователя
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documentsLoading ? (
                    <div className="text-center py-4">Загрузка документов...</div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      У пользователя нет документов
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Документы паспорта */}
                      {passportDocuments.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-blue-600" />
                            Паспорт
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {passportDocuments.map((document) => {
                              const passportType = getPassportType(document.title || '');
                              const documentImage = getDocumentImage(document);
                              
                              return (
                                <Card key={document.id} className="overflow-hidden">
                                  <CardContent className="p-0">
                                    {/* Превью изображения */}
                                    {documentImage ? (
                                      <div className="relative aspect-[3/2] bg-gray-100">
                                        <img
                                          src={documentImage}
                                          alt={document.title}
                                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => setViewingImage(documentImage)}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                                          <ZoomIn className="w-8 h-8 text-white" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                                        <Camera className="w-12 h-12 text-gray-400" />
                                      </div>
                                    )}
                                    
                                    {/* Информация о документе */}
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-medium">
                                          {passportType === 'front' ? 'Паспорт - передняя часть' : 
                                           passportType === 'back' ? 'Паспорт - задняя часть' : 
                                           document.title}
                                        </h5>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => deleteDocumentMutation.mutate(document.id)}
                                          disabled={deleteDocumentMutation.isPending}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                          Паспорт • {document.createdAt ? new Date(document.createdAt.toString()).toLocaleDateString('ru-RU') : 'Дата не указана'}
                                        </span>
                                      </div>
                                      {documentImage && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="w-full mt-3"
                                          onClick={() => setViewingImage(documentImage)}
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          Просмотреть
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Другие документы */}
                      {otherDocuments.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-600" />
                            Другие документы
                          </h4>
                          <div className="space-y-3">
                            {otherDocuments.map((document) => (
                              <div
                                key={document.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{document.title}</div>
                                    <div className="text-sm text-gray-500">
                                      {getDocumentTypeLabel(document.type)} • {' '}
                                      {document.createdAt ? new Date(document.createdAt.toString()).toLocaleDateString('ru-RU') : 'Дата не указана'}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteDocumentMutation.mutate(document.id)}
                                  disabled={deleteDocumentMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
      
      {/* Модальное окно редактирования объявления */}
      <ListingEditModal 
        listingId={editingListingId}
        isOpen={!!editingListingId}
        onClose={() => {
          setEditingListingId(null);
          // Обновляем список объявлений после редактирования
          queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/listings`] });
        }}
      />

      {/* Модальное окно просмотра изображения */}
      {viewingImage && (
        <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Просмотр документа
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={viewingImage}
                  alt="Документ пользователя"
                  className="w-full max-h-[70vh] object-contain"
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setViewingImage(null)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}