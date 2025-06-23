import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  username: text("username").notNull().unique(),
  phoneNumber: text("phone_number"),
  fullName: text("full_name"),
  role: text("role").notNull().default("buyer"),
  profilePhoto: text("profile_photo"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const carListings = sqliteTable("car_listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sellerId: integer("sellerId").notNull(),
  lotNumber: text("lotNumber").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  description: text("description").notNull(),
  startingPrice: text("startingPrice").notNull(),
  currentBid: text("currentBid"),
  photos: text("photos").notNull(), // JSON string of photo URLs
  auctionDuration: integer("auctionDuration").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'active', 'ended', 'rejected'
  auctionStartTime: integer("auctionStartTime", { mode: "timestamp" }),
  auctionEndTime: integer("auctionEndTime", { mode: "timestamp" }),
  endTime: integer("endTime", { mode: "timestamp" }),
  customsCleared: integer("customsCleared", { mode: "boolean" }).default(false),
  recycled: integer("recycled", { mode: "boolean" }).default(false),
  technicalInspectionValid: integer("technicalInspectionValid", { mode: "boolean" }).default(false),
  technicalInspectionDate: integer("technicalInspectionDate", { mode: "timestamp" }),
  tinted: integer("tinted", { mode: "boolean" }).default(false),
  tintingDate: integer("tintingDate", { mode: "timestamp" }),
  // Additional car specifications
  engine: text("engine"),
  transmission: text("transmission"),
  fuelType: text("fuelType"),
  bodyType: text("bodyType"),
  driveType: text("driveType"),
  color: text("color"),
  condition: text("condition"),
  vin: text("vin"),
  location: text("location"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()),
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
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  listingId: integer("listing_id"),
  alertId: integer("alert_id"),
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
}).extend({
  sellerId: z.number().optional(),
  lotNumber: z.string().optional(),
  auctionDuration: z.number().optional(),
  photos: z.string().optional(),
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

export const sellCarSection = sqliteTable("sell_car_section", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  buttonText: text("button_text"),
  buttonUrl: text("button_url"),
  backgroundImageUrl: text("background_image_url"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertSellCarSectionSchema = createInsertSchema(sellCarSection).omit({
  id: true,
  createdAt: true,
});

export type InsertSellCarSection = z.infer<typeof insertSellCarSectionSchema>;
export type SellCarSection = typeof sellCarSection.$inferSelect;

export const advertisementCarousel = sqliteTable("advertisement_carousel", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  buttonText: text("button_text"),
  buttonUrl: text("button_url"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertAdvertisementCarouselSchema = createInsertSchema(advertisementCarousel).omit({
  id: true,
  createdAt: true,
});

export type InsertAdvertisementCarousel = z.infer<typeof insertAdvertisementCarouselSchema>;
export type AdvertisementCarousel = typeof advertisementCarousel.$inferSelect;

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export const alertViews = sqliteTable("alert_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  alertId: integer("alert_id").notNull(),
  listingId: integer("listing_id").notNull(),
  viewedAt: integer("viewed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertAlertViewSchema = createInsertSchema(alertViews).omit({
  id: true,
  viewedAt: true,
});

export type InsertAlertView = z.infer<typeof insertAlertViewSchema>;
export type AlertView = typeof alertViews.$inferSelect;

export const smsVerificationCodes = sqliteTable("sms_verification_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phoneNumber: text("phone_number").notNull(),
  code: text("code").notNull(),
  isUsed: integer("is_used", { mode: "boolean" }).default(false),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertSmsVerificationCodeSchema = createInsertSchema(smsVerificationCodes).omit({
  id: true,
  createdAt: true,
});

export type InsertSmsVerificationCode = z.infer<typeof insertSmsVerificationCodeSchema>;
export type SmsVerificationCode = typeof smsVerificationCodes.$inferSelect;
