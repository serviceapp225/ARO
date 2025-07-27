import { db } from "./db";
import { sql } from "drizzle-orm";

export interface Transaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive: boolean;
}

export class DatabaseTransaction implements Transaction {
  private _isActive = true;
  private savepoint: string;

  constructor(savepoint: string) {
    this.savepoint = savepoint;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  async commit(): Promise<void> {
    if (!this._isActive) {
      throw new Error("Транзакция уже завершена");
    }
    
    try {
      await db.execute(sql`RELEASE SAVEPOINT ${sql.identifier(this.savepoint)}`);
      this._isActive = false;
      console.log(`✅ Транзакция ${this.savepoint} успешно зафиксирована`);
    } catch (error) {
      console.error(`❌ Ошибка при фиксации транзакции ${this.savepoint}:`, error);
      throw error;
    }
  }

  async rollback(): Promise<void> {
    if (!this._isActive) {
      throw new Error("Транзакция уже завершена");
    }
    
    try {
      await db.execute(sql`ROLLBACK TO SAVEPOINT ${sql.identifier(this.savepoint)}`);
      await db.execute(sql`RELEASE SAVEPOINT ${sql.identifier(this.savepoint)}`);
      this._isActive = false;
      console.log(`🔄 Транзакция ${this.savepoint} отменена (rollback)`);
    } catch (error) {
      console.error(`❌ Ошибка при отмене транзакции ${this.savepoint}:`, error);
      throw error;
    }
  }
}

export class TransactionManager {
  private static savepointCounter = 0;

  static async beginTransaction(): Promise<DatabaseTransaction> {
    const savepointName = `sp_${++this.savepointCounter}_${Date.now()}`;
    
    try {
      await db.execute(sql`SAVEPOINT ${sql.identifier(savepointName)}`);
      console.log(`🚀 Начата транзакция: ${savepointName}`);
      return new DatabaseTransaction(savepointName);
    } catch (error) {
      console.error("❌ Ошибка при создании транзакции:", error);
      throw error;
    }
  }

  static async withTransaction<T>(
    operation: (transaction: DatabaseTransaction) => Promise<T>
  ): Promise<T> {
    const transaction = await this.beginTransaction();
    
    try {
      const result = await operation(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      if (transaction.isActive) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}

// Утилитарные функции для работы с транзакциями
export async function executeWithRollback<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  return TransactionManager.withTransaction(async (transaction) => {
    try {
      return await operation();
    } catch (error) {
      console.error(errorMessage || "Операция не удалась, выполняется rollback:", error);
      throw error;
    }
  });
}