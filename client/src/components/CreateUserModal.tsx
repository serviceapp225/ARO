import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, X } from "lucide-react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [isActive, setIsActive] = useState(false);
  const [sendSMS, setSendSMS] = useState(true);
  
  const smsText = "AutoBid.tj: Регистрация завершена! Скачайте приложение в Play Market или App Store и участвуйте в аукционах. Выгодные цены каждый день!";

  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      phoneNumber: string;
      fullName: string;
      role: string;
      isActive: boolean;
      sendSMS: boolean;
    }) => {
      const userStr = localStorage.getItem('demo-user') || localStorage.getItem('currentUser');
      const currentUser = userStr ? JSON.parse(userStr) : {};
      
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.userId?.toString() || '4',
          'x-user-email': currentUser.email || '+992 (90) 333-13-32@autoauction.tj'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Успешно!",
        description: `Аккаунт создан: ${data.user.fullName} (${data.user.phoneNumber})`,
        duration: 3000
      });
      
      // Обновляем список пользователей
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      // Закрываем модал и очищаем форму
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "❌ Ошибка",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !fullName.trim()) {
      toast({
        title: "❌ Ошибка",
        description: "Номер телефона и имя обязательны",
        variant: "destructive"
      });
      return;
    }
    
    createUserMutation.mutate({
      phoneNumber: phoneNumber.trim(),
      fullName: fullName.trim(),
      role,
      isActive,
      sendSMS
    });
  };

  const handleClose = () => {
    setPhoneNumber("");
    setFullName("");
    setRole("buyer");
    setIsActive(false);
    setSendSMS(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Создание нового аккаунта
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Номер телефона */}
          <div>
            <Label htmlFor="phoneNumber">Номер телефона *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+992 90 123-45-67"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          {/* Полное имя */}
          <div>
            <Label htmlFor="fullName">Полное имя *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Иван Петрович Сидоров"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Роль пользователя */}
          <div>
            <Label>Роль пользователя</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as "buyer" | "seller")} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buyer" id="buyer" />
                <Label htmlFor="buyer">Покупатель</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="seller" id="seller" />
                <Label htmlFor="seller">Продавец</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Настройки */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Настройки</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isActive" 
                checked={isActive} 
                onCheckedChange={(checked) => setIsActive(checked === true)} 
              />
              <Label htmlFor="isActive">Активировать сразу</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sendSMS" 
                checked={sendSMS} 
                onCheckedChange={(checked) => setSendSMS(checked === true)} 
              />
              <Label htmlFor="sendSMS">Отправить SMS уведомление</Label>
            </div>
          </div>

          {/* Предпросмотр SMS */}
          {sendSMS && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Текст SMS:
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {smsText}
              </p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={createUserMutation.isPending}
              className="flex-1"
            >
              {createUserMutation.isPending ? 'Создание...' : 'Создать аккаунт'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createUserMutation.isPending}
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}