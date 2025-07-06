import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, ShieldCheck } from "lucide-react";

interface ReservePriceIndicatorProps {
  reservePrice?: string | null;
  currentBid?: string | null;
  startingPrice?: string | null;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}

export function ReservePriceIndicator({ 
  reservePrice, 
  currentBid, 
  startingPrice,
  size = "md",
  showProgress = false
}: ReservePriceIndicatorProps) {
  // Если нет резервной цены, не показываем индикатор
  if (!reservePrice) {
    return null;
  }

  const reserve = parseFloat(reservePrice);
  const current = parseFloat(currentBid || startingPrice || "0");
  const starting = parseFloat(startingPrice || "0");
  
  // Определяем, достигнута ли резервная цена
  const isReserveMet = current >= reserve;
  
  // Вычисляем прогресс до резервной цены
  const progressPercentage = Math.min((current / reserve) * 100, 100);

  // Стили в зависимости от размера
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  // Для покупателей показываем только базовый статус без процентов и прогресса
  if (showProgress && !isReserveMet) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Резервная цена не достигнута
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Продолжайте торги для достижения резерва
        </p>
      </div>
    );
  }

  return (
    <Badge
      variant={isReserveMet ? "default" : "secondary"}
      className={`
        ${sizeClasses[size]}
        ${isReserveMet 
          ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100" 
          : "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100"
        }
        flex items-center space-x-1
      `}
    >
      {isReserveMet ? (
        <>
          <ShieldCheck className="h-3 w-3" />
          <span>РЕЗЕРВ ДОСТИГНУТ</span>
        </>
      ) : (
        <>
          <Shield className="h-3 w-3" />
          <span>РЕЗЕРВ НЕ ДОСТИГНУТ</span>
        </>
      )}
    </Badge>
  );
}