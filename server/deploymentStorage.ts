import { storage as devStorage } from './storage';
import { db } from './db';
import { 
  users, 
  carListings, 
  bids, 
  favorites, 
  conversations, 
  messages, 
  notifications, 
  carAlerts, 
  banners, 
  documents,
  alertViews 
} from '../shared/schema';

/**
 * Функция для миграции данных из SQLite в PostgreSQL
 * Используется при развертывании приложения
 */
export async function migrateToPostgreSQL() {
  console.log('🔄 Начинаем миграцию данных в PostgreSQL...');

  try {
    // Получаем все данные из SQLite
    const allUsers = await devStorage.getUsers();
    const allListings = await devStorage.getListings();
    const allBids = await devStorage.getBids();
    const allFavorites = await devStorage.getFavorites();
    const allConversations = await devStorage.getConversations();
    const allMessages = await devStorage.getMessages();
    const allNotifications = await devStorage.getNotifications();
    const allCarAlerts = await devStorage.getCarAlerts();
    const allBanners = await devStorage.getBanners();
    const allDocuments = await devStorage.getDocuments();

    console.log(`📊 Данные для миграции:
      - Пользователи: ${allUsers.length}
      - Объявления: ${allListings.length}
      - Ставки: ${allBids.length}
      - Избранное: ${allFavorites.length}
      - Диалоги: ${allConversations.length}
      - Сообщения: ${allMessages.length}
      - Уведомления: ${allNotifications.length}
      - Алерты: ${allCarAlerts.length}
      - Баннеры: ${allBanners.length}
      - Документы: ${allDocuments.length}`);

    // Создаем таблицы в PostgreSQL
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        phone_number TEXT,
        uid TEXT UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        invited_by INTEGER,
        is_invited BOOLEAN DEFAULT FALSE,
        role TEXT DEFAULT 'buyer',
        full_name TEXT,
        username TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS car_listings (
        id SERIAL PRIMARY KEY,
        lot_number TEXT UNIQUE NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        fuel_type TEXT,
        engine_size TEXT,
        transmission TEXT,
        condition TEXT,
        mileage TEXT,
        location TEXT,
        description TEXT,
        photos TEXT,
        starting_price INTEGER NOT NULL,
        current_bid INTEGER DEFAULT 0,
        buy_now_price INTEGER,
        auction_start_date TIMESTAMP,
        auction_end_date TIMESTAMP,
        status TEXT DEFAULT 'active',
        seller_id INTEGER,
        electric_range INTEGER,
        battery_capacity INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Вставляем данные в PostgreSQL
    if (allUsers.length > 0) {
      await db.insert(users).values(allUsers);
      console.log('✅ Пользователи мигрированы');
    }

    if (allListings.length > 0) {
      await db.insert(carListings).values(allListings);
      console.log('✅ Объявления мигрированы');
    }

    if (allBids.length > 0) {
      await db.insert(bids).values(allBids);
      console.log('✅ Ставки мигрированы');
    }

    if (allFavorites.length > 0) {
      await db.insert(favorites).values(allFavorites);
      console.log('✅ Избранное мигрировано');
    }

    if (allConversations.length > 0) {
      await db.insert(conversations).values(allConversations);
      console.log('✅ Диалоги мигрированы');
    }

    if (allMessages.length > 0) {
      await db.insert(messages).values(allMessages);
      console.log('✅ Сообщения мигрированы');
    }

    if (allNotifications.length > 0) {
      await db.insert(notifications).values(allNotifications);
      console.log('✅ Уведомления мигрированы');
    }

    if (allCarAlerts.length > 0) {
      await db.insert(carAlerts).values(allCarAlerts);
      console.log('✅ Алерты мигрированы');
    }

    if (allBanners.length > 0) {
      await db.insert(banners).values(allBanners);
      console.log('✅ Баннеры мигрированы');
    }

    if (allDocuments.length > 0) {
      await db.insert(documents).values(allDocuments);
      console.log('✅ Документы мигрированы');
    }

    console.log('🎉 Миграция в PostgreSQL завершена успешно!');
    return true;

  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    return false;
  }
}

/**
 * Проверяет, нужна ли миграция
 */
export async function checkMigrationNeeded(): Promise<boolean> {
  try {
    const result = await db.select().from(users).limit(1);
    return result.length === 0; // Если нет пользователей, нужна миграция
  } catch (error) {
    console.log('База данных PostgreSQL не готова, используем SQLite');
    return false;
  }
}