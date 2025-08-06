import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { createHash } from 'crypto';

// Оптимизированная файловая система для 10,000+ автомобилей
export class FileStorageManager {
  private uploadDir = 'uploads';
  private listingsDir = path.join(this.uploadDir, 'listings');
  
  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.listingsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  // Оптимизированная структура папок для 10,000+ автомобилей
  // Используем подпапки для распределения нагрузки
  private getListingPath(listingId: number): string {
    // Разбиваем на подпапки по 1000 объявлений
    // Например: listing 1234 → listings/1000/1234
    const bucket = Math.floor(listingId / 1000) * 1000;
    return path.join(this.listingsDir, bucket.toString(), listingId.toString());
  }

  // Сохранение изображения с оптимизацией
  async saveListingPhoto(
    listingId: number, 
    photoIndex: number, 
    base64Data: string
  ): Promise<string> {
    try {
      const listingPath = this.getListingPath(listingId);
      await fs.mkdir(listingPath, { recursive: true });

      // Убираем data:image/jpeg;base64, префикс
      const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageBuffer = Buffer.from(cleanBase64, 'base64');

      // Оптимизация изображения через Sharp
      const optimizedBuffer = await sharp(imageBuffer)
        .jpeg({ 
          quality: 85, // Хорошее качество с компрессией
          progressive: true 
        })
        .resize(1200, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .toBuffer();

      // Генерируем уникальное имя файла
      const filename = `${photoIndex}.jpg`;
      const filepath = path.join(listingPath, filename);
      
      await fs.writeFile(filepath, optimizedBuffer);
      
      console.log(`📁 Сохранено фото ${filename} для объявления ${listingId} (${(optimizedBuffer.length / 1024).toFixed(1)}KB)`);
      
      return filename;
    } catch (error) {
      console.error(`❌ Ошибка сохранения фото для объявления ${listingId}:`, error);
      throw error;
    }
  }

  // Получение изображения
  async getListingPhoto(listingId: number, filename: string): Promise<Buffer | null> {
    try {
      const listingPath = this.getListingPath(listingId);
      const filepath = path.join(listingPath, filename);
      
      const buffer = await fs.readFile(filepath);
      return buffer;
    } catch (error) {
      console.error(`❌ Фото не найдено: ${listingId}/${filename}`);
      return null;
    }
  }

  // Проверка существования фото
  async photoExists(listingId: number, filename: string): Promise<boolean> {
    try {
      const listingPath = this.getListingPath(listingId);
      const filepath = path.join(listingPath, filename);
      
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  // Удаление всех фото объявления
  async deleteListingPhotos(listingId: number): Promise<void> {
    try {
      const listingPath = this.getListingPath(listingId);
      await fs.rm(listingPath, { recursive: true, force: true });
      console.log(`🗑️ Удалены все фото для объявления ${listingId}`);
    } catch (error) {
      console.error(`❌ Ошибка удаления фото для объявления ${listingId}:`, error);
    }
  }

  // Получение списка всех фото объявления
  async getListingPhotoList(listingId: number): Promise<string[]> {
    try {
      const listingPath = this.getListingPath(listingId);
      const files = await fs.readdir(listingPath);
      
      // Сортируем по номеру фото (1.jpg, 2.jpg, ...)
      return files
        .filter(file => file.endsWith('.jpg'))
        .sort((a, b) => {
          const numA = parseInt(a.split('.')[0]);
          const numB = parseInt(b.split('.')[0]);
          return numA - numB;
        });
    } catch {
      return [];
    }
  }

  // Статистика использования диска
  async getStorageStats() {
    try {
      const stats = await this.calculateDirectorySize(this.listingsDir);
      return {
        totalSizeBytes: stats.totalSize,
        totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
        totalFiles: stats.fileCount,
        averageFileSizeKB: stats.fileCount > 0 ? (stats.totalSize / 1024 / stats.fileCount).toFixed(1) : 0
      };
    } catch (error) {
      console.error('Error calculating storage stats:', error);
      return { totalSizeBytes: 0, totalSizeMB: 0, totalFiles: 0, averageFileSizeKB: 0 };
    }
  }

  private async calculateDirectorySize(dirPath: string): Promise<{ totalSize: number; fileCount: number }> {
    let totalSize = 0;
    let fileCount = 0;

    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          const subStats = await this.calculateDirectorySize(itemPath);
          totalSize += subStats.totalSize;
          fileCount += subStats.fileCount;
        } else {
          totalSize += stat.size;
          fileCount++;
        }
      }
    } catch (error) {
      // Игнорируем ошибки для несуществующих папок
    }

    return { totalSize, fileCount };
  }
}

// Singleton instance
export const fileStorage = new FileStorageManager();