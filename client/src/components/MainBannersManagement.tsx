import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Car, Save, Eye, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const mainBannerSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  imageUrl: z.string().url("Некорректный URL изображения"),
  linkUrl: z.string().optional(),
  isActive: z.boolean(),
  order: z.number().min(0, "Порядок должен быть неотрицательным"),
});

type MainBannerFormData = z.infer<typeof mainBannerSchema>;

interface BannerPreviewProps {
  banner: Partial<MainBannerFormData>;
  index: number;
}

function BannerPreview({ banner, index }: BannerPreviewProps) {
  const getBannerStyle = (idx: number) => {
    switch (idx) {
      case 0: // Продай свое авто - темный стиль
        return "bg-black text-white";
      case 1: // Специальное предложение - синий градиент
        return "bg-gradient-to-r from-blue-500 to-blue-700 text-white";
      case 2: // Безопасные сделки - светло-зеленый
        return "bg-green-50 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  return (
    <div className={`relative rounded-lg overflow-hidden h-32 ${getBannerStyle(index)}`}>
      {banner.imageUrl && (
        <img 
          src={banner.imageUrl} 
          alt="Предпросмотр"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-between p-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{banner.title || "Название банера"}</h3>
          {banner.description && (
            <p className="text-sm opacity-90 mt-1">{banner.description}</p>
          )}
        </div>
        <div className="bg-white text-gray-900 px-4 py-2 rounded text-sm font-medium">
          Подробнее
        </div>
      </div>
    </div>
  );
}

export function MainBannersManagement() {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Загружаем основные банеры (position = "main")
  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['/api/banners', 'main'],
    queryFn: async () => {
      const response = await fetch('/api/banners?position=main');
      if (!response.ok) throw new Error('Failed to fetch banners');
      return response.json();
    }
  });

  // Сортируем банеры по порядку и берем первые 3
  const mainBanners = banners
    .filter(b => b.position === 'main')
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  // Шаблоны для основных банеров
  const defaultBanners = [
    {
      title: "Продай свое авто",
      description: "Получи максимальную цену за свой автомобиль на нашем аукционе",
      imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=300&fit=crop",
      linkUrl: "/sell-car",
      order: 1
    },
    {
      title: "Специальное предложение",
      description: "Скидка до 15% на комиссию при продаже автомобиля до конца месяца",
      imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=300&fit=crop",
      linkUrl: "/special-offer",
      order: 2
    },
    {
      title: "Безопасные сделки",
      description: "Гарантия безопасности всех транзакций на платформе",
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=300&fit=crop",
      linkUrl: "/safety",
      order: 3
    }
  ];

  const form = useForm<MainBannerFormData>({
    resolver: zodResolver(mainBannerSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      isActive: true,
      order: 1,
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: MainBannerFormData) => 
      apiRequest('POST', '/api/admin/banners', { ...data, position: "main" }),
    onSuccess: () => {
      // Обновляем все кеши связанные с банерами
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banners', 'main'] });
      toast({ title: "Банер создан", description: "Новый банер успешно добавлен" });
      setEditingIndex(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message || "Не удалось создать банер", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MainBannerFormData }) => 
      apiRequest('PUT', `/api/admin/banners/${id}`, { ...data, position: "main" }),
    onSuccess: () => {
      // Обновляем все кеши связанные с банерами
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banners', 'main'] });
      toast({ title: "Банер обновлен", description: "Изменения сохранены" });
      setEditingIndex(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message || "Не удалось обновить банер", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/banners/${id}`),
    onSuccess: () => {
      // Обновляем все кеши связанные с банерами
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banners', 'main'] });
      toast({ title: "Банер удален", description: "Банер успешно удален" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message || "Не удалось удалить банер", variant: "destructive" });
    }
  });

  const handleSubmit = (data: MainBannerFormData) => {
    if (editingIndex !== null) {
      const banner = mainBanners[editingIndex];
      if (banner) {
        updateMutation.mutate({ id: banner.id, data });
      } else {
        // Создаем новый банер если его нет
        createMutation.mutate(data);
      }
    }
  };

  const handleEdit = (index: number) => {
    const banner = mainBanners[index] || defaultBanners[index];
    setEditingIndex(index);
    
    if (mainBanners[index]) {
      // Редактируем существующий банер
      form.reset({
        title: banner.title,
        description: banner.description || "",
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl || "",
        isActive: banner.isActive ?? true,
        order: banner.order,
      });
    } else {
      // Используем шаблон для нового банера
      const template = defaultBanners[index];
      form.reset({
        title: template.title,
        description: template.description,
        imageUrl: template.imageUrl,
        linkUrl: template.linkUrl,
        isActive: true,
        order: template.order,
      });
    }
  };

  const handleDelete = (index: number) => {
    const banner = mainBanners[index];
    if (banner && confirm("Вы уверены, что хотите удалить этот банер?")) {
      deleteMutation.mutate(banner.id);
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  const getBannerTitle = (index: number) => {
    const titles = ["Продай свое авто", "Специальное предложение", "Безопасные сделки"];
    return titles[index] || `Банер ${index + 1}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Основные банеры главной страницы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Управление банерами */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Основные банеры главной страницы</CardTitle>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Предпросмотр на сайте
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            {[0, 1, 2].map((index) => {
              const banner = mainBanners[index];
              const template = defaultBanners[index];
              const isEditing = editingIndex === index;
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">{getBannerTitle(index)}</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {banner && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(index)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Предпросмотр банера */}
                  <div className="mb-4">
                    <BannerPreview 
                      banner={banner || template} 
                      index={index}
                    />
                  </div>

                  {/* Форма редактирования */}
                  {isEditing && (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 border-t pt-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Заголовок</FormLabel>
                              <FormControl>
                                <Input placeholder="Название банера" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Описание</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Описание банера" rows={2} {...field} />
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
                              <FormLabel>URL изображения</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} />
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
                              <FormLabel>Ссылка при клике</FormLabel>
                              <FormControl>
                                <Input placeholder="/special-offer" {...field} />
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
                                <FormLabel>Активен</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Отображать банер на сайте
                                </div>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2 pt-4">
                          <Button 
                            type="submit" 
                            disabled={createMutation.isPending || updateMutation.isPending}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {banner ? "Обновить" : "Создать"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditingIndex(null)}
                          >
                            Отмена
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}

                  {/* Информация о банере */}
                  {!isEditing && banner && (
                    <div className="text-sm text-gray-600 space-y-1 border-t pt-4">
                      <p><strong>Статус:</strong> {banner.isActive ? "Активен" : "Неактивен"}</p>
                      <p><strong>Создан:</strong> {new Date(banner.createdAt).toLocaleString('ru-RU')}</p>
                      {banner.linkUrl && <p><strong>Ссылка:</strong> {banner.linkUrl}</p>}
                    </div>
                  )}

                  {!isEditing && !banner && (
                    <div className="text-center py-4 text-gray-500">
                      <p>Банер не создан</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(index)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Создать банер
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}