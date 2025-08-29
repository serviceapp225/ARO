#!/usr/bin/env node

// Скрипт для проверки подключения к базе данных
// Используется для диагностики в DigitalOcean

import { neon } from '@neondatabase/serverless';

console.log('🔍 Проверка подключения к базе данных...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'установлен' : 'отсутствует');

if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL не найден в переменных окружения');
  process.exit(1);
}

try {
  const sql = neon(process.env.DATABASE_URL);
  
  // Проверяем базовое подключение
  console.log('🔌 Тестируем подключение...');
  const connection = await sql`SELECT current_database(), current_user, version(), now()`;
  
  console.log('✅ Подключение успешно!');
  console.log('📊 Информация о базе данных:');
  console.log('  - База данных:', connection[0].current_database);
  console.log('  - Пользователь:', connection[0].current_user);
  console.log('  - Версия PostgreSQL:', connection[0].version.split(' ')[1]);
  console.log('  - Время сервера:', connection[0].now);
  
  // Проверяем таблицы
  console.log('\n📋 Проверяем структуру базы...');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  
  if (tables.length === 0) {
    console.log('⚠️  Таблицы не найдены - возможно база не инициализирована');
  } else {
    console.log('✅ Найдено таблиц:', tables.length);
    console.log('  Таблицы:', tables.map(t => t.table_name).join(', '));
    
    // Проверяем основные таблицы
    const requiredTables = ['users', 'car_listings', 'bids', 'notifications'];
    const existingTables = tables.map(t => t.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Отсутствуют обязательные таблицы:', missingTables.join(', '));
    } else {
      console.log('✅ Все основные таблицы присутствуют');
    }
    
    // Проверяем данные
    try {
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      const listingCount = await sql`SELECT COUNT(*) as count FROM car_listings`;
      console.log('\n📊 Статистика данных:');
      console.log('  - Пользователей:', userCount[0].count);
      console.log('  - Объявлений:', listingCount[0].count);
    } catch (error) {
      console.log('⚠️  Ошибка при получении статистики:', error.message);
    }
  }
  
  console.log('\n🎉 База данных полностью функциональна!');
  
} catch (error) {
  console.log('❌ Ошибка подключения к базе данных:');
  console.log('  Тип ошибки:', error.constructor.name);
  console.log('  Сообщение:', error.message);
  
  if (error.code) {
    console.log('  Код ошибки:', error.code);
  }
  
  // Специфичные ошибки
  if (error.message.includes('The endpoint has been disabled')) {
    console.log('\n💡 Решение: База данных Neon отключена или превысила лимиты');
    console.log('   1. Проверьте dashboard Neon');
    console.log('   2. Активируйте endpoint или увеличьте лимиты');
    console.log('   3. Или используйте другую базу данных');
  }
  
  if (error.message.includes('client.query is not a function')) {
    console.log('\n💡 Решение: Несовместимость версий Drizzle ORM');
    console.log('   1. Обновите drizzle-orm до последней версии');
    console.log('   2. Убедитесь что @neondatabase/serverless совместим');
  }
  
  process.exit(1);
}