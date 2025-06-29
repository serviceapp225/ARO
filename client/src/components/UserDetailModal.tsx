import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User, Document } from '@shared/schema';
import { User2, FileText, Trash2, Upload, X } from 'lucide-react';

interface UserDetailModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ userId, isOpen, onClose }: UserDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Document form state
  const [documentType, setDocumentType] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState('');

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

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setUsername(user.username || '');
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [user]);

  // Update user profile mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { fullName: string; email: string; username: string; phoneNumber: string }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Профиль пользователя обновлен' });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
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
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Пользователь удален' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      onClose();
    },
    onError: () => {
      toast({ title: 'Ошибка при удалении пользователя', variant: 'destructive' });
    },
  });

  // Add document mutation
  const addDocumentMutation = useMutation({
    mutationFn: async (document: { type: string; title: string; content: string }) => {
      return await apiRequest(`/api/admin/users/${userId}/documents`, {
        method: 'POST',
        body: JSON.stringify(document),
      });
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
      return await apiRequest(`/api/admin/users/${userId}/documents/${documentId}`, {
        method: 'DELETE',
      });
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
      username,
      phoneNumber,
    });
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

  if (!isOpen || !userId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User2 className="w-5 h-5" />
            Управление пользователем {user?.fullName || `ID: ${userId}`}
          </DialogTitle>
        </DialogHeader>

        {userLoading ? (
          <div className="p-8 text-center">Загрузка...</div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Имя пользователя</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Введите имя пользователя"
                      />
                    </div>
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
                  <CardTitle>Документы пользователя</CardTitle>
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
                    <div className="space-y-3">
                      {documents.map((document) => (
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
                                {new Date(document.createdAt).toLocaleDateString('ru-RU')}
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}