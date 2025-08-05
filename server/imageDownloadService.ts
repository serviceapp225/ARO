import sharp from 'sharp';
import fetch from 'node-fetch';

interface ImageProcessResult {
  data: string; // Base64 data
  type: string; // MIME type
  size: number; // Size in bytes
}

export class ImageDownloadService {
  private static MAX_FILE_SIZE = 500 * 1024; // 500KB maximum
  private static TARGET_WIDTH = 800; // Target width for compression
  private static JPEG_QUALITY = 80; // JPEG quality

  /**
   * Скачивает изображение по URL и сжимает его
   */
  static async downloadAndCompressImage(imageUrl: string): Promise<ImageProcessResult> {
    try {
      console.log(`📥 Скачиваем изображение: ${imageUrl}`);
      
      // Скачиваем изображение
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`📊 Исходный размер: ${Math.round(buffer.length / 1024)}KB`);

      // Определяем MIME тип из заголовков или URL
      let mimeType = response.headers.get('content-type') || 'image/jpeg';
      if (!mimeType.startsWith('image/')) {
        // Пытаемся определить тип по расширению файла
        const urlLowercase = imageUrl.toLowerCase();
        if (urlLowercase.includes('.png')) {
          mimeType = 'image/png';
        } else if (urlLowercase.includes('.webp')) {
          mimeType = 'image/webp';
        } else {
          mimeType = 'image/jpeg';
        }
      }

      // Обрабатываем изображение с помощью Sharp
      let processedImage = sharp(buffer);
      
      // Получаем метаданные изображения
      const metadata = await processedImage.metadata();
      console.log(`🖼️ Размеры изображения: ${metadata.width}x${metadata.height}`);

      // Изменяем размер, если необходимо
      if (metadata.width && metadata.width > this.TARGET_WIDTH) {
        processedImage = processedImage.resize({
          width: this.TARGET_WIDTH,
          height: undefined,
          withoutEnlargement: true,
          fit: 'inside'
        });
        console.log(`📐 Изменяем размер до ширины ${this.TARGET_WIDTH}px`);
      }

      // Сжимаем изображение
      let compressedBuffer: Buffer;
      let finalMimeType: string;

      if (mimeType === 'image/png') {
        // Для PNG используем оптимизацию
        compressedBuffer = await processedImage
          .png({ 
            quality: this.JPEG_QUALITY,
            compressionLevel: 9,
            adaptiveFiltering: true,
            force: false
          })
          .toBuffer();
        finalMimeType = 'image/png';
      } else {
        // Для всех остальных форматов конвертируем в JPEG
        compressedBuffer = await processedImage
          .jpeg({ 
            quality: this.JPEG_QUALITY,
            progressive: true,
            mozjpeg: true
          })
          .toBuffer();
        finalMimeType = 'image/jpeg';
      }

      console.log(`🗜️ Сжатый размер: ${Math.round(compressedBuffer.length / 1024)}KB`);

      // Если размер все еще слишком большой, уменьшаем качество
      if (compressedBuffer.length > this.MAX_FILE_SIZE) {
        console.log(`⚠️ Размер превышает лимит, дополнительное сжатие...`);
        
        let quality = this.JPEG_QUALITY - 20;
        while (compressedBuffer.length > this.MAX_FILE_SIZE && quality > 20) {
          compressedBuffer = await sharp(buffer)
            .resize({
              width: this.TARGET_WIDTH * 0.8, // Дополнительно уменьшаем размер
              height: undefined,
              withoutEnlargement: true,
              fit: 'inside'
            })
            .jpeg({ 
              quality: quality,
              progressive: true,
              mozjpeg: true
            })
            .toBuffer();
          
          quality -= 10;
          console.log(`🔄 Повторное сжатие с качеством ${quality}%: ${Math.round(compressedBuffer.length / 1024)}KB`);
        }
        finalMimeType = 'image/jpeg';
      }

      // Конвертируем в base64
      const base64Data = compressedBuffer.toString('base64');
      
      console.log(`✅ Изображение обработано: ${Math.round(compressedBuffer.length / 1024)}KB, ${finalMimeType}`);

      return {
        data: base64Data,
        type: finalMimeType,
        size: compressedBuffer.length
      };

    } catch (error) {
      console.error(`❌ Ошибка обработки изображения ${imageUrl}:`, error);
      throw new Error(`Не удалось обработать изображение: ${error.message}`);
    }
  }

  /**
   * Конвертирует base64 данные обратно в Buffer для использования
   */
  static base64ToBuffer(base64Data: string): Buffer {
    return Buffer.from(base64Data, 'base64');
  }

  /**
   * Создает data URL из base64 данных и MIME типа
   */
  static createDataUrl(base64Data: string, mimeType: string): string {
    return `data:${mimeType};base64,${base64Data}`;
  }

  /**
   * Проверяет, является ли URL внешним изображением
   */
  static isExternalImageUrl(url: string): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Проверяет, является ли строка base64 данными
   */
  static isBase64Data(data: string): boolean {
    if (!data) return false;
    
    // Проверяем формат data URL
    if (data.startsWith('data:image/')) {
      return true;
    }
    
    // Проверяем формат base64 строки
    try {
      return Buffer.from(data, 'base64').toString('base64') === data;
    } catch {
      return false;
    }
  }
}