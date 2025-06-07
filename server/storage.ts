import { 
  users, 
  carListings, 
  bids, 
  favorites,
  notifications,
  carAlerts,
  type User, 
  type InsertUser,
  type CarListing,
  type InsertCarListing,
  type Bid,
  type InsertBid,
  type Favorite,
  type InsertFavorite,
  type Notification,
  type InsertNotification,
  type CarAlert,
  type InsertCarAlert
} from "@shared/schema";
import { generateUniqueLotNumber } from './utils/lotNumberGenerator';

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

  // Notifications operations
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private carListings: Map<number, CarListing>;
  private bids: Map<number, Bid>;
  private favorites: Map<number, Favorite>;
  private notifications: Map<number, Notification>;
  private carAlerts: Map<number, CarAlert>;
  private currentUserId: number;
  private currentListingId: number;
  private currentBidId: number;
  private currentFavoriteId: number;
  private currentNotificationId: number;
  private currentCarAlertId: number;

  constructor() {
    this.users = new Map();
    this.carListings = new Map();
    this.bids = new Map();
    this.favorites = new Map();
    this.notifications = new Map();
    this.carAlerts = new Map();
    this.currentUserId = 1;
    this.currentListingId = 1;
    this.currentBidId = 1;
    this.currentFavoriteId = 1;
    this.currentNotificationId = 1;
    this.currentCarAlertId = 1;

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
      lotNumber: "724583",
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
      customsCleared: true,
      recycled: true,
      technicalInspectionValid: true,
      technicalInspectionDate: "2026-03-15",
      createdAt: now
    };
    this.carListings.set(listing1.id, listing1);

    const listing2: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "892456",
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
      customsCleared: false,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-08-20",
      createdAt: now
    };
    this.carListings.set(listing2.id, listing2);

    const listing3: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "156789",
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
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-12-15",
      createdAt: now
    };
    this.carListings.set(listing3.id, listing3);

    const listing4: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "349821",
      make: "Mercedes-Benz",
      model: "C-Class",
      year: 2020,
      mileage: 25000,
      vin: "WDDGF8AB5LR123456",
      description: "Elegant Mercedes-Benz C-Class with premium interior and advanced safety features. Excellent condition with full service records.",
      startingPrice: "45000.00",
      currentBid: "48500.00",
      photos: [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 120,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-11-10",
      createdAt: now
    };
    this.carListings.set(listing4.id, listing4);

    const listing5: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "567890",
      make: "Audi",
      model: "A4",
      year: 2019,
      mileage: 32000,
      vin: "WAUFNAF45KN123456",
      description: "Sporty Audi A4 with quattro all-wheel drive. Premium Plus package with navigation and leather interior.",
      startingPrice: "38000.00",
      currentBid: "41200.00",
      photos: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 96,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      customsCleared: true,
      recycled: true,
      technicalInspectionValid: false,
      technicalInspectionDate: null,
      createdAt: now
    };
    this.carListings.set(listing5.id, listing5);

    const listing6: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "234567",
      make: "Toyota",
      model: "Camry",
      year: 2022,
      mileage: 18000,
      vin: "4T1C11AK5NU123456",
      description: "Reliable Toyota Camry Hybrid with excellent fuel economy. Like-new condition with remaining factory warranty.",
      startingPrice: "28000.00",
      currentBid: "30500.00",
      photos: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 144,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      customsCleared: false,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-09-30",
      createdAt: now
    };
    this.carListings.set(listing6.id, listing6);

    const listing7: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "345678",
      make: "Honda",
      model: "CR-V",
      year: 2021,
      mileage: 22000,
      vin: "7FARW2H85ME123456",
      description: "Versatile Honda CR-V SUV with all-wheel drive. Perfect for families with excellent safety ratings and cargo space.",
      startingPrice: "32000.00",
      currentBid: "34800.00",
      photos: [
        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 192,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      customsCleared: true,
      recycled: true,
      technicalInspectionValid: true,
      technicalInspectionDate: "2026-01-25",
      createdAt: now
    };
    this.carListings.set(listing7.id, listing7);

    const listing8: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "456789",
      make: "Lexus",
      model: "RX",
      year: 2020,
      mileage: 28000,
      vin: "2T2BZMCA5LC123456",
      description: "Luxury Lexus RX 350 with premium amenities. Heated and ventilated seats, mark levinson sound system, and more.",
      startingPrice: "52000.00",
      currentBid: "55400.00",
      photos: [
        "https://images.unsplash.com/photo-1606611013875-74d6b4ade6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 216,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
      customsCleared: false,
      recycled: true,
      technicalInspectionValid: false,
      technicalInspectionDate: null,
      createdAt: now
    };
    this.carListings.set(listing8.id, listing8);

    const listing9: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "567891",
      make: "Ford",
      model: "Mustang",
      year: 2021,
      mileage: 15000,
      vin: "1FA6P8TH5M5123456",
      description: "Iconic Ford Mustang GT with V8 engine. Performance package with Brembo brakes and sport-tuned suspension.",
      startingPrice: "42000.00",
      currentBid: "45600.00",
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 168,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      createdAt: now
    };
    this.carListings.set(listing9.id, listing9);

    const listing10: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "678902",
      make: "Volkswagen",
      model: "Golf",
      year: 2020,
      mileage: 28500,
      vin: "WVWZZZ1JZYW123456",
      description: "Efficient Volkswagen Golf with TSI engine. European engineering with excellent build quality and fuel economy.",
      startingPrice: "24000.00",
      currentBid: "26800.00",
      photos: [
        "https://images.unsplash.com/photo-1606016159991-80729d1d2989?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 120,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      createdAt: now
    };
    this.carListings.set(listing10.id, listing10);

    const listing11: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "789013",
      make: "Hyundai",
      model: "Tucson",
      year: 2022,
      mileage: 12000,
      vin: "KM8J3CA46NU123456",
      description: "Modern Hyundai Tucson with advanced safety features. Spacious interior with latest infotainment system and comprehensive warranty.",
      startingPrice: "29000.00",
      currentBid: "31500.00",
      photos: [
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 144,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      createdAt: now
    };
    this.carListings.set(listing11.id, listing11);

    const listing12: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "890124",
      make: "Mazda",
      model: "CX-5",
      year: 2021,
      mileage: 19000,
      vin: "JM3KFBCM1L0123456",
      description: "Stylish Mazda CX-5 with SKYACTIV technology. All-wheel drive with premium interior and advanced safety features.",
      startingPrice: "31000.00",
      currentBid: "33200.00",
      photos: [
        "https://images.unsplash.com/photo-1605559911888-ae4ceb6e4b3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 96,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      createdAt: now
    };
    this.carListings.set(listing12.id, listing12);

    const listing13: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "901235",
      make: "Subaru",
      model: "Outback",
      year: 2020,
      mileage: 35000,
      vin: "4S4BSANC8L3123456",
      description: "Adventure-ready Subaru Outback with symmetrical all-wheel drive. Perfect for outdoor enthusiasts with excellent ground clearance.",
      startingPrice: "26000.00",
      currentBid: "28400.00",
      photos: [
        "https://images.unsplash.com/photo-1544829099-b9a0c5303bea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 168,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      createdAt: now
    };
    this.carListings.set(listing13.id, listing13);

    const listing14: CarListing = {
      id: this.currentListingId++,
      sellerId: sellerUser.id,
      lotNumber: "012346",
      make: "Infiniti",
      model: "Q50",
      year: 2019,
      mileage: 42000,
      vin: "JN1EV7AR5KM123456",
      description: "Luxury Infiniti Q50 with twin-turbo V6 engine. Premium leather interior with advanced driver assistance systems.",
      startingPrice: "35000.00",
      currentBid: "37800.00",
      photos: [
        "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 120,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      createdAt: now
    };
    this.carListings.set(listing14.id, listing14);

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

  async getListingsByStatus(status: string, limit?: number): Promise<CarListing[]> {
    const listings = Array.from(this.carListings.values())
      .filter(listing => listing.status === status);
    
    return limit ? listings.slice(0, limit) : listings;
  }

  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    return Array.from(this.carListings.values())
      .filter(listing => listing.sellerId === sellerId);
  }

  async createListing(insertListing: InsertCarListing): Promise<CarListing> {
    const id = this.currentListingId++;
    const now = new Date();
    const auctionEndTime = new Date(now.getTime() + insertListing.auctionDuration * 60 * 60 * 1000);
    
    // Генерируем уникальный номер лота, если он не предоставлен
    let lotNumber = insertListing.lotNumber;
    if (!lotNumber) {
      const existingLotNumbers = Array.from(this.carListings.values()).map(listing => listing.lotNumber);
      lotNumber = generateUniqueLotNumber(existingLotNumbers);
    }
    
    const listing: CarListing = {
      ...insertListing,
      id,
      lotNumber,
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

  // Notifications operations
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.currentNotificationId++,
      ...insertNotification,
      createdAt: new Date()
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      return true;
    }
    return false;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isRead)
      .length;
  }

  // Car alerts operations
  async getCarAlertsByUser(userId: number): Promise<CarAlert[]> {
    return Array.from(this.carAlerts.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createCarAlert(insertAlert: InsertCarAlert): Promise<CarAlert> {
    const alert: CarAlert = {
      id: this.currentCarAlertId++,
      ...insertAlert,
      createdAt: new Date()
    };
    this.carAlerts.set(alert.id, alert);
    return alert;
  }

  async deleteCarAlert(id: number): Promise<boolean> {
    return this.carAlerts.delete(id);
  }

  async checkAlertsForNewListing(listing: CarListing): Promise<CarAlert[]> {
    const matchingAlerts: CarAlert[] = [];
    
    for (const alert of this.carAlerts.values()) {
      if (!alert.isActive) continue;
      
      // Check make match
      if (alert.make.toLowerCase() !== listing.make.toLowerCase()) continue;
      
      // Check model match if specified
      if (alert.model && alert.model.toLowerCase() !== listing.model.toLowerCase()) continue;
      
      // Check price range if specified
      const listingPrice = parseFloat(listing.startingPrice);
      if (alert.minPrice && listingPrice < parseFloat(alert.minPrice)) continue;
      if (alert.maxPrice && listingPrice > parseFloat(alert.maxPrice)) continue;
      
      // Check year range if specified
      if (alert.minYear && listing.year < alert.minYear) continue;
      if (alert.maxYear && listing.year > alert.maxYear) continue;
      
      matchingAlerts.push(alert);
    }
    
    return matchingAlerts;
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
