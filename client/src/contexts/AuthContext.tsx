import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { preloadCriticalData } from '@/lib/preloadData';

interface DemoUser {
  email: string;
  phoneNumber: string;
  fullName?: string;
  uid: string;
  role?: string;
  isActive?: boolean;
  userId?: number;
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
    const loadUser = async () => {
      // Auto-login with demo user (bypass SMS verification)
      const defaultUser: DemoUser = {
        email: "demo@autobid.tj",
        phoneNumber: "+992000000000",
        fullName: "Демонстрационный пользователь",
        uid: "demo-user-001",
        role: "buyer",
        isActive: true,
        userId: 1
      };

      // Set demo user in localStorage for persistence
      localStorage.setItem('demo-user', JSON.stringify(defaultUser));
      
      setUser(defaultUser);
      setLoading(false);
      
      // Preload data in background
      try {
        await preloadCriticalData();
      } catch (error) {
        console.log('Background data preload failed:', error);
      }
    };
    
    loadUser();
  }, []);

  const logout = async () => {
    localStorage.removeItem('demo-user');
    setUser(null);
    
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из системы",
    });
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