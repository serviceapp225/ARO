import Database from 'better-sqlite3';
import { IStorage } from './storage';
import type {
  User, CarListing, Bid, Favorite, Notification, CarAlert,
  Banner, SellCarSection, AdvertisementCarousel, Document, AlertView, UserWin,
  InsertUser, InsertCarListing, InsertBid, InsertFavorite, InsertNotification,
  InsertCarAlert, InsertBanner, InsertSellCarSection, InsertAdvertisementCarousel,
  InsertDocument, InsertAlertView, InsertUserWin
} from '@shared/schema';

export class SQLiteStorage implements IStorage {
  private db: Database.Database;

  constructor() {
    // Используем файловую базу данных для сохранения данных
    this.db = new Database('autoauction.db');
    this.createTables();
    this.initializeSampleData();
  }

  private createTables() {
    // Create users table (только если не существует)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        full_name TEXT,
        role TEXT NOT NULL,
        profile_photo TEXT,
        phone_number TEXT,
        is_active BOOLEAN DEFAULT 0,
        invited_by TEXT,
        is_invited BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Добавляем колонку phone_number если она не существует
    try {
      this.db.exec(`ALTER TABLE users ADD COLUMN phone_number TEXT`);
    } catch (error) {
      // Колонка уже существует, игнорируем ошибку
    }

    // Добавляем реферальные колонки если они не существуют
    try {
      this.db.exec(`ALTER TABLE users ADD COLUMN invited_by TEXT`);
    } catch (error) {
      // Колонка уже существует, игнорируем ошибку
    }

    try {
      this.db.exec(`ALTER TABLE users ADD COLUMN is_invited BOOLEAN DEFAULT 0`);
    } catch (error) {
      // Колонка уже существует, игнорируем ошибку
    }

    // Create car_listings table (только если не существует)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS car_listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL,
        lot_number TEXT NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        mileage INTEGER NOT NULL,
        description TEXT NOT NULL,
        starting_price DECIMAL(12,2) NOT NULL,
        current_bid DECIMAL(12,2),
        photos TEXT NOT NULL,
        auction_duration INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        auction_start_time DATETIME,
        auction_end_time DATETIME,
        ended_at DATETIME,
        customs_cleared BOOLEAN DEFAULT 0,
        recycled BOOLEAN DEFAULT 0,
        technical_inspection_valid BOOLEAN DEFAULT 0,
        technical_inspection_date TEXT,
        tinted BOOLEAN DEFAULT 0,
        tinting_date TEXT,
        engine TEXT,
        transmission TEXT,
        fuel_type TEXT,
        body_type TEXT,
        drive_type TEXT,
        color TEXT,
        condition TEXT,
        vin TEXT,
        location TEXT,
        battery_capacity DECIMAL(6,1),
        electric_range INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create other tables (только если не существуют)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS bids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER NOT NULL,
        bidder_id INTEGER NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        listing_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        listing_id INTEGER,
        alert_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS car_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        make TEXT NOT NULL,
        model TEXT,
        min_price DECIMAL(12,2),
        max_price DECIMAL(12,2),
        max_year INTEGER,
        min_year INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        link_url TEXT,
        position TEXT,
        "order" INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sell_car_section (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        button_text TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS advertisement_carousel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        link_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        file_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        is_active BOOLEAN DEFAULT 1,
        "order" INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS alert_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        alert_id INTEGER NOT NULL,
        listing_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_wins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        listing_id INTEGER NOT NULL,
        winning_bid DECIMAL(12,2) NOT NULL,
        won_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  private initializeSampleData() {
    // Проверяем, есть ли уже данные
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count > 0) {
      console.log('База данных уже содержит данные, пропускаем инициализацию');
      return;
    }
    
    console.log('Инициализация базы данных с демонстрационными данными...');
    
    // Insert sample users
    const insertUser = this.db.prepare(`
      INSERT INTO users (username, email, role, is_active, full_name) 
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run('admin', 'admin@autoauction.tj', 'admin', 1, 'Администратор');
    insertUser.run('seller123', 'seller@autoauction.tj', 'seller', 1, 'Продавец автомобилей');
    insertUser.run('buyer456', 'buyer@autoauction.tj', 'buyer', 1, 'Покупатель автомобилей');

    // Insert sample listings
    const insertListing = this.db.prepare(`
      INSERT INTO car_listings (
        seller_id, lot_number, make, model, year, mileage, vin, description,
        starting_price, current_bid, photos, auction_duration, status,
        auction_start_time, auction_end_time, customs_cleared, recycled,
        technical_inspection_valid, technical_inspection_date, engine,
        transmission, fuel_type, body_type, drive_type, color, condition, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertListing.run(
      2, 'LOT724583', 'Porsche', '911 Turbo S', 2020, 15000, 'WP0AB2A95LS123456',
      'Потрясающий Porsche 911 Turbo S 2020 года - шедевр автомобильной инженерии',
      140000.00, 145500.00, 
      JSON.stringify(["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"]),
      72, 'active', new Date().toISOString(), '2025-06-30T13:30:00Z', 1, 0, 1, '2025-12-31',
      '3.8L Twin-Turbo V6', 'Автомат', 'Бензин', 'Купе', 'Полный привод', 'Черный', 'Отличное', 'Душанбе'
    );

    insertListing.run(
      2, 'LOT892456', 'BMW', 'M5 Competition', 2021, 8500, 'WBSJF0C59MCE12345',
      'Исключительный BMW M5 Competition 2021 года в безупречном состоянии',
      85000.00, null,
      JSON.stringify(["https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"]),
      72, 'active', new Date().toISOString(), '2025-07-01T18:45:00Z', 1, 0, 1, '2025-11-30',
      '4.4L Twin-Turbo V8', 'Автомат', 'Бензин', 'Седан', 'Задний привод', 'Белый', 'Отличное', 'Душанбе'
    );

    // Insert sample bid
    const insertBid = this.db.prepare(`
      INSERT INTO bids (listing_id, bidder_id, amount) VALUES (?, ?, ?)
    `);
    insertBid.run(1, 3, 145500.00);

    // Insert carousel items
    const insertCarousel = this.db.prepare(`
      INSERT INTO advertisement_carousel (title, description, image_url, link_url, display_order, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertCarousel.run('Специальные предложения', 'Лучшие автомобили с особыми условиями', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', '/special-offers', 1, 1);
    insertCarousel.run('Эксклюзивные аукционы', 'Премиум автомобили для истинных ценителей', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400', '/exclusive', 2, 1);

    // Insert sell car section
    const insertSellSection = this.db.prepare(`
      INSERT INTO sell_car_section (title, description, button_text, image_url) 
      VALUES (?, ?, ?, ?)
    `);
    insertSellSection.run('Продайте свой автомобиль', 'Получите лучшую цену за ваш автомобиль на нашем аукционе', 'Начать продажу', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400');
  }

  // Implement all IStorage methods with SQLite queries...
  async getUser(id: number): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.mapUser(row) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Поиск по username или номеру телефона
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ? OR phone_number = ?');
    const row = stmt.get(username, username);
    return row ? this.mapUser(row) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email);
    return row ? this.mapUser(row) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, role, full_name, profile_photo, phone_number, is_active, invited_by, is_invited)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      insertUser.username, 
      insertUser.email, 
      insertUser.role, 
      insertUser.fullName || null, 
      insertUser.profilePhoto || null, 
      insertUser.phoneNumber || null, 
      insertUser.isActive ? 1 : 0,
      (insertUser as any).invitedBy || null,
      (insertUser as any).isInvited ? 1 : 0
    );
    
    return this.getUser(result.lastInsertRowid as number) as Promise<User>;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User | undefined> {
    const stmt = this.db.prepare('UPDATE users SET is_active = ? WHERE id = ?');
    stmt.run(isActive ? 1 : 0, id);
    return this.getUser(id);
  }

  async updateUserProfile(id: number, data: { fullName?: string; profilePhoto?: string; email?: string; username?: string; phoneNumber?: string }): Promise<User | undefined> {
    let setParts = [];
    let values = [];
    if (data.fullName !== undefined) {
      setParts.push('full_name = ?');
      values.push(data.fullName);
    }
    if (data.profilePhoto !== undefined) {
      setParts.push('profile_photo = ?');
      values.push(data.profilePhoto);
    }
    if (data.email !== undefined) {
      setParts.push('email = ?');
      values.push(data.email);
    }
    if (data.username !== undefined) {
      setParts.push('username = ?');
      values.push(data.username);
    }
    if (data.phoneNumber !== undefined) {
      setParts.push('phone_number = ?');
      values.push(data.phoneNumber);
    }
    if (setParts.length > 0) {
      values.push(id);
      const stmt = this.db.prepare(`UPDATE users SET ${setParts.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
    return this.getUser(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Каскадное удаление всех связанных данных с безопасными запросами
      const transaction = this.db.transaction(() => {
        try {
          // Удаляем ставки пользователя (если таблица существует)
          try { this.db.prepare('DELETE FROM bids WHERE bidder_id = ?').run(id); } catch {}
          
          // Удаляем избранное пользователя (если таблица существует)
          try { this.db.prepare('DELETE FROM favorites WHERE user_id = ?').run(id); } catch {}
          
          // Удаляем уведомления пользователя (если таблица существует)
          try { this.db.prepare('DELETE FROM notifications WHERE user_id = ?').run(id); } catch {}
          
          // Удаляем алерты пользователя (если таблица существует)
          try { this.db.prepare('DELETE FROM car_alerts WHERE user_id = ?').run(id); } catch {}
          
          // Удаляем просмотры алертов пользователя (если таблица существует)
          try { this.db.prepare('DELETE FROM alert_views WHERE user_id = ?').run(id); } catch {}
          
          // Удаляем документы пользователя (если таблица существует)
          try { this.db.prepare('DELETE FROM documents WHERE user_id = ?').run(id); } catch {}
          
          // Удаляем объявления пользователя (если он продавец)
          try { this.db.prepare('DELETE FROM car_listings WHERE seller_id = ?').run(id); } catch {}
          
          // Наконец удаляем самого пользователя
          const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
          
          if (result.changes === 0) {
            throw new Error(`User with id ${id} not found`);
          }
        } catch (error) {
          throw error; // Перебрасываем ошибку для обработки во внешнем блоке
        }
      });
      
      transaction();
      console.log(`User ${id} and all related data deleted successfully`);
      return true;
    } catch (error) {
      console.error("Failed to delete user:", error);
      return false;
    }
  }

  async getUserDocuments(userId: number): Promise<Document[]> {
    const stmt = this.db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(userId) as any[];
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      type: row.type,
      content: row.content,
      fileUrl: row.file_url,
      fileName: row.file_name,
      fileSize: row.file_size,
      isActive: Boolean(row.is_active),
      order: row.order,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at || row.created_at)
    }));
  }

  async getAllUsers(): Promise<User[]> {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    const rows = stmt.all();
    return rows.map(row => this.mapUser(row));
  }

  async getListing(id: number): Promise<CarListing | undefined> {
    const stmt = this.db.prepare('SELECT * FROM car_listings WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.mapListing(row) : undefined;
  }

  async getListingsByStatus(status: string, limit?: number): Promise<CarListing[]> {
    let query = 'SELECT * FROM car_listings WHERE status = ? ORDER BY created_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = this.db.prepare(query);
    const rows = stmt.all(status);
    return rows.map(row => this.mapListing(row));
  }

  async getPendingApprovalListings(limit?: number): Promise<CarListing[]> {
    let query = 'SELECT * FROM car_listings WHERE status = ? ORDER BY created_at DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = this.db.prepare(query);
    const rows = stmt.all('pending_approval');
    return rows.map(row => this.mapListing(row));
  }

  async approveListingForPublic(id: number): Promise<CarListing | undefined> {
    const stmt = this.db.prepare('UPDATE car_listings SET status = ? WHERE id = ?');
    stmt.run('pending', id);
    return this.getListing(id);
  }

  async rejectListingApplication(id: number): Promise<CarListing | undefined> {
    const stmt = this.db.prepare('UPDATE car_listings SET status = ? WHERE id = ?');
    stmt.run('rejected', id);
    return this.getListing(id);
  }

  async updateListing(id: number, data: any): Promise<CarListing | undefined> {
    const fields = [];
    const values = [];
    
    // Проверяем и добавляем поля для обновления
    if (data.make !== undefined) {
      fields.push('make = ?');
      values.push(data.make);
    }
    if (data.model !== undefined) {
      fields.push('model = ?');
      values.push(data.model);
    }
    if (data.year !== undefined) {
      fields.push('year = ?');
      values.push(data.year);
    }
    if (data.mileage !== undefined) {
      fields.push('mileage = ?');
      values.push(data.mileage);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.startingPrice !== undefined) {
      fields.push('starting_price = ?');
      values.push(data.startingPrice);
    }
    if (data.reservePrice !== undefined) {
      fields.push('reserve_price = ?');
      values.push(data.reservePrice || null);
    }
    if (data.auctionDuration !== undefined) {
      fields.push('auction_duration = ?');
      values.push(data.auctionDuration);
    }
    if (data.condition !== undefined) {
      fields.push('condition = ?');
      values.push(data.condition);
    }
    if (data.location !== undefined) {
      fields.push('location = ?');
      values.push(data.location);
    }
    if (data.engine !== undefined) {
      fields.push('engine = ?');
      values.push(data.engine);
    }
    if (data.transmission !== undefined) {
      fields.push('transmission = ?');
      values.push(data.transmission);
    }
    if (data.fuelType !== undefined) {
      fields.push('fuel_type = ?');
      values.push(data.fuelType);
    }
    if (data.bodyType !== undefined) {
      fields.push('body_type = ?');
      values.push(data.bodyType);
    }
    if (data.driveType !== undefined) {
      fields.push('drive_type = ?');
      values.push(data.driveType);
    }
    if (data.color !== undefined) {
      fields.push('color = ?');
      values.push(data.color);
    }
    if (data.customsCleared !== undefined) {
      fields.push('customs_cleared = ?');
      values.push(data.customsCleared ? 1 : 0);
    }
    if (data.recycled !== undefined) {
      fields.push('recycled = ?');
      values.push(data.recycled ? 1 : 0);
    }
    if (data.technicalInspectionValid !== undefined) {
      fields.push('technical_inspection_valid = ?');
      values.push(data.technicalInspectionValid ? 1 : 0);
    }
    if (data.tinted !== undefined) {
      fields.push('tinted = ?');
      values.push(data.tinted ? 1 : 0);
    }
    if (data.photos !== undefined) {
      fields.push('photos = ?');
      values.push(JSON.stringify(data.photos));
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = this.db.prepare(`UPDATE car_listings SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
    
    return this.getListing(id);
  }

  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    const stmt = this.db.prepare('SELECT * FROM car_listings WHERE seller_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(sellerId);
    return rows.map(row => this.mapListing(row));
  }

  async createListing(insertListing: InsertCarListing): Promise<CarListing> {
    try {
      console.log('Creating listing with data:', insertListing);
      
      const stmt = this.db.prepare(`
        INSERT INTO car_listings (
          seller_id, lot_number, make, model, year, mileage, description, starting_price, reserve_price,
          photos, auction_duration, status, auction_start_time, auction_end_time,
          customs_cleared, recycled, technical_inspection_valid, technical_inspection_date,
          tinted, tinting_date, engine, transmission, fuel_type, body_type, drive_type,
          color, condition, vin, location, battery_capacity, electric_range
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Calculate auction end time
      const now = new Date();
      const auctionStartTime = now.toISOString();
      const auctionEndTime = new Date(now.getTime() + (insertListing.auctionDuration * 60 * 60 * 1000)).toISOString();
    
    const result = stmt.run(
      insertListing.sellerId, insertListing.lotNumber, insertListing.make, insertListing.model,
      insertListing.year, insertListing.mileage, insertListing.description, 
      parseFloat(insertListing.startingPrice), 
      (insertListing as any).reservePrice ? parseFloat((insertListing as any).reservePrice) : null,
      JSON.stringify(insertListing.photos), 
      insertListing.auctionDuration, (insertListing as any).status || 'pending',
      auctionStartTime, auctionEndTime, // Set proper auction times
      insertListing.customsCleared ? 1 : 0, insertListing.recycled ? 1 : 0,
      insertListing.technicalInspectionValid ? 1 : 0, insertListing.technicalInspectionDate || null,
      insertListing.tinted ? 1 : 0, insertListing.tintingDate || null,
      insertListing.engine || null, insertListing.transmission || null,
      insertListing.fuelType || null, insertListing.bodyType || null,
      insertListing.driveType || null, insertListing.color || null,
      insertListing.condition || null, insertListing.vin || null,
      insertListing.location || null,
      (insertListing as any).batteryCapacity || null,
      (insertListing as any).electricRange || null
    );
    
    console.log('Listing created successfully with ID:', result.lastInsertRowid);
    return this.getListing(result.lastInsertRowid as number) as Promise<CarListing>;
    
    } catch (error) {
      console.error('Error in SQLite createListing:', error);
      throw error;
    }
  }

  async updateListing(id: number, data: Partial<any>): Promise<CarListing | undefined> {
    const fields = [];
    const values = [];
    
    if (data.make !== undefined) {
      fields.push('make = ?');
      values.push(data.make);
    }
    if (data.model !== undefined) {
      fields.push('model = ?');
      values.push(data.model);
    }
    if (data.year !== undefined) {
      fields.push('year = ?');
      values.push(data.year);
    }
    if (data.mileage !== undefined) {
      fields.push('mileage = ?');
      values.push(data.mileage);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.startingPrice !== undefined) {
      fields.push('starting_price = ?');
      values.push(parseFloat(data.startingPrice));
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.location !== undefined) {
      fields.push('location = ?');
      values.push(data.location);
    }
    
    // Additional car specifications
    if (data.engine !== undefined) {
      fields.push('engine = ?');
      values.push(data.engine);
    }
    if (data.transmission !== undefined) {
      fields.push('transmission = ?');
      values.push(data.transmission);
    }
    if (data.fuelType !== undefined) {
      fields.push('fuel_type = ?');
      values.push(data.fuelType);
    }
    if (data.bodyType !== undefined) {
      fields.push('body_type = ?');
      values.push(data.bodyType);
    }
    if (data.driveType !== undefined) {
      fields.push('drive_type = ?');
      values.push(data.driveType);
    }
    if (data.color !== undefined) {
      fields.push('color = ?');
      values.push(data.color);
    }
    if (data.condition !== undefined) {
      fields.push('condition = ?');
      values.push(data.condition);
    }
    if (data.vin !== undefined) {
      fields.push('vin = ?');
      values.push(data.vin);
    }
    
    // Legal documents and status
    if (data.customsCleared !== undefined) {
      fields.push('customs_cleared = ?');
      values.push(data.customsCleared ? 1 : 0);
    }
    if (data.recycled !== undefined) {
      fields.push('recycled = ?');
      values.push(data.recycled ? 1 : 0);
    }
    if (data.technicalInspectionValid !== undefined) {
      fields.push('technical_inspection_valid = ?');
      values.push(data.technicalInspectionValid ? 1 : 0);
    }
    if (data.technicalInspectionDate !== undefined) {
      fields.push('technical_inspection_date = ?');
      values.push(data.technicalInspectionDate);
    }
    if (data.tinted !== undefined) {
      fields.push('tinted = ?');
      values.push(data.tinted ? 1 : 0);
    }
    if (data.tintingDate !== undefined) {
      fields.push('tinting_date = ?');
      values.push(data.tintingDate);
    }
    
    // Electric car specific fields
    if (data.batteryCapacity !== undefined) {
      fields.push('battery_capacity = ?');
      values.push(data.batteryCapacity);
    }
    if (data.electricRange !== undefined) {
      fields.push('electric_range = ?');
      values.push(data.electricRange);
    }
    
    if (fields.length === 0) {
      return this.getListing(id);
    }
    
    const query = `UPDATE car_listings SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    
    const stmt = this.db.prepare(query);
    stmt.run(...values);
    return this.getListing(id);
  }

  async deleteListing(id: number): Promise<boolean> {
    try {
      // Удаляем связанные данные из таблиц
      const deleteBids = this.db.prepare('DELETE FROM bids WHERE listing_id = ?');
      const deleteFavorites = this.db.prepare('DELETE FROM favorites WHERE listing_id = ?');
      const deleteNotifications = this.db.prepare('DELETE FROM notifications WHERE listing_id = ?');
      const deleteAlertViews = this.db.prepare('DELETE FROM alert_views WHERE listing_id = ?');
      
      // Удаляем основное объявление
      const deleteListing = this.db.prepare('DELETE FROM car_listings WHERE id = ?');
      
      // Выполняем в транзакции
      const transaction = this.db.transaction(() => {
        deleteBids.run(id);
        deleteFavorites.run(id);
        deleteNotifications.run(id);
        deleteAlertViews.run(id);
        const result = deleteListing.run(id);
        return result.changes > 0;
      });
      
      return transaction();
    } catch (error) {
      console.error('Error deleting listing:', error);
      return false;
    }
  }

  async updateListingStatus(id: number, status: string): Promise<CarListing | undefined> {
    const currentTime = status === 'ended' ? new Date().toISOString() : null;
    
    // Если завершаем аукцион, проверяем нужен ли автоперезапуск
    if (status === 'ended') {
      const needsRestart = await this.checkIfNeedsAutoRestart(id);
      if (needsRestart) {
        return await this.autoRestartListing(id);
      }
    }
    
    const stmt = this.db.prepare('UPDATE car_listings SET status = ?, ended_at = ? WHERE id = ?');
    stmt.run(status, currentTime, id);
    return this.getListing(id);
  }

  async updateListingCurrentBid(id: number, amount: string): Promise<CarListing | undefined> {
    const stmt = this.db.prepare('UPDATE car_listings SET current_bid = ? WHERE id = ?');
    stmt.run(parseFloat(amount), id);
    return this.getListing(id);
  }

  // Проверяем нужен ли автоматический перезапуск аукциона
  async checkIfNeedsAutoRestart(listingId: number): Promise<boolean> {
    try {
      const listing = await this.getListing(listingId);
      if (!listing) return false;

      // Получаем количество ставок на этот аукцион
      const bidCountStmt = this.db.prepare('SELECT COUNT(*) as count FROM bids WHERE listing_id = ?');
      const bidCountResult = bidCountStmt.get(listingId) as { count: number };
      const bidCount = bidCountResult.count;

      // Условие 1: Нет ставок вообще
      if (bidCount === 0) {
        console.log(`Аукцион ${listingId} перезапускается: нет ставок`);
        return true;
      }

      // Условие 2: Есть ставки, но максимальная меньше резервной цены
      if (listing.reserve_price && listing.current_bid && listing.current_bid < listing.reserve_price) {
        console.log(`Аукцион ${listingId} перезапускается: не достигли резервной цены (${listing.current_bid} < ${listing.reserve_price})`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Ошибка при проверке перезапуска:', error);
      return false;
    }
  }

  // Автоматический перезапуск аукциона
  async autoRestartListing(listingId: number): Promise<CarListing | undefined> {
    try {
      console.log(`Автоматический перезапуск аукциона ${listingId}`);
      
      // Новая дата окончания - через 7 дней
      const newEndTime = new Date();
      newEndTime.setDate(newEndTime.getDate() + 7);
      
      const transaction = this.db.transaction(() => {
        // 1. Удаляем все старые ставки
        const deleteBidsStmt = this.db.prepare('DELETE FROM bids WHERE listing_id = ?');
        deleteBidsStmt.run(listingId);
        
        // 2. Сбрасываем текущую ставку на стартовую цену
        const listing = this.getListing(listingId);
        if (!listing) throw new Error('Listing not found');
        
        const updateListingStmt = this.db.prepare(`
          UPDATE car_listings 
          SET current_bid = starting_price, 
              end_time = ?, 
              status = 'active',
              ended_at = NULL
          WHERE id = ?
        `);
        updateListingStmt.run(newEndTime.toISOString(), listingId);
        
        // 3. Удаляем старые уведомления об окончании
        const deleteNotificationsStmt = this.db.prepare(
          'DELETE FROM notifications WHERE listing_id = ? AND message LIKE "%завершен%"'
        );
        deleteNotificationsStmt.run(listingId);
        
        // 4. Уведомляем продавца о перезапуске
        const insertNotificationStmt = this.db.prepare(`
          INSERT INTO notifications (user_id, listing_id, message, created_at)
          VALUES (?, ?, ?, ?)
        `);
        insertNotificationStmt.run(
          listing.sellerId,
          listingId,
          `Ваш аукцион "${listing.make} ${listing.model}" был автоматически перезапущен на 7 дней`,
          new Date().toISOString()
        );
        
        // 5. Уведомляем пользователей, добавивших в избранное
        const favoriteUsersStmt = this.db.prepare('SELECT user_id FROM favorites WHERE listing_id = ?');
        const favoriteUsers = favoriteUsersStmt.all(listingId) as { user_id: number }[];
        
        for (const { user_id } of favoriteUsers) {
          if (user_id !== listing.sellerId) { // Не дублируем уведомление продавцу
            insertNotificationStmt.run(
              user_id,
              listingId,
              `Аукцион "${listing.make} ${listing.model}" из ваших избранных был перезапущен`,
              new Date().toISOString()
            );
          }
        }
      });
      
      transaction();
      
      console.log(`Аукцион ${listingId} успешно перезапущен на 7 дней с уведомлениями`);
      return await this.getListing(listingId);
      
    } catch (error) {
      console.error('Ошибка при автоперезапуске аукциона:', error);
      return undefined;
    }
  }

  async searchListings(filters: any): Promise<CarListing[]> {
    let query = 'SELECT * FROM car_listings WHERE status = "active"';
    let params = [];
    
    if (filters.query) {
      query += ' AND (make LIKE ? OR model LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (filters.make) {
      query += ' AND make = ?';
      params.push(filters.make);
    }
    if (filters.model) {
      query += ' AND model = ?';
      params.push(filters.model);
    }
    if (filters.minPrice) {
      query += ' AND starting_price >= ?';
      params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
      query += ' AND starting_price <= ?';
      params.push(filters.maxPrice);
    }
    if (filters.year) {
      query += ' AND year = ?';
      params.push(filters.year);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(row => this.mapListing(row));
  }

  // Helper methods to map SQLite rows to TypeScript objects
  private mapUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      fullName: row.full_name,
      role: row.role,
      profilePhoto: row.profile_photo,
      isActive: Boolean(row.is_active),
      phoneNumber: row.phone_number,
      invitedBy: row.invited_by,
      isInvited: Boolean(row.is_invited),
      createdAt: new Date(row.created_at)
    };
  }

  private mapListing(row: any): CarListing {
    return {
      id: row.id,
      sellerId: row.seller_id,
      lotNumber: row.lot_number,
      make: row.make,
      model: row.model,
      year: row.year,
      mileage: row.mileage,
      description: row.description,
      startingPrice: row.starting_price.toString(),
      reservePrice: row.reserve_price ? row.reserve_price.toString() : null,
      currentBid: row.current_bid ? row.current_bid.toString() : null,
      photos: JSON.parse(row.photos),
      auctionDuration: row.auction_duration,
      status: row.status,
      auctionStartTime: row.auction_start_time ? new Date(row.auction_start_time) : null,
      auctionEndTime: row.auction_end_time ? new Date(row.auction_end_time) : null,
      endedAt: row.ended_at ? new Date(row.ended_at) : null,
      customsCleared: Boolean(row.customs_cleared),
      recycled: Boolean(row.recycled),
      technicalInspectionValid: Boolean(row.technical_inspection_valid),
      technicalInspectionDate: row.technical_inspection_date,
      tinted: Boolean(row.tinted),
      tintingDate: row.tinting_date,
      engine: row.engine,
      transmission: row.transmission,
      fuelType: row.fuel_type,
      bodyType: row.body_type,
      driveType: row.drive_type,
      color: row.color,
      condition: row.condition,
      vin: row.vin,
      location: row.location,
      batteryCapacity: row.battery_capacity,
      electricRange: row.electric_range,
      createdAt: new Date(row.created_at)
    };
  }

  // Bid operations
  async getBidsForListing(listingId: number): Promise<Bid[]> {
    const stmt = this.db.prepare('SELECT * FROM bids WHERE listing_id = ? ORDER BY created_at DESC');
    const rows: any[] = stmt.all(listingId);
    return rows.map((row: any) => ({
      id: row.id,
      listingId: row.listing_id,
      bidderId: row.bidder_id,
      amount: row.amount.toString(),
      createdAt: new Date(row.created_at)
    }));
  }

  async getBidsByUser(bidderId: number): Promise<Bid[]> {
    const stmt = this.db.prepare('SELECT * FROM bids WHERE bidder_id = ? ORDER BY created_at DESC');
    const rows: any[] = stmt.all(bidderId);
    return rows.map((row: any) => ({
      id: row.id,
      listingId: row.listing_id,
      bidderId: row.bidder_id,
      amount: row.amount.toString(),
      createdAt: new Date(row.created_at)
    }));
  }

  async getBidCountForListing(listingId: number): Promise<number> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM bids WHERE listing_id = ?');
    const row: any = stmt.get(listingId);
    return row.count;
  }

  async getBidCountsForListings(listingIds: number[]): Promise<Record<number, number>> {
    const counts: Record<number, number> = {};
    for (const id of listingIds) {
      counts[id] = await this.getBidCountForListing(id);
    }
    return counts;
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const stmt = this.db.prepare(`
      INSERT INTO bids (listing_id, bidder_id, amount) 
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(
      insertBid.listingId,
      insertBid.bidderId,
      parseFloat(insertBid.amount)
    );
    
    // Get the created bid
    const getBidStmt = this.db.prepare('SELECT * FROM bids WHERE id = ?');
    const row: any = getBidStmt.get(result.lastInsertRowid);
    
    return {
      id: row.id,
      listingId: row.listing_id,
      bidderId: row.bidder_id,
      amount: row.amount.toString(),
      createdAt: new Date(row.created_at)
    };
  }
  // Favorites operations
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    const stmt = this.db.prepare('SELECT * FROM favorites WHERE user_id = ?');
    const rows: any[] = stmt.all(userId);
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      listingId: row.listing_id,
      createdAt: new Date(row.created_at)
    }));
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const stmt = this.db.prepare(`
      INSERT INTO favorites (user_id, listing_id) 
      VALUES (?, ?)
    `);
    
    const result = stmt.run(
      insertFavorite.userId,
      insertFavorite.listingId
    );
    
    // Get the created favorite
    const getFavoriteStmt = this.db.prepare('SELECT * FROM favorites WHERE id = ?');
    const row: any = getFavoriteStmt.get(result.lastInsertRowid);
    
    return {
      id: row.id,
      userId: row.user_id,
      listingId: row.listing_id,
      createdAt: new Date(row.created_at)
    };
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM favorites WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
  async getUsersWithFavoriteListing(listingId: number): Promise<number[]> { return []; }
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC');
      const rows: any[] = stmt.all(userId);
      return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        message: row.message,
        listingId: row.listing_id,
        alertId: row.alert_id || null,
        isRead: Boolean(row.is_read),
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error fetching notifications for user:', userId, error);
      return [];
    }
  }
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, listing_id, alert_id, is_read) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        insertNotification.userId,
        insertNotification.type,
        insertNotification.title,
        insertNotification.message,
        insertNotification.listingId || null,
        insertNotification.alertId || null,
        insertNotification.isRead !== true ? 0 : 1
      );
      
      // Get the created notification
      const getNotificationStmt = this.db.prepare('SELECT * FROM notifications WHERE id = ?');
      const row: any = getNotificationStmt.get(result.lastInsertRowid);
      
      return {
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        message: row.message,
        listingId: row.listing_id,
        alertId: row.alert_id || null,
        isRead: Boolean(row.is_read),
        createdAt: new Date(row.created_at)
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }
  async markNotificationAsRead(id: number): Promise<boolean> {
    try {
      const stmt = this.db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?');
      const result = stmt.run(id);
      console.log(`Marked notification ${id} as read, changes: ${result.changes}`);
      return result.changes > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async deleteNotification(id: number): Promise<boolean> {
    try {
      const stmt = this.db.prepare('DELETE FROM notifications WHERE id = ?');
      const result = stmt.run(id);
      console.log(`Deleted notification ${id}, changes: ${result.changes}`);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
  async getUnreadNotificationCount(userId: number): Promise<number> {
    try {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0');
      const result = stmt.get(userId) as { count: number };
      return result.count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }
  // Car alerts operations
  async getCarAlertsByUser(userId: number): Promise<CarAlert[]> {
    try {
      const stmt = this.db.prepare('SELECT * FROM car_alerts WHERE user_id = ? ORDER BY created_at DESC');
      const rows: any[] = stmt.all(userId);
      return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        make: row.make,
        model: row.model,
        minPrice: row.min_price ? row.min_price.toString() : null,
        maxPrice: row.max_price ? row.max_price.toString() : null,
        maxYear: row.max_year,
        minYear: row.min_year,
        isActive: Boolean(row.is_active),
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error fetching car alerts for user:', userId, error);
      return [];
    }
  }

  async createCarAlert(insertAlert: InsertCarAlert): Promise<CarAlert> {
    const stmt = this.db.prepare(`
      INSERT INTO car_alerts (user_id, make, model, min_price, max_price, max_year, min_year, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      insertAlert.userId,
      insertAlert.make,
      insertAlert.model || null,
      insertAlert.minPrice ? parseFloat(insertAlert.minPrice) : null,
      insertAlert.maxPrice ? parseFloat(insertAlert.maxPrice) : null,
      insertAlert.maxYear || null,
      insertAlert.minYear || null,
      insertAlert.isActive !== false ? 1 : 0
    );
    
    // Get the created alert
    const getAlertStmt = this.db.prepare('SELECT * FROM car_alerts WHERE id = ?');
    const row: any = getAlertStmt.get(result.lastInsertRowid);
    
    return {
      id: row.id,
      userId: row.user_id,
      make: row.make,
      model: row.model,
      minPrice: row.min_price ? row.min_price.toString() : null,
      maxPrice: row.max_price ? row.max_price.toString() : null,
      maxYear: row.max_year,
      minYear: row.min_year,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at)
    };
  }

  async deleteCarAlert(id: number): Promise<boolean> {
    try {
      // Сначала удаляем связанные уведомления (если таблица существует)
      try {
        const deleteNotificationsStmt = this.db.prepare('DELETE FROM notifications WHERE alert_id = ?');
        deleteNotificationsStmt.run(id);
      } catch (e) {
        // Игнорируем если таблица notifications не существует
      }
      
      // Затем удаляем сам поисковый запрос
      const stmt = this.db.prepare('DELETE FROM car_alerts WHERE id = ?');
      const result = stmt.run(id);
      console.log(`Deleted car alert ${id}, changes: ${result.changes}`);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting car alert:', id, error);
      return false;
    }
  }
  async checkAlertsForNewListing(listing: CarListing): Promise<CarAlert[]> {
    try {
      let query = `
        SELECT * FROM car_alerts 
        WHERE is_active = 1 
        AND (make = ? OR make IS NULL)
      `;
      const params: any[] = [listing.make.toLowerCase()];
      
      // Добавляем фильтр по модели если указана
      if (listing.model) {
        query += ' AND (model = ? OR model IS NULL)';
        params.push(listing.model.toLowerCase());
      }
      
      // Добавляем фильтры по цене если указаны
      const startingPrice = parseFloat(listing.startingPrice);
      if (!isNaN(startingPrice)) {
        query += ' AND (min_price IS NULL OR min_price <= ?)';
        params.push(startingPrice);
        query += ' AND (max_price IS NULL OR max_price >= ?)';
        params.push(startingPrice);
      }
      
      // Добавляем фильтр по году если указан
      if (listing.year) {
        query += ' AND (min_year IS NULL OR min_year <= ?)';
        params.push(listing.year);
        query += ' AND (max_year IS NULL OR max_year >= ?)';
        params.push(listing.year);
      }
      
      console.log('Alert check query:', query);
      console.log('Alert check params:', params);
      
      const stmt = this.db.prepare(query);
      const rows: any[] = stmt.all(...params);
      
      console.log(`Checking alerts for ${listing.make} ${listing.model}, found ${rows.length} matching alerts`);
      if (rows.length > 0) {
        console.log('Found alerts:', rows);
      }
      
      return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        make: row.make,
        model: row.model,
        minPrice: row.min_price,
        maxPrice: row.max_price,
        minYear: row.min_year,
        maxYear: row.max_year,
        isActive: Boolean(row.is_active),
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error checking alerts for new listing:', error);
      return [];
    }
  }
  async getBanners(position?: string): Promise<Banner[]> { return []; }
  async createBanner(insertBanner: InsertBanner): Promise<Banner> { throw new Error('Not implemented'); }
  async updateBanner(id: number, bannerData: Partial<InsertBanner>): Promise<Banner | undefined> { return undefined; }
  async deleteBanner(id: number): Promise<boolean> { return false; }
  async getSellCarSection(): Promise<SellCarSection | undefined> {
    const stmt = this.db.prepare('SELECT * FROM sell_car_section LIMIT 1');
    const row: any = stmt.get();
    return row ? {
      id: row.id,
      title: row.title,
      subtitle: row.description || '',
      linkUrl: '',
      buttonText: row.button_text || 'Продать авто',
      backgroundImageUrl: row.image_url || '',
      isActive: true,
      overlayOpacity: 0.5,
      textColor: '#ffffff',
      buttonColor: '#007bff',
      buttonTextColor: '#ffffff',
      createdAt: new Date(row.created_at),
      updatedAt: null
    } : undefined;
  }
  async updateSellCarSection(data: Partial<InsertSellCarSection>): Promise<SellCarSection | undefined> { return undefined; }
  async getAdvertisementCarousel(): Promise<AdvertisementCarousel[]> {
    // For public API, show only active items
    const stmt = this.db.prepare('SELECT * FROM advertisement_carousel WHERE is_active = 1 ORDER BY display_order');
    const rows: any[] = stmt.all();
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || null,
      imageUrl: row.image_url,
      linkUrl: row.link_url || null,
      order: row.display_order || null,
      buttonText: row.button_text || 'Узнать больше',
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : null
    }));
  }

  async getAdvertisementCarouselAll(): Promise<AdvertisementCarousel[]> {
    // For admin API, show all items
    const stmt = this.db.prepare('SELECT * FROM advertisement_carousel ORDER BY display_order');
    const rows: any[] = stmt.all();
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || null,
      imageUrl: row.image_url,
      linkUrl: row.link_url || null,
      order: row.display_order || null,
      buttonText: row.button_text || 'Узнать больше',
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : null
    }));
  }
  async getAdvertisementCarouselItem(id: number): Promise<AdvertisementCarousel | undefined> { return undefined; }
  async createAdvertisementCarouselItem(insertItem: InsertAdvertisementCarousel): Promise<AdvertisementCarousel> {
    const stmt = this.db.prepare(`
      INSERT INTO advertisement_carousel (title, description, image_url, link_url, button_text, display_order, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    const result = stmt.run(
      insertItem.title,
      insertItem.description || null,
      insertItem.imageUrl,
      insertItem.linkUrl || null,
      insertItem.buttonText || 'Узнать больше',
      insertItem.order || 1,
      insertItem.isActive !== false ? 1 : 0
    );
    
    const id = result.lastInsertRowid as number;
    const getStmt = this.db.prepare('SELECT * FROM advertisement_carousel WHERE id = ?');
    const row: any = getStmt.get(id);
    
    return {
      id: row.id,
      title: row.title,
      description: row.description || null,
      imageUrl: row.image_url,
      linkUrl: row.link_url || null,
      buttonText: row.button_text || 'Узнать больше',
      order: row.display_order,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : null
    };
  }
  async updateAdvertisementCarouselItem(id: number, itemData: Partial<InsertAdvertisementCarousel>): Promise<AdvertisementCarousel | undefined> {
    const fields = [];
    const values = [];
    
    if (itemData.title !== undefined) {
      fields.push('title = ?');
      values.push(itemData.title);
    }
    if (itemData.description !== undefined) {
      fields.push('description = ?');
      values.push(itemData.description);
    }
    if (itemData.imageUrl !== undefined) {
      fields.push('image_url = ?');
      values.push(itemData.imageUrl);
    }
    if (itemData.linkUrl !== undefined) {
      fields.push('link_url = ?');
      values.push(itemData.linkUrl);
    }
    if (itemData.buttonText !== undefined) {
      fields.push('button_text = ?');
      values.push(itemData.buttonText);
    }
    if (itemData.order !== undefined) {
      fields.push('display_order = ?');
      values.push(itemData.order);
    }
    if (itemData.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(itemData.isActive ? 1 : 0);
    }
    
    fields.push('updated_at = datetime(\'now\')');
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE advertisement_carousel SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return undefined;
    }
    
    const getStmt = this.db.prepare('SELECT * FROM advertisement_carousel WHERE id = ?');
    const row: any = getStmt.get(id);
    
    if (!row) return undefined;
    
    return {
      id: row.id,
      title: row.title,
      description: row.description || null,
      imageUrl: row.image_url,
      linkUrl: row.link_url || null,
      buttonText: row.button_text || 'Узнать больше',
      order: row.display_order,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : null
    };
  }
  async deleteAdvertisementCarouselItem(id: number): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM advertisement_carousel WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
  async getDocuments(type?: string): Promise<Document[]> { return []; }
  async getDocument(id: number): Promise<Document | undefined> { return undefined; }
  async createDocument(insertDocument: InsertDocument): Promise<Document> { throw new Error('Not implemented'); }
  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> { return undefined; }
  async deleteDocument(id: number): Promise<boolean> { return false; }
  async createAlertView(insertView: InsertAlertView): Promise<AlertView> { throw new Error('Not implemented'); }
  async hasUserViewedAlert(userId: number, alertId: number, listingId: number): Promise<boolean> { return false; }
  async getAdminStats(): Promise<{ pendingListings: number; activeAuctions: number; totalUsers: number; bannedUsers: number }> {
    try {
      // Подсчет объявлений на модерации
      const pendingStmt = this.db.prepare('SELECT COUNT(*) as count FROM car_listings WHERE status = ?');
      const pendingResult = pendingStmt.get('pending') as { count: number };
      
      // Подсчет активных аукционов
      const activeStmt = this.db.prepare('SELECT COUNT(*) as count FROM car_listings WHERE status = ?');
      const activeResult = activeStmt.get('active') as { count: number };
      
      // Подсчет общего количества пользователей
      const usersStmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
      const usersResult = usersStmt.get() as { count: number };
      
      // Подсчет заблокированных пользователей
      const bannedStmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 0');
      const bannedResult = bannedStmt.get() as { count: number };

      return {
        pendingListings: pendingResult.count,
        activeAuctions: activeResult.count,
        totalUsers: usersResult.count,
        bannedUsers: bannedResult.count
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return { pendingListings: 0, activeAuctions: 0, totalUsers: 0, bannedUsers: 0 };
    }
  }

  // Sell Car Banner methods
  async getSellCarBanner(): Promise<any | undefined> {
    try {
      const stmt = this.db.prepare('SELECT * FROM sell_car_banner LIMIT 1');
      const row = stmt.get() as any;
      if (!row) return undefined;
      
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        buttonText: row.button_text,
        linkUrl: row.link_url,
        backgroundImageUrl: row.background_image_url,
        gradientFrom: row.gradient_from,
        gradientTo: row.gradient_to,
        textColor: row.text_color,
        isActive: Boolean(row.is_active),
        overlayOpacity: row.overlay_opacity,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at || row.created_at)
      };
    } catch (error) {
      console.error('Error getting sell car banner:', error);
      return undefined;
    }
  }

  async createSellCarBanner(data: any): Promise<any> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO sell_car_banner (
          title, description, button_text, link_url, background_image_url,
          gradient_from, gradient_to, text_color, is_active, overlay_opacity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        data.title,
        data.description,
        data.buttonText,
        data.linkUrl,
        data.backgroundImageUrl,
        data.gradientFrom,
        data.gradientTo,
        data.textColor,
        data.isActive ? 1 : 0,
        data.overlayOpacity
      );
      
      return this.getSellCarBanner();
    } catch (error) {
      console.error('Error creating sell car banner:', error);
      throw error;
    }
  }

  async updateSellCarBanner(data: any): Promise<any> {
    try {
      // Убеждаемся что баннер существует
      let existingBanner = await this.getSellCarBanner();
      if (!existingBanner) {
        // Создаем если не существует
        return await this.createSellCarBanner(data);
      }
      
      const stmt = this.db.prepare(`
        UPDATE sell_car_banner SET
          title = ?, description = ?, button_text = ?, link_url = ?,
          background_image_url = ?, gradient_from = ?, gradient_to = ?,
          text_color = ?, is_active = ?, overlay_opacity = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      stmt.run(
        data.title || existingBanner.title,
        data.description || existingBanner.description,
        data.buttonText || existingBanner.buttonText,
        data.linkUrl || existingBanner.linkUrl,
        data.backgroundImageUrl || existingBanner.backgroundImageUrl,
        data.gradientFrom || existingBanner.gradientFrom,
        data.gradientTo || existingBanner.gradientTo,
        data.textColor || existingBanner.textColor,
        data.isActive !== undefined ? (data.isActive ? 1 : 0) : (existingBanner.isActive ? 1 : 0),
        data.overlayOpacity !== undefined ? data.overlayOpacity : existingBanner.overlayOpacity,
        existingBanner.id
      );
      
      return this.getSellCarBanner();
    } catch (error) {
      console.error('Error updating sell car banner:', error);
      throw error;
    }
  }

  // Архивирование завершенных аукционов старше 24 часов
  async archiveExpiredListings(): Promise<number> {
    try {
      // Сначала завершаем все просроченные аукционы с автоперезапуском
      const processedCount = await this.processExpiredListings();
      
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      // Безопасно добавляем колонку ended_at если её нет
      try {
        const columnExists = this.db.prepare(`
          SELECT COUNT(*) as count 
          FROM pragma_table_info('car_listings') 
          WHERE name = 'ended_at'
        `).get() as { count: number };
        
        if (columnExists.count === 0) {
          this.db.prepare("ALTER TABLE car_listings ADD COLUMN ended_at DATETIME").run();
        }
      } catch (error) {
        console.error('Error checking/adding ended_at column:', error);
      }
      
      // Считаем архивированные аукционы (ended со старым ended_at)
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM car_listings 
        WHERE status = 'ended' 
        AND ended_at IS NOT NULL 
        AND ended_at <= ?
      `);
      const result = stmt.get(twentyFourHoursAgo) as { count: number };
      console.log(`Found ${result.count} archived listings, processed ${processedCount} expired listings`);
      return result.count;
    } catch (error) {
      console.error('Error archiving expired listings:', error);
      return 0;
    }
  }

  // Обрабатываем все просроченные аукционы (завершение + автоперезапуск)
  async processExpiredListings(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      // Находим все активные аукционы, которые просрочены
      const findExpiredStmt = this.db.prepare(`
        SELECT * FROM car_listings 
        WHERE status = 'active' AND auction_end_time <= ?
      `);
      const expiredListings = findExpiredStmt.all(now).map(row => this.mapListing(row));
      
      console.log(`Найдено ${expiredListings.length} просроченных аукционов`);
      
      let processedCount = 0;
      for (const listing of expiredListings) {
        try {
          // Завершаем аукцион (это автоматически проверит и перезапустит если нужно)
          await this.updateListingStatus(listing.id, 'ended');
          processedCount++;
        } catch (error) {
          console.error(`Ошибка при обработке аукциона ${listing.id}:`, error);
        }
      }
      
      return processedCount;
    } catch (error) {
      console.error('Error processing expired listings:', error);
      return 0;
    }
  }

  // Получить архивированные аукционы (завершенные с ended_at)
  async getArchivedListings(): Promise<CarListing[]> {
    try {
      const stmt = this.db.prepare(`SELECT * FROM car_listings WHERE status = ? AND ended_at IS NOT NULL ORDER BY ended_at DESC`);
      const rows = stmt.all('ended');
      return rows.map(row => this.mapListing(row));
    } catch (error) {
      console.error('Error fetching archived listings:', error);
      return [];
    }
  }

  // Перезапуск аукциона
  async restartListing(id: number): Promise<CarListing | undefined> {
    try {
      const originalListing = await this.getListing(id);
      if (!originalListing || originalListing.status !== 'archived') {
        return undefined;
      }

      // Генерируем новый номер лота
      const newLotNumber = Date.now().toString();
      
      // Создаем новый аукцион с данными оригинала
      const listing = await this.createListing({
        sellerId: originalListing.sellerId,
        lotNumber: newLotNumber,
        make: originalListing.make,
        model: originalListing.model,
        year: originalListing.year,
        mileage: originalListing.mileage,
        description: originalListing.description,
        startingPrice: originalListing.startingPrice,
        photos: JSON.stringify(originalListing.photos),
        auctionDuration: originalListing.auctionDuration,
        engine: originalListing.engine,
        transmission: originalListing.transmission,
        fuelType: originalListing.fuelType,
        bodyType: originalListing.bodyType,
        driveType: originalListing.driveType,
        color: originalListing.color,
        condition: originalListing.condition,
        vin: originalListing.vin,
        location: originalListing.location,
        customsCleared: originalListing.customsCleared,
        recycled: originalListing.recycled,
        technicalInspectionValid: originalListing.technicalInspectionValid,
        technicalInspectionDate: originalListing.technicalInspectionDate,
        tinted: originalListing.tinted,
        tintingDate: originalListing.tintingDate
      });

      // Устанавливаем статус 'active' отдельно
      await this.updateListingStatus(listing.id, 'active');
      return this.getListing(listing.id);
    } catch (error) {
      console.error('Error restarting listing:', error);
      return undefined;
    }
  }

  // Удаление архивированного аукциона навсегда
  async deleteArchivedListing(id: number): Promise<boolean> {
    try {
      // Проверяем что аукцион завершен (ended означает архивированный)
      const listing = await this.getListing(id);
      if (!listing || listing.status !== 'ended') {
        return false;
      }

      // Удаляем связанные ставки
      const deleteBidsStmt = this.db.prepare('DELETE FROM bids WHERE listing_id = ?');
      deleteBidsStmt.run(id);

      // Удаляем из избранного
      const deleteFavoritesStmt = this.db.prepare('DELETE FROM favorites WHERE listing_id = ?');
      deleteFavoritesStmt.run(id);

      // Удаляем сам аукцион
      const deleteListingStmt = this.db.prepare('DELETE FROM car_listings WHERE id = ?');
      const result = deleteListingStmt.run(id);

      console.log(`Permanently deleted archived listing ${id}`);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting archived listing:', error);
      return false;
    }
  }

  // User Wins operations
  async getUserWins(userId: number): Promise<UserWin[]> {
    try {
      console.log(`🏆 Получение выигрышей для пользователя ${userId}`);
      const stmt = this.db.prepare(`
        SELECT uw.*, cl.make, cl.model, cl.year, cl.photos, cl.lot_number
        FROM user_wins uw
        JOIN car_listings cl ON uw.listing_id = cl.id
        WHERE uw.user_id = ?
        ORDER BY uw.won_at DESC
      `);
      const rows: any[] = stmt.all(userId);
      console.log(`🏆 Найдено ${rows.length} выигрышей для пользователя ${userId}`);
      
      return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        listingId: row.listing_id,
        winningBid: row.winning_bid,
        wonAt: new Date(row.won_at),
        // Добавляем информацию об автомобиле для удобства
        listing: {
          make: row.make,
          model: row.model,
          year: row.year,
          photos: JSON.parse(row.photos || '[]'),
          lotNumber: row.lot_number
        }
      }));
    } catch (error) {
      console.error('Error fetching user wins:', userId, error);
      return [];
    }
  }

  async createUserWin(insertWin: InsertUserWin): Promise<UserWin> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO user_wins (user_id, listing_id, winning_bid) 
        VALUES (?, ?, ?)
      `);
      
      const result = stmt.run(
        insertWin.userId,
        insertWin.listingId,
        insertWin.winningBid
      );
      
      // Get the created win
      const getWinStmt = this.db.prepare('SELECT * FROM user_wins WHERE id = ?');
      const row: any = getWinStmt.get(result.lastInsertRowid);
      
      return {
        id: row.id,
        userId: row.user_id,
        listingId: row.listing_id,
        winningBid: row.winning_bid,
        wonAt: new Date(row.won_at)
      };
    } catch (error) {
      console.error('Error creating user win:', error);
      throw error;
    }
  }

  async getWinByListingId(listingId: number): Promise<UserWin | undefined> {
    try {
      const stmt = this.db.prepare('SELECT * FROM user_wins WHERE listing_id = ?');
      const row: any = stmt.get(listingId);
      
      if (!row) return undefined;
      
      return {
        id: row.id,
        userId: row.user_id,
        listingId: row.listing_id,
        winningBid: row.winning_bid,
        wonAt: new Date(row.won_at)
      };
    } catch (error) {
      console.error('Error fetching win by listing ID:', listingId, error);
      return undefined;
    }
  }

  // Получить все выигрыши для админ панели
  async getAllWins(): Promise<any[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT 
          uw.id,
          uw.user_id,
          uw.listing_id,
          uw.winning_bid,
          uw.won_at,
          u.full_name as winner_name,
          u.phone_number as winner_phone,
          cl.make,
          cl.model,
          cl.year,
          cl.lot_number,
          cl.photos
        FROM user_wins uw
        JOIN users u ON uw.user_id = u.id
        JOIN car_listings cl ON uw.listing_id = cl.id
        ORDER BY uw.won_at DESC
      `);
      
      const rows: any[] = stmt.all();
      
      return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        listingId: row.listing_id,
        winningBid: row.winning_bid,
        wonAt: new Date(row.won_at),
        winnerName: row.winner_name || `Пользователь ${row.user_id}`,
        winnerPhone: row.winner_phone,
        listing: {
          make: row.make,
          model: row.model,
          year: row.year,
          lotNumber: row.lot_number,
          photos: JSON.parse(row.photos || '[]')
        }
      }));
    } catch (error) {
      console.error('Error fetching all wins:', error);
      return [];
    }
  }
}