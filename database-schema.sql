-- AutoBid.TJ Database Schema for VPS Migration

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT false,
    role VARCHAR(20) DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_photo BYTEA
);

-- Car listings table
CREATE TABLE IF NOT EXISTS car_listings (
    id SERIAL PRIMARY KEY,
    lot_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    starting_bid DECIMAL(12,2) NOT NULL,
    current_bid DECIMAL(12,2) DEFAULT 0,
    reserve_price DECIMAL(12,2),
    auction_end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mileage INTEGER,
    fuel_type VARCHAR(20),
    transmission VARCHAR(20),
    engine_size VARCHAR(20),
    color VARCHAR(50),
    description TEXT,
    main_image_path VARCHAR(500),
    additional_images_paths TEXT[]
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES car_listings(id),
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    listing_id INTEGER REFERENCES car_listings(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    recipient_id INTEGER REFERENCES users(id),
    listing_id INTEGER REFERENCES car_listings(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Car alerts table
CREATE TABLE IF NOT EXISTS car_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    make VARCHAR(100),
    model VARCHAR(100),
    max_price DECIMAL(12,2),
    min_year INTEGER,
    max_year INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_path VARCHAR(500),
    link_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    position VARCHAR(50) DEFAULT 'carousel',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (email, phone_number, is_active, role) VALUES 
('admin@autobid.tj', '+992000000000', true, 'admin'),
('+992 (90) 333-13-32@autoauction.tj', '+992 (90) 333-13-32', true, 'buyer')
ON CONFLICT (email) DO NOTHING;

-- Insert sample banner
INSERT INTO banners (title, description, position, is_active) VALUES 
('Добро пожаловать в AutoBid.TJ', 'Лучшая платформа автомобильных аукционов в Таджикистане', 'carousel', true),
('Продай свое авто!', 'Быстро и выгодно продавайте автомобили через наш аукцион', 'sell_banner', true)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_car_listings_status ON car_listings(status);
CREATE INDEX IF NOT EXISTS idx_car_listings_auction_end ON car_listings(auction_end_time);
CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_listing ON favorites(user_id, listing_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO autobid_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO autobid_user;