import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DemoUser {
  email: string;
  phoneNumber: string;
  uid: string;
  role?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: DemoUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for demo user in localStorage
    const demoUserData = localStorage.getItem('demo-user');
    if (demoUserData) {
      try {
        const demoUser = JSON.parse(demoUserData);
        // Устанавливаем демо-пользователя как администратора
        demoUser.role = 'admin';
        demoUser.isActive = true;
        setUser(demoUser);
      } catch (error) {
        localStorage.removeItem('demo-user');
      }
    }
    setLoading(false);
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem('demo-user');
      setUser(null);
      toast({
        title: "Выход выполнен",
      });
    } catch (error) {
      toast({
        title: "Ошибка выхода",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}