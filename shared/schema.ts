import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  fullName: text("full_name"), // Real name from profile
  role: text("role").notNull(), // 'buyer', 'seller', 'admin'
  profilePhoto: text("profile_photo"),
  phoneNumber: text("phone_number"), // Phone number for authentication
  isActive: boolean("is_active").default(false),
  // Реферальная система
  invitedBy: text("invited_by"), // Номер телефона пригласившего
  isInvited: boolean("is_invited").default(false), // Отметка о том, что пользователь приглашен
  createdAt: timestamp("created_at").defaultNow(),
});

export const carListings = pgTable("car_listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  lotNumber: text("lot_number").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  description: text("description").notNull(),
  startingPrice: numeric("starting_price", { precision: 12, scale: 2 }).notNull(),
  reservePrice: numeric("reserve_price", { precision: 12, scale: 2 }), // Резервная цена
  currentBid: numeric("current_bid", { precision: 12, scale: 2 }),
  photos: jsonb("photos").notNull(), // array of photo URLs
  auctionDuration: integer("auction_duration").notNull(), // hours
  status: text("status").notNull().default("pending_approval"), // 'pending_approval', 'pending', 'active', 'ended', 'archived', 'rejected'
  auctionStartTime: timestamp("auction_start_time"),
  auctionEndTime: timestamp("auction_end_time"),
  endedAt: timestamp("ended_at"), // Время завершения аукциона
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
  batteryCapacity: numeric("battery_capacity", { precision: 6, scale: 1 }), // кВт·ч
  electricRange: integer("electric_range"), // запас хода в км
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  statusIdx: index("car_listings_status_idx").on(table.status),
  sellerIdx: index("car_listings_seller_idx").on(table.sellerId),
  createdAtIdx: index("car_listings_created_at_idx").on(table.createdAt),
}));

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  bidderId: integer("bidder_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  listingIdx: index("bids_listing_idx").on(table.listingId),
  bidderIdx: index("bids_bidder_idx").on(table.bidderId),
}));

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'new_car', 'bid_update', 'auction_ending'
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  listingId: integer("listing_id"), // optional, for car-related notifications
  alertId: integer("alert_id"), // optional, for notifications related to car alerts
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
}));

export const carAlerts = pgTable("car_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  make: text("make").notNull(),
  model: text("model"), // optional, can be null for all models of a make
  minPrice: numeric("min_price", { precision: 12, scale: 2 }),
  maxPrice: numeric("max_price", { precision: 12, scale: 2 }),
  maxYear: integer("max_year"),
  minYear: integer("min_year"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCarListingSchema = createInsertSchema(carListings).omit({
  id: true,
  currentBid: true,
  status: true,
  auctionStartTime: true,
  auctionEndTime: true,
  createdAt: true,
}).extend({
  lotNumber: z.string().optional(),
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertCarAlertSchema = createInsertSchema(carAlerts).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCarListing = z.infer<typeof insertCarListingSchema>;
export type CarListing = typeof carListings.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertCarAlert = z.infer<typeof insertCarAlertSchema>;
export type CarAlert = typeof carAlerts.$inferSelect;

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  position: text("position").notNull().default("main"), // 'main', 'sidebar', 'footer'
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
  createdAt: true,
});

export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;

// Таблица для управления секцией "Продай свой авто"
export const sellCarSection = pgTable("sell_car_section", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Продай свое авто"),
  subtitle: text("subtitle").notNull().default("Получи максимальную цену за свой автомобиль на нашем аукционе"),
  buttonText: text("button_text").notNull().default("Начать продажу"),
  backgroundImageUrl: text("background_image_url").notNull().default("https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
  linkUrl: text("link_url").notNull().default("/sell"),
  isActive: boolean("is_active").default(true),
  overlayOpacity: integer("overlay_opacity").default(40), // 0-100
  textColor: text("text_color").default("white"),
  buttonColor: text("button_color").default("white"),
  buttonTextColor: text("button_text_color").default("emerald-700"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSellCarSectionSchema = createInsertSchema(sellCarSection).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSellCarSection = z.infer<typeof insertSellCarSectionSchema>;
export type SellCarSection = typeof sellCarSection.$inferSelect;

// Таблица для управления каруселью рекламы
export const advertisementCarousel = pgTable("advertisement_carousel", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  buttonText: text("button_text").default("Подробнее"),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdvertisementCarouselSchema = createInsertSchema(advertisementCarousel).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdvertisementCarousel = z.infer<typeof insertAdvertisementCarouselSchema>;
export type AdvertisementCarousel = typeof advertisementCarousel.$inferSelect;

// Documents table for policies and rules
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), // NULL для системных документов
  title: text("title").notNull(),
  type: text("type").notNull(), // 'policy', 'rules', 'passport', 'license', 'identity'
  content: text("content").notNull(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Sell Car Banner table for the main homepage banner
export const sellCarBanner = pgTable("sell_car_banner", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Продай свое авто"),
  description: text("description").notNull().default("Получи максимальную цену за свой автомобиль на нашем аукционе"),
  buttonText: text("button_text").notNull().default("Начать продажу"),
  linkUrl: text("link_url").notNull().default("/sell"),
  backgroundImageUrl: text("background_image_url").default("https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=300&fit=crop"),
  gradientFrom: text("gradient_from").default("#059669"),
  gradientTo: text("gradient_to").default("#047857"),
  textColor: text("text_color").default("#ffffff"),
  isActive: boolean("is_active").default(true),
  overlayOpacity: integer("overlay_opacity").default(60), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSellCarBannerSchema = createInsertSchema(sellCarBanner).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSellCarBanner = z.infer<typeof insertSellCarBannerSchema>;
export type SellCarBanner = typeof sellCarBanner.$inferSelect;

// Alert Views table to track when users have seen alert notifications
export const alertViews = pgTable("alert_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  alertId: integer("alert_id").notNull().references(() => carAlerts.id, { onDelete: "cascade" }),
  listingId: integer("listing_id").notNull().references(() => carListings.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const insertAlertViewSchema = createInsertSchema(alertViews).omit({
  id: true,
  viewedAt: true,
});

export type InsertAlertView = z.infer<typeof insertAlertViewSchema>;
export type AlertView = typeof alertViews.$inferSelect;

// User Wins table to track auction wins
export const userWins = pgTable("user_wins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: integer("listing_id").notNull().references(() => carListings.id, { onDelete: "cascade" }),
  winningBid: numeric("winning_bid", { precision: 12, scale: 2 }).notNull(),
  wonAt: timestamp("won_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_wins_user_idx").on(table.userId),
  listingIdx: index("user_wins_listing_idx").on(table.listingId),
}));

export const insertUserWinSchema = createInsertSchema(userWins).omit({
  id: true,
  wonAt: true,
});

export type InsertUserWin = z.infer<typeof insertUserWinSchema>;
export type UserWin = typeof userWins.$inferSelect;
