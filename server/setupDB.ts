import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Build DATABASE_URL from individual environment variables
const dbUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=require`;

console.log("Setting up database with proper credentials...");

const pool = new Pool({ 
  connectionString: dbUrl
});

async function setupDatabase() {
  try {
    // Test connection
    const client = await pool.connect();
    console.log("Database connection successful!");
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        full_name TEXT,
        role TEXT NOT NULL,
        profile_photo TEXT,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
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
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER NOT NULL,
        bidder_id INTEGER NOT NULL,
        amount NUMERIC(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        listing_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
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
      );
    `);

    await client.query(`
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
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS car_listings_status_idx ON car_listings(status);
      CREATE INDEX IF NOT EXISTS car_listings_seller_idx ON car_listings(seller_id);
      CREATE INDEX IF NOT EXISTS car_listings_created_at_idx ON car_listings(created_at);
      CREATE INDEX IF NOT EXISTS bids_listing_idx ON bids(listing_id);
      CREATE INDEX IF NOT EXISTS bids_bidder_idx ON bids(bidder_id);
      CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
    `);

    console.log("All tables and indexes created successfully!");
    
    client.release();
    
    // Set the environment variable for the app
    process.env.DATABASE_URL = dbUrl;
    console.log("DATABASE_URL updated for application use");
    
  } catch (error) {
    console.error("Database setup failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(console.error);