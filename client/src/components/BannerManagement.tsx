import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
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

const bannerSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  imageUrl: z.string().url("Некорректный URL изображения"),
  linkUrl: z.string().url("Некорректный URL ссылки").optional().or(z.literal("")),
  position: z.string().min(1, "Позиция обязательна"),
  isActive: z.boolean(),
  order: z.number().min(0, "Порядок должен быть неотрицательным"),
});

type BannerFormData = z.infer<typeof bannerSchema>;

export function BannerManagement() {
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
    queryFn: async () => {
      const response = await fetch('/api/banners');
      if (!response.ok) throw new Error('Failed to fetch banners');
      return response.json();
    }
  });

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      position: "main",
      isActive: true,
      order: 0,
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: BannerFormData) => apiRequest('/api/admin/banners', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      toast({ title: "Банер создан", description: "Новый банер успешно добавлен" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message || "Не удалось создать банер", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BannerFormData }) => 
      apiRequest(`/api/admin/banners/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      toast({ title: "Банер обновлен", description: "Изменения сохранены" });
      setIsDialogOpen(false);
      setEditingBanner(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message || "Не удалось обновить банер", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/banners/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      toast({ title: "Банер удален", description: "Банер успешно удален" });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка", description: error.message || "Не удалось удалить банер", variant: "destructive" });
    }
  });

  const handleSubmit = (data: BannerFormData) => {
    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    form.reset({
      title: banner.title,
      description: banner.description || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      position: banner.position,
      isActive: banner.isActive,
      order: banner.order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот банер?")) {
      deleteMutation.mutate(id);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Управление банерами</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Управление банерами</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBanner(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить банер
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Редактировать банер" : "Создать новый банер"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название</FormLabel>
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
                        <Textarea placeholder="Описание банера" {...field} />
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
                      <FormLabel>Ссылка (необязательно)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Позиция</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите позицию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="main">Главная страница</SelectItem>
                          <SelectItem value="sidebar">Боковая панель</SelectItem>
                          <SelectItem value="footer">Подвал</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Порядок</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Активен</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingBanner ? "Обновить" : "Создать"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Отмена
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {banners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Банеры не найдены</p>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title}
                  className="w-20 h-12 object-cover rounded flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=300&fit=crop";
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{banner.title}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {banner.description || "Без описания"}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span>Позиция: {banner.position}</span>
                    <span>Порядок: {banner.order}</span>
                    <span className={banner.isActive ? "text-green-600" : "text-red-600"}>
                      {banner.isActive ? "Активен" : "Неактивен"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {banner.linkUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(banner.linkUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(banner)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(banner.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}