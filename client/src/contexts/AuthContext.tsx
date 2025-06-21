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
    const loadUser = async () => {
      // Check for demo user in localStorage
      const demoUserData = localStorage.getItem('demo-user');
      if (demoUserData) {
        try {
          const demoUser = JSON.parse(demoUserData);
          demoUser.role = demoUser.role || 'buyer';
          
          // Fetch user activation status from database
          try {
            const response = await fetch(`/api/users/3`); // Using fixed user ID 3 for demo
            if (response.ok) {
              const dbUser = await response.json();
              demoUser.isActive = dbUser.isActive;
            } else {
              demoUser.isActive = false; // Default to inactive if server error
            }
          } catch (error) {
            console.error('Failed to fetch user activation status:', error);
            demoUser.isActive = false; // Default to inactive on error
          }
          
          setUser(demoUser);
        } catch (error) {
          localStorage.removeItem('demo-user');
        }
      }
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