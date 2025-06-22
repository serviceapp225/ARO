import { useState } from "react";
import { Phone, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("+992 ");
  const [smsCode, setSmsCode] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === "phone") {
      if (!agreeToTerms) {
        toast({
          title: "Ошибка",
          description: "Необходимо согласиться с условиями использования",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      try {
        // Отправляем запрос на получение SMS-кода
        const response = await fetch("/api/auth/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber })
        });

        const data = await response.json();
        
        if (response.ok) {
          toast({
            title: "SMS отправлен",
            description: "Код подтверждения отправлен на ваш номер"
          });
          setStep("code");
        } else {
          toast({
            title: "Ошибка",
            description: data.error || "Не удалось отправить SMS",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Проблема с подключением к серверу",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    } else {
      // Проверяем SMS-код
      if (!smsCode || smsCode.length !== 4) {
        toast({
          title: "Ошибка",
          description: "Введите 4-значный код из SMS",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/verify-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, code: smsCode })
        });

        const data = await response.json();
        
        if (response.ok) {
          // Создаем пользователя после успешной верификации
          const user = {
            email: phoneNumber + "@autoauction.tj",
            phoneNumber: phoneNumber,
            uid: "user-" + Date.now(),
            isActive: true,
            verified: true
          };
          localStorage.setItem('demo-user', JSON.stringify(user));
          
          toast({
            title: "Успешно!",
            description: "Вы успешно вошли в систему"
          });
          
          setTimeout(() => {
            window.location.href = '/home';
          }, 1000);
        } else {
          toast({
            title: "Неверный код",
            description: data.error || "Проверьте правильность введенного кода",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Проблема с подключением к серверу",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }
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
            {step === "phone" ? (
              <Phone className="w-8 h-8 text-white" />
            ) : (
              <Shield className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "phone" ? "Вход в AUTOBID.TJ" : "Подтверждение номера"}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            {step === "phone" 
              ? "Для просмотра аукционов необходимо войти в систему"
              : `Введите код из SMS, отправленного на ${phoneNumber}`
            }
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === "phone" ? (
              <>
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
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <Label htmlFor="sms-code">Код из SMS</Label>
                  <Input
                    id="sms-code"
                    type="text"
                    placeholder="1234"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="text-center text-2xl tracking-widest"
                    maxLength={4}
                    required
                  />
                  <p className="text-xs text-neutral-500">
                    Введите 4-значный код из SMS
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setStep("phone");
                      setSmsCode("");
                    }}
                  >
                    Назад
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={smsCode.length !== 4 || isLoading}
                  >
                    {isLoading ? "Проверяем..." : "Войти"}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => {
                    setStep("phone");
                    setSmsCode("");
                  }}
                  disabled={isLoading}
                >
                  Отправить код повторно
                </Button>
              </>
            )}
          </form>


        </CardContent>
      </Card>
    </div>
  );
}