import { TransactionManager, executeWithRollback } from "./transaction";
import { storage } from "./storage";
import { InsertBid, InsertCarListing, CarListing, Bid } from "@shared/schema";

/**
 * Расширенный класс для работы с базой данных с поддержкой транзакций и rollback
 */
export class TransactionalStorage {
  
  /**
   * Создает ставку с проверкой на rollback при ошибке
   */
  async createBidWithRollback(bidData: InsertBid): Promise<Bid> {
    return executeWithRollback(async () => {
      // Проверяем, что лот существует и активен
      const listing = await storage.getListing(bidData.listingId);
      if (!listing) {
        throw new Error(`Лот с ID ${bidData.listingId} не найден`);
      }
      
      if (listing.status !== 'active') {
        throw new Error(`Лот ${listing.lotNumber} не активен для ставок`);
      }
      
      // Проверяем, что новая ставка больше текущей
      const currentBid = parseFloat(listing.currentBid || '0');
      const newBidAmount = parseFloat(bidData.amount);
      
      if (newBidAmount <= currentBid) {
        throw new Error(`Ставка должна быть больше текущей (${currentBid} сомони)`);
      }
      
      // Создаем ставку и обновляем лот в одной транзакции
      const bid = await storage.createBid(bidData);
      await storage.updateListingCurrentBid(bidData.listingId, bidData.amount);
      
      console.log(`✅ Ставка ${bidData.amount} сомони успешно создана для лота ${listing.lotNumber}`);
      return bid;
    }, "Не удалось создать ставку");
  }

  /**
   * Создает объявление с автоматическим rollback при ошибке
   */
  async createListingWithRollback(listingData: InsertCarListing): Promise<CarListing> {
    return executeWithRollback(async () => {
      // Проверяем обязательные поля
      if (!listingData.make || !listingData.model) {
        throw new Error("Марка и модель автомобиля обязательны");
      }
      
      if (!listingData.photos || !Array.isArray(listingData.photos) || listingData.photos.length === 0) {
        throw new Error("Необходимо загрузить хотя бы одну фотографию");
      }
      
      // Генерируем номер лота
      const lotNumber = `${Math.floor(Math.random() * 900000) + 100000}`;
      const listingWithLotNumber = {
        ...listingData,
        lotNumber
      };
      
      const listing = await storage.createListing(listingWithLotNumber);
      console.log(`✅ Объявление ${listing.lotNumber} успешно создано`);
      return listing;
    }, "Не удалось создать объявление");
  }

  /**
   * Обновляет статус лота с rollback при ошибке
   */
  async updateListingStatusWithRollback(listingId: number, newStatus: string): Promise<CarListing> {
    return executeWithRollback(async () => {
      const listing = await storage.getListing(listingId);
      if (!listing) {
        throw new Error(`Лот с ID ${listingId} не найден`);
      }
      
      // Проверяем допустимые переходы статусов
      const allowedTransitions: Record<string, string[]> = {
        'pending_approval': ['active', 'rejected'],
        'active': ['ended', 'archived'],
        'ended': ['archived'],
        'rejected': ['pending_approval'],
        'archived': []
      };
      
      const currentStatus = listing.status;
      if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
        throw new Error(`Недопустимый переход статуса: ${currentStatus} → ${newStatus}`);
      }
      
      const updatedListing = await storage.updateListingStatus(listingId, newStatus);
      if (!updatedListing) {
        throw new Error(`Не удалось обновить статус лота ${listing.lotNumber}`);
      }
      
      console.log(`✅ Статус лота ${listing.lotNumber} изменен: ${currentStatus} → ${newStatus}`);
      return updatedListing;
    }, `Не удалось изменить статус лота`);
  }

  /**
   * Массовые операции с автоматическим rollback
   */
  async batchUpdateListingsWithRollback(
    listingIds: number[],
    updates: Partial<InsertCarListing>
  ): Promise<CarListing[]> {
    return TransactionManager.withTransaction(async (transaction) => {
      const results: CarListing[] = [];
      
      for (const listingId of listingIds) {
        const updatedListing = await storage.updateListing(listingId, updates);
        if (!updatedListing) {
          throw new Error(`Не удалось обновить лот с ID ${listingId}`);
        }
        results.push(updatedListing);
      }
      
      console.log(`✅ Успешно обновлено ${results.length} лотов`);
      return results;
    });
  }

  /**
   * Удаление лота с каскадным удалением связанных данных
   */
  async deleteListingWithRollback(listingId: number): Promise<boolean> {
    return executeWithRollback(async () => {
      const listing = await storage.getListing(listingId);
      if (!listing) {
        throw new Error(`Лот с ID ${listingId} не найден`);
      }
      
      // Получаем количество ставок для проверки
      const bidsCount = await storage.getBidCountForListing(listingId);
      
      if (bidsCount > 0 && listing.status === 'active') {
        throw new Error(`Нельзя удалить активный лот с ${bidsCount} ставками. Сначала завершите аукцион.`);
      }
      
      // Удаляем лот (ставки удалятся каскадно через внешние ключи)
      const result = await storage.deleteListing(listingId);
      
      if (result) {
        console.log(`✅ Лот ${listing.lotNumber} и все связанные данные удалены`);
      }
      
      return result;
    }, "Не удалось удалить лот");
  }

  /**
   * Проверка состояния базы данных с возможностью отката изменений
   */
  async validateDatabaseStateWithRollback(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return executeWithRollback(async () => {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Проверяем активные лоты
      const activeListings = await storage.getListingsByStatus('active');
      for (const listing of activeListings) {
        if (!listing.auctionEndTime) {
          errors.push(`Лот ${listing.lotNumber}: отсутствует время окончания аукциона`);
        }
        
        if (!listing.photos || (Array.isArray(listing.photos) && listing.photos.length === 0)) {
          warnings.push(`Лот ${listing.lotNumber}: нет фотографий`);
        }
      }
      
      // Проверяем целостность ставок
      for (const listing of activeListings) {
        const bids = await storage.getBidsForListing(listing.id);
        const maxBid = bids.length > 0 ? Math.max(...bids.map(b => parseFloat(b.amount))) : 0;
        const currentBid = parseFloat(listing.currentBid || '0');
        
        if (Math.abs(maxBid - currentBid) > 0.01) {
          errors.push(`Лот ${listing.lotNumber}: несоответствие текущей ставки (${currentBid}) и максимальной (${maxBid})`);
        }
      }
      
      const isValid = errors.length === 0;
      
      console.log(`📊 Проверка базы данных: ${isValid ? 'ПРОЙДЕНА' : 'ПРОВАЛЕНА'}`);
      console.log(`   Ошибок: ${errors.length}, Предупреждений: ${warnings.length}`);
      
      return { isValid, errors, warnings };
    }, "Не удалось выполнить проверку базы данных");
  }

  /**
   * Откат к состоянию на определенную дату
   */
  async rollbackToDate(targetDate: Date): Promise<void> {
    return executeWithRollback(async () => {
      console.log(`🔄 Начинаем откат базы данных к ${targetDate.toISOString()}`);
      
      // В реальной системе здесь был бы код для отката данных
      // Для демонстрации показываем, что произошло бы
      
      const listings = await storage.getListingsByStatus('active');
      const recentListings = listings.filter(l => 
        l.createdAt && new Date(l.createdAt) > targetDate
      );
      
      console.log(`📋 Найдено ${recentListings.length} лотов, созданных после ${targetDate.toISOString()}`);
      
      if (recentListings.length > 0) {
        console.log("⚠️  ВНИМАНИЕ: Операция отката удалит следующие данные:");
        recentListings.forEach(listing => {
          console.log(`   - Лот ${listing.lotNumber} (${listing.make} ${listing.model})`);
        });
        
        // В production здесь был бы реальный откат
        throw new Error("Откат к прошлой дате требует подтверждения администратора");
      }
      
      console.log("✅ Откат не требуется - нет изменений после указанной даты");
    }, "Не удалось выполнить откат базы данных");
  }
}

export const transactionalStorage = new TransactionalStorage();