import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Открываем базу данных
const dbPath = path.join(__dirname, 'autoauction.db');
const db = new Database(dbPath, { verbose: console.log });

try {
  console.log('🔍 Проверяем пользователей:');
  
  // Проверяем всех пользователей
  const users = db.prepare('SELECT * FROM users').all();
  console.log('📋 Все пользователи:');
  users.forEach(user => {
    console.log(`ID: ${user.id}, Phone: ${user.phone_number}, Email: ${user.email}, Name: ${user.fullName}`);
  });
  
  console.log('\n🔍 Проверяем ставки:');
  
  // Проверяем ставки
  const bids = db.prepare('SELECT * FROM bids ORDER BY listing_id, created_at').all();
  console.log('📋 Все ставки:');
  bids.forEach(bid => {
    console.log(`Listing: ${bid.listing_id}, Bidder: ${bid.bidder_id}, Amount: ${bid.amount}, Time: ${bid.created_at}`);
  });
  
  console.log('\n🔍 Проверяем уведомления:');
  
  // Проверяем уведомления
  const notifications = db.prepare('SELECT * FROM notifications WHERE type = ? ORDER BY created_at DESC LIMIT 10').all('bid_outbid');
  console.log('📋 Последние 10 уведомлений о ставках:');
  notifications.forEach(notif => {
    console.log(`User: ${notif.user_id}, Title: ${notif.title}, Message: ${notif.message}, Read: ${notif.is_read}`);
  });
  
} catch (error) {
  console.error('❌ Ошибка:', error);
} finally {
  db.close();
}