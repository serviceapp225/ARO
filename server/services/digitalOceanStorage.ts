import AWS from 'aws-sdk';
import sharp from 'sharp';
import { createHash } from 'crypto';
import path from 'path';

// DigitalOcean Spaces configuration
export class DigitalOceanStorageService {
  private s3: AWS.S3;
  private bucketName: string;
  private endpoint: string;
  private cdnEndpoint: string;

  constructor() {
    this.bucketName = process.env.DO_SPACES_BUCKET || 'autobid-storage';
    this.endpoint = process.env.DO_SPACES_ENDPOINT || 'ams3.digitaloceanspaces.com';
    this.cdnEndpoint = process.env.DO_SPACES_CDN_ENDPOINT || `https://${this.bucketName}.ams3.cdn.digitaloceanspaces.com`;

    // Configure AWS SDK for DigitalOcean Spaces
    this.s3 = new AWS.S3({
      endpoint: `https://${this.endpoint}`,
      accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
      s3ForcePathStyle: false,
      signatureVersion: 'v4',
      region: 'ams3'
    });
  }

  /**
   * Проверка подключения к DigitalOcean Spaces
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.s3.headBucket({ Bucket: this.bucketName }).promise();
      console.log('✅ Подключение к DigitalOcean Spaces успешно');
      return true;
    } catch (error) {
      console.error('❌ Ошибка подключения к DigitalOcean Spaces:', error);
      return false;
    }
  }

  /**
   * Загрузка изображения автомобиля в Spaces
   */
  async uploadCarImage(
    buffer: Buffer,
    carId: number,
    imageType: 'main' | 'rotation1' | 'rotation2' | 'rotation3' | 'rotation4' = 'main',
    originalName?: string
  ): Promise<string> {
    try {
      // Оптимизация изображения
      const optimizedBuffer = await sharp(buffer)
        .resize(1200, 900, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true
        })
        .toBuffer();

      // Генерация уникального имени файла
      const hash = createHash('md5').update(buffer).digest('hex');
      const extension = originalName ? path.extname(originalName) : '.jpg';
      const fileName = `cars/${carId}/${imageType}_${hash}${extension}`;

      // Загрузка в Spaces
      const uploadResult = await this.s3.upload({
        Bucket: this.bucketName,
        Key: fileName,
        Body: optimizedBuffer,
        ACL: 'public-read',
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000', // 1 год кеширования
        Metadata: {
          carId: carId.toString(),
          imageType,
          originalName: originalName || 'unknown',
          uploadDate: new Date().toISOString()
        }
      }).promise();

      console.log(`✅ Изображение загружено в Spaces: ${fileName}`);
      return `${this.cdnEndpoint}/${fileName}`;
    } catch (error) {
      console.error('❌ Ошибка загрузки изображения в Spaces:', error);
      throw error;
    }
  }

  /**
   * Загрузка изображения баннера в Spaces
   */
  async uploadBannerImage(buffer: Buffer, bannerId: number, originalName?: string): Promise<string> {
    try {
      // Оптимизация баннера
      const optimizedBuffer = await sharp(buffer)
        .resize(1920, 600, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 90,
          progressive: true
        })
        .toBuffer();

      const hash = createHash('md5').update(buffer).digest('hex');
      const extension = originalName ? path.extname(originalName) : '.jpg';
      const fileName = `banners/${bannerId}_${hash}${extension}`;

      const uploadResult = await this.s3.upload({
        Bucket: this.bucketName,
        Key: fileName,
        Body: optimizedBuffer,
        ACL: 'public-read',
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=86400', // 24 часа кеширования для баннеров
        Metadata: {
          bannerId: bannerId.toString(),
          originalName: originalName || 'unknown',
          uploadDate: new Date().toISOString()
        }
      }).promise();

      console.log(`✅ Баннер загружен в Spaces: ${fileName}`);
      return `${this.cdnEndpoint}/${fileName}`;
    } catch (error) {
      console.error('❌ Ошибка загрузки баннера в Spaces:', error);
      throw error;
    }
  }

  /**
   * Удаление файла из Spaces
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Извлекаем ключ файла из URL
      const key = fileUrl.replace(`${this.cdnEndpoint}/`, '');
      
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();

      console.log(`✅ Файл удален из Spaces: ${key}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка удаления файла из Spaces:', error);
      return false;
    }
  }

  /**
   * Получение списка файлов автомобиля
   */
  async getCarImages(carId: number): Promise<string[]> {
    try {
      const result = await this.s3.listObjectsV2({
        Bucket: this.bucketName,
        Prefix: `cars/${carId}/`
      }).promise();

      const imageUrls = result.Contents?.map(object => 
        `${this.cdnEndpoint}/${object.Key}`
      ) || [];

      return imageUrls;
    } catch (error) {
      console.error('❌ Ошибка получения списка изображений:', error);
      return [];
    }
  }

  /**
   * Генерация подписанного URL для загрузки
   */
  async generateUploadUrl(carId: number, imageType: string): Promise<string> {
    try {
      const fileName = `cars/${carId}/${imageType}_${Date.now()}.jpg`;
      
      const signedUrl = await this.s3.getSignedUrlPromise('putObject', {
        Bucket: this.bucketName,
        Key: fileName,
        ContentType: 'image/jpeg',
        Expires: 300, // 5 минут
        ACL: 'public-read'
      });

      return signedUrl;
    } catch (error) {
      console.error('❌ Ошибка генерации подписанного URL:', error);
      throw error;
    }
  }

  /**
   * Миграция существующих изображений из локального хранения в Spaces
   */
  async migrateImagesFromLocal(sourceDir: string): Promise<void> {
    console.log('🚀 Начинаем миграцию изображений в DigitalOcean Spaces...');
    // Эта функция будет реализована для миграции существующих изображений
    // из локального хранения в Spaces при деплое на VPS
  }
}

// Экспорт singleton instance
export const digitalOceanStorage = new DigitalOceanStorageService();