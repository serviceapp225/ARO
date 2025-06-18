import { useState } from "react";
import { Upload, X, Plus, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CAR_MAKES_MODELS, getModelsForMake } from "../../../shared/car-data";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

export default function SellCar() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    reservePrice: "",
    description: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
    engineVolume: "",
    driveType: "",
    color: "",
    condition: "",
    vin: "",
    customsCleared: "",
    recycled: "",
    technicalInspectionValid: "",
    technicalInspectionDate: ""
  });
  
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const remainingSlots = 20 - uploadedImages.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      const newImages: string[] = [];
      
      for (const file of filesToProcess) {
        // Compress and convert file to base64 data URL
        const compressedDataUrl = await compressImage(file, 0.8, 1200); // 80% quality, max 1200px width
        newImages.push(compressedDataUrl);
      }
      
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const compressImage = (file: File, quality: number, maxWidth: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields (все кроме VIN и резервной цены)
    const requiredFields = [
      { field: formData.make, name: "Марка" },
      { field: formData.model, name: "Модель" },
      { field: formData.year, name: "Год выпуска" },
      { field: formData.mileage, name: "Пробег" },
      { field: formData.price, name: "Стартовая цена" },
      { field: formData.description, name: "Описание" },
      { field: formData.bodyType, name: "Тип кузова" },
      { field: formData.fuelType, name: "Тип топлива" },
      { field: formData.transmission, name: "Коробка передач" },
      { field: formData.engineVolume, name: "Объем двигателя" },
      { field: formData.driveType, name: "Привод" },
      { field: formData.color, name: "Цвет" },
      { field: formData.condition, name: "Состояние" },
      { field: formData.customsCleared, name: "Растаможка" },
      { field: formData.recycled, name: "Утилизационный сбор" },
      { field: formData.technicalInspectionValid, name: "Техосмотр" },
      { field: formData.technicalInspectionDate, name: "Дата техосмотра" }
    ];

    const emptyFields = requiredFields.filter(({ field }) => !field || field.trim() === "");
    
    if (emptyFields.length > 0) {
      toast({
        title: "Ошибка",
        description: `Заполните обязательные поля: ${emptyFields.map(f => f.name).join(", ")}`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    if (uploadedImages.length < 5) {
      toast({
        title: "Ошибка", 
        description: `Необходимо загрузить минимум 5 фотографий автомобиля. Загружено: ${uploadedImages.length}`,
        variant: "destructive",
        duration: 5000,
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
      // Create listing data matching database schema
      const listingData = {
        sellerId: 2, // Demo seller ID
        lotNumber: `${Math.floor(100000 + Math.random() * 900000)}`,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage) || 0,
        description: formData.description,
        startingPrice: formData.price,
        photos: uploadedImages, // Array of photo URLs
        auctionDuration: 168, // 7 days in hours
        customsCleared: formData.customsCleared === 'yes',
        recycled: formData.recycled === 'yes',
        technicalInspectionValid: formData.technicalInspectionValid === 'yes',
        technicalInspectionDate: formData.technicalInspectionDate || null,
        engine: formData.engineVolume ? `${formData.engineVolume}L` : null,
        transmission: formData.transmission || null,
        fuelType: formData.fuelType || null,
        bodyType: formData.bodyType || null,
        driveType: formData.driveType || null,
        color: formData.color || null,
        vin: formData.vin || null,
        location: "Душанбе", // Default location
      };

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to create listing');
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
          bodyType: "",
          fuelType: "",
          transmission: "",
          engineVolume: "",
          driveType: "",
          color: "",
          condition: "",
          vin: "",
          customsCleared: "",
          recycled: "",
          technicalInspectionValid: "",
          technicalInspectionDate: ""
        });
        setUploadedImages([]);
      }, 100);

      // Force immediate cache refresh
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.refetchQueries({ queryKey: ['/api/listings'] });

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
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Продать автомобиль</h1>
          <p className="text-neutral-600 mt-1">Создайте объявление для аукциона</p>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Год выпуска <span className="text-red-500">*</span></Label>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                    <SelectTrigger>
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
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bodyType">Тип кузова <span className="text-red-500">*</span></Label>
                  <Select value={formData.bodyType} onValueChange={(value) => handleInputChange("bodyType", value)}>
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    type="date"
                    value={formData.technicalInspectionDate}
                    onChange={(e) => handleInputChange("technicalInspectionDate", e.target.value)}
                    placeholder="ДД.ММ.ГГГГ"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Стартовая цена ($) <span className="text-red-500">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="reservePrice">Резервная цена ($)</Label>
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
                  required
                />
              </div>
            </CardContent>
          </Card>

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