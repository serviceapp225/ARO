import { useState, useEffect } from "react";
import { ArrowLeft, User, Phone, Mail, Upload, Camera, Edit, Save, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useUserData } from "@/contexts/UserDataContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export default function UserData() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { userData, updateUserData } = useUserData();
  const [tempData, setTempData] = useState(userData);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(userData.fullName || '');
  const [passportPreviews, setPassportPreviews] = useState<{
    front: string | null;
    back: string | null;
  }>({ front: null, back: null });
  const [showPreview, setShowPreview] = useState<{
    type: 'front' | 'back' | null;
    url: string | null;
  }>({ type: null, url: null });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Синхронизируем tempData с userData при изменениях
  useEffect(() => {
    setTempData(userData);
    setEditedName(userData.fullName || '');
  }, [userData]);

  // Обработка клавиши Escape для закрытия модального окна
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPreview.url) {
        closePreview();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showPreview.url]);

  // Function to get current user ID from auth context
  const getCurrentUserId = () => {
    return user?.userId || null;
  };

  // Mutation to update user profile in database
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { fullName?: string; profilePhoto?: string }) => {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Update user profile
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (updatedUser) => {
      // Invalidate user data cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: [`/api/users/${updatedUser.id}`] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  // Функция для создания превью изображения
  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (type: 'front' | 'back') => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Создаем превью изображения
      const previewUrl = await createImagePreview(file);
      setPassportPreviews(prev => ({
        ...prev,
        [type]: previewUrl
      }));

      updateUserData({
        [type === 'front' ? 'passportFront' : 'passportBack']: file
      });
      
      toast({
        title: "Файл загружен",
        description: `${type === 'front' ? 'Передняя' : 'Задняя'} часть паспорта загружена`,
        duration: 3000,
      });
    }
  };

  // Функция для открытия превью в полном размере
  const openPreview = (type: 'front' | 'back') => {
    const previewUrl = passportPreviews[type];
    if (previewUrl) {
      setShowPreview({ type, url: previewUrl });
    }
  };

  // Функция для закрытия превью
  const closePreview = () => {
    setShowPreview({ type: null, url: null });
  };

  const handleInputChange = (field: string, value: string) => {
    setTempData(prev => ({ ...prev, [field]: value }));
    updateUserData({ [field]: value });
  };

  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(currentData.fullName || '');
  };

  const handleSaveName = () => {
    if (editedName.trim() === '') {
      toast({
        title: "Ошибка",
        description: "ФИО не может быть пустым",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Update local data
    updateUserData({ fullName: editedName });
    
    // Save to database
    updateProfileMutation.mutate({ fullName: editedName });
    
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(currentData.fullName || '');
    setIsEditingName(false);
  };

  // Используем данные из API как приоритетные, fallback на userData из localStorage
  const currentData = {
    ...userData,
    fullName: user?.fullName || userData.fullName,
    phoneNumber: user?.phoneNumber || userData.phoneNumber,
    email: user?.email || userData.email,
  };

  return (
    <div className="min-h-screen bg-gray-50 main-content">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Мои данные</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Личная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">ФИО</Label>
                {!isEditingName ? (
                  <div className="mt-1 flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                    <span className="text-gray-900">
                      {currentData.fullName || "(не указано)"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditName}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Редактировать
                    </Button>
                  </div>
                ) : (
                  <div className="mt-1 space-y-2">
                    <Input
                      id="fullName"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Введите ваше полное имя"
                      className="w-full"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        disabled={updateProfileMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {updateProfileMutation.isPending ? "Сохранение..." : "Сохранить"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={updateProfileMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Отмена
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber">Номер телефона</Label>
                <div className="mt-1 p-3 bg-gray-100 rounded-md text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {currentData.phoneNumber}
                  <span className="text-xs">(не изменяется)</span>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Электронная почта</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@mail.com"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Passport Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Документы паспорта
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Front passport */}
              <div>
                <Label>Передняя часть паспорта</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {currentData.passportFront ? (
                    <div className="space-y-2">
                      {passportPreviews.front ? (
                        <div className="space-y-3">
                          <div className="relative mx-auto w-32 h-20 bg-gray-100 rounded-lg overflow-hidden border">
                            <img 
                              src={passportPreviews.front} 
                              alt="Превью передней части паспорта"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Camera className="w-4 h-4 text-green-600" />
                            <p className="text-green-700 font-medium">Образец загружен</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openPreview('front')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Увеличить
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="w-8 h-8 text-green-600 mx-auto" />
                          <p className="text-green-700 font-medium">Файл загружен</p>
                          <p className="text-sm text-gray-500">{currentData.passportFront.name}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-gray-500">Передняя часть паспорта не загружена</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload('front')}
                    className="hidden"
                    id="passport-front"
                  />
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <label htmlFor="passport-front" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {currentData.passportFront ? 'Изменить файл' : 'Загрузить файл'}
                    </label>
                  </Button>
                </div>
              </div>

              {/* Back passport */}
              <div>
                <Label>Задняя часть паспорта</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {currentData.passportBack ? (
                    <div className="space-y-2">
                      {passportPreviews.back ? (
                        <div className="space-y-3">
                          <div className="relative mx-auto w-32 h-20 bg-gray-100 rounded-lg overflow-hidden border">
                            <img 
                              src={passportPreviews.back} 
                              alt="Превью задней части паспорта"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Camera className="w-4 h-4 text-green-600" />
                            <p className="text-green-700 font-medium">Образец загружен</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openPreview('back')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Увеличить
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="w-8 h-8 text-green-600 mx-auto" />
                          <p className="text-green-700 font-medium">Файл загружен</p>
                          <p className="text-sm text-gray-500">{currentData.passportBack.name}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-gray-500">Задняя часть паспорта не загружена</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload('back')}
                    className="hidden"
                    id="passport-back"
                  />
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <label htmlFor="passport-back" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {currentData.passportBack ? 'Изменить файл' : 'Загрузить файл'}
                    </label>
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Требования к файлам:</strong> Размер файла не более 5 МБ. 
                  Поддерживаемые форматы: JPG, PNG. Фотографии должны быть четкими и читаемыми.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Модальное окно для просмотра изображения в полном размере */}
      {showPreview.url && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div 
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={closePreview}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </Button>
            <img
              src={showPreview.url}
              alt={`Полный размер ${showPreview.type === 'front' ? 'передней' : 'задней'} части паспорта`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {showPreview.type === 'front' ? 'Передняя часть паспорта' : 'Задняя часть паспорта'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}