import { useState } from "react";
import { Bell, BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CAR_MAKES, getModelsForMake } from "@shared/car-data";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const createAlertSchema = z.object({
  make: z.string().min(1, "Выберите марку автомобиля"),
  model: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minYear: z.string().optional(),
  maxYear: z.string().optional(),
});

type CreateAlertForm = z.infer<typeof createAlertSchema>;

export default function FloatingNotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMake, setSelectedMake] = useState("");
  const queryClient = useQueryClient();
  
  // Mock user ID - в реальном приложении будет из контекста авторизации
  const userId = 1;

  const form = useForm<CreateAlertForm>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: {
      make: "",
      model: "",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxYear: "",
    },
  });

  const { data: existingAlerts = [] } = useQuery({
    queryKey: ['/api/car-alerts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/car-alerts/${userId}`);
      if (!response.ok) return [];
      return response.json();
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
      form.reset();
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await fetch(`/api/car-alerts/${alertId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete alert');
      return response.json();
    },
    onSuccess: async () => {
      // Полностью очищаем кэш и принудительно перезагружаем данные
      queryClient.removeQueries({ queryKey: ['/api/car-alerts', userId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/car-alerts', userId] });
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

  const alertsArray = Array.isArray(existingAlerts) ? existingAlerts : [];
  const hasAlerts = alertsArray.length > 0;
  const currentYearOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  return (
    <>
      {/* Плавающая кнопка */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className={`fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-lg ${
              hasAlerts 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {hasAlerts ? (
              <div className="relative">
                <BellRing className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {alertsArray.length}
                </span>
              </div>
            ) : (
              <Bell className="h-6 w-6" />
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Уведомления о новых автомобилях</DialogTitle>
          </DialogHeader>
          
          {/* Существующие алерты */}
          {alertsArray.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="font-medium text-sm text-gray-900">Активные уведомления:</h4>
              {alertsArray.map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">{alert.make}</span>
                    {alert.model && <span className="text-gray-600"> {alert.model}</span>}
                    {(alert.minPrice || alert.maxPrice) && (
                      <span className="text-gray-500 text-xs block">
                        {alert.minPrice && `от $${alert.minPrice}`}
                        {alert.minPrice && alert.maxPrice && " - "}
                        {alert.maxPrice && `до $${alert.maxPrice}`}
                      </span>
                    )}
                    {(alert.minYear || alert.maxYear) && (
                      <span className="text-gray-500 text-xs block">
                        {alert.minYear && `${alert.minYear} г.`}
                        {alert.minYear && alert.maxYear && " - "}
                        {alert.maxYear && `${alert.maxYear} г.`}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAlertMutation.mutate(alert.id)}
                    disabled={deleteAlertMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

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
                      <FormLabel>Мин. цена (Сомони)</FormLabel>
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
                      <FormLabel>Макс. цена (Сомони)</FormLabel>
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
                  <Bell className="h-4 w-4 mr-2" />
                  Добавить уведомление
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}