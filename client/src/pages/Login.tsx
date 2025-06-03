import { useState } from "react";
import { Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      alert("Необходимо согласиться с условиями использования");
      return;
    }

    setIsLoading(true);
    // TODO: Implement phone authentication
    console.log("Authenticating with phone:", phoneNumber);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to verification code page or home
    }, 2000);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as +7 (XXX) XXX-XX-XX
    if (phoneNumber.length === 0) return '';
    if (phoneNumber.length <= 1) return `+7 (${phoneNumber}`;
    if (phoneNumber.length <= 4) return `+7 (${phoneNumber.slice(1)}`;
    if (phoneNumber.length <= 7) return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
    if (phoneNumber.length <= 9) return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
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
                placeholder="+7 (___) ___-__-__"
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

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Нет аккаунта?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Зарегистрироваться
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-3">
                Или войдите с помощью
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => console.log("Google login")}
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
                Войти через Google
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}