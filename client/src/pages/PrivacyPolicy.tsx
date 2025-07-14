import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrivacyPolicy() {
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['/api/documents', 'privacy-policy'],
    queryFn: async () => {
      const response = await fetch('/api/documents?type=privacy-policy');
      if (!response.ok) throw new Error('Failed to fetch privacy policy');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000, // 30 минут
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Политика конфиденциальности</h1>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Политика конфиденциальности</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span>Не удалось загрузить политику конфиденциальности</span>
            </div>
            <p className="text-muted-foreground">
              Пожалуйста, попробуйте позже или свяжитесь с поддержкой.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Политика конфиденциальности</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <FileText className="h-5 w-5" />
              <span>Политика конфиденциальности пока не опубликована</span>
            </div>
            <p className="text-muted-foreground">
              Администрация работает над подготовкой документа. Пожалуйста, проверьте позже.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-32">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Политика конфиденциальности</h1>
      </div>
      
      <div className="space-y-4">
        {documents.map((document: any) => (
          <Card key={document.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">
                {document.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[600px]">
                <div 
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              </ScrollArea>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-muted-foreground">
                  Последнее обновление: {new Date(document.updatedAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Ваши права</h3>
        </div>
        <p className="text-sm text-blue-800">
          Если у вас есть вопросы о политике конфиденциальности или вы хотите воспользоваться своими правами, 
          пожалуйста, свяжитесь с нами по телефону +992 (00) 000-00-00 или через форму обратной связи.
        </p>
      </div>
    </div>
  );
}