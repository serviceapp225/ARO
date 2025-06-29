import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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