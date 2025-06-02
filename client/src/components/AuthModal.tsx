import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { loginWithGoogle } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

export function AuthModal({ open, onOpenChange, mode, onModeChange }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feature Coming Soon",
      description: "Email/password authentication will be available soon. Please use Google sign-in.",
    });
  };

  const handleGoogleSignIn = () => {
    try {
      loginWithGoogle();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate Google sign-in.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте аккаунт'}
          </DialogTitle>
          <p className="text-center text-neutral-600">
            Присоединяйтесь к тысячам автолюбителей
          </p>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => onModeChange(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Войти</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Электронная почта"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-neutral-600">Запомнить меня</span>
                </label>
                <a href="#" className="text-primary hover:underline">
                  Забыли пароль?
                </a>
              </div>

              <Button type="submit" className="w-full">
                Войти
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="space-y-4">
              <Label>Я хочу:</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'buyer' | 'seller')}>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <RadioGroupItem value="buyer" className="mr-2" />
                    <div>
                      <div className="font-medium">Покупать авто</div>
                      <div className="text-sm text-neutral-500">Участвовать в аукционах</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
                    <RadioGroupItem value="seller" className="mr-2" />
                    <div>
                      <div className="font-medium">Продавать авто</div>
                      <div className="text-sm text-neutral-500">Размещать объявления</div>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Электронная почта"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Зарегистрироваться
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-neutral-500">Или продолжить с</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
