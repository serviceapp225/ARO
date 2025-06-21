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
    // Очищаем старые глобальные данные пользователя
    localStorage.removeItem('userData');
    
    const demoUserData = localStorage.getItem('demo-user');
    let currentPhoneNumber = "";
    
    // Сначала получаем номер телефона текущего пользователя
    if (demoUserData) {
      try {
        const demoUser = JSON.parse(demoUserData);
        currentPhoneNumber = demoUser.phoneNumber || "";
        setUserData(prev => ({
          ...prev,
          phoneNumber: currentPhoneNumber
        }));
      } catch (error) {
        console.error('Error loading demo user data:', error);
      }
    }
    
    // Загружаем данные для конкретного номера телефона
    if (currentPhoneNumber) {
      const userDataKey = `userData_${currentPhoneNumber}`;
      const savedData = localStorage.getItem(userDataKey);
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setUserData(prev => ({
            ...prev,
            fullName: parsed.fullName || "",
            email: parsed.email || "",
            accountType: parsed.accountType || 'individual',
            profilePhoto: parsed.profilePhoto || null,
          }));
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        // Для нового пользователя очищаем все данные кроме номера телефона
        setUserData(prev => ({
          ...prev,
          fullName: "",
          email: "",
          accountType: 'individual',
          profilePhoto: null,
        }));
      }
    }
  }, []);

  const updateUserData = (data: Partial<UserDataContextType['userData']>) => {
    setUserData(prev => {
      const newData = { ...prev, ...data };
      
      // Сохраняем в localStorage используя номер телефона как ключ
      if (newData.phoneNumber) {
        const userDataKey = `userData_${newData.phoneNumber}`;
        const dataToSave = {
          fullName: newData.fullName,
          email: newData.email,
          accountType: newData.accountType,
          profilePhoto: newData.profilePhoto,
        };
        localStorage.setItem(userDataKey, JSON.stringify(dataToSave));
      }
      
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