import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

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

interface BannerDisplayProps {
  position?: string;
  className?: string;
}

export function BannerDisplay({ position = "main", className = "" }: BannerDisplayProps) {
  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['/api/banners', position],
    queryFn: async () => {
      const response = await fetch(`/api/banners?position=${position}`);
      if (!response.ok) throw new Error('Failed to fetch banners');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!banners.length) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {banners.map((banner) => (
        <Card key={banner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="relative">
              <img 
                src={banner.imageUrl} 
                alt={banner.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=300&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                {banner.linkUrl && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => window.open(banner.linkUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Подробнее
                  </Button>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{banner.title}</h3>
              {banner.description && (
                <p className="text-sm text-gray-600 mb-3">{banner.description}</p>
              )}
              {banner.linkUrl && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(banner.linkUrl, '_blank')}
                  className="w-full"
                >
                  Узнать больше
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}