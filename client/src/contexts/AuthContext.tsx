import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fastCache, preCacheUserData, getCachedUserData } from '@/lib/fastCache';
import { getInstantUserData, isInstantUser } from '@/lib/instantAuth';

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
          
          // Check for instant user data first (bypasses all network calls)
          const instantData = getInstantUserData(demoUser.phoneNumber);
          if (instantData) {
            demoUser.isActive = instantData.isActive;
            demoUser.userId = instantData.userId;
            demoUser.fullName = instantData.fullName;
            setUser(demoUser);
            setLoading(false);
            return;
          }

          // Check ultra-fast cache second
          const cachedData = getCachedUserData(demoUser.phoneNumber);
          if (cachedData) {
            demoUser.isActive = cachedData.isActive;
            demoUser.userId = cachedData.userId;
            setUser(demoUser);
            setLoading(false);
            return;
          }

          // Only fallback to database for unknown users
          try {
            const emailFromPhone = demoUser.phoneNumber.replace(/\D/g, '') + '@autoauction.tj';
            const response = await fetch(`/api/users/by-email/${encodeURIComponent(emailFromPhone)}`);
            
            if (response.ok) {
              const dbUser = await response.json();
              demoUser.isActive = dbUser.isActive;
              demoUser.userId = dbUser.id;
              
              // Cache for future instant access
              preCacheUserData(demoUser.phoneNumber, {
                isActive: dbUser.isActive,
                userId: dbUser.id
              });
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