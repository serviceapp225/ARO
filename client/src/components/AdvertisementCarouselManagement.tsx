import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, ExternalLink, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdvertisementCarouselItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  rotationImage1?: string;
  rotationImage2?: string;
  rotationImage3?: string;
  rotationImage4?: string;
  rotationInterval?: number;
  linkUrl: string;
  buttonText: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const carouselSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  imageUrl: z.string().url("Некорректный URL изображения"),
  rotationImage1: z.string().url("Некорректный URL").optional().or(z.literal("")),
  rotationImage2: z.string().url("Некорректный URL").optional().or(z.literal("")),
  rotationImage3: z.string().url("Некорректный URL").optional().or(z.literal("")),
  rotationImage4: z.string().url("Некорректный URL").optional().or(z.literal("")),
  rotationInterval: z.number().min(1, "Интервал должен быть больше 0").max(10, "Максимум 10 секунд").optional(),
  linkUrl: z.string().url("Некорректный URL ссылки").optional().or(z.literal("")),
  buttonText: z.string().min(1, "Текст кнопки обязателен"),
  isActive: z.boolean(),
  order: z.number().min(0, "Порядок должен быть неотрицательным"),
});

type CarouselFormData = z.infer<typeof carouselSchema>;

export function AdvertisementCarouselManagement() {
  const [editingItem, setEditingItem] = useState<AdvertisementCarouselItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: carouselItems = [], isLoading } = useQuery<AdvertisementCarouselItem[]>({
    queryKey: ['/api/admin/advertisement-carousel'],
    queryFn: async () => {
      const response = await fetch('/api/admin/advertisement-carousel');
      if (!response.ok) throw new Error('Failed to fetch carousel items');
      return response.json();
    }
  });

  const form = useForm<CarouselFormData>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      rotationImage1: "",
      rotationImage2: "",
      rotationImage3: "",
      rotationImage4: "",
      rotationInterval: 3,
      linkUrl: "",
      buttonText: "Узнать больше",
      isActive: true,
      order: 0,
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: CarouselFormData) => apiRequest('POST', '/api/admin/advertisement-carousel', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisement-carousel'] });
      toast({ title: "Элемент создан", description: "Новый элемент карусели успешно добавлен" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message || "Не удалось создать элемент", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CarouselFormData }) => 
      apiRequest('PUT', `/api/admin/advertisement-carousel/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisement-carousel'] });
      toast({ title: "Элемент обновлен", description: "Изменения сохранены" });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message || "Не удалось обновить элемент", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/advertisement-carousel/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisement-carousel'] });
      toast({ title: "Элемент удален", description: "Элемент карусели успешно удален" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message || "Не удалось удалить элемент", variant: "destructive" });
    }
  });

  const handleSubmit = (data: CarouselFormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: AdvertisementCarouselItem) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      rotationImage1: item.rotationImage1 || "",
      rotationImage2: item.rotationImage2 || "",
      rotationImage3: item.rotationImage3 || "",
      rotationImage4: item.rotationImage4 || "",
      rotationInterval: item.rotationInterval || 3,
      linkUrl: item.linkUrl || "",
      buttonText: item.buttonText,
      isActive: item.isActive,
      order: item.order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот элемент карусели?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    form.reset();
  };

  if (isLoading) {
    return <div>Загрузка элементов карусели...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Управление рекламной каруселью</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Создавайте и редактируйте элементы рекламной карусели с поддержкой ротации изображений
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить элемент
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Редактировать элемент карусели' : 'Создать элемент карусели'}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Основная информация */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Заголовок *</FormLabel>
                          <FormControl>
                            <Input placeholder="Заголовок элемента" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="buttonText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Текст кнопки *</FormLabel>
                          <FormControl>
                            <Input placeholder="Узнать больше" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Описание элемента карусели" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ссылка (необязательно)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Основное изображение */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Основное изображение
                    </h4>
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL изображения *</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Ротационные изображения */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Дополнительные изображения для ротации (необязательно)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rotationImage1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Изображение 2</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image2.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rotationImage2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Изображение 3</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image3.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rotationImage3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Изображение 4</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image4.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rotationImage4"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Изображение 5</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image5.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="rotationInterval"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Интервал ротации (секунды)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10" 
                              placeholder="3" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground mt-1">
                            Скорость смены изображений (1-10 секунд). По умолчанию 3 секунды.
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Настройки */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Порядок сортировки</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Активность</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Показывать элемент в карусели
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingItem ? 'Сохранить изменения' : 'Создать элемент'}
                    </Button>
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Отмена
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {carouselItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Нет элементов карусели</p>
            <p className="text-sm mt-1">Добавьте первый элемент, нажав кнопку выше</p>
          </div>
        ) : (
          <div className="space-y-4">
            {carouselItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{item.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Порядок: {item.order}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Основное изображение
                      </span>
                      {item.rotationImage1 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Ротация 1
                        </span>
                      )}
                      {item.rotationImage2 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Ротация 2
                        </span>
                      )}
                      {item.rotationImage3 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Ротация 3
                        </span>
                      )}
                      {item.rotationImage4 && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Ротация 4
                        </span>
                      )}
                      {item.rotationInterval && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Интервал: {item.rotationInterval}с
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>Кнопка: {item.buttonText}</span>
                      {item.linkUrl && (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate max-w-48">{item.linkUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}