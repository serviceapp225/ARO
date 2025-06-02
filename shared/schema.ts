import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
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
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  vin: text("vin"),
  description: text("description").notNull(),
  startingPrice: numeric("starting_price", { precision: 12, scale: 2 }).notNull(),
  currentBid: numeric("current_bid", { precision: 12, scale: 2 }),
  photos: jsonb("photos").notNull(), // array of photo URLs
  auctionDuration: integer("auction_duration").notNull(), // hours
  status: text("status").notNull().default("pending"), // 'pending', 'active', 'ended', 'rejected'
  auctionStartTime: timestamp("auction_start_time"),
  auctionEndTime: timestamp("auction_end_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCarListing = z.infer<typeof insertCarListingSchema>;
export type CarListing = typeof carListings.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
