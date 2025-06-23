import { db } from "./db";
import { users, carListings, bids, favorites } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function initializeDatabaseWithSampleData() {
  console.log("Initializing database with sample data...");

  // Check if data already exists
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already has data, skipping initialization");
    return;
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
  const auction1EndTime = new Date('2025-06-25T13:30:00Z');
  const auction2EndTime = new Date('2025-06-25T18:45:00Z');
  const auction3EndTime = new Date('2025-06-26T12:20:00Z');
  const auction4EndTime = new Date('2025-06-26T10:15:00Z');
  const auction5EndTime = new Date('2025-06-26T14:30:00Z');
  const auction6EndTime = new Date('2025-06-27T16:45:00Z');
  const auction7EndTime = new Date('2025-06-27T11:00:00Z');
  const auction8EndTime = new Date('2025-06-28T13:15:00Z');
  const auction9EndTime = new Date('2025-06-28T17:30:00Z');
  const auction10EndTime = new Date('2025-06-29T09:45:00Z');
  const auction11EndTime = new Date('2025-06-29T15:20:00Z');
  const auction12EndTime = new Date('2025-06-30T19:10:00Z');
  const auction13EndTime = new Date('2025-06-30T21:00:00Z');
  const auction14EndTime = new Date('2025-07-01T14:30:00Z');
  const auction15EndTime = new Date('2025-07-01T16:45:00Z');
  const auction16EndTime = new Date('2025-07-02T12:00:00Z');
  const auction17EndTime = new Date('2025-07-02T18:30:00Z');
  const auction18EndTime = new Date('2025-07-03T15:15:00Z');

  // Original 18 car listings from the catalog
  const listings = await db.insert(carListings).values([
    {
      sellerId: sellerUser.id,
      lotNumber: "724583",
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
      recycled: true,
      technicalInspectionValid: true,
      technicalInspectionDate: "2026-03-15",
      tinted: false,
      engine: "3.8L Twin-Turbo H6",
      transmission: "8-Speed PDK",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "AWD",
      color: "Guards Red",
      condition: "excellent",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "839472",
      make: "Lamborghini",
      model: "Huracan EVO",
      year: 2021,
      mileage: 8500,
      vin: "ZHWUC4ZF8MLA12345",
      description: "A breathtaking Lamborghini Huracan EVO with naturally aspirated V10 power.",
      startingPrice: "200000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction2EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2026-01-20",
      tinted: false,
      engine: "5.2L V10",
      transmission: "7-Speed DCT",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "AWD",
      color: "Arancio Borealis",
      condition: "excellent",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "567234",
      make: "Ferrari",
      model: "F8 Tributo",
      year: 2020,
      mileage: 12000,
      vin: "ZFF9A2A0XL0123456",
      description: "Ferrari F8 Tributo - the pinnacle of Italian engineering and design.",
      startingPrice: "250000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction3EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-12-10",
      tinted: false,
      engine: "3.9L Twin-Turbo V8",
      transmission: "7-Speed DCT",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "RWD",
      color: "Rosso Corsa",
      condition: "excellent",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "892456",
      make: "BMW",
      model: "M5 Competition",
      year: 2021,
      mileage: 18000,
      vin: "WBSJF0C59MCE12345",
      description: "BMW M5 Competition with incredible twin-turbo V8 performance.",
      startingPrice: "85000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction4EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-11-30",
      tinted: true,
      tintingDate: "2024-05-15",
      engine: "4.4L Twin-Turbo V8",
      transmission: "8-Speed Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "AWD",
      color: "Mineral Grey",
      condition: "excellent",
      location: "Khujand"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "345678",
      make: "Mercedes-Benz",
      model: "AMG GT 63 S",
      year: 2020,
      mileage: 22000,
      vin: "WDD2970351A123456",
      description: "Mercedes-AMG GT 63 S 4MATIC+ - luxury meets extreme performance.",
      startingPrice: "120000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction5EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-09-20",
      tinted: false,
      engine: "4.0L Twin-Turbo V8",
      transmission: "9-Speed Automatic",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "AWD",
      color: "Obsidian Black",
      condition: "very_good",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "789123",
      make: "Audi",
      model: "RS6 Avant",
      year: 2022,
      mileage: 15000,
      vin: "WAUZZZ4G2DN123456",
      description: "Audi RS6 Avant - the ultimate performance wagon with Quattro all-wheel drive.",
      startingPrice: "110000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction6EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2026-02-15",
      tinted: false,
      engine: "4.0L Twin-Turbo V8",
      transmission: "8-Speed Tiptronic",
      fuelType: "Gasoline",
      bodyType: "Wagon",
      driveType: "AWD",
      color: "Nardo Grey",
      condition: "excellent",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "456789",
      make: "McLaren",
      model: "720S",
      year: 2019,
      mileage: 9500,
      vin: "SBM14DCA6KW123456",
      description: "McLaren 720S - British engineering excellence with carbon fiber construction.",
      startingPrice: "280000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction7EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-08-30",
      tinted: false,
      engine: "4.0L Twin-Turbo V8",
      transmission: "7-Speed DCT",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "RWD",
      color: "Papaya Spark",
      condition: "excellent",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "123890",
      make: "Bentley",
      model: "Continental GT",
      year: 2021,
      mileage: 11000,
      vin: "SCBDE03W2LC123456",
      description: "Bentley Continental GT - the pinnacle of British luxury and craftsmanship.",
      startingPrice: "180000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction8EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2026-04-10",
      tinted: true,
      tintingDate: "2023-08-20",
      engine: "6.0L Twin-Turbo W12",
      transmission: "8-Speed Automatic",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "AWD",
      color: "Beluga",
      condition: "excellent",
      location: "Khujand"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "567891",
      make: "Ford",
      model: "Mustang GT",
      year: 2019,
      mileage: 35000,
      vin: "1FA6P8CF3K5123456",
      description: "Ford Mustang GT with the iconic 5.0L V8 engine - American muscle car perfection.",
      startingPrice: "28000.00",
      currentBid: "31000.00",
      photos: [
        "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction9EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-10-15",
      tinted: false,
      engine: "5.0L V8",
      transmission: "6-Speed Manual",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "RWD",
      color: "Grabber Blue",
      condition: "good",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "234890",
      make: "Chevrolet",
      model: "Corvette Z06",
      year: 2020,
      mileage: 16000,
      vin: "1G1YY26E555123456",
      description: "Chevrolet Corvette Z06 - American supercar with naturally aspirated V8 power.",
      startingPrice: "75000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction10EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-07-25",
      tinted: false,
      engine: "6.2L Supercharged V8",
      transmission: "7-Speed Manual",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "RWD",
      color: "Torch Red",
      condition: "very_good",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "678901",
      make: "Jaguar",
      model: "F-Type R",
      year: 2019,
      mileage: 28000,
      vin: "SAJWA6FZ6K8K12345",
      description: "Jaguar F-Type R - British sports car with supercharged V8 performance.",
      startingPrice: "65000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction11EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-06-30",
      tinted: true,
      tintingDate: "2023-12-05",
      engine: "5.0L Supercharged V8",
      transmission: "8-Speed Automatic",
      fuelType: "Gasoline",
      bodyType: "Convertible",
      driveType: "RWD",
      color: "British Racing Green",
      condition: "good",
      location: "Khujand"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "345123",
      make: "Maserati",
      model: "GranTurismo",
      year: 2018,
      mileage: 32000,
      vin: "ZAM45MMA4J0123456",
      description: "Maserati GranTurismo - Italian grand tourer with naturally aspirated V8 sound.",
      startingPrice: "55000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction12EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-05-15",
      tinted: false,
      engine: "4.7L V8",
      transmission: "6-Speed Automatic",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "RWD",
      color: "Blu Sofisticato",
      condition: "good",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "789456",
      make: "Aston Martin",
      model: "Vantage",
      year: 2020,
      mileage: 14000,
      vin: "SCFRMFAW4LGL12345",
      description: "Aston Martin Vantage - British elegance with twin-turbo V8 performance.",
      startingPrice: "125000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction13EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2026-01-08",
      tinted: false,
      engine: "4.0L Twin-Turbo V8",
      transmission: "8-Speed Automatic",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "RWD",
      color: "Racing Green",
      condition: "excellent",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "456123",
      make: "Nissan",
      model: "GT-R NISMO",
      year: 2021,
      mileage: 7500,
      vin: "JN1AR5EF5MM123456",
      description: "Nissan GT-R NISMO - Japanese engineering marvel with twin-turbo V6 power.",
      startingPrice: "175000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction14EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2026-03-20",
      tinted: true,
      tintingDate: "2024-01-10",
      engine: "3.8L Twin-Turbo V6",
      transmission: "6-Speed DCT",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "AWD",
      color: "Pearl White",
      condition: "excellent",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "123567",
      make: "Lexus",
      model: "LC 500",
      year: 2019,
      mileage: 25000,
      vin: "JTHHP5AY4KA123456",
      description: "Lexus LC 500 - Japanese luxury grand tourer with naturally aspirated V8.",
      startingPrice: "68000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction15EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-12-05",
      tinted: false,
      engine: "5.0L V8",
      transmission: "10-Speed Automatic",
      fuelType: "Gasoline",
      bodyType: "Coupe",
      driveType: "RWD",
      color: "Structural Blue",
      condition: "very_good",
      location: "Khujand"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "890234",
      make: "Alfa Romeo",
      model: "Giulia Quadrifoglio",
      year: 2020,
      mileage: 19000,
      vin: "ZARFAEBN5L7123456",
      description: "Alfa Romeo Giulia Quadrifoglio - Italian performance sedan with twin-turbo V6.",
      startingPrice: "45000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction16EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-08-18",
      tinted: false,
      engine: "2.9L Twin-Turbo V6",
      transmission: "8-Speed Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "RWD",
      color: "Rosso Competizione",
      condition: "very_good",
      location: "Dushanbe"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "567890",
      make: "Cadillac",
      model: "CTS-V",
      year: 2018,
      mileage: 42000,
      vin: "1G6A15S69J0123456",
      description: "Cadillac CTS-V - American luxury performance sedan with supercharged V8.",
      startingPrice: "38000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction17EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2025-04-22",
      tinted: true,
      tintingDate: "2023-06-30",
      engine: "6.2L Supercharged V8",
      transmission: "8-Speed Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "RWD",
      color: "Crystal White",
      condition: "good",
      location: "Khujand"
    },
    {
      sellerId: sellerUser.id,
      lotNumber: "234567",
      make: "Genesis",
      model: "G70 3.3T",
      year: 2021,
      mileage: 13000,
      vin: "KMTG34LA4MU123456",
      description: "Genesis G70 3.3T - Korean luxury sport sedan with twin-turbo V6 performance.",
      startingPrice: "35000.00",
      currentBid: null,
      photos: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction18EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: "2026-02-28",
      tinted: false,
      engine: "3.3L Twin-Turbo V6",
      transmission: "8-Speed Automatic",
      fuelType: "Gasoline",
      bodyType: "Sedan",
      driveType: "AWD",
      color: "Uyuni White",
      condition: "excellent",
      location: "Dushanbe"
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