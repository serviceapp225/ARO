import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DemoUser {
  email: string;
  phoneNumber: string;
  fullName?: string;
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
        // Устанавливаем демо-пользователя как обычного пользователя
        demoUser.role = demoUser.role || 'buyer';
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