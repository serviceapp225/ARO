import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

const sqlite = new Database('autobid.db');

// Enable foreign key constraints
sqlite.pragma('foreign_keys = ON');

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone_number TEXT,
      full_name TEXT,
      role TEXT NOT NULL DEFAULT 'buyer',
      profile_photo TEXT,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS car_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sellerId INTEGER NOT NULL,
      lotNumber TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      mileage INTEGER NOT NULL,
      description TEXT NOT NULL,
      startingPrice TEXT NOT NULL,
      currentBid TEXT,
      photos TEXT NOT NULL,
      auctionDuration INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      auctionStartTime INTEGER,
      auctionEndTime INTEGER,
      endTime INTEGER,
      customsCleared INTEGER DEFAULT 0,
      recycled INTEGER DEFAULT 0,
      technicalInspectionValid INTEGER DEFAULT 0,
      technicalInspectionDate INTEGER,
      tinted INTEGER DEFAULT 0,
      tintingDate INTEGER,
      engine TEXT,
      transmission TEXT,
      fuelType TEXT,
      bodyType TEXT,
      driveType TEXT,
      color TEXT,
      condition TEXT,
      vin TEXT,
      location TEXT,
      createdAt INTEGER
  );

  CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      bidder_id INTEGER NOT NULL,
      amount TEXT NOT NULL,
      created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      created_at INTEGER,
      UNIQUE(user_id, listing_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      data TEXT,
      created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS car_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      make TEXT,
      model TEXT,
      minPrice INTEGER,
      maxPrice INTEGER,
      maxYear INTEGER,
      minYear INTEGER,
      isActive INTEGER DEFAULT 1,
      created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      buttonText TEXT,
      buttonUrl TEXT,
      backgroundImageUrl TEXT,
      position TEXT,
      isActive INTEGER DEFAULT 1,
      created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS sell_car_section (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      buttonText TEXT,
      buttonUrl TEXT,
      backgroundImageUrl TEXT,
      isActive INTEGER DEFAULT 1,
      created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS advertisement_carousel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT,
      imageUrl TEXT,
      buttonText TEXT,
      buttonUrl TEXT,
      displayOrder INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS alert_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      alertId INTEGER NOT NULL,
      listingId INTEGER NOT NULL,
      viewedAt INTEGER,
      UNIQUE(userId, alertId, listingId)
  );

  CREATE TABLE IF NOT EXISTS sms_verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phoneNumber TEXT NOT NULL,
      code TEXT NOT NULL,
      isUsed INTEGER DEFAULT 0,
      expiresAt INTEGER NOT NULL,
      createdAt INTEGER
  );
`);

export const db = drizzle(sqlite, { schema });
export const pool = sqlite;