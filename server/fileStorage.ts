import fs from 'fs/promises';
import path from 'path';
import { IStorage } from './storage';
import type { User, CarListing, Bid, Notification, Favorite, CarAlert, Banner, SellCarSection, AdvertisementCarousel, Document, AlertView, SmsVerificationCode } from '@shared/schema';

const DATA_DIR = './data';

export class FileStorage implements IStorage {
  private async ensureDir() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  private async readFile<T>(filename: string): Promise<T[]> {
    await this.ensureDir();
    try {
      const data = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async writeFile<T>(filename: string, data: T[]): Promise<void> {
    await this.ensureDir();
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    return users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    return users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    return users.find(u => u.email === email);
  }

  async createUser(user: any): Promise<User> {
    const users = await this.readFile<User>('users.json');
    const newUser = {
      ...user,
      id: Math.max(0, ...users.map(u => u.id)) + 1,
      createdAt: new Date()
    };
    users.push(newUser);
    await this.writeFile('users.json', users);
    return newUser;
  }

  async updateUserStatus(id: number, isActive: boolean): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    const user = users.find(u => u.id === id);
    if (user) {
      user.isActive = isActive;
      await this.writeFile('users.json', users);
    }
    return user;
  }

  async updateUserProfile(id: number, data: { fullName?: string; profilePhoto?: string }): Promise<User | undefined> {
    const users = await this.readFile<User>('users.json');
    const user = users.find(u => u.id === id);
    if (user) {
      if (data.fullName !== undefined) user.fullName = data.fullName;
      if (data.profilePhoto !== undefined) user.profilePhoto = data.profilePhoto;
      await this.writeFile('users.json', users);
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.readFile<User>('users.json');
  }

  // Car listing operations
  async getListing(id: number): Promise<CarListing | undefined> {
    const listings = await this.readFile<CarListing>('listings.json');
    return listings.find(l => l.id === id);
  }

  async getListingsByStatus(status: string, limit?: number): Promise<CarListing[]> {
    const listings = await this.readFile<CarListing>('listings.json');
    const filtered = listings.filter(l => l.status === status);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async getListingsBySeller(sellerId: number): Promise<CarListing[]> {
    const listings = await this.readFile<CarListing>('listings.json');
    return listings.filter(l => l.sellerId === sellerId);
  }

  async createListing(listing: any): Promise<CarListing> {
    const listings = await this.readFile<CarListing>('listings.json');
    const newListing = {
      ...listing,
      id: Math.max(0, ...listings.map(l => l.id)) + 1,
      createdAt: new Date()
    };
    listings.push(newListing);
    await this.writeFile('listings.json', listings);
    return newListing;
  }

  async updateListingStatus(id: number, status: string): Promise<CarListing | undefined> {
    const listings = await this.readFile<CarListing>('listings.json');
    const listing = listings.find(l => l.id === id);
    if (listing) {
      listing.status = status;
      await this.writeFile('listings.json', listings);
    }
    return listing;
  }

  async updateListingCurrentBid(id: number, amount: string): Promise<CarListing | undefined> {
    const listings = await this.readFile<CarListing>('listings.json');
    const listing = listings.find(l => l.id === id);
    if (listing) {
      listing.currentBid = amount;
      await this.writeFile('listings.json', listings);
    }
    return listing;
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
    return bids.filter(b => b.listingId === listingId);
  }

  async getBidsByUser(bidderId: number): Promise<Bid[]> {
    const bids = await this.readFile<Bid>('bids.json');
    return bids.filter(b => b.bidderId === bidderId);
  }

  async getBidCountForListing(listingId: number): Promise<number> {
    const bids = await this.readFile<Bid>('bids.json');
    return bids.filter(b => b.listingId === listingId).length;
  }

  async getBidCountsForListings(listingIds: number[]): Promise<Record<number, number>> {
    const bids = await this.readFile<Bid>('bids.json');
    const counts: Record<number, number> = {};
    listingIds.forEach(id => {
      counts[id] = bids.filter(b => b.listingId === id).length;
    });
    return counts;
  }

  async createBid(bid: any): Promise<Bid> {
    const bids = await this.readFile<Bid>('bids.json');
    const newBid = {
      ...bid,
      id: Math.max(0, ...bids.map(b => b.id)) + 1,
      createdAt: new Date()
    };
    bids.push(newBid);
    await this.writeFile('bids.json', bids);
    return newBid;
  }

  // Stub implementations for other required methods
  async getFavoritesByUser(userId: number): Promise<Favorite[]> { return []; }
  async createFavorite(favorite: any): Promise<Favorite> { return favorite; }
  async deleteFavorite(id: number): Promise<boolean> { return true; }
  async getUsersWithFavoriteListing(listingId: number): Promise<number[]> { return []; }
  
  async getNotificationsByUser(userId: number): Promise<Notification[]> { return []; }
  async createNotification(notification: any): Promise<Notification> { return notification; }
  async markNotificationAsRead(id: number): Promise<boolean> { return true; }
  async deleteNotification(id: number): Promise<boolean> { return true; }
  async getUnreadNotificationCount(userId: number): Promise<number> { return 0; }
  
  async getCarAlertsByUser(userId: number): Promise<CarAlert[]> { return []; }
  async createCarAlert(alert: any): Promise<CarAlert> { return alert; }
  async deleteCarAlert(id: number): Promise<boolean> { return true; }
  async checkAlertsForNewListing(listing: CarListing): Promise<CarAlert[]> { return []; }
  
  async getBanners(position?: string): Promise<Banner[]> {
    return [{
      id: 1,
      title: "Лучшие предложения",
      description: "Найдите автомобиль своей мечты",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3",
      linkUrl: "/listings",
      position: "main",
      order: 1,
      isActive: true,
      createdAt: new Date()
    }];
  }
  
  async createBanner(banner: any): Promise<Banner> { return banner; }
  async updateBanner(id: number, banner: any): Promise<Banner | undefined> { return undefined; }
  async deleteBanner(id: number): Promise<boolean> { return true; }
  
  async getSellCarSection(): Promise<SellCarSection | undefined> {
    return {
      id: 1,
      title: "Продай свое авто сейчас",
      description: "Получите лучшую цену за ваш автомобиль",
      imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3",
      buttonText: "Продать авто",
      isActive: true,
      createdAt: new Date()
    };
  }
  
  async updateSellCarSection(data: any): Promise<SellCarSection | undefined> { return undefined; }
  
  async getAdvertisementCarousel(): Promise<AdvertisementCarousel[]> {
    return [{
      id: 1,
      title: "Лучшие предложения",
      description: "Найдите автомобиль своей мечты на нашем аукционе",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3",
      linkUrl: "/listings",
      isActive: true,
      orderIndex: 1,
      createdAt: new Date()
    }];
  }
  
  async getAdvertisementCarouselItem(id: number): Promise<AdvertisementCarousel | undefined> { return undefined; }
  async createAdvertisementCarouselItem(item: any): Promise<AdvertisementCarousel> { return item; }
  async updateAdvertisementCarouselItem(id: number, item: any): Promise<AdvertisementCarousel | undefined> { return undefined; }
  async deleteAdvertisementCarouselItem(id: number): Promise<boolean> { return true; }
  
  async getDocuments(type?: string): Promise<Document[]> { return []; }
  async getDocument(id: number): Promise<Document | undefined> { return undefined; }
  async createDocument(document: any): Promise<Document> { return document; }
  async updateDocument(id: number, document: any): Promise<Document | undefined> { return undefined; }
  async deleteDocument(id: number): Promise<boolean> { return true; }
  
  async createAlertView(view: any): Promise<AlertView> { return view; }
  async hasUserViewedAlert(userId: number, alertId: number, listingId: number): Promise<boolean> { return false; }
  
  async createSmsVerificationCode(code: any): Promise<SmsVerificationCode> { return code; }
  async getValidSmsCode(phoneNumber: string, code: string): Promise<SmsVerificationCode | undefined> { return undefined; }
  async markSmsCodeAsUsed(id: number): Promise<boolean> { return true; }
  async cleanupExpiredSmsCodes(): Promise<void> { }
  
  async getAdminStats(): Promise<any> {
    const listings = await this.readFile<CarListing>('listings.json');
    const users = await this.readFile<User>('users.json');
    return {
      pendingListings: listings.filter(l => l.status === 'pending').length,
      activeAuctions: listings.filter(l => l.status === 'active').length,
      totalUsers: users.length,
      bannedUsers: users.filter(u => !u.isActive).length
    };
  }
}