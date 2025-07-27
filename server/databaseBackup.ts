import { execSync } from 'child_process';
import { existsSync, copyFileSync, unlinkSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export interface BackupInfo {
  filename: string;
  timestamp: Date;
  size: number;
  description: string;
}

export class DatabaseBackupManager {
  private backupDir = './backups';
  private dbPath = './autoauction.db';

  constructor() {
    // Создаем папку для бэкапов если её нет
    if (!existsSync(this.backupDir)) {
      execSync(`mkdir -p ${this.backupDir}`);
    }
  }

  /**
   * Создает резервную копию базы данных
   */
  async createBackup(description?: string): Promise<string> {
    if (!existsSync(this.dbPath)) {
      throw new Error('База данных не найдена');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `backup_${timestamp}.db`;
    const backupPath = join(this.backupDir, backupFilename);

    try {
      copyFileSync(this.dbPath, backupPath);
      
      const stats = statSync(backupPath);
      console.log(`✅ Создана резервная копия: ${backupFilename} (${Math.round(stats.size / 1024 / 1024)}MB)`);
      
      if (description) {
        console.log(`📝 Описание: ${description}`);
      }
      
      return backupFilename;
    } catch (error) {
      console.error('❌ Ошибка создания резервной копии:', error);
      throw error;
    }
  }

  /**
   * Восстанавливает базу данных из резервной копии (ROLLBACK)
   */
  async restoreFromBackup(backupFilename: string): Promise<void> {
    const backupPath = join(this.backupDir, backupFilename);
    
    if (!existsSync(backupPath)) {
      throw new Error(`Резервная копия ${backupFilename} не найдена`);
    }

    try {
      // Создаем резервную копию текущего состояния перед восстановлением
      const emergencyBackup = await this.createBackup(`Emergency backup before restore from ${backupFilename}`);
      
      // Восстанавливаем из выбранной резервной копии
      copyFileSync(backupPath, this.dbPath);
      
      console.log(`🔄 База данных восстановлена из резервной копии: ${backupFilename}`);
      console.log(`💾 Аварийная копия создана: ${emergencyBackup}`);
      
    } catch (error) {
      console.error('❌ Ошибка восстановления базы данных:', error);
      throw error;
    }
  }

  /**
   * Получает список всех резервных копий
   */
  getBackupList(): BackupInfo[] {
    if (!existsSync(this.backupDir)) {
      return [];
    }

    const files = readdirSync(this.backupDir)
      .filter(file => file.endsWith('.db'))
      .map(filename => {
        const filePath = join(this.backupDir, filename);
        const stats = statSync(filePath);
        
        // Извлекаем timestamp из имени файла
        const timestampMatch = filename.match(/backup_(.+)\.db$/);
        const timestamp = timestampMatch 
          ? new Date(timestampMatch[1].replace(/-/g, ':').replace(/T(.+)-/, 'T$1.'))
          : stats.birthtime;

        return {
          filename,
          timestamp,
          size: stats.size,
          description: `Резервная копия от ${timestamp.toLocaleString('ru-RU')}`
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return files;
  }

  /**
   * Удаляет старые резервные копии (оставляет только последние N)
   */
  cleanupOldBackups(keepCount: number = 10): void {
    const backups = this.getBackupList();
    
    if (backups.length <= keepCount) {
      console.log(`📦 Найдено ${backups.length} резервных копий (лимит: ${keepCount})`);
      return;
    }

    const toDelete = backups.slice(keepCount);
    
    toDelete.forEach(backup => {
      try {
        unlinkSync(join(this.backupDir, backup.filename));
        console.log(`🗑️ Удалена старая резервная копия: ${backup.filename}`);
      } catch (error) {
        console.error(`❌ Ошибка удаления ${backup.filename}:`, error);
      }
    });

    console.log(`✅ Очистка завершена. Оставлено ${keepCount} резервных копий`);
  }

  /**
   * Автоматическое создание резервной копии перед критическими операциями
   */
  async createAutoBackup(operation: string): Promise<string> {
    return this.createBackup(`Auto backup before: ${operation}`);
  }

  /**
   * Получает информацию о размере базы данных
   */
  getDatabaseInfo(): { exists: boolean; size?: number; lastModified?: Date } {
    if (!existsSync(this.dbPath)) {
      return { exists: false };
    }

    const stats = statSync(this.dbPath);
    return {
      exists: true,
      size: stats.size,
      lastModified: stats.mtime
    };
  }
}

export const backupManager = new DatabaseBackupManager();