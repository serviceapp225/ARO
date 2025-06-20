import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";

interface AdvertisementCarouselItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  isActive: boolean;
  order: number;
}

const carouselItemSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  imageUrl: z.string().url("Введите корректный URL изображения"),
  linkUrl: z.string().optional(),
  buttonText: z.string().min(1, "Текст кнопки обязателен"),
  isActive: z.boolean(),
  order: z.number().min(0),
});

type CarouselItemForm = z.infer<typeof carouselItemSchema>;

export function AdvertisementCarouselManagement() {
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<AdvertisementCarouselItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: carouselItems = [], isLoading } = useQuery<AdvertisementCarouselItem[]>({
    queryKey: ['/api/admin/advertisement-carousel'],
    queryFn: async () => {
      const response = await fetch('/api/admin/advertisement-carousel');
      if (!response.ok) throw new Error('Failed to fetch carousel items');
      return response.json();
    }
  });

  const form = useForm<CarouselItemForm>({
    resolver: zodResolver(carouselItemSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      buttonText: "Подробнее",
      isActive: true,
      order: 0,
    },
    mode: "onChange"
  });

  const createMutation = useMutation({
    mutationFn: (data: CarouselItemForm) => 
      apiRequest('POST', '/api/admin/advertisement-carousel', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      toast({ title: "Успешно", description: "Элемент карусели создан" });
      setIsCreating(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Ошибка", 
        description: error.message || "Не удалось создать элемент",
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CarouselItemForm }) => 
      apiRequest('PUT', `/api/admin/advertisement-carousel/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      toast({ title: "Успешно", description: "Элемент карусели обновлен" });
      setEditingItem(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Ошибка", 
        description: error.message || "Не удалось обновить элемент",
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/admin/advertisement-carousel/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advertisement-carousel'] });
      toast({ title: "Успешно", description: "Элемент карусели удален" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Ошибка", 
        description: error.message || "Не удалось удалить элемент",
        variant: "destructive" 
      });
    }
  });

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    form.reset({
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      buttonText: "Подробнее",
      isActive: true,
      order: carouselItems.length,
    });
  };

  const handleEdit = (item: AdvertisementCarouselItem) => {
    setEditingItem(item);
    setIsCreating(false);
    form.reset({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl || "",
      buttonText: item.buttonText,
      isActive: item.isActive,
      order: item.order,
    });
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreating(false);
    form.reset();
  };

  const handleSubmit = (data: CarouselItemForm) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Управление каруселью рекламы</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleCreate} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Предпросмотр на сайте
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Форма создания/редактирования */}
          {(isCreating || editingItem) && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-4">
                {editingItem ? 'Редактировать элемент' : 'Создать новый элемент'}
              </h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Название*</FormLabel>
                          <FormControl>
                            <Input placeholder="Название элемента" {...field} />
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
                          <FormLabel>Текст кнопки*</FormLabel>
                          <FormControl>
                            <Input placeholder="Подробнее" {...field} />
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
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Описание элемента" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL изображения*</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="linkUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ссылка</FormLabel>
                          <FormControl>
                            <Input placeholder="/страница" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Порядок</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Активен</FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingItem ? 'Обновить' : 'Создать'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Отменить
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Список элементов карусели */}
          <div className="space-y-4">
            <h3 className="font-semibold">Элементы карусели ({carouselItems.length})</h3>
            
            {carouselItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Нет элементов карусели. Создайте первый элемент.
              </div>
            ) : (
              <div className="grid gap-4">
                {carouselItems.map((item) => (
                  <div key={item.id} className="flex items-center p-4 border rounded-lg">
                    <div 
                      className="w-20 h-12 bg-cover bg-center rounded mr-4"
                      style={{ backgroundImage: `url('${item.imageUrl}')` }}
                    ></div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isActive ? 'Активен' : 'Неактивен'}
                        </span>
                        <span className="text-xs text-gray-500">Порядок: {item.order}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}