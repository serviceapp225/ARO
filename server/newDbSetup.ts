import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Test different connection strings to find working credentials
async function findWorkingDatabase() {
  // Try with current environment variables
  const testUrls = [
    process.env.DATABASE_URL,
    `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=require`
  ];

  for (const url of testUrls) {
    if (!url) continue;
    
    try {
      console.log('Тестируем подключение к базе данных...');
      const pool = new Pool({ connectionString: url });
      const db = drizzle({ client: pool, schema: {} });
      
      // Test connection
      await db.execute(sql`SELECT 1`);
      
      console.log('✅ Подключение к базе данных успешно!');
      console.log('Создаю таблицы...');
      
      // Create tables
      await createAllTables(db);
      
      // Initialize with sample data
      await initializeWithSampleData(db);
      
      await pool.end();
      return url;
      
    } catch (error) {
      console.log('❌ Подключение неуспешно:', error.message);
      continue;
    }
  }
  
  throw new Error('Не удалось найти рабочее подключение к базе данных');
}

async function createAllTables(db: any) {
  // Create users table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      full_name TEXT,
      role TEXT NOT NULL,
      profile_photo TEXT,
      is_active BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Create car_listings table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS car_listings (
      id SERIAL PRIMARY KEY,
      seller_id INTEGER NOT NULL,
      lot_number TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      mileage INTEGER NOT NULL,
      description TEXT NOT NULL,
      starting_price NUMERIC(12,2) NOT NULL,
      current_bid NUMERIC(12,2),
      photos JSONB NOT NULL,
      auction_duration INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      auction_start_time TIMESTAMP,
      auction_end_time TIMESTAMP,
      customs_cleared BOOLEAN DEFAULT false,
      recycled BOOLEAN DEFAULT false,
      technical_inspection_valid BOOLEAN DEFAULT false,
      technical_inspection_date TEXT,
      tinted BOOLEAN DEFAULT false,
      tinting_date TEXT,
      engine TEXT,
      transmission TEXT,
      fuel_type TEXT,
      body_type TEXT,
      drive_type TEXT,
      color TEXT,
      condition TEXT,
      vin TEXT,
      location TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Create other tables
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS bids (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER NOT NULL,
      bidder_id INTEGER NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      listing_id INTEGER,
      alert_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS car_alerts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      make TEXT NOT NULL,
      model TEXT,
      min_price NUMERIC(12,2),
      max_price NUMERIC(12,2),
      max_year INTEGER,
      min_year INTEGER,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS banners (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      link_url TEXT,
      position TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sell_car_section (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      button_text TEXT NOT NULL,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS advertisement_carousel (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      link_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS alert_views (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      alert_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log('✅ Все таблицы созданы успешно');
}

async function initializeWithSampleData(db: any) {
  // Check if data already exists
  const existingUsers = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
  if (existingUsers[0]?.count > 0) {
    console.log('Данные уже существуют, пропускаем инициализацию');
    return;
  }

  // Create sample users
  await db.execute(sql`
    INSERT INTO users (username, email, role, is_active, full_name) VALUES
    ('admin', 'admin@autoauction.tj', 'admin', true, 'Администратор'),
    ('seller123', 'seller@autoauction.tj', 'seller', true, 'Продавец автомобилей'),
    ('buyer456', 'buyer@autoauction.tj', 'buyer', true, 'Покупатель автомобилей')
  `);

  // Create sample car listings
  const now = new Date();
  const auction1EndTime = new Date('2025-06-30T13:30:00Z');
  const auction2EndTime = new Date('2025-07-01T18:45:00Z');

  await db.execute(sql`
    INSERT INTO car_listings (
      seller_id, lot_number, make, model, year, mileage, vin, description,
      starting_price, current_bid, photos, auction_duration, status,
      auction_start_time, auction_end_time, customs_cleared, recycled,
      technical_inspection_valid, technical_inspection_date, engine,
      transmission, fuel_type, body_type, drive_type, color, condition, location
    ) VALUES (
      2, 'LOT724583', 'Porsche', '911 Turbo S', 2020, 15000, 'WP0AB2A95LS123456',
      'Потрясающий Porsche 911 Turbo S 2020 года - шедевр автомобильной инженерии',
      140000.00, 145500.00, 
      '["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"]',
      72, 'active', NOW(), '2025-06-30T13:30:00Z', true, false, true, '2025-12-31',
      '3.8L Twin-Turbo V6', 'Автомат', 'Бензин', 'Купе', 'Полный привод', 'Черный', 'Отличное', 'Душанбе'
    ), (
      2, 'LOT892456', 'BMW', 'M5 Competition', 2021, 8500, 'WBSJF0C59MCE12345',
      'Исключительный BMW M5 Competition 2021 года в безупречном состоянии',
      85000.00, NULL,
      '["https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"]',
      72, 'active', NOW(), '2025-07-01T18:45:00Z', true, false, true, '2025-11-30',
      '4.4L Twin-Turbo V8', 'Автомат', 'Бензин', 'Седан', 'Задний привод', 'Белый', 'Отличное', 'Душанбе'
    )
  `);

  // Create sample bids
  await db.execute(sql`
    INSERT INTO bids (listing_id, bidder_id, amount) VALUES (1, 3, 145500.00)
  `);

  // Create advertisement carousel
  await db.execute(sql`
    INSERT INTO advertisement_carousel (title, description, image_url, link_url, display_order, is_active) VALUES
    ('Специальные предложения', 'Лучшие автомобили с особыми условиями', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', '/special-offers', 1, true),
    ('Эксклюзивные аукционы', 'Премиум автомобили для истинных ценителей', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', '/exclusive', 2, true)
  `);

  // Create sell car section
  await db.execute(sql`
    INSERT INTO sell_car_section (title, description, button_text, image_url) VALUES
    ('Продайте свой автомобиль', 'Получите лучшую цену за ваш автомобиль на нашем аукционе', 'Начать продажу', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400')
  `);

  console.log('✅ Демонстрационные данные добавлены успешно');
}

// Run the setup
findWorkingDatabase()
  .then(workingUrl => {
    console.log('🎉 База данных настроена успешно!');
    console.log('Рабочий URL:', workingUrl?.substring(0, 50) + '...');
  })
  .catch(error => {
    console.error('❌ Ошибка настройки базы данных:', error.message);
  });