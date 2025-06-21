import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

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
          
          // Check if user data is already cached
          const cachedUserKey = `user_data_${demoUser.phoneNumber}`;
          const cachedUserData = localStorage.getItem(cachedUserKey);
          const cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
          
          if (cachedUserData) {
            try {
              const cached = JSON.parse(cachedUserData);
              if (Date.now() - cached.timestamp < cacheExpiry) {
                // Use cached data
                demoUser.isActive = cached.isActive;
                demoUser.userId = cached.userId;
                setUser(demoUser);
                setLoading(false);
                return;
              }
            } catch (e) {
              localStorage.removeItem(cachedUserKey);
            }
          }

          // Fetch user activation status from database
          try {
            const emailFromPhone = demoUser.phoneNumber.replace(/\D/g, '') + '@autoauction.tj';
            const response = await fetch(`/api/users/by-email/${encodeURIComponent(emailFromPhone)}`);
            
            if (response.ok) {
              const dbUser = await response.json();
              demoUser.isActive = dbUser.isActive;
              demoUser.userId = dbUser.id;
              
              // Cache the user data
              localStorage.setItem(cachedUserKey, JSON.stringify({
                isActive: dbUser.isActive,
                userId: dbUser.id,
                timestamp: Date.now()
              }));
            } else {
              demoUser.isActive = false;
              demoUser.userId = null;
            }
          } catch (error) {
            console.error('Failed to fetch user activation status:', error);
            demoUser.isActive = false;
            demoUser.userId = null;
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