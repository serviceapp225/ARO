import { useState } from "react";
import { Bell, BellRing, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CAR_MAKES, getModelsForMake } from "@shared/car-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createAlertSchema = z.object({
  make: z.string().min(1, "Выберите марку автомобиля"),
  model: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minYear: z.string().optional(),
  maxYear: z.string().optional(),
});

type CreateAlertForm = z.infer<typeof createAlertSchema>;

interface SearchAlertButtonProps {
  searchFilters?: {
    brand?: string;
    model?: string;
    yearFrom?: string;
    yearTo?: string;
    priceFrom?: string;
    priceTo?: string;
  };
}

export default function SearchAlertButton({ searchFilters = {} }: SearchAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMake, setSelectedMake] = useState("");
  const queryClient = useQueryClient();
  
  // Mock user ID - в реальном приложении будет из контекста авторизации
  const userId = 1;

  const form = useForm<CreateAlertForm>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: {
      make: searchFilters.brand || "",
      model: searchFilters.model || "",
      minPrice: searchFilters.priceFrom || "",
      maxPrice: searchFilters.priceTo || "",
      minYear: searchFilters.yearFrom || "",
      maxYear: searchFilters.yearTo || "",
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/car-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/car-alerts', userId] });
      setIsOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: CreateAlertForm) => {
    const alertData = {
      userId,
      make: data.make,
      model: data.model || null,
      minPrice: data.minPrice ? data.minPrice : null,
      maxPrice: data.maxPrice ? data.maxPrice : null,
      minYear: data.minYear ? parseInt(data.minYear) : null,
      maxYear: data.maxYear ? parseInt(data.maxYear) : null,
      isActive: true,
    };
    
    createAlertMutation.mutate(alertData);
  };

  const currentYearOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Bell className="w-4 h-4 mr-2" />
          Уведомить когда появится
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать уведомление о поиске</DialogTitle>
        </DialogHeader>
        
        <div className="text-sm text-gray-600 mb-4">
          Мы отправим уведомление, когда появится автомобиль с указанными параметрами
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Марка автомобиля</FormLabel>
                  <Select onValueChange={(value) => { 
                    field.onChange(value); 
                    setSelectedMake(value);
                    form.setValue("model", "");
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите марку" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CAR_MAKES.map((make) => (
                        <SelectItem key={make} value={make.toLowerCase()}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(selectedMake || form.watch("make")) && (
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Модель (необязательно)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Все модели" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Все модели</SelectItem>
                        {getModelsForMake(
                          CAR_MAKES.find(make => make.toLowerCase() === (selectedMake || form.watch("make"))) || ''
                        ).map((model) => (
                          <SelectItem key={model} value={model.toLowerCase()}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Мин. цена ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Макс. цена ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="100000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Мин. год</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Любой" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Любой</SelectItem>
                        {currentYearOptions.reverse().map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Макс. год</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Любой" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Любой</SelectItem>
                        {currentYearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createAlertMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать уведомление
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Отмена
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}