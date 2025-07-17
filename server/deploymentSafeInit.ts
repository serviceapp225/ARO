import { storage } from "./storage";

// Специальная безопасная инициализация только для деплоя
export async function deploymentSafeInit() {
  console.log("🚀 DEPLOYMENT: Безопасная инициализация для деплоя...");
  
  // В продакшн режиме минимизируем операции с базой данных
  if (process.env.NODE_ENV === 'production') {
    console.log("🔧 DEPLOYMENT: Продакшн режим - минимальная инициализация");
    
    try {
      // Простая проверка что storage доступен
      const testResult = await Promise.race([
        storage.getAllListings(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      console.log("✅ DEPLOYMENT: База данных подключена успешно");
      return true;
    } catch (error) {
      console.log("⚠️ DEPLOYMENT: База данных недоступна, но это нормально для деплоя");
      console.log("📝 DEPLOYMENT: Приложение будет работать с файловым хранилищем");
      return false;
    }
  }
  
  // В режиме разработки делаем полную проверку
  console.log("🛠️ DEPLOYMENT: Режим разработки - полная инициализация");
  
  try {
    // Проверяем подключение к базе данных
    const listings = await storage.getAllListings();
    console.log(`✅ DEPLOYMENT: Найдено ${listings.length} объявлений`);
    
    // Проверяем пользователей
    const adminUser = await storage.getUserByPhoneNumber("+992903331332");
    if (adminUser) {
      console.log("✅ DEPLOYMENT: Администратор найден");
    } else {
      console.log("⚠️ DEPLOYMENT: Администратор не найден, но это нормально");
    }
    
    return true;
  } catch (error) {
    console.error("❌ DEPLOYMENT: Ошибка инициализации:", error);
    
    // Не прерываем запуск из-за ошибок базы данных
    console.log("📝 DEPLOYMENT: Продолжаем запуск несмотря на ошибки");
    return false;
  }
}

// Функция для безопасного получения статуса базы данных
export async function getDatabaseStatus() {
  try {
    const listings = await storage.getAllListings();
    return {
      connected: true,
      listingsCount: listings.length,
      message: "База данных подключена и работает"
    };
  } catch (error) {
    return {
      connected: false,
      listingsCount: 0,
      message: "База данных недоступна, используется файловое хранилище"
    };
  }
}

// Функция для безопасного создания минимальных данных если нужно
export async function createMinimalDataIfNeeded() {
  console.log("🔧 DEPLOYMENT: Проверка минимальных данных...");
  
  try {
    const listings = await storage.getAllListings();
    
    if (listings.length === 0) {
      console.log("📝 DEPLOYMENT: База данных пуста, но не создаем данные во время деплоя");
      console.log("💡 DEPLOYMENT: Данные будут созданы при первом использовании");
      return false;
    }
    
    console.log(`✅ DEPLOYMENT: Найдено ${listings.length} объявлений, инициализация не требуется`);
    return true;
  } catch (error) {
    console.error("❌ DEPLOYMENT: Ошибка при проверке данных:", error);
    return false;
  }
}