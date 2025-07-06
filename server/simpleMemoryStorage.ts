// Simple memory storage with basic car auction data
export class SimpleMemoryStorage {
  private data = {
    users: [
      { id: 1, username: "admin", email: "admin@autoauction.tj", role: "admin", isActive: true, fullName: "Administrator", profilePhoto: null, createdAt: new Date() },
      { id: 2, username: "seller123", email: "seller@autoauction.tj", role: "seller", isActive: true, fullName: "Car Seller", profilePhoto: null, createdAt: new Date() },
      { id: 3, username: "buyer456", email: "buyer@autoauction.tj", role: "buyer", isActive: true, fullName: "Car Buyer", profilePhoto: null, createdAt: new Date() }
    ],
    carListings: [
      {
        id: 1,
        sellerId: 2,
        lotNumber: "LOT724583",
        make: "Porsche",
        model: "911 Turbo S",
        year: 2020,
        mileage: 15000,
        vin: "WP0AB2A95LS123456",
        description: "Stunning 2020 Porsche 911 Turbo S - masterpiece of automotive engineering",
        startingPrice: "140000.00",
        reservePrice: "170000.00",
        currentBid: "145500.00",
        photos: [
          "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        auctionDuration: 72,
        status: "active",
        auctionStartTime: new Date(),
        auctionEndTime: new Date('2025-06-30T13:30:00Z'),
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
        createdAt: new Date()
      },
      {
        id: 2,
        sellerId: 2,
        lotNumber: "LOT892456",
        make: "BMW",
        model: "M5 Competition",
        year: 2021,
        mileage: 8500,
        vin: "WBSJF0C59MCE12345",
        description: "Exceptional 2021 BMW M5 Competition in pristine condition",
        startingPrice: "85000.00",
        reservePrice: "95000.00",
        currentBid: null,
        photos: [
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        auctionDuration: 72,
        status: "active",
        auctionStartTime: new Date(),
        auctionEndTime: new Date('2025-07-01T18:45:00Z'),
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
        createdAt: new Date()
      }
    ],
    bids: [
      {
        id: 1,
        listingId: 1,
        bidderId: 3,
        amount: "145500.00",
        createdAt: new Date()
      }
    ],
    advertisements: [
      {
        id: 1,
        title: "Специальные предложения",
        description: "Лучшие автомобили с особыми условиями",
        imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        linkUrl: "/special-offers",
        isActive: true,
        order: 1,
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Эксклюзивные аукционы",
        description: "Премиум автомобили для истинных ценителей",
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        linkUrl: "/exclusive",
        isActive: true,
        order: 2,
        createdAt: new Date()
      }
    ],
    sellCarSection: {
      id: 1,
      title: "Продайте свой автомобиль",
      description: "Получите лучшую цену за ваш автомобиль на нашем аукционе",
      buttonText: "Начать продажу",
      imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      createdAt: new Date()
    }
  };

  // Methods that match the IStorage interface
  async getListingsByStatus(status, limit) {
    const filtered = this.data.carListings.filter(l => l.status === status);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async getAdvertisementCarousel() {
    return this.data.advertisements;
  }

  async getSellCarSection() {
    return this.data.sellCarSection;
  }

  async getUser(id) {
    return this.data.users.find(u => u.id === id);
  }

  async getUserByEmail(email) {
    return this.data.users.find(u => u.email === email);
  }

  async getUserByUsername(username) {
    return this.data.users.find(u => u.username === username);
  }

  async getNotificationsByUser(userId) {
    return []; // Empty for now
  }

  async getUnreadNotificationCount(userId) {
    return 0;
  }

  async getBidsForListing(listingId) {
    return this.data.bids.filter(b => b.listingId === listingId);
  }

  async getBidCountForListing(listingId) {
    return this.data.bids.filter(b => b.listingId === listingId).length;
  }

  async getBidCountsForListings(listingIds) {
    const counts = {};
    for (const id of listingIds) {
      counts[id] = await this.getBidCountForListing(id);
    }
    return counts;
  }

  async getListing(id) {
    return this.data.carListings.find(l => l.id === id);
  }

  async getFavoritesByUser(userId) {
    return []; // Empty for now
  }

  async getCarAlertsByUser(userId) {
    return []; // Empty for now
  }

  async getBanners(position) {
    return []; // Empty for now
  }

  async getDocuments(type) {
    return []; // Empty for now
  }

  async getAdminStats() {
    return {
      pendingListings: 0,
      activeAuctions: this.data.carListings.filter(l => l.status === 'active').length,
      totalUsers: this.data.users.length,
      bannedUsers: 0
    };
  }

  // Add other required methods as stubs
  async createUser(user) { return { id: Date.now(), ...user, createdAt: new Date() }; }
  async createListing(listing) { return { id: Date.now(), ...listing, createdAt: new Date() }; }
  async createBid(bid) { return { id: Date.now(), ...bid, createdAt: new Date() }; }
  async createFavorite(favorite) { return { id: Date.now(), ...favorite, createdAt: new Date() }; }
  async createNotification(notification) { return { id: Date.now(), ...notification, createdAt: new Date() }; }
  async createCarAlert(alert) { return { id: Date.now(), ...alert, createdAt: new Date() }; }
  async createBanner(banner) { return { id: Date.now(), ...banner, createdAt: new Date() }; }
  async createAdvertisementCarouselItem(item) { return { id: Date.now(), ...item, createdAt: new Date() }; }
  async createDocument(document) { return { id: Date.now(), ...document, createdAt: new Date() }; }
  async createAlertView(view) { return { id: Date.now(), ...view, createdAt: new Date() }; }
  
  async updateUserStatus(id, isActive) { return this.data.users.find(u => u.id === id); }
  async updateUserProfile(id, data) { return this.data.users.find(u => u.id === id); }
  async updateListingStatus(id, status) { return this.data.carListings.find(l => l.id === id); }
  async updateListingCurrentBid(id, amount) { return this.data.carListings.find(l => l.id === id); }
  async updateBanner(id, data) { return {}; }
  async updateSellCarSection(data) { return this.data.sellCarSection; }
  async updateAdvertisementCarouselItem(id, data) { return {}; }
  async updateDocument(id, data) { return {}; }
  
  async deleteFavorite(id) { return true; }
  async deleteNotification(id) { return true; }
  async deleteCarAlert(id) { return true; }
  async deleteBanner(id) { return true; }
  async deleteAdvertisementCarouselItem(id) { return true; }
  async deleteDocument(id) { return true; }
  
  async getAllUsers() { return this.data.users; }
  async getListingsBySeller(sellerId) { return this.data.carListings.filter(l => l.sellerId === sellerId); }
  async getBidsByUser(bidderId) { return this.data.bids.filter(b => b.bidderId === bidderId); }
  async getUsersWithFavoriteListing(listingId) { return []; }
  async markNotificationAsRead(id) { return true; }
  async checkAlertsForNewListing(listing) { return []; }
  async getAdvertisementCarouselItem(id) { return this.data.advertisements.find(a => a.id === id); }
  async getDocument(id) { return {}; }
  async hasUserViewedAlert(userId, alertId, listingId) { return false; }
  async searchListings(filters) { return this.data.carListings; }
}