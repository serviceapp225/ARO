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
  private nextId = 50; // Start from 50 to avoid conflicts with fixed IDs

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
      id: 41,
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
      id: 42,
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

    // Create additional car listings to reach 18 total
    const listing3: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "583012",
      make: "BMW",
      model: "X5",
      year: 2019,
      mileage: 65000,
      vin: "5UXKR0C50K0123456",
      description: "Premium SUV with all options",
      startingPrice: "120000.00",
      currentBid: "128000.00",
      photos: ["/api/listings/43/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate1,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-04-01"),
      tinted: true,
      tintingDate: new Date("2024-11-15"),
      engine: "3.0L Turbo",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "SUV",
      driveType: "AWD",
      color: "Black",
      condition: "excellent",
      location: "Dushanbe",
      createdAt: now,
    };

    const listing4: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "684123",
      make: "Mercedes-Benz",
      model: "C-Class",
      year: 2020,
      mileage: 45000,
      vin: "55SWF4KB8LU123456",
      description: "Luxury sedan in pristine condition",
      startingPrice: "95000.00",
      currentBid: "102000.00",
      photos: ["/api/listings/44/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate2,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-03-15"),
      tinted: false,
      tintingDate: null,
      engine: "2.0L Turbo",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "RWD",
      color: "White",
      condition: "excellent",
      location: "Khujand",
      createdAt: now,
    };

    const listing5: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "785234",
      make: "Audi",
      model: "A4",
      year: 2018,
      mileage: 78000,
      vin: "WAUBFAFL2JA123456",
      description: "Sport sedan with quattro drive",
      startingPrice: "75000.00",
      currentBid: "80000.00",
      photos: ["/api/listings/45/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate1,
      customsCleared: true,
      recycled: true,
      technicalInspectionValid: false,
      technicalInspectionDate: null,
      tinted: true,
      tintingDate: new Date("2024-10-01"),
      engine: "2.0L TFSI",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "AWD",
      color: "Gray",
      condition: "good",
      location: "Dushanbe",
      createdAt: now,
    };

    const listing6: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "886345",
      make: "Honda",
      model: "Civic",
      year: 2016,
      mileage: 95000,
      vin: "19XFC2F59GE123456",
      description: "Reliable compact car",
      startingPrice: "35000.00",
      currentBid: "38000.00",
      photos: ["/api/listings/46/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate2,
      customsCleared: true,
      recycled: true,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-02-10"),
      tinted: false,
      tintingDate: null,
      engine: "1.5L",
      transmission: "CVT",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "FWD",
      color: "Red",
      condition: "good",
      location: "Khujand",
      createdAt: now,
    };

    const listing7: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "987456",
      make: "Ford",
      model: "Explorer",
      year: 2017,
      mileage: 110000,
      vin: "1FM5K8D82HG123456",
      description: "Family SUV with 7 seats",
      startingPrice: "55000.00",
      currentBid: "58000.00",
      photos: ["/api/listings/47/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate1,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-01-20"),
      tinted: true,
      tintingDate: new Date("2024-08-15"),
      engine: "3.5L V6",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "SUV",
      driveType: "AWD",
      color: "Blue",
      condition: "good",
      location: "Dushanbe",
      createdAt: now,
    };

    const listing8: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "188567",
      make: "Nissan",
      model: "Altima",
      year: 2019,
      mileage: 52000,
      vin: "1N4AL3AP5KC123456",
      description: "Mid-size sedan with advanced safety",
      startingPrice: "60000.00",
      currentBid: "64000.00",
      photos: ["/api/listings/48/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate2,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-05-01"),
      tinted: false,
      tintingDate: null,
      engine: "2.5L",
      transmission: "CVT",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "FWD",
      color: "Silver",
      condition: "very_good",
      location: "Khujand",
      createdAt: now,
    };

    const listing9: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "289678",
      make: "Volkswagen",
      model: "Passat",
      year: 2020,
      mileage: 38000,
      vin: "1VWBA7A35LC123456",
      description: "European sedan with premium interior",
      startingPrice: "70000.00",
      currentBid: "74000.00",
      photos: ["/api/listings/49/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate1,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-04-15"),
      tinted: true,
      tintingDate: new Date("2024-12-01"),
      engine: "2.0L TSI",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "FWD",
      color: "Black",
      condition: "excellent",
      location: "Dushanbe",
      createdAt: now,
    };

    const listing10: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "390789",
      make: "Hyundai",
      model: "Tucson",
      year: 2021,
      mileage: 25000,
      vin: "KM8J3CA43MU123456",
      description: "Modern compact SUV",
      startingPrice: "65000.00",
      currentBid: "68000.00",
      photos: ["/api/listings/50/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate2,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-06-01"),
      tinted: false,
      tintingDate: null,
      engine: "2.5L",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "SUV",
      driveType: "AWD",
      color: "White",
      condition: "excellent",
      location: "Khujand",
      createdAt: now,
    };

    const listing11: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "491890",
      make: "Kia",
      model: "Sorento",
      year: 2018,
      mileage: 88000,
      vin: "5XYPG4A35JG123456",
      description: "Three-row family SUV",
      startingPrice: "50000.00",
      currentBid: "53000.00",
      photos: ["/api/listings/51/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate1,
      customsCleared: true,
      recycled: true,
      technicalInspectionValid: false,
      technicalInspectionDate: null,
      tinted: true,
      tintingDate: new Date("2024-07-20"),
      engine: "3.3L V6",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "SUV",
      driveType: "AWD",
      color: "Gray",
      condition: "good",
      location: "Dushanbe",
      createdAt: now,
    };

    const listing12: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "592901",
      make: "Subaru",
      model: "Outback",
      year: 2019,
      mileage: 71000,
      vin: "4S4BSANC5K3123456",
      description: "All-wheel drive wagon",
      startingPrice: "58000.00",
      currentBid: "61000.00",
      photos: ["/api/listings/52/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate2,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-03-10"),
      tinted: false,
      tintingDate: null,
      engine: "2.5L",
      transmission: "CVT",
      fuelType: "Gasoline",
      bodyType: "Wagon",
      driveType: "AWD",
      color: "Green",
      condition: "very_good",
      location: "Khujand",
      createdAt: now,
    };

    const listing13: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "693012",
      make: "Jeep",
      model: "Grand Cherokee",
      year: 2017,
      mileage: 98000,
      vin: "1C4RJFAG4HC123456",
      description: "Rugged luxury SUV",
      startingPrice: "62000.00",
      currentBid: "66000.00",
      photos: ["/api/listings/53/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate1,
      customsCleared: true,
      recycled: true,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-02-01"),
      tinted: true,
      tintingDate: new Date("2024-09-10"),
      engine: "3.6L V6",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "SUV",
      driveType: "4WD",
      color: "Red",
      condition: "good",
      location: "Dushanbe",
      createdAt: now,
    };

    const listing14: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "794123",
      make: "Acura",
      model: "TLX",
      year: 2020,
      mileage: 42000,
      vin: "19UUB2F34LA123456",
      description: "Sport luxury sedan",
      startingPrice: "78000.00",
      currentBid: "82000.00",
      photos: ["/api/listings/54/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate2,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-04-20"),
      tinted: false,
      tintingDate: null,
      engine: "2.0L Turbo",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "AWD",
      color: "Blue",
      condition: "excellent",
      location: "Khujand",
      createdAt: now,
    };

    const listing15: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "895234",
      make: "Infiniti",
      model: "Q50",
      year: 2018,
      mileage: 63000,
      vin: "JN1EV7AR3JM123456",
      description: "Premium performance sedan",
      startingPrice: "72000.00",
      currentBid: "76000.00",
      photos: ["/api/listings/55/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate1,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-01-15"),
      tinted: true,
      tintingDate: new Date("2024-06-01"),
      engine: "3.0L Twin Turbo",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "AWD",
      color: "Silver",
      condition: "very_good",
      location: "Dushanbe",
      createdAt: now,
    };

    const listing16: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "996345",
      make: "Lexus",
      model: "RX",
      year: 2019,
      mileage: 55000,
      vin: "2T2BZMCA5KC123456",
      description: "Luxury hybrid SUV",
      startingPrice: "105000.00",
      currentBid: "110000.00",
      photos: ["/api/listings/56/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate2,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-05-10"),
      tinted: true,
      tintingDate: new Date("2024-11-01"),
      engine: "3.5L Hybrid",
      transmission: "CVT",
      fuelType: "Hybrid",
      bodyType: "SUV",
      driveType: "AWD",
      color: "White",
      condition: "excellent",
      location: "Khujand",
      createdAt: now,
    };

    const listing17: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "197456",
      make: "Cadillac",
      model: "XT5",
      year: 2020,
      mileage: 48000,
      vin: "1GYKNDRS8LZ123456",
      description: "American luxury SUV",
      startingPrice: "85000.00",
      currentBid: "89000.00",
      photos: ["/api/listings/57/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate1,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-03-25"),
      tinted: false,
      tintingDate: null,
      engine: "3.6L V6",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "SUV",
      driveType: "AWD",
      color: "Black",
      condition: "excellent",
      location: "Dushanbe",
      createdAt: now,
    };

    const listing18: CarListing = {
      id: this.nextId++,
      sellerId: sellerUser.id,
      lotNumber: "298567",
      make: "Lincoln",
      model: "Navigator",
      year: 2021,
      mileage: 32000,
      vin: "5LMJJ3LT2MEL123456",
      description: "Full-size luxury SUV",
      startingPrice: "140000.00",
      currentBid: "145000.00",
      photos: ["/api/listings/58/photo/0"],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: futureDate2,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-06-15"),
      tinted: true,
      tintingDate: new Date("2024-12-15"),
      engine: "3.5L Twin Turbo",
      transmission: "Automatic",
      fuelType: "Gasoline",
      bodyType: "SUV",
      driveType: "4WD",
      color: "Gray",
      condition: "excellent",
      location: "Khujand",
      createdAt: now,
    };

    this.carListings.push(listing1, listing2, listing3, listing4, listing5, listing6, listing7, listing8, listing9, listing10, listing11, listing12, listing13, listing14, listing15, listing16, listing17, listing18);

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
      id: 1,
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
      email: insertUser.email,
      username: insertUser.username,
      phoneNumber: insertUser.phoneNumber || null,
      fullName: insertUser.fullName || null,
      role: insertUser.role,
      profilePhoto: insertUser.profilePhoto || null,
      isActive: insertUser.isActive || false,
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