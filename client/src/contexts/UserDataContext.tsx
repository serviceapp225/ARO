import { createContext, useContext, useState, useEffect } from "react";

interface UserDataContextType {
  userData: {
    fullName: string;
    phoneNumber: string;
    email: string;
    passportFront: File | null;
    passportBack: File | null;
  };
  updateUserData: (data: Partial<UserDataContextType['userData']>) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState({
    fullName: "",
    phoneNumber: "+992 (90) 123-45-67",
    email: "",
    passportFront: null as File | null,
    passportBack: null as File | null,
  });

  // Загружаем данные из localStorage при инициализации
  useEffect(() => {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserData(prev => ({
          ...prev,
          fullName: parsed.fullName || "",
          email: parsed.email || "",
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
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