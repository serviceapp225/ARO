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

// Утилиты для безопасной работы с localStorage
class SafeStorage {
  private static maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах
  
  static setItem(key: string, value: any): boolean {
    try {
      const dataWithTimestamp = {
        data: value,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('🧹 localStorage переполнен, очищаем старые данные');
        this.clearOldData();
        try {
          const dataWithTimestamp = {
            data: value,
            timestamp: Date.now()
          };
          localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
          return true;
        } catch (retryError) {
          console.error('❌ Не удалось сохранить данные даже после очистки:', retryError);
          return false;
        }
      } else {
        console.error('❌ Ошибка сохранения в localStorage:', error);
        return false;
      }
    }
  }
  
  static getItem(key: string): any {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Проверяем, есть ли timestamp (новый формат)
      if (parsed.timestamp && parsed.data) {
        const age = Date.now() - parsed.timestamp;
        if (age > this.maxAge) {
          // Данные устарели, удаляем
          localStorage.removeItem(key);
          return null;
        }
        return parsed.data;
      }
      
      // Старый формат без timestamp, возвращаем как есть
      return parsed;
    } catch (error) {
      console.error(`❌ Ошибка чтения ${key} из localStorage:`, error);
      return null;
    }
  }
  
  static clearOldData(): void {
    const keysToRemove: string[] = [];
    const currentTime = Date.now();
    
    // Проходим по всем ключам localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      try {
        const stored = localStorage.getItem(key);
        if (!stored) continue;
        
        const parsed = JSON.parse(stored);
        
        // Если есть timestamp, проверяем возраст
        if (parsed.timestamp) {
          const age = currentTime - parsed.timestamp;
          if (age > this.maxAge) {
            keysToRemove.push(key);
          }
        }
        // Удаляем старые ключи без timestamp (legacy данные)
        else if (key.startsWith('userData_') || key.includes('tanstack')) {
          keysToRemove.push(key);
        }
      } catch (error) {
        // Если не можем распарсить, удаляем
        keysToRemove.push(key);
      }
    }
    
    // Удаляем старые данные
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`🗑️ Удален устаревший ключ: ${key}`);
      } catch (error) {
        console.error(`❌ Не удалось удалить ключ ${key}:`, error);
      }
    });
    
    console.log(`🧹 Очищено ${keysToRemove.length} устаревших записей из localStorage`);
  }
  
  static getStorageSize(): string {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return `${(total / 1024).toFixed(2)} KB`;
  }
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
    // Очищаем старые глобальные данные пользователя и выполняем автоматическую очистку
    localStorage.removeItem('userData');
    SafeStorage.clearOldData();
    
    // Выводим информацию о размере localStorage
    console.log(`📊 Размер localStorage: ${SafeStorage.getStorageSize()}`);
    
    const demoUserData = SafeStorage.getItem('demo-user');
    let currentPhoneNumber = "";
    
    // Сначала получаем номер телефона текущего пользователя
    if (demoUserData) {
      currentPhoneNumber = demoUserData.phoneNumber || "";
      setUserData(prev => ({
        ...prev,
        phoneNumber: currentPhoneNumber
      }));

      // Загружаем фотографию профиля из базы данных, если есть userId
      if (demoUserData.userId) {
        loadProfilePhotoFromDatabase(demoUserData.userId);
      }
    }
    
    // Загружаем данные для конкретного номера телефона из localStorage
    if (currentPhoneNumber) {
      const userDataKey = `userData_${currentPhoneNumber}`;
      const savedData = SafeStorage.getItem(userDataKey);
      
      if (savedData) {
        setUserData(prev => ({
          ...prev,
          fullName: savedData.fullName || "",
          email: savedData.email || "",
          accountType: savedData.accountType || 'individual',
          // Не загружаем profilePhoto из localStorage - берем из базы данных
        }));
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

  // Функция для загрузки фотографии профиля из базы данных
  const loadProfilePhotoFromDatabase = async (userId: number) => {
    try {
      console.log('🔍 Загружаем фото профиля для пользователя:', userId);
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const user = await response.json();
        console.log('📸 Получен ответ с фото:', !!user.profilePhoto);
        if (user.profilePhoto) {
          setUserData(prev => ({
            ...prev,
            profilePhoto: user.profilePhoto
          }));
          console.log('✅ Фото профиля загружено из БД');
        }
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки фотографии профиля:', error);
    }
  };

  const updateUserData = (data: Partial<UserDataContextType['userData']>) => {
    setUserData(prev => {
      const newData = { ...prev, ...data };
      
      // Сохраняем в localStorage используя номер телефона как ключ
      if (newData.phoneNumber) {
        const userDataKey = `userData_${newData.phoneNumber}`;
        
        // Сохраняем только критически важные данные (НЕ файлы и большие объекты)
        const dataToSave = {
          fullName: newData.fullName || "",
          email: newData.email || "",
          accountType: newData.accountType || 'individual',
          // Сохраняем profilePhoto только если это не слишком большая строка
          profilePhoto: (newData.profilePhoto && newData.profilePhoto.length < 10000) ? newData.profilePhoto : null,
        };
        
        const success = SafeStorage.setItem(userDataKey, dataToSave);
        
        if (!success) {
          console.warn('⚠️ Не удалось сохранить данные пользователя в localStorage');
          // Можно показать уведомление пользователю, но приложение продолжит работать
        } else {
          console.log(`✅ Данные пользователя сохранены (${SafeStorage.getStorageSize()})`);
        }
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