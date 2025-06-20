import { users, carListings, bids, favorites, notifications, carAlerts, banners, sellCarSection, advertisementCarousel, documents, type User, type InsertUser, type CarListing, type InsertCarListing, type Bid, type InsertBid, type Favorite, type InsertFavorite, type Notification, type InsertNotification, type CarAlert, type InsertCarAlert, type Banner, type InsertBanner, type SellCarSection, type InsertSellCarSection, type AdvertisementCarousel, type InsertAdvertisementCarousel, type Document, type InsertDocument } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, or, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, isActive: boolean): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Car listing operations
  getListing(id: number): Promise<CarListing | undefined>;
  getListingsByStatus(status: string, limit?: number): Promise<CarListing[]>;
  getListingsBySeller(sellerId: number): Promise<CarListing[]>;
  createListing(listing: InsertCarListing): Promise<CarListing>;
  updateListingStatus(id: number, status: string): Promise<CarListing | undefined>;
  updateListingCurrentBid(id: number, amount: string): Promise<CarListing | undefined>;
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

  // Admin operations
  getAdminStats(): Promise<{
    pendingListings: number;
    activeAuctions: number;
    totalUsers: number;
    bannedUsers: number;
  }>;
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getListing(id: number): Promise<CarListing | undefined> {
    const [listing] = await db.select().from(carListings).where(eq(carListings.id, id));
    return listing || undefined;
  }

  async getListingsByStatus(status: string, limit?: number): Promise<CarListing[]> {
    try {
      let query = db
        .select()
        .from(carListings)
        .where(eq(carListings.status, status))
        .orderBy(desc(carListings.createdAt));
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const listings = await query;
      
      // Return data with photo URLs for performance instead of base64
      return listings.map(listing => {
        let hasPhotos = false;
        try {
          if (listing.photos) {
            if (Array.isArray(listing.photos)) {
              hasPhotos = listing.photos.length > 0;
            } else if (typeof listing.photos === 'string') {
              const photoArray = JSON.parse(listing.photos);
              hasPhotos = photoArray.length > 0;
            }
          }
        } catch (e) {
          hasPhotos = false;
        }
        
        return {
          ...listing,
          // Use photo endpoint URL instead of heavy base64 data
          photos: hasPhotos ? [`/api/listings/${listing.id}/photo/0`] : [],
          description: listing.description?.substring(0, 100) + '...' || ''
        };
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }

  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    return await db.select().from(carListings).where(eq(carListings.sellerId, sellerId));
  }

  async createListing(insertListing: InsertCarListing): Promise<CarListing> {
    // Automatically set new listings as active with proper auction timing
    const now = new Date();
    const auctionEndTime = new Date(now.getTime() + (insertListing.auctionDuration * 60 * 60 * 1000));
    
    const listingData = {
      ...insertListing,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auctionEndTime
    };
    
    const [listing] = await db.insert(carListings).values(listingData).returning();
    return listing;
  }

  async updateListingStatus(id: number, status: string): Promise<CarListing | undefined> {
    const [listing] = await db
      .update(carListings)
      .set({ status })
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
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
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
    const [section] = await db.select().from(sellCarSection).limit(1);
    return section || undefined;
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
}

export const storage = new DatabaseStorage();