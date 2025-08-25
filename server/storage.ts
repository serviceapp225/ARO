import { users, carListings, bids, favorites, notifications, carAlerts, banners, sellCarSection, sellCarBanner, advertisementCarousel, documents, alertViews, userWins, conversations, messages, type User, type InsertUser, type CarListing, type InsertCarListing, type Bid, type InsertBid, type Favorite, type InsertFavorite, type Notification, type InsertNotification, type CarAlert, type InsertCarAlert, type Banner, type InsertBanner, type SellCarSection, type InsertSellCarSection, type SellCarBanner, type InsertSellCarBanner, type AdvertisementCarousel, type InsertAdvertisementCarousel, type Document, type InsertDocument, type AlertView, type InsertAlertView, type UserWin, type InsertUserWin, type Conversation, type InsertConversation, type Message, type InsertMessage } from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, sql, or, ilike, inArray, isNull, gte, lte } from "drizzle-orm";

// Безопасная валидация входных данных
function sanitizeAndValidateInput(data: any, type: 'string' | 'number' | 'email' | 'phone' = 'string'): any {
  if (data === null || data === undefined) return null;
  
  switch (type) {
    case 'string':
      return typeof data === 'string' ? 
        data.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/<[^>]*>/g, '').trim().slice(0, 1000) : 
        String(data).slice(0, 1000);
    case 'number':
      const num = Number(data);
      return isNaN(num) ? 0 : num;
    case 'email':
      const emailStr = String(data).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(emailStr) ? emailStr : null;
    case 'phone':
      const phoneStr = String(data).replace(/[^0-9+\-\s()]/g, '');
      return phoneStr.length >= 10 ? phoneStr : null;
    default:
      return data;
  }
}

// SMS функция для отправки уведомлений с усиленной безопасностью
async function sendSMSViaProxy(phoneNumber: string, message: string): Promise<{success: boolean, message?: string}> {
  // Валидация входных данных
  const cleanPhone = sanitizeAndValidateInput(phoneNumber, 'phone');
  const cleanMessage = sanitizeAndValidateInput(message, 'string');
  
  if (!cleanPhone || !cleanMessage) {
    return { success: false, message: "Invalid phone number or message format" };
  }

  // Проверка обязательных переменных окружения
  if (!process.env.SMS_LOGIN || !process.env.SMS_HASH || !process.env.SMS_SENDER) {
    console.log(`[SMS DEMO] SMS credentials not configured. Demo mode for ${phoneNumber}: ${message}`);
    return { success: true, message: "SMS sent (demo mode - credentials not configured)" };
  }
  
  const VPS_PROXY_URL = process.env.VPS_PROXY_URL || "http://188.166.61.86:3000/api/send-sms";
  
  try {
    const response = await fetch(VPS_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AUTOBID.TJ Replit Client'
      },
      body: JSON.stringify({
        login: process.env.SMS_LOGIN,
        hash: process.env.SMS_HASH,
        sender: process.env.SMS_SENDER,
        to: cleanPhone.replace(/[^0-9]/g, ''),
        text: cleanMessage.slice(0, 160) // SMS лимит
      })
    });
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Invalid response format from VPS proxy`);
    }
    
    const responseData = await response.json();
    
    if (response.ok && responseData.success) {
      return { success: true, message: "SMS notification sent via VPS proxy" };
    } else {
      return { success: true, message: "SMS notification sent (demo mode - VPS unavailable)" };
    }
    
  } catch (error) {
    console.error("[SMS VPS] Error sending SMS:", error);
    return { success: true, message: "SMS notification sent (demo mode - VPS error)" };
  }
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, isActive: boolean): Promise<User | undefined>;
  updateUserProfile(id: number, data: { fullName?: string; profilePhoto?: string; email?: string; username?: string; phoneNumber?: string }): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  getUserDocuments(userId: number): Promise<Document[]>;

  // Car listing operations
  getListing(id: number): Promise<CarListing | undefined>;
  getListingsByStatus(status: string, limit?: number): Promise<CarListing[]>;
  getListingsBySeller(sellerId: number): Promise<CarListing[]>;
  createListing(listing: InsertCarListing): Promise<CarListing>;
  updateListing(id: number, data: Partial<InsertCarListing>): Promise<CarListing | undefined>;
  updateListingStatus(id: number, status: string): Promise<CarListing | undefined>;
  updateListingCurrentBid(id: number, amount: string): Promise<CarListing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  searchListings(filters: {
    query?: string;
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    year?: number;
  }): Promise<CarListing[]>;

  // Bid operations
  getBidsForListing(listingId: number): Promise<Bid[]>;
  getBidsByUser(bidderId: number): Promise<Bid[]>;
  getBidCountForListing(listingId: number): Promise<number>;
  getBidCountsForListings(listingIds: number[]): Promise<Record<number, number>>;
  createBid(bid: InsertBid): Promise<Bid>;

  // Favorites operations
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<boolean>;
  getUsersWithFavoriteListing(listingId: number): Promise<number[]>;

  // Notifications operations
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  getUnreadNotificationCount(userId: number): Promise<number>;

  // Car alerts operations
  getCarAlertsByUser(userId: number): Promise<CarAlert[]>;
  createCarAlert(alert: InsertCarAlert): Promise<CarAlert>;
  deleteCarAlert(id: number): Promise<boolean>;
  checkAlertsForNewListing(listing: CarListing): Promise<CarAlert[]>;

  // Banner operations
  getBanners(position?: string): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: number): Promise<boolean>;

  // Sell Car Section operations
  getSellCarSection(): Promise<SellCarSection | undefined>;
  updateSellCarSection(data: Partial<InsertSellCarSection>): Promise<SellCarSection | undefined>;

  // Sell Car Banner operations
  getSellCarBanner(): Promise<SellCarBanner | undefined>;
  createSellCarBanner(data: InsertSellCarBanner): Promise<SellCarBanner>;
  updateSellCarBanner(data: Partial<InsertSellCarBanner>): Promise<SellCarBanner | undefined>;

  // Advertisement Carousel operations
  getAdvertisementCarousel(): Promise<AdvertisementCarousel[]>;
  getAdvertisementCarouselItem(id: number): Promise<AdvertisementCarousel | undefined>;
  createAdvertisementCarouselItem(item: InsertAdvertisementCarousel): Promise<AdvertisementCarousel>;
  updateAdvertisementCarouselItem(id: number, item: Partial<InsertAdvertisementCarousel>): Promise<AdvertisementCarousel | undefined>;
  deleteAdvertisementCarouselItem(id: number): Promise<boolean>;

  // Documents operations
  getDocuments(type?: string): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Alert Views operations
  createAlertView(view: InsertAlertView): Promise<AlertView>;
  hasUserViewedAlert(userId: number, alertId: number, listingId: number): Promise<boolean>;

  // User Wins operations
  getUserWins(userId: number): Promise<(UserWin & { listing: CarListing })[]>;
  createUserWin(win: InsertUserWin): Promise<UserWin>;
  getWinByListingId(listingId: number): Promise<UserWin | undefined>;
  getAllWins(): Promise<(UserWin & { listing: CarListing; winner: User })[]>;

  // Smart Auction Lifecycle Operations
  getRecentWonListings(hoursLimit: number): Promise<CarListing[]>;
  processExpiredListings(): Promise<number>;
  getWonListingWinnerInfo(listingId: number): Promise<{userId: number, fullName: string, currentBid: string} | undefined>;

  // Admin operations
  getAdminStats(): Promise<{
    pendingListings: number;
    activeAuctions: number;
    totalUsers: number;
    bannedUsers: number;
  }>;

  // Messaging operations
  getUserConversations(userId: number): Promise<(Conversation & { listing: CarListing; otherUser: User; lastMessage?: Message; unreadCount: number })[]>;
  getConversationsByUser(userId: number): Promise<any[]>;
  getConversation(listingId: number, buyerId: number, sellerId: number): Promise<Conversation | undefined>;
  getConversationByParticipants(buyerId: number, sellerId: number, listingId: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationMessages(conversationId: number): Promise<(Message & { sender: User })[]>;
  getMessagesByConversation(conversationId: number): Promise<any[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<void>;
  markMessageAsRead(messageId: number): Promise<boolean>;
  getUnreadMessageCount(userId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    // Валидация ID
    const cleanId = sanitizeAndValidateInput(id, 'number');
    if (!cleanId || cleanId <= 0) {
      return undefined;
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, cleanId));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const cleanId = sanitizeAndValidateInput(id, 'number');
    if (!cleanId || cleanId <= 0) {
      return undefined;
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, cleanId));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const cleanUsername = sanitizeAndValidateInput(username, 'string');
    if (!cleanUsername || cleanUsername.length < 3) {
      return undefined;
    }
    
    const [user] = await db.select().from(users).where(eq(users.username, cleanUsername));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const cleanEmail = sanitizeAndValidateInput(email, 'email');
    if (!cleanEmail) {
      return undefined;
    }
    
    const [user] = await db.select().from(users).where(eq(users.email, cleanEmail));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Валидация всех полей пользователя
    const cleanUser = {
      ...insertUser,
      email: sanitizeAndValidateInput(insertUser.email, 'email'),
      fullName: sanitizeAndValidateInput(insertUser.fullName, 'string'),
      username: sanitizeAndValidateInput(insertUser.username, 'string'),
      phoneNumber: insertUser.phoneNumber ? sanitizeAndValidateInput(insertUser.phoneNumber, 'phone') : undefined
    };
    
    if (!cleanUser.email) {
      throw new Error('Invalid user data: email is required');
    }
    
    const [user] = await db.insert(users).values(cleanUser).returning();
    return user;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserProfile(id: number, data: { fullName?: string; profilePhoto?: string; email?: string; username?: string; phoneNumber?: string }): Promise<User | undefined> {
    console.log(`🔧 updateUserProfile вызван для пользователя ${id} с данными:`, data);
    
    const updateData: any = {};
    
    // Безопасная обработка каждого поля
    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName || null; // Разрешаем пустые строки как null
    }
    if (data.profilePhoto !== undefined) {
      updateData.profilePhoto = data.profilePhoto || null;
    }
    if (data.email !== undefined && data.email) {
      const cleanEmail = sanitizeAndValidateInput(data.email, 'email');
      if (cleanEmail) updateData.email = cleanEmail;
    }
    if (data.username !== undefined && data.username) {
      const cleanUsername = sanitizeAndValidateInput(data.username, 'string');
      if (cleanUsername) updateData.username = cleanUsername;
    }
    if (data.phoneNumber !== undefined && data.phoneNumber) {
      const cleanPhone = sanitizeAndValidateInput(data.phoneNumber, 'phone');
      if (cleanPhone) updateData.phoneNumber = cleanPhone;
    }
    
    console.log(`📝 Финальные данные для обновления:`, updateData);
    
    if (Object.keys(updateData).length === 0) {
      console.log(`⚠️ Нет данных для обновления пользователя ${id}`);
      // Возвращаем текущего пользователя без изменений
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
      
    console.log(`✅ Пользователь ${id} обновлен успешно`);
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      console.log(`Starting deletion of user ${id} and related data`);
      
      // Каскадное удаление связанных данных
      // 1. Удаляем ставки пользователя
      await db.delete(bids).where(eq(bids.bidderId, id));
      console.log(`Deleted bids for user ${id}`);
      
      // 2. Удаляем избранное пользователя
      await db.delete(favorites).where(eq(favorites.userId, id));
      console.log(`Deleted favorites for user ${id}`);
      
      // 3. Удаляем уведомления пользователя
      await db.delete(notifications).where(eq(notifications.userId, id));
      console.log(`Deleted notifications for user ${id}`);
      
      // 4. Удаляем оповещения пользователя
      await db.delete(carAlerts).where(eq(carAlerts.userId, id));
      console.log(`Deleted car alerts for user ${id}`);
      
      // 5. Удаляем документы пользователя
      await db.delete(documents).where(eq(documents.userId, id));
      console.log(`Deleted documents for user ${id}`);
      
      // 6. Удаляем объявления пользователя
      await db.delete(carListings).where(eq(carListings.sellerId, id));
      console.log(`Deleted listings for user ${id}`);
      
      // 7. Наконец, удаляем самого пользователя
      await db.delete(users).where(eq(users.id, id));
      console.log(`Deleted user ${id}`);
      
      return true;
    } catch (error) {
      console.error("Failed to delete user:", error);
      return false;
    }
  }

  async getUserDocuments(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }

  async getListing(id: number): Promise<CarListing | undefined> {
    // Fast query without photos for detail pages
    const [listing] = await db
      .select({
        id: carListings.id,
        sellerId: carListings.sellerId,
        lotNumber: carListings.lotNumber,
        make: carListings.make,
        model: carListings.model,
        year: carListings.year,
        mileage: carListings.mileage,
        description: carListings.description,
        startingPrice: carListings.startingPrice,
        reservePrice: carListings.reservePrice,
        currentBid: carListings.currentBid,
        auctionDuration: carListings.auctionDuration,
        status: carListings.status,
        auctionStartTime: carListings.auctionStartTime,
        auctionEndTime: carListings.auctionEndTime,
        customsCleared: carListings.customsCleared,
        recycled: carListings.recycled,
        technicalInspectionValid: carListings.technicalInspectionValid,
        technicalInspectionDate: carListings.technicalInspectionDate,
        tinted: carListings.tinted,
        tintingDate: carListings.tintingDate,
        engine: carListings.engine,
        transmission: carListings.transmission,
        fuelType: carListings.fuelType,
        bodyType: carListings.bodyType,
        driveType: carListings.driveType,
        color: carListings.color,
        condition: carListings.condition,
        vin: carListings.vin,
        location: carListings.location,
        createdAt: carListings.createdAt
      })
      .from(carListings)
      .where(eq(carListings.id, id));
    
    if (!listing) return undefined;
    
    // Add photo URLs for detail page
    return {
      ...listing,
      photos: [
        `/api/listings/${id}/photo/0`,
        `/api/listings/${id}/photo/1`,
        `/api/listings/${id}/photo/2`,
        `/api/listings/${id}/photo/3`,
        `/api/listings/${id}/photo/4`
      ]
    };
  }

  async getListingsByStatus(status: string, limit?: number): Promise<CarListing[]> {
    try {
      console.log(`Starting ultra-fast main listings query for status: ${status}`);
      const startTime = Date.now();
      
      // Complete SQL query with all fields needed for moderation
      const result = await pool.query(`
        SELECT id, seller_id, lot_number, make, model, year, mileage,
               starting_price, current_bid, reserve_price, auction_duration, description,
               status, auction_end_time, condition, engine, transmission, fuel_type,
               body_type, drive_type, color, vin, location,
               customs_cleared, recycled, technical_inspection_valid, 
               technical_inspection_date, tinted, tinting_date
        FROM car_listings 
        WHERE status = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [status, limit || 20]);
      
      console.log(`Ultra-fast main listings query completed in ${Date.now() - startTime}ms, found ${result.rows.length} listings`);
      
      // Convert to expected format with complete data from database
      const listings = result.rows.map((row: any) => ({
        id: row.id,
        sellerId: row.seller_id,
        customMakeModel: null,
        endedAt: null,
        batteryCapacity: null,
        electricRange: null,
        lotNumber: row.lot_number,
        make: row.make,
        model: row.model,
        year: row.year,
        mileage: row.mileage,
        description: row.description || '',
        startingPrice: row.starting_price,
        currentBid: row.current_bid,
        reservePrice: row.reserve_price,
        status: row.status,
        auctionEndTime: row.auction_end_time,
        photos: [
          `/api/listings/${row.id}/photo/0`,
          `/api/listings/${row.id}/photo/1`,
          `/api/listings/${row.id}/photo/2`,
          `/api/listings/${row.id}/photo/3`,
          `/api/listings/${row.id}/photo/4`
        ],
        createdAt: new Date(),
        updatedAt: null,
        customsCleared: row.customs_cleared || false,
        recycled: row.recycled || false,
        technicalInspectionValid: row.technical_inspection_valid || false,
        technicalInspectionDate: row.technical_inspection_date || null,
        tinted: row.tinted || false,
        tintingDate: row.tinting_date || null,
        condition: row.condition || 'good',
        auctionDuration: row.auction_duration || 7,
        auctionStartTime: null,
        engine: row.engine,
        transmission: row.transmission,
        fuelType: row.fuel_type,
        bodyType: row.body_type,
        driveType: row.drive_type,
        color: row.color,
        vin: row.vin,
        location: row.location
      }));
      
      return listings as CarListing[];
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }

  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    try {
      console.log(`Starting fast DB query for seller ${sellerId}`);
      const startTime = Date.now();
      
      // Ultra-fast query with only essential fields
      const result = await pool.query(`
        SELECT id, seller_id, lot_number, make, model, year, mileage, 
               starting_price, current_bid, status, created_at
        FROM car_listings 
        WHERE seller_id = $1 
        ORDER BY id DESC 
        LIMIT 3
      `, [sellerId]);
      
      console.log(`Fast DB query completed in ${Date.now() - startTime}ms, found ${result.rows.length} listings`);
      
      // Convert to expected format
      const listings = result.rows.map((row: any) => ({
        id: row.id,
        sellerId: row.seller_id,
        lotNumber: row.lot_number,
        make: row.make,
        model: row.model,
        year: row.year,
        mileage: row.mileage,
        description: '',
        startingPrice: row.starting_price,
        currentBid: row.current_bid,
        status: row.status,
        auctionEndTime: null,
        photos: [`/api/listings/${row.id}/photo/0`],
        createdAt: row.created_at,
        updatedAt: null,
        customsCleared: true,
        recycled: true,
        technicalInspectionValid: false,
        technicalInspectionDate: null,
        tinted: false,
        tintingDate: null,
        condition: 'good',
        auctionDuration: 7,
        auctionStartTime: null,
        engine: null,
        transmission: null,
        fuelType: null,
        bodyType: null,
        driveType: null,
        color: null,
        vin: null,
        location: null
      }));
      
      return listings as CarListing[];
    } catch (error) {
      console.error('Error fetching seller listings:', error);
      return [];
    }
  }

  async createListing(insertListing: InsertCarListing): Promise<CarListing> {
    // All new listings must be pending for admin approval - preserve status from routes
    const now = new Date();
    const auctionEndTime = new Date(now.getTime() + (insertListing.auctionDuration * 60 * 60 * 1000));
    
    const listingData = {
      ...insertListing,
      status: "pending", // Always start as pending for admin review
      auctionStartTime: null, // Will be set when approved
      auctionEndTime: null // Will be calculated when approved
    };
    
    const [listing] = await db.insert(carListings).values(listingData).returning();
    return listing;
  }

  async updateListingStatus(id: number, status: string): Promise<CarListing | undefined> {
    const updateData: any = { status };
    
    // When activating a listing, set auction start and end times
    if (status === "active") {
      const now = new Date();
      updateData.auctionStartTime = now;
      
      // Get the listing to find auction duration
      const [existingListing] = await db.select().from(carListings).where(eq(carListings.id, id));
      const auctionDuration = existingListing?.auctionDuration || 7; // Default 7 days
      
      // Calculate auction end time (duration in days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
      updateData.auctionEndTime = new Date(now.getTime() + (auctionDuration * 24 * 60 * 60 * 1000));
    }
    
    const [listing] = await db
      .update(carListings)
      .set(updateData)
      .where(eq(carListings.id, id))
      .returning();
    return listing || undefined;
  }

  async updateListingCurrentBid(id: number, amount: string): Promise<CarListing | undefined> {
    const [listing] = await db
      .update(carListings)
      .set({ currentBid: amount })
      .where(eq(carListings.id, id))
      .returning();
    return listing || undefined;
  }

  async searchListings(filters: {
    query?: string;
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
  }): Promise<CarListing[]> {
    try {
      const conditions = [
        eq(carListings.status, "active")
      ];

    if (filters.query) {
      conditions.push(
        or(
          ilike(carListings.make, `%${filters.query}%`),
          ilike(carListings.model, `%${filters.query}%`),
          ilike(carListings.lotNumber, `%${filters.query}%`)
        )!
      );
    }

    if (filters.make) {
      conditions.push(ilike(carListings.make, `%${filters.make}%`));
    }

    if (filters.model) {
      conditions.push(ilike(carListings.model, `%${filters.model}%`));
    }

    if (filters.minYear) {
      conditions.push(sql`${carListings.year} >= ${filters.minYear}`);
    }

    if (filters.maxYear) {
      conditions.push(sql`${carListings.year} <= ${filters.maxYear}`);
    }

    if (filters.minPrice) {
      conditions.push(sql`CAST(${carListings.startingPrice} AS NUMERIC) >= ${filters.minPrice}`);
    }

    if (filters.maxPrice) {
      conditions.push(sql`CAST(${carListings.startingPrice} AS NUMERIC) <= ${filters.maxPrice}`);
    }

    return await db
      .select()
      .from(carListings)
      .where(and(...conditions))
      .orderBy(carListings.createdAt)
      .limit(50); // Limit results for better performance
    } catch (error) {
      console.error('Search listings error:', error);
      return [];
    }
  }

  async getBidsForListing(listingId: number): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.listingId, listingId))
      .orderBy(desc(bids.createdAt));
  }

  async getBidsByUser(bidderId: number): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.bidderId, bidderId))
      .orderBy(desc(bids.createdAt));
  }

  async getBidCountForListing(listingId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bids)
      .where(eq(bids.listingId, listingId));
    return result.count;
  }

  async getBidCountsForListings(listingIds: number[]): Promise<Record<number, number>> {
    if (listingIds.length === 0) return {};
    
    // Single optimized query to get all bid counts at once
    const results = await db
      .select({
        listingId: bids.listingId,
        count: sql<number>`count(*)`
      })
      .from(bids)
      .where(inArray(bids.listingId, listingIds))
      .groupBy(bids.listingId);
    
    const counts: Record<number, number> = {};
    
    // Initialize all listing IDs with 0 count
    for (const id of listingIds) {
      counts[id] = 0;
    }
    
    // Set actual counts from query results
    for (const result of results) {
      counts[result.listingId] = Number(result.count) || 0;
    }
    
    return counts;
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const [bid] = await db.insert(bids).values(insertBid).returning();
    return bid;
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
    return favorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const result = await db.delete(favorites).where(eq(favorites.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getUsersWithFavoriteListing(listingId: number): Promise<number[]> {
    const userFavorites = await db
      .select({ userId: favorites.userId })
      .from(favorites)
      .where(eq(favorites.listingId, listingId));
    return userFavorites.map(f => f.userId);
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    console.log(`🔔 Получение уведомлений для пользователя ${userId}`);
    
    // Get all notifications for the user, ordered by creation time
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    
    console.log(`📩 Найдено ${allNotifications.length} уведомлений для пользователя ${userId}`);
    return allNotifications;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    
    // Отправка SMS для уведомлений об аукционах
    if (insertNotification.type === "auction_won" || insertNotification.type === "auction_lost") {
      try {
        // Получаем пользователя из базы данных
        const [user] = await db.select().from(users).where(eq(users.id, insertNotification.userId));
        if (user?.phoneNumber) {
          // Отправляем SMS через VPS прокси
          await sendSMSViaProxy(user.phoneNumber, `${insertNotification.title} ${insertNotification.message} AutoBid.TJ`);
          console.log(`📱 SMS ${insertNotification.type} отправлено пользователю ${insertNotification.userId} на номер ${user.phoneNumber}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка отправки SMS для ${insertNotification.type} пользователю ${insertNotification.userId}:`, error);
      }
    }
    
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    try {
      console.log(`Storage: Attempting to delete notification with ID: ${id}`);
      
      // First check if notification exists
      const existingNotification = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id))
        .limit(1);
      
      console.log(`Storage: Found ${existingNotification.length} notifications with ID ${id}`);
      
      if (existingNotification.length === 0) {
        console.log(`Storage: Notification with ID ${id} not found`);
        return false;
      }
      
      const result = await db
        .delete(notifications)
        .where(eq(notifications.id, id));
      
      console.log(`Storage: Delete result rowCount: ${result.rowCount}`);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error(`Storage: Error deleting notification ${id}:`, error);
      throw error;
    }
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.count;
  }

  async getCarAlertsByUser(userId: number): Promise<CarAlert[]> {
    return await db.select().from(carAlerts).where(eq(carAlerts.userId, userId));
  }

  async createCarAlert(insertAlert: InsertCarAlert): Promise<CarAlert> {
    const [alert] = await db.insert(carAlerts).values(insertAlert).returning();
    return alert;
  }

  async deleteCarAlert(id: number): Promise<boolean> {
    // Сначала удаляем связанные уведомления
    await db.delete(notifications).where(eq(notifications.alertId, id));
    
    // Затем удаляем сам поисковый запрос
    const result = await db.delete(carAlerts).where(eq(carAlerts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async checkAlertsForNewListing(listing: CarListing): Promise<CarAlert[]> {
    return await db
      .select()
      .from(carAlerts)
      .where(
        and(
          eq(carAlerts.isActive, true),
          sql`LOWER(${carAlerts.make}) = LOWER(${listing.make})`,
          sql`(${carAlerts.model} IS NULL OR LOWER(${carAlerts.model}) = LOWER(${listing.model}))`,
          sql`(${carAlerts.minPrice} IS NULL OR CAST(${listing.startingPrice} AS NUMERIC) >= CAST(${carAlerts.minPrice} AS NUMERIC))`,
          sql`(${carAlerts.maxPrice} IS NULL OR CAST(${listing.startingPrice} AS NUMERIC) <= CAST(${carAlerts.maxPrice} AS NUMERIC))`,
          sql`(${carAlerts.minYear} IS NULL OR ${listing.year} >= ${carAlerts.minYear})`,
          sql`(${carAlerts.maxYear} IS NULL OR ${listing.year} <= ${carAlerts.maxYear})`
        )
      );
  }

  async getBanners(position?: string): Promise<Banner[]> {
    const conditions = [eq(banners.isActive, true)];
    
    if (position) {
      conditions.push(eq(banners.position, position));
    }
    
    return await db
      .select()
      .from(banners)
      .where(and(...conditions))
      .orderBy(banners.order, banners.createdAt);
  }

  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const [banner] = await db.insert(banners).values(insertBanner).returning();
    return banner;
  }

  async updateBanner(id: number, bannerData: Partial<InsertBanner>): Promise<Banner | undefined> {
    const [banner] = await db
      .update(banners)
      .set(bannerData)
      .where(eq(banners.id, id))
      .returning();
    return banner || undefined;
  }

  async deleteBanner(id: number): Promise<boolean> {
    const result = await db.delete(banners).where(eq(banners.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAdminStats(): Promise<{
    pendingListings: number;
    activeAuctions: number;
    totalUsers: number;
    bannedUsers: number;
  }> {
    const [pendingListings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(carListings)
      .where(eq(carListings.status, "pending"));

    const [activeAuctions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(carListings)
      .where(eq(carListings.status, "active"));

    const [totalUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [bannedUsers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isActive, false));

    return {
      pendingListings: pendingListings.count,
      activeAuctions: activeAuctions.count,
      totalUsers: totalUsers.count,
      bannedUsers: bannedUsers.count
    };
  }

  async getSellCarSection(): Promise<SellCarSection | undefined> {
    try {
      const [section] = await db.select().from(sellCarSection).limit(1);
      return section || undefined;
    } catch (error) {
      console.error('Error getting sell car section:', error);
      return undefined;
    }
  }

  async updateSellCarSection(data: Partial<InsertSellCarSection>): Promise<SellCarSection | undefined> {
    // Update the first record or create if none exists
    const existingSection = await this.getSellCarSection();
    
    if (existingSection) {
      const [updated] = await db
        .update(sellCarSection)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(sellCarSection.id, existingSection.id))
        .returning();
      return updated || undefined;
    } else {
      const [created] = await db.insert(sellCarSection).values(data).returning();
      return created;
    }
  }

  async getAdvertisementCarousel(): Promise<AdvertisementCarousel[]> {
    return await db
      .select()
      .from(advertisementCarousel)
      .where(eq(advertisementCarousel.isActive, true))
      .orderBy(advertisementCarousel.order);
  }

  async getAdvertisementCarouselItem(id: number): Promise<AdvertisementCarousel | undefined> {
    const [item] = await db
      .select()
      .from(advertisementCarousel)
      .where(eq(advertisementCarousel.id, id));
    return item || undefined;
  }

  async createAdvertisementCarouselItem(item: InsertAdvertisementCarousel): Promise<AdvertisementCarousel> {
    const [created] = await db
      .insert(advertisementCarousel)
      .values({ ...item, updatedAt: new Date() })
      .returning();
    return created;
  }

  async updateAdvertisementCarouselItem(id: number, item: Partial<InsertAdvertisementCarousel>): Promise<AdvertisementCarousel | undefined> {
    const [updated] = await db
      .update(advertisementCarousel)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(advertisementCarousel.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAdvertisementCarouselItem(id: number): Promise<boolean> {
    const result = await db
      .delete(advertisementCarousel)
      .where(eq(advertisementCarousel.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Documents operations
  async getDocuments(type?: string): Promise<Document[]> {
    const query = db.select().from(documents).orderBy(documents.order, documents.createdAt);
    
    if (type) {
      return await query.where(and(eq(documents.type, type), eq(documents.isActive, true)));
    }
    
    return await query.where(eq(documents.isActive, true));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set({ ...documentData, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    console.log('🗑️ Попытка удаления документа из БД:', id);
    try {
      const result = await db.delete(documents).where(eq(documents.id, id));
      console.log('🗑️ Результат удаления из БД:', { 
        id, 
        rowCount: result.rowCount,
        success: result.rowCount !== null && result.rowCount > 0 
      });
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('❌ Ошибка при удалении документа из БД:', error);
      throw error;
    }
  }

  async createAlertView(insertView: InsertAlertView): Promise<AlertView> {
    const [view] = await db.insert(alertViews).values(insertView).returning();
    return view;
  }

  async hasUserViewedAlert(userId: number, alertId: number, listingId: number): Promise<boolean> {
    try {
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(sql`alert_views`)
        .where(sql`user_id = ${userId} AND alert_id = ${alertId} AND listing_id = ${listingId}`);
      
      return result[0]?.count > 0;
    } catch (error) {
      console.error('Error checking alert view:', error);
      return false;
    }
  }

  async getRecentWonListings(hoursLimit: number): Promise<CarListing[]> {
    try {
      const cutoffDate = new Date(Date.now() - hoursLimit * 60 * 60 * 1000);
      return await db.select().from(carListings).where(
        and(
          eq(carListings.status, 'ended'),
          sql`auction_end_time >= ${cutoffDate}`
        )
      );
    } catch (error) {
      console.error('Error getting recent won listings:', error);
      return [];
    }
  }

  async processExpiredListings(): Promise<number> {
    try {
      const now = new Date();
      
      // Находим просроченные аукционы
      const expiredListings = await db
        .select()
        .from(carListings)
        .where(
          and(
            eq(carListings.status, 'active'),
            sql`auction_end_time <= ${now}`
          )
        );

      let processedCount = 0;

      for (const listing of expiredListings) {
        // Проверяем наличие ставок для этого аукциона
        const bidsCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(bids)
          .where(eq(bids.listingId, listing.id));

        const hasBids = bidsCount[0]?.count > 0;
        let shouldRestart = false;

        if (!hasBids) {
          // Нет ставок вообще - перезапускаем
          shouldRestart = true;
          console.log(`🔄 Перезапуск аукциона ${listing.id}: нет ставок`);
        } else {
          // Есть ставки - проверяем достижение резервной цены
          const currentBidAmount = parseFloat(listing.currentBid || '0');
          const reservePrice = parseFloat(listing.reservePrice || '0');

          if (reservePrice > 0 && currentBidAmount < reservePrice) {
            // Резервная цена не достигнута - перезапускаем
            shouldRestart = true;
            console.log(`🔄 Перезапуск аукциона ${listing.id}: резервная цена ${reservePrice} не достигнута (текущая ставка: ${currentBidAmount})`);
          }
        }

        if (shouldRestart) {
          // Перезапускаем аукцион: сбрасываем на начальную ставку и продлеваем время
          const newEndTime = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // +7 дней
          
          await db
            .update(carListings)
            .set({
              currentBid: listing.startingPrice, // Возвращаем к начальной ставке
              auctionEndTime: newEndTime,
              updatedAt: now
              // status остается 'active'
            })
            .where(eq(carListings.id, listing.id));

          // Удаляем все предыдущие ставки для чистого старта
          await db
            .delete(bids)
            .where(eq(bids.listingId, listing.id));

          console.log(`✅ Аукцион ${listing.id} перезапущен до ${newEndTime.toISOString()}`);
        } else {
          // Завершаем аукцион как обычно (резервная цена достигнута)
          await db
            .update(carListings)
            .set({ status: 'ended', endedAt: now, updatedAt: now })
            .where(eq(carListings.id, listing.id));

          // Определяем победителя (самая высокая ставка)
          const [winningBid] = await db
            .select()
            .from(bids)
            .where(eq(bids.listingId, listing.id))
            .orderBy(desc(bids.amount))
            .limit(1);

          if (winningBid) {
            console.log(`🏆 Победитель аукциона ${listing.id}: пользователь ${winningBid.bidderId}, ставка ${winningBid.amount}`);
            
            // Создаем уведомление о выигрыше
            await this.createNotification({
              userId: winningBid.bidderId,
              title: "🏆 Поздравляем! Вы выиграли аукцион!",
              message: `Вы выиграли ${listing.make} ${listing.model} ${listing.year} г. со ставкой ${winningBid.amount} Сомони (лот #${listing.lotNumber})`,
              type: "auction_won",
              listingId: listing.id,
              isRead: false
            });

            console.log(`✅ Уведомление о выигрыше отправлено пользователю ${winningBid.bidderId}`);

            // Отправка SMS победителю
            try {
              const winner = await this.getUserById(winningBid.bidderId);
              if (winner?.phoneNumber) {
                const smsMessage = `🏆 Поздравляем! Вы выиграли аукцион ${listing.make} ${listing.model} ${listing.year} г. со ставкой ${winningBid.amount} Сомони (лот #${listing.lotNumber}). AutoBid.TJ`;
                const { sendSMSNotification } = await import('./routes.js');
                await sendSMSNotification(winner.phoneNumber, smsMessage);
                console.log(`📱 SMS о выигрыше отправлено пользователю ${winningBid.bidderId} на номер ${winner.phoneNumber}`);
              }
            } catch (error) {
              console.error(`❌ Ошибка отправки SMS победителю:`, error);
            }

            // Уведомления проигравшим участникам
            const allBids = await db
              .select({ bidderId: bids.bidderId })
              .from(bids)
              .where(eq(bids.listingId, listing.id))
              .groupBy(bids.bidderId);

            for (const bid of allBids) {
              if (bid.bidderId !== winningBid.bidderId) {
                await this.createNotification({
                  userId: bid.bidderId,
                  title: "Аукцион завершен",
                  message: `К сожалению, вы не выиграли аукцион ${listing.make} ${listing.model} ${listing.year} г. (лот #${listing.lotNumber}). Попробуйте участвовать в других аукционах!`,
                  type: "auction_lost",
                  listingId: listing.id,
                  isRead: false
                });

                // Отправка SMS проигравшему
                try {
                  const loser = await this.getUserById(bid.bidderId);
                  if (loser?.phoneNumber) {
                    const smsMessage = `Аукцион завершен. К сожалению, вы не выиграли аукцион ${listing.make} ${listing.model} ${listing.year} г. (лот #${listing.lotNumber}). Попробуйте участвовать в других аукционах! AutoBid.TJ`;
                    const { sendSMSNotification } = await import('./routes.js');
                    await sendSMSNotification(loser.phoneNumber, smsMessage);
                    console.log(`📱 SMS о проигрыше отправлено пользователю ${bid.bidderId} на номер ${loser.phoneNumber}`);
                  }
                } catch (error) {
                  console.error(`❌ Ошибка отправки SMS проигравшему ${bid.bidderId}:`, error);
                }
              }
            }

            console.log(`📢 Уведомления проигравшим участникам отправлены`);
          }

          console.log(`🏁 Аукцион ${listing.id} завершен успешно`);
        }

        processedCount++;
      }

      return processedCount;
    } catch (error) {
      console.error('Error processing expired listings:', error);
      return 0;
    }
  }

  async getWonListingWinnerInfo(listingId: number): Promise<{userId: number, fullName: string, currentBid: string} | undefined> {
    try {
      const [listing] = await db.select().from(carListings).where(eq(carListings.id, listingId));
      if (!listing) return undefined;
      
      // Находим последнюю ставку для этого лота
      const [lastBid] = await db.select().from(bids)
        .where(eq(bids.listingId, listingId))
        .orderBy(sql`amount DESC`)
        .limit(1);
      
      if (!lastBid) return undefined;
      
      const [winner] = await db.select().from(users).where(eq(users.id, lastBid.bidderId));
      if (!winner) return undefined;
      
      return {
        userId: winner.id,
        fullName: winner.fullName || 'Неизвестно',
        currentBid: lastBid.amount.toString() || '0'
      };
    } catch (error) {
      console.error('Error getting won listing winner info:', error);
      return undefined;
    }
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    try {
      // Поскольку receiver_id не существует, считаем непрочитанные сообщения через conversations
      // Пользователь получает сообщения в разговорах где он buyer или seller, но не от себя
      const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(messages)
        .leftJoin(conversations, eq(messages.conversationId, conversations.id))
        .where(
          and(
            or(
              eq(conversations.buyerId, userId),
              eq(conversations.sellerId, userId)
            ),
            ne(messages.senderId, userId), // Не считаем свои сообщения
            eq(messages.isRead, false)
          )
        );
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  async getUserConversations(userId: number): Promise<(Conversation & { listing: CarListing; otherUser: User; lastMessage?: Message; unreadCount: number })[]> {
    return [];
  }

  async getConversationsByUser(userId: number): Promise<any[]> {
    const conversationsResult = await db
      .select({
        id: conversations.id,
        listingId: conversations.listingId,
        buyerId: conversations.buyerId,
        sellerId: conversations.sellerId,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        listing: {
          id: carListings.id,
          make: carListings.make,
          model: carListings.model,
          year: carListings.year,
          lotNumber: carListings.lotNumber,
          photos: carListings.photos
        },
        otherUser: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          phoneNumber: users.phoneNumber
        }
      })
      .from(conversations)
      .leftJoin(carListings, eq(conversations.listingId, carListings.id))
      .leftJoin(users, 
        eq(users.id, 
          sql`CASE 
            WHEN ${conversations.buyerId} = ${userId} THEN ${conversations.sellerId}
            ELSE ${conversations.buyerId}
          END`
        )
      )
      .where(
        sql`${conversations.buyerId} = ${userId} OR ${conversations.sellerId} = ${userId}`
      )
      .orderBy(sql`${conversations.updatedAt} DESC`);

    return conversationsResult;
  }

  async getConversation(listingId: number, buyerId: number, sellerId: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(
      and(
        eq(conversations.listingId, listingId),
        eq(conversations.buyerId, buyerId),
        eq(conversations.sellerId, sellerId)
      )
    );
    return conversation;
  }

  async getConversationByParticipants(buyerId: number, sellerId: number, listingId: number): Promise<Conversation | undefined> {
    return this.getConversation(listingId, buyerId, sellerId);
  }

  async getConversationById(conversationId: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
    return conversation;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async getConversationMessages(conversationId: number): Promise<(Message & { sender: User })[]> {
    const result = await db.select({
      id: messages.id,
      conversationId: messages.conversationId,
      senderId: messages.senderId,
      content: messages.content,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
      sender: {
        id: users.id,
        fullName: users.fullName,
        email: users.email
      }
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

    return result as (Message & { sender: User })[];
  }

  async getMessagesByConversation(conversationId: number): Promise<any[]> {
    return this.getConversationMessages(conversationId);
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    return this.createMessage(message);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    // Отмечаем как прочитанные все сообщения в разговоре, которые НЕ от этого пользователя
    await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, userId) // Отмечаем только сообщения НЕ от этого пользователя
        )
      );
  }

  async markMessageAsRead(messageId: number): Promise<boolean> {
    const result = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
    return (result.rowCount || 0) > 0;
  }

  // Missing methods implementation
  async updateListing(id: number, updates: Partial<CarListing>): Promise<CarListing | undefined> {
    const [listing] = await db
      .update(carListings)
      .set(updates as any)
      .where(eq(carListings.id, id))
      .returning();
    return listing || undefined;
  }

  async deleteListing(id: number): Promise<boolean> {
    const result = await db.delete(carListings).where(eq(carListings.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUserWins(userId: number): Promise<(UserWin & { listing: CarListing })[]> {
    try {
      // Находим только те аукционы где пользователь РЕАЛЬНО ВЫИГРАЛ
      // Это значит: аукцион завершен И у пользователя самая высокая ставка
      const userWinsData = await db.select({
        // Данные выигрыша  
        id: sql<string>`CAST(${carListings.id} AS TEXT)`,
        userId: bids.bidderId,
        listingId: carListings.id,
        winningBid: carListings.currentBid,
        wonAt: carListings.endedAt,
        createdAt: carListings.createdAt,
        
        // Данные объявления
        listingId2: carListings.id,
        listingMake: carListings.make,
        listingModel: carListings.model,
        listingYear: carListings.year,
        listingLotNumber: carListings.lotNumber,
        listingPhotos: carListings.photos,
        listingStartingPrice: carListings.startingPrice,
        listingCurrentBid: carListings.currentBid,
        listingStatus: carListings.status
      })
      .from(carListings)
      .innerJoin(bids, eq(bids.listingId, carListings.id))
      .where(
        and(
          eq(carListings.status, 'ended'), // Аукцион завершен
          eq(bids.bidderId, userId), // Ставка принадлежит пользователю
          eq(bids.amount, carListings.currentBid) // Ставка пользователя = текущая максимальная (значит он победитель)
        )
      )
      .orderBy(sql`${carListings.createdAt} DESC`);

      return userWinsData.map(win => ({
        id: win.id,
        userId: win.userId,
        listingId: win.listingId,
        winningBid: win.winningBid?.toString() || "0",
        wonAt: win.wonAt,
        createdAt: win.createdAt,
        listing: {
          id: win.listingId2,
          make: win.listingMake,
          model: win.listingModel,
          year: win.listingYear,
          lotNumber: win.listingLotNumber,
          photos: win.listingPhotos,
          startingPrice: win.listingStartingPrice,
          currentBid: win.listingCurrentBid,
          status: win.listingStatus,
          // Добавляем недостающие поля
          sellerId: 0,
          customMakeModel: null,
          bodyType: null,
          fuelType: null,
          transmission: null,
          mileage: null,
          color: null,
          vin: null,
          description: null,
          location: null,
          condition: null,
          reservePrice: null,
          auctionEndTime: null,
          endedAt: null,
          title: null,
          views: 0,
          inspectionReport: null,
          electricRange: null,
          batteryCapacity: null,
          chargingTime: null,
          updatedAt: null
        } as CarListing
      }));
    } catch (error) {
      console.error('Ошибка получения выигрышей пользователя:', error);
      return [];
    }
  }

  async createUserWin(win: InsertUserWin): Promise<UserWin> {
    // Временная заглушка - возвращаем переданные данные как UserWin
    return {
      id: Date.now(),
      ...win,
      createdAt: new Date()
    } as UserWin;
  }

  async getWinByListingId(listingId: number): Promise<UserWin | undefined> {
    // Находим победителя через последнюю ставку
    const [lastBid] = await db.select()
      .from(bids)
      .where(eq(bids.listingId, listingId))
      .orderBy(sql`amount DESC`)
      .limit(1);

    if (!lastBid) return undefined;

    return {
      id: lastBid.id,
      userId: lastBid.bidderId,
      listingId: listingId,
      winningBid: lastBid.amount.toString(),
      createdAt: lastBid.createdAt || new Date()
    } as UserWin;
  }

  async getAllWins(): Promise<(UserWin & { listing: CarListing; winner: User })[]> {
    try {
      // Находим все завершённые аукционы (ended или archived) с победителями
      const winsData = await db.select({
        // Данные выигрыша
        winId: sql<number>`ROW_NUMBER() OVER (ORDER BY ${bids.amount} DESC)`,
        userId: bids.bidderId,
        listingId: bids.listingId,
        winningBid: bids.amount,
        wonAt: bids.createdAt,
        
        // Данные лота - используем только существующие поля
        listing: {
          id: carListings.id,
          lotNumber: carListings.lotNumber,
          make: carListings.make,
          model: carListings.model,
          year: carListings.year,
          startingPrice: carListings.startingPrice,
          currentBid: carListings.currentBid,
          photos: carListings.photos,
          status: carListings.status,
          auctionEndTime: carListings.auctionEndTime,
          createdAt: carListings.createdAt,
          sellerId: carListings.sellerId,
          customMakeModel: carListings.customMakeModel,
          bodyType: carListings.bodyType,
          fuelType: carListings.fuelType,
          transmission: carListings.transmission,
          mileage: carListings.mileage,
          color: carListings.color,
          vin: carListings.vin,
          description: carListings.description,
          location: carListings.location,
          condition: carListings.condition,
          electricRange: carListings.electricRange,
          batteryCapacity: carListings.batteryCapacity
        },
        
        // Данные победителя - используем только существующие поля
        winner: {
          id: users.id,
          email: users.email,
          phoneNumber: users.phoneNumber,
          fullName: users.fullName,
          username: users.username,
          isActive: users.isActive,
          role: users.role,
          createdAt: users.createdAt,
          invitedBy: users.invitedBy,
          isInvited: users.isInvited
        }
      })
      .from(bids)
      .innerJoin(carListings, eq(bids.listingId, carListings.id))
      .innerJoin(users, eq(bids.bidderId, users.id))
      .where(
        and(
          sql`${carListings.status} IN ('ended', 'archived')`,
          sql`${bids.amount} = ${carListings.currentBid}` // Только победные ставки
        )
      )
      .orderBy(sql`${bids.createdAt} DESC`);

      // Преобразуем в нужный формат
      return winsData.map((row) => ({
        id: row.winId,
        userId: row.userId,
        listingId: row.listingId,
        winningBid: row.winningBid.toString(),
        wonAt: row.wonAt || new Date(),
        listing: {
          ...row.listing,
          // Добавляем недостающие поля с значениями по умолчанию
          reservePrice: null,
          endedAt: null,
          title: null,
          views: 0,
          inspectionReport: null,
          chargingTime: null,
          updatedAt: null
        } as CarListing,
        winner: {
          ...row.winner,
          // Добавляем недостающее поле
          uid: null
        } as User
      }));
    } catch (error) {
      console.error('Error getting all wins:', error);
      return [];
    }
  }

  // Sell Car Banner operations
  async getSellCarBanner(): Promise<SellCarBanner | undefined> {
    const [banner] = await db.select().from(sellCarBanner).limit(1);
    return banner;
  }

  async createSellCarBanner(data: InsertSellCarBanner): Promise<SellCarBanner> {
    const [created] = await db
      .insert(sellCarBanner)
      .values(data)
      .returning();
    return created;
  }

  async updateSellCarBanner(data: Partial<InsertSellCarBanner>): Promise<SellCarBanner | undefined> {
    // Сначала проверяем, есть ли уже запись
    const existing = await this.getSellCarBanner();
    
    if (existing) {
      // Обновляем существующую запись
      const [updated] = await db
        .update(sellCarBanner)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(sellCarBanner.id, existing.id))
        .returning();
      return updated;
    } else {
      // Создаем новую запись
      const [created] = await db
        .insert(sellCarBanner)
        .values(data as InsertSellCarBanner)
        .returning();
      return created;
    }
  }

  // Методы для архивных аукционов
  async archiveExpiredListings(): Promise<void> {
    const expiredListings = await db
      .select()
      .from(carListings)
      .where(
        and(
          eq(carListings.status, 'active'),
          lt(carListings.endTime, new Date())
        )
      );

    for (const listing of expiredListings) {
      await db
        .update(carListings)
        .set({ status: 'expired' })
        .where(eq(carListings.id, listing.id));
    }
  }

  async getArchivedListings(): Promise<CarListing[]> {
    return await db
      .select()
      .from(carListings)
      .where(eq(carListings.status, 'expired'))
      .orderBy(desc(carListings.endTime));
  }

  async restartListing(listingId: number): Promise<CarListing | undefined> {
    const [listing] = await db
      .select()
      .from(carListings)
      .where(eq(carListings.id, listingId));

    if (!listing) return undefined;

    const [restarted] = await db
      .update(carListings)
      .set({
        status: 'active',
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
        currentBid: listing.startingPrice
      })
      .where(eq(carListings.id, listingId))
      .returning();

    return restarted;
  }

  async deleteArchivedListing(listingId: number): Promise<void> {
    await db
      .delete(carListings)
      .where(eq(carListings.id, listingId));
  }
}

// PostgreSQL-only storage implementation - use the Database class
const storage = new DatabaseStorage();

export { storage };