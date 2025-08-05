import { db } from './db.js';
import { banners, advertisementCarousel, sellCarBanner } from '../shared/schema.js';
import { ImageDownloadService } from './imageDownloadService.js';
import { eq } from 'drizzle-orm';

export class ImageUpdateService {
  /**
   * Обновляет все изображения в таблице banners
   */
  static async updateBannersImages(): Promise<void> {
    console.log('🔄 Начинаем обновление изображений баннеров...');
    
    try {
      const bannersData = await db.select().from(banners);
      
      for (const banner of bannersData) {
        if (!banner.imageData && banner.imageUrl && ImageDownloadService.isExternalImageUrl(banner.imageUrl)) {
          console.log(`📥 Скачиваем изображение для баннера ID ${banner.id}: ${banner.imageUrl}`);
          
          try {
            const imageResult = await ImageDownloadService.downloadAndCompressImage(banner.imageUrl);
            
            await db.update(banners)
              .set({
                imageData: imageResult.data,
                imageType: imageResult.type
              })
              .where(eq(banners.id, banner.id));
            
            console.log(`✅ Изображение обновлено для баннера ID ${banner.id}`);
          } catch (error) {
            console.error(`❌ Ошибка обновления изображения для баннера ID ${banner.id}:`, error.message);
          }
        }
      }
      
      console.log('✅ Обновление изображений баннеров завершено');
    } catch (error) {
      console.error('❌ Ошибка при обновлении изображений баннеров:', error);
    }
  }

  /**
   * Обновляет все изображения в таблице карусели рекламы
   */
  static async updateAdvertisementCarouselImages(): Promise<void> {
    console.log('🔄 Начинаем обновление изображений карусели рекламы...');
    
    try {
      const carouselData = await db.select().from(advertisementCarousel);
      
      for (const item of carouselData) {
        const updates: any = {};
        
        // Основное изображение
        if (!item.imageData && item.imageUrl && ImageDownloadService.isExternalImageUrl(item.imageUrl)) {
          console.log(`📥 Скачиваем основное изображение для карусели ID ${item.id}: ${item.imageUrl}`);
          
          try {
            const imageResult = await ImageDownloadService.downloadAndCompressImage(item.imageUrl);
            updates.imageData = imageResult.data;
            updates.imageType = imageResult.type;
            console.log(`✅ Основное изображение обновлено для карусели ID ${item.id}`);
          } catch (error) {
            console.error(`❌ Ошибка обновления основного изображения для карусели ID ${item.id}:`, error.message);
          }
        }

        // Ротационные изображения
        const rotationImages = [
          { url: item.rotationImage1, dataField: 'rotationImage1Data', typeField: 'rotationImage1Type', index: 1 },
          { url: item.rotationImage2, dataField: 'rotationImage2Data', typeField: 'rotationImage2Type', index: 2 },
          { url: item.rotationImage3, dataField: 'rotationImage3Data', typeField: 'rotationImage3Type', index: 3 },
          { url: item.rotationImage4, dataField: 'rotationImage4Data', typeField: 'rotationImage4Type', index: 4 }
        ];

        for (const rotImg of rotationImages) {
          const currentData = item[rotImg.dataField as keyof typeof item] as string;
          
          if (!currentData && rotImg.url && ImageDownloadService.isExternalImageUrl(rotImg.url)) {
            console.log(`📥 Скачиваем ротационное изображение ${rotImg.index} для карусели ID ${item.id}: ${rotImg.url}`);
            
            try {
              const imageResult = await ImageDownloadService.downloadAndCompressImage(rotImg.url);
              updates[rotImg.dataField] = imageResult.data;
              updates[rotImg.typeField] = imageResult.type;
              console.log(`✅ Ротационное изображение ${rotImg.index} обновлено для карусели ID ${item.id}`);
            } catch (error) {
              console.error(`❌ Ошибка обновления ротационного изображения ${rotImg.index} для карусели ID ${item.id}:`, error.message);
            }
          }
        }

        // Применяем обновления, если есть
        if (Object.keys(updates).length > 0) {
          await db.update(advertisementCarousel)
            .set(updates)
            .where(eq(advertisementCarousel.id, item.id));
        }
      }
      
      console.log('✅ Обновление изображений карусели рекламы завершено');
    } catch (error) {
      console.error('❌ Ошибка при обновлении изображений карусели рекламы:', error);
    }
  }

  /**
   * Обновляет все изображения в таблице баннера продажи авто
   */
  static async updateSellCarBannerImages(): Promise<void> {
    console.log('🔄 Начинаем обновление изображений баннера продажи авто...');
    
    try {
      const sellCarData = await db.select().from(sellCarBanner);
      
      for (const item of sellCarData) {
        const updates: any = {};
        
        // Фоновое изображение
        if (!item.backgroundImageData && item.backgroundImageUrl && ImageDownloadService.isExternalImageUrl(item.backgroundImageUrl)) {
          console.log(`📥 Скачиваем фоновое изображение для баннера продажи ID ${item.id}: ${item.backgroundImageUrl}`);
          
          try {
            const imageResult = await ImageDownloadService.downloadAndCompressImage(item.backgroundImageUrl);
            updates.backgroundImageData = imageResult.data;
            updates.backgroundImageType = imageResult.type;
            console.log(`✅ Фоновое изображение обновлено для баннера продажи ID ${item.id}`);
          } catch (error) {
            console.error(`❌ Ошибка обновления фонового изображения для баннера продажи ID ${item.id}:`, error.message);
          }
        }

        // Ротационные изображения
        const rotationImages = [
          { url: item.rotationImage1, dataField: 'rotationImage1Data', typeField: 'rotationImage1Type', index: 1 },
          { url: item.rotationImage2, dataField: 'rotationImage2Data', typeField: 'rotationImage2Type', index: 2 },
          { url: item.rotationImage3, dataField: 'rotationImage3Data', typeField: 'rotationImage3Type', index: 3 },
          { url: item.rotationImage4, dataField: 'rotationImage4Data', typeField: 'rotationImage4Type', index: 4 }
        ];

        for (const rotImg of rotationImages) {
          const currentData = item[rotImg.dataField as keyof typeof item] as string;
          
          if (!currentData && rotImg.url && ImageDownloadService.isExternalImageUrl(rotImg.url)) {
            console.log(`📥 Скачиваем ротационное изображение ${rotImg.index} для баннера продажи ID ${item.id}: ${rotImg.url}`);
            
            try {
              const imageResult = await ImageDownloadService.downloadAndCompressImage(rotImg.url);
              updates[rotImg.dataField] = imageResult.data;
              updates[rotImg.typeField] = imageResult.type;
              console.log(`✅ Ротационное изображение ${rotImg.index} обновлено для баннера продажи ID ${item.id}`);
            } catch (error) {
              console.error(`❌ Ошибка обновления ротационного изображения ${rotImg.index} для баннера продажи ID ${item.id}:`, error.message);
            }
          }
        }

        // Применяем обновления, если есть
        if (Object.keys(updates).length > 0) {
          await db.update(sellCarBanner)
            .set(updates)
            .where(eq(sellCarBanner.id, item.id));
        }
      }
      
      console.log('✅ Обновление изображений баннера продажи авто завершено');
    } catch (error) {
      console.error('❌ Ошибка при обновлении изображений баннера продажи авто:', error);
    }
  }

  /**
   * Обновляет все изображения во всех таблицах
   */
  static async updateAllImages(): Promise<void> {
    console.log('🚀 Запуск полного обновления всех изображений...');
    
    await this.updateBannersImages();
    await this.updateAdvertisementCarouselImages();
    await this.updateSellCarBannerImages();
    
    console.log('🎉 Полное обновление всех изображений завершено!');
  }

  /**
   * Инициализация автоматического обновления при запуске сервера
   */
  static async initializeOnStartup(): Promise<void> {
    console.log('🔧 Инициализация системы автоматического скачивания изображений...');
    
    // Запуск с небольшой задержкой, чтобы дать серверу время запуститься
    setTimeout(async () => {
      try {
        await this.updateAllImages();
      } catch (error) {
        console.error('❌ Ошибка при инициализации обновления изображений:', error);
      }
    }, 5000); // 5 секунд задержки
  }
}