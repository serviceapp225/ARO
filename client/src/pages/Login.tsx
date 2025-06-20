import { useState } from "react";
import { Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      alert("Необходимо согласиться с условиями использования");
      return;
    }

    setIsLoading(true);
    console.log("Authenticating with phone:", phoneNumber);
    
    // Simulate successful login after 1 second
    setTimeout(() => {
      setIsLoading(false);
      // Create demo user in localStorage
      const demoUser = {
        email: phoneNumber + "@autoauction.tj",
        phoneNumber: phoneNumber,
        uid: "demo-user-" + Date.now()
      };
      localStorage.setItem('demo-user', JSON.stringify(demoUser));
      
      // Trigger page reload to update auth state
      window.location.href = '/profile';
    }, 1000);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as +992 (XX) XXX-XX-XX
    if (phoneNumber.length === 0) return '';
    if (phoneNumber.length <= 3) return `+992 (${phoneNumber}`;
    if (phoneNumber.length <= 5) return `+992 (${phoneNumber.slice(3)}`;
    if (phoneNumber.length <= 8) return `+992 (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5)}`;
    if (phoneNumber.length <= 10) return `+992 (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)}-${phoneNumber.slice(8)}`;
    return `+992 (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)}-${phoneNumber.slice(8, 10)}-${phoneNumber.slice(10, 12)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Вход в AUTOAUCTION</CardTitle>
          <p className="text-neutral-600">
            Войдите с помощью номера телефона
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+992 (__) ___-__-__"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="text-lg"
                required
              />
              <p className="text-sm text-neutral-500">
                Мы отправим код подтверждения на этот номер
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1"
              />
              <div className="text-sm">
                <Label htmlFor="terms" className="cursor-pointer">
                  Я согласен с{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    условиями использования
                  </Link>
                  {" "}и{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    политикой конфиденциальности
                  </Link>
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!phoneNumber || !agreeToTerms || isLoading}
            >
              {isLoading ? (
                "Отправляем код..."
              ) : (
                <>
                  Получить код
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">или</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                const adminUser = {
                  email: "admin@autoauction.tj",
                  phoneNumber: "+992901234567",
                  uid: "admin-user",
                  role: "admin"
                };
                localStorage.setItem('demo-user', JSON.stringify(adminUser));
                window.location.href = '/admin';
              }}
            >
              Войти как администратор
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Нет аккаунта?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}