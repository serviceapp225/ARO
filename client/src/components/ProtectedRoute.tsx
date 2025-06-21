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
          <CardContent className="p-8 text-center">
            <Button 
              onClick={() => setLocation('/login')} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Войти в систему
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}