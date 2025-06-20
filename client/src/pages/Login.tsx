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
  const [phoneNumber, setPhoneNumber] = useState("+992 ");
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
    
    // Create demo user in localStorage immediately
    const demoUser = {
      email: phoneNumber + "@autoauction.tj",
      phoneNumber: phoneNumber,
      uid: "demo-user-" + Date.now()
    };
    localStorage.setItem('demo-user', JSON.stringify(demoUser));
    
    // Redirect immediately
    window.location.href = '/profile';
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits and the +992 prefix if it exists
    let phoneNumber = value.replace(/\D/g, '');
    
    // Remove 992 prefix if it exists at the beginning
    if (phoneNumber.startsWith('992')) {
      phoneNumber = phoneNumber.slice(3);
    }
    
    // Limit to 9 digits (Tajikistan phone numbers after country code)
    phoneNumber = phoneNumber.slice(0, 9);
    
    // Format as +992 (XX) XXX-XX-XX
    if (phoneNumber.length === 0) return '+992 ';
    if (phoneNumber.length <= 2) return `+992 (${phoneNumber}`;
    if (phoneNumber.length <= 5) return `+992 (${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    if (phoneNumber.length <= 7) return `+992 (${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 5)}-${phoneNumber.slice(5)}`;
    return `+992 (${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 5)}-${phoneNumber.slice(5, 7)}-${phoneNumber.slice(7, 9)}`;
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
          <CardTitle className="text-2xl font-bold">Вход в AUTOBID.TJ</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+992 (__) ___-__-__"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="text-base"
                required
              />
              <p className="text-xs text-neutral-500">
                Мы отправим код подтверждения на этот номер
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-0.5"
              />
              <div className="text-xs">
                <Label htmlFor="terms" className="cursor-pointer leading-tight">
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
              disabled={phoneNumber.length < 8 || !agreeToTerms || isLoading}
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

          <div className="mt-3 text-center">
            <p className="text-xs text-neutral-600">
              Нет аккаунта?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}