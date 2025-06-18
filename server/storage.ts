import { users, carListings, bids, favorites, notifications, carAlerts, type User, type InsertUser, type CarListing, type InsertCarListing, type Bid, type InsertBid, type Favorite, type InsertFavorite, type Notification, type InsertNotification, type CarAlert, type InsertCarAlert } from "@shared/schema";
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
    const query = db
      .select()
      .from(carListings)
      .where(eq(carListings.status, status))
      .orderBy(desc(carListings.createdAt)); // Show newest listings first
    
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
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
    year?: number;
  }): Promise<CarListing[]> {
    const conditions = [eq(carListings.status, "active")];

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
      conditions.push(eq(carListings.make, filters.make));
    }

    if (filters.model) {
      conditions.push(eq(carListings.model, filters.model));
    }

    if (filters.year) {
      conditions.push(eq(carListings.year, filters.year));
    }

    if (filters.minPrice) {
      conditions.push(sql`CAST(${carListings.startingPrice} AS NUMERIC) >= ${filters.minPrice}`);
    }

    if (filters.maxPrice) {
      conditions.push(sql`CAST(${carListings.startingPrice} AS NUMERIC) <= ${filters.maxPrice}`);
    }

    return await db.select().from(carListings).where(and(...conditions));
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
    
    // Use Promise.all for parallel execution instead of sequential loop
    const countPromises = listingIds.map(async (id) => {
      const count = await this.getBidCountForListing(id);
      return { id, count };
    });
    
    const results = await Promise.all(countPromises);
    
    const counts: Record<number, number> = {};
    for (const result of results) {
      counts[result.id] = result.count;
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
    const result = await db
      .delete(notifications)
      .where(eq(notifications.id, id));
    return result.rowCount !== null && result.rowCount > 0;
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
}

export const storage = new DatabaseStorage();