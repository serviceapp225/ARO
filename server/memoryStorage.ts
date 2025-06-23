import { type User, type InsertUser, type CarListing, type InsertCarListing, type Bid, type InsertBid, type Favorite, type InsertFavorite, type Notification, type InsertNotification, type CarAlert, type InsertCarAlert, type Banner, type InsertBanner, type SellCarSection, type InsertSellCarSection, type AdvertisementCarousel, type InsertAdvertisementCarousel, type Document, type InsertDocument, type AlertView, type InsertAlertView, type SmsVerificationCode, type InsertSmsVerificationCode } from "@shared/schema";
import { IStorage } from "./storage";

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private carListings: CarListing[] = [];
  private bids: Bid[] = [];
  private favorites: Favorite[] = [];
  private notifications: Notification[] = [];
  private carAlerts: CarAlert[] = [];
  private banners: Banner[] = [];
  private sellCarSection: SellCarSection | null = null;
  private advertisementCarousel: AdvertisementCarousel[] = [];
  private documents: Document[] = [];
  private alertViews: AlertView[] = [];
  private smsVerificationCodes: SmsVerificationCode[] = [];
  private nextId = 50;

  constructor() {
    this.initializeWithSampleData();
  }

  private initializeWithSampleData() {
    const now = new Date();

    // Create minimal users
    const adminUser: User = {
      id: 1,
      username: "admin",
      email: "admin@autoauction.tj",
      phoneNumber: null,
      fullName: null,
      role: "admin",
      isActive: true,
      profilePhoto: null,
      createdAt: now,
    };

    const buyerUser: User = {
      id: 2,
      username: "demo",
      email: "demo@autoauction.tj",
      phoneNumber: "+992000000000",
      fullName: "Демо Пользователь",
      role: "buyer",
      isActive: true,
      profilePhoto: null,
      createdAt: now,
    };

    this.users.push(adminUser, buyerUser);

    // Create sell car section
    this.sellCarSection = {
      id: 1,
      title: "Sell Your Car",
      subtitle: "Get the best price for your vehicle",
      linkUrl: "/sell",
      backgroundImageUrl: "/api/sell-car-section/image",
      buttonText: "Start Selling",
      isActive: true,
      createdAt: now,
      overlayOpacity: null,
      textColor: null,
      buttonColor: null,
      buttonTextColor: null,
      updatedAt: null,
    };

    // Create advertisement carousel
    const adCarousel: AdvertisementCarousel = {
      id: 1,
      title: "Premium Cars Available",
      imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400",
      linkUrl: "/listings",
      description: "Discover our collection of premium vehicles",
      buttonText: "View Collection",
      order: 1,
      isActive: true,
      createdAt: now,
      updatedAt: null,
    };

    this.advertisementCarousel.push(adCarousel);

    // Create banners
    const banner1: Banner = {
      id: 1,
      title: "Welcome to AutoAuction",
      description: "Find your perfect car today",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=300",
      linkUrl: "/listings",
      position: "header",
      order: 1,
      isActive: true,
      createdAt: now,
    };

    this.banners.push(banner1);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      ...insertUser,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User | undefined> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.isActive = isActive;
    }
    return user;
  }

  async updateUserProfile(id: number, data: { fullName?: string; profilePhoto?: string }): Promise<User | undefined> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      if (data.fullName !== undefined) user.fullName = data.fullName;
      if (data.profilePhoto !== undefined) user.profilePhoto = data.profilePhoto;
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  // Car listing operations
  async getListing(id: number): Promise<CarListing | undefined> {
    return this.carListings.find(listing => listing.id === id);
  }

  async getListingsByStatus(status: string, limit?: number): Promise<CarListing[]> {
    let filtered = this.carListings.filter(listing => listing.status === status);
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    return filtered;
  }

  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    return this.carListings.filter(listing => listing.sellerId === sellerId);
  }

  async createListing(insertListing: InsertCarListing): Promise<CarListing> {
    const now = new Date();
    const listing: CarListing = {
      ...insertListing,
      id: this.nextId++,
      status: 'active',
      currentBid: null,
      auctionStartTime: now,
      auctionEndTime: new Date(now.getTime() + (insertListing.auctionDuration * 60 * 60 * 1000)),
      createdAt: now,
      // Set default values for nullable boolean fields
      customsCleared: insertListing.customsCleared ?? false,
      recycled: insertListing.recycled ?? false,
      technicalInspectionValid: insertListing.technicalInspectionValid ?? false,
      tinted: insertListing.tinted ?? false,
      // Ensure nullable string fields are properly set
      technicalInspectionDate: insertListing.technicalInspectionDate ?? null,
      tintingDate: insertListing.tintingDate ?? null,
      engine: insertListing.engine ?? null,
      transmission: insertListing.transmission ?? null,
      fuelType: insertListing.fuelType ?? null,
      bodyType: insertListing.bodyType ?? null,
      driveType: insertListing.driveType ?? null,
      color: insertListing.color ?? null,
      condition: insertListing.condition ?? null,
      vin: insertListing.vin ?? null,
      location: insertListing.location ?? null
    };
    this.carListings.push(listing);
    console.log(`Created listing with ID ${listing.id}. Total listings: ${this.carListings.length}`);
    return listing;
  }

  async updateListingStatus(id: number, status: string): Promise<CarListing | undefined> {
    const listing = this.carListings.find(l => l.id === id);
    if (listing) {
      listing.status = status;
    }
    return listing;
  }

  async updateListingCurrentBid(id: number, amount: string): Promise<CarListing | undefined> {
    const listing = this.carListings.find(l => l.id === id);
    if (listing) {
      listing.currentBid = amount;
    }
    return listing;
  }

  async searchListings(filters: any): Promise<CarListing[]> {
    return this.carListings.filter(listing => {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        if (!listing.make.toLowerCase().includes(query) && 
            !listing.model.toLowerCase().includes(query) &&
            !listing.description.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filters.make && listing.make !== filters.make) return false;
      if (filters.model && listing.model !== filters.model) return false;
      if (filters.minPrice && parseFloat(listing.startingPrice) < filters.minPrice) return false;
      if (filters.maxPrice && parseFloat(listing.startingPrice) > filters.maxPrice) return false;
      if (filters.year && listing.year !== filters.year) return false;
      return true;
    });
  }

  // Bid operations
  async getBidsForListing(listingId: number): Promise<Bid[]> {
    return this.bids.filter(bid => bid.listingId === listingId);
  }

  async getBidsByUser(bidderId: number): Promise<Bid[]> {
    return this.bids.filter(bid => bid.bidderId === bidderId);
  }

  async getBidCountForListing(listingId: number): Promise<number> {
    return this.bids.filter(bid => bid.listingId === listingId).length;
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
    this.bids.push(bid);
    return bid;
  }

  // Favorites operations
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return this.favorites.filter(fav => fav.userId === userId);
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const favorite: Favorite = {
      id: this.nextId++,
      ...insertFavorite,
      createdAt: new Date(),
    };
    this.favorites.push(favorite);
    return favorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const index = this.favorites.findIndex(fav => fav.id === id);
    if (index !== -1) {
      this.favorites.splice(index, 1);
      return true;
    }
    return false;
  }

  async getUsersWithFavoriteListing(listingId: number): Promise<number[]> {
    return this.favorites
      .filter(fav => fav.listingId === listingId)
      .map(fav => fav.userId);
  }

  // Notifications operations
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return this.notifications.filter(notif => notif.userId === userId);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.nextId++,
      ...insertNotification,
      createdAt: new Date(),
    };
    this.notifications.push(notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      return true;
    }
    return false;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      return true;
    }
    return false;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }

  // Car alerts operations
  async getCarAlertsByUser(userId: number): Promise<CarAlert[]> {
    return this.carAlerts.filter(alert => alert.userId === userId);
  }

  async createCarAlert(insertAlert: InsertCarAlert): Promise<CarAlert> {
    const alert: CarAlert = {
      id: this.nextId++,
      ...insertAlert,
      createdAt: new Date(),
    };
    this.carAlerts.push(alert);
    return alert;
  }

  async deleteCarAlert(id: number): Promise<boolean> {
    const index = this.carAlerts.findIndex(alert => alert.id === id);
    if (index !== -1) {
      this.carAlerts.splice(index, 1);
      return true;
    }
    return false;
  }

  async checkAlertsForNewListing(listing: CarListing): Promise<CarAlert[]> {
    return this.carAlerts.filter(alert => {
      if (!alert.isActive) return false;
      if (alert.make !== listing.make) return false;
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
    return position ? 
      this.banners.filter(banner => banner.position === position) : 
      this.banners;
  }

  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const banner: Banner = {
      id: this.nextId++,
      ...insertBanner,
      createdAt: new Date(),
    };
    this.banners.push(banner);
    return banner;
  }

  async updateBanner(id: number, bannerData: Partial<InsertBanner>): Promise<Banner | undefined> {
    const banner = this.banners.find(b => b.id === id);
    if (banner) {
      Object.assign(banner, bannerData);
    }
    return banner;
  }

  async deleteBanner(id: number): Promise<boolean> {
    const index = this.banners.findIndex(b => b.id === id);
    if (index !== -1) {
      this.banners.splice(index, 1);
      return true;
    }
    return false;
  }

  // Sell Car Section operations
  async getSellCarSection(): Promise<SellCarSection | undefined> {
    return this.sellCarSection;
  }

  async updateSellCarSection(data: Partial<InsertSellCarSection>): Promise<SellCarSection | undefined> {
    if (this.sellCarSection) {
      Object.assign(this.sellCarSection, data);
      this.sellCarSection.updatedAt = new Date();
    }
    return this.sellCarSection;
  }

  // Advertisement Carousel operations
  async getAdvertisementCarousel(): Promise<AdvertisementCarousel[]> {
    return this.advertisementCarousel;
  }

  async getAdvertisementCarouselItem(id: number): Promise<AdvertisementCarousel | undefined> {
    return this.advertisementCarousel.find(item => item.id === id);
  }

  async createAdvertisementCarouselItem(item: InsertAdvertisementCarousel): Promise<AdvertisementCarousel> {
    const carouselItem: AdvertisementCarousel = {
      id: this.nextId++,
      ...item,
      createdAt: new Date(),
      updatedAt: null,
    };
    this.advertisementCarousel.push(carouselItem);
    return carouselItem;
  }

  async updateAdvertisementCarouselItem(id: number, item: Partial<InsertAdvertisementCarousel>): Promise<AdvertisementCarousel | undefined> {
    const carouselItem = this.advertisementCarousel.find(i => i.id === id);
    if (carouselItem) {
      Object.assign(carouselItem, item);
      carouselItem.updatedAt = new Date();
    }
    return carouselItem;
  }

  async deleteAdvertisementCarouselItem(id: number): Promise<boolean> {
    const index = this.advertisementCarousel.findIndex(i => i.id === id);
    if (index !== -1) {
      this.advertisementCarousel.splice(index, 1);
      return true;
    }
    return false;
  }

  // Documents operations
  async getDocuments(type?: string): Promise<Document[]> {
    return type ? 
      this.documents.filter(doc => doc.type === type) : 
      this.documents;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.find(doc => doc.id === id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const document: Document = {
      id: this.nextId++,
      ...insertDocument,
      createdAt: new Date(),
      updatedAt: null,
    };
    this.documents.push(document);
    return document;
  }

  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.find(d => d.id === id);
    if (document) {
      Object.assign(document, documentData);
      document.updatedAt = new Date();
    }
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const index = this.documents.findIndex(d => d.id === id);
    if (index !== -1) {
      this.documents.splice(index, 1);
      return true;
    }
    return false;
  }

  // Alert Views operations
  async createAlertView(insertView: InsertAlertView): Promise<AlertView> {
    const view: AlertView = {
      id: this.nextId++,
      ...insertView,
      viewedAt: new Date(),
    };
    this.alertViews.push(view);
    return view;
  }

  async hasUserViewedAlert(userId: number, alertId: number, listingId: number): Promise<boolean> {
    return this.alertViews.some(view => 
      view.userId === userId && 
      view.alertId === alertId && 
      view.listingId === listingId
    );
  }

  // SMS Verification operations
  async createSmsVerificationCode(insertCode: InsertSmsVerificationCode): Promise<SmsVerificationCode> {
    const code: SmsVerificationCode = {
      id: this.nextId++,
      ...insertCode,
      createdAt: new Date(),
    };
    this.smsVerificationCodes.push(code);
    return code;
  }

  async getValidSmsCode(phoneNumber: string, code: string): Promise<SmsVerificationCode | undefined> {
    const now = new Date();
    return this.smsVerificationCodes.find(sms => 
      sms.phoneNumber === phoneNumber && 
      sms.code === code && 
      !sms.isUsed && 
      sms.expiresAt > now
    );
  }

  async markSmsCodeAsUsed(id: number): Promise<boolean> {
    const code = this.smsVerificationCodes.find(c => c.id === id);
    if (code) {
      code.isUsed = true;
      return true;
    }
    return false;
  }

  async cleanupExpiredSmsCodes(): Promise<void> {
    const now = new Date();
    this.smsVerificationCodes = this.smsVerificationCodes.filter(code => 
      code.expiresAt > now && !code.isUsed
    );
  }

  // Admin operations
  async getAdminStats(): Promise<{
    pendingListings: number;
    activeAuctions: number;
    totalUsers: number;
    bannedUsers: number;
  }> {
    return {
      pendingListings: this.carListings.filter(l => l.status === 'pending').length,
      activeAuctions: this.carListings.filter(l => l.status === 'active').length,
      totalUsers: this.users.length,
      bannedUsers: this.users.filter(u => !u.isActive).length,
    };
  }
}