import { pool } from './db';

export async function initializeSqliteWithSampleData() {
  try {
    console.log('Initializing SQLite database with sample data...');
    
    // Check if data already exists
    const existingUsers = pool.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (existingUsers.count > 0) {
      console.log('Database already has sample data, skipping initialization');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const auction1EndTime = Math.floor(new Date('2025-06-25T10:15:00Z').getTime() / 1000);
    const auction2EndTime = Math.floor(new Date('2025-06-26T16:45:00Z').getTime() / 1000);

    // Insert sample users
    pool.prepare(`
      INSERT INTO users (email, password_hash, username, phone_number, full_name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'admin@autobid.tj',
      '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      'admin',
      '+992000000001',
      'Администратор Системы',
      'admin',
      1,
      now
    );

    pool.prepare(`
      INSERT INTO users (email, password_hash, username, phone_number, full_name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'seller@autobid.tj',
      '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      'seller',
      '+992000000002',
      'Продавец Автомобилей',
      'seller',
      1,
      now
    );

    pool.prepare(`
      INSERT INTO users (email, password_hash, username, phone_number, full_name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'buyer@autobid.tj',
      '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      'buyer',
      '+992000000003',
      'Покупатель Автомобилей',
      'buyer',
      1,
      now
    );

    // Insert sample car listings
    pool.prepare(`
      INSERT INTO car_listings (
        sellerId, lotNumber, make, model, year, mileage, description, startingPrice, currentBid,
        photos, auctionDuration, status, auctionStartTime, auctionEndTime, endTime,
        customsCleared, recycled, technicalInspectionValid, condition, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      2, // seller user ID
      'LOT724583',
      'Porsche',
      '911 Turbo S',
      2020,
      15000,
      'This stunning 2020 Porsche 911 Turbo S is a true masterpiece of automotive engineering.',
      '140000.00',
      '145500.00',
      JSON.stringify([
        'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      ]),
      72,
      'active',
      now,
      auction1EndTime,
      auction1EndTime,
      1,
      0,
      1,
      'excellent',
      now
    );

    pool.prepare(`
      INSERT INTO car_listings (
        sellerId, lotNumber, make, model, year, mileage, description, startingPrice, currentBid,
        photos, auctionDuration, status, auctionStartTime, auctionEndTime, endTime,
        customsCleared, recycled, technicalInspectionValid, condition, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      2, // seller user ID
      'LOT856291',
      'Mercedes-Benz',
      'S-Class AMG S63',
      2021,
      8500,
      'Luxurious 2021 Mercedes-Benz S-Class AMG S63 with premium features.',
      '95000.00',
      '98000.00',
      JSON.stringify([
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'
      ]),
      48,
      'active',
      now,
      auction2EndTime,
      auction2EndTime,
      1,
      0,
      1,
      'excellent',
      now
    );

    // Insert sample banners
    pool.prepare(`
      INSERT INTO banners (title, subtitle, description, buttonText, buttonUrl, position, isActive, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Добро пожаловать в AutoBid!',
      'Лучшая платформа для автомобильных аукционов в Таджикистане',
      'Найдите автомобиль своей мечты или продайте свой по лучшей цене',
      'Начать торги',
      '/auctions',
      'hero',
      1,
      now
    );

    // Insert sell car section
    pool.prepare(`
      INSERT INTO sell_car_section (title, subtitle, description, buttonText, buttonUrl, isActive, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Продайте свой автомобиль',
      'Получите лучшую цену за ваш автомобиль',
      'Простой и безопасный способ продать автомобиль через аукцион',
      'Подать заявку',
      '/sell',
      1,
      now
    );

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error initializing database with sample data:', error);
    throw error;
  }
}