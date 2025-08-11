import { spacesService } from './spacesService';
import { db } from './db';
import { carListings } from '../shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

/**
 * Скрипт миграции всех локальных изображений в DigitalOcean Spaces
 */
export async function migrateImagesToSpaces() {
  console.log('🚀 SPACES MIGRATION: Начинаем миграцию изображений в DigitalOcean Spaces');

  try {
    // Проверяем доступность Spaces
    const spacesAvailable = await spacesService.healthCheck();
    if (!spacesAvailable) {
      throw new Error('DigitalOcean Spaces недоступен. Проверьте конфигурацию.');
    }

    console.log('✅ SPACES: Подключение к DigitalOcean Spaces успешно');

    // Получаем все объявления из базы данных
    const listings = await db.select().from(carListings);
    console.log(`📊 ДАННЫЕ: Найдено ${listings.length} объявлений для проверки`);

    let migratedListings = 0;
    let totalMigratedImages = 0;
    const errors: string[] = [];

    for (const listing of listings) {
      try {
        console.log(`\n📋 ОБРАБОТКА: Объявление ${listing.id} - ${listing.make} ${listing.model}`);
        
        // Проверяем есть ли локальные изображения для данного объявления
        const uploadDir = path.join(process.cwd(), 'uploads', 'listings', 
          Math.floor(listing.id / 1000) * 1000 + '', listing.id.toString());
        
        if (!fs.existsSync(uploadDir)) {
          console.log(`⏭️ ПРОПУСК: Локальная директория не найдена для объявления ${listing.id}`);
          continue;
        }

        const imageFiles = fs.readdirSync(uploadDir).filter(file => 
          /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
        );

        if (imageFiles.length === 0) {
          console.log(`⏭️ ПРОПУСК: Изображения не найдены для объявления ${listing.id}`);
          continue;
        }

        console.log(`📸 ИЗОБРАЖЕНИЯ: Найдено ${imageFiles.length} файлов для миграции`);

        const spacesUrls: string[] = [];
        let listingImageCount = 0;

        for (const imageFile of imageFiles) {
          try {
            const localPath = path.join(uploadDir, imageFile);
            const spacesKey = `listings/${listing.id}/${imageFile}`;
            
            console.log(`📤 ЗАГРУЗКА: ${localPath} → spaces://${spacesKey}`);
            
            const spacesUrl = await spacesService.uploadFile(localPath, spacesKey);
            spacesUrls.push(spacesUrl);
            listingImageCount++;
            totalMigratedImages++;

            console.log(`✅ УСПЕХ: ${imageFile} загружен в Spaces`);
          } catch (imageError) {
            const errorMsg = `Ошибка загрузки ${imageFile} для объявления ${listing.id}: ${imageError}`;
            console.error(`❌ ${errorMsg}`);
            errors.push(errorMsg);
          }
        }

        if (spacesUrls.length > 0) {
          // Обновляем объявление с URL-ами из Spaces
          // Сохраняем URL-ы в поле photos как массив строк
          await db.update(carListings)
            .set({ 
              photos: spacesUrls,
              updatedAt: new Date()
            })
            .where(eq(carListings.id, listing.id));

          console.log(`💾 БАЗА ДАННЫХ: Обновлено объявление ${listing.id} с ${spacesUrls.length} URL-ами Spaces`);
          migratedListings++;
        }

      } catch (listingError) {
        const errorMsg = `Ошибка обработки объявления ${listing.id}: ${listingError}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    // Финальная статистика
    console.log('\n📊 МИГРАЦИЯ ЗАВЕРШЕНА:');
    console.log(`✅ Объявления обновлены: ${migratedListings}`);
    console.log(`✅ Изображения перенесены: ${totalMigratedImages}`);
    
    if (errors.length > 0) {
      console.log(`❌ Ошибки: ${errors.length}`);
      errors.forEach(error => console.log(`  - ${error}`));
    }

    // Очистка локального кэша после успешной миграции
    if (migratedListings > 0) {
      console.log('\n🧹 ОЧИСТКА: Рекомендуется очистить локальные изображения после проверки');
      console.log('Для очистки выполните: rm -rf uploads/listings/*');
    }

    return {
      migratedListings,
      totalMigratedImages,
      errors: errors.length
    };

  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА миграции в Spaces:', error);
    throw error;
  }
}

// Функция для очистки локальных изображений после успешной миграции
export async function cleanupLocalImages() {
  const uploadsPath = path.join(process.cwd(), 'uploads', 'listings');
  
  if (fs.existsSync(uploadsPath)) {
    console.log('🧹 ОЧИСТКА: Удаляем локальные изображения...');
    fs.rmSync(uploadsPath, { recursive: true, force: true });
    console.log('✅ ОЧИСТКА: Локальные изображения удалены');
  }
}

// Если запущен напрямую
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  migrateImagesToSpaces()
    .then(result => {
      console.log('\n🎉 Миграция завершена успешно!', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Миграция провалилась:', error);
      process.exit(1);
    });
}