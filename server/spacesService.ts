import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export class SpacesService {
  private s3: AWS.S3;
  private bucket: string;

  constructor() {
    // Настройка DigitalOcean Spaces
    const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT || 'ams3.digitaloceanspaces.com');
    
    this.s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: process.env.SPACES_KEY,
      secretAccessKey: process.env.SPACES_SECRET,
      region: process.env.SPACES_REGION || 'ams3',
      s3ForcePathStyle: false, // Для совместимости с DigitalOcean Spaces
      signatureVersion: 'v4'
    });

    this.bucket = process.env.SPACES_BUCKET || 'autobid-storage';
  }

  /**
   * Загружает файл в DigitalOcean Spaces
   * @param filePath - Путь к локальному файлу
   * @param key - Ключ (путь) в Spaces
   * @param contentType - MIME тип файла
   * @returns URL загруженного файла
   */
  async uploadFile(filePath: string, key: string, contentType?: string): Promise<string> {
    try {
      const fileContent = await readFile(filePath);
      
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: key,
        Body: fileContent,
        ContentType: contentType || this.getMimeType(filePath),
        ACL: 'public-read' // Публичный доступ для изображений
      };

      const result = await this.s3.upload(params).promise();
      console.log(`✅ Файл успешно загружен в Spaces: ${result.Location}`);
      return result.Location;
    } catch (error) {
      console.error(`❌ Ошибка загрузки файла в Spaces:`, error);
      throw error;
    }
  }

  /**
   * Загружает буфер в DigitalOcean Spaces
   * @param buffer - Буфер данных
   * @param key - Ключ (путь) в Spaces
   * @param contentType - MIME тип файла
   * @returns URL загруженного файла
   */
  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read'
      };

      const result = await this.s3.upload(params).promise();
      console.log(`✅ Буфер успешно загружен в Spaces: ${result.Location}`);
      return result.Location;
    } catch (error) {
      console.error(`❌ Ошибка загрузки буфера в Spaces:`, error);
      throw error;
    }
  }

  /**
   * Скачивает файл из DigitalOcean Spaces
   * @param key - Ключ файла в Spaces
   * @returns Буфер файла
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const params: AWS.S3.GetObjectRequest = {
        Bucket: this.bucket,
        Key: key
      };

      const result = await this.s3.getObject(params).promise();
      return result.Body as Buffer;
    } catch (error) {
      console.error(`❌ Ошибка скачивания файла из Spaces:`, error);
      throw error;
    }
  }

  /**
   * Удаляет файл из DigitalOcean Spaces
   * @param key - Ключ файла в Spaces
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const params: AWS.S3.DeleteObjectRequest = {
        Bucket: this.bucket,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
      console.log(`✅ Файл успешно удален из Spaces: ${key}`);
    } catch (error) {
      console.error(`❌ Ошибка удаления файла из Spaces:`, error);
      throw error;
    }
  }

  /**
   * Создает presigned URL для загрузки файла
   * @param key - Ключ файла в Spaces
   * @param expires - Время действия URL в секундах (по умолчанию 3600)
   * @returns Presigned URL
   */
  async getSignedUrl(key: string, expires: number = 3600): Promise<string> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: expires
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      console.error(`❌ Ошибка создания signed URL:`, error);
      throw error;
    }
  }

  /**
   * Миграция локальных файлов в Spaces
   * @param localDir - Локальная директория
   * @param spacesDir - Директория в Spaces
   */
  async migrateDirectory(localDir: string, spacesDir: string): Promise<string[]> {
    const uploadedFiles: string[] = [];

    try {
      const files = this.getAllFiles(localDir);
      
      for (const filePath of files) {
        const relativePath = path.relative(localDir, filePath);
        const spacesKey = path.join(spacesDir, relativePath).replace(/\\/g, '/'); // Нормализуем пути для Unix
        
        console.log(`📤 Мигрируем: ${filePath} → ${spacesKey}`);
        const url = await this.uploadFile(filePath, spacesKey);
        uploadedFiles.push(url);
      }

      console.log(`✅ Миграция завершена: ${uploadedFiles.length} файлов`);
      return uploadedFiles;
    } catch (error) {
      console.error(`❌ Ошибка миграции директории:`, error);
      throw error;
    }
  }

  /**
   * Проверяет статус подключения к Spaces
   */
  async healthCheck(): Promise<boolean> {
    try {
      const params = {
        Bucket: this.bucket
      };

      await this.s3.headBucket(params).promise();
      return true;
    } catch (error) {
      console.error(`❌ Spaces недоступен:`, error);
      return false;
    }
  }

  /**
   * Получает URL файла в Spaces
   * @param key - Ключ файла
   * @returns Публичный URL
   */
  getPublicUrl(key: string): string {
    const endpoint = process.env.SPACES_ENDPOINT || 'ams3.digitaloceanspaces.com';
    return `https://${this.bucket}.${endpoint}/${key}`;
  }

  /**
   * Рекурсивно получает все файлы из директории
   */
  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Определяет MIME тип файла по расширению
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.json': 'application/json'
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

// Экспорт singleton инстанса
export const spacesService = new SpacesService();