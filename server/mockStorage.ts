import { IStorage } from "./storage";
import { User, CarListing, Bid, Favorite, Notification, CarAlert, Banner, SellCarSection, AdvertisementCarousel, Document, AlertView } from "@shared/schema";

// Mock data storage for when database is unavailable
export class MockStorage implements IStorage {
  private users: User[] = [];
  private listings: CarListing[] = [];
  private bids: Bid[] = [];
  private favorites: Favorite[] = [];
  private notifications: Notification[] = [];
  private alerts: CarAlert[] = [];
  private banners: Banner[] = [];
  private sellCarSection: SellCarSection | null = null;
  private adCarousel: AdvertisementCarousel[] = [];
  private documents: Document[] = [];
  private alertViews: AlertView[] = [];

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    // Create mock users
    this.users = [
      {
        id: 1,
        username: "admin",
        email: "admin@autoauction.tj",
        fullName: "Администратор",
        passwordHash: "hash",
        role: "admin",
        isActive: true,
        profilePhoto: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        username: "user1",
        email: "user@autoauction.tj", 
        fullName: "Тестовый пользователь",
        passwordHash: "hash",
        role: "user",
        isActive: true,
        profilePhoto: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Create mock listings
    this.listings = [
      {
        id: 1,
        sellerId: 1,
        lotNumber: "LOT001",
        make: "Toyota",
        model: "Camry",
        year: 2020,
        mileage: 45000,
        vin: "1234567890",
        description: "Отличное состояние, один владелец",
        startingPrice: "25000.00",
        currentBid: "27500.00",
        photos: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb"],
        auctionDuration: 72,
        status: "active",
        auctionStartTime: new Date(),
        auctionEndTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
        customsCleared: true,
        recycled: false,
        technicalInspectionValid: true,
        technicalInspectionDate: "2025-12-31",
        tinted: false,
        tintingDate: null,
        condition: "excellent",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        sellerId: 1,
        lotNumber: "LOT002",
        make: "BMW",
        model: "X5",
        year: 2019,
        mileage: 65000,
        vin: "0987654321",
        description: "Премиум внедорожник в отличном состоянии",
        startingPrice: "45000.00",
        currentBid: "48000.00",
        photos: ["https://images.unsplash.com/photo-1555215695-3004980ad54e"],
        auctionDuration: 48,
        status: "active",
        auctionStartTime: new Date(),
        auctionEndTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        customsCleared: true,
        recycled: false,
        technicalInspectionValid: true,
        technicalInspectionDate: "2025-06-30",
        tinted: true,
        tintingDate: "2023-01-15",
        condition: "very_good",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Create sell car section
    this.sellCarSection = {
      id: 1,
      title: "Продай свое авто",
      description: "Быстро и выгодно продайте свой автомобиль на нашем аукционе",
      buttonText: "Разместить объявление",
      backgroundImage: "https://images.unsplash.com/photo-1580273916550-e323be2ae537",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create advertisement carousel
    this.adCarousel = [
      {
        id: 1,
        title: "Лучшие предложения",
        description: "Найдите автомобиль мечты по выгодной цене",
        imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888",
        linkUrl: "/listings",
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(user: any): Promise<User> {
    const newUser = { ...user, id: this.users.length + 1, createdAt: new Date(), updatedAt: new Date() };
    this.users.push(newUser);
    return newUser;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User | undefined> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.isActive = isActive;
      user.updatedAt = new Date();
    }
    return user;
  }

  async updateUserProfile(id: number, data: { fullName?: string; profilePhoto?: string }): Promise<User | undefined> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      if (data.fullName) user.fullName = data.fullName;
      if (data.profilePhoto) user.profilePhoto = data.profilePhoto;
      user.updatedAt = new Date();
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  // Car listing operations
  async getListing(id: number): Promise<CarListing | undefined> {
    return this.listings.find(l => l.id === id);
  }

  async getListingsByStatus(status: string, limit?: number): Promise<CarListing[]> {
    const filtered = this.listings.filter(l => l.status === status);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    return this.listings.filter(l => l.sellerId === sellerId);
  }

  async createListing(listing: any): Promise<CarListing> {
    const newListing = { 
      ...listing, 
      id: this.listings.length + 1, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.listings.push(newListing);
    return newListing;
  }

  async updateListingStatus(id: number, status: string): Promise<CarListing | undefined> {
    const listing = this.listings.find(l => l.id === id);
    if (listing) {
      listing.status = status;
      listing.updatedAt = new Date();
    }
    return listing;
  }

  async updateListingCurrentBid(id: number, amount: string): Promise<CarListing | undefined> {
    const listing = this.listings.find(l => l.id === id);
    if (listing) {
      listing.currentBid = amount;
      listing.updatedAt = new Date();
    }
    return listing;
  }

  async searchListings(filters: any): Promise<CarListing[]> {
    return this.listings.filter(l => {
      if (filters.make && !l.make.toLowerCase().includes(filters.make.toLowerCase())) return false;
      if (filters.model && !l.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
      if (filters.year && l.year !== filters.year) return false;
      return true;
    });
  }

  // Bid operations  
  async getBidsForListing(listingId: number): Promise<Bid[]> {
    return this.bids.filter(b => b.listingId === listingId);
  }

  async getBidsByUser(bidderId: number): Promise<Bid[]> {
    return this.bids.filter(b => b.bidderId === bidderId);
  }

  async getBidCountForListing(listingId: number): Promise<number> {
    return this.bids.filter(b => b.listingId === listingId).length;
  }

  async getBidCountsForListings(listingIds: number[]): Promise<Record<number, number>> {
    const counts: Record<number, number> = {};
    listingIds.forEach(id => {
      counts[id] = this.bids.filter(b => b.listingId === id).length;
    });
    return counts;
  }

  async createBid(bid: any): Promise<Bid> {
    const newBid = { ...bid, id: this.bids.length + 1, createdAt: new Date() };
    this.bids.push(newBid);
    return newBid;
  }

  // Favorites operations
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return this.favorites.filter(f => f.userId === userId);
  }

  async createFavorite(favorite: any): Promise<Favorite> {
    const newFavorite = { ...favorite, id: this.favorites.length + 1, createdAt: new Date() };
    this.favorites.push(newFavorite);
    return newFavorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const index = this.favorites.findIndex(f => f.id === id);
    if (index > -1) {
      this.favorites.splice(index, 1);
      return true;
    }
    return false;
  }

  async getUsersWithFavoriteListing(listingId: number): Promise<number[]> {
    return this.favorites.filter(f => f.listingId === listingId).map(f => f.userId);
  }

  // Notification operations
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return this.notifications.filter(n => n.userId === userId);
  }

  async createNotification(notification: any): Promise<Notification> {
    const newNotification = { ...notification, id: this.notifications.length + 1, createdAt: new Date() };
    this.notifications.push(newNotification);
    return newNotification;
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
    if (index > -1) {
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
    return this.alerts.filter(a => a.userId === userId);
  }

  async createCarAlert(alert: any): Promise<CarAlert> {
    const newAlert = { ...alert, id: this.alerts.length + 1, createdAt: new Date() };
    this.alerts.push(newAlert);
    return newAlert;
  }

  async deleteCarAlert(id: number): Promise<boolean> {
    const index = this.alerts.findIndex(a => a.id === id);
    if (index > -1) {
      this.alerts.splice(index, 1);
      return true;
    }
    return false;
  }

  async checkAlertsForNewListing(listing: CarListing): Promise<CarAlert[]> {
    return this.alerts.filter(alert => {
      if (alert.make && alert.make !== listing.make) return false;
      if (alert.model && alert.model !== listing.model) return false;
      if (alert.maxPrice && parseFloat(listing.startingPrice) > alert.maxPrice) return false;
      return true;
    });
  }

  // Banner operations
  async getBanners(position?: string): Promise<Banner[]> {
    return this.banners.filter(b => !position || b.position === position);
  }

  async createBanner(banner: any): Promise<Banner> {
    const newBanner = { ...banner, id: this.banners.length + 1, createdAt: new Date(), updatedAt: new Date() };
    this.banners.push(newBanner);
    return newBanner;
  }

  async updateBanner(id: number, banner: any): Promise<Banner | undefined> {
    const existing = this.banners.find(b => b.id === id);
    if (existing) {
      Object.assign(existing, banner, { updatedAt: new Date() });
    }
    return existing;
  }

  async deleteBanner(id: number): Promise<boolean> {
    const index = this.banners.findIndex(b => b.id === id);
    if (index > -1) {
      this.banners.splice(index, 1);
      return true;
    }
    return false;
  }

  // Sell Car Section operations
  async getSellCarSection(): Promise<SellCarSection | undefined> {
    return this.sellCarSection || undefined;
  }

  async updateSellCarSection(data: any): Promise<SellCarSection | undefined> {
    if (this.sellCarSection) {
      Object.assign(this.sellCarSection, data, { updatedAt: new Date() });
    }
    return this.sellCarSection || undefined;
  }

  // Advertisement Carousel operations
  async getAdvertisementCarousel(): Promise<AdvertisementCarousel[]> {
    return this.adCarousel;
  }

  async getAdvertisementCarouselItem(id: number): Promise<AdvertisementCarousel | undefined> {
    return this.adCarousel.find(item => item.id === id);
  }

  async createAdvertisementCarouselItem(item: any): Promise<AdvertisementCarousel> {
    const newItem = { ...item, id: this.adCarousel.length + 1, createdAt: new Date(), updatedAt: new Date() };
    this.adCarousel.push(newItem);
    return newItem;
  }

  async updateAdvertisementCarouselItem(id: number, item: any): Promise<AdvertisementCarousel | undefined> {
    const existing = this.adCarousel.find(i => i.id === id);
    if (existing) {
      Object.assign(existing, item, { updatedAt: new Date() });
    }
    return existing;
  }

  async deleteAdvertisementCarouselItem(id: number): Promise<boolean> {
    const index = this.adCarousel.findIndex(i => i.id === id);
    if (index > -1) {
      this.adCarousel.splice(index, 1);
      return true;
    }
    return false;
  }

  // Documents operations
  async getDocuments(type?: string): Promise<Document[]> {
    return this.documents.filter(d => !type || d.type === type);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.find(d => d.id === id);
  }

  async createDocument(document: any): Promise<Document> {
    const newDoc = { ...document, id: this.documents.length + 1, createdAt: new Date(), updatedAt: new Date() };
    this.documents.push(newDoc);
    return newDoc;
  }

  async updateDocument(id: number, document: any): Promise<Document | undefined> {
    const existing = this.documents.find(d => d.id === id);
    if (existing) {
      Object.assign(existing, document, { updatedAt: new Date() });
    }
    return existing;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const index = this.documents.findIndex(d => d.id === id);
    if (index > -1) {
      this.documents.splice(index, 1);
      return true;
    }
    return false;
  }

  // Alert Views operations
  async createAlertView(view: any): Promise<AlertView> {
    const newView = { ...view, id: this.alertViews.length + 1, viewedAt: new Date() };
    this.alertViews.push(newView);
    return newView;
  }

  async hasUserViewedAlert(userId: number, alertId: number, listingId: number): Promise<boolean> {
    return this.alertViews.some(v => v.userId === userId && v.alertId === alertId && v.listingId === listingId);
  }

  // Admin operations
  async getAdminStats(): Promise<{
    pendingListings: number;
    activeAuctions: number;
    totalUsers: number;
    bannedUsers: number;
  }> {
    return {
      pendingListings: this.listings.filter(l => l.status === 'pending').length,
      activeAuctions: this.listings.filter(l => l.status === 'active').length,
      totalUsers: this.users.length,
      bannedUsers: this.users.filter(u => !u.isActive).length
    };
  }
}