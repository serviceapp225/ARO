#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, readFileSync, statSync } from 'fs';
import { digitalOceanStorage } from '../services/digitalOceanStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Путь к директории с изображениями
const IMAGES_DIR = join(__dirname, '../../uploads');

async function migrateImages() {
  console.log('🚀 Начинаем миграцию изображений в DigitalOcean Spaces...');
  
  try {
    // Тест подключения к Spaces
    const isConnected = await digitalOceanStorage.testConnection();
    if (!isConnected) {
      console.error('❌ Не удалось подключиться к DigitalOcean Spaces');
      process.exit(1);
    }

    // Получение списка файлов для миграции
    const imageFiles = getImageFiles(IMAGES_DIR);
    console.log(`📁 Найдено ${imageFiles.length} изображений для миграции`);

    let migrated = 0;
    let errors = 0;

    for (const file of imageFiles) {
      try {
        console.log(`📤 Загружаем: ${file.name}`);
        
        // Читаем файл
        const buffer = readFileSync(file.path);
        
        // Определяем тип изображения по имени файла
        const { carId, imageType } = parseFileName(file.name);
        
        if (carId && imageType) {
          // Загружаем изображение автомобиля
          const url = await digitalOceanStorage.uploadCarImage(
            buffer, 
            carId, 
            imageType, 
            file.name
          );
          console.log(`✅ Загружено: ${file.name} → ${url}`);
          migrated++;
        } else if (file.name.includes('banner')) {
          // Загружаем баннер
          const bannerId = extractBannerId(file.name);
          const url = await digitalOceanStorage.uploadBannerImage(
            buffer, 
            bannerId, 
            file.name
          );
          console.log(`✅ Баннер загружен: ${file.name} → ${url}`);
          migrated++;
        } else {
          console.warn(`⚠️ Пропущен файл (неизвестный формат): ${file.name}`);
        }
        
        // Небольшая пауза между загрузками
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Ошибка загрузки ${file.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Результаты миграции:');
    console.log(`✅ Успешно загружено: ${migrated}`);
    console.log(`❌ Ошибок: ${errors}`);
    console.log(`📁 Всего файлов: ${imageFiles.length}`);
    
    if (errors === 0) {
      console.log('🎉 Миграция завершена успешно!');
    } else {
      console.log('⚠️ Миграция завершена с ошибками');
    }

  } catch (error) {
    console.error('❌ Критическая ошибка миграции:', error);
    process.exit(1);
  }
}

function getImageFiles(dir) {
  const files = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stats = statSync(fullPath);
      
      if (stats.isFile() && isImageFile(item)) {
        files.push({
          name: item,
          path: fullPath,
          size: stats.size
        });
      } else if (stats.isDirectory()) {
        // Рекурсивно обходим подпапки
        files.push(...getImageFiles(fullPath));
      }
    }
  } catch (error) {
    console.warn(`⚠️ Не удалось прочитать директорию ${dir}:`, error.message);
  }
  
  return files;
}

function isImageFile(fileName) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

function parseFileName(fileName) {
  // Примеры форматов:
  // car_123_main.jpg
  // car_123_rotation1.jpg
  // listing_456_rotation2.png
  
  const patterns = [
    /^car_(\d+)_(main|rotation[1-4])\./, 
    /^listing_(\d+)_(main|rotation[1-4])\./, 
    /^(\d+)_(main|rotation[1-4])\./, 
  ];
  
  for (const pattern of patterns) {
    const match = fileName.match(pattern);
    if (match) {
      return {
        carId: parseInt(match[1]),
        imageType: match[2]
      };
    }
  }
  
  return { carId: null, imageType: null };
}

function extractBannerId(fileName) {
  const match = fileName.match(/banner_(\d+)/);
  return match ? parseInt(match[1]) : 1;
}

// Запуск миграции если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateImages();
}

export { migrateImages };