import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface BidConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  bidAmount: string;
  currentBid: string;
  carTitle: string;
}

export function BidConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  bidAmount,
  currentBid,
  carTitle
}: BidConfirmationDialogProps) {
  const bidValue = parseFloat(bidAmount);
  const currentValue = parseFloat(currentBid);
  const increase = bidValue - currentValue;
  const increasePercentage = currentValue > 0 ? ((increase / currentValue) * 100).toFixed(1) : 0;
  
  // Определяем является ли ставка подозрительно большой (больше чем в 3 раза от текущей)
  const isSuspiciouslyHigh = bidValue > currentValue * 3 && currentValue > 0;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isSuspiciouslyHigh ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <TrendingUp className="h-5 w-5 text-green-500" />
            )}
            Подтвердите ставку
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {carTitle}
              </div>
              
              {/* Текущая ставка */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Текущая максимальная ставка
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {currentValue.toLocaleString()} Сомони
                </div>
              </div>

              {/* Новая ставка */}
              <div className={`p-4 rounded-lg border-2 ${
                isSuspiciouslyHigh 
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700' 
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
              }`}>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Ваша ставка
                </div>
                <div className={`text-2xl font-bold ${
                  isSuspiciouslyHigh 
                    ? 'text-amber-700 dark:text-amber-300' 
                    : 'text-green-700 dark:text-green-300'
                }`}>
                  {bidValue.toLocaleString()} Сомони
                </div>
                
                {/* Показываем увеличение */}
                <div className="mt-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Увеличение: +{increase.toLocaleString()} Сомони
                  </span>
                  {currentValue > 0 && (
                    <span className={`ml-2 ${
                      isSuspiciouslyHigh 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      (+{increasePercentage}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Предупреждение для подозрительно высоких ставок */}
              {isSuspiciouslyHigh && (
                <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <div className="font-semibold mb-1">Внимание!</div>
                      <div>
                        Ваша ставка значительно превышает текущую. 
                        Пожалуйста, убедитесь, что сумма указана правильно.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Убедитесь, что сумма указана правильно перед подтверждением.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Отменить
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isSuspiciouslyHigh 
              ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700" 
              : "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            }
          >
            Подтвердить ставку
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}