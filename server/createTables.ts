import { db } from "./db";
import { sql } from "drizzle-orm";

export async function createTables() {
  try {
    console.log("Creating database tables...");

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        full_name TEXT,
        role TEXT NOT NULL,
        profile_photo TEXT,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create car_listings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS car_listings (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER NOT NULL,
        lot_number TEXT NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        mileage INTEGER NOT NULL,
        description TEXT NOT NULL,
        starting_price NUMERIC(12,2) NOT NULL,
        current_bid NUMERIC(12,2),
        photos JSONB NOT NULL,
        auction_duration INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        auction_start_time TIMESTAMP,
        auction_end_time TIMESTAMP,
        customs_cleared BOOLEAN DEFAULT false,
        recycled BOOLEAN DEFAULT false,
        technical_inspection_valid BOOLEAN DEFAULT false,
        technical_inspection_date TEXT,
        tinted BOOLEAN DEFAULT false,
        tinting_date TEXT,
        engine TEXT,
        transmission TEXT,
        fuel_type TEXT,
        body_type TEXT,
        drive_type TEXT,
        color TEXT,
        condition TEXT,
        vin TEXT,
        location TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create other tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER NOT NULL,
        bidder_id INTEGER NOT NULL,
        amount NUMERIC(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        listing_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        listing_id INTEGER,
        alert_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS car_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        make TEXT NOT NULL,
        model TEXT,
        min_price NUMERIC(12,2),
        max_price NUMERIC(12,2),
        max_year INTEGER,
        min_year INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create additional tables from schema
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        link_url TEXT,
        position TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sell_car_section (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        button_text TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS advertisement_carousel (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        link_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS alert_views (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        alert_id INTEGER NOT NULL,
        listing_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS car_listings_status_idx ON car_listings(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS car_listings_seller_idx ON car_listings(seller_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS car_listings_created_at_idx ON car_listings(created_at)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS bids_listing_idx ON bids(listing_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS bids_bidder_idx ON bids(bidder_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read)`);

    console.log("All database tables created successfully!");
    return true;
  } catch (error) {
    console.error("Failed to create database tables:", error);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createTables().then(success => {
    process.exit(success ? 0 : 1);
  });
}