import { useState } from "react";
import { Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CAR_MAKES_MODELS, getModelsForMake } from "../../../shared/car-data";

export default function SellCar() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
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
    customsCleared: ""
  });
  
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 20 - uploadedImages.length).map(file => 
        URL.createObjectURL(file)
      );
      setUploadedImages(prev => [...prev, ...newImages]);
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log("Submitting car listing:", formData, uploadedImages);
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
                Загрузите фото
              </CardTitle>
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
                  <Label htmlFor="make">Марка</Label>
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
                  <Label htmlFor="model">Модель</Label>
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
                  <Label htmlFor="year">Год выпуска</Label>
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
                  <Label htmlFor="mileage">Пробег (км)</Label>
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
                  <Label htmlFor="bodyType">Тип кузова</Label>
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
                  <Label htmlFor="fuelType">Тип топлива</Label>
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
                  <Label htmlFor="transmission">КПП</Label>
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
                  <Label htmlFor="engineVolume">Объем двигателя (л)</Label>
                  <Input
                    id="engineVolume"
                    type="number"
                    step="0.1"
                    placeholder="2.0"
                    value={formData.engineVolume}
                    onChange={(e) => handleInputChange("engineVolume", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Растаможен</Label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Стартовая цена ($)</Label>
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
                <Label htmlFor="description">Описание</Label>
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
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-lg py-3">
                Разместить на аукционе
              </Button>
              <p className="text-sm text-neutral-500 text-center mt-3">
                После публикации объявление будет проверено модератором
              </p>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}