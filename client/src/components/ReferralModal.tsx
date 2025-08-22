import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Gift, Phone, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = async () => {
    if (user?.phoneNumber) {
      try {
        await navigator.clipboard.writeText(user?.phoneNumber || '');
        setCopied(true);
        toast({
          title: "Скопировано!",
          description: "Ваш номер телефона скопирован в буфер обмена",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        const errorToast = toast({
          title: "Ошибка",
          description: "Не удалось скопировать номер",
          variant: "destructive",
          duration: 1000, // 1 секунда
          action: undefined // Убираем кнопку X
        });
        
        // Автоматически закрыть через 1 секунду
        setTimeout(() => {
          errorToast.dismiss();
        }, 1000);
      }
    }
  };

  const shareText = `Присоединяйтесь к Narxi Tu - лучшей площадке автомобильных аукционов! При регистрации укажите мой номер телефона: ${user?.phoneNumber || 'номер не указан'}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Narxi Tu - Реферальная программа',
          text: shareText,
        });
      } catch (error) {
        // Fallback to copy
        handleCopyPhone();
      }
    } else {
      // Fallback to copy
      handleCopyPhone();
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleCloseButton = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto z-50">
        {/* Кастомная кнопка закрытия */}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50 bg-white hover:bg-gray-100 p-1 cursor-pointer"
          onClick={handleCloseButton}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          type="button"
          style={{ pointerEvents: 'auto' }}
        >
          <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-green-600 flex items-center justify-center gap-2">
            <Gift className="w-6 h-6" />
            Пригласи друга получи 1000 сомони с первой покупки
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Реферальная программа Narxi Tu
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Инструкция */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3">Как это работает:</h3>
            <div className="space-y-2 text-green-700 text-sm leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="font-bold text-green-600">1.</span>
                <span>Вы приглашаете друга через реферальную ссылку</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-green-600">2.</span>
                <span>Друг регистрируется и покупает свою первую машину на аукционе</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-green-600">3.</span>
                <span>После успешной покупки вы получаете 1000 сомони на ваш счет</span>
              </div>
            </div>
            
            {/* Дополнительная информация о регистрации */}
            <div className="mt-4 pt-3 border-t border-green-200">
              <p className="text-green-700 text-sm">
                <strong>Как друг должен регистрироваться:</strong><br />
                Попросите Вашего друга кликнуть при входе в приложение по промокоду и написать ваш номер телефона
              </p>
              <p className="text-green-600 text-xs mt-2 font-medium">
                ⚠️ Максимум 5 человек можно пригласить
              </p>
            </div>
          </div>

          {/* Номер пользователя */}
          {user?.phoneNumber && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ваш номер для друзей:</p>
                    <p className="font-mono font-bold text-lg">{user?.phoneNumber}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyPhone();
                  }}
                  className={`${copied ? 'bg-green-100 border-green-300' : ''}`}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Скопировано!' : 'Копировать'}
                </Button>
              </div>
            </div>
          )}

          {/* Действия */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShare();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Gift className="w-4 h-4 mr-2" />
              Поделиться приглашением
            </Button>
            
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCloseButton();
              }}
              className="w-full"
              type="button"
            >
              Понятно
            </Button>
          </div>

          {/* Дополнительная информация */}
          <div className="text-xs text-gray-500 text-center">
            Бонус начисляется после первой успешной покупки приглашенного друга
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}