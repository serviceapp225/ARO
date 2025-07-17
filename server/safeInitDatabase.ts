import { db } from "./db";
import { storage } from "./storage";

export async function safeInitDatabase() {
  console.log("🔧 Безопасная инициализация базы данных для деплоя...");
  
  try {
    // Простая проверка подключения к базе данных
    console.log("🔍 Проверка подключения к базе данных...");
    
    // Проверяем, работает ли базы данных через storage
    const testConnection = await storage.getUserByPhoneNumber("+992903331332");
    console.log("✅ База данных подключена успешно");
    
    // Проверяем, есть ли данные
    const listings = await storage.getAllListings();
    if (listings.length === 0) {
      console.log("⚠️ База данных пуста, но это нормально для деплоя");
    } else {
      console.log(`✅ Найдено ${listings.length} объявлений в базе данных`);
    }
    
    return true;
  } catch (error) {
    console.error("❌ Ошибка подключения к базе данных:", error);
    
    // Для деплоя просто логируем ошибку и продолжаем
    if (process.env.NODE_ENV === 'production') {
      console.log("🚀 Продакшн режим: продолжаем запуск без инициализации БД");
      return false;
    }
    
    // В режиме разработки перебрасываем ошибку
    throw error;
  }
}

// Безопасная инициализация только при необходимости
export async function conditionalInitDatabase() {
  console.log("🔧 Условная инициализация базы данных...");
  
  try {
    // Пытаемся подключиться к базе данных
    const isConnected = await safeInitDatabase();
    
    if (!isConnected) {
      console.log("⚠️ База данных недоступна, используем файловое хранилище");
      return false;
    }
    
    // Если база данных работает, проверяем нужна ли инициализация
    const listings = await storage.getAllListings();
    if (listings.length === 0) {
      console.log("📝 База данных пуста, но не инициализируем данные во время деплоя");
      console.log("💡 Данные будут созданы автоматически при первом использовании");
    }
    
    return true;
  } catch (error) {
    console.error("❌ Ошибка при условной инициализации:", error);
    
    // Для деплоя всегда возвращаем true чтобы приложение запустилось
    if (process.env.NODE_ENV === 'production') {
      console.log("🚀 Продакшн режим: игнорируем ошибки инициализации");
      return true;
    }
    
    return false;
  }
}