import { useState } from "react";
import { ArrowLeft, User, Phone, Mail, Upload, Camera, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function UserData() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock данные пользователя - в реальном приложении будут из контекста
  const [userData, setUserData] = useState({
    fullName: "",
    phoneNumber: "+992 (90) 123-45-67",
    email: "",
    passportFront: null as File | null,
    passportBack: null as File | null,
  });

  const [tempData, setTempData] = useState(userData);

  const handleFileUpload = (type: 'front' | 'back') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isEditing) {
        setTempData(prev => ({
          ...prev,
          [type === 'front' ? 'passportFront' : 'passportBack']: file
        }));
      } else {
        setUserData(prev => ({
          ...prev,
          [type === 'front' ? 'passportFront' : 'passportBack']: file
        }));
      }
      
      toast({
        title: "Файл загружен",
        description: `${type === 'front' ? 'Передняя' : 'Задняя'} часть паспорта загружена`,
        duration: 3000,
      });
    }
  };

  const handleSave = () => {
    setUserData(tempData);
    setIsEditing(false);
    toast({
      title: "Данные сохранены",
      description: "Ваши личные данные успешно обновлены",
      duration: 3000,
    });
  };

  const handleCancel = () => {
    setTempData(userData);
    setIsEditing(false);
  };

  const currentData = isEditing ? tempData : userData;

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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Личная информация
              </CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Отмена
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">ФИО</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={currentData.fullName}
                    onChange={(e) => setTempData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Введите ваше полное имя"
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-700">
                    {currentData.fullName || "Не указано"}
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
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={currentData.email}
                    onChange={(e) => setTempData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@mail.com"
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {currentData.email || "Не указано"}
                  </div>
                )}
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