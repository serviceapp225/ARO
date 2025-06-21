import { useState, useEffect } from "react";
import { ArrowLeft, User, Phone, Mail, Upload, Camera } from "lucide-react";
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
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Синхронизируем tempData с userData при изменениях
  useEffect(() => {
    setTempData(userData);
  }, [userData]);

  // Mutation to update user profile in database
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { fullName?: string; profilePhoto?: string }) => {
      if (!user?.phoneNumber) {
        throw new Error('User not authenticated');
      }
      
      // Get user ID by phone number
      const userResponse = await fetch(`/api/users/by-phone/${encodeURIComponent(user.phoneNumber)}`);
      if (!userResponse.ok) {
        throw new Error('User not found');
      }
      const userData = await userResponse.json();
      
      // Update user profile
      const response = await fetch(`/api/users/${userData.id}`, {
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
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
        duration: 3000,
      });
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

  const handleFileUpload = (type: 'front' | 'back') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

  const handleInputChange = (field: string, value: string) => {
    setTempData(prev => ({ ...prev, [field]: value }));
    updateUserData({ [field]: value });
    
    // Save fullName to database immediately when changed
    if (field === 'fullName') {
      updateProfileMutation.mutate({ fullName: value });
    }
  };

  const currentData = userData;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
                <Input
                  id="fullName"
                  value={currentData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Введите ваше полное имя"
                  className="mt-1"
                />
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
                      <Camera className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="text-green-700 font-medium">Файл загружен</p>
                      <p className="text-sm text-gray-500">{currentData.passportFront.name}</p>
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
                      <Camera className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="text-green-700 font-medium">Файл загружен</p>
                      <p className="text-sm text-gray-500">{currentData.passportBack.name}</p>
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
    </div>
  );
}