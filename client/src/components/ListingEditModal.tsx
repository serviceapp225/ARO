import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';
import type { CarListing } from '@shared/schema';

interface ListingEditModalProps {
  listingId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ListingEditModal({ listingId, isOpen, onClose }: ListingEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  
  // Additional car specifications
  const [engine, setEngine] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [driveType, setDriveType] = useState('');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState('');
  const [vin, setVin] = useState('');
  
  // Legal documents and status
  const [customsCleared, setCustomsCleared] = useState(false);
  const [recycled, setRecycled] = useState(false);
  const [technicalInspectionValid, setTechnicalInspectionValid] = useState(false);
  const [technicalInspectionDate, setTechnicalInspectionDate] = useState('');
  const [tinted, setTinted] = useState(false);
  const [tintingDate, setTintingDate] = useState('');
  
  // Electric car specific fields
  const [batteryCapacity, setBatteryCapacity] = useState('');
  const [electricRange, setElectricRange] = useState('');

  // Fetch listing data
  const { data: listing, isLoading } = useQuery<CarListing>({
    queryKey: [`/api/listings/${listingId}`],
    enabled: !!listingId && isOpen,
  });

  // Update form when listing data loads
  useEffect(() => {
    if (listing) {
      setMake(listing.make || '');
      setModel(listing.model || '');
      setYear(listing.year?.toString() || '');
      setMileage(listing.mileage?.toString() || '');
      setDescription(listing.description || '');
      setStartingPrice(listing.startingPrice || '');
      setStatus(listing.status || '');
      setLocation(listing.location || '');
      
      // Additional car specifications
      setEngine(listing.engine || '');
      setTransmission(listing.transmission || 'not_specified');
      setFuelType(listing.fuelType || 'not_specified');
      setBodyType(listing.bodyType || 'not_specified');
      setDriveType(listing.driveType || 'not_specified');
      setColor(listing.color || '');
      setCondition(listing.condition || 'not_specified');
      setVin(listing.vin || '');
      
      // Legal documents and status
      setCustomsCleared(listing.customsCleared || false);
      setRecycled(listing.recycled || false);
      setTechnicalInspectionValid(listing.technicalInspectionValid || false);
      setTechnicalInspectionDate(listing.technicalInspectionDate || '');
      setTinted(listing.tinted || false);
      setTintingDate(listing.tintingDate || '');
      
      // Electric car specific fields
      setBatteryCapacity(listing.batteryCapacity?.toString() || '');
      setElectricRange(listing.electricRange?.toString() || '');
    }
  }, [listing]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMake('');
      setModel('');
      setYear('');
      setMileage('');
      setDescription('');
      setStartingPrice('');
      setStatus('');
      setLocation('');
      
      // Reset additional specifications
      setEngine('');
      setTransmission('not_specified');
      setFuelType('not_specified');
      setBodyType('not_specified');
      setDriveType('not_specified');
      setColor('');
      setCondition('not_specified');
      setVin('');
      
      // Reset legal documents
      setCustomsCleared(false);
      setRecycled(false);
      setTechnicalInspectionValid(false);
      setTechnicalInspectionDate('');
      setTinted(false);
      setTintingDate('');
      
      // Reset electric car fields
      setBatteryCapacity('');
      setElectricRange('');
    }
  }, [isOpen]);

  // Update listing mutation
  const updateListingMutation = useMutation({
    mutationFn: async (data: {
      make: string;
      model: string;
      year: number;
      mileage: number;
      description: string;
      startingPrice: string;
      status: string;
      location: string;
      // Additional specifications
      engine?: string;
      transmission?: string;
      fuelType?: string;
      bodyType?: string;
      driveType?: string;
      color?: string;
      condition?: string;
      vin?: string;
      // Legal documents
      customsCleared?: boolean;
      recycled?: boolean;
      technicalInspectionValid?: boolean;
      technicalInspectionDate?: string;
      tinted?: boolean;
      tintingDate?: string;
      // Electric car fields
      batteryCapacity?: number;
      electricRange?: number;
    }) => {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update listing');
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: 'Объявление обновлено',
        duration: 1000
      });
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${listingId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      onClose();
    },
    onError: () => {
      toast({ 
        title: 'Ошибка при обновлении объявления', 
        variant: 'destructive',
        duration: 1000
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!make.trim() || !model.trim() || !year || !startingPrice.trim()) {
      toast({ 
        title: 'Заполните обязательные поля', 
        variant: 'destructive',
        duration: 1000
      });
      return;
    }

    updateListingMutation.mutate({
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year),
      mileage: parseInt(mileage) || 0,
      description: description.trim(),
      startingPrice: startingPrice.trim(),
      status: status,
      location: location.trim(),
      // Additional specifications
      engine: engine.trim() || undefined,
      transmission: transmission === 'not_specified' ? undefined : transmission,
      fuelType: fuelType === 'not_specified' ? undefined : fuelType,
      bodyType: bodyType === 'not_specified' ? undefined : bodyType,
      driveType: driveType === 'not_specified' ? undefined : driveType,
      color: color.trim() || undefined,
      condition: condition === 'not_specified' ? undefined : condition,
      vin: vin.trim() || undefined,
      // Legal documents
      customsCleared,
      recycled,
      technicalInspectionValid,
      technicalInspectionDate: technicalInspectionDate.trim() || undefined,
      tinted,
      tintingDate: tintingDate.trim() || undefined,
      // Electric car fields
      batteryCapacity: fuelType === 'electric' && batteryCapacity ? parseFloat(batteryCapacity) : undefined,
      electricRange: fuelType === 'electric' && electricRange ? parseInt(electricRange) : undefined,
    });
  };

  if (!isOpen || !listingId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать объявление</DialogTitle>
          <DialogDescription>
            Изменение параметров объявления автомобиля
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Загрузка данных объявления...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Марка *</Label>
                <Input
                  id="make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Toyota, BMW, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Модель *</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Camry, X5, etc."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="year">Год *</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2020"
                  min="1990"
                  max="2025"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mileage">Пробег (км)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="50000"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="startingPrice">Начальная цена *</Label>
                <Input
                  id="startingPrice"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="10000"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Статус</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">На модерации</SelectItem>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="ended">Завершен</SelectItem>
                  <SelectItem value="rejected">Отклонен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Местоположение</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Душанбе, Худжанд, etc."
              />
            </div>

            {/* Technical Specifications */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Технические характеристики</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="engine">Двигатель</Label>
                  <Input
                    id="engine"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    placeholder="2.0 TSI, V6 3.5L, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="transmission">Коробка передач</Label>
                  <Select value={transmission} onValueChange={setTransmission}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Не указано</SelectItem>
                      <SelectItem value="manual">Механическая</SelectItem>
                      <SelectItem value="automatic">Автоматическая</SelectItem>
                      <SelectItem value="cvt">Вариатор</SelectItem>
                      <SelectItem value="robotic">Робот</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fuelType">Тип топлива</Label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Не указано</SelectItem>
                      <SelectItem value="gasoline">Бензин</SelectItem>
                      <SelectItem value="diesel">Дизель</SelectItem>
                      <SelectItem value="hybrid">Гибрид</SelectItem>
                      <SelectItem value="electric">Электро</SelectItem>
                      <SelectItem value="gas">Газ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bodyType">Тип кузова</Label>
                  <Select value={bodyType} onValueChange={setBodyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Не указано</SelectItem>
                      <SelectItem value="sedan">Седан</SelectItem>
                      <SelectItem value="hatchback">Хэтчбек</SelectItem>
                      <SelectItem value="suv">Внедорожник</SelectItem>
                      <SelectItem value="crossover">Кроссовер</SelectItem>
                      <SelectItem value="wagon">Универсал</SelectItem>
                      <SelectItem value="coupe">Купе</SelectItem>
                      <SelectItem value="convertible">Кабриолет</SelectItem>
                      <SelectItem value="pickup">Пикап</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="driveType">Привод</Label>
                  <Select value={driveType} onValueChange={setDriveType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Не указано</SelectItem>
                      <SelectItem value="front">Передний</SelectItem>
                      <SelectItem value="rear">Задний</SelectItem>
                      <SelectItem value="awd">Полный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Цвет</Label>
                  <Input
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Белый, Черный, Серебристый, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="condition">Состояние</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите состояние" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_specified">Не указано</SelectItem>
                      <SelectItem value="excellent">Отличное</SelectItem>
                      <SelectItem value="very_good">Очень хорошее</SelectItem>
                      <SelectItem value="good">Хорошее</SelectItem>
                      <SelectItem value="fair">Удовлетворительное</SelectItem>
                      <SelectItem value="needs_repair">Требует ремонта</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vin">VIN номер</Label>
                  <Input
                    id="vin"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    placeholder="17-значный VIN код"
                    maxLength={17}
                  />
                </div>
              </div>
            </div>

            {/* Legal Documents */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Документы и статус</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customsCleared">Растаможен</Label>
                  <Switch
                    id="customsCleared"
                    checked={customsCleared}
                    onCheckedChange={setCustomsCleared}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="recycled">Утилизационный сбор</Label>
                  <Switch
                    id="recycled"
                    checked={recycled}
                    onCheckedChange={setRecycled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="technicalInspectionValid">Техосмотр действителен</Label>
                  <Switch
                    id="technicalInspectionValid"
                    checked={technicalInspectionValid}
                    onCheckedChange={setTechnicalInspectionValid}
                  />
                </div>
                {technicalInspectionValid && (
                  <div>
                    <Label htmlFor="technicalInspectionDate">Дата техосмотра</Label>
                    <Input
                      id="technicalInspectionDate"
                      type="date"
                      value={technicalInspectionDate}
                      onChange={(e) => setTechnicalInspectionDate(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="tinted">Тонировка</Label>
                  <Switch
                    id="tinted"
                    checked={tinted}
                    onCheckedChange={setTinted}
                  />
                </div>
                {tinted && (
                  <div>
                    <Label htmlFor="tintingDate">Дата тонировки</Label>
                    <Input
                      id="tintingDate"
                      type="date"
                      value={tintingDate}
                      onChange={(e) => setTintingDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Electric car specific fields */}
            {fuelType === 'electric' && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">⚡ Характеристики электромобиля</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batteryCapacity">Емкость батареи (кВт·ч)</Label>
                    <Input
                      id="batteryCapacity"
                      type="number"
                      step="0.1"
                      min="10"
                      max="200"
                      value={batteryCapacity}
                      onChange={(e) => setBatteryCapacity(e.target.value)}
                      placeholder="75.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="electricRange">Запас хода (км)</Label>
                    <Input
                      id="electricRange"
                      type="number"
                      min="50"
                      max="800"
                      value={electricRange}
                      onChange={(e) => setElectricRange(e.target.value)}
                      placeholder="400"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробное описание автомобиля..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-1" />
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={updateListingMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-1" />
                {updateListingMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}