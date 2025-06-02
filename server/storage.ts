import { 
  users, 
  carListings, 
  bids, 
  favorites,
  type User, 
  type InsertUser,
  type CarListing,
  type InsertCarListing,
  type Bid,
  type InsertBid,
  type Favorite,
  type InsertFavorite
} from "@shared/schema";

// Enhanced storage interface for car auction functionality
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
    minPrice?: number;
    maxPrice?: number;
    year?: number;
  }): Promise<CarListing[]>;

  // Bid operations
  getBidsForListing(listingId: number): Promise<Bid[]>;
  getBidsByUser(bidderId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;

  // Favorites operations
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<boolean>;

  // Admin operations
  getAdminStats(): Promise<{
    pendingListings: number;
    activeAuctions: number;
    totalUsers: number;
    bannedUsers: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private carListings: Map<number, CarListing>;
  private bids: Map<number, Bid>;
  private favorites: Map<number, Favorite>;
  private currentUserId: number;
  private currentListingId: number;
  private currentBidId: number;
  private currentFavoriteId: number;

  constructor() {
    this.users = new Map();
    this.carListings = new Map();
    this.bids = new Map();
    this.favorites = new Map();
    this.currentUserId = 1;
    this.currentListingId = 1;
    this.currentBidId = 1;
    this.currentFavoriteId = 1;

    // Initialize with some sample data for development
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const adminUser: User = {
      id: this.currentUserId++,
      email: "admin@carauctionapp.com",
      username: "admin",
      role: "admin",
      profilePhoto: null,
      isActive: true,
      createdAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);

    const sellerUser: User = {
      id: this.currentUserId++,
      email: "seller@example.com",
      username: "car_seller_pro",
      role: "seller",
      profilePhoto: null,
      isActive: true,
      createdAt: new Date()
    };
    this.users.set(sellerUser.id, sellerUser);

    const buyerUser: User = {
      id: this.currentUserId++,
      email: "buyer@example.com",
      username: "auction_bidder",
      role: "buyer",
      profilePhoto: null,
      isActive: true,
      createdAt: new Date()
    };
    this.users.set(buyerUser.id, buyerUser);

    // Create sample car listings
    const now = new Date();
    const futureDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

    const listing1: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      make: "Porsche",
      model: "911 Turbo S",
      year: 2020,
      mileage: 15000,
      vin: "WP0AB2A95LS123456",
      description: "This stunning 2020 Porsche 911 Turbo S is a true masterpiece of automotive engineering. With only 15,000 carefully driven miles, this vehicle represents the pinnacle of sports car performance. Features include adaptive suspension, ceramic brakes, and a premium sound system.",
      startingPrice: "140000.00",
      currentBid: "145500.00",
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate,
      createdAt: now
    };
    this.carListings.set(listing1.id, listing1);

    const listing2: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      make: "BMW",
      model: "M3",
      year: 2019,
      mileage: 22000,
      vin: "WBA3B1C50EK123456",
      description: "Exceptional BMW M3 with performance package. Well maintained with full service history. This vehicle offers the perfect balance of luxury and performance.",
      startingPrice: "70000.00",
      currentBid: "75000.00",
      photos: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 168,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      createdAt: now
    };
    this.carListings.set(listing2.id, listing2);

    const listing3: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      make: "Tesla",
      model: "Model S",
      year: 2021,
      mileage: 8500,
      vin: "5YJ3E1EA5LF123456",
      description: "Nearly new Tesla Model S with Autopilot and premium interior. Exceptional electric performance with cutting-edge technology.",
      startingPrice: "80000.00",
      currentBid: "85000.00",
      photos: [
        "https://images.unsplash.com/photo-1536700503339-1e4b06520771?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      createdAt: now
    };
    this.carListings.set(listing3.id, listing3);

    // Create sample bids
    const bid1: Bid = {
      id: this.currentBidId++,
      listingId: listing1.id,
      bidderId: buyerUser.id,
      amount: "145500.00",
      createdAt: new Date(now.getTime() - 2 * 60 * 1000) // 2 minutes ago
    };
    this.bids.set(bid1.id, bid1);

    const bid2: Bid = {
      id: this.currentBidId++,
      listingId: listing1.id,
      bidderId: buyerUser.id,
      amount: "145000.00",
      createdAt: new Date(now.getTime() - 5 * 60 * 1000) // 5 minutes ago
    };
    this.bids.set(bid2.id, bid2);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      isActive: true,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, isActive };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Car listing operations
  async getListing(id: number): Promise<CarListing | undefined> {
    return this.carListings.get(id);
  }

  async getListingsByStatus(status: string, limit: number = 20): Promise<CarListing[]> {
    return Array.from(this.carListings.values())
      .filter(listing => listing.status === status)
      .slice(0, limit);
  }

  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    return Array.from(this.carListings.values())
      .filter(listing => listing.sellerId === sellerId);
  }

  async createListing(insertListing: InsertCarListing): Promise<CarListing> {
    const id = this.currentListingId++;
    const now = new Date();
    const auctionEndTime = new Date(now.getTime() + insertListing.auctionDuration * 60 * 60 * 1000);
    
    const listing: CarListing = {
      ...insertListing,
      id,
      currentBid: null,
      status: "pending",
      auctionStartTime: null,
      auctionEndTime,
      createdAt: now
    };
    
    this.carListings.set(id, listing);
    return listing;
  }

  async updateListingStatus(id: number, status: string): Promise<CarListing | undefined> {
    const listing = this.carListings.get(id);
    if (!listing) return undefined;

    const updatedListing = { 
      ...listing, 
      status,
      auctionStartTime: status === "active" ? new Date() : listing.auctionStartTime
    };
    this.carListings.set(id, updatedListing);
    return updatedListing;
  }

  async updateListingCurrentBid(id: number, amount: string): Promise<CarListing | undefined> {
    const listing = this.carListings.get(id);
    if (!listing) return undefined;

    const updatedListing = { ...listing, currentBid: amount };
    this.carListings.set(id, updatedListing);
    return updatedListing;
  }

  async searchListings(filters: {
    query?: string;
    make?: string;
    minPrice?: number;
    maxPrice?: number;
    year?: number;
  }): Promise<CarListing[]> {
    return Array.from(this.carListings.values())
      .filter(listing => {
        if (listing.status !== "active") return false;
        
        if (filters.query) {
          const query = filters.query.toLowerCase();
          const searchText = `${listing.make} ${listing.model} ${listing.year}`.toLowerCase();
          if (!searchText.includes(query)) return false;
        }
        
        if (filters.make && listing.make.toLowerCase() !== filters.make.toLowerCase()) {
          return false;
        }
        
        if (filters.year && listing.year !== filters.year) {
          return false;
        }
        
        const currentPrice = parseFloat(listing.currentBid || listing.startingPrice);
        if (filters.minPrice && currentPrice < filters.minPrice) {
          return false;
        }
        
        if (filters.maxPrice && currentPrice > filters.maxPrice) {
          return false;
        }
        
        return true;
      });
  }

  // Bid operations
  async getBidsForListing(listingId: number): Promise<Bid[]> {
    return Array.from(this.bids.values())
      .filter(bid => bid.listingId === listingId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBidsByUser(bidderId: number): Promise<Bid[]> {
    return Array.from(this.bids.values())
      .filter(bid => bid.bidderId === bidderId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = this.currentBidId++;
    const bid: Bid = {
      ...insertBid,
      id,
      createdAt: new Date()
    };
    
    this.bids.set(id, bid);
    return bid;
  }

  // Favorites operations
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values())
      .filter(favorite => favorite.userId === userId);
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: new Date()
    };
    
    this.favorites.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    return this.favorites.delete(id);
  }

  // Admin operations
  async getAdminStats(): Promise<{
    pendingListings: number;
    activeAuctions: number;
    totalUsers: number;
    bannedUsers: number;
  }> {
    const allListings = Array.from(this.carListings.values());
    const allUsers = Array.from(this.users.values());

    return {
      pendingListings: allListings.filter(l => l.status === "pending").length,
      activeAuctions: allListings.filter(l => l.status === "active").length,
      totalUsers: allUsers.length,
      bannedUsers: allUsers.filter(u => !u.isActive).length
    };
  }
}

export const storage = new MemStorage();
