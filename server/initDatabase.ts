import { db } from './db';
import { users, carListings, bids, favorites, notifications, carAlerts, banners, sellCarSection, advertisementCarousel, documents, alertViews, smsVerificationCodes } from '../shared/schema';

export async function initializeDatabaseWithSampleData() {
  console.log('Initializing database with sample data...');
  
  try {
    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log('Database already has sample data, skipping initialization');
      return;
    }

    const now = new Date();
    const auction1EndTime = new Date('2025-06-24T14:30:00Z');
    const auction2EndTime = new Date('2025-06-25T10:15:00Z');
    const auction3EndTime = new Date('2025-06-26T16:45:00Z');
    const auction4EndTime = new Date('2025-06-27T12:00:00Z');

    // Create admin user
    const adminUser = await db.insert(users).values({
      email: "admin@autobid.tj",
      passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456",
      username: "admin",
      phoneNumber: "+992000000001",
      fullName: "Администратор Системы",
      role: "admin",
      profilePhoto: null,
      isActive: true,
      createdAt: now,
    }).returning();

    // Create seller user
    const sellerUser = await db.insert(users).values({
      email: "seller@autobid.tj",
      passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456",
      username: "seller",
      phoneNumber: "+992000000002",
      fullName: "Продавец Автомобилей",
      role: "seller",
      profilePhoto: null,
      isActive: true,
      createdAt: now,
    }).returning();

    // Create buyer user
    const buyerUser = await db.insert(users).values({
      email: "buyer@autobid.tj",
      passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz123456",
      username: "buyer",
      phoneNumber: "+992000000003",
      fullName: "Покупатель Автомобилей",
      role: "buyer",
      profilePhoto: null,
      isActive: true,
      createdAt: now,
    }).returning();

    // Create sample car listings
    const listing1 = await db.insert(carListings).values({
      sellerId: sellerUser[0].id,
      lotNumber: "LOT724583",
      make: "Porsche",
      model: "911 Turbo S",
      year: 2020,
      mileage: 15000,
      vin: "WP0AB2A95LS123456",
      description: "This stunning 2020 Porsche 911 Turbo S is a true masterpiece of automotive engineering. With only 15,000 carefully driven miles, this vehicle represents the pinnacle of sports car performance. Features include adaptive suspension, ceramic brakes, and a premium sound system.",
      startingPrice: "140000.00",
      currentBid: "145500.00",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1594736797933-d0d3c6db4497?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ]),
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction1EndTime,
      endTime: auction1EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-12-31"),
      location: "Душанбе",
      createdAt: now,
    }).returning();

    const listing2 = await db.insert(carListings).values({
      sellerId: sellerUser[0].id,
      lotNumber: "LOT425983",
      make: "BMW",
      model: "M3 Competition",
      year: 2021,
      mileage: 8500,
      vin: "WBS8M9C51M5K12345",
      description: "Exceptional 2021 BMW M3 Competition with only 8,500 miles. This high-performance sedan combines luxury with track-ready capabilities. Features carbon fiber trim, M sport exhaust, and premium interior appointments.",
      startingPrice: "75000.00",
      currentBid: "78500.00",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1594736797933-d0d3c6db4497?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ]),
      auctionDuration: 48,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction2EndTime,
      endTime: auction2EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-11-30"),
      location: "Худжанд",
      createdAt: now,
    }).returning();

    const listing3 = await db.insert(carListings).values({
      sellerId: sellerUser[0].id,
      lotNumber: "LOT893274",
      make: "Mercedes-Benz",
      model: "S-Class",
      year: 2022,
      mileage: 12000,
      vin: "WDDUX8GB1NA123456",
      description: "Luxurious 2022 Mercedes-Benz S-Class with premium features and low mileage. This flagship sedan offers the ultimate in comfort and technology.",
      startingPrice: "95000.00",
      currentBid: "98000.00",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ]),
      auctionDuration: 96,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction3EndTime,
      endTime: auction3EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-12-31"),
      location: "Душанбе",
      createdAt: now,
    }).returning();

    const listing4 = await db.insert(carListings).values({
      sellerId: sellerUser[0].id,
      lotNumber: "LOT567432",
      make: "Audi",
      model: "RS6 Avant",
      year: 2021,
      mileage: 18000,
      vin: "WAUZZZ4G3LN123456",
      description: "High-performance 2021 Audi RS6 Avant wagon with all-wheel drive. Perfect blend of practicality and performance with a twin-turbo V8 engine.",
      startingPrice: "110000.00",
      currentBid: "115000.00",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ]),
      auctionDuration: 72,
      status: "active",
      auctionStartTime: now,
      auctionEndTime: auction4EndTime,
      endTime: auction4EndTime,
      customsCleared: true,
      recycled: false,
      technicalInspectionValid: true,
      technicalInspectionDate: new Date("2025-12-15"),
      location: "Курган-Тюбе",
      createdAt: now,
    }).returning();

    // Create sample bids
    await db.insert(bids).values({
      listingId: listing1[0].id,
      bidderId: buyerUser[0].id,
      amount: "145500.00",
      createdAt: now,
    });

    await db.insert(bids).values({
      listingId: listing2[0].id,
      bidderId: buyerUser[0].id,
      amount: "78500.00",
      createdAt: now,
    });

    // Create sample favorites
    await db.insert(favorites).values({
      userId: buyerUser[0].id,
      listingId: listing1[0].id,
      createdAt: now,
    });

    await db.insert(favorites).values({
      userId: buyerUser[0].id,
      listingId: listing3[0].id,
      createdAt: now,
    });

    // Create sample notifications
    await db.insert(notifications).values({
      userId: buyerUser[0].id,
      title: "Новая ставка на ваш любимый автомобиль",
      message: "На автомобиль Porsche 911 Turbo S была сделана новая ставка в размере $145,500",
      type: "bid_update",
      isRead: false,
      createdAt: now,
    });

    await db.insert(notifications).values({
      userId: sellerUser[0].id,
      title: "Новая ставка на ваш автомобиль",
      message: "На ваш BMW M3 Competition была сделана ставка в размере $78,500",
      type: "new_bid",
      isRead: false,
      createdAt: now,
    });

    // Create sample car alerts
    await db.insert(carAlerts).values({
      userId: buyerUser[0].id,
      make: "Porsche",
      model: "911",
      minYear: 2018,
      maxYear: 2024,
      minPrice: "100000",
      maxPrice: "200000",
      isActive: true,
      createdAt: now,
    });

    await db.insert(carAlerts).values({
      userId: buyerUser[0].id,
      make: "BMW",
      model: "M3",
      minYear: 2020,
      maxYear: 2024,
      minPrice: "70000",
      maxPrice: "120000",
      isActive: true,
      createdAt: now,
    });

    // Create sample banners
    await db.insert(banners).values({
      title: "Добро пожаловать в AutoBid!",
      subtitle: "Лучшая платформа для автомобильных аукционов в Таджикистане",
      description: "Найдите автомобиль своей мечты по лучшей цене",
      buttonText: "Начать торги",
      buttonUrl: "/listings",
      backgroundImageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      isActive: true,
      displayOrder: 1,
      createdAt: now,
    });

    await db.insert(banners).values({
      title: "Премиум автомобили",
      subtitle: "Эксклюзивная коллекция люксовых авто",
      description: "Porsche, BMW, Mercedes-Benz и другие премиум бренды",
      buttonText: "Смотреть каталог",
      buttonUrl: "/premium",
      backgroundImageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      isActive: true,
      displayOrder: 2,
      createdAt: now,
    });

    // Create sell car section
    await db.insert(sellCarSection).values({
      title: "Продайте свой автомобиль",
      subtitle: "Получите лучшую цену на аукционе",
      description: "Наша платформа поможет вам продать автомобиль быстро и выгодно",
      buttonText: "Разместить объявление",
      buttonUrl: "/sell",
      backgroundImageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600",
      isActive: true,
      createdAt: now,
    });

    // Create advertisement carousel
    await db.insert(advertisementCarousel).values({
      title: "Специальное предложение",
      description: "Скидки до 10% на комиссию аукциона",
      imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      linkUrl: "/promo",
      isActive: true,
      displayOrder: 1,
      createdAt: now,
    });

    await db.insert(advertisementCarousel).values({
      title: "Новые поступления",
      description: "Свежие автомобили каждую неделю",
      imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      linkUrl: "/new-arrivals",
      isActive: true,
      displayOrder: 2,
      createdAt: now,
    });

    // Create sample documents
    await db.insert(documents).values({
      type: "terms",
      title: "Условия использования",
      content: "Настоящие условия использования регулируют доступ и использование платформы AutoBid...",
      isActive: true,
      createdAt: now,
    });

    await db.insert(documents).values({
      type: "privacy",
      title: "Политика конфиденциальности",
      content: "AutoBid уважает вашу конфиденциальность и стремится защитить ваши персональные данные...",
      isActive: true,
      createdAt: now,
    });

    await db.insert(documents).values({
      type: "faq",
      title: "Часто задаваемые вопросы",
      content: "Ответы на самые популярные вопросы о работе с платформой AutoBid...",
      isActive: true,
      createdAt: now,
    });

    console.log('Sample data initialization completed successfully!');
    console.log('Created users:', adminUser[0].id, sellerUser[0].id, buyerUser[0].id);
    console.log('Created listings:', listing1[0].id, listing2[0].id, listing3[0].id, listing4[0].id);

  } catch (error) {
    console.error('Error initializing database with sample data:', error);
    throw error;
  }
}