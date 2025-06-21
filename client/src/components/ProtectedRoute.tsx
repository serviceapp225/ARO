import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { LogIn, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function ProtectedRoute({ children, title, description }: ProtectedRouteProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setLocation('/login')} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Войти в систему
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Уже есть аккаунт? Войдите, чтобы получить доступ к этой странице.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}