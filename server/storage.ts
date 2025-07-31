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
      
      // Ultra-fast raw SQL query with only essential fields
      const result = await pool.query(`
        SELECT id, seller_id, lot_number, make, model, year, mileage,
               starting_price, current_bid, status, auction_end_time, condition
        FROM car_listings 
        WHERE status = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [status, limit || 20]);
      
      console.log(`Ultra-fast main listings query completed in ${Date.now() - startTime}ms, found ${result.rows.length} listings`);
      
      // Convert to expected format with minimal processing
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
        auctionEndTime: row.auction_end_time,
        photos: [`/api/listings/${row.id}/photo/0`],
        createdAt: new Date(),
        updatedAt: null,
        customsCleared: true,
        recycled: true,
        technicalInspectionValid: false,
        technicalInspectionDate: null,
        tinted: false,
        tintingDate: null,
        condition: row.condition || 'good',
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
    // Get notifications and exclude those that have been viewed via alert_views
    const result = await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        listingId: notifications.listingId,
        alertId: notifications.alertId,
        createdAt: notifications.createdAt
      })
      .from(notifications)
      .leftJoin(
        alertViews,
        and(
          eq(alertViews.userId, notifications.userId),
          eq(alertViews.alertId, notifications.alertId),
          eq(alertViews.listingId, notifications.listingId)
        )
      )
      .where(
        and(
          eq(notifications.userId, userId),
          // Exclude notifications that have been viewed (alert_views entry exists)
          sql`${alertViews.id} IS NULL`
        )
      )
      .orderBy(desc(notifications.createdAt));
    
    return result;
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
      const result = await db
        .update(carListings)
        .set({ status: 'ended' })
        .where(
          and(
            eq(carListings.status, 'active'),
            sql`auction_end_time <= ${now}`
          )
        );
      return result.rowCount || 0;
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
    return [];
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

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async getConversationMessages(conversationId: number): Promise<(Message & { sender: User })[]> {
    return [];
  }

  async getMessagesByConversation(conversationId: number): Promise<any[]> {
    return [];
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
}

// PostgreSQL-only storage implementation - use the Database class
const storage = new DatabaseStorage();

export { storage };