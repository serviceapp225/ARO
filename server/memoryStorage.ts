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
  private nextId = 1;

  constructor() {
    this.initializeWithSampleData();
  }

  private initializeWithSampleData() {
    // Create sample users
    const adminUser: User = {
      id: this.nextId++,
      username: "admin",
      email: "admin@autoauction.tj",
      phoneNumber: null,
      fullName: null,
      role: "admin",
      isActive: true,
      profilePhoto: null,
      createdAt: new Date(),
    };

    const sellerUser: User = {
      id: this.nextId++,
      username: "seller123",
      email: "seller@autoauction.tj",
      phoneNumber: null,
      fullName: null,
      role: "seller",
      isActive: true,
      profilePhoto: null,
      createdAt: new Date(),
    };

    const buyerUser: User = {
      id: this.nextId++,
      username: "buyer456",
      email: "buyer@autoauction.tj",
      phoneNumber: null,
      fullName: null,
      role: "buyer",
      isActive: true,
      profilePhoto: null,
      createdAt: new Date(),
    };

    this.users.push(adminUser, sellerUser, buyerUser);

    // Create sample car listings
    const now = new Date();
    const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
    const futureDate2 = new Date(Date.now() + 48 * 60 * 60 * 1000); // 2 days from now

    const listing1: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "382806",
      make: "Mazda",
      model: "Mazda2",
      year: 2014,
      mileage: 145000,
      vin: "JM1BL1SF5E1234567",
      description: "Reliable compact car in very good condition",
      startingPrice: "45000.00",
      currentBid: "51000.00",
      photos: ["/api/listings/41/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate1,
      customsCleared: true,
      recycled: true,
      technicalInspectionValid: false,
      technicalInspectionDate: null,
      tinted: false,
      tintingDate: null,
      engine: "1.5L",
      transmission: "Manual",
      fuelType: "Gasoline",
      bodyType: "Hatchback",
      driveType: "FWD",
      color: "Blue",
      condition: "very_good",
      location: "Dushanbe",
      createdAt: now,
    };

    const listing2: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "482901",
      make: "Toyota",
      model: "Camry",
      year: 2018,
      mileage: 85000,
      vin: "4T1BF1FK5JU123456",
      description: "Executive sedan in excellent condition",
      startingPrice: "85000.00",
      currentBid: "92000.00",
      photos: ["/api/listings/42/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate2,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-12-31",
      tinted: true,
      tintingDate: "2024-06-15",
      engine: "2.5L",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "FWD",
      color: "Silver",
      condition: "excellent",
      location: "Khujand",
      createdAt: now,
    };

    this.carListings.push(listing1, listing2);

    // Create sample bids
    const bid1: Bid = {
      id: this.nextId++,
      listingId: listing1.id,
      bidderId: buyerUser.id,
      amount: "51000.00",
      createdAt: now,
    };

    const bid2: Bid = {
      id: this.nextId++,
      listingId: listing2.id,
      bidderId: buyerUser.id,
      amount: "92000.00",
      createdAt: now,
    };

    this.bids.push(bid1, bid2);

    // Create sample sell car section
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

    // Create sample advertisement carousel
    const adCarousel: AdvertisementCarousel = {
      id: this.nextId++,
      title: "Premium Cars Available",
      description: "Discover luxury vehicles at great prices",
      imageUrl: "/api/advertisement-carousel/1/image",
      linkUrl: "/listings",
      isActive: true,
      order: 1,
      buttonText: null,
      createdAt: now,
      updatedAt: null,
    };

    this.advertisementCarousel.push(adCarousel);
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
    return [...this.users];
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
    const listing: CarListing = {
      id: this.nextId++,
      ...insertListing,
      createdAt: new Date(),
    };
    this.carListings.push(listing);
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
      if (alert.make && alert.make !== listing.make) return false;
      if (alert.model && alert.model !== listing.model) return false;
      if (alert.maxPrice && parseFloat(listing.startingPrice) > parseFloat(alert.maxPrice)) return false;
      return true;
    });
  }

  // Banner operations
  async getBanners(position?: string): Promise<Banner[]> {
    return this.banners.filter(banner => !position || banner.position === position);
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

  // Sell Car Section operations
  async getSellCarSection(): Promise<SellCarSection | undefined> {
    return this.sellCarSection || undefined;
  }

  async updateSellCarSection(data: Partial<InsertSellCarSection>): Promise<SellCarSection | undefined> {
    if (this.sellCarSection) {
      Object.assign(this.sellCarSection, data);
    }
    return this.sellCarSection || undefined;
  }

  // Advertisement Carousel operations
  async getAdvertisementCarousel(): Promise<AdvertisementCarousel[]> {
    return [...this.advertisementCarousel];
  }

  async getAdvertisementCarouselItem(id: number): Promise<AdvertisementCarousel | undefined> {
    return this.advertisementCarousel.find(item => item.id === id);
  }

  async createAdvertisementCarouselItem(item: InsertAdvertisementCarousel): Promise<AdvertisementCarousel> {
    const carouselItem: AdvertisementCarousel = {
      id: this.nextId++,
      ...item,
      createdAt: new Date(),
    };
    this.advertisementCarousel.push(carouselItem);
    return carouselItem;
  }

  async updateAdvertisementCarouselItem(id: number, item: Partial<InsertAdvertisementCarousel>): Promise<AdvertisementCarousel | undefined> {
    const carouselItem = this.advertisementCarousel.find(ci => ci.id === id);
    if (carouselItem) {
      Object.assign(carouselItem, item);
    }
    return carouselItem;
  }

  async deleteAdvertisementCarouselItem(id: number): Promise<boolean> {
    const index = this.advertisementCarousel.findIndex(item => item.id === id);
    if (index !== -1) {
      this.advertisementCarousel.splice(index, 1);
      return true;
    }
    return false;
  }

  // Documents operations
  async getDocuments(type?: string): Promise<Document[]> {
    return this.documents.filter(doc => !type || doc.type === type);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.find(doc => doc.id === id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const document: Document = {
      id: this.nextId++,
      ...insertDocument,
      createdAt: new Date(),
    };
    this.documents.push(document);
    return document;
  }

  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.find(d => d.id === id);
    if (document) {
      Object.assign(document, documentData);
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
      createdAt: new Date(),
    };
    this.alertViews.push(view);
    return view;
  }

  async hasUserViewedAlert(userId: number, alertId: number, listingId: number): Promise<boolean> {
    return this.alertViews.some(view => 
      view.userId === userId && view.alertId === alertId && view.listingId === listingId
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
    return this.smsVerificationCodes.find(smsCode => 
      smsCode.phoneNumber === phoneNumber && 
      smsCode.code === code && 
      !smsCode.isUsed && 
      smsCode.expiresAt > now
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
    this.smsVerificationCodes = this.smsVerificationCodes.filter(code => code.expiresAt > now);
  }
}