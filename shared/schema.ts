import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  role: text("role").notNull(), // 'buyer', 'seller', 'admin'
  profilePhoto: text("profile_photo"),
  isActive: boolean("is_active").default(true),
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
  currentBid: numeric("current_bid", { precision: 12, scale: 2 }),
  photos: jsonb("photos").notNull(), // array of photo URLs
  auctionDuration: integer("auction_duration").notNull(), // hours
  status: text("status").notNull().default("pending"), // 'pending', 'active', 'ended', 'rejected'
  auctionStartTime: timestamp("auction_start_time"),
  auctionEndTime: timestamp("auction_end_time"),
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
});

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
});

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
