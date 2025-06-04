import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CAR_MAKES, getModelsForMake } from '@shared/car-data';

interface AddCarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const auctionDurations = [
  { value: '24', label: '24 Hours' },
  { value: '72', label: '3 Days' },
  { value: '168', label: '7 Days' },
];

export function AddCarModal({ open, onOpenChange }: AddCarModalProps) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    vin: '',
    description: '',
    startingPrice: '',
    auctionDuration: '72',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Reset model when make changes
      if (field === 'make') {
        newData.model = '';
      }
      return newData;
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      toast({
        title: "Too many photos",
        description: "You can upload a maximum of 5 photos.",
        variant: "destructive",
      });
      return;
    }
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (photos.length === 0) {
      toast({
        title: "Photos required",
        description: "Please upload at least one photo of your vehicle.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Listing Submitted",
      description: "Your car listing has been submitted for review. You'll be notified once it's approved.",
    });
    
    // Reset form
    setFormData({
      make: '',
      model: '',
      year: '',
      mileage: '',
      vin: '',
      description: '',
      startingPrice: '',
      auctionDuration: '72',
    });
    setPhotos([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">List Your Car</DialogTitle>
          <p className="text-center text-neutral-600">
            Provide details about your vehicle
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div>
            <Label className="text-sm font-medium">Vehicle Photos (up to 5)</Label>
            <div className="mt-2">
              <label className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer block">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">Drop photos here or click to upload</p>
                <p className="text-sm text-neutral-500 mt-2">PNG, JPG up to 10MB each</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Select value={formData.make} onValueChange={(value) => handleInputChange('make', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Make" />
                </SelectTrigger>
                <SelectContent>
                  {CAR_MAKES.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Select 
                value={formData.model} 
                onValueChange={(value) => handleInputChange('model', value)}
                disabled={!formData.make}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.make ? "Select Model" : "Select Make First"} />
                </SelectTrigger>
                <SelectContent>
                  {formData.make && getModelsForMake(formData.make).map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="2020"
                min="1970"
                max="2025"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                type="number"
                placeholder="15000"
                value={formData.mileage}
                onChange={(e) => handleInputChange('mileage', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="vin">VIN (Optional)</Label>
            <Input
              id="vin"
              placeholder="Vehicle Identification Number"
              value={formData.vin}
              onChange={(e) => handleInputChange('vin', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe your vehicle's condition, features, and history..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>

          {/* Auction Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startingPrice">Starting Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                  $
                </span>
                <Input
                  id="startingPrice"
                  type="number"
                  placeholder="25000"
                  className="pl-8"
                  value={formData.startingPrice}
                  onChange={(e) => handleInputChange('startingPrice', e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="auctionDuration">Auction Duration</Label>
              <Select value={formData.auctionDuration} onValueChange={(value) => handleInputChange('auctionDuration', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {auctionDurations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Submit for Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
