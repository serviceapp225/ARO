import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SellCarSectionData {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  backgroundImageUrl: string;
  linkUrl: string;
  isActive: boolean;
  overlayOpacity: number;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

const sellCarSectionSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  subtitle: z.string().min(1, "Подзаголовок обязателен"),
  buttonText: z.string().min(1, "Текст кнопки обязателен"),
  backgroundImageUrl: z.string().url("Введите корректный URL изображения"),
  linkUrl: z.string().min(1, "Ссылка обязательна"),
  isActive: z.boolean(),
  overlayOpacity: z.number().min(0).max(100),
  textColor: z.string().min(1),
  buttonColor: z.string().min(1),
  buttonTextColor: z.string().min(1),
});

type SellCarSectionForm = z.infer<typeof sellCarSectionSchema>;

export function SellCarSectionManagement() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: section, isLoading } = useQuery<SellCarSectionData>({
    queryKey: ['/api/sell-car-section'],
    queryFn: async () => {
      const response = await fetch('/api/sell-car-section');
      if (!response.ok) throw new Error('Failed to fetch sell car section');
      return response.json();
    }
  });

  const form = useForm<SellCarSectionForm>({
    resolver: zodResolver(sellCarSectionSchema),
    defaultValues: {
      title: "Продай свое авто",
      subtitle: "Получи максимальную цену за свой автомобиль на нашем аукционе",
      buttonText: "Начать продажу",
      backgroundImageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      linkUrl: "/sell",
      isActive: true,
      overlayOpacity: 40,
      textColor: "#ffffff",
      buttonColor: "#ffffff",
      buttonTextColor: "#059669",
    }
  });

  // Function to convert color names to hex or return as is
  const getColorValue = (color: string) => {
    const colorMap: Record<string, string> = {
      'white': '#ffffff',
      'black': '#000000',
      'emerald-700': '#059669',
      'emerald-600': '#059669',
      'blue-600': '#2563eb',
      'red-600': '#dc2626',
      'green-600': '#16a34a',
      'gray-800': '#1f2937',
      'gray-900': '#111827'
    };
    return colorMap[color] || color;
  };

  // Initialize form when data loads but preserve changes during editing
  useEffect(() => {
    if (section && !isEditing) {
      form.reset({
        title: section.title,
        subtitle: section.subtitle,
        buttonText: section.buttonText,
        backgroundImageUrl: section.backgroundImageUrl,
        linkUrl: section.linkUrl,
        isActive: section.isActive,
        overlayOpacity: section.overlayOpacity,
        textColor: section.textColor,
        buttonColor: section.buttonColor,
        buttonTextColor: section.buttonTextColor,
      });
    }
  }, [section, isEditing]);

  const updateMutation = useMutation({
    mutationFn: (data: SellCarSectionForm) => 
      apiRequest('PUT', '/api/admin/sell-car-section', data),
    onSuccess: (updatedSection) => {
      toast({ title: "Успешно", description: "Секция обновлена" });
      setIsEditing(false);
      // Update form with saved data to sync state
      form.reset({
        title: updatedSection.title,
        subtitle: updatedSection.subtitle,
        buttonText: updatedSection.buttonText,
        backgroundImageUrl: updatedSection.backgroundImageUrl,
        linkUrl: updatedSection.linkUrl,
        isActive: updatedSection.isActive,
        overlayOpacity: updatedSection.overlayOpacity,
        textColor: updatedSection.textColor,
        buttonColor: updatedSection.buttonColor,
        buttonTextColor: updatedSection.buttonTextColor,
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Ошибка", 
        description: error.message || "Не удалось обновить секцию", 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (data: SellCarSectionForm) => {
    updateMutation.mutate(data);
  };

  const handleEdit = () => {
    if (section) {
      form.reset({
        title: section.title,
        subtitle: section.subtitle,
        buttonText: section.buttonText,
        backgroundImageUrl: section.backgroundImageUrl,
        linkUrl: section.linkUrl,
        isActive: section.isActive,
        overlayOpacity: section.overlayOpacity,
        textColor: section.textColor,
        buttonColor: section.buttonColor,
        buttonTextColor: section.buttonTextColor,
      });
    }
    setIsEditing(true);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/sell-car-section'] });
    toast({ title: "Обновлено", description: "Данные секции обновлены" });
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Управление секцией "Продай свой авто"</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Предпросмотр на сайте
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Предпросмотр */}
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Предпросмотр</h3>
            <div className="relative h-44 rounded-2xl p-6 text-white overflow-hidden shadow-2xl">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
                style={{
                  backgroundImage: `url('${form.watch('backgroundImageUrl') || section?.backgroundImageUrl}')`
                }}
              ></div>
              <div 
                className="absolute inset-0 bg-black rounded-2xl"
                style={{
                  opacity: (form.watch('overlayOpacity') || section?.overlayOpacity || 40) / 100
                }}
              ></div>
              <div className="relative z-10 space-y-2">
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: form.watch('textColor') || section?.textColor }}
                >
                  {form.watch('title') || section?.title}
                </h2>
                <p 
                  className="text-base leading-relaxed opacity-90"
                  style={{ color: form.watch('textColor') || section?.textColor }}
                >
                  {form.watch('subtitle') || section?.subtitle}
                </p>
                <div className="mt-4">
                  <span 
                    className="px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-1"
                    style={{ 
                      backgroundColor: getColorValue(form.watch('buttonColor') || section?.buttonColor || '#ffffff'),
                      color: getColorValue(form.watch('buttonTextColor') || section?.buttonTextColor || '#059669')
                    }}
                  >
                    {form.watch('buttonText') || section?.buttonText} →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Форма редактирования */}
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Заголовок</FormLabel>
                      <FormControl>
                        <Input placeholder="Продай свое авто" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Подзаголовок</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Описание секции" rows={2} {...field} />
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
                      <FormLabel>Текст кнопки</FormLabel>
                      <FormControl>
                        <Input placeholder="Начать продажу" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backgroundImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL фонового изображения</FormLabel>
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
                      <FormLabel>Ссылка кнопки</FormLabel>
                      <FormControl>
                        <Input placeholder="/sell" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overlayOpacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Прозрачность наложения ({field.value}%)</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={5}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="textColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цвет текста</FormLabel>
                        <FormControl>
                          <Input placeholder="white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buttonColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цвет кнопки</FormLabel>
                        <FormControl>
                          <Input placeholder="white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buttonTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цвет текста кнопки</FormLabel>
                        <FormControl>
                          <Input placeholder="emerald-700" {...field} />
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Активность</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Отображать секцию на сайте
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
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>Заголовок:</strong> {section?.title}</p>
                <p><strong>Подзаголовок:</strong> {section?.subtitle}</p>
                <p><strong>Кнопка:</strong> {section?.buttonText}</p>
                <p><strong>Ссылка:</strong> {section?.linkUrl}</p>
                <p><strong>Статус:</strong> {section?.isActive ? "Активна" : "Неактивна"}</p>
              </div>
              <Button onClick={handleEdit}>
                Редактировать
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}