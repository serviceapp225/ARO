import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Car, Save, Eye } from "lucide-react";
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

const sellBannerSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  imageUrl: z.string().url("Некорректный URL изображения"),
  linkUrl: z.string().optional(),
  isActive: z.boolean(),
});

type SellBannerFormData = z.infer<typeof sellBannerSchema>;

export function SellBannerManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Загружаем банер "Начать продажу" (тот что с order = 0)
  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
    queryFn: async () => {
      const response = await fetch('/api/banners?position=main');
      if (!response.ok) throw new Error('Failed to fetch banners');
      return response.json();
    }
  });

  const sellBanner = banners.find(banner => banner.order === 0) || null;

  const form = useForm<SellBannerFormData>({
    resolver: zodResolver(sellBannerSchema),
    defaultValues: {
      title: sellBanner?.title || "Начать продажу",
      description: sellBanner?.description || "Продайте свой автомобиль быстро и выгодно на AUTOBID.TJ",
      imageUrl: sellBanner?.imageUrl || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=300&fit=crop",
      linkUrl: sellBanner?.linkUrl || "/sell-car",
      isActive: sellBanner?.isActive ?? true,
    },
    values: sellBanner ? {
      title: sellBanner.title,
      description: sellBanner.description || "",
      imageUrl: sellBanner.imageUrl,
      linkUrl: sellBanner.linkUrl || "",
      isActive: sellBanner.isActive,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: SellBannerFormData) => {
      if (sellBanner) {
        return apiRequest('PUT', `/api/admin/banners/${sellBanner.id}`, data);
      } else {
        return apiRequest('POST', '/api/admin/banners', {
          ...data,
          position: "main",
          order: 0
        });
      }
    },
    onSuccess: () => {
      // Обновляем все кеши связанные с банерами
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/banners', 'main'] });
      toast({ title: "Банер обновлен", description: "Изменения сохранены успешно" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Ошибка", 
        description: error.message || "Не удалось обновить банер", 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (data: SellBannerFormData) => {
    updateMutation.mutate(data);
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Банер "Начать продажу"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Банер "Начать продажу"
          </div>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Предпросмотр
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Предпросмотр банера:</h4>
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={form.watch("imageUrl")} 
                  alt="Предпросмотр"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=300&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white space-y-2">
                    <h3 className="font-bold">{form.watch("title")}</h3>
                    <p className="text-sm opacity-90">{form.watch("description")}</p>
                    <div className="bg-white text-gray-900 px-4 py-2 rounded text-sm font-medium">
                      Начать продажу
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заголовок</FormLabel>
                  <FormControl>
                    <Input placeholder="Начать продажу" {...field} />
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
                    <Textarea 
                      placeholder="Продайте свой автомобиль быстро и выгодно" 
                      rows={3}
                      {...field} 
                    />
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
                    <Input placeholder="/sell-car" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Активен</FormLabel>
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
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? "Сохраняем..." : "Сохранить изменения"}
              </Button>
            </div>
          </form>
        </Form>

        {sellBanner && (
          <div className="mt-6 pt-6 border-t">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>ID банера:</strong> {sellBanner.id}</p>
              <p><strong>Создан:</strong> {new Date(sellBanner.createdAt).toLocaleString('ru-RU')}</p>
              <p><strong>Позиция:</strong> Главная страница (приоритет)</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}