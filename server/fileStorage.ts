import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorage } from './storage';
import type { 
  User, CarListing, Bid, Favorite, Notification, CarAlert, Banner, 
  SellCarSection, AdvertisementCarousel, Document, AlertView, SmsVerificationCode,
  InsertUser, InsertCarListing, InsertBid, InsertFavorite, InsertNotification,
  InsertCarAlert, InsertBanner, InsertSellCarSection, InsertAdvertisementCarousel,
  InsertDocument, InsertAlertView, InsertSmsVerificationCode
} from '../shared/schema';

export class FileStorage implements IStorage {
  private dataDir = 'data';

  constructor() {
    this.ensureDataDir();
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  private async readFile<T>(filename: string): Promise<T[]> {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async writeFile<T>(filename: string, data: T[]) {
    const filePath = path.join(this.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private getNextId<T extends { id: number }>(items: T[]): number {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    return users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    return users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    return users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = await this.readFile<User>('users.json');
    const user: User = {
      id: this.getNextId(users),
      ...insertUser,
      createdAt: new Date(),
    };
    users.push(user);
    await this.writeFile('users.json', users);
    return user;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;
    
    users[userIndex].isActive = isActive;
    await this.writeFile('users.json', users);
    return users[userIndex];
  }

  async updateUserProfile(id: number, data: { fullName?: string; profilePhoto?: string }): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;
    
    if (data.fullName !== undefined) users[userIndex].fullName = data.fullName;
    if (data.profilePhoto !== undefined) users[userIndex].profilePhoto = data.profilePhoto;
    
    await this.writeFile('users.json', users);
    return users[userIndex];
  }

  async getAllUsers(): Promise<User[]> {
    return await this.readFile<User>('users.json');
  }

  // Car listing operations
  async getListing(id: number): Promise<CarListing | undefined> {
    const listings = await this.readFile<CarListing>('listings.json');
    return listings.find(listing => listing.id === id);
  }

  async getListingsByStatus(status: string, limit?: number): Promise<CarListing[]> {
    const listings = await this.readFile<CarListing>('listings.json');
    const filtered = listings.filter(listing => listing.status === status);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    const listings = await this.readFile<CarListing>('listings.json');
    return listings.filter(listing => listing.sellerId === sellerId);
  }

  async createListing(insertListing: InsertCarListing): Promise<CarListing> {
    const listings = await this.readFile<CarListing>('listings.json');
    const listing: CarListing = {
      id: this.getNextId(listings),
      ...insertListing,
      createdAt: new Date(),
    };
    listings.push(listing);
    await this.writeFile('listings.json', listings);
    return listing;
  }

  async updateListingStatus(id: number, status: string): Promise<CarListing | undefined> {
    const listings = await this.readFile<CarListing>('listings.json');
    const listingIndex = listings.findIndex(listing => listing.id === id);
    if (listingIndex === -1) return undefined;
    
    listings[listingIndex].status = status;
    await this.writeFile('listings.json', listings);
    return listings[listingIndex];
  }

  async updateListingCurrentBid(id: number, amount: string): Promise<CarListing | undefined> {
    const listings = await this.readFile<CarListing>('listings.json');
    const listingIndex = listings.findIndex(listing => listing.id === id);
    if (listingIndex === -1) return undefined;
    
    listings[listingIndex].currentBid = amount;
    await this.writeFile('listings.json', listings);
    return listings[listingIndex];
  }

  async searchListings(filters: any): Promise<CarListing[]> {
    const listings = await this.readFile<CarListing>('listings.json');
    return listings.filter(listing => {
      if (filters.query && !listing.make.toLowerCase().includes(filters.query.toLowerCase()) && 
          !listing.model.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
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
    const bids = await this.readFile<Bid>('bids.json');
    return bids.filter(bid => bid.listingId === listingId);
  }

  async getBidsByUser(bidderId: number): Promise<Bid[]> {
    const bids = await this.readFile<Bid>('bids.json');
    return bids.filter(bid => bid.bidderId === bidderId);
  }

  async getBidCountForListing(listingId: number): Promise<number> {
    const bids = await this.readFile<Bid>('bids.json');
    return bids.filter(bid => bid.listingId === listingId).length;
  }

  async getBidCountsForListings(listingIds: number[]): Promise<Record<number, number>> {
    const bids = await this.readFile<Bid>('bids.json');
    const counts: Record<number, number> = {};
    
    for (const id of listingIds) {
      counts[id] = bids.filter(bid => bid.listingId === id).length;
    }
    
    return counts;
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const bids = await this.readFile<Bid>('bids.json');
    const bid: Bid = {
      id: this.getNextId(bids),
      ...insertBid,
      createdAt: new Date(),
    };
    bids.push(bid);
    await this.writeFile('bids.json', bids);
    return bid;
  }

  // Favorites operations
  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    const favorites = await this.readFile<Favorite>('favorites.json');
    return favorites.filter(fav => fav.userId === userId);
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const favorites = await this.readFile<Favorite>('favorites.json');
    const favorite: Favorite = {
      id: this.getNextId(favorites),
      ...insertFavorite,
      createdAt: new Date(),
    };
    favorites.push(favorite);
    await this.writeFile('favorites.json', favorites);
    return favorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const favorites = await this.readFile<Favorite>('favorites.json');
    const filtered = favorites.filter(fav => fav.id !== id);
    if (filtered.length === favorites.length) return false;
    
    await this.writeFile('favorites.json', filtered);
    return true;
  }

  async getUsersWithFavoriteListing(listingId: number): Promise<number[]> {
    const favorites = await this.readFile<Favorite>('favorites.json');
    return favorites
      .filter(fav => fav.listingId === listingId)
      .map(fav => fav.userId);
  }

  // Notifications operations
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    const notifications = await this.readFile<Notification>('notifications.json');
    return notifications.filter(notif => notif.userId === userId);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notifications = await this.readFile<Notification>('notifications.json');
    const notification: Notification = {
      id: this.getNextId(notifications),
      ...insertNotification,
      createdAt: new Date(),
    };
    notifications.push(notification);
    await this.writeFile('notifications.json', notifications);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notifications = await this.readFile<Notification>('notifications.json');
    const notifIndex = notifications.findIndex(notif => notif.id === id);
    if (notifIndex === -1) return false;
    
    notifications[notifIndex].isRead = true;
    await this.writeFile('notifications.json', notifications);
    return true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const notifications = await this.readFile<Notification>('notifications.json');
    const filtered = notifications.filter(notif => notif.id !== id);
    if (filtered.length === notifications.length) return false;
    
    await this.writeFile('notifications.json', filtered);
    return true;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const notifications = await this.readFile<Notification>('notifications.json');
    return notifications.filter(notif => notif.userId === userId && !notif.isRead).length;
  }

  // Car alerts operations
  async getCarAlertsByUser(userId: number): Promise<CarAlert[]> {
    const alerts = await this.readFile<CarAlert>('car_alerts.json');
    return alerts.filter(alert => alert.userId === userId);
  }

  async createCarAlert(insertAlert: InsertCarAlert): Promise<CarAlert> {
    const alerts = await this.readFile<CarAlert>('car_alerts.json');
    const alert: CarAlert = {
      id: this.getNextId(alerts),
      ...insertAlert,
      createdAt: new Date(),
    };
    alerts.push(alert);
    await this.writeFile('car_alerts.json', alerts);
    return alert;
  }

  async deleteCarAlert(id: number): Promise<boolean> {
    const alerts = await this.readFile<CarAlert>('car_alerts.json');
    const filtered = alerts.filter(alert => alert.id !== id);
    if (filtered.length === alerts.length) return false;
    
    await this.writeFile('car_alerts.json', filtered);
    return true;
  }

  async checkAlertsForNewListing(listing: CarListing): Promise<CarAlert[]> {
    const alerts = await this.readFile<CarAlert>('car_alerts.json');
    return alerts.filter(alert => {
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
    const banners = await this.readFile<Banner>('banners.json');
    return position ? banners.filter(banner => banner.position === position) : banners;
  }

  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const banners = await this.readFile<Banner>('banners.json');
    const banner: Banner = {
      id: this.getNextId(banners),
      ...insertBanner,
      createdAt: new Date(),
    };
    banners.push(banner);
    await this.writeFile('banners.json', banners);
    return banner;
  }

  async updateBanner(id: number, bannerData: Partial<InsertBanner>): Promise<Banner | undefined> {
    const banners = await this.readFile<Banner>('banners.json');
    const bannerIndex = banners.findIndex(banner => banner.id === id);
    if (bannerIndex === -1) return undefined;
    
    Object.assign(banners[bannerIndex], bannerData);
    await this.writeFile('banners.json', banners);
    return banners[bannerIndex];
  }

  async deleteBanner(id: number): Promise<boolean> {
    const banners = await this.readFile<Banner>('banners.json');
    const filtered = banners.filter(banner => banner.id !== id);
    if (filtered.length === banners.length) return false;
    
    await this.writeFile('banners.json', filtered);
    return true;
  }

  async getAdminStats(): Promise<{
    pendingListings: number;
    activeAuctions: number;
    totalUsers: number;
    bannedUsers: number;
  }> {
    const listings = await this.readFile<CarListing>('listings.json');
    const users = await this.readFile<User>('users.json');
    
    return {
      pendingListings: listings.filter(l => l.status === 'pending').length,
      activeAuctions: listings.filter(l => l.status === 'active').length,
      totalUsers: users.length,
      bannedUsers: users.filter(u => !u.isActive).length,
    };
  }

  // Sell Car Section operations
  async getSellCarSection(): Promise<SellCarSection | undefined> {
    const sections = await this.readFile<SellCarSection>('sell_car_section.json');
    return sections[0];
  }

  async updateSellCarSection(data: Partial<InsertSellCarSection>): Promise<SellCarSection | undefined> {
    const sections = await this.readFile<SellCarSection>('sell_car_section.json');
    if (sections.length === 0) {
      const section: SellCarSection = {
        id: 1,
        title: data.title || 'Sell Your Car',
        subtitle: data.subtitle || 'Get the best price for your vehicle',
        description: data.description || 'List your car for auction and reach thousands of potential buyers.',
        buttonText: data.buttonText || 'Start Selling',
        imageUrl: data.imageUrl || '/images/sell-car-hero.jpg',
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sections.push(section);
    } else {
      Object.assign(sections[0], data, { updatedAt: new Date() });
    }
    
    await this.writeFile('sell_car_section.json', sections);
    return sections[0];
  }

  // Advertisement Carousel operations
  async getAdvertisementCarousel(): Promise<AdvertisementCarousel[]> {
    return await this.readFile<AdvertisementCarousel>('advertisement_carousel.json');
  }

  async getAdvertisementCarouselItem(id: number): Promise<AdvertisementCarousel | undefined> {
    const items = await this.readFile<AdvertisementCarousel>('advertisement_carousel.json');
    return items.find(item => item.id === id);
  }

  async createAdvertisementCarouselItem(item: InsertAdvertisementCarousel): Promise<AdvertisementCarousel> {
    const items = await this.readFile<AdvertisementCarousel>('advertisement_carousel.json');
    const carouselItem: AdvertisementCarousel = {
      id: this.getNextId(items),
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    items.push(carouselItem);
    await this.writeFile('advertisement_carousel.json', items);
    return carouselItem;
  }

  async updateAdvertisementCarouselItem(id: number, item: Partial<InsertAdvertisementCarousel>): Promise<AdvertisementCarousel | undefined> {
    const items = await this.readFile<AdvertisementCarousel>('advertisement_carousel.json');
    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex === -1) return undefined;
    
    Object.assign(items[itemIndex], item, { updatedAt: new Date() });
    await this.writeFile('advertisement_carousel.json', items);
    return items[itemIndex];
  }

  async deleteAdvertisementCarouselItem(id: number): Promise<boolean> {
    const items = await this.readFile<AdvertisementCarousel>('advertisement_carousel.json');
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    
    await this.writeFile('advertisement_carousel.json', filtered);
    return true;
  }

  // Documents operations
  async getDocuments(type?: string): Promise<Document[]> {
    const documents = await this.readFile<Document>('documents.json');
    return type ? documents.filter(doc => doc.type === type) : documents;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const documents = await this.readFile<Document>('documents.json');
    return documents.find(doc => doc.id === id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const documents = await this.readFile<Document>('documents.json');
    const document: Document = {
      id: this.getNextId(documents),
      ...insertDocument,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    documents.push(document);
    await this.writeFile('documents.json', documents);
    return document;
  }

  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const documents = await this.readFile<Document>('documents.json');
    const docIndex = documents.findIndex(doc => doc.id === id);
    if (docIndex === -1) return undefined;
    
    Object.assign(documents[docIndex], documentData, { updatedAt: new Date() });
    await this.writeFile('documents.json', documents);
    return documents[docIndex];
  }

  async deleteDocument(id: number): Promise<boolean> {
    const documents = await this.readFile<Document>('documents.json');
    const filtered = documents.filter(doc => doc.id !== id);
    if (filtered.length === documents.length) return false;
    
    await this.writeFile('documents.json', filtered);
    return true;
  }

  // Alert Views operations
  async createAlertView(insertView: InsertAlertView): Promise<AlertView> {
    const views = await this.readFile<AlertView>('alert_views.json');
    const view: AlertView = {
      id: this.getNextId(views),
      ...insertView,
      viewedAt: new Date(),
    };
    views.push(view);
    await this.writeFile('alert_views.json', views);
    return view;
  }

  async hasUserViewedAlert(userId: number, alertId: number, listingId: number): Promise<boolean> {
    const views = await this.readFile<AlertView>('alert_views.json');
    return views.some(view => 
      view.userId === userId && 
      view.alertId === alertId && 
      view.listingId === listingId
    );
  }

  // SMS Verification operations
  async createSmsVerificationCode(insertCode: InsertSmsVerificationCode): Promise<SmsVerificationCode> {
    const codes = await this.readFile<SmsVerificationCode>('sms_verification_codes.json');
    const code: SmsVerificationCode = {
      id: this.getNextId(codes),
      ...insertCode,
      createdAt: new Date(),
    };
    codes.push(code);
    await this.writeFile('sms_verification_codes.json', codes);
    return code;
  }

  async getValidSmsCode(phoneNumber: string, code: string): Promise<SmsVerificationCode | undefined> {
    const codes = await this.readFile<SmsVerificationCode>('sms_verification_codes.json');
    const now = new Date();
    
    return codes.find(c => 
      c.phoneNumber === phoneNumber &&
      c.code === code &&
      !c.isUsed &&
      c.expiresAt > now
    );
  }

  async markSmsCodeAsUsed(id: number): Promise<boolean> {
    const codes = await this.readFile<SmsVerificationCode>('sms_verification_codes.json');
    const codeIndex = codes.findIndex(c => c.id === id);
    if (codeIndex === -1) return false;
    
    codes[codeIndex].isUsed = true;
    await this.writeFile('sms_verification_codes.json', codes);
    return true;
  }

  async cleanupExpiredSmsCodes(): Promise<void> {
    const codes = await this.readFile<SmsVerificationCode>('sms_verification_codes.json');
    const now = new Date();
    const validCodes = codes.filter(c => c.expiresAt > now && !c.isUsed);
    await this.writeFile('sms_verification_codes.json', validCodes);
  }
}