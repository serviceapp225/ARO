// Простой тест миграции фото в файловую систему
import { drizzle } from 'drizzle-orm/node-postgres';
import { carListings } from './shared/schema.js';
import FileStorageManager from './server/fileStorage.js';
import sharp from 'sharp';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);
const fileStorage = new FileStorageManager();

console.log('🚀 Запуск тестовой миграции фотографий...');

async function testMigration() {
  try {
    // Получаем все объявления
    const allListings = await db.select().from(carListings);
    console.log(`📋 Найдено ${allListings.length} объявлений`);
    
    let base64Count = 0;
    let fileSystemCount = 0;
    let noPhotosCount = 0;
    
    for (const listing of allListings) {
      if (!listing.photos || !Array.isArray(listing.photos) || listing.photos.length === 0) {
        noPhotosCount++;
        console.log(`⚪ Объявление ${listing.id}: нет фотографий`);
        continue;
      }
      
      // Проверяем, есть ли base64 фотографии
      const hasBase64Photos = listing.photos.some(photo => 
        typeof photo === 'string' && photo.startsWith('data:image/')
      );
      
      if (hasBase64Photos) {
        base64Count++;
        console.log(`🔵 Объявление ${listing.id}: ${listing.photos.length} base64 фотографий - НУЖНА МИГРАЦИЯ`);
      } else {
        fileSystemCount++;
        console.log(`🟢 Объявление ${listing.id}: ${listing.photos.length} файлов - УЖЕ МИГРИРОВАНО`);
      }
    }
    
    console.log(`\n📊 РЕЗУЛЬТАТ:`);
    console.log(`   Всего объявлений: ${allListings.length}`);
    console.log(`   Уже в файловой системе: ${fileSystemCount}`);
    console.log(`   Нужна миграция (base64): ${base64Count}`);
    console.log(`   Без фотографий: ${noPhotosCount}`);
    
    if (base64Count > 0) {
      console.log(`\n🔄 Нужна миграция для ${base64Count} объявлений`);
    } else {
      console.log(`\n✅ Все фотографии уже мигрированы!`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

testMigration();