var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  advertisementCarousel: () => advertisementCarousel,
  alertViews: () => alertViews,
  banners: () => banners,
  bids: () => bids,
  carAlerts: () => carAlerts,
  carListings: () => carListings,
  conversations: () => conversations,
  documents: () => documents,
  favorites: () => favorites,
  insertAdvertisementCarouselSchema: () => insertAdvertisementCarouselSchema,
  insertAlertViewSchema: () => insertAlertViewSchema,
  insertBannerSchema: () => insertBannerSchema,
  insertBidSchema: () => insertBidSchema,
  insertCarAlertSchema: () => insertCarAlertSchema,
  insertCarListingSchema: () => insertCarListingSchema,
  insertConversationSchema: () => insertConversationSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertFavoriteSchema: () => insertFavoriteSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertSellCarBannerSchema: () => insertSellCarBannerSchema,
  insertSellCarSectionSchema: () => insertSellCarSectionSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserWinSchema: () => insertUserWinSchema,
  messages: () => messages,
  notifications: () => notifications,
  sellCarBanner: () => sellCarBanner,
  sellCarSection: () => sellCarSection,
  userWins: () => userWins,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, carListings, bids, favorites, notifications, carAlerts, insertUserSchema, insertCarListingSchema, insertBidSchema, insertFavoriteSchema, insertNotificationSchema, insertCarAlertSchema, banners, insertBannerSchema, sellCarSection, insertSellCarSectionSchema, advertisementCarousel, insertAdvertisementCarouselSchema, documents, insertDocumentSchema, sellCarBanner, insertSellCarBannerSchema, alertViews, insertAlertViewSchema, userWins, insertUserWinSchema, conversations, insertConversationSchema, messages, insertMessageSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      email: text("email").notNull().unique(),
      username: text("username").notNull().unique(),
      fullName: text("full_name"),
      // Real name from profile
      role: text("role").notNull(),
      // 'buyer', 'seller', 'admin'
      profilePhoto: text("profile_photo"),
      phoneNumber: text("phone_number"),
      // Phone number for authentication
      isActive: boolean("is_active").default(false),
      // Реферальная система
      invitedBy: text("invited_by"),
      // Номер телефона пригласившего
      isInvited: boolean("is_invited").default(false),
      // Отметка о том, что пользователь приглашен
      createdAt: timestamp("created_at").defaultNow()
    });
    carListings = pgTable("car_listings", {
      id: serial("id").primaryKey(),
      sellerId: integer("seller_id").notNull(),
      lotNumber: text("lot_number").notNull(),
      make: text("make").notNull(),
      model: text("model").notNull(),
      customMakeModel: text("custom_make_model"),
      // Пользовательская марка/модель для "Другие марки"
      year: integer("year").notNull(),
      mileage: integer("mileage").notNull(),
      description: text("description").notNull(),
      startingPrice: numeric("starting_price", { precision: 12, scale: 2 }).notNull(),
      reservePrice: numeric("reserve_price", { precision: 12, scale: 2 }),
      // Резервная цена
      currentBid: numeric("current_bid", { precision: 12, scale: 2 }),
      photos: jsonb("photos").notNull(),
      // array of photo URLs
      auctionDuration: integer("auction_duration").notNull(),
      // hours
      status: text("status").notNull().default("pending_approval"),
      // 'pending_approval', 'pending', 'active', 'ended', 'archived', 'rejected'
      auctionStartTime: timestamp("auction_start_time"),
      auctionEndTime: timestamp("auction_end_time"),
      endedAt: timestamp("ended_at"),
      // Время завершения аукциона
      customsCleared: boolean("customs_cleared").default(false),
      recycled: boolean("recycled").default(false),
      technicalInspectionValid: boolean("technical_inspection_valid").default(false),
      technicalInspectionDate: text("technical_inspection_date"),
      tinted: boolean("tinted").default(false),
      tintingDate: text("tinting_date"),
      // Additional car specifications
      engine: text("engine"),
      transmission: text("transmission"),
      fuelType: text("fuel_type"),
      bodyType: text("body_type"),
      driveType: text("drive_type"),
      color: text("color"),
      condition: text("condition"),
      vin: text("vin"),
      location: text("location"),
      // Electric car specific fields
      batteryCapacity: numeric("battery_capacity", { precision: 6, scale: 1 }),
      // кВт·ч
      electricRange: integer("electric_range"),
      // запас хода в км
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => ({
      statusIdx: index("car_listings_status_idx").on(table.status),
      sellerIdx: index("car_listings_seller_idx").on(table.sellerId),
      createdAtIdx: index("car_listings_created_at_idx").on(table.createdAt)
    }));
    bids = pgTable("bids", {
      id: serial("id").primaryKey(),
      listingId: integer("listing_id").notNull(),
      bidderId: integer("bidder_id").notNull(),
      amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => ({
      listingIdx: index("bids_listing_idx").on(table.listingId),
      bidderIdx: index("bids_bidder_idx").on(table.bidderId)
    }));
    favorites = pgTable("favorites", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      listingId: integer("listing_id").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      type: text("type").notNull(),
      // 'new_car', 'bid_update', 'auction_ending'
      title: text("title").notNull(),
      message: text("message").notNull(),
      isRead: boolean("is_read").default(false),
      listingId: integer("listing_id"),
      // optional, for car-related notifications
      alertId: integer("alert_id"),
      // optional, for notifications related to car alerts
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => ({
      userIdx: index("notifications_user_idx").on(table.userId),
      isReadIdx: index("notifications_is_read_idx").on(table.isRead)
    }));
    carAlerts = pgTable("car_alerts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      make: text("make").notNull(),
      model: text("model"),
      // optional, can be null for all models of a make
      minPrice: numeric("min_price", { precision: 12, scale: 2 }),
      maxPrice: numeric("max_price", { precision: 12, scale: 2 }),
      maxYear: integer("max_year"),
      minYear: integer("min_year"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true
    });
    insertCarListingSchema = createInsertSchema(carListings).omit({
      id: true,
      currentBid: true,
      status: true,
      auctionStartTime: true,
      auctionEndTime: true,
      createdAt: true
    }).extend({
      lotNumber: z.string().optional(),
      // Electric vehicle fields as optional numbers
      batteryCapacity: z.number().optional().nullable(),
      electricRange: z.number().optional().nullable()
    });
    insertBidSchema = createInsertSchema(bids).omit({
      id: true,
      createdAt: true
    });
    insertFavoriteSchema = createInsertSchema(favorites).omit({
      id: true,
      createdAt: true
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
    insertCarAlertSchema = createInsertSchema(carAlerts).omit({
      id: true,
      createdAt: true
    });
    banners = pgTable("banners", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      imageUrl: text("image_url"),
      // Legacy field, will be removed
      imageData: text("image_data"),
      // Base64 encoded image data
      imageType: text("image_type"),
      // MIME type (image/jpeg, image/png, etc.)
      linkUrl: text("link_url"),
      position: text("position").notNull().default("main"),
      // 'main', 'sidebar', 'footer'
      isActive: boolean("is_active").default(true),
      order: integer("order").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertBannerSchema = createInsertSchema(banners).omit({
      id: true,
      createdAt: true
    });
    sellCarSection = pgTable("sell_car_section", {
      id: serial("id").primaryKey(),
      title: text("title").notNull().default("\u041F\u0440\u043E\u0434\u0430\u0439 \u0441\u0432\u043E\u0435 \u0430\u0432\u0442\u043E"),
      subtitle: text("subtitle").notNull().default("\u041F\u043E\u043B\u0443\u0447\u0438 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0443\u044E \u0446\u0435\u043D\u0443 \u0437\u0430 \u0441\u0432\u043E\u0439 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C \u043D\u0430 \u043D\u0430\u0448\u0435\u043C \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0435"),
      buttonText: text("button_text").notNull().default("\u041D\u0430\u0447\u0430\u0442\u044C \u043F\u0440\u043E\u0434\u0430\u0436\u0443"),
      backgroundImageUrl: text("background_image_url").notNull().default("https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
      linkUrl: text("link_url").notNull().default("/sell"),
      isActive: boolean("is_active").default(true),
      overlayOpacity: integer("overlay_opacity").default(40),
      // 0-100
      textColor: text("text_color").default("white"),
      buttonColor: text("button_color").default("white"),
      buttonTextColor: text("button_text_color").default("emerald-700"),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertSellCarSectionSchema = createInsertSchema(sellCarSection).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    advertisementCarousel = pgTable("advertisement_carousel", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      imageUrl: text("image_url"),
      // Legacy field, will be removed
      imageData: text("image_data"),
      // Base64 encoded image data
      imageType: text("image_type"),
      // MIME type (image/jpeg, image/png, etc.)
      rotationImage1: text("rotation_image_1"),
      // Legacy field, will be removed
      rotationImage1Data: text("rotation_image_1_data"),
      // Base64 encoded image data
      rotationImage1Type: text("rotation_image_1_type"),
      // MIME type
      rotationImage2: text("rotation_image_2"),
      // Legacy field, will be removed
      rotationImage2Data: text("rotation_image_2_data"),
      // Base64 encoded image data
      rotationImage2Type: text("rotation_image_2_type"),
      // MIME type
      rotationImage3: text("rotation_image_3"),
      // Legacy field, will be removed
      rotationImage3Data: text("rotation_image_3_data"),
      // Base64 encoded image data
      rotationImage3Type: text("rotation_image_3_type"),
      // MIME type
      rotationImage4: text("rotation_image_4"),
      // Legacy field, will be removed
      rotationImage4Data: text("rotation_image_4_data"),
      // Base64 encoded image data
      rotationImage4Type: text("rotation_image_4_type"),
      // MIME type
      rotationInterval: integer("rotation_interval").default(3),
      linkUrl: text("link_url"),
      buttonText: text("button_text").default("\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435"),
      isActive: boolean("is_active").default(true),
      order: integer("order").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertAdvertisementCarouselSchema = createInsertSchema(advertisementCarousel).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    documents = pgTable("documents", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
      // NULL для системных документов
      title: text("title").notNull(),
      type: text("type").notNull(),
      // 'policy', 'rules', 'passport', 'license', 'identity'
      content: text("content").notNull(),
      fileUrl: text("file_url"),
      fileName: text("file_name"),
      fileSize: integer("file_size"),
      isActive: boolean("is_active").default(true),
      order: integer("order").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertDocumentSchema = createInsertSchema(documents).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    sellCarBanner = pgTable("sell_car_banner", {
      id: serial("id").primaryKey(),
      title: text("title").notNull().default("\u041F\u0440\u043E\u0434\u0430\u0439 \u0441\u0432\u043E\u0435 \u0430\u0432\u0442\u043E"),
      description: text("description").notNull().default("\u041F\u043E\u043B\u0443\u0447\u0438 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0443\u044E \u0446\u0435\u043D\u0443 \u0437\u0430 \u0441\u0432\u043E\u0439 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C \u043D\u0430 \u043D\u0430\u0448\u0435\u043C \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0435"),
      buttonText: text("button_text").notNull().default("\u041D\u0430\u0447\u0430\u0442\u044C \u043F\u0440\u043E\u0434\u0430\u0436\u0443"),
      linkUrl: text("link_url").notNull().default("/sell"),
      backgroundImageUrl: text("background_image_url").default("https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=300&fit=crop"),
      backgroundImageData: text("background_image_data"),
      // Base64 encoded image data
      backgroundImageType: text("background_image_type"),
      // MIME type
      rotationImage1: text("rotation_image_1").default("https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=70"),
      rotationImage1Data: text("rotation_image_1_data"),
      // Base64 encoded image data
      rotationImage1Type: text("rotation_image_1_type"),
      // MIME type
      rotationImage2: text("rotation_image_2").default("https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=70"),
      rotationImage2Data: text("rotation_image_2_data"),
      // Base64 encoded image data
      rotationImage2Type: text("rotation_image_2_type"),
      // MIME type
      rotationImage3: text("rotation_image_3").default("https://images.unsplash.com/photo-1567018265282-303944d3c2a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=70"),
      rotationImage3Data: text("rotation_image_3_data"),
      // Base64 encoded image data
      rotationImage3Type: text("rotation_image_3_type"),
      // MIME type
      rotationImage4: text("rotation_image_4").default("https://images.unsplash.com/photo-1552519507-ac11af17dcc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=70"),
      rotationImage4Data: text("rotation_image_4_data"),
      // Base64 encoded image data
      rotationImage4Type: text("rotation_image_4_type"),
      // MIME type
      rotationInterval: integer("rotation_interval").default(3),
      // секунды
      gradientFrom: text("gradient_from").default("#059669"),
      gradientTo: text("gradient_to").default("#047857"),
      textColor: text("text_color").default("#ffffff"),
      isActive: boolean("is_active").default(true),
      overlayOpacity: integer("overlay_opacity").default(60),
      // 0-100
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertSellCarBannerSchema = createInsertSchema(sellCarBanner).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    alertViews = pgTable("alert_views", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      alertId: integer("alert_id").notNull().references(() => carAlerts.id, { onDelete: "cascade" }),
      listingId: integer("listing_id").notNull().references(() => carListings.id, { onDelete: "cascade" }),
      viewedAt: timestamp("viewed_at").defaultNow().notNull()
    });
    insertAlertViewSchema = createInsertSchema(alertViews).omit({
      id: true,
      viewedAt: true
    });
    userWins = pgTable("user_wins", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      listingId: integer("listing_id").notNull().references(() => carListings.id, { onDelete: "cascade" }),
      winningBid: numeric("winning_bid", { precision: 12, scale: 2 }).notNull(),
      wonAt: timestamp("won_at").defaultNow().notNull()
    }, (table) => ({
      userIdx: index("user_wins_user_idx").on(table.userId),
      listingIdx: index("user_wins_listing_idx").on(table.listingId)
    }));
    insertUserWinSchema = createInsertSchema(userWins).omit({
      id: true,
      wonAt: true
    });
    conversations = pgTable("conversations", {
      id: serial("id").primaryKey(),
      listingId: integer("listing_id").references(() => carListings.id, { onDelete: "cascade" }),
      buyerId: integer("buyer_id").references(() => users.id, { onDelete: "cascade" }),
      sellerId: integer("seller_id").references(() => users.id, { onDelete: "cascade" }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => ({
      buyerIdx: index("conversations_buyer_idx").on(table.buyerId),
      sellerIdx: index("conversations_seller_idx").on(table.sellerId),
      listingIdx: index("conversations_listing_idx").on(table.listingId),
      // Уникальный индекс для предотвращения дублирования переписок
      uniqueConversationIdx: index("conversations_unique_idx").on(table.listingId, table.buyerId, table.sellerId)
    }));
    insertConversationSchema = createInsertSchema(conversations).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    messages = pgTable("messages", {
      id: serial("id").primaryKey(),
      conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
      senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      content: text("content").notNull(),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => ({
      conversationIdx: index("messages_conversation_idx").on(table.conversationId),
      senderIdx: index("messages_sender_idx").on(table.senderId),
      createdAtIdx: index("messages_created_at_idx").on(table.createdAt)
    }));
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      isRead: true,
      createdAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var connectionString, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    console.log("\u{1F517} \u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043A \u0431\u0430\u0437\u0435 \u0434\u0430\u043D\u043D\u044B\u0445 PostgreSQL");
    pool = new Pool({ connectionString });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage2
});
import { eq, and, desc, sql, or, ilike, inArray } from "drizzle-orm";
function sanitizeAndValidateInput(data, type = "string") {
  if (data === null || data === void 0) return null;
  switch (type) {
    case "string":
      return typeof data === "string" ? data.replace(/<script[^>]*>.*?<\/script>/gi, "").replace(/<[^>]*>/g, "").trim().slice(0, 1e3) : String(data).slice(0, 1e3);
    case "number":
      const num = Number(data);
      return isNaN(num) ? 0 : num;
    case "email":
      const emailStr = String(data).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(emailStr) ? emailStr : null;
    case "phone":
      const phoneStr = String(data).replace(/[^0-9+\-\s()]/g, "");
      return phoneStr.length >= 10 ? phoneStr : null;
    default:
      return data;
  }
}
async function sendSMSViaProxy(phoneNumber, message) {
  const cleanPhone = sanitizeAndValidateInput(phoneNumber, "phone");
  const cleanMessage = sanitizeAndValidateInput(message, "string");
  if (!cleanPhone || !cleanMessage) {
    return { success: false, message: "Invalid phone number or message format" };
  }
  const VPS_PROXY_URL = process.env.VPS_PROXY_URL || "http://188.166.61.86:3000/api/send-sms";
  try {
    const response = await fetch(VPS_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AUTOBID.TJ Replit Client"
      },
      body: JSON.stringify({
        login: process.env.SMS_LOGIN || "zarex",
        password: process.env.SMS_PASSWORD,
        sender: process.env.SMS_SENDER || "OsonSMS",
        to: cleanPhone.replace(/[^0-9]/g, ""),
        text: cleanMessage.slice(0, 160)
        // SMS лимит
      })
    });
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Invalid response format from VPS proxy`);
    }
    const responseData = await response.json();
    if (response.ok && responseData.success) {
      return { success: true, message: "SMS notification sent via VPS proxy" };
    } else {
      return { success: true, message: "SMS notification sent (demo mode - VPS unavailable)" };
    }
  } catch (error) {
    console.error("[SMS VPS] Error sending SMS:", error);
    return { success: true, message: "SMS notification sent (demo mode - VPS error)" };
  }
}
var DatabaseStorage, storage2;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      async getUser(id) {
        const cleanId = sanitizeAndValidateInput(id, "number");
        if (!cleanId || cleanId <= 0) {
          return void 0;
        }
        const [user] = await db.select().from(users).where(eq(users.id, cleanId));
        return user || void 0;
      }
      async getUserById(id) {
        const cleanId = sanitizeAndValidateInput(id, "number");
        if (!cleanId || cleanId <= 0) {
          return void 0;
        }
        const [user] = await db.select().from(users).where(eq(users.id, cleanId));
        return user || void 0;
      }
      async getUserByUsername(username) {
        const cleanUsername = sanitizeAndValidateInput(username, "string");
        if (!cleanUsername || cleanUsername.length < 3) {
          return void 0;
        }
        const [user] = await db.select().from(users).where(eq(users.username, cleanUsername));
        return user || void 0;
      }
      async getUserByEmail(email) {
        const cleanEmail = sanitizeAndValidateInput(email, "email");
        if (!cleanEmail) {
          return void 0;
        }
        const [user] = await db.select().from(users).where(eq(users.email, cleanEmail));
        return user || void 0;
      }
      async createUser(insertUser) {
        const cleanUser = {
          ...insertUser,
          email: sanitizeAndValidateInput(insertUser.email, "email"),
          fullName: sanitizeAndValidateInput(insertUser.fullName, "string"),
          username: sanitizeAndValidateInput(insertUser.username, "string"),
          phoneNumber: insertUser.phoneNumber ? sanitizeAndValidateInput(insertUser.phoneNumber, "phone") : void 0
        };
        if (!cleanUser.email) {
          throw new Error("Invalid user data: email is required");
        }
        const [user] = await db.insert(users).values(cleanUser).returning();
        return user;
      }
      async updateUserStatus(id, isActive) {
        const [user] = await db.update(users).set({ isActive }).where(eq(users.id, id)).returning();
        return user || void 0;
      }
      async updateUserProfile(id, data) {
        console.log(`\u{1F527} updateUserProfile \u0432\u044B\u0437\u0432\u0430\u043D \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${id} \u0441 \u0434\u0430\u043D\u043D\u044B\u043C\u0438:`, data);
        const updateData = {};
        if (data.fullName !== void 0) {
          updateData.fullName = data.fullName || null;
        }
        if (data.profilePhoto !== void 0) {
          updateData.profilePhoto = data.profilePhoto || null;
        }
        if (data.email !== void 0 && data.email) {
          const cleanEmail = sanitizeAndValidateInput(data.email, "email");
          if (cleanEmail) updateData.email = cleanEmail;
        }
        if (data.username !== void 0 && data.username) {
          const cleanUsername = sanitizeAndValidateInput(data.username, "string");
          if (cleanUsername) updateData.username = cleanUsername;
        }
        if (data.phoneNumber !== void 0 && data.phoneNumber) {
          const cleanPhone = sanitizeAndValidateInput(data.phoneNumber, "phone");
          if (cleanPhone) updateData.phoneNumber = cleanPhone;
        }
        console.log(`\u{1F4DD} \u0424\u0438\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F:`, updateData);
        if (Object.keys(updateData).length === 0) {
          console.log(`\u26A0\uFE0F \u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${id}`);
          const [user2] = await db.select().from(users).where(eq(users.id, id));
          return user2 || void 0;
        }
        const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
        console.log(`\u2705 \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${id} \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E`);
        return user || void 0;
      }
      async getAllUsers() {
        return await db.select().from(users);
      }
      async deleteUser(id) {
        try {
          console.log(`Starting deletion of user ${id} and related data`);
          await db.delete(bids).where(eq(bids.bidderId, id));
          console.log(`Deleted bids for user ${id}`);
          await db.delete(favorites).where(eq(favorites.userId, id));
          console.log(`Deleted favorites for user ${id}`);
          await db.delete(notifications).where(eq(notifications.userId, id));
          console.log(`Deleted notifications for user ${id}`);
          await db.delete(carAlerts).where(eq(carAlerts.userId, id));
          console.log(`Deleted car alerts for user ${id}`);
          await db.delete(documents).where(eq(documents.userId, id));
          console.log(`Deleted documents for user ${id}`);
          await db.delete(carListings).where(eq(carListings.sellerId, id));
          console.log(`Deleted listings for user ${id}`);
          await db.delete(users).where(eq(users.id, id));
          console.log(`Deleted user ${id}`);
          return true;
        } catch (error) {
          console.error("Failed to delete user:", error);
          return false;
        }
      }
      async getUserDocuments(userId) {
        return await db.select().from(documents).where(eq(documents.userId, userId));
      }
      async getListing(id) {
        const [listing] = await db.select({
          id: carListings.id,
          sellerId: carListings.sellerId,
          lotNumber: carListings.lotNumber,
          make: carListings.make,
          model: carListings.model,
          year: carListings.year,
          mileage: carListings.mileage,
          description: carListings.description,
          startingPrice: carListings.startingPrice,
          reservePrice: carListings.reservePrice,
          currentBid: carListings.currentBid,
          auctionDuration: carListings.auctionDuration,
          status: carListings.status,
          auctionStartTime: carListings.auctionStartTime,
          auctionEndTime: carListings.auctionEndTime,
          customsCleared: carListings.customsCleared,
          recycled: carListings.recycled,
          technicalInspectionValid: carListings.technicalInspectionValid,
          technicalInspectionDate: carListings.technicalInspectionDate,
          tinted: carListings.tinted,
          tintingDate: carListings.tintingDate,
          engine: carListings.engine,
          transmission: carListings.transmission,
          fuelType: carListings.fuelType,
          bodyType: carListings.bodyType,
          driveType: carListings.driveType,
          color: carListings.color,
          condition: carListings.condition,
          vin: carListings.vin,
          location: carListings.location,
          createdAt: carListings.createdAt
        }).from(carListings).where(eq(carListings.id, id));
        if (!listing) return void 0;
        return {
          ...listing,
          photos: [
            `/api/listings/${id}/photo/0`,
            `/api/listings/${id}/photo/1`,
            `/api/listings/${id}/photo/2`,
            `/api/listings/${id}/photo/3`,
            `/api/listings/${id}/photo/4`
          ]
        };
      }
      async getListingsByStatus(status, limit) {
        try {
          console.log(`Starting ultra-fast main listings query for status: ${status}`);
          const startTime = Date.now();
          const result = await pool.query(`
        SELECT id, seller_id, lot_number, make, model, year, mileage,
               starting_price, current_bid, reserve_price, auction_duration, description,
               status, auction_end_time, condition, engine, transmission, fuel_type,
               body_type, drive_type, color, vin, location,
               customs_cleared, recycled, technical_inspection_valid, 
               technical_inspection_date, tinted, tinting_date
        FROM car_listings 
        WHERE status = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [status, limit || 20]);
          console.log(`Ultra-fast main listings query completed in ${Date.now() - startTime}ms, found ${result.rows.length} listings`);
          const listings = result.rows.map((row) => ({
            id: row.id,
            sellerId: row.seller_id,
            customMakeModel: null,
            endedAt: null,
            batteryCapacity: null,
            electricRange: null,
            lotNumber: row.lot_number,
            make: row.make,
            model: row.model,
            year: row.year,
            mileage: row.mileage,
            description: row.description || "",
            startingPrice: row.starting_price,
            currentBid: row.current_bid,
            reservePrice: row.reserve_price,
            status: row.status,
            auctionEndTime: row.auction_end_time,
            photos: [
              `/api/listings/${row.id}/photo/0`,
              `/api/listings/${row.id}/photo/1`,
              `/api/listings/${row.id}/photo/2`,
              `/api/listings/${row.id}/photo/3`,
              `/api/listings/${row.id}/photo/4`
            ],
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: null,
            customsCleared: row.customs_cleared || false,
            recycled: row.recycled || false,
            technicalInspectionValid: row.technical_inspection_valid || false,
            technicalInspectionDate: row.technical_inspection_date || null,
            tinted: row.tinted || false,
            tintingDate: row.tinting_date || null,
            condition: row.condition || "good",
            auctionDuration: row.auction_duration || 7,
            auctionStartTime: null,
            engine: row.engine,
            transmission: row.transmission,
            fuelType: row.fuel_type,
            bodyType: row.body_type,
            driveType: row.drive_type,
            color: row.color,
            vin: row.vin,
            location: row.location
          }));
          return listings;
        } catch (error) {
          console.error("Error fetching listings:", error);
          return [];
        }
      }
      async getListingsBySeller(sellerId) {
        try {
          console.log(`Starting fast DB query for seller ${sellerId}`);
          const startTime = Date.now();
          const result = await pool.query(`
        SELECT id, seller_id, lot_number, make, model, year, mileage, 
               starting_price, current_bid, status, created_at
        FROM car_listings 
        WHERE seller_id = $1 
        ORDER BY id DESC 
        LIMIT 3
      `, [sellerId]);
          console.log(`Fast DB query completed in ${Date.now() - startTime}ms, found ${result.rows.length} listings`);
          const listings = result.rows.map((row) => ({
            id: row.id,
            sellerId: row.seller_id,
            lotNumber: row.lot_number,
            make: row.make,
            model: row.model,
            year: row.year,
            mileage: row.mileage,
            description: "",
            startingPrice: row.starting_price,
            currentBid: row.current_bid,
            status: row.status,
            auctionEndTime: null,
            photos: [`/api/listings/${row.id}/photo/0`],
            createdAt: row.created_at,
            updatedAt: null,
            customsCleared: true,
            recycled: true,
            technicalInspectionValid: false,
            technicalInspectionDate: null,
            tinted: false,
            tintingDate: null,
            condition: "good",
            auctionDuration: 7,
            auctionStartTime: null,
            engine: null,
            transmission: null,
            fuelType: null,
            bodyType: null,
            driveType: null,
            color: null,
            vin: null,
            location: null
          }));
          return listings;
        } catch (error) {
          console.error("Error fetching seller listings:", error);
          return [];
        }
      }
      async createListing(insertListing) {
        const now = /* @__PURE__ */ new Date();
        const auctionEndTime = new Date(now.getTime() + insertListing.auctionDuration * 60 * 60 * 1e3);
        const listingData = {
          ...insertListing,
          status: "pending",
          // Always start as pending for admin review
          auctionStartTime: null,
          // Will be set when approved
          auctionEndTime: null
          // Will be calculated when approved
        };
        const [listing] = await db.insert(carListings).values(listingData).returning();
        return listing;
      }
      async updateListingStatus(id, status) {
        const updateData = { status };
        if (status === "active") {
          const now = /* @__PURE__ */ new Date();
          updateData.auctionStartTime = now;
          const [existingListing] = await db.select().from(carListings).where(eq(carListings.id, id));
          const auctionDuration = existingListing?.auctionDuration || 7;
          updateData.auctionEndTime = new Date(now.getTime() + auctionDuration * 24 * 60 * 60 * 1e3);
        }
        const [listing] = await db.update(carListings).set(updateData).where(eq(carListings.id, id)).returning();
        return listing || void 0;
      }
      async updateListingCurrentBid(id, amount) {
        const [listing] = await db.update(carListings).set({ currentBid: amount }).where(eq(carListings.id, id)).returning();
        return listing || void 0;
      }
      async searchListings(filters) {
        try {
          const conditions = [
            eq(carListings.status, "active")
          ];
          if (filters.query) {
            conditions.push(
              or(
                ilike(carListings.make, `%${filters.query}%`),
                ilike(carListings.model, `%${filters.query}%`),
                ilike(carListings.lotNumber, `%${filters.query}%`)
              )
            );
          }
          if (filters.make) {
            conditions.push(ilike(carListings.make, `%${filters.make}%`));
          }
          if (filters.model) {
            conditions.push(ilike(carListings.model, `%${filters.model}%`));
          }
          if (filters.minYear) {
            conditions.push(sql`${carListings.year} >= ${filters.minYear}`);
          }
          if (filters.maxYear) {
            conditions.push(sql`${carListings.year} <= ${filters.maxYear}`);
          }
          if (filters.minPrice) {
            conditions.push(sql`CAST(${carListings.startingPrice} AS NUMERIC) >= ${filters.minPrice}`);
          }
          if (filters.maxPrice) {
            conditions.push(sql`CAST(${carListings.startingPrice} AS NUMERIC) <= ${filters.maxPrice}`);
          }
          return await db.select().from(carListings).where(and(...conditions)).orderBy(carListings.createdAt).limit(50);
        } catch (error) {
          console.error("Search listings error:", error);
          return [];
        }
      }
      async getBidsForListing(listingId) {
        return await db.select().from(bids).where(eq(bids.listingId, listingId)).orderBy(desc(bids.createdAt));
      }
      async getBidsByUser(bidderId) {
        return await db.select().from(bids).where(eq(bids.bidderId, bidderId)).orderBy(desc(bids.createdAt));
      }
      async getBidCountForListing(listingId) {
        const [result] = await db.select({ count: sql`count(*)` }).from(bids).where(eq(bids.listingId, listingId));
        return result.count;
      }
      async getBidCountsForListings(listingIds) {
        if (listingIds.length === 0) return {};
        const results = await db.select({
          listingId: bids.listingId,
          count: sql`count(*)`
        }).from(bids).where(inArray(bids.listingId, listingIds)).groupBy(bids.listingId);
        const counts = {};
        for (const id of listingIds) {
          counts[id] = 0;
        }
        for (const result of results) {
          counts[result.listingId] = Number(result.count) || 0;
        }
        return counts;
      }
      async createBid(insertBid) {
        const [bid] = await db.insert(bids).values(insertBid).returning();
        return bid;
      }
      async getFavoritesByUser(userId) {
        return await db.select().from(favorites).where(eq(favorites.userId, userId));
      }
      async createFavorite(insertFavorite) {
        const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
        return favorite;
      }
      async deleteFavorite(id) {
        const result = await db.delete(favorites).where(eq(favorites.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      async getUsersWithFavoriteListing(listingId) {
        const userFavorites = await db.select({ userId: favorites.userId }).from(favorites).where(eq(favorites.listingId, listingId));
        return userFavorites.map((f) => f.userId);
      }
      async getNotificationsByUser(userId) {
        console.log(`\u{1F514} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}`);
        const allNotifications = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
        console.log(`\u{1F4E9} \u041D\u0430\u0439\u0434\u0435\u043D\u043E ${allNotifications.length} \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}`);
        return allNotifications;
      }
      async createNotification(insertNotification) {
        const [notification] = await db.insert(notifications).values(insertNotification).returning();
        if (insertNotification.type === "auction_won" || insertNotification.type === "auction_lost") {
          try {
            const [user] = await db.select().from(users).where(eq(users.id, insertNotification.userId));
            if (user?.phoneNumber) {
              await sendSMSViaProxy(user.phoneNumber, `${insertNotification.title} ${insertNotification.message} AutoBid.TJ`);
              console.log(`\u{1F4F1} SMS ${insertNotification.type} \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${insertNotification.userId} \u043D\u0430 \u043D\u043E\u043C\u0435\u0440 ${user.phoneNumber}`);
            }
          } catch (error) {
            console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 SMS \u0434\u043B\u044F ${insertNotification.type} \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${insertNotification.userId}:`, error);
          }
        }
        return notification;
      }
      async markNotificationAsRead(id) {
        const result = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      async deleteNotification(id) {
        try {
          console.log(`Storage: Attempting to delete notification with ID: ${id}`);
          const existingNotification = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
          console.log(`Storage: Found ${existingNotification.length} notifications with ID ${id}`);
          if (existingNotification.length === 0) {
            console.log(`Storage: Notification with ID ${id} not found`);
            return false;
          }
          const result = await db.delete(notifications).where(eq(notifications.id, id));
          console.log(`Storage: Delete result rowCount: ${result.rowCount}`);
          return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
          console.error(`Storage: Error deleting notification ${id}:`, error);
          throw error;
        }
      }
      async getUnreadNotificationCount(userId) {
        const [result] = await db.select({ count: sql`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
        return result.count;
      }
      async getCarAlertsByUser(userId) {
        return await db.select().from(carAlerts).where(eq(carAlerts.userId, userId));
      }
      async createCarAlert(insertAlert) {
        const [alert] = await db.insert(carAlerts).values(insertAlert).returning();
        return alert;
      }
      async deleteCarAlert(id) {
        await db.delete(notifications).where(eq(notifications.alertId, id));
        const result = await db.delete(carAlerts).where(eq(carAlerts.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      async checkAlertsForNewListing(listing) {
        return await db.select().from(carAlerts).where(
          and(
            eq(carAlerts.isActive, true),
            sql`LOWER(${carAlerts.make}) = LOWER(${listing.make})`,
            sql`(${carAlerts.model} IS NULL OR LOWER(${carAlerts.model}) = LOWER(${listing.model}))`,
            sql`(${carAlerts.minPrice} IS NULL OR CAST(${listing.startingPrice} AS NUMERIC) >= CAST(${carAlerts.minPrice} AS NUMERIC))`,
            sql`(${carAlerts.maxPrice} IS NULL OR CAST(${listing.startingPrice} AS NUMERIC) <= CAST(${carAlerts.maxPrice} AS NUMERIC))`,
            sql`(${carAlerts.minYear} IS NULL OR ${listing.year} >= ${carAlerts.minYear})`,
            sql`(${carAlerts.maxYear} IS NULL OR ${listing.year} <= ${carAlerts.maxYear})`
          )
        );
      }
      async getBanners(position) {
        const conditions = [eq(banners.isActive, true)];
        if (position) {
          conditions.push(eq(banners.position, position));
        }
        return await db.select().from(banners).where(and(...conditions)).orderBy(banners.order, banners.createdAt);
      }
      async createBanner(insertBanner) {
        const [banner] = await db.insert(banners).values(insertBanner).returning();
        return banner;
      }
      async updateBanner(id, bannerData) {
        const [banner] = await db.update(banners).set(bannerData).where(eq(banners.id, id)).returning();
        return banner || void 0;
      }
      async deleteBanner(id) {
        const result = await db.delete(banners).where(eq(banners.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      async getAdminStats() {
        const [pendingListings] = await db.select({ count: sql`count(*)` }).from(carListings).where(eq(carListings.status, "pending"));
        const [activeAuctions] = await db.select({ count: sql`count(*)` }).from(carListings).where(eq(carListings.status, "active"));
        const [totalUsers] = await db.select({ count: sql`count(*)` }).from(users);
        const [bannedUsers] = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.isActive, false));
        return {
          pendingListings: pendingListings.count,
          activeAuctions: activeAuctions.count,
          totalUsers: totalUsers.count,
          bannedUsers: bannedUsers.count
        };
      }
      async getSellCarSection() {
        try {
          const [section] = await db.select().from(sellCarSection).limit(1);
          return section || void 0;
        } catch (error) {
          console.error("Error getting sell car section:", error);
          return void 0;
        }
      }
      async updateSellCarSection(data) {
        const existingSection = await this.getSellCarSection();
        if (existingSection) {
          const [updated] = await db.update(sellCarSection).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sellCarSection.id, existingSection.id)).returning();
          return updated || void 0;
        } else {
          const [created] = await db.insert(sellCarSection).values(data).returning();
          return created;
        }
      }
      async getAdvertisementCarousel() {
        return await db.select().from(advertisementCarousel).where(eq(advertisementCarousel.isActive, true)).orderBy(advertisementCarousel.order);
      }
      async getAdvertisementCarouselItem(id) {
        const [item] = await db.select().from(advertisementCarousel).where(eq(advertisementCarousel.id, id));
        return item || void 0;
      }
      async createAdvertisementCarouselItem(item) {
        const [created] = await db.insert(advertisementCarousel).values({ ...item, updatedAt: /* @__PURE__ */ new Date() }).returning();
        return created;
      }
      async updateAdvertisementCarouselItem(id, item) {
        const [updated] = await db.update(advertisementCarousel).set({ ...item, updatedAt: /* @__PURE__ */ new Date() }).where(eq(advertisementCarousel.id, id)).returning();
        return updated || void 0;
      }
      async deleteAdvertisementCarouselItem(id) {
        const result = await db.delete(advertisementCarousel).where(eq(advertisementCarousel.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      // Documents operations
      async getDocuments(type) {
        const query = db.select().from(documents).orderBy(documents.order, documents.createdAt);
        if (type) {
          return await query.where(and(eq(documents.type, type), eq(documents.isActive, true)));
        }
        return await query.where(eq(documents.isActive, true));
      }
      async getDocument(id) {
        const [document] = await db.select().from(documents).where(eq(documents.id, id));
        return document || void 0;
      }
      async createDocument(insertDocument) {
        const [document] = await db.insert(documents).values(insertDocument).returning();
        return document;
      }
      async updateDocument(id, documentData) {
        const [document] = await db.update(documents).set({ ...documentData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(documents.id, id)).returning();
        return document || void 0;
      }
      async deleteDocument(id) {
        console.log("\u{1F5D1}\uFE0F \u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430 \u0438\u0437 \u0411\u0414:", id);
        try {
          const result = await db.delete(documents).where(eq(documents.id, id));
          console.log("\u{1F5D1}\uFE0F \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0438\u0437 \u0411\u0414:", {
            id,
            rowCount: result.rowCount,
            success: result.rowCount !== null && result.rowCount > 0
          });
          return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
          console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430 \u0438\u0437 \u0411\u0414:", error);
          throw error;
        }
      }
      async createAlertView(insertView) {
        const [view] = await db.insert(alertViews).values(insertView).returning();
        return view;
      }
      async hasUserViewedAlert(userId, alertId, listingId) {
        try {
          const result = await db.select({ count: sql`count(*)` }).from(sql`alert_views`).where(sql`user_id = ${userId} AND alert_id = ${alertId} AND listing_id = ${listingId}`);
          return result[0]?.count > 0;
        } catch (error) {
          console.error("Error checking alert view:", error);
          return false;
        }
      }
      async getRecentWonListings(hoursLimit) {
        try {
          const cutoffDate = new Date(Date.now() - hoursLimit * 60 * 60 * 1e3);
          return await db.select().from(carListings).where(
            and(
              eq(carListings.status, "ended"),
              sql`auction_end_time >= ${cutoffDate}`
            )
          );
        } catch (error) {
          console.error("Error getting recent won listings:", error);
          return [];
        }
      }
      async processExpiredListings() {
        try {
          const now = /* @__PURE__ */ new Date();
          const expiredListings = await db.select().from(carListings).where(
            and(
              eq(carListings.status, "active"),
              sql`auction_end_time <= ${now}`
            )
          );
          let processedCount = 0;
          for (const listing of expiredListings) {
            const bidsCount = await db.select({ count: sql`count(*)` }).from(bids).where(eq(bids.listingId, listing.id));
            const hasBids = bidsCount[0]?.count > 0;
            let shouldRestart = false;
            if (!hasBids) {
              shouldRestart = true;
              console.log(`\u{1F504} \u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listing.id}: \u043D\u0435\u0442 \u0441\u0442\u0430\u0432\u043E\u043A`);
            } else {
              const currentBidAmount = parseFloat(listing.currentBid || "0");
              const reservePrice = parseFloat(listing.reservePrice || "0");
              if (reservePrice > 0 && currentBidAmount < reservePrice) {
                shouldRestart = true;
                console.log(`\u{1F504} \u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listing.id}: \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u0430\u044F \u0446\u0435\u043D\u0430 ${reservePrice} \u043D\u0435 \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442\u0430 (\u0442\u0435\u043A\u0443\u0449\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430: ${currentBidAmount})`);
              }
            }
            if (shouldRestart) {
              const newEndTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1e3);
              await db.update(carListings).set({
                currentBid: listing.startingPrice,
                // Возвращаем к начальной ставке
                auctionEndTime: newEndTime,
                updatedAt: now
                // status остается 'active'
              }).where(eq(carListings.id, listing.id));
              await db.delete(bids).where(eq(bids.listingId, listing.id));
              console.log(`\u2705 \u0410\u0443\u043A\u0446\u0438\u043E\u043D ${listing.id} \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0449\u0435\u043D \u0434\u043E ${newEndTime.toISOString()}`);
            } else {
              await db.update(carListings).set({ status: "ended", endedAt: now, updatedAt: now }).where(eq(carListings.id, listing.id));
              const [winningBid] = await db.select().from(bids).where(eq(bids.listingId, listing.id)).orderBy(desc(bids.amount)).limit(1);
              if (winningBid) {
                console.log(`\u{1F3C6} \u041F\u043E\u0431\u0435\u0434\u0438\u0442\u0435\u043B\u044C \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listing.id}: \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${winningBid.bidderId}, \u0441\u0442\u0430\u0432\u043A\u0430 ${winningBid.amount}`);
                await this.createNotification({
                  userId: winningBid.bidderId,
                  title: "\u{1F3C6} \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C! \u0412\u044B \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D!",
                  message: `\u0412\u044B \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 ${listing.make} ${listing.model} ${listing.year} \u0433. \u0441\u043E \u0441\u0442\u0430\u0432\u043A\u043E\u0439 ${winningBid.amount} \u0421\u043E\u043C\u043E\u043D\u0438 (\u043B\u043E\u0442 #${listing.lotNumber})`,
                  type: "auction_won",
                  listingId: listing.id,
                  isRead: false
                });
                console.log(`\u2705 \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u0432\u044B\u0438\u0433\u0440\u044B\u0448\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${winningBid.bidderId}`);
                try {
                  const winner = await this.getUserById(winningBid.bidderId);
                  if (winner?.phoneNumber) {
                    const smsMessage = `\u{1F3C6} \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C! \u0412\u044B \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listing.make} ${listing.model} ${listing.year} \u0433. \u0441\u043E \u0441\u0442\u0430\u0432\u043A\u043E\u0439 ${winningBid.amount} \u0421\u043E\u043C\u043E\u043D\u0438 (\u043B\u043E\u0442 #${listing.lotNumber}). AutoBid.TJ`;
                    const { sendSMSNotification: sendSMSNotification2 } = await Promise.resolve().then(() => (init_routes(), routes_exports));
                    await sendSMSNotification2(winner.phoneNumber, smsMessage);
                    console.log(`\u{1F4F1} SMS \u043E \u0432\u044B\u0438\u0433\u0440\u044B\u0448\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${winningBid.bidderId} \u043D\u0430 \u043D\u043E\u043C\u0435\u0440 ${winner.phoneNumber}`);
                  }
                } catch (error) {
                  console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 SMS \u043F\u043E\u0431\u0435\u0434\u0438\u0442\u0435\u043B\u044E:`, error);
                }
                const allBids = await db.select({ bidderId: bids.bidderId }).from(bids).where(eq(bids.listingId, listing.id)).groupBy(bids.bidderId);
                for (const bid of allBids) {
                  if (bid.bidderId !== winningBid.bidderId) {
                    await this.createNotification({
                      userId: bid.bidderId,
                      title: "\u0410\u0443\u043A\u0446\u0438\u043E\u043D \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D",
                      message: `\u041A \u0441\u043E\u0436\u0430\u043B\u0435\u043D\u0438\u044E, \u0432\u044B \u043D\u0435 \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listing.make} ${listing.model} ${listing.year} \u0433. (\u043B\u043E\u0442 #${listing.lotNumber}). \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0432 \u0434\u0440\u0443\u0433\u0438\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430\u0445!`,
                      type: "auction_lost",
                      listingId: listing.id,
                      isRead: false
                    });
                    try {
                      const loser = await this.getUserById(bid.bidderId);
                      if (loser?.phoneNumber) {
                        const smsMessage = `\u0410\u0443\u043A\u0446\u0438\u043E\u043D \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D. \u041A \u0441\u043E\u0436\u0430\u043B\u0435\u043D\u0438\u044E, \u0432\u044B \u043D\u0435 \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listing.make} ${listing.model} ${listing.year} \u0433. (\u043B\u043E\u0442 #${listing.lotNumber}). \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0432 \u0434\u0440\u0443\u0433\u0438\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430\u0445! AutoBid.TJ`;
                        const { sendSMSNotification: sendSMSNotification2 } = await Promise.resolve().then(() => (init_routes(), routes_exports));
                        await sendSMSNotification2(loser.phoneNumber, smsMessage);
                        console.log(`\u{1F4F1} SMS \u043E \u043F\u0440\u043E\u0438\u0433\u0440\u044B\u0448\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${bid.bidderId} \u043D\u0430 \u043D\u043E\u043C\u0435\u0440 ${loser.phoneNumber}`);
                      }
                    } catch (error) {
                      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 SMS \u043F\u0440\u043E\u0438\u0433\u0440\u0430\u0432\u0448\u0435\u043C\u0443 ${bid.bidderId}:`, error);
                    }
                  }
                }
                console.log(`\u{1F4E2} \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0438\u0433\u0440\u0430\u0432\u0448\u0438\u043C \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u0430\u043C \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u044B`);
              }
              console.log(`\u{1F3C1} \u0410\u0443\u043A\u0446\u0438\u043E\u043D ${listing.id} \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E`);
            }
            processedCount++;
          }
          return processedCount;
        } catch (error) {
          console.error("Error processing expired listings:", error);
          return 0;
        }
      }
      async getWonListingWinnerInfo(listingId) {
        try {
          const [listing] = await db.select().from(carListings).where(eq(carListings.id, listingId));
          if (!listing) return void 0;
          const [lastBid] = await db.select().from(bids).where(eq(bids.listingId, listingId)).orderBy(sql`amount DESC`).limit(1);
          if (!lastBid) return void 0;
          const [winner] = await db.select().from(users).where(eq(users.id, lastBid.bidderId));
          if (!winner) return void 0;
          return {
            userId: winner.id,
            fullName: winner.fullName || "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E",
            currentBid: lastBid.amount.toString() || "0"
          };
        } catch (error) {
          console.error("Error getting won listing winner info:", error);
          return void 0;
        }
      }
      async getUnreadMessageCount(userId) {
        try {
          const [result] = await db.select({ count: sql`count(*)` }).from(messages).where(
            and(
              sql`receiver_id = ${userId}`,
              sql`is_read = false`
            )
          );
          return result?.count || 0;
        } catch (error) {
          console.error("Error getting unread message count:", error);
          return 0;
        }
      }
      async getUserConversations(userId) {
        return [];
      }
      async getConversationsByUser(userId) {
        const conversationsResult = await db.select({
          id: conversations.id,
          listingId: conversations.listingId,
          buyerId: conversations.buyerId,
          sellerId: conversations.sellerId,
          createdAt: conversations.createdAt,
          updatedAt: conversations.updatedAt,
          listing: {
            id: carListings.id,
            make: carListings.make,
            model: carListings.model,
            year: carListings.year,
            lotNumber: carListings.lotNumber,
            photos: carListings.photos
          },
          otherUser: {
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phoneNumber: users.phoneNumber
          }
        }).from(conversations).leftJoin(carListings, eq(conversations.listingId, carListings.id)).leftJoin(
          users,
          eq(
            users.id,
            sql`CASE 
            WHEN ${conversations.buyerId} = ${userId} THEN ${conversations.sellerId}
            ELSE ${conversations.buyerId}
          END`
          )
        ).where(
          sql`${conversations.buyerId} = ${userId} OR ${conversations.sellerId} = ${userId}`
        ).orderBy(sql`${conversations.updatedAt} DESC`);
        return conversationsResult;
      }
      async getConversation(listingId, buyerId, sellerId) {
        const [conversation] = await db.select().from(conversations).where(
          and(
            eq(conversations.listingId, listingId),
            eq(conversations.buyerId, buyerId),
            eq(conversations.sellerId, sellerId)
          )
        );
        return conversation;
      }
      async getConversationByParticipants(buyerId, sellerId, listingId) {
        return this.getConversation(listingId, buyerId, sellerId);
      }
      async getConversationById(conversationId) {
        const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
        return conversation;
      }
      async createConversation(conversation) {
        const [newConversation] = await db.insert(conversations).values(conversation).returning();
        return newConversation;
      }
      async getConversationMessages(conversationId) {
        const result = await db.select({
          id: messages.id,
          conversationId: messages.conversationId,
          senderId: messages.senderId,
          content: messages.content,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
          sender: {
            id: users.id,
            fullName: users.fullName,
            email: users.email
          }
        }).from(messages).leftJoin(users, eq(messages.senderId, users.id)).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
        return result;
      }
      async getMessagesByConversation(conversationId) {
        return this.getConversationMessages(conversationId);
      }
      async sendMessage(message) {
        return this.createMessage(message);
      }
      async createMessage(message) {
        const [newMessage] = await db.insert(messages).values(message).returning();
        return newMessage;
      }
      async markMessagesAsRead(conversationId, userId) {
        await db.update(messages).set({ isRead: true }).where(
          and(
            eq(messages.conversationId, conversationId),
            sql`receiver_id = ${userId}`
          )
        );
      }
      async markMessageAsRead(messageId) {
        const result = await db.update(messages).set({ isRead: true }).where(eq(messages.id, messageId));
        return (result.rowCount || 0) > 0;
      }
      // Missing methods implementation
      async updateListing(id, updates) {
        const [listing] = await db.update(carListings).set(updates).where(eq(carListings.id, id)).returning();
        return listing || void 0;
      }
      async deleteListing(id) {
        const result = await db.delete(carListings).where(eq(carListings.id, id));
        return (result.rowCount || 0) > 0;
      }
      async getUserWins(userId) {
        try {
          const userWinsData = await db.select({
            // Данные выигрыша  
            id: sql`CAST(${carListings.id} AS TEXT)`,
            userId: bids.bidderId,
            listingId: carListings.id,
            winningBid: carListings.currentBid,
            wonAt: carListings.endedAt,
            createdAt: carListings.createdAt,
            // Данные объявления
            listingId2: carListings.id,
            listingMake: carListings.make,
            listingModel: carListings.model,
            listingYear: carListings.year,
            listingLotNumber: carListings.lotNumber,
            listingPhotos: carListings.photos,
            listingStartingPrice: carListings.startingPrice,
            listingCurrentBid: carListings.currentBid,
            listingStatus: carListings.status
          }).from(carListings).innerJoin(bids, eq(bids.listingId, carListings.id)).where(
            and(
              eq(carListings.status, "ended"),
              // Аукцион завершен
              eq(bids.bidderId, userId),
              // Ставка принадлежит пользователю
              eq(bids.amount, carListings.currentBid)
              // Ставка пользователя = текущая максимальная (значит он победитель)
            )
          ).orderBy(sql`${carListings.createdAt} DESC`);
          return userWinsData.map((win) => ({
            id: win.id,
            userId: win.userId,
            listingId: win.listingId,
            winningBid: win.winningBid?.toString() || "0",
            wonAt: win.wonAt,
            createdAt: win.createdAt,
            listing: {
              id: win.listingId2,
              make: win.listingMake,
              model: win.listingModel,
              year: win.listingYear,
              lotNumber: win.listingLotNumber,
              photos: win.listingPhotos,
              startingPrice: win.listingStartingPrice,
              currentBid: win.listingCurrentBid,
              status: win.listingStatus,
              // Добавляем недостающие поля
              sellerId: 0,
              customMakeModel: null,
              bodyType: null,
              fuelType: null,
              transmission: null,
              mileage: null,
              color: null,
              vin: null,
              description: null,
              location: null,
              condition: null,
              reservePrice: null,
              auctionEndTime: null,
              endedAt: null,
              title: null,
              views: 0,
              inspectionReport: null,
              electricRange: null,
              batteryCapacity: null,
              chargingTime: null,
              updatedAt: null
            }
          }));
        } catch (error) {
          console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0432\u044B\u0438\u0433\u0440\u044B\u0448\u0435\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", error);
          return [];
        }
      }
      async createUserWin(win) {
        return {
          id: Date.now(),
          ...win,
          createdAt: /* @__PURE__ */ new Date()
        };
      }
      async getWinByListingId(listingId) {
        const [lastBid] = await db.select().from(bids).where(eq(bids.listingId, listingId)).orderBy(sql`amount DESC`).limit(1);
        if (!lastBid) return void 0;
        return {
          id: lastBid.id,
          userId: lastBid.bidderId,
          listingId,
          winningBid: lastBid.amount.toString(),
          createdAt: lastBid.createdAt || /* @__PURE__ */ new Date()
        };
      }
      async getAllWins() {
        try {
          const winsData = await db.select({
            // Данные выигрыша
            winId: sql`ROW_NUMBER() OVER (ORDER BY ${bids.amount} DESC)`,
            userId: bids.bidderId,
            listingId: bids.listingId,
            winningBid: bids.amount,
            wonAt: bids.createdAt,
            // Данные лота - используем только существующие поля
            listing: {
              id: carListings.id,
              lotNumber: carListings.lotNumber,
              make: carListings.make,
              model: carListings.model,
              year: carListings.year,
              startingPrice: carListings.startingPrice,
              currentBid: carListings.currentBid,
              photos: carListings.photos,
              status: carListings.status,
              auctionEndTime: carListings.auctionEndTime,
              createdAt: carListings.createdAt,
              sellerId: carListings.sellerId,
              customMakeModel: carListings.customMakeModel,
              bodyType: carListings.bodyType,
              fuelType: carListings.fuelType,
              transmission: carListings.transmission,
              mileage: carListings.mileage,
              color: carListings.color,
              vin: carListings.vin,
              description: carListings.description,
              location: carListings.location,
              condition: carListings.condition,
              electricRange: carListings.electricRange,
              batteryCapacity: carListings.batteryCapacity
            },
            // Данные победителя - используем только существующие поля
            winner: {
              id: users.id,
              email: users.email,
              phoneNumber: users.phoneNumber,
              fullName: users.fullName,
              username: users.username,
              isActive: users.isActive,
              role: users.role,
              createdAt: users.createdAt,
              invitedBy: users.invitedBy,
              isInvited: users.isInvited
            }
          }).from(bids).innerJoin(carListings, eq(bids.listingId, carListings.id)).innerJoin(users, eq(bids.bidderId, users.id)).where(
            and(
              sql`${carListings.status} IN ('ended', 'archived')`,
              sql`${bids.amount} = ${carListings.currentBid}`
              // Только победные ставки
            )
          ).orderBy(sql`${bids.createdAt} DESC`);
          return winsData.map((row) => ({
            id: row.winId,
            userId: row.userId,
            listingId: row.listingId,
            winningBid: row.winningBid.toString(),
            wonAt: row.wonAt || /* @__PURE__ */ new Date(),
            listing: {
              ...row.listing,
              // Добавляем недостающие поля с значениями по умолчанию
              reservePrice: null,
              endedAt: null,
              title: null,
              views: 0,
              inspectionReport: null,
              chargingTime: null,
              updatedAt: null
            },
            winner: {
              ...row.winner,
              // Добавляем недостающее поле
              uid: null
            }
          }));
        } catch (error) {
          console.error("Error getting all wins:", error);
          return [];
        }
      }
      // Sell Car Banner operations
      async getSellCarBanner() {
        const [banner] = await db.select().from(sellCarBanner).limit(1);
        return banner;
      }
      async createSellCarBanner(data) {
        const [created] = await db.insert(sellCarBanner).values(data).returning();
        return created;
      }
      async updateSellCarBanner(data) {
        const existing = await this.getSellCarBanner();
        if (existing) {
          const [updated] = await db.update(sellCarBanner).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sellCarBanner.id, existing.id)).returning();
          return updated;
        } else {
          const [created] = await db.insert(sellCarBanner).values(data).returning();
          return created;
        }
      }
      // Методы для архивных аукционов
      async archiveExpiredListings() {
        const expiredListings = await db.select().from(carListings).where(
          and(
            eq(carListings.status, "active"),
            lt(carListings.endTime, /* @__PURE__ */ new Date())
          )
        );
        for (const listing of expiredListings) {
          await db.update(carListings).set({ status: "expired" }).where(eq(carListings.id, listing.id));
        }
      }
      async getArchivedListings() {
        return await db.select().from(carListings).where(eq(carListings.status, "expired")).orderBy(desc(carListings.endTime));
      }
      async restartListing(listingId) {
        const [listing] = await db.select().from(carListings).where(eq(carListings.id, listingId));
        if (!listing) return void 0;
        const [restarted] = await db.update(carListings).set({
          status: "active",
          startTime: /* @__PURE__ */ new Date(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
          // 7 дней
          currentBid: listing.startingPrice
        }).where(eq(carListings.id, listingId)).returning();
        return restarted;
      }
      async deleteArchivedListing(listingId) {
        await db.delete(carListings).where(eq(carListings.id, listingId));
      }
    };
    storage2 = new DatabaseStorage();
  }
});

// server/imageDownloadService.ts
import sharp from "sharp";
import fetch2 from "node-fetch";
var ImageDownloadService;
var init_imageDownloadService = __esm({
  "server/imageDownloadService.ts"() {
    "use strict";
    ImageDownloadService = class {
      static MAX_FILE_SIZE = 500 * 1024;
      // 500KB maximum
      static TARGET_WIDTH = 800;
      // Target width for compression
      static JPEG_QUALITY = 80;
      // JPEG quality
      /**
       * Скачивает изображение по URL и сжимает его
       */
      static async downloadAndCompressImage(imageUrl) {
        try {
          console.log(`\u{1F4E5} \u0421\u043A\u0430\u0447\u0438\u0432\u0430\u0435\u043C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435: ${imageUrl}`);
          const response = await fetch2(imageUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          console.log(`\u{1F4CA} \u0418\u0441\u0445\u043E\u0434\u043D\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440: ${Math.round(buffer.length / 1024)}KB`);
          let mimeType = response.headers.get("content-type") || "image/jpeg";
          if (!mimeType.startsWith("image/")) {
            const urlLowercase = imageUrl.toLowerCase();
            if (urlLowercase.includes(".png")) {
              mimeType = "image/png";
            } else if (urlLowercase.includes(".webp")) {
              mimeType = "image/webp";
            } else {
              mimeType = "image/jpeg";
            }
          }
          let processedImage = sharp(buffer);
          const metadata = await processedImage.metadata();
          console.log(`\u{1F5BC}\uFE0F \u0420\u0430\u0437\u043C\u0435\u0440\u044B \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F: ${metadata.width}x${metadata.height}`);
          if (metadata.width && metadata.width > this.TARGET_WIDTH) {
            processedImage = processedImage.resize({
              width: this.TARGET_WIDTH,
              height: void 0,
              withoutEnlargement: true,
              fit: "inside"
            });
            console.log(`\u{1F4D0} \u0418\u0437\u043C\u0435\u043D\u044F\u0435\u043C \u0440\u0430\u0437\u043C\u0435\u0440 \u0434\u043E \u0448\u0438\u0440\u0438\u043D\u044B ${this.TARGET_WIDTH}px`);
          }
          let compressedBuffer;
          let finalMimeType;
          if (mimeType === "image/png") {
            compressedBuffer = await processedImage.png({
              quality: this.JPEG_QUALITY,
              compressionLevel: 9,
              adaptiveFiltering: true,
              force: false
            }).toBuffer();
            finalMimeType = "image/png";
          } else {
            compressedBuffer = await processedImage.jpeg({
              quality: this.JPEG_QUALITY,
              progressive: true,
              mozjpeg: true
            }).toBuffer();
            finalMimeType = "image/jpeg";
          }
          console.log(`\u{1F5DC}\uFE0F \u0421\u0436\u0430\u0442\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440: ${Math.round(compressedBuffer.length / 1024)}KB`);
          if (compressedBuffer.length > this.MAX_FILE_SIZE) {
            console.log(`\u26A0\uFE0F \u0420\u0430\u0437\u043C\u0435\u0440 \u043F\u0440\u0435\u0432\u044B\u0448\u0430\u0435\u0442 \u043B\u0438\u043C\u0438\u0442, \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0441\u0436\u0430\u0442\u0438\u0435...`);
            let quality = this.JPEG_QUALITY - 20;
            while (compressedBuffer.length > this.MAX_FILE_SIZE && quality > 20) {
              compressedBuffer = await sharp(buffer).resize({
                width: this.TARGET_WIDTH * 0.8,
                // Дополнительно уменьшаем размер
                height: void 0,
                withoutEnlargement: true,
                fit: "inside"
              }).jpeg({
                quality,
                progressive: true,
                mozjpeg: true
              }).toBuffer();
              quality -= 10;
              console.log(`\u{1F504} \u041F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0435 \u0441\u0436\u0430\u0442\u0438\u0435 \u0441 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E\u043C ${quality}%: ${Math.round(compressedBuffer.length / 1024)}KB`);
            }
            finalMimeType = "image/jpeg";
          }
          const base64Data = compressedBuffer.toString("base64");
          console.log(`\u2705 \u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E: ${Math.round(compressedBuffer.length / 1024)}KB, ${finalMimeType}`);
          return {
            data: base64Data,
            type: finalMimeType,
            size: compressedBuffer.length
          };
        } catch (error) {
          console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F ${imageUrl}:`, error);
          throw new Error(`\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435: ${error.message}`);
        }
      }
      /**
       * Конвертирует base64 данные обратно в Buffer для использования
       */
      static base64ToBuffer(base64Data) {
        return Buffer.from(base64Data, "base64");
      }
      /**
       * Создает data URL из base64 данных и MIME типа
       */
      static createDataUrl(base64Data, mimeType) {
        return `data:${mimeType};base64,${base64Data}`;
      }
      /**
       * Проверяет, является ли URL внешним изображением
       */
      static isExternalImageUrl(url) {
        if (!url) return false;
        return url.startsWith("http://") || url.startsWith("https://");
      }
      /**
       * Проверяет, является ли строка base64 данными
       */
      static isBase64Data(data) {
        if (!data) return false;
        if (data.startsWith("data:image/")) {
          return true;
        }
        try {
          return Buffer.from(data, "base64").toString("base64") === data;
        } catch {
          return false;
        }
      }
    };
  }
});

// server/fileStorage.ts
import fs from "fs/promises";
import path from "path";
var FileStorageManager, fileStorage;
var init_fileStorage = __esm({
  "server/fileStorage.ts"() {
    "use strict";
    FileStorageManager = class {
      uploadDir = "uploads";
      listingsDir = path.join(this.uploadDir, "listings");
      constructor() {
        this.ensureDirectories();
      }
      async ensureDirectories() {
        try {
          await fs.mkdir(this.uploadDir, { recursive: true });
          await fs.mkdir(this.listingsDir, { recursive: true });
        } catch (error) {
          console.error("Error creating directories:", error);
        }
      }
      // Оптимизированная структура папок для 10,000+ автомобилей
      // Используем подпапки для распределения нагрузки
      getListingPath(listingId) {
        const bucket = Math.floor(listingId / 1e3) * 1e3;
        return path.join(this.listingsDir, bucket.toString(), listingId.toString());
      }
      // Сохранение изображения с оптимизацией
      async saveListingPhoto(listingId, photoIndex, imageData) {
        try {
          const listingPath = this.getListingPath(listingId);
          await fs.mkdir(listingPath, { recursive: true });
          let imageBuffer;
          if (Buffer.isBuffer(imageData)) {
            imageBuffer = imageData;
          } else {
            const base64String = typeof imageData === "string" ? imageData : String(imageData);
            const cleanBase64 = base64String.replace(/^data:image\/[a-z]+;base64,/, "");
            imageBuffer = Buffer.from(cleanBase64, "base64");
          }
          const filename = `${photoIndex}.jpg`;
          const filepath = path.join(listingPath, filename);
          await fs.writeFile(filepath, imageBuffer);
          console.log(`\u{1F4C1} \u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E \u0444\u043E\u0442\u043E ${filename} \u0434\u043B\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listingId} (${(imageBuffer.length / 1024).toFixed(1)}KB)`);
          return filename;
        } catch (error) {
          console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0444\u043E\u0442\u043E \u0434\u043B\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listingId}:`, error);
          throw error;
        }
      }
      // Получение изображения
      async getListingPhoto(listingId, filename) {
        try {
          const listingPath = this.getListingPath(listingId);
          const filepath = path.join(listingPath, filename);
          const buffer = await fs.readFile(filepath);
          return buffer;
        } catch (error) {
          console.error(`\u274C \u0424\u043E\u0442\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E: ${listingId}/${filename}`);
          return null;
        }
      }
      // Проверка существования фото
      async photoExists(listingId, filename) {
        try {
          const listingPath = this.getListingPath(listingId);
          const filepath = path.join(listingPath, filename);
          await fs.access(filepath);
          return true;
        } catch {
          return false;
        }
      }
      // Удаление всех фото объявления
      async deleteListingPhotos(listingId) {
        try {
          const listingPath = this.getListingPath(listingId);
          await fs.rm(listingPath, { recursive: true, force: true });
          console.log(`\u{1F5D1}\uFE0F \u0423\u0434\u0430\u043B\u0435\u043D\u044B \u0432\u0441\u0435 \u0444\u043E\u0442\u043E \u0434\u043B\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listingId}`);
        } catch (error) {
          console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0444\u043E\u0442\u043E \u0434\u043B\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listingId}:`, error);
        }
      }
      // Получение списка всех фото объявления
      async getListingPhotoList(listingId) {
        try {
          const listingPath = this.getListingPath(listingId);
          const files = await fs.readdir(listingPath);
          return files.filter((file) => file.endsWith(".jpg")).sort((a, b) => {
            const numA = parseInt(a.split(".")[0]);
            const numB = parseInt(b.split(".")[0]);
            return numA - numB;
          });
        } catch {
          return [];
        }
      }
      // Статистика использования диска
      async getStorageStats() {
        try {
          const stats = await this.calculateDirectorySize(this.listingsDir);
          return {
            totalSizeBytes: stats.totalSize,
            totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
            totalFiles: stats.fileCount,
            averageFileSizeKB: stats.fileCount > 0 ? (stats.totalSize / 1024 / stats.fileCount).toFixed(1) : 0
          };
        } catch (error) {
          console.error("Error calculating storage stats:", error);
          return { totalSizeBytes: 0, totalSizeMB: 0, totalFiles: 0, averageFileSizeKB: 0 };
        }
      }
      async calculateDirectorySize(dirPath) {
        let totalSize = 0;
        let fileCount = 0;
        try {
          const items = await fs.readdir(dirPath);
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = await fs.stat(itemPath);
            if (stat.isDirectory()) {
              const subStats = await this.calculateDirectorySize(itemPath);
              totalSize += subStats.totalSize;
              fileCount += subStats.fileCount;
            } else {
              totalSize += stat.size;
              fileCount++;
            }
          }
        } catch (error) {
        }
        return { totalSize, fileCount };
      }
    };
    fileStorage = new FileStorageManager();
  }
});

// server/websocket.ts
import { WebSocketServer, WebSocket } from "ws";
var AuctionWebSocketManager, websocket_default;
var init_websocket = __esm({
  "server/websocket.ts"() {
    "use strict";
    AuctionWebSocketManager = class {
      wss;
      rooms = /* @__PURE__ */ new Map();
      clients = /* @__PURE__ */ new Set();
      heartbeatInterval;
      constructor(server) {
        this.wss = new WebSocketServer({
          server,
          path: "/ws",
          clientTracking: false
        });
        this.wss.on("connection", this.handleConnection.bind(this));
        this.heartbeatInterval = setInterval(() => {
          this.cleanup();
        }, 3e4);
        console.log("\u{1F50C} WebSocket \u0441\u0435\u0440\u0432\u0435\u0440 \u0437\u0430\u043F\u0443\u0449\u0435\u043D \u0434\u043B\u044F real-time \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u043E\u0432");
      }
      handleConnection(ws2, request) {
        const client = {
          ws: ws2,
          lastPing: Date.now()
        };
        this.clients.add(client);
        ws2.on("message", (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(client, message);
          } catch (error) {
            console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0430\u0440\u0441\u0438\u043D\u0433\u0430 WebSocket \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F:", error);
          }
        });
        ws2.on("close", () => {
          this.removeClient(client);
        });
        ws2.on("error", (error) => {
          console.error("WebSocket \u043E\u0448\u0438\u0431\u043A\u0430:", error);
          this.removeClient(client);
        });
        this.sendMessage(client, {
          type: "connected",
          message: "WebSocket \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D \u0434\u043B\u044F real-time \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0439"
        });
      }
      handleMessage(client, message) {
        console.log("\u{1F4E8} WebSocket \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430:", message);
        switch (message.type) {
          case "join_auction":
            console.log(`\u{1F3AF} \u041A\u043B\u0438\u0435\u043D\u0442 \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u044F\u0435\u0442\u0441\u044F \u043A \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0443 ${message.listingId}, \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${message.userId || "\u043D\u0435 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D"}`);
            this.joinAuction(client, message.listingId, message.userId);
            break;
          case "leave_auction":
            console.log("\u{1F6AA} \u041A\u043B\u0438\u0435\u043D\u0442 \u043F\u043E\u043A\u0438\u0434\u0430\u0435\u0442 \u0430\u0443\u043A\u0446\u0438\u043E\u043D");
            this.leaveAuction(client);
            break;
          case "ping":
            client.lastPing = Date.now();
            this.sendMessage(client, { type: "pong" });
            break;
          case "identify_user":
            if (message.userId) {
              client.userId = message.userId;
              console.log(`\u{1F464} \u041A\u043B\u0438\u0435\u043D\u0442 \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D \u043A\u0430\u043A \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${message.userId}`);
              this.sendMessage(client, {
                type: "user_identified",
                userId: message.userId,
                message: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D \u0434\u043B\u044F \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439"
              });
            }
            break;
          case "place_bid":
            if (message.listingId && message.amount && message.bidderId) {
              console.log(`\u{1F3AF} \u041D\u041E\u0412\u0410\u042F \u0421\u0422\u0410\u0412\u041A\u0410 \u0447\u0435\u0440\u0435\u0437 WebSocket: \u0410\u0443\u043A\u0446\u0438\u043E\u043D ${message.listingId}, \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${message.bidderId}, \u0441\u0443\u043C\u043C\u0430 ${message.amount}`);
              this.handleBidPlacement(message.listingId, message.bidderId, message.amount, client);
            }
            break;
          case "bid_placement":
            if (message.listingId && message.amount && message.bidderId) {
              console.log(`\u{1F4B0} \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u0440\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u0438\u0438 \u0441\u0442\u0430\u0432\u043A\u0438: \u0410\u0443\u043A\u0446\u0438\u043E\u043D ${message.listingId}, \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${message.bidderId}, \u0441\u0443\u043C\u043C\u0430 ${message.amount}`);
              this.handleBidPlacement(message.listingId, message.bidderId, message.amount, client);
            }
            break;
          case "new_message":
            if (message.recipientId && message.messageData) {
              console.log(`\u{1F4AC} WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u043D\u043E\u0432\u043E\u043C \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0438 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${message.recipientId}`);
              this.notifyNewMessage(message.recipientId, message.messageData);
            }
            break;
        }
      }
      joinAuction(client, listingId, userId) {
        this.leaveAuction(client);
        client.listingId = listingId;
        client.userId = userId;
        if (!this.rooms.has(listingId)) {
          this.rooms.set(listingId, {
            listingId,
            clients: /* @__PURE__ */ new Set(),
            lastUpdate: Date.now(),
            isHotAuction: false
          });
        }
        const room = this.rooms.get(listingId);
        room.clients.add(client);
        console.log(`\u{1F465} \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${userId || "\u0433\u043E\u0441\u0442\u044C"} \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u043B\u0441\u044F \u043A \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0443 ${listingId} (${room.clients.size} \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445)`);
        this.sendMessage(client, {
          type: "joined_auction",
          listingId,
          participantCount: room.clients.size
        });
      }
      leaveAuction(client) {
        if (client.listingId) {
          const room = this.rooms.get(client.listingId);
          if (room) {
            room.clients.delete(client);
            if (room.clients.size === 0) {
              this.rooms.delete(client.listingId);
            }
          }
          client.listingId = void 0;
          client.userId = void 0;
        }
      }
      removeClient(client) {
        this.leaveAuction(client);
        this.clients.delete(client);
      }
      sendMessage(client, message) {
        if (client.ws.readyState === WebSocket.OPEN) {
          try {
            client.ws.send(JSON.stringify(message));
          } catch (error) {
            console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 WebSocket \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F:", error);
            this.removeClient(client);
          }
        }
      }
      cleanup() {
        const now = Date.now();
        const deadClients = [];
        this.clients.forEach((client) => {
          if (now - client.lastPing > 6e4 || client.ws.readyState !== WebSocket.OPEN) {
            deadClients.push(client);
          }
        });
        deadClients.forEach((client) => this.removeClient(client));
        if (deadClients.length > 0) {
          console.log(`\u{1F9F9} \u041E\u0447\u0438\u0449\u0435\u043D\u043E ${deadClients.length} \u043D\u0435\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 WebSocket \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0439`);
        }
      }
      // Публичные методы для отправки обновлений
      broadcastBidUpdate(listingId, bidData) {
        const room = this.rooms.get(listingId);
        console.log(`\u{1F4E1} broadcastBidUpdate: \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listingId}, \u043A\u043E\u043C\u043D\u0430\u0442\u0430 \u043D\u0430\u0439\u0434\u0435\u043D\u0430: ${!!room}`);
        if (!room) {
          console.log(`\u274C \u041A\u043E\u043C\u043D\u0430\u0442\u0430 \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430! \u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043A\u043E\u043C\u043D\u0430\u0442\u044B: ${Array.from(this.rooms.keys())}`);
          return;
        }
        console.log(`\u{1F465} \u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C bid_update \u0432 \u043A\u043E\u043C\u043D\u0430\u0442\u0443 ${listingId} \u0434\u043B\u044F ${room.clients.size} \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432`);
        const message = {
          type: "bid_update",
          listingId,
          data: bidData,
          timestamp: Date.now()
        };
        this.broadcastToRoom(room, message);
        room.lastUpdate = Date.now();
        console.log(`\u2705 bid_update \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId}`);
      }
      broadcastAuctionEnd(listingId, finalData) {
        const room = this.rooms.get(listingId);
        if (!room) return;
        const message = {
          type: "auction_ended",
          listingId,
          data: finalData,
          timestamp: Date.now()
        };
        this.broadcastToRoom(room, message);
      }
      sendNotificationToUser(userId, notification) {
        let notificationSent = false;
        let activeClients = 0;
        let totalClients = 0;
        console.log(`\u{1F50D} \u041F\u043E\u0438\u0441\u043A \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}:`);
        this.clients.forEach((client) => {
          totalClients++;
          if (client.userId === userId) {
            console.log(`  \u2022 \u041D\u0430\u0439\u0434\u0435\u043D \u043A\u043B\u0438\u0435\u043D\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}, \u0441\u0442\u0430\u0442\u0443\u0441 WebSocket: ${client.ws.readyState === WebSocket.OPEN ? "OPEN" : "CLOSED"}`);
            if (client.ws.readyState === WebSocket.OPEN) {
              activeClients++;
              this.sendMessage(client, {
                type: "notification",
                data: notification,
                timestamp: Date.now()
              });
              notificationSent = true;
              console.log(`  \u2705 \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${userId}`);
            }
          }
        });
        console.log(`\u{1F4CA} \u0421\u0442\u0430\u0442\u0443\u0441 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}: \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 ${activeClients}, \u0432\u0441\u0435\u0433\u043E \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 WebSocket: ${totalClients}`);
        if (!notificationSent) {
          console.log(`\u26A0\uFE0F \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${userId} \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D \u043A WebSocket, \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043D\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E`);
        }
      }
      notifyNewMessage(recipientId, messageData) {
        console.log(`\u{1F4AC} \u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043E \u043D\u043E\u0432\u043E\u043C \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${recipientId}`);
        let notificationSent = false;
        this.clients.forEach((client) => {
          if (client.userId === recipientId && client.ws.readyState === WebSocket.OPEN) {
            this.sendMessage(client, {
              type: "new_message",
              data: messageData,
              timestamp: Date.now()
            });
            notificationSent = true;
            console.log(`\u2705 \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u043D\u043E\u0432\u043E\u043C \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${recipientId}`);
          }
        });
        if (!notificationSent) {
          console.log(`\u26A0\uFE0F \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${recipientId} \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D, \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0438 \u043D\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E`);
        }
        return notificationSent;
      }
      setHotAuction(listingId, isHot) {
        const room = this.rooms.get(listingId);
        if (room) {
          room.isHotAuction = isHot;
          this.broadcastToRoom(room, {
            type: "hot_auction_mode",
            listingId,
            isHot,
            message: isHot ? "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u043C\u0438\u043D\u0443\u0442\u0430! \u0421\u0442\u0430\u0432\u043A\u0438 \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438" : "\u041E\u0431\u044B\u0447\u043D\u044B\u0439 \u0440\u0435\u0436\u0438\u043C \u0441\u0442\u0430\u0432\u043E\u043A"
          });
          console.log(`\u{1F525} \u0410\u0443\u043A\u0446\u0438\u043E\u043D ${listingId} \u043F\u0435\u0440\u0435\u0432\u0435\u0434\u0435\u043D \u0432 ${isHot ? "\u0433\u043E\u0440\u044F\u0447\u0438\u0439" : "\u043E\u0431\u044B\u0447\u043D\u044B\u0439"} \u0440\u0435\u0436\u0438\u043C`);
        }
      }
      // Отправка обновления списка аукционов всем подключенным клиентам
      broadcastListingsUpdate(listingId, listingData) {
        console.log(`\u{1F4CB} \u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u043F\u0438\u0441\u043A\u0430 \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId} \u0432\u0441\u0435\u043C \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044B\u043C \u043A\u043B\u0438\u0435\u043D\u0442\u0430\u043C`);
        const message = {
          type: "listing_update",
          listingId,
          data: listingData,
          timestamp: Date.now()
        };
        let sentCount = 0;
        this.clients.forEach((client) => {
          if (client.ws.readyState === WebSocket.OPEN) {
            this.sendMessage(client, message);
            sentCount++;
          }
        });
        console.log(`\u2705 \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0441\u043F\u0438\u0441\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E ${sentCount} \u043A\u043B\u0438\u0435\u043D\u0442\u0430\u043C \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId}`);
      }
      broadcastToRoom(room, message) {
        const deadClients = [];
        room.clients.forEach((client) => {
          if (client.ws.readyState === WebSocket.OPEN) {
            this.sendMessage(client, message);
          } else {
            deadClients.push(client);
          }
        });
        deadClients.forEach((client) => room.clients.delete(client));
      }
      // НОВЫЙ МЕТОД: Обработка ставок через WebSocket с уведомлениями
      async handleBidPlacement(listingId, bidderId, amount, client) {
        try {
          console.log(`\u{1F4B0} \u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 WebSocket \u0441\u0442\u0430\u0432\u043A\u0438: \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listingId}, \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${bidderId}, \u0441\u0443\u043C\u043C\u0430 ${amount}`);
          const { storage: storage3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
          const allBids = await storage3.getBidsForListing(listingId);
          const uniqueBidders = /* @__PURE__ */ new Set();
          allBids.forEach((bid) => {
            if (bid.bidderId !== bidderId) {
              uniqueBidders.add(bid.bidderId);
            }
          });
          console.log(`\u{1F4E2} \u041D\u0430\u0439\u0434\u0435\u043D\u043E ${uniqueBidders.size} \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432 \u0434\u043B\u044F \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043E \u043F\u0435\u0440\u0435\u0431\u0438\u0442\u0438\u0438 \u0441\u0442\u0430\u0432\u043A\u0438`);
          console.log(`\u{1F465} \u0423\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u0438:`, Array.from(uniqueBidders));
          const listing = await storage3.getListing(listingId);
          if (!listing) {
            console.error(`\u274C \u0410\u0443\u043A\u0446\u0438\u043E\u043D ${listingId} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D`);
            return;
          }
          for (const participantId of uniqueBidders) {
            const carTitle = `${listing.make} ${listing.model} ${listing.year}`;
            const formattedAmount = parseInt(amount).toLocaleString("ru-RU");
            const notification = {
              type: "bid_outbid",
              listingId,
              listingTitle: carTitle,
              newAmount: amount,
              message: `\u{1F514} \u0412\u0430\u0448\u0430 \u0441\u0442\u0430\u0432\u043A\u0430 \u043F\u0435\u0440\u0435\u0431\u0438\u0442\u0430 ${carTitle} \u0421\u0434\u0435\u043B\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u0443\u044E \u0441\u0442\u0430\u0432\u043A\u0443 \u0432\u044B\u0448\u0435 ${formattedAmount} \u0441\u043E\u043C\u043E\u043D\u0438!`
            };
            this.sendNotificationToUserAdvanced(participantId, notification);
            console.log(`\u{1F515} WebSocket \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E - \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C \u0442\u043E\u043B\u044C\u043A\u043E HTTP API`);
          }
          this.sendMessage(client, {
            type: "bid_processed",
            success: true,
            message: `\u0421\u0442\u0430\u0432\u043A\u0430 ${amount} \u0421\u043E\u043C\u043E\u043D\u0438 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u0430, \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u043E ${uniqueBidders.size} \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432`
          });
        } catch (error) {
          console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 WebSocket \u0441\u0442\u0430\u0432\u043A\u0438:", error);
          this.sendMessage(client, {
            type: "bid_processed",
            success: false,
            message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u0441\u0442\u0430\u0432\u043A\u0438"
          });
        }
      }
      // Отправка уведомления конкретному пользователю (улучшенная версия)
      sendNotificationToUserAdvanced(userId, notification) {
        let sentCount = 0;
        this.clients.forEach((client) => {
          if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
            this.sendMessage(client, notification);
            sentCount++;
          }
        });
        console.log(`\u{1F4EC} \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${userId} \u043D\u0430 ${sentCount} \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432`);
      }
      getStats() {
        return {
          totalClients: this.clients.size,
          activeRooms: this.rooms.size,
          hotAuctions: Array.from(this.rooms.values()).filter((room) => room.isHotAuction).length
        };
      }
      shutdown() {
        clearInterval(this.heartbeatInterval);
        this.wss.close();
        console.log("\u{1F50C} WebSocket \u0441\u0435\u0440\u0432\u0435\u0440 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D");
      }
    };
    websocket_default = AuctionWebSocketManager;
  }
});

// server/deploymentSafeInit.ts
async function getDatabaseStatus() {
  try {
    const { storage: storage3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const listings = await storage3.getListingsByStatus("active", 10);
    return {
      connected: true,
      listingsCount: listings.length,
      message: "\u0411\u0430\u0437\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u0438 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442"
    };
  } catch (error) {
    return {
      connected: false,
      listingsCount: 0,
      message: "\u0411\u0430\u0437\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0444\u0430\u0439\u043B\u043E\u0432\u043E\u0435 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435"
    };
  }
}
var init_deploymentSafeInit = __esm({
  "server/deploymentSafeInit.ts"() {
    "use strict";
  }
});

// server/utils/lotNumberGenerator.ts
var lotNumberGenerator_exports = {};
__export(lotNumberGenerator_exports, {
  generateRandomLotNumber: () => generateRandomLotNumber,
  generateUniqueLotNumber: () => generateUniqueLotNumber
});
function generateRandomLotNumber() {
  const min = 1e5;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
}
function generateUniqueLotNumber(existingNumbers) {
  let lotNumber;
  let attempts = 0;
  const maxAttempts = 100;
  do {
    lotNumber = generateRandomLotNumber();
    attempts++;
    if (attempts > maxAttempts) {
      const timestamp2 = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
      lotNumber = timestamp2.slice(0, 4) + random;
      break;
    }
  } while (existingNumbers.includes(lotNumber));
  return lotNumber;
}
var init_lotNumberGenerator = __esm({
  "server/utils/lotNumberGenerator.ts"() {
    "use strict";
  }
});

// server/routes.ts
var routes_exports = {};
__export(routes_exports, {
  registerRoutes: () => registerRoutes
});
import { createServer } from "http";
import fs2 from "fs";
import path2 from "path";
import express from "express";
import { eq as eq2 } from "drizzle-orm";
import sharp2 from "sharp";
import { z as z2 } from "zod";
import multer from "multer";
async function migratePhotosToFileSystem() {
  try {
    console.log("\u{1F504} \u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u043C\u0438\u0433\u0440\u0430\u0446\u0438\u044E \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0432 \u0444\u0430\u0439\u043B\u043E\u0432\u0443\u044E \u0441\u0438\u0441\u0442\u0435\u043C\u0443...");
    const allListings = await db.select().from(carListings);
    let migratedCount = 0;
    let skippedCount = 0;
    for (const listing of allListings) {
      if (!listing.photos || !Array.isArray(listing.photos) || listing.photos.length === 0) {
        continue;
      }
      const hasBase64Photos = listing.photos.some(
        (photo) => typeof photo === "string" && photo.startsWith("data:image/")
      );
      if (!hasBase64Photos) {
        console.log(`\u23ED\uFE0F \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listing.id} \u0443\u0436\u0435 \u043C\u0438\u0433\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0438\u043B\u0438 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u0438\u043C\u0435\u043D\u0430 \u0444\u0430\u0439\u043B\u043E\u0432`);
        skippedCount++;
        continue;
      }
      console.log(`\u{1F4F8} \u041C\u0438\u0433\u0440\u0438\u0440\u0443\u0435\u043C ${listing.photos.length} \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0434\u043B\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listing.id}`);
      const fileNames = [];
      for (let i = 0; i < listing.photos.length; i++) {
        const photoData = listing.photos[i];
        if (typeof photoData === "string" && photoData.startsWith("data:image/")) {
          const matches = photoData.match(/data:image\/([^;]+);base64,(.+)/);
          if (matches) {
            const base64Data = matches[2];
            const photoBuffer = Buffer.from(base64Data, "base64");
            const compressedBuffer = await sharp2(photoBuffer).jpeg({
              quality: 85,
              progressive: true,
              mozjpeg: true
            }).resize(1200, 900, {
              fit: "inside",
              withoutEnlargement: true
            }).toBuffer();
            const fileName = `${i + 1}.jpg`;
            await fileStorage2.saveListingPhoto(listing.id, fileName, compressedBuffer);
            fileNames.push(fileName);
            console.log(`\u2705 \u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E ${fileName} \u0434\u043B\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listing.id} (${(compressedBuffer.length / 1024).toFixed(1)}KB)`);
          }
        }
      }
      if (fileNames.length > 0) {
        await db.update(carListings).set({ photos: fileNames }).where(eq2(carListings.id, listing.id));
        migratedCount++;
        console.log(`\u{1F3AF} \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listing.id} \u043C\u0438\u0433\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E: ${fileNames.length} \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439`);
      }
    }
    console.log(`\u2705 \u041C\u0438\u0433\u0440\u0430\u0446\u0438\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430! \u041C\u0438\u0433\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E: ${migratedCount}, \u041F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043E: ${skippedCount}`);
    return { migrated: migratedCount, skipped: skippedCount };
  } catch (error) {
    console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043C\u0438\u0433\u0440\u0430\u0446\u0438\u0438:", error);
    throw error;
  }
}
function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
function setCache(key, data) {
  if (typeof key !== "string" || key.length > 100 || /[<>'"&]/.test(key)) {
    console.warn("\u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D \u043D\u0435\u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 \u043A\u044D\u0448\u0430");
    return;
  }
  cache.set(key, { data, timestamp: Date.now() });
  const safeKey = key.replace(/[<>'"&]/g, "");
  console.log(`\u{1F4BE} \u041A\u044D\u0448 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D \u0434\u043B\u044F \u043A\u043B\u044E\u0447\u0430: ${safeKey}`);
}
function clearCachePattern(pattern) {
  if (typeof pattern !== "string" || pattern.length > 50 || /[<>'"&]/.test(pattern)) {
    console.warn("\u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D \u043D\u0435\u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u044B\u0439 \u043F\u0430\u0442\u0442\u0435\u0440\u043D \u043E\u0447\u0438\u0441\u0442\u043A\u0438 \u043A\u044D\u0448\u0430");
    return;
  }
  const keys = Array.from(cache.keys());
  const safePattern = pattern.replace(/[<>'"&]/g, "");
  console.log(`\u{1F5D1}\uFE0F \u041E\u0447\u0438\u0441\u0442\u043A\u0430 \u043A\u044D\u0448\u0430 \u043F\u043E \u043F\u0430\u0442\u0442\u0435\u0440\u043D\u0443 "${safePattern}". \u041D\u0430\u0439\u0434\u0435\u043D\u043E \u043A\u043B\u044E\u0447\u0435\u0439: ${keys.length}`);
  let deletedCount = 0;
  keys.forEach((key) => {
    if (typeof key === "string" && key.includes(pattern)) {
      cache.delete(key);
      deletedCount++;
    }
  });
  console.log(`\u2705 \u041E\u0447\u0438\u0449\u0435\u043D\u043E ${deletedCount} \u043A\u043B\u044E\u0447\u0435\u0439 \u043A\u044D\u0448\u0430`);
}
async function registerRoutes(app2) {
  const assetsPath = path2.join(process.cwd(), "dist", "public", "assets");
  console.log(`\u{1F527} ROUTES: \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 /assets \u0434\u043B\u044F \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0438: ${assetsPath}`);
  if (fs2.existsSync(assetsPath)) {
    app2.use("/assets", (req, res, next) => {
      console.log(`\u{1F3AF} ASSETS REQUEST: ${req.method} ${req.url} - \u0438\u0449\u0435\u043C \u0444\u0430\u0439\u043B \u0432 ${assetsPath}`);
      next();
    });
    app2.use("/assets", express.static(assetsPath, {
      setHeaders: (res, filePath) => {
        console.log(`\u{1F4C1} STATIC FILE FOUND: ${filePath}`);
        if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript");
          console.log(`\u{1F3AF} Set JavaScript MIME type for: ${filePath}`);
        } else if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css");
          console.log(`\u{1F3AF} Set CSS MIME type for: ${filePath}`);
        }
      }
    }));
    console.log(`\u2705 ROUTES: \u0421\u0442\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0444\u0430\u0439\u043B\u044B /assets \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u044B`);
  } else {
    console.log(`\u274C ROUTES: Assets \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u044F \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430: ${assetsPath}`);
  }
  app2.use(getUserFromContext);
  app2.use((req, res, next) => {
    if (req.method === "POST") {
      console.log(`\u{1F50D} POST \u0437\u0430\u043F\u0440\u043E\u0441: ${req.path}`);
      console.log(`\u{1F4E6} Body:`, req.body);
      if (req.path.includes("/bids")) {
        console.log(`\u{1F6A8} \u041A\u0420\u0418\u0422\u0418\u0427\u041D\u041E: \u042D\u0442\u043E \u0437\u0430\u043F\u0440\u043E\u0441 \u0441\u0442\u0430\u0432\u043A\u0438! \u041F\u0443\u0442\u044C: ${req.path}`);
      }
    }
    next();
  });
  let cachedListings = [];
  let bidCountsCache = /* @__PURE__ */ new Map();
  let lastCacheUpdate = Date.now();
  const updateListingsCache = async () => {
    try {
      const activeListings = await storage2.getListingsByStatus("active", 15);
      const recentWonListings = await storage2.getRecentWonListings(24);
      const wonListingsWithWinners = await Promise.all(
        recentWonListings.map(async (listing) => {
          const winnerInfo = await storage2.getWonListingWinnerInfo(listing.id);
          return {
            ...listing,
            winnerInfo
          };
        })
      );
      const listings = [...activeListings, ...wonListingsWithWinners];
      bidCountsCache.clear();
      for (const listing of listings) {
        const bidCount = await storage2.getBidCountForListing(listing.id);
        bidCountsCache.set(listing.id, bidCount);
      }
      const fastListings = listings.map((listing) => ({
        id: listing.id,
        lotNumber: listing.lotNumber,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        mileage: listing.mileage,
        currentBid: listing.currentBid,
        startingPrice: listing.startingPrice,
        status: listing.status,
        auctionEndTime: listing.auctionEndTime,
        auctionStartTime: listing.auctionStartTime,
        customsCleared: listing.customsCleared,
        recycled: listing.recycled,
        technicalInspectionValid: listing.technicalInspectionValid,
        technicalInspectionDate: listing.technicalInspectionDate,
        tinted: listing.tinted,
        tintingDate: listing.tintingDate,
        engine: listing.engine,
        transmission: listing.transmission,
        fuelType: listing.fuelType,
        color: listing.color,
        condition: listing.condition,
        location: listing.location,
        batteryCapacity: listing.batteryCapacity,
        electricRange: listing.electricRange,
        bidCount: bidCountsCache.get(listing.id) || 0,
        photos: listing.photos || []
        // Добавляем фотографии в кэш для отображения
      }));
      cachedListings = fastListings;
      lastCacheUpdate = Date.now();
    } catch (error) {
      console.error("Cache update failed:", error);
    }
  };
  await updateListingsCache();
  setInterval(updateListingsCache, 2e3);
  setTimeout(() => {
    console.log("\u{1F504} \u041F\u0440\u0438\u043D\u0443\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043A\u044D\u0448\u0430 \u0434\u043B\u044F \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043C\u043E\u0431\u0438\u043B\u0435\u0439");
    updateListingsCache();
  }, 5e3);
  function clearAllCaches() {
    cachedListings = [];
    bidCountsCache.clear();
    sellerListingsCache.clear();
    lastCacheUpdate = Date.now();
    updateListingsCache();
    console.log("\u{1F9F9} \u041F\u0420\u0418\u041D\u0423\u0414\u0418\u0422\u0415\u041B\u042C\u041D\u041E \u041E\u0427\u0418\u0429\u0415\u041D \u0412\u0415\u0421\u042C \u041A\u042D\u0428\u0410 \u041F\u041E\u0421\u041B\u0415 \u041D\u041E\u0412\u041E\u0419 \u0421\u0422\u0410\u0412\u041A\u0418");
  }
  app2.get("/api/test", (req, res) => {
    res.json({ test: "fast", time: Date.now() });
  });
  app2.post("/api/test-auction-notification", async (req, res) => {
    try {
      const { userId, listingId, type } = req.body;
      const user = await storage2.getUserById(userId);
      const listing = await storage2.getListing(listingId);
      if (!user || !listing) {
        return res.status(404).json({ error: "User or listing not found" });
      }
      let title, message, smsMessage;
      if (type === "win") {
        title = "\u{1F3C6} \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C! \u0412\u044B \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D!";
        message = `\u0412\u044B \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 ${listing.make} ${listing.model} ${listing.year} \u0433. \u0441\u043E \u0441\u0442\u0430\u0432\u043A\u043E\u0439 300000 \u0421\u043E\u043C\u043E\u043D\u0438 (\u043B\u043E\u0442 #${listing.lotNumber})`;
        smsMessage = `\u{1F3C6} \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C! \u0412\u044B \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listing.make} ${listing.model} ${listing.year} \u0433. \u0441\u043E \u0441\u0442\u0430\u0432\u043A\u043E\u0439 300000 \u0421\u043E\u043C\u043E\u043D\u0438 (\u043B\u043E\u0442 #${listing.lotNumber}). AutoBid.TJ`;
      } else {
        title = "\u0410\u0443\u043A\u0446\u0438\u043E\u043D \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D";
        message = `\u041A \u0441\u043E\u0436\u0430\u043B\u0435\u043D\u0438\u044E, \u0432\u044B \u043D\u0435 \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listing.make} ${listing.model} ${listing.year} \u0433. (\u043B\u043E\u0442 #${listing.lotNumber}). \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0432 \u0434\u0440\u0443\u0433\u0438\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430\u0445!`;
        smsMessage = `\u0410\u0443\u043A\u0446\u0438\u043E\u043D \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D. \u041A \u0441\u043E\u0436\u0430\u043B\u0435\u043D\u0438\u044E, \u0432\u044B \u043D\u0435 \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listing.make} ${listing.model} ${listing.year} \u0433. (\u043B\u043E\u0442 #${listing.lotNumber}). \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0432 \u0434\u0440\u0443\u0433\u0438\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430\u0445! AutoBid.TJ`;
      }
      const notification = await storage2.createNotification({
        userId,
        title,
        message,
        type: type === "win" ? "auction_won" : "auction_lost",
        listingId,
        isRead: false
      });
      let smsResult = { success: false, message: "No phone number" };
      if (user.phoneNumber) {
        const smsResponse = await sendSMSNotification(user.phoneNumber, smsMessage);
        smsResult = {
          success: smsResponse.success,
          message: smsResponse.message || (smsResponse.success ? "SMS sent successfully" : "SMS failed")
        };
      }
      res.json({
        notification,
        sms: smsResult,
        user: { id: user.id, phoneNumber: user.phoneNumber, fullName: user.fullName }
      });
    } catch (error) {
      console.error("Error in test auction notification:", error);
      res.status(500).json({ error: "Failed to send test notification" });
    }
  });
  app2.get("/api/listings/:id/photos", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const listing = await storage2.getListing(id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      const photos = Array.isArray(listing.photos) ? listing.photos : [];
      console.log(`\u{1F4F8} \u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u044E ${photos.length} \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${id}`);
      res.set("Cache-Control", "public, max-age=1800");
      res.json({ photos });
    } catch (error) {
      console.error("Error getting photos:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.get("/api/listings/:id/thumbnail", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cacheKey = `thumbnail_${id}`;
      if (photoCache.has(cacheKey)) {
        const buffer = photoCache.get(cacheKey);
        res.set("Content-Type", "image/jpeg");
        res.set("Cache-Control", "public, max-age=2592000");
        res.send(buffer);
        return;
      }
      const listing = await storage2.getListing(id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      const photos = Array.isArray(listing.photos) ? listing.photos : [];
      if (photos.length === 0) {
        return res.status(404).json({ error: "No photos found" });
      }
      const firstPhoto = photos[0];
      if (firstPhoto && firstPhoto.startsWith("data:image/")) {
        const matches = firstPhoto.match(/data:image\/([^;]+);base64,(.+)/);
        if (matches) {
          const base64Data = matches[2];
          const originalBuffer = Buffer.from(base64Data, "base64");
          try {
            const thumbnailBuffer = await sharp2(originalBuffer).jpeg({
              quality: 60,
              progressive: true,
              mozjpeg: true
            }).resize(400, 300, {
              fit: "cover",
              position: "center"
            }).toBuffer();
            photoCache.set(cacheKey, thumbnailBuffer);
            res.set("Content-Type", "image/jpeg");
            res.set("Cache-Control", "public, max-age=2592000");
            res.send(thumbnailBuffer);
            return;
          } catch (error) {
            console.error("Thumbnail generation failed:", error);
          }
        }
      }
      res.status(404).json({ error: "Thumbnail not found" });
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  app2.get("/api/listings", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "public, max-age=5, s-maxage=5");
      res.setHeader("ETag", `"listings-${lastCacheUpdate}"`);
      const optimizedListings = await Promise.all(cachedListings.map(async (listing) => {
        const realTimeBidCount = await storage2.getBidCountForListing(listing.id);
        return {
          id: listing.id,
          lotNumber: listing.lotNumber,
          make: listing.make,
          model: listing.model,
          year: listing.year,
          mileage: listing.mileage,
          currentBid: listing.currentBid,
          startingPrice: listing.startingPrice,
          status: listing.status,
          auctionEndTime: listing.auctionEndTime,
          auctionStartTime: listing.auctionStartTime,
          photos: listing.photos || [],
          // Возвращаем фотографии для отображения в карточках
          customsCleared: listing.customsCleared,
          recycled: listing.recycled,
          technicalInspectionValid: listing.technicalInspectionValid,
          technicalInspectionDate: listing.technicalInspectionDate,
          tinted: listing.tinted,
          tintingDate: listing.tintingDate,
          engine: listing.engine,
          transmission: listing.transmission,
          fuelType: listing.fuelType,
          color: listing.color,
          condition: listing.condition,
          location: listing.location,
          batteryCapacity: listing.batteryCapacity,
          electricRange: listing.electricRange,
          bidCount: realTimeBidCount
          // Всегда актуальное количество ставок
        };
      }));
      res.json(optimizedListings);
    } catch (error) {
      console.error("Error in listings endpoint:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  const photoCache = /* @__PURE__ */ new Map();
  const photoCacheTypes = /* @__PURE__ */ new Map();
  app2.get("/api/listings/:id/photo/:index", async (req, res) => {
    try {
      const cacheKey = `${req.params.id}-${req.params.index}`;
      if (photoCache.has(cacheKey)) {
        const buffer = photoCache.get(cacheKey);
        const mimeType = photoCacheTypes.get(cacheKey) || "image/jpeg";
        res.set("Content-Type", mimeType);
        res.set("Cache-Control", "public, max-age=2592000");
        res.send(buffer);
        return;
      }
      const listingId = parseInt(req.params.id);
      const photoIndex = parseInt(req.params.index);
      if (isNaN(listingId) || listingId <= 0 || isNaN(photoIndex) || photoIndex < 0 || photoIndex > 99) {
        return res.status(400).json({ error: "Invalid parameters" });
      }
      try {
        const fileName = `${photoIndex + 1}.jpg`;
        const fileBuffer = await fileStorage2.getListingPhoto(listingId, fileName);
        if (fileBuffer) {
          console.log(`\u{1F4C1} \u0424\u043E\u0442\u043E \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E \u0438\u0437 \u0444\u0430\u0439\u043B\u043E\u0432\u043E\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B: ${listingId}/${fileName}`);
          photoCache.set(cacheKey, fileBuffer);
          photoCacheTypes.set(cacheKey, "image/jpeg");
          res.set("Content-Type", "image/jpeg");
          res.set("Cache-Control", "public, max-age=2592000");
          res.send(fileBuffer);
          return;
        }
      } catch (fileError) {
        console.log(`\u{1F4C1} \u0424\u0430\u0439\u043B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D, \u043F\u0440\u043E\u0431\u0443\u0435\u043C base64 \u0438\u0437 \u0411\u0414: ${listingId}/${photoIndex}`);
      }
      const [listing] = await db.select({ photos: carListings.photos }).from(carListings).where(eq2(carListings.id, listingId));
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      let photoArray = [];
      if (listing.photos) {
        if (Array.isArray(listing.photos)) {
          photoArray = listing.photos;
        } else if (typeof listing.photos === "string") {
          photoArray = JSON.parse(listing.photos);
        }
      }
      const requestedPhotoIndex = Number(req.params.index);
      if (requestedPhotoIndex >= 0 && requestedPhotoIndex < photoArray.length) {
        const photoData = photoArray[requestedPhotoIndex];
        if (photoData.startsWith("data:image/")) {
          const matches = photoData.match(/data:image\/([^;]+);base64,(.+)/);
          if (matches) {
            const originalMimeType = `image/${matches[1]}`;
            const base64Data = matches[2];
            const originalBuffer = Buffer.from(base64Data, "base64");
            console.log(`\u{1F4BE} \u0424\u043E\u0442\u043E \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E \u0438\u0437 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445 (base64): ${listingId}/${photoIndex}`);
            let compressedBuffer;
            let outputMimeType = "image/jpeg";
            try {
              const originalSize = originalBuffer.length;
              if (originalSize > 100 * 1024) {
                let quality = 80;
                let maxWidth = 1e3;
                let maxHeight = 700;
                if (originalSize > 2 * 1024 * 1024) {
                  quality = 70;
                  maxWidth = 900;
                  maxHeight = 600;
                } else if (originalSize > 1 * 1024 * 1024) {
                  quality = 80;
                  maxWidth = 1100;
                  maxHeight = 733;
                }
                compressedBuffer = await sharp2(originalBuffer).jpeg({
                  quality,
                  progressive: true,
                  mozjpeg: true,
                  optimiseScans: true
                }).resize(maxWidth, maxHeight, {
                  fit: "inside",
                  withoutEnlargement: true
                }).toBuffer();
                const compressedSize = compressedBuffer.length;
                const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                console.log(`Image compressed: ${(originalSize / 1024).toFixed(1)}KB -> ${(compressedSize / 1024).toFixed(1)}KB (${compressionRatio}% reduction)`);
              } else {
                compressedBuffer = originalBuffer;
                outputMimeType = originalMimeType;
              }
            } catch (error) {
              console.error("Image compression failed, using original:", error);
              compressedBuffer = originalBuffer;
              outputMimeType = originalMimeType;
            }
            photoCache.set(cacheKey, compressedBuffer);
            photoCacheTypes.set(cacheKey, outputMimeType);
            res.set("Content-Type", outputMimeType);
            res.set("Cache-Control", "public, max-age=2592000");
            res.send(compressedBuffer);
            return;
          }
        }
      }
      res.status(404).json({ error: "Photo not found" });
    } catch (error) {
      console.error("Error fetching photo:", error);
      res.status(500).json({ error: "Failed to fetch photo" });
    }
  });
  app2.get("/api/listings/search", async (req, res) => {
    try {
      const validatedQuery = queryParamsSchema.safeParse(req.query);
      if (!validatedQuery.success) {
        return res.status(400).json({ error: "Invalid search parameters" });
      }
      const filters = validatedQuery.data;
      const cacheKey = `search_${JSON.stringify(filters)}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      const listings = await storage2.searchListings(filters);
      let enrichedListings = listings;
      if (listings.length > 0) {
        const listingIds = listings.map((listing) => listing.id);
        const bidCounts = await storage2.getBidCountsForListings(listingIds);
        enrichedListings = listings.map((listing) => ({
          ...listing,
          bidCount: bidCounts[listing.id] || 0
        }));
      }
      setCache(cacheKey, enrichedListings);
      res.json(enrichedListings);
    } catch (error) {
      res.status(500).json({ error: "Failed to search listings" });
    }
  });
  const sellerListingsCache = /* @__PURE__ */ new Map();
  app2.get("/api/listings/seller/:sellerId", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      if (sellerListingsCache.has(sellerId)) {
        console.log(`Fast cache hit for seller ${sellerId}`);
        return res.json(sellerListingsCache.get(sellerId));
      }
      console.log(`Fetching seller listings for ${sellerId}...`);
      const startTime = Date.now();
      const listings = await storage2.getListingsBySeller(sellerId);
      console.log(`Query took ${Date.now() - startTime}ms`);
      const enrichedListings = listings.map((listing) => ({
        ...listing,
        bidCount: 0
      }));
      sellerListingsCache.set(sellerId, enrichedListings);
      setTimeout(() => sellerListingsCache.delete(sellerId), 10 * 60 * 1e3);
      res.json(enrichedListings);
    } catch (error) {
      console.error("Error in seller listings endpoint:", error);
      res.status(500).json({ error: "Failed to fetch seller listings" });
    }
  });
  app2.get("/api/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const cacheKey = `listing_${listingId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        console.log(`\u{1F3AF} \u041A\u042D\u0428\u0418\u0420\u041E\u0412\u0410\u041D\u041D\u042B\u0419 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listingId} currentBid=${cached.currentBid}`);
        return res.json(cached);
      }
      const listing = await storage2.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      console.log(`\u{1F195} \u0421\u0412\u0415\u0416\u0418\u0419 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listingId} currentBid=${listing.currentBid}`);
      setCache(cacheKey, listing);
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });
  app2.post("/api/compress-photos", async (req, res) => {
    try {
      const { photos } = req.body;
      if (!Array.isArray(photos)) {
        return res.status(400).json({ error: "Photos must be an array" });
      }
      const compressedPhotos = [];
      for (const photoData of photos) {
        if (typeof photoData === "string" && photoData.startsWith("data:image/")) {
          const matches = photoData.match(/data:image\/([^;]+);base64,(.+)/);
          if (matches) {
            const base64Data = matches[2];
            const originalBuffer = Buffer.from(base64Data, "base64");
            const originalSize = originalBuffer.length;
            try {
              let quality = 70;
              let maxWidth = 1e3;
              if (originalSize > 2 * 1024 * 1024) {
                quality = 60;
                maxWidth = 800;
              } else if (originalSize > 500 * 1024) {
                quality = 65;
                maxWidth = 900;
              }
              const compressedBuffer = await sharp2(originalBuffer).jpeg({
                quality,
                progressive: true,
                mozjpeg: true,
                optimiseScans: true
              }).resize(maxWidth, null, {
                fit: "inside",
                withoutEnlargement: true
              }).toBuffer();
              const compressedSize = compressedBuffer.length;
              const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
              console.log(`\u2705 \u0421\u0436\u0430\u0442\u043E: ${(originalSize / 1024).toFixed(1)}KB \u2192 ${(compressedSize / 1024).toFixed(1)}KB (${compressionRatio}% \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u044F)`);
              const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;
              compressedPhotos.push(compressedBase64);
            } catch (error) {
              console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0436\u0430\u0442\u0438\u044F, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B:", error);
              compressedPhotos.push(photoData);
            }
          } else {
            compressedPhotos.push(photoData);
          }
        } else {
          compressedPhotos.push(photoData);
        }
      }
      res.json({ compressedPhotos });
    } catch (error) {
      console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0436\u0430\u0442\u0438\u044F \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439:", error);
      res.status(500).json({ error: "Failed to compress photos" });
    }
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 20 * 1024 * 1024,
      // 20MB per file
      files: 20
      // max 20 files
    }
  });
  app2.post("/api/listings", upload.any(), (req, res, next) => {
    console.log(`\u{1F6A8} MIDDLEWARE: POST /api/listings \u043F\u043E\u043B\u0443\u0447\u0435\u043D`);
    console.log(`\u{1F4E6} MIDDLEWARE: req.body.sellerId = ${req.body?.sellerId}`);
    console.log(`\u{1F4E6} MIDDLEWARE: req.body keys = ${Object.keys(req.body || {})}`);
    console.log(`\u{1F4F8} MIDDLEWARE: req.files = ${req.files?.length || 0} \u0444\u0430\u0439\u043B\u043E\u0432`);
    next();
  }, getUserFromContext, async (req, res) => {
    console.log(`\u{1F6A8} \u041D\u041E\u0412\u041E\u0415 \u041E\u0411\u042A\u042F\u0412\u041B\u0415\u041D\u0418\u0415: POST /api/listings \u0437\u0430\u043F\u0440\u043E\u0441 \u043F\u043E\u043B\u0443\u0447\u0435\u043D`);
    console.log(`\u{1F4E6} \u0420\u0430\u0437\u043C\u0435\u0440 \u0442\u0435\u043B\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430: ${JSON.stringify(req.body).length} \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432`);
    const currentUser = req.user;
    console.log(`\u{1F464} \u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C:`, currentUser?.phoneNumber, currentUser?.fullName);
    console.log(`\u{1F50D} currentUser full object:`, JSON.stringify(currentUser, null, 2));
    console.log(`\u{1F4E6} req.body.sellerId:`, req.body.sellerId);
    try {
      const isAdmin = currentUser?.fullName === "ADMIN" || currentUser?.role === "admin";
      const targetSellerId = req.body.sellerId;
      console.log(`\u{1F50D} \u0414\u0415\u0422\u0410\u041B\u042C\u041D\u0410\u042F \u041E\u0422\u041B\u0410\u0414\u041A\u0410 currentUser:`, {
        userId: currentUser?.userId,
        id: currentUser?.id,
        fullName: currentUser?.fullName,
        role: currentUser?.role,
        phoneNumber: currentUser?.phoneNumber
      });
      let actualSellerId = currentUser?.userId || currentUser?.id;
      console.log(`\u{1F3AF} actualSellerId calculated as:`, actualSellerId, `(\u0442\u0438\u043F: ${typeof actualSellerId})`);
      if (!actualSellerId) {
        console.error(`\u274C \u041A\u0420\u0418\u0422\u0418\u0427\u0415\u0421\u041A\u0410\u042F \u041E\u0428\u0418\u0411\u041A\u0410: actualSellerId undefined!`);
        console.error(`\u274C currentUser?.userId:`, currentUser?.userId);
        console.error(`\u274C currentUser?.id:`, currentUser?.id);
        return res.status(500).json({ error: "User identification failed" });
      }
      let targetUser = currentUser;
      if (isAdmin && targetSellerId && parseInt(targetSellerId) !== (currentUser?.userId || currentUser?.id)) {
        const targetSellerIdNum = parseInt(targetSellerId);
        console.log(`\u{1F451} \u0410\u0414\u041C\u0418\u041D: \u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F \u043E\u0442 \u0438\u043C\u0435\u043D\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${targetSellerIdNum}`);
        targetUser = await storage2.getUser(targetSellerIdNum);
        if (targetUser) {
          actualSellerId = targetSellerIdNum;
          console.log(`\u2705 \u0410\u0414\u041C\u0418\u041D: \u041D\u0430\u0439\u0434\u0435\u043D \u0446\u0435\u043B\u0435\u0432\u043E\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${targetUser.phoneNumber} - ${targetUser.fullName}`);
          console.log(`\u{1F50D} \u0410\u0414\u041C\u0418\u041D: actualSellerId \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u0432 ${actualSellerId} (\u0442\u0438\u043F: ${typeof actualSellerId})`);
        } else {
          console.error(`\u274C \u0410\u0414\u041C\u0418\u041D: \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${targetSellerIdNum} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D`);
          return res.status(400).json({ error: "Target user not found" });
        }
      }
      const processedData = { ...req.body };
      processedData.sellerId = typeof actualSellerId === "string" ? parseInt(actualSellerId) : actualSellerId;
      console.log(`\u{1F3AF} \u041F\u041E\u0421\u041B\u0415 \u0417\u0410\u041C\u0415\u041D\u042B: processedData.sellerId = ${processedData.sellerId} (\u0442\u0438\u043F: ${typeof processedData.sellerId})`);
      console.log(`\u{1F697} \u0414\u0430\u043D\u043D\u044B\u0435 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F: ${processedData.make} ${processedData.model} ${processedData.year}`);
      console.log(`\u{1F4F8} \u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0444\u0430\u0439\u043B\u043E\u0432 \u0432 \u0437\u0430\u043F\u0440\u043E\u0441\u0435: ${req.files?.length || 0}`);
      if (processedData.year) processedData.year = parseInt(processedData.year);
      if (processedData.mileage) processedData.mileage = parseInt(processedData.mileage);
      if (processedData.auctionDuration) processedData.auctionDuration = parseInt(processedData.auctionDuration);
      if (processedData.customsCleared !== void 0) {
        processedData.customsCleared = processedData.customsCleared === "true";
      }
      if (processedData.recycled !== void 0) {
        processedData.recycled = processedData.recycled === "true";
      }
      if (processedData.technicalInspectionValid !== void 0) {
        processedData.technicalInspectionValid = processedData.technicalInspectionValid === "true";
      }
      if (processedData.tinted !== void 0) {
        processedData.tinted = processedData.tinted === "true";
      }
      if (processedData.batteryCapacity !== void 0 && processedData.batteryCapacity !== null) {
        processedData.batteryCapacity = typeof processedData.batteryCapacity === "string" ? parseFloat(processedData.batteryCapacity) : processedData.batteryCapacity;
      }
      if (processedData.electricRange !== void 0 && processedData.electricRange !== null) {
        processedData.electricRange = typeof processedData.electricRange === "string" ? parseInt(processedData.electricRange) : processedData.electricRange;
      }
      let fileNames = [];
      let uploadedFiles = [];
      if (req.files && Array.isArray(req.files)) {
        uploadedFiles = req.files;
        console.log(`\u{1F4F8} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u0444\u0430\u0439\u043B\u043E\u0432: ${uploadedFiles.length}`);
      }
      processedData.photos = [];
      console.log(`\u{1F50D} \u041F\u0415\u0420\u0415\u0414 \u0412\u0410\u041B\u0418\u0414\u0410\u0426\u0418\u0415\u0419: sellerId = ${processedData.sellerId} (\u0442\u0438\u043F: ${typeof processedData.sellerId})`);
      if (processedData.sellerId && typeof processedData.sellerId === "string") {
        processedData.sellerId = parseInt(processedData.sellerId);
        console.log(`\u{1F527} \u0418\u0421\u041F\u0420\u0410\u0412\u041B\u0415\u041D\u0418\u0415: \u041F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043B\u0438 sellerId \u0432 \u0447\u0438\u0441\u043B\u043E: ${processedData.sellerId} (\u0442\u0438\u043F: ${typeof processedData.sellerId})`);
      }
      console.log(`\u2705 \u0412\u0410\u041B\u0418\u0414\u0410\u0426\u0418\u042F: \u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u0440\u043E\u0448\u043B\u0438 \u043F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0443\u044E \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443`);
      const validatedData = insertCarListingSchema.parse(processedData);
      console.log(`\u2705 \u0412\u0410\u041B\u0418\u0414\u0410\u0426\u0418\u042F: \u0421\u0445\u0435\u043C\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0432\u0430\u043B\u0438\u0434\u0438\u0440\u043E\u0432\u0430\u043D\u0430`);
      let lotNumber = validatedData.lotNumber;
      if (!lotNumber) {
        console.log(`\u{1F3AF} \u0413\u0415\u041D\u0415\u0420\u0410\u0426\u0418\u042F: \u0421\u043E\u0437\u0434\u0430\u0435\u043C \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043D\u043E\u043C\u0435\u0440 \u043B\u043E\u0442\u0430`);
        const { generateUniqueLotNumber: generateUniqueLotNumber2 } = await Promise.resolve().then(() => (init_lotNumberGenerator(), lotNumberGenerator_exports));
        const existingListings = await storage2.getListingsByStatus("", 1e3);
        const existingLotNumbers = existingListings.map((l) => l.lotNumber);
        lotNumber = generateUniqueLotNumber2(existingLotNumbers);
        console.log(`\u{1F3AF} \u0413\u0415\u041D\u0415\u0420\u0410\u0426\u0418\u042F: \u0421\u043E\u0437\u0434\u0430\u043D \u043D\u043E\u043C\u0435\u0440 \u043B\u043E\u0442\u0430 ${lotNumber}`);
      }
      const listingWithPendingStatus = {
        ...validatedData,
        lotNumber,
        status: "pending"
      };
      console.log(`\u{1F4BE} \u0411\u0410\u0417\u0410 \u0414\u0410\u041D\u041D\u042B\u0425: \u0421\u043E\u0437\u0434\u0430\u0435\u043C \u0437\u0430\u043F\u0438\u0441\u044C \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F \u0432 \u0411\u0414...`);
      const listing = await storage2.createListing(listingWithPendingStatus);
      console.log(`\u2705 \u0411\u0410\u0417\u0410 \u0414\u0410\u041D\u041D\u042B\u0425: \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0441 ID ${listing.id}`);
      console.log(`\u{1F50D} \u041E\u0422\u041B\u0410\u0414\u041A\u0410: \u041F\u0443\u0442\u044C \u0434\u043B\u044F \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0431\u0443\u0434\u0435\u0442 uploads/listings/${Math.floor(listing.id / 1e3) * 1e3}/${listing.id}/`);
      if (uploadedFiles && Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
        console.log(`\u{1F4C1} \u0421\u0422\u0410\u0420\u0422 \u0421\u041E\u0425\u0420\u0410\u041D\u0415\u041D\u0418\u042F: \u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 ${uploadedFiles.length} \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0434\u043B\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listing.id}`);
        console.log(`\u{1F5C2}\uFE0F \u041F\u0423\u0422\u042C: \u0424\u0430\u0439\u043B\u044B \u0431\u0443\u0434\u0443\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u044B \u0432 uploads/listings/${Math.floor(listing.id / 1e3) * 1e3}/${listing.id}/`);
        for (let i = 0; i < uploadedFiles.length; i++) {
          console.log(`\u{1F4F8} \u0424\u041E\u0422\u041E ${i + 1}/${uploadedFiles.length}: \u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443...`);
          const file = uploadedFiles[i];
          if (file && file.buffer) {
            console.log(`\u{1F4F8} \u0424\u041E\u0422\u041E ${i + 1}: \u041E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u043C \u0444\u0430\u0439\u043B, \u0440\u0430\u0437\u043C\u0435\u0440: ${(file.buffer.length / 1024).toFixed(1)}KB`);
            try {
              console.log(`\u{1F504} \u0424\u041E\u0422\u041E ${i + 1}: \u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0441\u0436\u0430\u0442\u0438\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F...`);
              const compressedBuffer = await sharp2(file.buffer).jpeg({
                quality: 85,
                progressive: true,
                mozjpeg: true
              }).resize(1200, 900, {
                fit: "inside",
                withoutEnlargement: true
              }).toBuffer();
              console.log(`\u2705 \u0424\u041E\u0422\u041E ${i + 1}: \u0421\u0436\u0430\u0442\u0438\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E, \u0440\u0430\u0437\u043C\u0435\u0440: ${(compressedBuffer.length / 1024).toFixed(1)}KB`);
              const fileName = `${i + 1}.jpg`;
              console.log(`\u{1F4BE} \u0424\u041E\u0422\u041E ${i + 1}: \u0412\u044B\u0437\u044B\u0432\u0430\u0435\u043C fileStorage.saveListingPhoto(${listing.id}, ${i + 1}, buffer)`);
              await fileStorage2.saveListingPhoto(listing.id, i + 1, compressedBuffer);
              fileNames.push(fileName);
              console.log(`\u2705 \u0424\u041E\u0422\u041E ${i + 1}: \u0423\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E \u043A\u0430\u043A ${fileName} \u0434\u043B\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listing.id} (\u0440\u0430\u0437\u043C\u0435\u0440: ${(compressedBuffer.length / 1024).toFixed(1)}KB)`);
            } catch (photoError) {
              console.error(`\u274C \u0424\u041E\u0422\u041E ${i + 1}: \u041A\u0420\u0418\u0422\u0418\u0427\u0415\u0421\u041A\u0410\u042F \u041E\u0428\u0418\u0411\u041A\u0410 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u0444\u043E\u0442\u043E \u0434\u043B\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listing.id}:`, photoError);
              console.error(`\u274C \u0424\u041E\u0422\u041E ${i + 1}: Stack trace:`, photoError.stack);
              continue;
            }
          } else {
            console.error(`\u274C \u0424\u041E\u0422\u041E ${i + 1}: \u041D\u0435\u0442 buffer \u0434\u0430\u043D\u043D\u044B\u0445 \u0432 \u0444\u0430\u0439\u043B\u0435`);
          }
        }
        console.log(`\u{1F4CA} \u0418\u0422\u041E\u0413\u0418 \u0421\u041E\u0425\u0420\u0410\u041D\u0415\u041D\u0418\u042F: \u0423\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E ${fileNames.length} \u0438\u0437 ${uploadedFiles.length} \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439`);
        console.log(`\u{1F4CA} \u0418\u041C\u0415\u041D\u0410 \u0424\u0410\u0419\u041B\u041E\u0412: [${fileNames.join(", ")}]`);
        if (fileNames.length > 0) {
          console.log(`\u{1F4BE} \u041E\u0411\u041D\u041E\u0412\u041B\u0415\u041D\u0418\u0415 \u0411\u0414: \u0417\u0430\u043F\u0438\u0441\u044B\u0432\u0430\u0435\u043C \u0438\u043C\u0435\u043D\u0430 \u0444\u0430\u0439\u043B\u043E\u0432 \u0432 \u0431\u0430\u0437\u0443 \u0434\u0430\u043D\u043D\u044B\u0445...`);
          await storage2.updateListing(listing.id, { photos: fileNames });
          console.log(`\u2705 \u041E\u0411\u041D\u041E\u0412\u041B\u0415\u041D\u0418\u0415 \u0411\u0414: \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listing.id} \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E \u0441 ${fileNames.length} \u0444\u0430\u0439\u043B\u0430\u043C\u0438 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439`);
          console.log(`\u{1F3AF} \u0424\u0418\u041D\u0410\u041B\u042C\u041D\u042B\u0419 \u0421\u0422\u0410\u0422\u0423\u0421: \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listing.id} \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0423\u0421\u041F\u0415\u0428\u041D\u041E \u0441 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u044F\u043C\u0438`);
        } else if (uploadedFiles.length > 0) {
          console.error(`\u274C \u041A\u0420\u0418\u0422\u0418\u0427\u0415\u0421\u041A\u0410\u042F \u041E\u0428\u0418\u0411\u041A\u0410: \u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u043D\u0438 \u043E\u0434\u043D\u043E\u0433\u043E \u0444\u043E\u0442\u043E \u0438\u0437 ${uploadedFiles.length} \u0434\u043B\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listing.id}`);
          console.error(`\u{1F5D1}\uFE0F \u041E\u0422\u041A\u0410\u0422: \u0423\u0434\u0430\u043B\u044F\u0435\u043C \u0441\u043E\u0437\u0434\u0430\u043D\u043D\u043E\u0435 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u0438\u0437 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445...`);
          await storage2.deleteListing(listing.id);
          console.error(`\u{1F5D1}\uFE0F \u041E\u0422\u041A\u0410\u0422: \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listing.id} \u0443\u0434\u0430\u043B\u0435\u043D\u043E \u0438\u0437 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445`);
          return res.status(400).json({
            error: "Failed to process photos",
            details: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u043E\u0440\u043C\u0430\u0442 \u0444\u0430\u0439\u043B\u043E\u0432."
          });
        }
      } else {
        console.log(`\u{1F4F8} \u0424\u041E\u0422\u041E\u0413\u0420\u0410\u0424\u0418\u0418: \u041D\u0435\u0442 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0434\u043B\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F (\u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u0431\u0435\u0437 \u0444\u043E\u0442\u043E)`);
      }
      console.log(`\u{1F9F9} \u041A\u042D\u0428\u0418: \u041E\u0447\u0438\u0449\u0430\u0435\u043C \u0432\u0441\u0435 \u043A\u044D\u0448\u0438 \u043F\u043E\u0441\u043B\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F`);
      clearAllCaches();
      if (isAdmin && targetSellerId && targetSellerId !== currentUser?.userId && targetUser) {
        try {
          const smsMessage = `AutoBid.tj: \u0412\u0430\u0448\u0430 \u043C\u0430\u0448\u0438\u043D\u0430 ${processedData.make} ${processedData.model} \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0430 \u0432 \u0430\u0443\u043A\u0446\u0438\u043E\u043D. \u041B\u043E\u0442 \u2116${lotNumber}. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438.`;
          console.log(`\u{1F4F1} SMS: \u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${targetUser.phoneNumber}`);
          const smsResult = await sendSMSNotification(targetUser.phoneNumber, smsMessage);
          console.log(`\u{1F4F1} SMS \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442:`, smsResult);
          if (smsResult.success) {
            console.log(`\u2705 SMS: \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${targetUser.phoneNumber}`);
          } else {
            console.error(`\u274C SMS: \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${targetUser.phoneNumber}:`, smsResult.message);
          }
        } catch (smsError) {
          console.error(`\u274C SMS: \u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0435 SMS:`, smsError);
        }
      }
      console.log(`\u{1F389} \u0423\u0421\u041F\u0415\u0425: \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listing.id} \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0438 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442\u0441\u044F \u043A\u043B\u0438\u0435\u043D\u0442\u0443`);
      res.status(201).json(listing);
    } catch (error) {
      console.error(`\u{1F4A5} \u041A\u0420\u0418\u0422\u0418\u0427\u0415\u0421\u041A\u0410\u042F \u041E\u0428\u0418\u0411\u041A\u0410 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F:`, error);
      console.error(`\u{1F4A5} Stack trace:`, error instanceof Error ? error.stack : "No stack trace");
      if (error instanceof z2.ZodError) {
        console.error(`\u{1F4CB} \u041E\u0448\u0438\u0431\u043A\u0438 \u0432\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u0438 Zod:`, error.errors);
        return res.status(400).json({ error: "Invalid listing data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create listing", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const listing = await storage2.updateListing(id, updateData);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      clearAllCaches();
      res.json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Failed to update listing" });
    }
  });
  app2.patch("/api/listings/:id/status", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { status } = req.body;
      if (!["pending", "active", "ended", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const listing = await storage2.updateListingStatus(listingId, status);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing status" });
    }
  });
  app2.get("/api/listings/:id/bids", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const bids2 = await storage2.getBidsForListing(listingId);
      const enrichedBids = await Promise.all(
        bids2.map(async (bid) => {
          const user = await storage2.getUser(bid.bidderId);
          return {
            ...bid,
            bidder: {
              id: user?.id,
              username: user?.username,
              email: user?.email
            }
          };
        })
      );
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.json(enrichedBids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  });
  app2.post("/api/listings/:id/bids", sanitizeInput, getUserFromContext, async (req, res) => {
    console.log(`\u{1F6A8}\u{1F6A8}\u{1F6A8} \u041A\u0420\u0418\u0422\u0418\u0427\u041D\u041E: POST \u0437\u0430\u043F\u0440\u043E\u0441 \u0441\u0442\u0430\u0432\u043A\u0438 \u0434\u043E\u0441\u0442\u0438\u0433 \u0440\u043E\u0443\u0442\u0430! ID: ${req.params.id}`);
    console.log(`\u{1F6A8}\u{1F6A8}\u{1F6A8} \u041A\u0420\u0418\u0422\u0418\u0427\u041D\u041E: \u0422\u0435\u043B\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0430:`, req.body);
    console.log(`\u{1F6A8}\u{1F6A8}\u{1F6A8} \u041A\u0420\u0418\u0422\u0418\u0427\u041D\u041E: \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C:`, req.user);
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    try {
      const listingId = parseInt(req.params.id);
      console.log(`\u{1F3AF} \u041F\u041E\u041B\u0423\u0427\u0415\u041D POST \u0437\u0430\u043F\u0440\u043E\u0441 \u0441\u0442\u0430\u0432\u043A\u0438 \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId}:`, req.body);
      console.log(`\u{1F3AF} \u041D\u0410\u0427\u0410\u041B\u041E \u041E\u0411\u0420\u0410\u0411\u041E\u0422\u041A\u0418 \u0421\u0422\u0410\u0412\u041A\u0418 \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId} \u043E\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${req.user.id}`);
      console.log(`\u{1F50D} \u041F\u0420\u041E\u0412\u0415\u0420\u041A\u0410 req.user:`, req.user);
      const listing = await storage2.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ error: "\u0410\u0443\u043A\u0446\u0438\u043E\u043D \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const now = /* @__PURE__ */ new Date();
      if (listing.auctionEndTime && listing.auctionEndTime <= now) {
        return res.status(400).json({ error: "\u0410\u0443\u043A\u0446\u0438\u043E\u043D \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D. \u0421\u0442\u0430\u0432\u043A\u0438 \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u043F\u0440\u0438\u043D\u0438\u043C\u0430\u044E\u0442\u0441\u044F." });
      }
      if (listing.status !== "active") {
        return res.status(400).json({ error: "\u0410\u0443\u043A\u0446\u0438\u043E\u043D \u043D\u0435\u0430\u043A\u0442\u0438\u0432\u0435\u043D" });
      }
      const bidData = {
        ...req.body,
        listingId,
        bidderId: req.user.id
      };
      const validatedData = insertBidSchema.parse(bidData);
      const user = await storage2.getUser(validatedData.bidderId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (!user.isActive) {
        return res.status(403).json({
          error: "Account not activated",
          message: "\u0412\u0430\u0448 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u043D\u0435 \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044C \u0432 \u0441\u043B\u0443\u0436\u0431\u0443 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438 \u0447\u0435\u0440\u0435\u0437 WhatsApp \u0434\u043B\u044F \u0430\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u0438 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430."
        });
      }
      if (listing.sellerId === validatedData.bidderId) {
        return res.status(403).json({
          error: "Cannot bid on own listing",
          message: "\u0412\u044B \u043D\u0435 \u043C\u043E\u0436\u0435\u0442\u0435 \u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0442\u0430\u0432\u043A\u0438 \u043D\u0430 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438."
        });
      }
      const existingBids = await storage2.getBidsForListing(listingId);
      console.log(`\u{1F50D} \u041E\u0422\u041B\u0410\u0414\u041A\u0410: \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${existingBids.length} \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0445 \u0441\u0442\u0430\u0432\u043E\u043A \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId}:`);
      existingBids.forEach((bid2, index2) => {
        console.log(`  ${index2 + 1}. \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${bid2.bidderId}: ${bid2.amount} \u0421\u043E\u043C\u043E\u043D\u0438`);
      });
      const currentHighestBid = existingBids.length > 0 ? Math.max(...existingBids.map((bid2) => parseFloat(bid2.amount))) : parseFloat(listing.startingPrice);
      console.log(`\u{1F4B0} \u0412\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u044F \u0441\u0442\u0430\u0432\u043A\u0438: \u0442\u0435\u043A\u0443\u0449\u0430\u044F \u043C\u0430\u043A\u0441 ${currentHighestBid}, \u043D\u043E\u0432\u0430\u044F ${validatedData.amount}`);
      const newBidAmount = parseFloat(validatedData.amount);
      if (newBidAmount <= currentHighestBid) {
        return res.status(400).json({
          error: "Bid too low",
          message: `\u0412\u0430\u0448\u0430 \u0441\u0442\u0430\u0432\u043A\u0430 \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0432\u044B\u0448\u0435 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0442\u0430\u0432\u043A\u0438 ${currentHighestBid} \u0421\u043E\u043C\u043E\u043D\u0438.`
        });
      }
      const userHighestBid = existingBids.filter((bid2) => bid2.bidderId === validatedData.bidderId).sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0];
      if (userHighestBid && parseFloat(userHighestBid.amount) === currentHighestBid) {
        return res.status(400).json({
          error: "Already highest bidder",
          message: "\u0423\u043F\u0441! \u0412\u044B \u0443\u0436\u0435 \u043B\u0438\u0434\u0435\u0440!"
        });
      }
      console.log(`\u{1F680} \u0421\u041E\u0417\u0414\u0410\u0415\u041C \u0421\u0422\u0410\u0412\u041A\u0423: \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listingId}, \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${validatedData.bidderId}, \u0441\u0443\u043C\u043C\u0430 ${validatedData.amount}`);
      const bid = await storage2.createBid(validatedData);
      console.log(`\u2705 \u0421\u0422\u0410\u0412\u041A\u0410 \u0421\u041E\u0417\u0414\u0410\u041D\u0410: ID ${bid.id}, \u0441\u0443\u043C\u043C\u0430 ${bid.amount}`);
      console.log(`\u{1F504} \u041D\u0410\u0427\u0418\u041D\u0410\u0415\u041C \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 current_bid \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId} \u043D\u0430 ${validatedData.amount}`);
      await storage2.updateListingCurrentBid(listingId, validatedData.amount);
      console.log(`\u2705 \u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041D\u041E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 current_bid \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId}`);
      const verificationListing = await storage2.getListing(listingId);
      console.log(`\u{1F50D} \u041F\u0420\u041E\u0412\u0415\u0420\u041A\u0410: current_bid \u0432 \u0431\u0430\u0437\u0435 \u0434\u0430\u043D\u043D\u044B\u0445 \u0442\u0435\u043F\u0435\u0440\u044C ${verificationListing?.currentBid}`);
      if (verificationListing?.currentBid !== validatedData.amount) {
        console.error(`\u274C \u041E\u0428\u0418\u0411\u041A\u0410: current_bid \u043D\u0435 \u043E\u0431\u043D\u043E\u0432\u0438\u043B\u0441\u044F! \u041E\u0436\u0438\u0434\u0430\u043B\u0441\u044F ${validatedData.amount}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D ${verificationListing?.currentBid}`);
      } else {
        console.log(`\u2705 \u0423\u0421\u041F\u0415\u0425: current_bid \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D \u043D\u0430 ${validatedData.amount}`);
      }
      if (listing) {
        const allBids = await storage2.getBidsForListing(listingId);
        const sortedBids = allBids.filter((bid2) => bid2.bidderId !== validatedData.bidderId).sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        const uniqueBidders = /* @__PURE__ */ new Set();
        allBids.forEach((bid2) => {
          if (bid2.bidderId !== validatedData.bidderId) {
            uniqueBidders.add(bid2.bidderId);
          }
        });
        console.log(`\u{1F4E2} \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u044F\u0435\u043C ${uniqueBidders.size} \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432 \u043E \u043D\u043E\u0432\u043E\u0439 \u0441\u0442\u0430\u0432\u043A\u0435 \u0432 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0435 ${listingId}`);
        console.log(`\u{1F4CB} \u0412\u0441\u0435 \u0441\u0442\u0430\u0432\u043A\u0438 \u0432 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0435 ${listingId}:`, allBids.map((b) => `ID:${b.bidderId} - ${b.amount} \u0421\u043E\u043C\u043E\u043D\u0438`));
        console.log(`\u{1F3AF} \u0423\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u0438 \u0434\u043B\u044F \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F:`, Array.from(uniqueBidders));
        for (const participantId of Array.from(uniqueBidders)) {
          try {
            console.log(`\u{1F4DD} \u0421\u043E\u0437\u0434\u0430\u0435\u043C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${participantId}...`);
            const carTitle = `${listing.make} ${listing.model} ${listing.year}`;
            const formattedAmount = parseInt(validatedData.amount).toLocaleString("ru-RU");
            const notification = await storage2.createNotification({
              userId: participantId,
              title: "\u{1F514} \u0412\u0430\u0448\u0430 \u0441\u0442\u0430\u0432\u043A\u0430 \u043F\u0435\u0440\u0435\u0431\u0438\u0442\u0430",
              message: `${carTitle} \u0421\u0434\u0435\u043B\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u0443\u044E \u0441\u0442\u0430\u0432\u043A\u0443 \u0432\u044B\u0448\u0435 ${formattedAmount} \u0441\u043E\u043C\u043E\u043D\u0438!`,
              type: "bid_outbid",
              listingId,
              isRead: false
            });
            console.log(`\u2705 \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${participantId}, ID: ${notification.id}`);
            if (wsManager) {
              console.log(`\u{1F4F2} \u041F\u041E\u041F\u042B\u0422\u041A\u0410 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${participantId}`);
              wsManager.sendNotificationToUser(participantId, notification);
              console.log(`\u{1F4F2} \u2705 \u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041D\u0410 \u043F\u043E\u043F\u044B\u0442\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${participantId}`);
            } else {
              console.log(`\u274C wsManager \u043D\u0435 \u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D - WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B`);
            }
            try {
              const participantUser = await storage2.getUser(participantId);
              if (participantUser && participantUser.phoneNumber) {
                const smsMessage = `\u0412\u0430\u0448\u0430 \u0441\u0442\u0430\u0432\u043A\u0430 \u043F\u0435\u0440\u0435\u0431\u0438\u0442\u0430! ${carTitle} - \u043D\u043E\u0432\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 ${formattedAmount} \u0441\u043E\u043C\u043E\u043D\u0438. \u0421\u0434\u0435\u043B\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u0443\u044E \u0441\u0442\u0430\u0432\u043A\u0443 \u043D\u0430 AUTOBID.TJ`;
                console.log(`\u{1F4F1} \u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${participantId} (${participantUser.phoneNumber})`);
                const smsResult = await sendSMSNotification(participantUser.phoneNumber, smsMessage);
                if (smsResult.success) {
                  console.log(`\u2705 SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${participantId}: ${smsResult.message}`);
                } else {
                  console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 SMS \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${participantId}: ${smsResult.message}`);
                }
              } else {
                console.log(`\u26A0\uFE0F \u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u0442\u0435\u043B\u0435\u0444\u043E\u043D \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${participantId} \u0434\u043B\u044F SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F`);
              }
            } catch (smsError) {
              console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0435 SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${participantId}:`, smsError);
            }
          } catch (notificationError) {
            console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${participantId}:`, notificationError);
          }
        }
      }
      console.log(`\u{1F50D} \u041F\u0420\u041E\u0412\u0415\u0420\u041A\u0410 wsManager: ${wsManager ? "\u0438\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D" : "\u041D\u0415 \u0418\u041D\u0418\u0426\u0418\u0410\u041B\u0418\u0417\u0418\u0420\u041E\u0412\u0410\u041D"}`);
      if (wsManager) {
        const updatedListing = await storage2.getListing(listingId);
        const allBids = await storage2.getBidsForListing(listingId);
        console.log(`\u{1F50D} \u041E\u0422\u041B\u0410\u0414\u041A\u0410 \u041F\u041E\u0421\u041B\u0415 \u041E\u0411\u041D\u041E\u0412\u041B\u0415\u041D\u0418\u042F \u0411\u0414: \u0410\u0443\u043A\u0446\u0438\u043E\u043D ${listingId}, current_bid \u0432 \u043E\u0431\u044A\u0435\u043A\u0442\u0435: ${updatedListing?.currentBid}`);
        const bidUpdateData = {
          bid,
          listing: updatedListing,
          totalBids: allBids.length,
          highestBid: Math.max(...allBids.map((b) => parseFloat(b.amount))),
          timestamp: Date.now()
        };
        console.log(`\u{1F4E1} \u041E\u0422\u041F\u0420\u0410\u0412\u041B\u042F\u0415\u041C WebSocket broadcast \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId}:`, {
          bidAmount: bid.amount,
          currentBid: updatedListing?.currentBid,
          highestBid: bidUpdateData.highestBid,
          totalBids: bidUpdateData.totalBids
        });
        wsManager.broadcastBidUpdate(listingId, bidUpdateData);
        const listingForUpdate = {
          id: listingId,
          currentBid: updatedListing?.currentBid,
          bidCount: allBids.length,
          highestBid: bidUpdateData.highestBid
        };
        wsManager.broadcastListingsUpdate(listingId, listingForUpdate);
        console.log(`\u2705 WebSocket broadcast \u041E\u0422\u041F\u0420\u0410\u0412\u041B\u0415\u041D: \u043D\u043E\u0432\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 ${bid.amount} \u043D\u0430 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listingId}, \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u0430\u044F \u0446\u0435\u043D\u0430 \u0432 WebSocket: ${updatedListing?.currentBid}`);
      }
      console.log("\u{1F3AF} \u0423\u043C\u043D\u043E\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043A\u044D\u0448\u0430 \u0434\u043B\u044F \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u043E\u0439 \u043E\u0442\u0437\u044B\u0432\u0447\u0438\u0432\u043E\u0441\u0442\u0438 \u0431\u0435\u0437 \u043F\u043E\u0442\u0435\u0440\u0438 \u0434\u0430\u043D\u043D\u044B\u0445");
      clearCachePattern(`listing_${listingId}`);
      console.log(`\u{1F3AF} \u041E\u0447\u0438\u0449\u0435\u043D \u043A\u044D\u0448 \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId} - \u0438\u0437\u0431\u0435\u0433\u0430\u0435\u043C \u043F\u043E\u0442\u0435\u0440\u0438 \u0434\u0430\u043D\u043D\u044B\u0445`);
      console.log(`\u{1F680} \u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043A\u044D\u0448\u0430 \u0434\u043B\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId}: current_bid ${validatedData.amount}`);
      const cacheIndex = cachedListings.findIndex((listing2) => listing2.id === listingId);
      if (cacheIndex !== -1) {
        cachedListings[cacheIndex].currentBid = validatedData.amount;
        cachedListings[cacheIndex].bidCount = (bidCountsCache.get(listingId) || 0) + 1;
        bidCountsCache.set(listingId, cachedListings[cacheIndex].bidCount);
        console.log(`\u2705 \u041F\u043B\u0430\u0432\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D \u043A\u044D\u0448 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId}: \u043D\u043E\u0432\u0430\u044F \u0446\u0435\u043D\u0430 ${validatedData.amount}`);
      }
      storage2.getListing(listingId).then((freshListing) => {
        if (freshListing && cacheIndex !== -1) {
          cachedListings[cacheIndex] = freshListing;
          console.log(`\u{1F504} \u0424\u043E\u043D\u043E\u0432\u043E\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 ${listingId} \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E`);
        }
      }).catch((error) => {
        console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0444\u043E\u043D\u043E\u0432\u043E\u0433\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430:", error);
      });
      res.status(201).json(bid);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid bid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to place bid" });
    }
  });
  app2.get("/api/users/by-phone/:phoneNumber", async (req, res) => {
    try {
      const phoneNumber = decodeURIComponent(req.params.phoneNumber);
      const email = phoneNumber + "@autoauction.tj";
      const user = await storage2.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user by phone" });
    }
  });
  app2.get("/api/users/by-email/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const user = await storage2.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user by email" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage2.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.get("/api/users/:id/documents", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`\u{1F4CB} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}`);
      const documents2 = await storage2.getUserDocuments(userId);
      console.log(`\u{1F4C4} \u041D\u0430\u0439\u0434\u0435\u043D\u043E \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432: ${documents2.length}`);
      res.json(documents2);
    } catch (error) {
      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch user documents: " + (error instanceof Error ? error.message : "Unknown error") });
    }
  });
  app2.post("/api/users/:id/documents", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { type, title, content, fileData } = req.body;
      console.log(`\u{1F4DD} \u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}, \u0442\u0438\u043F: ${type}`);
      const existingDocs = await storage2.getUserDocuments(userId);
      const duplicateDoc = existingDocs.find((doc) => doc.type === type && doc.title === title);
      if (duplicateDoc) {
        console.log(`\u26A0\uFE0F \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442, \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u043C: ${duplicateDoc.id}`);
        const updatedDoc = await storage2.updateDocument(duplicateDoc.id, {
          content: content || `\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u0442\u0438\u043F\u0430 ${type}`,
          fileUrl: fileData || duplicateDoc.fileUrl
        });
        console.log(`\u2705 \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D \u0441 ID: ${updatedDoc?.id}`);
        return res.json(updatedDoc);
      }
      const document = await storage2.createDocument({
        userId,
        type,
        title,
        content: content || `\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u0442\u0438\u043F\u0430 ${type}`,
        fileUrl: fileData
      });
      console.log(`\u2705 \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D \u0441 ID: ${document.id}`);
      res.status(201).json(document);
    } catch (error) {
      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to save document: " + (error instanceof Error ? error.message : "Unknown error") });
    }
  });
  app2.get("/api/users/by-phone/:phone", async (req, res) => {
    try {
      const rawPhone = req.params.phone;
      const phoneNumber = decodeURIComponent(rawPhone);
      let userId = 0;
      if (phoneNumber === "+992 (22) 222-22-22") {
        userId = 3;
      } else if (phoneNumber === "+992 (99) 999-99-99") {
        userId = 12;
      } else {
        return res.status(404).json({
          error: "User not found",
          raw: rawPhone,
          decoded: phoneNumber,
          target1: "+992 (22) 222-22-22",
          target2: "+992 (99) 999-99-99"
        });
      }
      const user = await storage2.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found in database" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const { email, username, fullName, isActive, role, phoneNumber } = req.body;
      if (!email || !username) {
        return res.status(400).json({ error: "Email and username are required" });
      }
      const existingUser = await storage2.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }
      const user = await storage2.createUser({
        email,
        username,
        fullName: fullName || null,
        isActive: isActive || false,
        role: role || "buyer",
        phoneNumber: phoneNumber || null
      });
      console.log(`Created new user: ${user.id} (${user.email})`);
      res.status(201).json(user);
    } catch (error) {
      console.error("Failed to create user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  app2.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`\u{1F527} \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}:`, req.body);
      const { fullName, profilePhoto, email, username, phoneNumber } = req.body;
      const updateData = {};
      if (fullName !== void 0) updateData.fullName = fullName;
      if (profilePhoto !== void 0) updateData.profilePhoto = profilePhoto;
      if (email !== void 0) updateData.email = email;
      if (username !== void 0) updateData.username = username;
      if (phoneNumber !== void 0) updateData.phoneNumber = phoneNumber;
      console.log(`\u{1F4DD} \u0414\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F:`, updateData);
      const user = await storage2.updateUserProfile(userId, updateData);
      if (!user) {
        console.log(`\u274C \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${userId} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D`);
        return res.status(404).json({ error: "User not found" });
      }
      console.log(`\u2705 \u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D`);
      res.json(user);
    } catch (error) {
      console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0444\u0438\u043B\u044F:", error);
      res.status(500).json({
        error: "Failed to update user profile",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.patch("/api/admin/users/:id/activate", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      const updatedUser = await storage2.updateUserStatus(userId, isActive);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });
  app2.get("/api/users/:id/listings", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const listings = await storage2.getListingsBySeller(userId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user listings" });
    }
  });
  app2.get("/api/users/:id/bids", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const bids2 = await storage2.getBidsByUser(userId);
      res.json(bids2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user bids" });
    }
  });
  app2.get("/api/users/:id/wins", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const wins = await storage2.getUserWins(userId);
      res.json(wins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user wins" });
    }
  });
  app2.get("/api/users/:id/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const favorites2 = await storage2.getFavoritesByUser(userId);
      res.json(favorites2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });
  app2.post("/api/favorites", async (req, res) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage2.createFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid favorite data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });
  app2.delete("/api/favorites/:id", async (req, res) => {
    try {
      const favoriteId = parseInt(req.params.id);
      const success = await storage2.deleteFavorite(favoriteId);
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });
  app2.delete("/api/favorites/by-listing/:listingId", async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      const userId = parseInt(req.query.userId);
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const userFavorites = await storage2.getFavoritesByUser(userId);
      const favorite = userFavorites.find((fav) => fav.listingId === listingId);
      if (!favorite) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      const success = await storage2.deleteFavorite(favorite.id);
      if (!success) {
        return res.status(404).json({ error: "Failed to delete favorite" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      const { q, make, minPrice, maxPrice, year } = req.query;
      const filters = {
        query: q,
        make,
        minPrice: minPrice ? parseFloat(minPrice) : void 0,
        maxPrice: maxPrice ? parseFloat(maxPrice) : void 0,
        year: year ? parseInt(year) : void 0
      };
      const results = await storage2.searchListings(filters);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search listings" });
    }
  });
  app2.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage2.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });
  app2.get("/api/admin/users", async (req, res) => {
    try {
      const users2 = await storage2.getAllUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/listings", async (req, res) => {
    try {
      const allListings = await storage2.getListingsByStatus("pending");
      const activeListings = await storage2.getListingsByStatus("active");
      const endedListings = await storage2.getListingsByStatus("ended");
      const rejectedListings = await storage2.getListingsByStatus("rejected");
      const listings = [...allListings, ...activeListings, ...endedListings, ...rejectedListings];
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });
  app2.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      const user = await storage2.updateUserStatus(userId, isActive);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });
  app2.put("/api/admin/users/:id/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      const user = await storage2.updateUserStatus(userId, isActive);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });
  app2.patch("/api/admin/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { status } = req.body;
      const listing = await storage2.updateListingStatus(listingId, status);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      clearAllCaches();
      if (status === "active") {
        try {
          console.log("\u{1F514} \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u043E! \u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043D\u044B\u0435 \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u044B\u0435 \u0437\u0430\u043F\u0440\u043E\u0441\u044B \u0434\u043B\u044F:", listing.make, listing.model);
          const matchingAlerts = await storage2.checkAlertsForNewListing(listing);
          console.log("\u{1F4E7} \u041D\u0430\u0439\u0434\u0435\u043D\u043E \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0449\u0438\u0445 \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432:", matchingAlerts.length);
          for (const alert of matchingAlerts) {
            console.log("\u{1F4E8} \u0421\u043E\u0437\u0434\u0430\u0435\u043C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", alert.userId, "\u0437\u0430\u043F\u0440\u043E\u0441:", alert.id);
            const existingNotifications = await storage2.getNotificationsByUser(alert.userId);
            const duplicateExists = existingNotifications.some(
              (n) => n.type === "car_found" && n.listingId === listing.id && n.alertId === alert.id
            );
            if (!duplicateExists) {
              await storage2.createNotification({
                userId: alert.userId,
                title: "\u041D\u0430\u0439\u0434\u0435\u043D \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C \u043F\u043E \u0432\u0430\u0448\u0435\u043C\u0443 \u0437\u0430\u043F\u0440\u043E\u0441\u0443",
                message: `${listing.make.toUpperCase()} ${listing.model.toUpperCase()} ${listing.year} \u0433. - ${listing.startingPrice} \u0421\u043E\u043C\u043E\u043D\u0438 (\u043B\u043E\u0442 #${listing.lotNumber})`,
                type: "car_found",
                listingId: listing.id,
                alertId: alert.id,
                isRead: false
              });
              console.log("\u2705 \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", alert.userId);
            } else {
              console.log("\u26A0\uFE0F \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", alert.userId);
            }
          }
        } catch (alertError) {
          console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u043E \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0438:", alertError);
        }
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing status" });
    }
  });
  app2.put("/api/admin/listings/:id", sanitizeInput, adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const {
        make,
        model,
        year,
        mileage,
        description,
        startingPrice,
        reservePrice,
        auctionDuration,
        status,
        location,
        engine,
        transmission,
        fuelType,
        bodyType,
        driveType,
        color,
        condition,
        vin,
        customsCleared,
        recycled,
        technicalInspectionValid,
        technicalInspectionDate,
        tinted,
        tintingDate,
        batteryCapacity,
        electricRange
      } = req.body;
      let validatedAuctionDuration = 7;
      if (auctionDuration !== void 0) {
        const duration = parseFloat(auctionDuration);
        if (!isNaN(duration) && duration > 0) {
          validatedAuctionDuration = duration;
          console.log(`\u{1F4C5} \u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430 \u043B\u043E\u0442\u0430 ${listingId}: ${duration} \u0434\u043D\u0435\u0439`);
        }
      }
      const updateData = {
        make,
        model,
        year,
        mileage,
        description,
        startingPrice,
        reservePrice,
        auctionDuration: validatedAuctionDuration,
        status,
        location,
        engine,
        transmission,
        fuelType,
        bodyType,
        driveType,
        color,
        condition,
        vin,
        customsCleared,
        recycled,
        technicalInspectionValid,
        technicalInspectionDate,
        tinted,
        tintingDate,
        batteryCapacity,
        electricRange
      };
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === void 0) {
          delete updateData[key];
        }
      });
      const listing = await storage2.updateListing(listingId, updateData);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      clearAllCaches();
      res.json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Failed to update listing" });
    }
  });
  app2.put("/api/admin/listings/:id/status", sanitizeInput, adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { status } = req.body;
      const listing = await storage2.updateListingStatus(listingId, status);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      clearAllCaches();
      if (status === "active") {
        try {
          console.log("\u{1F514} \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u043E! \u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043D\u044B\u0435 \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u044B\u0435 \u0437\u0430\u043F\u0440\u043E\u0441\u044B \u0434\u043B\u044F:", listing.make, listing.model);
          const matchingAlerts = await storage2.checkAlertsForNewListing(listing);
          console.log("\u{1F4E7} \u041D\u0430\u0439\u0434\u0435\u043D\u043E \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0449\u0438\u0445 \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432:", matchingAlerts.length);
          for (const alert of matchingAlerts) {
            console.log("\u{1F4E8} \u0421\u043E\u0437\u0434\u0430\u0435\u043C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", alert.userId, "\u0437\u0430\u043F\u0440\u043E\u0441:", alert.id);
            const existingNotifications = await storage2.getNotificationsByUser(alert.userId);
            const duplicateExists = existingNotifications.some(
              (n) => n.type === "car_found" && n.listingId === listing.id && n.alertId === alert.id
            );
            if (!duplicateExists) {
              await storage2.createNotification({
                userId: alert.userId,
                title: "\u041D\u0430\u0439\u0434\u0435\u043D \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C \u043F\u043E \u0432\u0430\u0448\u0435\u043C\u0443 \u0437\u0430\u043F\u0440\u043E\u0441\u0443",
                message: `${listing.make.toUpperCase()} ${listing.model.toUpperCase()} ${listing.year} \u0433. - ${listing.startingPrice} \u0421\u043E\u043C\u043E\u043D\u0438 (\u043B\u043E\u0442 #${listing.lotNumber})`,
                type: "car_found",
                listingId: listing.id,
                alertId: alert.id,
                isRead: false
              });
              console.log("\u2705 \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", alert.userId);
            } else {
              console.log("\u26A0\uFE0F \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", alert.userId);
            }
          }
        } catch (alertError) {
          console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u043E \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0438:", alertError);
        }
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing status" });
    }
  });
  app2.get("/api/notifications/:userId", sanitizeInput, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log(`\u{1F514} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}`);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      const notifications3 = await storage2.getNotificationsByUser(userId);
      console.log(`\u{1F4E9} \u041D\u0430\u0439\u0434\u0435\u043D\u043E ${notifications3.length} \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}`);
      res.json(notifications3);
    } catch (error) {
      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${req.params.userId}:`, error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  app2.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage2.createNotification(validatedData);
      if (notification.userId) {
        console.log(`\u{1F680} \u041E\u0447\u0438\u0449\u0430\u0435\u043C \u043A\u044D\u0448 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${notification.userId} \u043F\u043E\u0441\u043B\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F`);
        clearCachePattern(`notifications_${notification.userId}`);
      }
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid notification data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create notification" });
    }
  });
  app2.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const success = await storage2.markNotificationAsRead(notificationId);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });
  app2.delete("/api/notifications/:id", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      console.log(`Attempting to delete notification with ID: ${notificationId}`);
      if (isNaN(notificationId)) {
        console.log(`Invalid notification ID: ${req.params.id}`);
        return res.status(400).json({ error: "Invalid notification ID" });
      }
      const success = await storage2.deleteNotification(notificationId);
      console.log(`Delete notification result: ${success}`);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });
  app2.get("/api/notifications/:userId/unread-count", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const count = await storage2.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });
  app2.get("/api/car-alerts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const cacheKey = `car-alerts-${userId}`;
      const alerts = await storage2.getCarAlertsByUser(userId);
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      });
      res.json(alerts);
    } catch (error) {
      console.error("Error in car-alerts route:", error);
      res.status(500).json({ error: "Failed to fetch car alerts" });
    }
  });
  app2.post("/api/car-alerts", async (req, res) => {
    try {
      console.log("Creating car alert with data:", req.body);
      const validatedData = insertCarAlertSchema.parse(req.body);
      const alert = await storage2.createCarAlert(validatedData);
      clearCachePattern(`car-alerts-${validatedData.userId}`);
      console.log("Car alert created successfully:", alert);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating car alert:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid alert data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create alert" });
    }
  });
  app2.delete("/api/car-alerts/:id", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const success = await storage2.deleteCarAlert(alertId);
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }
      clearCachePattern("car-alerts-");
      clearAllCaches();
      console.log(`Deleted car alert ${alertId}, changes: 1`);
      res.status(204).send();
    } catch (error) {
      console.error("Error in DELETE car-alerts route:", error);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });
  app2.get("/api/banners", async (req, res) => {
    try {
      const { position } = req.query;
      const cacheKey = `banners_${position || "all"}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      const banners2 = await storage2.getBanners(position);
      setCache(cacheKey, banners2);
      res.json(banners2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });
  app2.post("/api/admin/banners", sanitizeInput, adminAuth, async (req, res) => {
    try {
      const bannerData = insertBannerSchema.parse(req.body);
      const banner = await storage2.createBanner(bannerData);
      clearCachePattern("banners");
      res.status(201).json(banner);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create banner" });
    }
  });
  app2.put("/api/admin/banners/:id", sanitizeInput, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bannerData = insertBannerSchema.partial().parse(req.body);
      const banner = await storage2.updateBanner(id, bannerData);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      clearCachePattern("banners");
      res.json(banner);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update banner" });
    }
  });
  app2.get("/api/admin/banners", adminAuth, async (req, res) => {
    try {
      const banners2 = await storage2.getBanners();
      res.json(banners2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });
  app2.delete("/api/admin/banners/:id", sanitizeInput, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage2.deleteBanner(id);
      if (!success) {
        return res.status(404).json({ error: "Banner not found" });
      }
      clearCachePattern("banners");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete banner" });
    }
  });
  app2.get("/api/sell-car-section", async (req, res) => {
    try {
      const section = await storage2.getSellCarSection();
      res.json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sell car section" });
    }
  });
  app2.put("/api/admin/sell-car-section", sanitizeInput, adminAuth, async (req, res) => {
    try {
      const validatedData = req.body;
      const section = await storage2.updateSellCarSection(validatedData);
      res.json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sell car section" });
    }
  });
  app2.get("/api/advertisement-carousel", async (req, res) => {
    try {
      const cacheKey = "advertisement_carousel";
      const cached = getCached(cacheKey);
      if (cached) {
        console.log(`\u{1F4CB} \u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u043C \u043A\u044D\u0448\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u043A\u0430\u0440\u0443\u0441\u0435\u043B\u0438: ${cached.length} \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432`);
        return res.json(cached);
      }
      const carousel = await storage2.getAdvertisementCarousel();
      console.log(`\u{1F4CB} \u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B \u0441\u0432\u0435\u0436\u0438\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u043A\u0430\u0440\u0443\u0441\u0435\u043B\u0438 \u0438\u0437 \u0411\u0414: ${carousel.length} \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432`);
      setCache(cacheKey, carousel);
      res.json(carousel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisement carousel" });
    }
  });
  app2.get("/api/admin/advertisement-carousel", adminAuth, async (req, res) => {
    try {
      const carousel = await storage2.getAdvertisementCarouselAll ? await storage2.getAdvertisementCarouselAll() : await storage2.getAdvertisementCarousel();
      res.json(carousel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisement carousel" });
    }
  });
  app2.post("/api/admin/advertisement-carousel", sanitizeInput, adminAuth, async (req, res) => {
    try {
      const item = await storage2.createAdvertisementCarouselItem(req.body);
      clearCachePattern("advertisement_carousel");
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create carousel item" });
    }
  });
  app2.get("/api/admin/advertisement-carousel/:id", sanitizeInput, adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage2.getAdvertisementCarouselItem(id);
      if (!item) {
        return res.status(404).json({ error: "Carousel item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to get carousel item" });
    }
  });
  app2.put("/api/admin/advertisement-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`\u{1F504} \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u043E\u0439 \u043A\u0430\u0440\u0443\u0441\u0435\u043B\u0438 ID: ${id}`);
      console.log(`\u{1F4DD} \u0414\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F:`, req.body);
      const item = await storage2.updateAdvertisementCarouselItem(id, req.body);
      if (!item) {
        console.log(`\u274C \u042D\u043B\u0435\u043C\u0435\u043D\u0442 \u043A\u0430\u0440\u0443\u0441\u0435\u043B\u0438 \u0441 ID ${id} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D`);
        return res.status(404).json({ error: "Carousel item not found" });
      }
      console.log(`\u2705 \u042D\u043B\u0435\u043C\u0435\u043D\u0442 \u043A\u0430\u0440\u0443\u0441\u0435\u043B\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D:`, item);
      clearCachePattern("advertisement_carousel");
      res.json(item);
    } catch (error) {
      console.error(`\u{1F4A5} \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043A\u0430\u0440\u0443\u0441\u0435\u043B\u0438:`, error);
      res.status(500).json({ error: "Failed to update carousel item" });
    }
  });
  app2.delete("/api/admin/advertisement-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage2.deleteAdvertisementCarouselItem(id);
      if (!deleted) {
        return res.status(404).json({ error: "Carousel item not found" });
      }
      clearCachePattern("advertisement_carousel");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete carousel item" });
    }
  });
  app2.get("/api/sell-car-banner", async (req, res) => {
    try {
      const cacheKey = "sell_car_banner";
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      const banner = await storage2.getSellCarBanner();
      if (!banner) {
        const defaultBanner = await storage2.createSellCarBanner({
          title: "\u041F\u0440\u043E\u0434\u0430\u0439 \u0441\u0432\u043E\u0435 \u0430\u0432\u0442\u043E",
          description: "\u041F\u043E\u043B\u0443\u0447\u0438 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0443\u044E \u0446\u0435\u043D\u0443 \u0437\u0430 \u0441\u0432\u043E\u0439 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C \u043D\u0430 \u043D\u0430\u0448\u0435\u043C \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0435",
          buttonText: "\u041D\u0430\u0447\u0430\u0442\u044C \u043F\u0440\u043E\u0434\u0430\u0436\u0443",
          linkUrl: "/sell",
          backgroundImageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=300&fit=crop",
          gradientFrom: "#059669",
          gradientTo: "#047857",
          textColor: "#ffffff",
          isActive: true,
          overlayOpacity: 60
        });
        setCache(cacheKey, defaultBanner);
        return res.json(defaultBanner);
      }
      setCache(cacheKey, banner);
      res.json(banner);
    } catch (error) {
      console.error("\u{1F4A5} \u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0431\u0430\u043D\u0435\u0440\u0430 sell-car-banner:", error);
      res.status(500).json({ error: "Failed to fetch sell car banner" });
    }
  });
  app2.put("/api/admin/sell-car-banner", async (req, res) => {
    try {
      console.log("\u{1F527} \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0431\u0430\u043D\u0435\u0440\u0430 sell-car-banner:", req.body);
      const bannerData = req.body;
      const banner = await storage2.updateSellCarBanner(bannerData);
      if (!banner) {
        console.log("\u274C \u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0431\u0430\u043D\u0435\u0440 sell-car-banner");
        return res.status(404).json({ error: "Failed to update sell car banner" });
      }
      console.log("\u2705 \u0411\u0430\u043D\u0435\u0440 sell-car-banner \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D:", banner);
      cache.delete("sell_car_banner");
      console.log("\u{1F5D1}\uFE0F \u041A\u044D\u0448 sell_car_banner \u043F\u0440\u0438\u043D\u0443\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u043E\u0447\u0438\u0449\u0435\u043D");
      res.json(banner);
    } catch (error) {
      console.error("\u{1F4A5} \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0431\u0430\u043D\u0435\u0440\u0430 sell-car-banner:", error);
      res.status(500).json({ error: "Failed to update sell car banner" });
    }
  });
  app2.get("/api/documents", async (req, res) => {
    try {
      const type = req.query.type;
      const documents2 = await storage2.getDocuments(type);
      res.json(documents2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });
  app2.get("/api/admin/documents", async (req, res) => {
    try {
      const type = req.query.type;
      const documents2 = await storage2.getDocuments(type);
      res.json(documents2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });
  app2.get("/api/admin/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage2.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });
  app2.post("/api/admin/documents", async (req, res) => {
    try {
      const document = await storage2.createDocument(req.body);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document" });
    }
  });
  app2.put("/api/admin/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage2.updateDocument(id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });
  app2.delete("/api/admin/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage2.deleteDocument(id);
      if (!deleted) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });
  app2.get("/api/admin/users", adminAuth, async (req, res) => {
    try {
      const users2 = await storage2.getAllUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.put("/api/admin/users/:id/status", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      const user = await storage2.updateUserStatus(userId, isActive);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });
  app2.get("/api/admin/users/:id", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage2.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`\u{1F527} \u0410\u0414\u041C\u0418\u041D: \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}:`, req.body);
      const { fullName, email, phoneNumber, username, profilePhoto } = req.body;
      const updateData = {};
      if (fullName !== void 0) updateData.fullName = fullName;
      if (email !== void 0) updateData.email = email;
      if (phoneNumber !== void 0) updateData.phoneNumber = phoneNumber;
      if (username !== void 0) updateData.username = username;
      if (profilePhoto !== void 0) updateData.profilePhoto = profilePhoto;
      console.log(`\u{1F4DD} \u0410\u0414\u041C\u0418\u041D: \u0414\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F:`, updateData);
      const user = await storage2.updateUserProfile(userId, updateData);
      if (!user) {
        console.log(`\u274C \u0410\u0414\u041C\u0418\u041D: \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${userId} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D`);
        return res.status(404).json({ error: "User not found" });
      }
      console.log(`\u2705 \u0410\u0414\u041C\u0418\u041D: \u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D`);
      res.json(user);
    } catch (error) {
      console.error("\u274C \u0410\u0414\u041C\u0418\u041D: \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u0440\u043E\u0444\u0438\u043B\u044F:", error);
      res.status(500).json({
        error: "Failed to update user profile",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.delete("/api/admin/users/:id", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`Attempting to delete user ${userId}`);
      const deleted = await storage2.deleteUser(userId);
      if (!deleted) {
        console.log(`User ${userId} not found for deletion`);
        return res.status(404).json({ error: "User not found" });
      }
      console.log(`User ${userId} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user: " + (error instanceof Error ? error.message : "Unknown error") });
    }
  });
  app2.get("/api/admin/users/:id/listings", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const listings = await storage2.getListingsBySeller(userId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user listings" });
    }
  });
  app2.get("/api/admin/users/:id/documents", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`\u{1F4CB} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}`);
      const documents2 = await storage2.getUserDocuments(userId);
      console.log(`\u{1F4C4} \u041D\u0430\u0439\u0434\u0435\u043D\u043E \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432: ${documents2.length}`);
      res.json(documents2);
    } catch (error) {
      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch user documents: " + (error instanceof Error ? error.message : "Unknown error") });
    }
  });
  app2.post("/api/admin/users/:id/documents", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { type, title, content, fileUrl } = req.body;
      const document = await storage2.createDocument({
        userId,
        type,
        title,
        content,
        fileUrl
      });
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document" });
    }
  });
  app2.delete("/api/admin/users/:userId/documents/:documentId", adminAuth, async (req, res) => {
    try {
      console.log("\u{1F5D1}\uFE0F \u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430:", {
        userId: req.params.userId,
        documentId: req.params.documentId,
        parsedDocumentId: parseInt(req.params.documentId)
      });
      const documentId = parseInt(req.params.documentId);
      if (isNaN(documentId)) {
        console.log("\u274C \u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ID \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430:", req.params.documentId);
        return res.status(400).json({ error: "Invalid document ID" });
      }
      const deleted = await storage2.deleteDocument(documentId);
      console.log("\u{1F5D1}\uFE0F \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430:", { documentId, deleted });
      if (!deleted) {
        console.log("\u274C \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D:", documentId);
        return res.status(404).json({ error: "Document not found" });
      }
      console.log("\u2705 \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0443\u0434\u0430\u043B\u0435\u043D:", documentId);
      res.status(204).send();
    } catch (error) {
      console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });
  app2.get("/api/admin/listings", adminAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const listings = await storage2.getListingsByStatus(status || "pending");
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });
  app2.get("/api/admin/listings/pending-approval", adminAuth, async (req, res) => {
    try {
      console.log("\u{1F4CB} \u0417\u0430\u043F\u0440\u043E\u0441 \u043D\u0430 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044E \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0439...");
      const listings = await storage2.getListingsByStatus("pending");
      console.log(`\u{1F4CB} \u041D\u0430\u0439\u0434\u0435\u043D\u043E ${listings.length} \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0439 \u043D\u0430 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044E`);
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.json(listings);
    } catch (error) {
      console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0439 \u043D\u0430 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044E:", error);
      res.status(500).json({ error: "Failed to fetch pending approval listings" });
    }
  });
  app2.post("/api/admin/listings/:id/approve", adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage2.updateListingStatus(listingId, "active");
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      clearAllCaches();
      try {
        console.log("\u{1F514} \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u043E \u0447\u0435\u0440\u0435\u0437 /approve! \u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043D\u044B\u0435 \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u044B\u0435 \u0437\u0430\u043F\u0440\u043E\u0441\u044B \u0434\u043B\u044F:", listing.make, listing.model);
        const matchingAlerts = await storage2.checkAlertsForNewListing(listing);
        console.log("\u{1F4E7} \u041D\u0430\u0439\u0434\u0435\u043D\u043E \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0449\u0438\u0445 \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432:", matchingAlerts.length);
        for (const alert of matchingAlerts) {
          console.log("\u{1F4E8} \u0421\u043E\u0437\u0434\u0430\u0435\u043C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", alert.userId, "\u0437\u0430\u043F\u0440\u043E\u0441:", alert.id);
          const existingNotifications = await storage2.getNotificationsByUser(alert.userId);
          const duplicateExists = existingNotifications.some(
            (n) => n.type === "car_found" && n.listingId === listing.id && n.alertId === alert.id
          );
          if (!duplicateExists) {
            await storage2.createNotification({
              userId: alert.userId,
              title: "\u041D\u0430\u0439\u0434\u0435\u043D \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C \u043F\u043E \u0432\u0430\u0448\u0435\u043C\u0443 \u0437\u0430\u043F\u0440\u043E\u0441\u0443",
              message: `${listing.make.toUpperCase()} ${listing.model.toUpperCase()} ${listing.year} \u0433. - ${listing.startingPrice} \u0421\u043E\u043C\u043E\u043D\u0438 (\u043B\u043E\u0442 #${listing.lotNumber})`,
              type: "car_found",
              listingId: listing.id,
              alertId: alert.id,
              isRead: false
            });
            console.log("\u2705 \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", alert.userId);
          } else {
            console.log("\u26A0\uFE0F \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", alert.userId);
          }
        }
        if (matchingAlerts.length > 0) {
          console.log(`\u{1F3AF} \u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u044B \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0434\u043B\u044F ${matchingAlerts.length} \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 \u0441 \u043F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0438\u043C\u0438 \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u044B\u043C\u0438 \u0437\u0430\u043F\u0440\u043E\u0441\u0430\u043C\u0438`);
        }
      } catch (alertError) {
        console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435 \u043F\u043E\u0438\u0441\u043A\u043E\u0432\u044B\u0445 \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432:", alertError);
      }
      await updateListingsCache();
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve listing" });
    }
  });
  app2.post("/api/admin/listings/:id/reject", adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage2.updateListingStatus(listingId, "rejected");
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      clearAllCaches();
      await updateListingsCache();
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject listing" });
    }
  });
  app2.delete("/api/admin/listings/:id", (req, res, next) => {
    console.log("\u{1F5D1}\uFE0F DELETE request received with headers:", {
      "x-user-id": req.headers["x-user-id"],
      "x-user-email": req.headers["x-user-email"],
      "content-type": req.headers["content-type"],
      "user-agent": req.headers["user-agent"]?.substring(0, 50)
    });
    adminAuth(req, res, next);
  }, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      console.log("\u2705 Admin authenticated, proceeding to delete listing:", listingId);
      const success = await storage2.deleteListing(listingId);
      if (!success) {
        return res.status(404).json({ error: "Listing not found" });
      }
      clearAllCaches();
      await updateListingsCache();
      console.log("\u2705 Listing deleted successfully:", listingId);
      res.json({ success: true, message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ error: "Failed to delete listing" });
    }
  });
  app2.put("/api/admin/listings/:id/status", adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { status } = req.body;
      const listing = await storage2.updateListingStatus(listingId, status);
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing status" });
    }
  });
  app2.post("/api/admin/users/create", adminAuth, async (req, res) => {
    try {
      const { phoneNumber, fullName, role = "buyer", isActive = false, sendSMS = true } = req.body;
      console.log("\u{1F4DD} \u0410\u0414\u041C\u0418\u041D: \u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043D\u043E\u0432\u043E\u0433\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", { phoneNumber, fullName, role, isActive, sendSMS });
      if (!phoneNumber || !fullName) {
        return res.status(400).json({ error: "Phone number and full name are required" });
      }
      const normalizedPhone = phoneNumber.replace(/[^\d+]/g, "");
      console.log(`\u{1F4F1} \u041D\u043E\u0440\u043C\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u043D\u043E\u043C\u0435\u0440\u0430: ${phoneNumber} \u2192 ${normalizedPhone}`);
      const email = `${normalizedPhone}@autoauction.tj`;
      const existingUser = await storage2.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User with this phone number already exists" });
      }
      const user = await storage2.createUser({
        email,
        username: fullName,
        fullName,
        phoneNumber: normalizedPhone,
        role,
        isActive
      });
      console.log(`\u2705 \u0410\u0414\u041C\u0418\u041D: \u0421\u043E\u0437\u0434\u0430\u043D \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${user.id} (${user.email})`);
      if (sendSMS) {
        const smsMessage = "AutoBid.tj: \u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430! \u0421\u043A\u0430\u0447\u0430\u0439\u0442\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432 Play Market \u0438\u043B\u0438 App Store \u0438 \u0443\u0447\u0430\u0441\u0442\u0432\u0443\u0439\u0442\u0435 \u0432 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430\u0445. \u0412\u044B\u0433\u043E\u0434\u043D\u044B\u0435 \u0446\u0435\u043D\u044B \u043A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C!";
        try {
          console.log(`\u{1F4F1} \u0410\u0414\u041C\u0418\u041D: \u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043D\u0430 ${normalizedPhone}`);
          const smsResult = await sendSMSNotification(normalizedPhone, smsMessage);
          if (smsResult.success) {
            console.log(`\u2705 \u0410\u0414\u041C\u0418\u041D: SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${user.id}`);
          } else {
            console.warn(`\u26A0\uFE0F \u0410\u0414\u041C\u0418\u041D: \u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C SMS \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${user.id}: ${smsResult.message}`);
          }
        } catch (smsError) {
          console.error(`\u274C \u0410\u0414\u041C\u0418\u041D: \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 SMS \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${user.id}:`, smsError);
        }
      }
      res.status(201).json({
        user,
        smsMessage: sendSMS ? "SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E" : "SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043D\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u043B\u043E\u0441\u044C"
      });
    } catch (error) {
      console.error("\u274C \u0410\u0414\u041C\u0418\u041D: \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:", error);
      res.status(500).json({
        error: "Failed to create user",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/admin/stats", adminAuth, async (req, res) => {
    try {
      const stats = await storage2.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });
  app2.post("/api/admin/migrate-photos", adminAuth, async (req, res) => {
    try {
      console.log("\u{1F680} \u0410\u0434\u043C\u0438\u043D \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u043B \u043C\u0438\u0433\u0440\u0430\u0446\u0438\u044E \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0439 \u0432 \u0444\u0430\u0439\u043B\u043E\u0432\u0443\u044E \u0441\u0438\u0441\u0442\u0435\u043C\u0443");
      const result = await migratePhotosToFileSystem();
      res.json({
        success: true,
        message: "\u041C\u0438\u0433\u0440\u0430\u0446\u0438\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E",
        migrated: result.migrated,
        skipped: result.skipped
      });
    } catch (error) {
      console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043C\u0438\u0433\u0440\u0430\u0446\u0438\u0438:", error);
      res.status(500).json({
        error: "Failed to migrate photos",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/admin/photo-storage-status", adminAuth, async (req, res) => {
    try {
      const allListings = await db.select({ id: carListings.id, photos: carListings.photos }).from(carListings);
      let fileSystemCount = 0;
      let base64Count = 0;
      let noPhotosCount = 0;
      const listingDetails = [];
      for (const listing of allListings) {
        if (!listing.photos || !Array.isArray(listing.photos) || listing.photos.length === 0) {
          noPhotosCount++;
          listingDetails.push({
            id: listing.id,
            status: "no_photos",
            photoCount: 0
          });
          continue;
        }
        const hasBase64Photos = listing.photos.some(
          (photo) => typeof photo === "string" && photo.startsWith("data:image/")
        );
        if (hasBase64Photos) {
          base64Count++;
          listingDetails.push({
            id: listing.id,
            status: "base64",
            photoCount: listing.photos.length
          });
        } else {
          fileSystemCount++;
          listingDetails.push({
            id: listing.id,
            status: "filesystem",
            photoCount: listing.photos.length
          });
        }
      }
      res.json({
        total: allListings.length,
        fileSystem: fileSystemCount,
        base64: base64Count,
        noPhotos: noPhotosCount,
        migrationNeeded: base64Count > 0,
        details: listingDetails
      });
    } catch (error) {
      console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430:", error);
      res.status(500).json({ error: "Failed to check storage status" });
    }
  });
  app2.post("/api/admin/listings/:id/end-auction", adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage2.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      const bids2 = await storage2.getBidsForListing(listingId);
      if (bids2.length === 0) {
        await storage2.updateListingStatus(listingId, "ended");
        return res.json({ message: "Auction ended without bids" });
      }
      const winningBid = bids2.reduce(
        (highest, current) => parseFloat(current.amount) > parseFloat(highest.amount) ? current : highest
      );
      await storage2.updateListingStatus(listingId, "ended");
      const win = await storage2.createUserWin({
        userId: winningBid.bidderId,
        listingId,
        winningBid: winningBid.amount
      });
      await storage2.createNotification({
        userId: winningBid.bidderId,
        type: "auction_won",
        title: "\u{1F3C6} \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C \u0441 \u043F\u043E\u0431\u0435\u0434\u043E\u0439!",
        message: `\u0412\u044B \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listing.make} ${listing.model} \u0441\u043E \u0441\u0442\u0430\u0432\u043A\u043E\u0439 ${parseFloat(winningBid.amount).toLocaleString()} \u0421\u043E\u043C\u043E\u043D\u0438 (\u043B\u043E\u0442 #${listing.lotNumber})`,
        listingId,
        isRead: false
      });
      try {
        const winner = await storage2.getUserById(winningBid.bidderId);
        if (winner?.phoneNumber) {
          const smsMessage = `\u{1F3C6} \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C! \u0412\u044B \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listing.make} ${listing.model} ${listing.year} \u0433. \u0441\u043E \u0441\u0442\u0430\u0432\u043A\u043E\u0439 ${parseFloat(winningBid.amount).toLocaleString()} \u0421\u043E\u043C\u043E\u043D\u0438 (\u043B\u043E\u0442 #${listing.lotNumber}). AutoBid.TJ`;
          await sendSMSNotification(winner.phoneNumber, smsMessage);
          console.log(`\u{1F4F1} SMS \u043E \u0432\u044B\u0438\u0433\u0440\u044B\u0448\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${winningBid.bidderId} \u043D\u0430 \u043D\u043E\u043C\u0435\u0440 ${winner.phoneNumber}`);
        }
      } catch (error) {
        console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 SMS \u043F\u043E\u0431\u0435\u0434\u0438\u0442\u0435\u043B\u044E:`, error);
      }
      const uniqueBidders = Array.from(new Set(bids2.map((bid) => bid.bidderId)));
      for (const bidderId of uniqueBidders) {
        if (bidderId !== winningBid.bidderId) {
          await storage2.createNotification({
            userId: bidderId,
            title: "\u0410\u0443\u043A\u0446\u0438\u043E\u043D \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D",
            message: `\u041A \u0441\u043E\u0436\u0430\u043B\u0435\u043D\u0438\u044E, \u0432\u044B \u043D\u0435 \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listing.make} ${listing.model} ${listing.year} \u0433. (\u043B\u043E\u0442 #${listing.lotNumber}). \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0432 \u0434\u0440\u0443\u0433\u0438\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430\u0445!`,
            type: "auction_lost",
            listingId,
            isRead: false
          });
          try {
            const loser = await storage2.getUserById(bidderId);
            if (loser?.phoneNumber) {
              const smsMessage = `\u0410\u0443\u043A\u0446\u0438\u043E\u043D \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D. \u041A \u0441\u043E\u0436\u0430\u043B\u0435\u043D\u0438\u044E, \u0432\u044B \u043D\u0435 \u0432\u044B\u0438\u0433\u0440\u0430\u043B\u0438 \u0430\u0443\u043A\u0446\u0438\u043E\u043D ${listing.make} ${listing.model} ${listing.year} \u0433. (\u043B\u043E\u0442 #${listing.lotNumber}). \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0432 \u0434\u0440\u0443\u0433\u0438\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430\u0445! AutoBid.TJ`;
              await sendSMSNotification(loser.phoneNumber, smsMessage);
              console.log(`\u{1F4F1} SMS \u043E \u043F\u0440\u043E\u0438\u0433\u0440\u044B\u0448\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E ${bidderId} \u043D\u0430 \u043D\u043E\u043C\u0435\u0440 ${loser.phoneNumber}`);
            }
          } catch (error) {
            console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 SMS \u043F\u0440\u043E\u0438\u0433\u0440\u0430\u0432\u0448\u0435\u043C\u0443 ${bidderId}:`, error);
          }
        }
      }
      await storage2.updateListingStatus(listingId, "archived");
      clearCachePattern("/api/listings");
      clearCachePattern("/api/users");
      res.json({
        message: "Auction ended successfully and archived",
        winner: winningBid.bidderId,
        winningAmount: winningBid.amount,
        win
      });
    } catch (error) {
      console.error("Error ending auction:", error);
      res.status(500).json({ error: "Failed to end auction" });
    }
  });
  app2.post("/api/admin/notifications/broadcast", adminAuth, async (req, res) => {
    try {
      const { title, message, type = "system" } = req.body;
      const users2 = await storage2.getAllUsers();
      const notifications3 = await Promise.all(
        users2.map(
          (user) => storage2.createNotification({
            userId: user.id,
            type,
            title,
            message,
            isRead: false
          })
        )
      );
      res.json({ sent: notifications3.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to send broadcast notification" });
    }
  });
  app2.post("/api/auth/send-sms", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      const normalizedPhone = phoneNumber.replace(/[^\d+]/g, "");
      console.log(`\u{1F4F1} \u041D\u043E\u0440\u043C\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u043D\u043E\u043C\u0435\u0440\u0430: ${phoneNumber} \u2192 ${normalizedPhone}`);
      const verificationCode = Math.floor(1e5 + Math.random() * 9e5).toString();
      const cacheKey = `sms_code_${normalizedPhone}`;
      const cacheData = {
        code: verificationCode,
        timestamp: Date.now(),
        attempts: 0
      };
      cache.set(cacheKey, cacheData);
      console.log(`\u{1F4BE} \u041A\u043E\u0434 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D \u0432 \u043A\u044D\u0448\u0435:`, {
        key: cacheKey,
        code: verificationCode,
        timestamp: cacheData.timestamp,
        phoneNumber: normalizedPhone
      });
      console.log(`SMS Code for ${phoneNumber}: ${verificationCode}`);
      const smsResult = await sendSMSCode(normalizedPhone, verificationCode);
      if (smsResult.success) {
        res.json({
          success: true,
          message: "SMS \u043A\u043E\u0434 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D"
        });
      } else {
        res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 SMS" });
      }
    } catch (error) {
      console.error("SMS sending error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u043F\u0440\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0435 SMS" });
    }
  });
  app2.post("/api/auth/verify-sms", async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;
      if (!phoneNumber || !code) {
        return res.status(400).json({ error: "Phone number and code are required" });
      }
      const normalizedPhone = phoneNumber.replace(/[^\d+]/g, "");
      console.log(`\u{1F4F1} \u041D\u043E\u0440\u043C\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u043D\u043E\u043C\u0435\u0440\u0430 \u043F\u0440\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435: ${phoneNumber} \u2192 ${normalizedPhone}`);
      const cacheKey = `sms_code_${normalizedPhone}`;
      console.log(`\u{1F50D} \u041F\u043E\u0438\u0441\u043A \u043A\u043E\u0434\u0430 \u0432 \u043A\u044D\u0448\u0435 \u0441 \u043A\u043B\u044E\u0447\u043E\u043C: ${cacheKey}`);
      const cachedData = cache.get(cacheKey);
      if (!cachedData) {
        return res.status(400).json({ error: "\u041A\u043E\u0434 \u0438\u0441\u0442\u0435\u043A \u0438\u043B\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
      }
      const { code: storedCode, timestamp: timestamp2, attempts } = cachedData;
      console.log(`\u{1F50D} \u0414\u0430\u043D\u043D\u044B\u0435 \u0438\u0437 \u043A\u044D\u0448\u0430:`, {
        storedCode,
        enteredCode: code,
        storedCodeType: typeof storedCode,
        enteredCodeType: typeof code,
        timestamp: timestamp2,
        attempts
      });
      if (Date.now() - timestamp2 > 6e5) {
        cache.delete(cacheKey);
        return res.status(400).json({ error: "\u041A\u043E\u0434 \u0438\u0441\u0442\u0435\u043A" });
      }
      if (attempts >= 3) {
        cache.delete(cacheKey);
        return res.status(400).json({ error: "\u041F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u043E \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043F\u043E\u043F\u044B\u0442\u043E\u043A" });
      }
      const normalizedStoredCode = String(storedCode).trim();
      const normalizedEnteredCode = String(code).trim();
      console.log(`\u{1F50D} \u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u043A\u043E\u0434\u043E\u0432:`, {
        normalizedStoredCode,
        normalizedEnteredCode,
        isEqual: normalizedStoredCode === normalizedEnteredCode
      });
      if (normalizedEnteredCode !== normalizedStoredCode) {
        cache.set(cacheKey, {
          ...cachedData,
          attempts: attempts + 1
        });
        console.log(`\u274C \u041A\u043E\u0434\u044B \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0442: \u0432\u0432\u0435\u0434\u0435\u043D "${normalizedEnteredCode}", \u043E\u0436\u0438\u0434\u0430\u043B\u0441\u044F "${normalizedStoredCode}"`);
        return res.status(400).json({ error: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043E\u0434" });
      }
      cache.delete(cacheKey);
      const emailFromPhone = normalizedPhone.replace(/\D/g, "") + "@autoauction.tj";
      let user = await storage2.getUserByEmail(emailFromPhone);
      if (!user) {
        const cleanPhone = normalizedPhone.replace(/\D/g, "");
        const allUsers = await storage2.getAllUsers();
        const existingUserByPhone = allUsers.find((u) => {
          if (!u.phoneNumber) return false;
          const existingCleanPhone = u.phoneNumber.replace(/\D/g, "");
          return existingCleanPhone === cleanPhone;
        });
        if (existingUserByPhone) {
          console.log(`\u26A0\uFE0F \u041D\u0430\u0439\u0434\u0435\u043D \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0439 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0441 \u043D\u043E\u043C\u0435\u0440\u043E\u043C ${normalizedPhone}: ID ${existingUserByPhone.id}`);
          return res.json({
            success: true,
            message: "\u041A\u043E\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D",
            phoneNumber: normalizedPhone,
            user: {
              id: existingUserByPhone.id,
              email: existingUserByPhone.email,
              isActive: existingUserByPhone.isActive
            }
          });
        }
      }
      if (!user) {
        const adminPhoneNumbers = ["+992903331332", "+992 (90) 333-13-32"];
        const isAdminPhone = adminPhoneNumbers.some(
          (adminPhone) => normalizedPhone.replace(/\D/g, "") === adminPhone.replace(/\D/g, "")
        );
        if (isAdminPhone) {
          console.log(`\u26A0\uFE0F \u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 \u0441 \u0430\u0434\u043C\u0438\u043D\u0441\u043A\u0438\u043C \u043D\u043E\u043C\u0435\u0440\u043E\u043C: ${normalizedPhone}`);
          return res.status(400).json({
            error: "\u042D\u0442\u043E\u0442 \u043D\u043E\u043C\u0435\u0440 \u0437\u0430\u0440\u0435\u0437\u0435\u0440\u0432\u0438\u0440\u043E\u0432\u0430\u043D \u0434\u043B\u044F \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438"
          });
        }
        console.log(`Creating new inactive user for phone: ${normalizedPhone}`);
        user = await storage2.createUser({
          email: emailFromPhone,
          username: normalizedPhone,
          phoneNumber: normalizedPhone,
          // Добавляем номер телефона в отдельное поле
          fullName: `\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${normalizedPhone}`,
          // Временное имя вместо null
          isActive: false,
          // По умолчанию все новые пользователи неактивны
          role: "buyer"
        });
        console.log(`Created new user with ID: ${user.id}, isActive: ${user.isActive}`);
      }
      res.json({
        success: true,
        message: "\u041A\u043E\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D",
        phoneNumber: normalizedPhone,
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error("SMS verification error:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u043F\u0440\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435 \u043A\u043E\u0434\u0430" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage2.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Failed to fetch all users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.patch("/api/admin/users/:id/status", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const user = await storage2.updateUserStatus(userId, isActive);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Failed to update user status:", error);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });
  app2.get("/api/admin/listings", requireAdmin, async (req, res) => {
    try {
      const listings = await storage2.getListingsByStatus("", 1e3);
      res.json(listings);
    } catch (error) {
      console.error("Failed to fetch all listings:", error);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });
  app2.patch("/api/admin/listings/:id/status", requireAdmin, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { status } = req.body;
      console.log(`\u{1F527} \u0410\u0414\u041C\u0418\u041D: \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listingId} \u043D\u0430 "${status}"`);
      if (isNaN(listingId)) {
        return res.status(400).json({ error: "Invalid listing ID" });
      }
      if (!["pending", "active", "ended", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const listing = await storage2.updateListingStatus(listingId, status);
      if (!listing) {
        console.log(`\u274C \u0410\u0414\u041C\u0418\u041D: \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listingId} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E`);
        return res.status(404).json({ error: "Listing not found" });
      }
      clearAllCaches();
      console.log(`\u2705 \u0410\u0414\u041C\u0418\u041D: \u0421\u0442\u0430\u0442\u0443\u0441 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listingId} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0438\u0437\u043C\u0435\u043D\u0435\u043D \u043D\u0430 "${status}"`);
      res.json(listing);
    } catch (error) {
      console.error("\u274C \u0410\u0414\u041C\u0418\u041D: \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F:", error);
      res.status(500).json({ error: "Failed to update listing status" });
    }
  });
  app2.post("/api/admin/listings/:id/approve", requireAdmin, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      console.log(`\u{1F527} \u0410\u0414\u041C\u0418\u041D: \u041E\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0435 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listingId}`);
      if (isNaN(listingId)) {
        return res.status(400).json({ error: "Invalid listing ID" });
      }
      const listing = await storage2.updateListingStatus(listingId, "active");
      if (!listing) {
        console.log(`\u274C \u0410\u0414\u041C\u0418\u041D: \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listingId} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E \u0434\u043B\u044F \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F`);
        return res.status(404).json({ error: "Listing not found" });
      }
      clearAllCaches();
      console.log(`\u2705 \u0410\u0414\u041C\u0418\u041D: \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listingId} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u043E`);
      res.json(listing);
    } catch (error) {
      console.error("\u274C \u0410\u0414\u041C\u0418\u041D: \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F:", error);
      res.status(500).json({ error: "Failed to approve listing" });
    }
  });
  app2.post("/api/admin/listings/:id/reject", requireAdmin, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      console.log(`\u{1F527} \u0410\u0414\u041C\u0418\u041D: \u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u0435 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F ${listingId}`);
      if (isNaN(listingId)) {
        return res.status(400).json({ error: "Invalid listing ID" });
      }
      const listing = await storage2.updateListingStatus(listingId, "rejected");
      if (!listing) {
        console.log(`\u274C \u0410\u0414\u041C\u0418\u041D: \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listingId} \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E \u0434\u043B\u044F \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u044F`);
        return res.status(404).json({ error: "Listing not found" });
      }
      clearAllCaches();
      console.log(`\u2705 \u0410\u0414\u041C\u0418\u041D: \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 ${listingId} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u043E`);
      res.json(listing);
    } catch (error) {
      console.error("\u274C \u0410\u0414\u041C\u0418\u041D: \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u044F \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F:", error);
      res.status(500).json({ error: "Failed to reject listing" });
    }
  });
  app2.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage2.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });
  app2.get("/api/admin/wins", requireAdmin, async (req, res) => {
    try {
      const wins = await storage2.getAllWins();
      res.json(wins);
    } catch (error) {
      console.error("Failed to fetch admin wins:", error);
      res.status(500).json({ error: "Failed to fetch wins" });
    }
  });
  app2.post("/api/archive-expired", async (req, res) => {
    try {
      const archivedCount = await storage2.archiveExpiredListings();
      res.json({ success: true, archivedCount });
    } catch (error) {
      console.error("Error archiving expired listings:", error);
      res.status(500).json({ message: "Failed to archive expired listings" });
    }
  });
  app2.get("/api/archived-listings", async (req, res) => {
    try {
      const archivedListings = await storage2.getArchivedListings();
      res.json(archivedListings);
    } catch (error) {
      console.error("Error fetching archived listings:", error);
      res.status(500).json({ message: "Failed to fetch archived listings" });
    }
  });
  app2.post("/api/restart-listing/:id", getUserFromContext, adminAuth, async (req, res) => {
    try {
      console.log("\u{1F504} \u0417\u0430\u043F\u0440\u043E\u0441 \u043D\u0430 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430", req.params.id);
      const { id } = req.params;
      const listingId = parseInt(id);
      console.log("\u{1F504} \u0412\u044B\u0437\u044B\u0432\u0430\u0435\u043C storage.restartListing \u0434\u043B\u044F ID:", listingId);
      console.log("\u{1F50D} \u0422\u0438\u043F storage:", typeof storage2);
      console.log("\u{1F50D} \u0422\u0438\u043F storage.restartListing:", typeof storage2.restartListing);
      const newListing = await storage2.restartListing(listingId);
      console.log("\u{1F50D} \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 storage.restartListing:", newListing);
      if (!newListing) {
        console.log("\u274C \u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0430\u0443\u043A\u0446\u0438\u043E\u043D", listingId, "- \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E \u043D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u0441\u0442\u0430\u0442\u0443\u0441 \u0438\u043B\u0438 \u043E\u0448\u0438\u0431\u043A\u0430");
        return res.status(400).json({ error: "Failed to restart listing. Make sure the listing exists and is archived." });
      }
      console.log("\u2705 \u0410\u0443\u043A\u0446\u0438\u043E\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0449\u0435\u043D:", { oldId: listingId, newId: newListing.id, lotNumber: newListing.lotNumber });
      clearCachePattern("listings");
      res.json(newListing);
    } catch (error) {
      console.error("\u274C \u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u043A\u0435 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u0430:", error);
      res.status(500).json({ error: "Failed to restart listing due to server error" });
    }
  });
  app2.delete("/api/archived-listings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage2.deleteArchivedListing(parseInt(id));
      if (deleted === false) {
        return res.status(404).json({ message: "Listing not found or not archived" });
      }
      clearCachePattern("listings");
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting archived listing:", error);
      res.status(500).json({ message: "Failed to delete archived listing" });
    }
  });
  const httpServer = createServer(app2);
  wsManager = new websocket_default(httpServer);
  global.wsManager = wsManager;
  app2.post("/api/admin/process-expired", adminAuth, async (req, res) => {
    try {
      console.log("\u{1F504} \u041F\u0440\u0438\u043D\u0443\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u043E\u0432...");
      const processedCount = await storage2.processExpiredListings();
      console.log(`\u2705 \u041E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E ${processedCount} \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u043E\u0432`);
      if (processedCount > 0) {
        clearAllCaches();
      }
      res.json({
        success: true,
        processedCount,
        message: `\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E ${processedCount} \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u043E\u0432`
      });
    } catch (error) {
      console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u0440\u0438\u043D\u0443\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u043E\u0432:", error);
      res.status(500).json({ error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u043E\u0432" });
    }
  });
  setInterval(async () => {
    try {
      console.log("\u{1F504} \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u043E\u0432...");
      const processedCount = await storage2.processExpiredListings();
      if (processedCount > 0) {
        console.log(`\u2705 \u041E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E ${processedCount} \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u043E\u0432`);
        clearAllCaches();
      }
    } catch (error) {
      console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u043E\u0432:", error);
    }
  }, 5 * 60 * 1e3);
  console.log("\u{1F916} \u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0445 \u0430\u0443\u043A\u0446\u0438\u043E\u043D\u043E\u0432 \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u0430 (\u043A\u0430\u0436\u0434\u044B\u0435 5 \u043C\u0438\u043D\u0443\u0442)");
  app2.get("/api/conversations", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const userId = req.user.id;
      console.log(`\u{1F4E8} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043E\u043A \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}`);
      const conversations2 = await storage2.getConversationsByUser(userId);
      console.log(`\u2705 \u041D\u0430\u0439\u0434\u0435\u043D\u043E ${conversations2.length} \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043E\u043A \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}:`, conversations2.map((c) => ({
        id: c.id,
        listingId: c.listingId,
        otherUser: c.otherUser?.fullName || "N/A"
      })));
      res.json(conversations2);
    } catch (error) {
      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043E\u043A:`, error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });
  app2.post("/api/conversations", async (req, res) => {
    try {
      const { buyerId, sellerId, listingId } = req.body;
      console.log(`\u{1F50D} \u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438: buyerId=${buyerId}, sellerId=${sellerId}, listingId=${listingId}`);
      const existingConversation = await storage2.getConversationByParticipants(buyerId, sellerId, listingId);
      if (existingConversation) {
        console.log(`\u2705 \u041D\u0430\u0439\u0434\u0435\u043D\u0430 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0430\u044F \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0430:`, existingConversation);
        return res.json(existingConversation);
      }
      const conversation = await storage2.createConversation({ buyerId, sellerId, listingId });
      console.log(`\u2705 \u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u043D\u043E\u0432\u0430\u044F \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0430:`, conversation);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });
  app2.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      console.log(`\u{1F4E8} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438 ${conversationId}`);
      const messages2 = await storage2.getMessagesByConversation(conversationId);
      console.log(`\u2705 \u041D\u0430\u0439\u0434\u0435\u043D\u043E ${messages2.length} \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438 ${conversationId}`);
      res.json(messages2);
    } catch (error) {
      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438 ${req.params.conversationId}:`, error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  app2.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const { content, senderId } = req.body;
      console.log(`\u{1F4DD} \u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F: conversationId=${conversationId}, senderId=${senderId}, content="${content}"`);
      if (!senderId) {
        console.log("\u274C \u041E\u0448\u0438\u0431\u043A\u0430: senderId \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442");
        return res.status(400).json({ error: "User not authenticated" });
      }
      if (!content || content.trim() === "") {
        console.log("\u274C \u041E\u0448\u0438\u0431\u043A\u0430: content \u043F\u0443\u0441\u0442\u043E\u0439");
        return res.status(400).json({ error: "Message content is required" });
      }
      console.log(`\u{1F504} \u0428\u0410\u0413 1: \u0421\u043E\u0437\u0434\u0430\u0435\u043C \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0432 \u0431\u0430\u0437\u0435 \u0434\u0430\u043D\u043D\u044B\u0445`);
      const message = await storage2.createMessage({ conversationId, senderId, content });
      console.log(`\u2705 \u0428\u0410\u0413 1 \u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041D: \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u043E \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441 ID ${message.id}`);
      console.log(`\u{1F504} \u0428\u0410\u0413 5: \u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u043C \u0443\u0441\u043F\u0435\u0448\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0443`);
      res.status(201).json(message);
      console.log(`\u2705 \u0428\u0410\u0413 5 \u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041D: \u041E\u0442\u0432\u0435\u0442 201 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u043A\u043B\u0438\u0435\u043D\u0442\u0443 \u0443\u0441\u043F\u0435\u0448\u043D\u043E`);
      console.log(`\u{1F504} \u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \u043E\u0442\u0432\u0435\u0442\u0430`);
      setTimeout(async () => {
        try {
          console.log(`\u{1F504} \u0428\u0410\u0413 2: \u041F\u043E\u043B\u0443\u0447\u0430\u0435\u043C \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044E \u043E \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0435 ${conversationId}`);
          const conversation = await storage2.getConversationById(conversationId);
          console.log(`\u2705 \u0428\u0410\u0413 2 \u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041D: \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0430 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0430`, conversation ? "\u043D\u0430\u0439\u0434\u0435\u043D\u0430" : "\u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430");
          console.log(`\u{1F4CA} \u041F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0430:`, conversation ? { id: conversation.id, buyerId: conversation.buyerId, sellerId: conversation.sellerId } : "null");
          if (conversation) {
            const recipientId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;
            console.log(`\u{1F504} \u0428\u0410\u0413 3: \u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044E ${recipientId}`);
            console.log(`\u{1F4CA} \u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438: buyerId=${conversation.buyerId}, sellerId=${conversation.sellerId}, senderId=${senderId}`);
            try {
              if (global.wsManager) {
                const notificationSent = global.wsManager.notifyNewMessage(recipientId, {
                  conversationId,
                  message,
                  senderName: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C"
                });
                console.log(`\u2705 \u0428\u0410\u0413 3 \u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041D: WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E=${notificationSent} \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044E ${recipientId}`);
              } else {
                console.log(`\u26A0\uFE0F \u0428\u0410\u0413 3: global.wsManager \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D, \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u0435\u043C WebSocket \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435`);
              }
            } catch (wsError) {
              console.error(`\u274C \u0428\u0410\u0413 3 \u041E\u0428\u0418\u0411\u041A\u0410 WebSocket:`, wsError);
            }
          } else {
            console.log(`\u274C \u0428\u0410\u0413 2: \u041F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430 \u0434\u043B\u044F conversationId=${conversationId}, senderId=${senderId}`);
          }
        } catch (conversationError) {
          console.error(`\u274C \u0428\u0410\u0413 2 \u041E\u0428\u0418\u0411\u041A\u0410 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0438:`, conversationError);
        }
        try {
          console.log(`\u{1F504} \u0428\u0410\u0413 4: \u0421\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0435\u043C \u0434\u0435\u043C\u043E \u0444\u043B\u0430\u0433 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439`);
          resetMessageVisitedFlag();
          console.log(`\u2705 \u0428\u0410\u0413 4 \u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041D: \u0414\u0435\u043C\u043E \u0444\u043B\u0430\u0433 \u0441\u0431\u0440\u043E\u0448\u0435\u043D`);
        } catch (demoError) {
          console.error(`\u274C \u0428\u0410\u0413 4 \u041E\u0428\u0418\u0411\u041A\u0410 \u0434\u0435\u043C\u043E \u0444\u0443\u043D\u043A\u0446\u0438\u0438:`, demoError);
        }
        console.log(`\u2705 \u0412\u0421\u0415 \u0414\u041E\u041F\u041E\u041B\u041D\u0418\u0422\u0415\u041B\u042C\u041D\u042B\u0415 \u041E\u041F\u0415\u0420\u0410\u0426\u0418\u0418 \u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041D\u042B`);
      }, 10);
    } catch (error) {
      console.error("\u274C \u041A\u0420\u0418\u0422\u0418\u0427\u0415\u0421\u041A\u0410\u042F \u041E\u0428\u0418\u0411\u041A\u0410 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F:", error);
      console.error("\u274C Stack trace:", error.stack);
      res.status(500).json({ error: "Failed to send message" });
    }
  });
  app2.patch("/api/conversations/:conversationId/messages/:messageId/read", async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const success = await storage2.markMessageAsRead(messageId);
      if (!success) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });
  app2.get("/api/conversations/:conversationId/unread-count/:userId", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const userId = parseInt(req.params.userId);
      const count = await storage2.getUnreadMessageCount(conversationId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });
  let messagesPageVisited = {
    3: false,
    // Пользователь +992 (11) 111-11-11
    4: false
    // Пользователь +992 (90) 333-13-32
  };
  console.log(`\u{1F504} \u0421\u0435\u0440\u0432\u0435\u0440 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D - \u0441\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0435\u043C \u0434\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u0444\u043B\u0430\u0433\u0438 \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439`);
  function resetMessageVisitedFlag() {
    messagesPageVisited[3] = false;
    messagesPageVisited[4] = false;
    console.log(`\u{1F504} \u0414\u0415\u041C\u041E: \u0421\u0431\u0440\u043E\u0448\u0435\u043D \u0444\u043B\u0430\u0433 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 - \u043A\u0440\u0430\u0441\u043D\u044B\u0435 \u0437\u043D\u0430\u0447\u043A\u0438 \u0441\u043D\u043E\u0432\u0430 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F`);
  }
  app2.get("/api/messages/unread-count/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log(`\u{1F4CA} \u041F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u043E\u0431\u0449\u0435\u0433\u043E \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u043D\u0435\u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043D\u044B\u0445 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}`);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      const count = await storage2.getUnreadMessageCount(userId);
      console.log(`\u2705 \u041D\u0430\u0439\u0434\u0435\u043D\u043E ${count} \u043D\u0435\u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043D\u044B\u0445 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}`);
      res.json({ count });
    } catch (error) {
      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u043D\u0435\u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043D\u044B\u0445 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439:`, error);
      res.status(500).json({ error: "Failed to get unread message count" });
    }
  });
  app2.post("/api/demo/mark-messages-visited", async (req, res) => {
    try {
      const { userId } = req.body;
      console.log(`\u{1F4D6} \u0414\u0415\u041C\u041E: \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ${userId} \u0437\u0430\u0448\u0435\u043B \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439`);
      if (userId === 3 || userId === 4) {
        messagesPageVisited[userId] = true;
        console.log(`\u2705 \u0414\u0415\u041C\u041E: \u041E\u0442\u043C\u0435\u0447\u0435\u043D\u043E \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ${userId}`);
      }
      res.json({ success: true });
    } catch (error) {
      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043C\u0435\u0442\u043A\u0438 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u044F:`, error);
      res.status(500).json({ error: "Failed to mark visit" });
    }
  });
  app2.post("/api/demo/reset-demo", async (req, res) => {
    try {
      console.log(`\u{1F504} \u0414\u0415\u041C\u041E: \u0421\u0431\u0440\u043E\u0441 \u0434\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439`);
      messagesPageVisited[3] = false;
      messagesPageVisited[4] = false;
      console.log(`\u2705 \u0414\u0415\u041C\u041E: \u0414\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0441\u0431\u0440\u043E\u0448\u0435\u043D\u0430 - \u043A\u0440\u0430\u0441\u043D\u044B\u0435 \u0437\u043D\u0430\u0447\u043A\u0438 \u0441\u043D\u043E\u0432\u0430 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439`);
      res.json({ success: true, message: "Demo reset for all users" });
    } catch (error) {
      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0431\u0440\u043E\u0441\u0430 \u0434\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0430\u0446\u0438\u0438:`, error);
      res.status(500).json({ error: "Failed to reset demo" });
    }
  });
  app2.post("/api/demo/send-test-message", async (req, res) => {
    try {
      console.log(`\u{1F4E7} \u0414\u0415\u041C\u041E: \u0418\u043C\u0438\u0442\u0430\u0446\u0438\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \u043D\u043E\u0432\u043E\u0433\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F`);
      resetMessageVisitedFlag();
      console.log(`\u2705 \u0414\u0415\u041C\u041E: \u041D\u043E\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E - \u043A\u0440\u0430\u0441\u043D\u044B\u0439 \u0437\u043D\u0430\u0447\u043E\u043A \u0434\u043E\u043B\u0436\u0435\u043D \u043F\u043E\u044F\u0432\u0438\u0442\u044C\u0441\u044F`);
      res.json({ success: true, message: "\u0422\u0435\u0441\u0442\u043E\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E" });
    } catch (error) {
      console.error(`\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \u0442\u0435\u0441\u0442\u043E\u0432\u043E\u0433\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F:`, error);
      res.status(500).json({ error: "Failed to send test message" });
    }
  });
  app2.get("/api/bid-updates/timestamp", (req, res) => {
    res.json({ timestamp: lastBidUpdate });
  });
  app2.get("/api/database-status", async (req, res) => {
    try {
      console.log("\u{1F50D} DEPLOYMENT: \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445...");
      const dbStatus = await getDatabaseStatus();
      console.log("\u{1F4CA} DEPLOYMENT: \u0421\u0442\u0430\u0442\u0443\u0441 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445:", dbStatus);
      res.json({
        success: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        ...dbStatus
      });
    } catch (error) {
      console.error("\u274C DEPLOYMENT: \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445:", error);
      res.status(500).json({
        success: false,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        connected: false,
        listingsCount: 0,
        message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445",
        error: error instanceof Error ? error.message : "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430"
      });
    }
  });
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "OK",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      message: "\u0421\u0435\u0440\u0432\u0435\u0440 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E"
    });
  });
  app2.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    if (process.env.NODE_ENV !== "production") {
      console.log(`\u{1F527} SPA FALLBACK (DEVELOPMENT): ${req.path} \u2192 \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u0435\u043C \u043A Vite`);
      return next();
    }
    console.log(`\u{1F527} SPA FALLBACK (PRODUCTION): ${req.path} \u2192 index.html (\u0434\u043B\u044F \u043A\u043B\u0438\u0435\u043D\u0442\u0441\u043A\u043E\u0433\u043E \u0440\u043E\u0443\u0442\u0438\u043D\u0433\u0430)`);
    const publicPath = path2.resolve(import.meta.dirname, "public");
    const indexPath = path2.resolve(publicPath, "index.html");
    if (fs2.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        error: "Page not found",
        message: "\u041A\u043B\u0438\u0435\u043D\u0442\u0441\u043A\u0438\u0435 \u0444\u0430\u0439\u043B\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B. \u0423\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044C \u0447\u0442\u043E \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0441\u043E\u0431\u0440\u0430\u043D\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E."
      });
    }
  });
  app2.get("/api/images/banners/:id", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.id);
      const banner = await db.select().from(banners).where(eq2(banners.id, bannerId)).limit(1);
      if (banner.length === 0) {
        return res.status(404).json({ error: "Banner not found" });
      }
      const bannerData = banner[0];
      if (bannerData.imageData && bannerData.imageType) {
        const imageBuffer = ImageDownloadService.base64ToBuffer(bannerData.imageData);
        res.set({
          "Content-Type": bannerData.imageType,
          "Content-Length": imageBuffer.length.toString(),
          "Cache-Control": "public, max-age=86400"
          // 24 часа кэш
        });
        res.send(imageBuffer);
        return;
      }
      if (bannerData.imageUrl) {
        res.redirect(bannerData.imageUrl);
        return;
      }
      res.status(404).json({ error: "Image not available" });
    } catch (error) {
      console.error("Error serving banner image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/images/carousel/:id/:type?", async (req, res) => {
    try {
      const carouselId = parseInt(req.params.id);
      const imageType = req.params.type || "main";
      const carousel = await db.select().from(advertisementCarousel).where(eq2(advertisementCarousel.id, carouselId)).limit(1);
      if (carousel.length === 0) {
        return res.status(404).json({ error: "Carousel item not found" });
      }
      const carouselData = carousel[0];
      let imageData = null;
      let mimeType = null;
      let fallbackUrl = null;
      switch (imageType) {
        case "main":
          imageData = carouselData.imageData;
          mimeType = carouselData.imageType;
          fallbackUrl = carouselData.imageUrl;
          break;
        case "rotation1":
          imageData = carouselData.rotationImage1Data;
          mimeType = carouselData.rotationImage1Type;
          fallbackUrl = carouselData.rotationImage1;
          break;
        case "rotation2":
          imageData = carouselData.rotationImage2Data;
          mimeType = carouselData.rotationImage2Type;
          fallbackUrl = carouselData.rotationImage2;
          break;
        case "rotation3":
          imageData = carouselData.rotationImage3Data;
          mimeType = carouselData.rotationImage3Type;
          fallbackUrl = carouselData.rotationImage3;
          break;
        case "rotation4":
          imageData = carouselData.rotationImage4Data;
          mimeType = carouselData.rotationImage4Type;
          fallbackUrl = carouselData.rotationImage4;
          break;
        default:
          return res.status(400).json({ error: "Invalid image type" });
      }
      const cacheKey = `carousel-${carouselId}-${imageType}`;
      const cached = imageCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_TTL) {
        res.set({
          "Content-Type": cached.mimeType,
          "Content-Length": cached.buffer.length.toString(),
          "Cache-Control": "public, max-age=86400"
          // 24 часа кэш
        });
        res.send(cached.buffer);
        return;
      }
      if (imageData && mimeType) {
        const imageBuffer = ImageDownloadService.base64ToBuffer(imageData);
        imageCache.set(cacheKey, {
          buffer: imageBuffer,
          mimeType,
          timestamp: Date.now()
        });
        res.set({
          "Content-Type": mimeType,
          "Content-Length": imageBuffer.length.toString(),
          "Cache-Control": "public, max-age=86400"
          // 24 часа кэш
        });
        res.send(imageBuffer);
        return;
      }
      if (fallbackUrl) {
        res.redirect(fallbackUrl);
        return;
      }
      res.status(404).json({ error: "Image not available" });
    } catch (error) {
      console.error("Error serving carousel image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/images/sell-car-banner/:id/:type?", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.id);
      const imageType = req.params.type || "background";
      const cacheKey = `sell-banner-${bannerId}-${imageType}`;
      const cached = imageCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_TTL) {
        res.set({
          "Content-Type": cached.mimeType,
          "Content-Length": cached.buffer.length.toString(),
          "Cache-Control": "public, max-age=86400"
          // 24 часа кэш
        });
        res.send(cached.buffer);
        return;
      }
      const sellBanner = await db.select().from(sellCarBanner).where(eq2(sellCarBanner.id, bannerId)).limit(1);
      if (sellBanner.length === 0) {
        return res.status(404).json({ error: "Sell car banner not found" });
      }
      const sellBannerData = sellBanner[0];
      let imageData = null;
      let mimeType = null;
      let fallbackUrl = null;
      switch (imageType) {
        case "background":
          imageData = sellBannerData.backgroundImageData;
          mimeType = sellBannerData.backgroundImageType;
          fallbackUrl = sellBannerData.backgroundImageUrl;
          break;
        case "rotation1":
          imageData = sellBannerData.rotationImage1Data;
          mimeType = sellBannerData.rotationImage1Type;
          fallbackUrl = sellBannerData.rotationImage1;
          break;
        case "rotation2":
          imageData = sellBannerData.rotationImage2Data;
          mimeType = sellBannerData.rotationImage2Type;
          fallbackUrl = sellBannerData.rotationImage2;
          break;
        case "rotation3":
          imageData = sellBannerData.rotationImage3Data;
          mimeType = sellBannerData.rotationImage3Type;
          fallbackUrl = sellBannerData.rotationImage3;
          break;
        case "rotation4":
          imageData = sellBannerData.rotationImage4Data;
          mimeType = sellBannerData.rotationImage4Type;
          fallbackUrl = sellBannerData.rotationImage4;
          break;
        default:
          return res.status(400).json({ error: "Invalid image type" });
      }
      if (imageData && mimeType) {
        const imageBuffer = ImageDownloadService.base64ToBuffer(imageData);
        imageCache.set(cacheKey, {
          buffer: imageBuffer,
          mimeType,
          timestamp: Date.now()
        });
        res.set({
          "Content-Type": mimeType,
          "Content-Length": imageBuffer.length.toString(),
          "Cache-Control": "public, max-age=86400"
          // 24 часа кэш
        });
        res.send(imageBuffer);
        return;
      }
      if (fallbackUrl) {
        res.redirect(fallbackUrl);
        return;
      }
      res.status(404).json({ error: "Image not available" });
    } catch (error) {
      console.error("Error serving sell car banner image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  return httpServer;
}
async function sendSMSCode(phoneNumber, code) {
  const VPS_PROXY_URL = "http://188.166.61.86:3000/api/send-sms";
  console.log(`[SMS VPS PROXY] \u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 SMS \u043D\u0430 ${phoneNumber}: ${code}`);
  try {
    const smsPayload = {
      login: "zarex",
      password: "a6d5d8b47551199899862d6d768a4cb1",
      sender: "OsonSMS",
      to: phoneNumber.replace(/[^0-9]/g, ""),
      text: `\u0412\u0430\u0448 \u043A\u043E\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F AUTOBID.TJ: ${code}`
    };
    console.log(`[SMS VPS PROXY] Payload:`, smsPayload);
    const response = await fetch(VPS_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AUTOBID.TJ Replit Client"
      },
      body: JSON.stringify(smsPayload),
      timeout: 15e3
      // 15 секунд таймаут
    });
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`VPS \u043F\u0440\u043E\u043A\u0441\u0438 \u0432\u0435\u0440\u043D\u0443\u043B \u043D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u043E\u0442\u0432\u0435\u0442\u0430: ${contentType}`);
    }
    const responseData = await response.json();
    console.log(`[SMS VPS PROXY] \u041E\u0442\u0432\u0435\u0442 \u043F\u0440\u043E\u043A\u0441\u0438 \u0441\u0435\u0440\u0432\u0435\u0440\u0430:`, responseData);
    if (response.ok && responseData.success) {
      console.log(`\u2705 SMS \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u0447\u0435\u0440\u0435\u0437 VPS \u043F\u0440\u043E\u043A\u0441\u0438`);
      if (responseData.osonsms_response) {
        try {
          const osonResponse = JSON.parse(responseData.osonsms_response);
          if (osonResponse.status === "ok" && osonResponse.smsc_msg_status === "success") {
            console.log(`\u2705 OSON SMS API \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043B \u0443\u0441\u043F\u0435\u0448\u043D\u0443\u044E \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0443`);
            return {
              success: true,
              message: "SMS \u043A\u043E\u0434 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u0447\u0435\u0440\u0435\u0437 VPS \u043F\u0440\u043E\u043A\u0441\u0438"
            };
          } else {
            console.warn(`\u26A0\uFE0F OSON SMS API \u0432\u0435\u0440\u043D\u0443\u043B \u0441\u0442\u0430\u0442\u0443\u0441: ${osonResponse.status}, msg_status: ${osonResponse.smsc_msg_status}`);
          }
        } catch (parseError) {
          console.warn(`\u26A0\uFE0F \u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C \u043E\u0442\u0432\u0435\u0442 OSON API:`, parseError);
        }
      }
      return {
        success: true,
        message: "SMS \u043A\u043E\u0434 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u0447\u0435\u0440\u0435\u0437 VPS \u043F\u0440\u043E\u043A\u0441\u0438"
      };
    } else {
      console.error(`[SMS VPS PROXY] \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438:`, responseData);
      console.log(`[SMS DEMO FALLBACK] VPS \u043F\u0440\u043E\u043A\u0441\u0438 \u043E\u0448\u0438\u0431\u043A\u0430. \u0414\u0435\u043C\u043E-\u0440\u0435\u0436\u0438\u043C \u0434\u043B\u044F ${phoneNumber}: ${code}`);
      return {
        success: true,
        message: "SMS \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D (\u0434\u0435\u043C\u043E-\u0440\u0435\u0436\u0438\u043C - VPS \u043E\u0448\u0438\u0431\u043A\u0430)",
        codeValue: code
      };
    }
  } catch (error) {
    console.error("[SMS VPS PROXY] \u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0435 SMS \u0447\u0435\u0440\u0435\u0437 VPS:", error);
    console.log(`[SMS DEMO FALLBACK] \u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0435\u0440\u0435\u0445\u043E\u0434 \u0432 \u0434\u0435\u043C\u043E-\u0440\u0435\u0436\u0438\u043C \u0434\u043B\u044F ${phoneNumber}: ${code}`);
    console.log(`[SMS DEMO FALLBACK] \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u043C\u043E\u0436\u0435\u0442 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043A\u043E\u0434: ${code} \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430`);
    return {
      success: true,
      message: "SMS \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D (\u0434\u0435\u043C\u043E-\u0440\u0435\u0436\u0438\u043C - VPS \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D)",
      codeValue: code
    };
  }
}
async function sendSMSNotification(phoneNumber, message) {
  const VPS_PROXY_URL = "http://188.166.61.86:3000/api/send-sms";
  console.log(`[SMS VPS PROXY] \u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043D\u0430 ${phoneNumber}: ${message}`);
  try {
    const response = await fetch(VPS_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AUTOBID.TJ Replit Client"
      },
      body: JSON.stringify({
        login: "zarex",
        password: "a6d5d8b47551199899862d6d768a4cb1",
        sender: "OsonSMS",
        to: phoneNumber.replace(/[^0-9]/g, ""),
        text: message
      })
    });
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`VPS \u043F\u0440\u043E\u043A\u0441\u0438 \u0432\u0435\u0440\u043D\u0443\u043B \u043D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u043E\u0442\u0432\u0435\u0442\u0430: ${contentType}`);
    }
    const responseData = await response.json();
    console.log(`[SMS VPS PROXY] \u041E\u0442\u0432\u0435\u0442 \u043F\u0440\u043E\u043A\u0441\u0438 \u0441\u0435\u0440\u0432\u0435\u0440\u0430:`, responseData);
    if (response.ok && responseData.success) {
      console.log(`\u2705 SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0447\u0435\u0440\u0435\u0437 VPS \u043F\u0440\u043E\u043A\u0441\u0438`);
      return {
        success: true,
        message: "SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0447\u0435\u0440\u0435\u0437 VPS \u043F\u0440\u043E\u043A\u0441\u0438"
      };
    } else {
      console.error(`[SMS VPS PROXY] \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F:`, responseData);
      console.log(`[SMS DEMO FALLBACK] VPS \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D. \u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043D\u0430 ${phoneNumber}: ${message}`);
      return {
        success: true,
        message: "SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E (\u0434\u0435\u043C\u043E-\u0440\u0435\u0436\u0438\u043C - VPS \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D)"
      };
    }
  } catch (error) {
    console.error("[SMS VPS PROXY] \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0435 SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0447\u0435\u0440\u0435\u0437 VPS:", error);
    console.log(`[SMS DEMO FALLBACK] \u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u043D\u0430 ${phoneNumber}: ${message}`);
    return {
      success: true,
      message: "SMS \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E (\u0434\u0435\u043C\u043E-\u0440\u0435\u0436\u0438\u043C - \u043E\u0448\u0438\u0431\u043A\u0430 VPS)"
    };
  }
}
var idParamSchema, queryParamsSchema, cache, CACHE_TTL, imageCache, IMAGE_CACHE_TTL, fileStorage2, requireAdmin, sanitizeInput, adminAuth, wsManager, lastBidUpdate, getUserFromContext;
var init_routes = __esm({
  "server/routes.ts"() {
    "use strict";
    init_storage();
    init_db();
    init_schema();
    init_imageDownloadService();
    init_fileStorage();
    init_schema();
    init_websocket();
    init_deploymentSafeInit();
    idParamSchema = z2.object({
      id: z2.string().regex(/^\d+$/, "ID must be a positive integer").transform(Number)
    });
    queryParamsSchema = z2.object({
      status: z2.string().optional(),
      limit: z2.string().regex(/^\d+$/).transform(Number).optional(),
      query: z2.string().max(100).optional(),
      make: z2.string().max(50).optional(),
      model: z2.string().max(50).optional(),
      minPrice: z2.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
      maxPrice: z2.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
      minYear: z2.string().regex(/^\d{4}$/).transform(Number).optional(),
      maxYear: z2.string().regex(/^\d{4}$/).transform(Number).optional()
    });
    cache = /* @__PURE__ */ new Map();
    CACHE_TTL = 2e3;
    imageCache = /* @__PURE__ */ new Map();
    IMAGE_CACHE_TTL = 36e5;
    fileStorage2 = new FileStorageManager();
    setInterval(() => {
      const now = Date.now();
      let deletedCount = 0;
      for (const [key, value] of imageCache.entries()) {
        if (now - value.timestamp > IMAGE_CACHE_TTL) {
          imageCache.delete(key);
          deletedCount++;
        }
      }
      if (deletedCount > 0) {
        console.log(`\u{1F552} \u0423\u0434\u0430\u043B\u0435\u043D\u043E ${deletedCount} \u0443\u0441\u0442\u0430\u0440\u0435\u0432\u0448\u0438\u0445 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439 \u0438\u0437 \u043A\u044D\u0448\u0430`);
      }
    }, 6e5);
    requireAdmin = (req, res, next) => {
      next();
    };
    sanitizeInput = (req, res, next) => {
      const userIdHeader = req.headers["x-user-id"];
      const userEmailHeader = req.headers["x-user-email"];
      if (userIdHeader && !/^\d+$/.test(userIdHeader)) {
        return res.status(400).json({ error: "Invalid user ID format" });
      }
      if (userEmailHeader && userEmailHeader.length > 100) {
        return res.status(400).json({ error: "Email header too long" });
      }
      if (req.body && typeof req.body === "object") {
        const cleanBody = JSON.parse(JSON.stringify(req.body));
        Object.keys(cleanBody).forEach((key) => {
          if (typeof cleanBody[key] === "string") {
            cleanBody[key] = cleanBody[key].replace(/<script[^>]*>.*?<\/script>/gi, "").replace(/<[^>]*>/g, "").trim();
          }
        });
        req.body = cleanBody;
      }
      next();
    };
    adminAuth = async (req, res, next) => {
      try {
        const userIdHeader = req.headers["x-user-id"];
        const userEmailHeader = req.headers["x-user-email"];
        let user = req.user;
        if (!user) {
          if (userIdHeader) {
            const userId = parseInt(userIdHeader);
            if (isNaN(userId) || userId <= 0) {
              return res.status(400).json({ error: "Invalid user ID" });
            }
            user = await storage2.getUser(userId);
          } else if (userEmailHeader) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userEmailHeader)) {
              return res.status(400).json({ error: "Invalid email format" });
            }
            user = await storage2.getUserByEmail(userEmailHeader);
          }
        }
        if (!user || !user.isActive) {
          return res.status(401).json({ error: "Authentication required" });
        }
        const adminPhones = ["+992903331332", "+992 (90) 333-13-32"];
        const isAdminByPhone = user.email && adminPhones.some((phone) => user.email.includes(phone));
        console.log("\u{1F50D} Admin auth check:", {
          userId: user.id,
          role: user.role,
          email: user.email,
          isAdminByPhone,
          adminPhones
        });
        if (user.role !== "admin" && !isAdminByPhone) {
          console.log("\u274C Access denied - not admin role and not admin phone");
          return res.status(403).json({ error: "Access denied" });
        }
        console.log("\u2705 Admin access granted");
        req.user = user;
        next();
      } catch (error) {
        console.error("Admin auth error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    };
    lastBidUpdate = Date.now();
    getUserFromContext = async (req, res, next) => {
      const authHeader = req.headers.authorization;
      const userIdHeader = req.headers["x-user-id"];
      const userEmailHeader = req.headers["x-user-email"];
      console.log("\u{1F50D} getUserFromContext headers:", {
        authorization: authHeader ? "present" : "missing",
        "x-user-id": userIdHeader,
        "x-user-email": userEmailHeader
      });
      if (userIdHeader) {
        try {
          const user = await storage2.getUser(parseInt(userIdHeader));
          if (user) {
            req.user = user;
            console.log("\u2705 \u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0438\u0437 x-user-id:", user.id, user.email);
          }
        } catch (error) {
          console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u043F\u043E ID:", error);
        }
      } else if (userEmailHeader) {
        try {
          const user = await storage2.getUserByEmail(userEmailHeader);
          if (user) {
            req.user = user;
            console.log("\u2705 \u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0438\u0437 x-user-email:", user.id, user.email);
          }
        } catch (error) {
          console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u043F\u043E email:", error);
        }
      }
      if (!req.user && req.url?.includes("/admin/")) {
        try {
          const adminUser = await storage2.getUserByEmail("+992 (90) 333-13-32@autoauction.tj");
          if (adminUser && adminUser.role === "admin") {
            req.user = adminUser;
            console.log("\u{1F510} \u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u0430\u0434\u043C\u0438\u043D \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C fallback:", adminUser.id, adminUser.email);
          }
        } catch (error) {
          console.error("\u274C \u041E\u0448\u0438\u0431\u043A\u0430 fallback \u0430\u0434\u043C\u0438\u043D\u0430:", error);
        }
      }
      next();
    };
  }
});

// server/production.ts
init_routes();
import express2 from "express";
import compression from "compression";
import path3 from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express2();
var PORT = Number(process.env.PORT) || 5e3;
app.use(compression());
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://autobid-tj.ondigitalocean.app",
    "https://autobid.tj",
    "https://www.autobid.tj"
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-ID, X-User-Email");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
registerRoutes(app);
app.use(express2.static(path3.join(__dirname, "../public")));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path3.join(__dirname, "../public/index.html"));
});
app.use((err, req, res, next) => {
  console.error("Production server error:", err);
  res.status(500).json({ error: "Internal server error" });
});
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\u{1F680} Production server running on port ${PORT}`);
  console.log(`\u{1F4CA} Health check available at http://0.0.0.0:${PORT}/health`);
  console.log(`\u{1F30D} Environment: ${process.env.NODE_ENV || "production"}`);
});
var production_default = app;
export {
  production_default as default
};
