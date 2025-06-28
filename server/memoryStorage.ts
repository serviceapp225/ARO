import { type User, type InsertUser, type CarListing, type InsertCarListing, type Bid, type InsertBid, type Favorite, type InsertFavorite, type Notification, type InsertNotification, type CarAlert, type InsertCarAlert, type Banner, type InsertBanner, type SellCarSection, type InsertSellCarSection, type AdvertisementCarousel, type InsertAdvertisementCarousel, type Document, type InsertDocument, type AlertView, type InsertAlertView } from "@shared/schema";
import { type IStorage } from "./storage";

export class MemoryStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private carListings: Map<number, CarListing> = new Map();
  private bids: Map<number, Bid> = new Map();
  private favorites: Map<number, Favorite> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private carAlerts: Map<number, CarAlert> = new Map();
  private banners: Map<number, Banner> = new Map();
  private sellCarSection: SellCarSection | undefined;
  private advertisementCarousel: Map<number, AdvertisementCarousel> = new Map();
  private documents: Map<number, Document> = new Map();
  private alertViews: Map<number, AlertView> = new Map();
  
  private nextId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const adminUser: User = {
      id: this.nextId++,
      username: "admin",
      email: "admin@autoauction.tj",
      fullName: "Administrator",
      role: "admin",
      isActive: true,
      profilePhoto: null,
      createdAt: new Date(),
    };
    
    const sellerUser: User = {
      id: this.nextId++,
      username: "seller123",
      email: "seller@autoauction.tj",
      fullName: "Car Seller",
      role: "seller",
      isActive: true,
      profilePhoto: null,
      createdAt: new Date(),
    };

    const buyerUser: User = {
      id: this.nextId++,
      username: "buyer456",
      email: "buyer@autoauction.tj",
      fullName: "Car Buyer",
      role: "buyer",
      isActive: true,
      profilePhoto: null,
      createdAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(sellerUser.id, sellerUser);
    this.users.set(buyerUser.id, buyerUser);

    // Create sample car listings
    const now = new Date();
    const auction1EndTime = new Date('2025-06-30T13:30:00Z');
    const auction2EndTime = new Date('2025-07-01T18:45:00Z');

    const listing1: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "LOT724583",
      make: "Porsche",
      model: "911 Turbo S",
      year: 2020,
      mileage: 15000,
      vin: "WP0AB2A95LS123456",
      description: "This stunning 2020 Porsche 911 Turbo S is a true masterpiece of automotive engineering.",
      startingPrice: "140000.00",
      currentBid: "145500.00",
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction1EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-12-31",
      tinted: false,
      tintingDate: null,
      engine: "3.8L Twin-Turbo V6",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "AWD",
      color: "Black",
      condition: "Excellent",
      location: "Dushanbe",
      createdAt: now,
    };

    const listing2: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "LOT892456",
      make: "BMW",
      model: "M5 Competition",
      year: 2021,
      mileage: 8500,
      vin: "WBSJF0C59MCE12345",
      description: "An exceptional 2021 BMW M5 Competition in pristine condition.",
      startingPrice: "85000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction2EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-11-30",
      tinted: false,
      tintingDate: null,
      engine: "4.4L Twin-Turbo V8",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "RWD",
      color: "White",
      condition: "Excellent",
      location: "Dushanbe",
      createdAt: now,
    };

    this.carListings.set(listing1.id, listing1);
    this.carListings.set(listing2.id, listing2);

    // Create sample bids
    const bid1: Bid = {
      id: this.nextId++,
      listingId: listing1.id,
      bidderId: buyerUser.id,
      amount: "145500.00",
      createdAt: now,
    };
    this.bids.set(bid1.id, bid1);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      email: insertUser.email,
      username: insertUser.username,
      fullName: insertUser.fullName || null,
      role: insertUser.role,
      profilePhoto: insertUser.profilePhoto || null,
      isActive: insertUser.isActive || false,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.isActive = isActive;
      return user;
    }
    return undefined;
  }

  async updateUserProfile(id: number, data: { fullName?: string; profilePhoto?: string }): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      if (data.fullName !== undefined) user.fullName = data.fullName;
      if (data.profilePhoto !== undefined) user.profilePhoto = data.profilePhoto;
      return user;
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Car listing operations
  async getListing(id: number): Promise<CarListing | undefined> {
    return this.carListings.get(id);
  }

  async getListingsByStatus(status: string, limit?: number): Promise<CarListing[]> {
    const listings = Array.from(this.carListings.values()).filter(l => l.status === status);
    return limit ? listings.slice(0, limit) : listings;
  }

  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    return Array.from(this.carListings.values()).filter(l => l.sellerId === sellerId);
  }

  async createListing(insertListing: InsertCarListing): Promise<CarListing> {
    const listing: CarListing = {
      id: this.nextId++,
      sellerId: insertListing.sellerId,
      lotNumber: insertListing.lotNumber,
      make: insertListing.make,
      model: insertListing.model,
      year: insertListing.year,
      mileage: insertListing.mileage,
      description: insertListing.description,
      startingPrice: insertListing.startingPrice,
      currentBid: insertListing.currentBid || null,
      photos: insertListing.photos,
      auctionDuration: insertListing.auctionDuration,
      status: insertListing.status || "pending",
      auctionStartTime: insertListing.auctionStartTime || null,
      auctionEndTime: insertListing.auctionEndTime || null,
      customsCleared: insertListing.customsCleared || false,
      recycled: insertListing.recycled || false,
      technicalInspectionValid: insertListing.technicalInspectionValid || false,
      technicalInspectionDate: insertListing.technicalInspectionDate || null,
      tinted: insertListing.tinted || false,
      tintingDate: insertListing.tintingDate || null,
      engine: insertListing.engine || null,
      transmission: insertListing.transmission || null,
      fuelType: insertListing.fuelType || null,
      bodyType: insertListing.bodyType || null,
      driveType: insertListing.driveType || null,
      color: insertListing.color || null,
      condition: insertListing.condition || null,
      vin: insertListing.vin || null,
      location: insertListing.location || null,
      createdAt: new Date(),
    };
    this.carListings.set(listing.id, listing);
    return listing;
  }

  async updateListingStatus(id: number, status: string): Promise<CarListing | undefined> {
    const listing = this.carListings.get(id);
    if (listing) {
      listing.status = status;
      return listing;
    }
    return undefined;
  }

  async updateListingCurrentBid(id: number, amount: string): Promise<CarListing | undefined> {
    const listing = this.carListings.get(id);
    if (listing) {
      listing.currentBid = amount;
      return listing;
    }
    return undefined;
  }

  async searchListings(filters: {
    query?: string;
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    year?: number;
  }): Promise<CarListing[]> {
    return Array.from(this.carListings.values()).filter(listing => {
      if (filters.query && !listing.make.toLowerCase().includes(filters.query.toLowerCase()) &&
          !listing.model.toLowerCase().includes(filters.query.toLowerCase())) return false;
      if (filters.make && listing.make !== filters.make) return false;
      if (filters.model && listing.model !== filters.model) return false;
      if (filters.year && listing.year !== filters.year) return false;
      if (filters.minPrice && parseFloat(listing.startingPrice) < filters.minPrice) return false;
      if (filters.maxPrice && parseFloat(listing.startingPrice) > filters.maxPrice) return false;
      return true;
    });
  }

  // Bid operations
  async getBidsForListing(listingId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(b => b.listingId === listingId);
  }

  async getBidsByUser(bidderId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(b => b.bidderId === bidderId);
  }

  async getBidCountForListing(listingId: number): Promise<number> {
    return Array.from(this.bids.values()).filter(b => b.listingId === listingId).length;
  }

  async getBidCountsForListings(listingIds: number[]): Promise<Record<number, number>> {
    const counts: Record<number, number> = {};
    for (const id of listingIds) {
      counts[id] = await this.getBidCountForListing(id);
    }
    return counts;
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const bid: Bid = {
      id: this.nextId++,
      ...insertBid,
      createdAt: new Date(),
    };
    this.bids.set(bid.id, bid);
    return bid;
  }

  // Favorites operations
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(f => f.userId === userId);
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const favorite: Favorite = {
      id: this.nextId++,
      ...insertFavorite,
      createdAt: new Date(),
    };
    this.favorites.set(favorite.id, favorite);
    return favorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    return this.favorites.delete(id);
  }

  async getUsersWithFavoriteListing(listingId: number): Promise<number[]> {
    return Array.from(this.favorites.values())
      .filter(f => f.listingId === listingId)
      .map(f => f.userId);
  }

  // Notifications operations
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.nextId++,
      ...insertNotification,
      createdAt: new Date(),
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

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isRead).length;
  }

  // Car alerts operations
  async getCarAlertsByUser(userId: number): Promise<CarAlert[]> {
    return Array.from(this.carAlerts.values()).filter(a => a.userId === userId);
  }

  async createCarAlert(insertAlert: InsertCarAlert): Promise<CarAlert> {
    const alert: CarAlert = {
      id: this.nextId++,
      ...insertAlert,
      createdAt: new Date(),
    };
    this.carAlerts.set(alert.id, alert);
    return alert;
  }

  async deleteCarAlert(id: number): Promise<boolean> {
    return this.carAlerts.delete(id);
  }

  async checkAlertsForNewListing(listing: CarListing): Promise<CarAlert[]> {
    return Array.from(this.carAlerts.values()).filter(alert => {
      if (!alert.isActive) return false;
      if (alert.make && alert.make !== listing.make) return false;
      if (alert.model && alert.model !== listing.model) return false;
      if (alert.minPrice && parseFloat(listing.startingPrice) < parseFloat(alert.minPrice)) return false;
      if (alert.maxPrice && parseFloat(listing.startingPrice) > parseFloat(alert.maxPrice)) return false;
      if (alert.minYear && listing.year < alert.minYear) return false;
      if (alert.maxYear && listing.year > alert.maxYear) return false;
      return true;
    });
  }

  // Banner operations
  async getBanners(position?: string): Promise<Banner[]> {
    const banners = Array.from(this.banners.values());
    return position ? banners.filter(b => b.position === position) : banners;
  }

  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const banner: Banner = {
      id: this.nextId++,
      ...insertBanner,
      createdAt: new Date(),
    };
    this.banners.set(banner.id, banner);
    return banner;
  }

  async updateBanner(id: number, bannerData: Partial<InsertBanner>): Promise<Banner | undefined> {
    const banner = this.banners.get(id);
    if (banner) {
      Object.assign(banner, bannerData);
      return banner;
    }
    return undefined;
  }

  async deleteBanner(id: number): Promise<boolean> {
    return this.banners.delete(id);
  }

  // Sell Car Section operations
  async getSellCarSection(): Promise<SellCarSection | undefined> {
    return this.sellCarSection;
  }

  async updateSellCarSection(data: Partial<InsertSellCarSection>): Promise<SellCarSection | undefined> {
    if (this.sellCarSection) {
      Object.assign(this.sellCarSection, data);
    } else {
      this.sellCarSection = {
        id: this.nextId++,
        title: data.title || "Sell Your Car",
        description: data.description || "Get the best price for your car",
        buttonText: data.buttonText || "Start Selling",
        imageUrl: data.imageUrl || null,
        createdAt: new Date(),
      };
    }
    return this.sellCarSection;
  }

  // Advertisement Carousel operations
  async getAdvertisementCarousel(): Promise<AdvertisementCarousel[]> {
    return Array.from(this.advertisementCarousel.values());
  }

  async getAdvertisementCarouselItem(id: number): Promise<AdvertisementCarousel | undefined> {
    return this.advertisementCarousel.get(id);
  }

  async createAdvertisementCarouselItem(insertItem: InsertAdvertisementCarousel): Promise<AdvertisementCarousel> {
    const item: AdvertisementCarousel = {
      id: this.nextId++,
      ...insertItem,
      createdAt: new Date(),
    };
    this.advertisementCarousel.set(item.id, item);
    return item;
  }

  async updateAdvertisementCarouselItem(id: number, itemData: Partial<InsertAdvertisementCarousel>): Promise<AdvertisementCarousel | undefined> {
    const item = this.advertisementCarousel.get(id);
    if (item) {
      Object.assign(item, itemData);
      return item;
    }
    return undefined;
  }

  async deleteAdvertisementCarouselItem(id: number): Promise<boolean> {
    return this.advertisementCarousel.delete(id);
  }

  // Documents operations
  async getDocuments(type?: string): Promise<Document[]> {
    const docs = Array.from(this.documents.values());
    return type ? docs.filter(d => d.type === type) : docs;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const document: Document = {
      id: this.nextId++,
      ...insertDocument,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.set(document.id, document);
    return document;
  }

  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (document) {
      Object.assign(document, documentData);
      document.updatedAt = new Date();
      return document;
    }
    return undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Alert Views operations
  async createAlertView(insertView: InsertAlertView): Promise<AlertView> {
    const view: AlertView = {
      id: this.nextId++,
      ...insertView,
      createdAt: new Date(),
    };
    this.alertViews.set(view.id, view);
    return view;
  }

  async hasUserViewedAlert(userId: number, alertId: number, listingId: number): Promise<boolean> {
    return Array.from(this.alertViews.values()).some(v => 
      v.userId === userId && v.alertId === alertId && v.listingId === listingId
    );
  }

  // Admin operations
  async getAdminStats(): Promise<{
    pendingListings: number;
    activeAuctions: number;
    totalUsers: number;
    bannedUsers: number;
  }> {
    const listings = Array.from(this.carListings.values());
    const users = Array.from(this.users.values());
    
    return {
      pendingListings: listings.filter(l => l.status === 'pending').length,
      activeAuctions: listings.filter(l => l.status === 'active').length,
      totalUsers: users.length,
      bannedUsers: users.filter(u => !u.isActive).length,
    };
  }
}