import { createContext, useContext, useState, useEffect } from "react";

interface UserDataContextType {
  userData: {
    fullName: string;
    phoneNumber: string;
    email: string;
    accountType: 'dealer' | 'individual';
    profilePhoto: string | null;
    passportFront: File | null;
    passportBack: File | null;
  };
  updateUserData: (data: Partial<UserDataContextType['userData']>) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    accountType: 'individual' as 'dealer' | 'individual',
    profilePhoto: null as string | null,
    passportFront: null as File | null,
    passportBack: null as File | null,
  });

  // Загружаем данные из localStorage при инициализации
  useEffect(() => {
    const savedData = localStorage.getItem('userData');
    const demoUserData = localStorage.getItem('demo-user');
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserData(prev => ({
          ...prev,
          fullName: "", // Всегда начинаем с пустого имени
          email: parsed.email || "",
          accountType: parsed.accountType || 'individual',
          profilePhoto: null, // Всегда начинаем без фотографии
          phoneNumber: parsed.phoneNumber || prev.phoneNumber,
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
    
    // Если есть demo user, используем его номер телефона
    if (demoUserData) {
      try {
        const demoUser = JSON.parse(demoUserData);
        if (demoUser.phoneNumber) {
          setUserData(prev => ({
            ...prev,
            phoneNumber: demoUser.phoneNumber
          }));
        }
      } catch (error) {
        console.error('Error loading demo user data:', error);
      }
    }
  }, []);

  const updateUserData = (data: Partial<UserDataContextType['userData']>) => {
    setUserData(prev => {
      const newData = { ...prev, ...data };
      
      // Сохраняем в localStorage (без файлов)
      const dataToSave = {
        fullName: newData.fullName,
        email: newData.email,
        accountType: newData.accountType,
        profilePhoto: newData.profilePhoto,
        phoneNumber: newData.phoneNumber,
      };
      localStorage.setItem('userData', JSON.stringify(dataToSave));
      
      return newData;
    });
  };

  return (
    <UserDataContext.Provider value={{ userData, updateUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}