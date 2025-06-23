import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fastCache, preCacheUserData, getCachedUserData } from '@/lib/fastCache';
import { getInstantUserData, isInstantUser } from '@/lib/instantAuth';
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
      // Check for demo user in localStorage
      const demoUserData = localStorage.getItem('demo-user');
      if (demoUserData) {
        try {
          const demoUser = JSON.parse(demoUserData);
          demoUser.role = demoUser.role || 'buyer';
          demoUser.isActive = true;
          demoUser.userId = 1;
          setUser(demoUser);
          setLoading(false);
          return;
        } catch (error) {
          localStorage.removeItem('demo-user');
        }
      }
      
      // Automatically create demo user if none exists
      const autoDemoUser = {
        email: 'demo@autoauction.tj',
        phoneNumber: '+992000000000',
        fullName: 'Демо Пользователь',
        uid: 'auto-demo-user',
        role: 'buyer',
        isActive: true,
        userId: 1
      };
      
      localStorage.setItem('demo-user', JSON.stringify(autoDemoUser));
      setUser(autoDemoUser);
      setLoading(false);
    };

    loadUser();
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem('demo-user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
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