import { db } from "./db";
import { users, carListings, bids, favorites } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function initializeDatabaseWithSampleData() {
  console.log("Initializing database with sample data...");

  try {
    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already has data, skipping initialization");
      return;
    }
  } catch (error) {
    console.log("Database connection issue, attempting to create tables...");
    // Продолжаем инициализацию даже при ошибках подключения
  }

  const now = new Date();

  // Create sample users
  const [adminUser] = await db.insert(users).values({
    username: "admin",
    email: "admin@autoauction.tj",
    role: "admin",
    isActive: true,
    profilePhoto: null,
  }).returning();

  const [sellerUser] = await db.insert(users).values({
    username: "seller123",
    email: "seller@autoauction.tj", 
    role: "seller",
    isActive: true,
    profilePhoto: null,
  }).returning();

  const [buyerUser] = await db.insert(users).values({
    username: "buyer456",
    email: "buyer@autoauction.tj",
    role: "buyer", 
    isActive: true,
    profilePhoto: null,
  }).returning();

  // Fixed auction end times to prevent timer reset on server restart
  const auction1EndTime = new Date('2025-06-16T13:30:00Z'); // Завершенный аукцион для теста
  const auction2EndTime = new Date('2025-06-17T18:45:00Z'); // Fixed future date
  const auction3EndTime = new Date('2025-06-18T12:20:00Z'); // Fixed future date
  const auction4EndTime = new Date('2025-06-19T10:15:00Z'); // Fixed future date
  const auction5EndTime = new Date('2025-06-20T14:30:00Z'); // Fixed future date
  const auction6EndTime = new Date('2025-06-21T16:45:00Z'); // Fixed future date
  const auction7EndTime = new Date('2025-06-22T11:00:00Z'); // Fixed future date
  const auction8EndTime = new Date('2025-06-23T13:15:00Z'); // Fixed future date
  const auction9EndTime = new Date('2025-06-24T17:30:00Z'); // Fixed future date
  const auction10EndTime = new Date('2025-06-25T09:45:00Z'); // Fixed future date
  const auction11EndTime = new Date('2025-06-26T15:20:00Z'); // Fixed future date
  const auction12EndTime = new Date('2025-06-27T19:10:00Z'); // Fixed future date

  // Create sample car listings
  const listings = await db.insert(carListings).values([
    {
      sellerId: sellerUser.id,
      lotNumber: "LOT724583",
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
        "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1594736797933-d0d3c6db4497?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction1EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-12-31",
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "LOT892456",
      make: "BMW",
      model: "M5 Competition",
      year: 2021,
      mileage: 8500,
      vin: "WBSJF0C59MCE12345",
      description: "An exceptional 2021 BMW M5 Competition in pristine condition. This high-performance sedan combines luxury with incredible power, featuring a twin-turbo V8 engine producing 617 horsepower.",
      startingPrice: "85000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1616422285623-13ff0162193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction2EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-11-30",
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "567891",
      make: "Ford",
      model: "Mustang GT",
      year: 2019,
      mileage: 35000,
      vin: "1FA6P8CF3K5123456",
      description: "A powerful 2019 Ford Mustang GT with the iconic 5.0L V8 engine. This American muscle car delivers thrilling performance and classic styling that never goes out of fashion.",
      startingPrice: "28000.00",
      currentBid: "31000.00",
      photos: [
        "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1607892035701-a80beab6b0c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction9EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-10-15",
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "234567",
      make: "Audi",
      model: "RS6 Avant",
      year: 2022,
      mileage: 12000,
      vin: "WAUZZZ4G2DN123456",
      description: "A stunning 2022 Audi RS6 Avant - the ultimate performance wagon. With its twin-turbo V8 engine and Quattro all-wheel drive, this vehicle offers supercar performance with everyday practicality.",
      startingPrice: "110000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction4EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-12-15",
    }
  ]).returning();

  // Create sample bids for the auctions
  await db.insert(bids).values([
    {
      listingId: listings[0].id, // Porsche 911
      bidderId: buyerUser.id,
      amount: "145500.00",
    },
    {
      listingId: listings[0].id, // Porsche 911  
      bidderId: buyerUser.id,
      amount: "145000.00",
    },
    {
      listingId: listings[2].id, // Ford Mustang
      bidderId: buyerUser.id,
      amount: "31000.00",
    },
    {
      listingId: listings[2].id, // Ford Mustang
      bidderId: buyerUser.id,
      amount: "30500.00", 
    },
    {
      listingId: listings[2].id, // Ford Mustang
      bidderId: buyerUser.id,
      amount: "30000.00",
    },
    {
      listingId: listings[2].id, // Ford Mustang
      bidderId: buyerUser.id,
      amount: "29500.00",
    }
  ]);

  // Create sample favorites
  await db.insert(favorites).values([
    {
      userId: buyerUser.id,
      listingId: listings[2].id, // Ford Mustang
    }
  ]);

  console.log("Database initialized with sample data successfully!");
}