import { Router } from 'express';
import { backupManager } from './databaseBackup';
import { transactionalStorage } from './transactionalStorage';
import { TransactionManager } from './transaction';

const router = Router();

/**
 * API для управления резервными копиями и rollback операциями
 */

// Получить список всех резервных копий
router.get('/api/database/backups', async (req, res) => {
  try {
    const backups = backupManager.getBackupList();
    const dbInfo = backupManager.getDatabaseInfo();
    
    res.json({
      success: true,
      data: {
        backups,
        currentDatabase: dbInfo,
        totalBackups: backups.length
      }
    });
  } catch (error) {
    console.error('❌ Ошибка получения списка резервных копий:', error);
    res.status(500).json({
      success: false,
      error: 'Не удалось получить список резервных копий'
    });
  }
});

// Создать резервную копию
router.post('/api/database/backup', async (req, res) => {
  try {
    const { description } = req.body;
    
    const backupFilename = await backupManager.createBackup(description || 'Ручная резервная копия');
    
    res.json({
      success: true,
      message: 'Резервная копия создана успешно',
      data: {
        filename: backupFilename,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Ошибка создания резервной копии:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Не удалось создать резервную копию'
    });
  }
});

// Восстановить базу данных из резервной копии (ROLLBACK)
router.post('/api/database/restore', async (req, res) => {
  try {
    const { backupFilename } = req.body;
    
    if (!backupFilename) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать имя файла резервной копии'
      });
    }
    
    await backupManager.restoreFromBackup(backupFilename);
    
    res.json({
      success: true,
      message: `База данных успешно восстановлена из резервной копии: ${backupFilename}`,
      data: {
        restoredFrom: backupFilename,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Ошибка восстановления базы данных:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Не удалось восстановить базу данных'
    });
  }
});

// Проверить состояние базы данных
router.get('/api/database/validate', async (req, res) => {
  try {
    const validation = await transactionalStorage.validateDatabaseStateWithRollback();
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('❌ Ошибка проверки базы данных:', error);
    res.status(500).json({
      success: false,
      error: 'Не удалось выполнить проверку базы данных'
    });
  }
});

// Выполнить транзакцию с возможностью отката
router.post('/api/database/transaction', async (req, res) => {
  try {
    const { operations } = req.body;
    
    if (!Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: 'Необходимо указать массив операций'
      });
    }
    
    const results = await TransactionManager.withTransaction(async (transaction) => {
      const operationResults = [];
      
      for (const operation of operations) {
        // Здесь можно добавить выполнение различных операций
        // В зависимости от типа операции (operation.type)
        switch (operation.type) {
          case 'create_bid':
            const bid = await transactionalStorage.createBidWithRollback(operation.data);
            operationResults.push({ type: 'bid', result: bid });
            break;
            
          case 'update_listing':
            const listing = await transactionalStorage.updateListingStatusWithRollback(
              operation.listingId, 
              operation.status
            );
            operationResults.push({ type: 'listing', result: listing });
            break;
            
          default:
            throw new Error(`Неизвестный тип операции: ${operation.type}`);
        }
      }
      
      return operationResults;
    });
    
    res.json({
      success: true,
      message: 'Все операции выполнены успешно',
      data: results
    });
    
  } catch (error) {
    console.error('❌ Ошибка выполнения транзакции:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Транзакция отменена из-за ошибки'
    });
  }
});

// Очистить старые резервные копии
router.post('/api/database/cleanup', async (req, res) => {
  try {
    const { keepCount = 10 } = req.body;
    
    backupManager.cleanupOldBackups(keepCount);
    
    res.json({
      success: true,
      message: `Очистка завершена. Оставлено ${keepCount} резервных копий`
    });
  } catch (error) {
    console.error('❌ Ошибка очистки резервных копий:', error);
    res.status(500).json({
      success: false,
      error: 'Не удалось выполнить очистку резервных копий'
    });
  }
});

// Получить информацию о базе данных
router.get('/api/database/info', async (req, res) => {
  try {
    const dbInfo = backupManager.getDatabaseInfo();
    const backups = backupManager.getBackupList();
    
    res.json({
      success: true,
      data: {
        database: dbInfo,
        backups: {
          count: backups.length,
          totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
          latest: backups[0] || null
        }
      }
    });
  } catch (error) {
    console.error('❌ Ошибка получения информации о базе данных:', error);
    res.status(500).json({
      success: false,
      error: 'Не удалось получить информацию о базе данных'
    });
  }
});

export default router;