import { useState } from "react";
import { Upload, X, Plus, CheckCircle, ArrowLeft, HelpCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CAR_MAKES_MODELS, getModelsForMake } from "../../../shared/car-data";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";


const TAJIKISTAN_CITIES = [
  "Душанбе",
  "Худжанд", 
  "Куляб",
  "Курган-Тюбе",
  "Истаравшан",
  "Канибадам",
  "Турсунзаде",
  "Исфара",
  "Пенджикент",
  "Кайраккум",
  "Вахдат",
  "Яван",
  "Нурек",
  "Рогун",
  "Дангира",
  "Шахринав",
  "Рудаки",
  "Хисор",
  "Вахш",
  "Пяндж",
  "Мургаб",
  "Ишкашим",
  "Хорог"
];

export default function SellCar() {
  const { user } = useAuth();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showReservePriceInfo, setShowReservePriceInfo] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);

  // Fetch users for admin selection
  const { data: allUsers = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: user?.role === 'admin' || user?.fullName === 'ADMIN',
  });

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    reservePrice: "",
    description: "",
    auctionDuration: "7", // По умолчанию 7 дней
    bodyType: "",
    fuelType: "",
    transmission: "",
    engineVolume: "",
    driveType: "",
    color: "",
    condition: "",
    vin: "",
    location: "",
    customsCleared: "",
    recycled: "",
    technicalInspectionValid: "",
    technicalInspectionDate: "",
    tinted: "",
    tintingDate: "",
    // Electric car fields
    batteryCapacity: "",
    electricRange: "",
    // Custom make/model field
    customMakeModel: ""
  });
  
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const remainingSlots = 20 - uploadedImages.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      // Показываем уведомление о начале обработки
      toast({
        title: "Обработка фотографий",
        description: `Сжимаем ${filesToProcess.length} фото...`,
        duration: 2000,
      });
      
      // Параллельная обработка всех фотографий
      const newImages = await Promise.all(
        filesToProcess.map(async (file) => {
          const originalSizeKB = Math.round(file.size / 1024);
          console.log(`📸 Загружается фото: ${file.name}, размер: ${originalSizeKB}KB`);
          
          // Агрессивное клиентское сжатие - сразу до конечного размера
          return await compressImage(file, 0.65, 800); // Уменьшили качество и размер
        })
      );
      
      // Добавляем сжатые фотографии без дополнительного серверного сжатия
      setUploadedImages(prev => [...prev, ...newImages]);
      
      // Показываем успешное уведомление
      const totalSize = newImages.reduce((sum, img) => sum + Math.round((img.length * 3) / 4 / 1024), 0);
      toast({
        title: "Фотографии готовы",
        description: `${newImages.length} фото добавлено (${totalSize}KB)`,
        duration: 1500,
      });
    }
  };

  const compressImage = (file: File, quality: number, maxWidth: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Рассчитываем новые размеры с сохранением пропорций
        let { width, height } = img;
        
        // Уменьшаем только если изображение больше максимального размера
        if (width > maxWidth || height > maxWidth) {
          const ratio = Math.min(maxWidth / width, maxWidth / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Быстрое сжатие без сглаживания для скорости
        ctx.imageSmoothingEnabled = false;
        
        // Отрисовываем сжатое изображение
        ctx.drawImage(img, 0, 0, width, height);
        
        // Конвертируем в JPEG с настроенным качеством
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
        
        // Освобождаем память
        URL.revokeObjectURL(img.src);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // When make changes, update available models and reset model selection
    if (field === "make") {
      const models = getModelsForMake(value);
      setAvailableModels(models);
      setFormData(prev => ({ ...prev, model: "" }));
    }
  };

  const handleDateInputChange = (field: string, value: string) => {
    // Разрешаем только цифры
    const numbersOnly = value.replace(/[^\d]/g, '');
    
    // Ограничиваем до 8 цифр (ДДММГГГГ)
    const limitedNumbers = numbersOnly.slice(0, 8);
    
    // Автоматически добавляем точки
    let formattedValue = limitedNumbers;
    if (limitedNumbers.length >= 3) {
      formattedValue = limitedNumbers.slice(0, 2) + '.' + limitedNumbers.slice(2);
    }
    if (limitedNumbers.length >= 5) {
      formattedValue = limitedNumbers.slice(0, 2) + '.' + limitedNumbers.slice(2, 4) + '.' + limitedNumbers.slice(4);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate required fields в точном порядке появления в HTML форме сверху вниз
    const requiredFields = [
      { field: formData.make, name: "Марка" },
      { field: formData.model, name: "Модель" },
      // Для "Другие марки" проверяем также кастомное поле
      ...(formData.make === "Другие марки" ? [{ field: formData.customMakeModel, name: "Марка и модель" }] : []),
      { field: formData.year, name: "Год выпуска" },
      { field: formData.mileage, name: "Пробег" },
      { field: formData.bodyType, name: "Тип кузова" },
      { field: formData.fuelType, name: "Тип топлива" },
      { field: formData.transmission, name: "Коробка передач" },
      { field: formData.engineVolume, name: "Объем двигателя" },
      { field: formData.driveType, name: "Привод" },
      { field: formData.color, name: "Цвет" },
      { field: formData.condition, name: "Состояние" },
      { field: formData.location, name: "Местоположение" },
      { field: formData.customsCleared, name: "Растаможка" },
      { field: formData.recycled, name: "Утилизационный сбор" },
      { field: formData.technicalInspectionValid, name: "Техосмотр" },
      { field: formData.tinted, name: "Тонировка" },
      { field: formData.price, name: "Стартовая цена" },
      { field: formData.description, name: "Описание" },
      { field: formData.auctionDuration, name: "Продолжительность аукциона" }
    ];

    // Условно обязательные поля - требуются только если выбран "да"
    if (formData.technicalInspectionValid === 'yes' && !formData.technicalInspectionDate) {
      toast({
        title: "Заполните дату техосмотра",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (formData.tinted === 'yes' && !formData.tintingDate) {
      toast({
        title: "Заполните дату тонировки",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    // Валидация полей для электромобилей
    if (formData.fuelType === 'electric') {
      if (!formData.batteryCapacity) {
        toast({
          title: "Заполните емкость батареи",
          description: "Для электромобилей обязательно указание емкости батареи в кВт·ч",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      if (!formData.electricRange) {
        toast({
          title: "Заполните запас хода",
          description: "Для электромобилей обязательно указание запаса хода в км",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Проверяем разумные значения
      const batteryCapacity = parseFloat(formData.batteryCapacity);
      const electricRange = parseInt(formData.electricRange);
      
      if (batteryCapacity < 10 || batteryCapacity > 200) {
        toast({
          title: "Неверная емкость батареи",
          description: "Емкость батареи должна быть от 10 до 200 кВт·ч",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      if (electricRange < 50 || electricRange > 800) {
        toast({
          title: "Неверный запас хода",
          description: "Запас хода должен быть от 50 до 800 км",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
    }

    // Находим первое незаполненное поле в порядке сверху вниз
    const fieldMapping: Record<string, string> = {
      "Марка": "make",
      "Модель": "model", 
      "Год выпуска": "year",
      "Пробег": "mileage",
      "Тип кузова": "bodyType",
      "Тип топлива": "fuelType",
      "Коробка передач": "transmission",
      "Объем двигателя": "engineVolume",
      "Привод": "driveType",
      "Цвет": "color",
      "Состояние": "condition",
      "Местоположение": "location",
      "Растаможка": "customsCleared",
      "Утилизационный сбор": "recycled",
      "Техосмотр": "technicalInspectionValid",
      "Тонировка": "tinted",
      "Стартовая цена": "price",
      "Описание": "description",
      "Продолжительность аукциона": "auctionDuration"
    };

    let firstEmptyField = null;
    let fieldId = null;
    
    // Проходим по полям в правильном порядке и находим первое пустое
    for (const { field, name } of requiredFields) {
      let isEmpty = false;
      
      // Для полей с да/нет вопросами, пустая строка означает что не выбрано
      if (name === "Техосмотр" || name === "Тонировка" || 
          name === "Растаможка" || name === "Утилизационный сбор") {
        isEmpty = !field;
      } else {
        // Для остальных полей проверяем что они заполнены
        isEmpty = !field || field.trim() === "";
      }
      
      if (isEmpty) {
        firstEmptyField = { field, name };
        fieldId = fieldMapping[name];
        break;
      }
    }
    
    if (firstEmptyField) {
      // Скроллим к полю
      setTimeout(() => {
        if (fieldId) {
          const element = document.getElementById(fieldId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (element.focus) {
              element.focus();
            } else if (element.click) {
              element.click();
            }
          } else {
            const altElement = document.querySelector(`[data-field="${fieldId}"]`) || 
                              document.querySelector(`label[for="${fieldId}"]`) ||
                              document.querySelector(`[name="${fieldId}"]`);
            if (altElement) {
              altElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      }, 100);
      
      toast({
        title: "Заполните все обязательные поля",
        description: `Первое незаполненное поле: ${firstEmptyField.name}`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (uploadedImages.length < 5) {
      toast({
        title: "Загрузите минимум 5 фотографий",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting car listing:", formData, uploadedImages);

    // Show success modal immediately for better UX
    setShowSuccessModal(true);
    setCountdown(3);
    
    // Start countdown timer
    let countdownInterval: NodeJS.Timeout;
    countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowSuccessModal(false);
          setLocation('/'); // Navigate to homepage
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      console.log('Current user for listing:', user);
      console.log('User ID:', (user as any)?.userId);
      console.log('Selected User ID:', selectedUserId);
      console.log('Final sellerId:', selectedUserId || (user as any)?.userId || (user as any)?.id || 2);
      
      // Create listing data matching database schema
      const listingData = {
        sellerId: selectedUserId || (user as any)?.userId || (user as any)?.id || 2, // Use selected user ID if admin, otherwise current user ID
        // lotNumber will be generated by the server using the standard generator
        make: formData.make,
        model: formData.model,
        customMakeModel: formData.make === "Другие марки" ? formData.customMakeModel : null,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage) || 0,
        description: formData.description,
        startingPrice: formData.price,
        reservePrice: formData.reservePrice || null,
        photos: uploadedImages, // Array of photo URLs
        auctionDuration: parseInt(formData.auctionDuration), // Keep as days
        customsCleared: formData.customsCleared === 'yes',
        recycled: formData.recycled === 'yes',
        technicalInspectionValid: formData.technicalInspectionValid === 'yes',
        technicalInspectionDate: formData.technicalInspectionDate || null,
        tinted: formData.tinted === 'yes',
        tintingDate: formData.tintingDate || null,
        engine: formData.engineVolume ? `${formData.engineVolume}L` : null,
        transmission: formData.transmission || null,
        fuelType: formData.fuelType || null,
        bodyType: formData.bodyType || null,
        driveType: formData.driveType || null,
        color: formData.color || null,
        condition: formData.condition || null,
        vin: formData.vin || null,
        location: formData.location || null,
        // Electric car fields
        batteryCapacity: formData.fuelType === 'electric' && formData.batteryCapacity ? parseFloat(formData.batteryCapacity) : null,
        electricRange: formData.fuelType === 'electric' && formData.electricRange ? parseInt(formData.electricRange) : null,
      };

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      console.log('🚨 About to send listing data:', JSON.stringify({...listingData, photos: `[${listingData.photos.length} photos]`}, null, 2));

      // Create FormData to handle file uploads instead of huge JSON
      const multipartData = new FormData();
      
      // Add all non-photo fields
      Object.entries(listingData).forEach(([key, value]) => {
        if (key !== 'photos' && value !== null && value !== undefined) {
          multipartData.append(key, String(value));
        }
      });
      
      // Add photos as individual files
      console.log('📷 Обрабатываем фотографии:', uploadedImages.length);
      for (let i = 0; i < uploadedImages.length; i++) {
        try {
          console.log(`📷 Обрабатываем фото ${i}...`);
          const base64Data = uploadedImages[i];
          const blob = await fetch(base64Data).then(r => r.blob());
          multipartData.append(`photo_${i}`, blob, `photo_${i}.jpg`);
          console.log(`✅ Фото ${i} добавлено в FormData`);
        } catch (error) {
          console.error(`❌ Ошибка обработки фото ${i}:`, error);
          throw error;
        }
      }

      console.log('🚀 Отправляем FormData запрос...');
      
      const response = await fetch('/api/listings', {
        method: 'POST',
        body: multipartData, // Send as FormData instead of JSON
        signal: controller.signal,
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      clearTimeout(timeoutId);

      // Accept both 200 (OK) and 201 (Created) as success
      if (response.status !== 200 && response.status !== 201) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('❌ Ошибка HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const newListing = await response.json();

      // Reset form (non-blocking)
      setTimeout(() => {
        setFormData({
          make: "",
          model: "",
          year: "",
          mileage: "",
          price: "",
          reservePrice: "",
          description: "",
          auctionDuration: "7",
          bodyType: "",
          fuelType: "",
          transmission: "",
          engineVolume: "",
          driveType: "",
          color: "",
          condition: "",
          vin: "",
          location: "",
          customsCleared: "",
          recycled: "",
          technicalInspectionValid: "",
          technicalInspectionDate: "",
          tinted: "",
          tintingDate: "",
          batteryCapacity: "",
          electricRange: "",
          customMakeModel: ""
        });
        setUploadedImages([]);
      }, 100);

      // Optimistic update - add new listing to cache without full reload
      queryClient.setQueryData(['/api/listings'], (oldData: any) => {
        if (Array.isArray(oldData)) {
          return [newListing, ...oldData];
        }
        return [newListing];
      });
      
      // Mark cache as fresh to prevent immediate reload on page navigation
      queryClient.setQueryData(['/api/listings'], (data: any) => data, {
        updatedAt: Date.now()
      });

    } catch (error) {
      console.error('Error creating listing:', error);
      
      // Close success modal if there's an error
      clearInterval(countdownInterval);
      setShowSuccessModal(false);
      
      let errorMessage = "Не удалось создать объявление. Попробуйте еще раз.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Время ожидания истекло. Проверьте интернет-соединение.";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Проблема с подключением к серверу.";
        }
      }
      
      toast({
        title: "Ошибка создания объявления",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 main-content">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-neutral-900 text-center">Продать автомобиль</h1>
          <p className="text-neutral-600 mt-1 text-center">Создайте объявление для аукциона</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Загрузите фото <span className="text-red-500">*</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Минимум 5 фотографий автомобиля 
                <span className={`ml-2 font-medium ${uploadedImages.length >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                  ({uploadedImages.length}/5)
                </span>
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                    <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                
                {uploadedImages.length < 20 && (
                  <label className="aspect-video border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-neutral-50 transition-colors">
                    <Plus className="w-8 h-8 text-neutral-400 mb-2" />
                    <span className="text-sm text-neutral-500">Добавить фото</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Car Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Информация об автомобиле</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Марка <span className="text-red-500">*</span></Label>
                  <Select value={formData.make} onValueChange={(value) => handleInputChange("make", value)}>
                    <SelectTrigger id="make">
                      <SelectValue placeholder="Выберите марку" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CAR_MAKES_MODELS).map(make => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model">Модель <span className="text-red-500">*</span></Label>
                  <Select value={formData.model} onValueChange={(value) => handleInputChange("model", value)} disabled={!formData.make}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder={formData.make ? "Выберите модель" : "Сначала выберите марку"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Make/Model Field - показываем только если выбрано "Другие марки" */}
              {formData.make === "Другие марки" && (
                <div>
                  <Label htmlFor="customMakeModel">Укажите марку и модель <span className="text-red-500">*</span></Label>
                  <Input
                    id="customMakeModel"
                    type="text"
                    placeholder="Например: Changan CS75, Hongqi H9, Новая Марка X1"
                    value={formData.customMakeModel}
                    onChange={(e) => handleInputChange("customMakeModel", e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Введите точную марку и модель автомобиля, если её нет в списке
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Год выпуска <span className="text-red-500">*</span></Label>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Год" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 55 }, (_, i) => 2025 - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mileage">Пробег (км) <span className="text-red-500">*</span></Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="150000"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bodyType">Тип кузова <span className="text-red-500">*</span></Label>
                  <Select value={formData.bodyType} onValueChange={(value) => handleInputChange("bodyType", value)}>
                    <SelectTrigger id="bodyType">
                      <SelectValue placeholder="Тип кузова" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Седан</SelectItem>
                      <SelectItem value="crossover">Кроссовер</SelectItem>
                      <SelectItem value="suv">Внедорожник</SelectItem>
                      <SelectItem value="hatchback">Хэтчбек</SelectItem>
                      <SelectItem value="wagon">Универсал</SelectItem>
                      <SelectItem value="minivan">Минивен</SelectItem>
                      <SelectItem value="coupe">Купе</SelectItem>
                      <SelectItem value="convertible">Кабриолет</SelectItem>
                      <SelectItem value="pickup">Пикап</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fuelType">Тип топлива <span className="text-red-500">*</span></Label>
                  <Select value={formData.fuelType} onValueChange={(value) => handleInputChange("fuelType", value)}>
                    <SelectTrigger id="fuelType">
                      <SelectValue placeholder="Топливо" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Бензин</SelectItem>
                      <SelectItem value="diesel">Дизель</SelectItem>
                      <SelectItem value="gas">Газ</SelectItem>
                      <SelectItem value="gas_gasoline">Газ+бензин</SelectItem>
                      <SelectItem value="hybrid">Гибрид</SelectItem>
                      <SelectItem value="electric">Электро</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transmission">КПП <span className="text-red-500">*</span></Label>
                  <Select value={formData.transmission} onValueChange={(value) => handleInputChange("transmission", value)}>
                    <SelectTrigger id="transmission">
                      <SelectValue placeholder="КПП" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Автомат</SelectItem>
                      <SelectItem value="manual">Механика</SelectItem>
                      <SelectItem value="cvt">Вариатор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="engineVolume">Объем двигателя (л) <span className="text-red-500">*</span></Label>
                  <Input
                    id="engineVolume"
                    type="number"
                    step="0.1"
                    placeholder="2.0"
                    value={formData.engineVolume}
                    onChange={(e) => handleInputChange("engineVolume", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="driveType">Привод <span className="text-red-500">*</span></Label>
                  <Select value={formData.driveType} onValueChange={(value) => handleInputChange("driveType", value)}>
                    <SelectTrigger id="driveType">
                      <SelectValue placeholder="Привод" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="front">Передний</SelectItem>
                      <SelectItem value="rear">Задний</SelectItem>
                      <SelectItem value="all">Полный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Цвет <span className="text-red-500">*</span></Label>
                  <Select value={formData.color} onValueChange={(value) => handleInputChange("color", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Цвет" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">Белый</SelectItem>
                      <SelectItem value="black">Черный</SelectItem>
                      <SelectItem value="silver">Серебристый</SelectItem>
                      <SelectItem value="gray">Серый</SelectItem>
                      <SelectItem value="red">Красный</SelectItem>
                      <SelectItem value="blue">Синий</SelectItem>
                      <SelectItem value="green">Зеленый</SelectItem>
                      <SelectItem value="yellow">Желтый</SelectItem>
                      <SelectItem value="brown">Коричневый</SelectItem>
                      <SelectItem value="gold">Золотистый</SelectItem>
                      <SelectItem value="other">Другой</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="condition">Состояние <span className="text-red-500">*</span></Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Состояние автомобиля" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Отличное</SelectItem>
                      <SelectItem value="very_good">Очень хорошее</SelectItem>
                      <SelectItem value="good">Хорошее</SelectItem>
                      <SelectItem value="satisfactory">Удовлетворительное</SelectItem>
                      <SelectItem value="requires_repair">Требует ремонта</SelectItem>
                      <SelectItem value="accident">После ДТП</SelectItem>
                      <SelectItem value="not_running">Не на ходу</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Electric car specific fields - показываются только для электромобилей */}
              {formData.fuelType === 'electric' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      ⚡ Характеристики электромобиля
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                      Дополнительные поля для электромобилей
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="batteryCapacity">Емкость батареи (кВт·ч) <span className="text-red-500">*</span></Label>
                    <Input
                      id="batteryCapacity"
                      type="number"
                      step="0.1"
                      min="10"
                      max="200"
                      placeholder="75.0"
                      value={formData.batteryCapacity}
                      onChange={(e) => handleInputChange("batteryCapacity", e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Емкость аккумулятора в киловатт-часах</p>
                  </div>

                  <div>
                    <Label htmlFor="electricRange">Запас хода (км) <span className="text-red-500">*</span></Label>
                    <Input
                      id="electricRange"
                      type="number"
                      min="50"
                      max="800"
                      placeholder="400"
                      value={formData.electricRange}
                      onChange={(e) => handleInputChange("electricRange", e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Дальность поездки на одной зарядке</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="vin">VIN-номер</Label>
                  <Input
                    id="vin"
                    type="text"
                    placeholder="Введите VIN-номер автомобиля"
                    value={formData.vin}
                    onChange={(e) => handleInputChange("vin", e.target.value.toUpperCase())}
                    maxLength={17}
                  />
                  <p className="text-xs text-gray-500 mt-1">17-значный идентификационный номер автомобиля</p>
                </div>
                
                <div>
                  <Label htmlFor="location">Город <span className="text-red-500">*</span></Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите город" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAJIKISTAN_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Растаможен <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={formData.customsCleared === "yes" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => handleInputChange("customsCleared", "yes")}
                    >
                      Да
                    </Button>
                    <Button
                      type="button"
                      variant={formData.customsCleared === "no" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => handleInputChange("customsCleared", "no")}
                    >
                      Нет
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Утилизация <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={formData.recycled === "yes" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => handleInputChange("recycled", "yes")}
                    >
                      Есть
                    </Button>
                    <Button
                      type="button"
                      variant={formData.recycled === "no" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => handleInputChange("recycled", "no")}
                    >
                      Нет
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Техосмотр <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={formData.technicalInspectionValid === "yes" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => handleInputChange("technicalInspectionValid", "yes")}
                    >
                      Есть
                    </Button>
                    <Button
                      type="button"
                      variant={formData.technicalInspectionValid === "no" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => handleInputChange("technicalInspectionValid", "no")}
                    >
                      Нет
                    </Button>
                  </div>
                </div>
              </div>

              {/* Поле даты техосмотра, показывается только если техосмотр есть */}
              {formData.technicalInspectionValid === "yes" && (
                <div>
                  <Label htmlFor="technicalInspectionDate">Действие техосмотра до <span className="text-red-500">*</span></Label>
                  <Input
                    id="technicalInspectionDate"
                    type="text"
                    value={formData.technicalInspectionDate}
                    onChange={(e) => handleDateInputChange("technicalInspectionDate", e.target.value)}
                    placeholder="ДД.ММ.ГГГГ"
                    maxLength={10}
                  />
                </div>
              )}

              <div>
                <Label>Тонировка <span className="text-red-500">*</span></Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={formData.tinted === "yes" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleInputChange("tinted", "yes")}
                  >
                    Есть
                  </Button>
                  <Button
                    type="button"
                    variant={formData.tinted === "no" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => handleInputChange("tinted", "no")}
                  >
                    Нет
                  </Button>
                </div>
              </div>

              {/* Поле даты тонировки, показывается только если тонировка есть */}
              {formData.tinted === "yes" && (
                <div>
                  <Label htmlFor="tintingDate">Дата тонировки <span className="text-red-500">*</span></Label>
                  <Input
                    id="tintingDate"
                    type="text"
                    value={formData.tintingDate}
                    onChange={(e) => handleDateInputChange("tintingDate", e.target.value)}
                    placeholder="ДД.ММ.ГГГГ"
                    maxLength={10}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Стартовая цена (Сомони) <span className="text-red-500">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="reservePrice">Резервная цена (Сомони)</Label>
                    <button 
                      type="button" 
                      onClick={() => setShowReservePriceInfo(!showReservePriceInfo)}
                      className="inline-flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </button>
                  </div>
                  {showReservePriceInfo && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Резервная цена</strong> - это минимальная цена, за которую вы готовы продать автомобиль. 
                        Она скрыта от покупателей и защищает вас от продажи по слишком низкой цене. 
                        Если ставки не достигнут резервной цены, вы не обязаны продавать автомобиль.
                      </p>
                    </div>
                  )}
                  <Input
                    id="reservePrice"
                    type="number"
                    placeholder="0"
                    value={formData.reservePrice}
                    onChange={(e) => handleInputChange("reservePrice", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Минимальная цена для продажи (не видна покупателям)</p>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Описание <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Опишите состояние автомобиля, особенности, историю обслуживания..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="auctionDuration">Продолжительность аукциона <span className="text-red-500">*</span></Label>
                <Select value={formData.auctionDuration} onValueChange={(value) => handleInputChange("auctionDuration", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите продолжительность" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 дней</SelectItem>
                    <SelectItem value="10">10 дней</SelectItem>
                    <SelectItem value="15">15 дней</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Длительность торгов с момента активации аукциона</p>
              </div>
            </CardContent>
          </Card>

          {/* Admin User Selection - только для админов */}
          {(user?.role === 'admin' || user?.fullName === 'ADMIN') && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <Label className="text-lg font-semibold">Создать объявление от имени пользователя</Label>
                  </div>
                  
                  {!showUserSelector ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {selectedUserId ? 
                          (() => {
                            const selectedUser = allUsers.find(u => (u.userId || u.id) === selectedUserId);
                            return selectedUser ? 
                              `Создается от имени: ${selectedUser.phoneNumber} - ${selectedUser.fullName}` :
                              "Пользователь не найден";
                          })() :
                          "По умолчанию создается от вашего имени"
                        }
                      </p>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setShowUserSelector(true)}
                        className="w-full"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {selectedUserId ? "Изменить пользователя" : "Выбрать пользователя"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="max-h-60 overflow-y-auto border rounded-md">
                        <div className="p-2">
                          {/* Опция создать от своего имени */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserId(null);
                              setShowUserSelector(false);
                            }}
                            className={`w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                              selectedUserId === null ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' : 'border-2 border-transparent'
                            }`}
                          >
                            <div className="font-medium">От моего имени</div>
                            <div className="text-sm text-muted-foreground">{user?.phoneNumber} - {user?.fullName}</div>
                          </button>
                        </div>
                        <div className="border-t">
                          {allUsers.map((userItem: any, index: number) => {
                            // Получаем уникальный ID пользователя
                            const userUniqueId = userItem.userId || userItem.id || `temp-${index}`;
                            
                            return (
                              <button
                                key={`user-${userUniqueId}`}
                                type="button"
                                onClick={() => {
                                  setSelectedUserId(userUniqueId);
                                  setShowUserSelector(false);
                                }}
                                className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                                  selectedUserId === userUniqueId ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500' : 'border-2 border-transparent'
                                }`}
                              >
                                <div className="font-medium">{userItem.phoneNumber}</div>
                                <div className="text-sm text-muted-foreground">{userItem.fullName}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setShowUserSelector(false)}
                        className="w-full"
                      >
                        Отмена
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Card>
            <CardContent className="p-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-lg py-3 disabled:opacity-50"
              >
                {isSubmitting ? "Публикация..." : "Разместить на аукционе"}
              </Button>
              <p className="text-sm text-neutral-500 text-center mt-3">
                После публикации объявление будет проверено модератором
              </p>
            </CardContent>
          </Card>
        </form>
      </main>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Успешно добавлено!
            </DialogTitle>
            <DialogDescription>
              Ваше объявление успешно создано и будет проверено модератором.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              После проверки модератором объявление будет выставлено в аукцион.
            </p>
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                Переход на главную страницу через {countdown} сек...
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
  );
}