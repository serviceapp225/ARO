import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  phoneNumber: text("phone_number"), // For SMS authentication
  fullName: text("full_name"), // Real name from profile
  role: text("role").notNull(), // 'buyer', 'seller', 'admin'
  profilePhoto: text("profile_photo"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const carListings = sqliteTable("car_listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sellerId: integer("seller_id").notNull(),
  lotNumber: text("lot_number").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  description: text("description").notNull(),
  startingPrice: text("starting_price").notNull(),
  currentBid: text("current_bid"),
  photos: text("photos").notNull(), // JSON string of photo URLs
  status: text("status").notNull().default("pending"), // 'pending', 'active', 'ended', 'rejected'
  endTime: integer("end_time", { mode: "timestamp" }),
  customsCleared: integer("customs_cleared", { mode: "boolean" }).default(false),
  recycled: integer("recycled", { mode: "boolean" }).default(false),
  technicalInspectionValid: integer("technical_inspection_valid", { mode: "boolean" }).default(false),
  technicalInspectionDate: integer("technical_inspection_date", { mode: "timestamp" }),
  tinted: integer("tinted", { mode: "boolean" }).default(false),
  tintingDate: integer("tinting_date", { mode: "timestamp" }),
  // Additional car specifications
  engine: text("engine"),
  transmission: text("transmission"),
  fuelType: text("fuel_type"),
  bodyType: text("body_type"),
  driveType: text("drive_type"),
  color: text("color"),
  vin: text("vin"),
  location: text("location"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const bids = sqliteTable("bids", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listing_id").notNull(),
  bidderId: integer("bidder_id").notNull(),
  amount: text("amount").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const favorites = sqliteTable("favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const carAlerts = sqliteTable("car_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  make: text("make"),
  model: text("model"),
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
  maxYear: integer("max_year"),
  minYear: integer("min_year"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCarListingSchema = createInsertSchema(carListings).omit({
  id: true,
  currentBid: true,
  status: true,
  createdAt: true,
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

export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  buttonText: text("button_text"),
  buttonUrl: text("button_url"),
  position: text("position"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
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
  title: text("title").notNull(),
  type: text("type").notNull(), // 'policy' or 'rules'
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

// Deleted Alerts table to track alerts that users have manually deleted
export const deletedAlerts = pgTable("deleted_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  alertData: text("alert_data").notNull(), // JSON string of alert criteria
  deletedAt: timestamp("deleted_at").defaultNow().notNull(),
}, (table) => ({
  userAlertDataUnique: index("user_alert_data_unique").on(table.userId, table.alertData),
}));

export const insertDeletedAlertSchema = createInsertSchema(deletedAlerts).omit({
  id: true,
  deletedAt: true,
});

export type InsertDeletedAlert = z.infer<typeof insertDeletedAlertSchema>;
export type DeletedAlert = typeof deletedAlerts.$inferSelect;

// SMS Verification Codes table
export const smsVerificationCodes = pgTable("sms_verification_codes", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  code: text("code").notNull(),
  isUsed: boolean("is_used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  phoneNumberIdx: index("sms_verification_codes_phone_idx").on(table.phoneNumber),
  expiresAtIdx: index("sms_verification_codes_expires_idx").on(table.expiresAt),
}));

export const insertSmsVerificationCodeSchema = createInsertSchema(smsVerificationCodes).omit({
  id: true,
  createdAt: true,
});

export type InsertSmsVerificationCode = z.infer<typeof insertSmsVerificationCodeSchema>;
export type SmsVerificationCode = typeof smsVerificationCodes.$inferSelect;
