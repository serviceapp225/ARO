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
  username?: string;
}

interface AuthContextType {
  user: DemoUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Отладка изменений пользователя для поиска "user is not defined"
  useEffect(() => {
    if (user === null) {
      console.log('🔍 AuthContext: user стал null');
      console.trace('🔍 Трейс сброса пользователя в null');
    } else if (user === undefined) {
      console.log('🔍 AuthContext: user стал undefined');
      console.trace('🔍 Трейс сброса пользователя в undefined');
    } else {
      console.log('🔍 AuthContext: user обновлен:', { phoneNumber: user?.phoneNumber, userId: user.userId });
    }
  }, [user]);

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

          // Быстрый фолбэк для неизвестных пользователей - избегаем медленных запросов
          const phoneDigits = demoUser.phoneNumber.replace(/\D/g, '');
          
          // Используем предустановленные данные для известных пользователей
          if (phoneDigits === '992903331332') {
            demoUser.isActive = true;
            demoUser.userId = 4;
            // Загружаем полные данные пользователя из API
            try {
              const response = await fetch('/api/users/4');
              if (response.ok) {
                const userData = await response.json();
                demoUser.fullName = userData.fullName;
                demoUser.username = userData.username;
              }
            } catch (error) {
              console.error('Failed to load user data:', error);
            }
          } else if (phoneDigits === '992111111111') {
            demoUser.isActive = true;
            demoUser.userId = 3;
            // Загружаем полные данные пользователя из API
            try {
              const response = await fetch('/api/users/3');
              if (response.ok) {
                const userData = await response.json();
                demoUser.fullName = userData.fullName;
                demoUser.username = userData.username;
              }
            } catch (error) {
              console.error('Failed to load user data:', error);
            }
          } else {
            // Для остальных пользователей - синхронная проверка и создание
            demoUser.isActive = false;
            demoUser.userId = null;
            
            // Немедленная проверка и создание пользователя
            (async () => {
              try {
                const emailFromPhone = phoneDigits + '@autoauction.tj';
                let response = await fetch(`/api/users/by-email/${encodeURIComponent(emailFromPhone)}`);
                
                let dbUser;
                if (response.ok) {
                  // Пользователь существует
                  dbUser = await response.json();
                } else {
                  // Пользователь не существует - создаем его
                  console.log(`Creating new user for phone: ${demoUser.phoneNumber}`);
                  const createResponse = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: emailFromPhone,
                      username: demoUser.phoneNumber,
                      fullName: null,
                      isActive: false, // Новые пользователи неактивны по умолчанию
                      role: 'buyer',
                      phoneNumber: demoUser.phoneNumber // Добавляем номер телефона
                    })
                  });
                  
                  if (createResponse.ok) {
                    dbUser = await createResponse.json();
                    console.log(`Created new user with ID: ${dbUser.id}`);
                  } else {
                    console.error('Failed to create user');
                    return;
                  }
                }
                
                // Обновляем данные пользователя
                const updatedUser = {
                  ...demoUser,
                  isActive: dbUser.isActive,
                  userId: dbUser.id,
                  fullName: dbUser.fullName
                };
                
                setUser(updatedUser);
                
                // Кэшируем для будущих входов
                preCacheUserData(demoUser.phoneNumber, {
                  isActive: dbUser.isActive,
                  userId: dbUser.id
                });
                
                // Обновляем localStorage
                localStorage.setItem('demo-user', JSON.stringify(updatedUser));
                
              } catch (error) {
                console.error('User creation failed:', error);
              }
            })();
          }
          
          setUser(demoUser);
        } catch (error) {
          console.error('❌ Ошибка загрузки пользователя:', error);
          // НЕ удаляем пользователя из localStorage при ошибках загрузки!
          // Это вызывает неожиданный выход из системы
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const refreshUserStatus = async () => {
    if (!user?.userId) return;
    
    try {
      const response = await fetch(`/api/users/${user.userId}`);
      if (response.ok) {
        const userData = await response.json();
        const updatedUser = {
          ...user,
          isActive: userData.isActive,
          fullName: userData.fullName,
          username: userData.username
        };
        setUser(updatedUser);
        
        // Обновляем кэш
        if (user?.phoneNumber) {
          preCacheUserData(user?.phoneNumber || '', {
            isActive: userData.isActive,
            userId: userData.id
          });
        }
        
        // Обновляем localStorage
        localStorage.setItem('demo-user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user status:', error);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Пользователь выходит из системы (вызван logout)');
      localStorage.removeItem('demo-user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUserStatus }}>
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