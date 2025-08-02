import { users, carListings, bids, favorites, notifications, carAlerts, banners, sellCarSection, sellCarBanner, advertisementCarousel, documents, alertViews, userWins, conversations, messages, type User, type InsertUser, type CarListing, type InsertCarListing, type Bid, type InsertBid, type Favorite, type InsertFavorite, type Notification, type InsertNotification, type CarAlert, type InsertCarAlert, type Banner, type InsertBanner, type SellCarSection, type InsertSellCarSection, type SellCarBanner, type InsertSellCarBanner, type AdvertisementCarousel, type InsertAdvertisementCarousel, type Document, type InsertDocument, type AlertView, type InsertAlertView, type UserWin, type InsertUserWin, type Conversation, type InsertConversation, type Message, type InsertMessage } from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, sql, or, ilike, inArray, isNull, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
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
  getUserWins(userId: number): Promise<UserWin[]>;
  createUserWin(win: InsertUserWin): Promise<UserWin>;
  getWinByListingId(listingId: number): Promise<UserWin | undefined>;

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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
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
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.profilePhoto !== undefined) updateData.profilePhoto = data.profilePhoto;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
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
      
      // Complete SQL query with all fields needed for moderation including winner info
      const result = await pool.query(`
        SELECT cl.id, cl.seller_id, cl.lot_number, cl.make, cl.model, cl.year, cl.mileage,
               cl.starting_price, cl.current_bid, cl.reserve_price, cl.auction_duration, cl.description,
               cl.status, cl.auction_end_time, cl.condition, cl.engine, cl.transmission, cl.fuel_type,
               cl.body_type, cl.drive_type, cl.color, cl.vin, cl.location, cl.ended_at,
               cl.customs_cleared, cl.recycled, cl.technical_inspection_valid, 
               cl.technical_inspection_date, cl.tinted, cl.tinting_date,
               uw.user_id as winner_id, uw.winning_bid, uw.won_at,
               u.full_name as winner_name
        FROM car_listings cl
        LEFT JOIN user_wins uw ON cl.id = uw.listing_id
        LEFT JOIN users u ON uw.user_id = u.id
        WHERE cl.status = $1 
        ORDER BY cl.created_at DESC 
        LIMIT $2
      `, [status, limit || 20]);
      
      console.log(`Ultra-fast main listings query completed in ${Date.now() - startTime}ms, found ${result.rows.length} listings`);
      
      // Convert to expected format with complete data from database including winner info
      const listings = result.rows.map((row: any) => ({
        id: row.id,
        sellerId: row.seller_id,
        customMakeModel: null,
        endedAt: row.ended_at,
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
        location: row.location,
        // Winner information for display
        hasWinner: !!row.winner_id,
        winnerInfo: row.winner_id ? {
          userId: row.winner_id,
          fullName: row.winner_name,
          currentBid: row.winning_bid,
          wonAt: row.won_at
        } : null
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
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount !== null && result.rowCount > 0;
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
      const result = await pool.query(`
        SELECT cl.*, uw.user_id as winner_id, uw.winning_bid, uw.won_at,
               u.full_name as winner_name
        FROM car_listings cl
        LEFT JOIN user_wins uw ON cl.id = uw.listing_id
        LEFT JOIN users u ON uw.user_id = u.id
        WHERE cl.status IN ('ended', 'archived') 
        AND cl.auction_end_time >= $1
        ORDER BY cl.auction_end_time DESC
      `, [cutoffDate]);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        sellerId: row.seller_id,
        customMakeModel: null,
        endedAt: row.ended_at,
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
        createdAt: new Date(row.created_at),
        updatedAt: row.updated_at ? new Date(row.updated_at) : null,
        customsCleared: row.customs_cleared || false,
        recycled: row.recycled || false,
        technicalInspectionValid: row.technical_inspection_valid || false,
        technicalInspectionDate: row.technical_inspection_date || null,
        tinted: row.tinted || false,
        tintingDate: row.tinting_date || null,
        condition: row.condition || 'good',
        auctionDuration: row.auction_duration || 7,
        auctionStartTime: row.auction_start_time ? new Date(row.auction_start_time) : null,
        engine: row.engine,
        transmission: row.transmission,
        fuelType: row.fuel_type,
        bodyType: row.body_type,
        driveType: row.drive_type,
        color: row.color,
        vin: row.vin,
        location: row.location,
        // Winner information for display
        hasWinner: !!row.winner_id,
        winnerInfo: row.winner_id ? {
          userId: row.winner_id,
          fullName: row.winner_name,
          currentBid: row.winning_bid,
          wonAt: row.won_at
        } : null
      })) as CarListing[];
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
            .set({ status: 'ended', updatedAt: now })
            .where(eq(carListings.id, listing.id));

          // Создаем запись о победителе
          await this.createWinnerRecord(listing.id);

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

  async getAdminStats(): Promise<{pendingListings: number; activeAuctions: number; totalUsers: number; bannedUsers: number}> {
    const [pendingResult] = await db.select({ count: sql<number>`count(*)` }).from(carListings).where(eq(carListings.status, 'pending'));
    const [activeResult] = await db.select({ count: sql<number>`count(*)` }).from(carListings).where(eq(carListings.status, 'active'));
    const [totalUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [bannedUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isActive, false));
    
    return {
      pendingListings: pendingResult.count,
      activeAuctions: activeResult.count,
      totalUsers: totalUsersResult.count,
      bannedUsers: bannedUsersResult.count
    };
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    try {
      const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(
          and(
            sql`receiver_id = ${userId}`,
            sql`is_read = false`
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
    await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`receiver_id = ${userId}`
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

  async getUserWins(userId: number): Promise<UserWin[]> {
    // В PostgreSQL версии у нас нет таблицы user_wins
    // Ищем аукционы, которые выиграл пользователь через bids
    const wonListings = await db.select({
      id: sql<number>`1`,
      userId: sql<number>`${userId}`,
      listingId: carListings.id,
      winningBid: carListings.currentBid,
      createdAt: carListings.createdAt
    }).from(carListings)
    .innerJoin(bids, eq(bids.listingId, carListings.id))
    .where(
      and(
        eq(carListings.status, 'ended'),
        eq(bids.bidderId, userId)
      )
    )
    .orderBy(sql`${bids.amount} DESC`)
    .limit(1);

    return wonListings as UserWin[];
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

  // Добавляем функции для работы с победителями
  async getAllWins(): Promise<UserWin[]> {
    try {
      const result = await db.select({
        id: userWins.id,
        userId: userWins.userId,
        listingId: userWins.listingId,
        winningBid: userWins.winningBid,
        wonAt: userWins.wonAt,
        createdAt: sql<Date>`COALESCE(${userWins.wonAt}, NOW())`
      }).from(userWins);
      
      return result as UserWin[];
    } catch (error) {
      console.error('Error getting all wins:', error);
      return [];
    }
  }

  async createWinnerRecord(listingId: number): Promise<void> {
    try {
      // Находим последнюю ставку для этого аукциона
      const [lastBid] = await db.select()
        .from(bids)
        .where(eq(bids.listingId, listingId))
        .orderBy(sql`amount DESC`)
        .limit(1);

      if (!lastBid) {
        console.log(`⚠️ Нет ставок для аукциона ${listingId}, пропускаем создание записи о победителе`);
        return;
      }

      // Проверяем, есть ли уже запись о победителе
      const [existingWin] = await db.select()
        .from(userWins)
        .where(eq(userWins.listingId, listingId))
        .limit(1);

      if (existingWin) {
        console.log(`✅ Запись о победителе для аукциона ${listingId} уже существует`);
        return;
      }

      // Создаем запись о победителе
      await db.insert(userWins).values({
        userId: lastBid.bidderId,
        listingId: listingId,
        winningBid: lastBid.amount.toString(),
        wonAt: new Date()
      });

      console.log(`🏆 Создана запись о победителе аукциона ${listingId}: пользователь ${lastBid.bidderId}, ставка ${lastBid.amount}`);

      // Отправляем SMS уведомление победителю
      await this.sendWinnerSMS(lastBid.bidderId, listingId, lastBid.amount.toString());

    } catch (error) {
      console.error(`❌ Ошибка создания записи о победителе для аукциона ${listingId}:`, error);
    }
  }

  async sendWinnerSMS(userId: number, listingId: number, winningBid: string): Promise<void> {
    try {
      // Получаем информацию о пользователе
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return;

      // Получаем информацию о лоте
      const [listing] = await db.select().from(carListings).where(eq(carListings.id, listingId));
      if (!listing) return;

      const phoneNumber = user.phoneNumber;
      if (!phoneNumber) return;

      // Формируем текст SMS
      const smsText = `🎉 Поздравляем! Вы выиграли аукцион!\n\nАвтомобиль: ${listing.make} ${listing.model} ${listing.year}\nВаша ставка: ${winningBid} сомони\n\nСвяжитесь с продавцом для завершения сделки.\n\nАВТОБИД.ТЖ`;

      // Отправляем SMS через VPS прокси
      const response = await fetch('http://your-vps-ip:3001/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          text: smsText
        })
      });

      if (response.ok) {
        console.log(`📱 SMS уведомление о победе отправлено пользователю ${userId} (${phoneNumber})`);
      } else {
        console.error(`❌ Ошибка отправки SMS победителю ${userId}:`, await response.text());
      }

    } catch (error) {
      console.error(`❌ Ошибка отправки SMS победителю ${userId}:`, error);
    }
  }
}

// PostgreSQL-only storage implementation - use the Database class
const storage = new DatabaseStorage();

export { storage };