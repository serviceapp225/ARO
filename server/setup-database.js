import pkg from 'pg';
const { Pool } = pkg;

// Use fresh database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone_number VARCHAR(20),
  profile_photo TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Car listings table
CREATE TABLE IF NOT EXISTS car_listings (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lot_number VARCHAR(20) UNIQUE NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  description TEXT,
  starting_price DECIMAL(12,2) NOT NULL,
  current_bid DECIMAL(12,2) DEFAULT 0,
  photos JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending',
  auction_start TIMESTAMP,
  auction_end TIMESTAMP,
  auction_duration INTEGER DEFAULT 7,
  customs_cleared BOOLEAN DEFAULT FALSE,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Other tables
CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES car_listings(id) ON DELETE CASCADE,
  bidder_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER REFERENCES car_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS car_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  make VARCHAR(50),
  model VARCHAR(50),
  max_price DECIMAL(12,2),
  min_year INTEGER,
  max_year INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position VARCHAR(50) DEFAULT 'main',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sell_car_section (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  button_text VARCHAR(100),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS advertisement_carousel (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'page',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert_views (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  alert_id INTEGER REFERENCES car_alerts(id) ON DELETE CASCADE,
  listing_id INTEGER REFERENCES car_listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const sampleData = `
-- Insert admin user
INSERT INTO users (username, email, password_hash, full_name, is_active, is_admin) 
VALUES ('admin', 'admin@autobid.tj', '$2b$10$Kf8zYQiCt2rCKVXhVi3Wq.vFrJvGzLQ8J0sGjCgHnHKrW5DfA2ZU2', 'Администратор', TRUE, TRUE)
ON CONFLICT (username) DO UPDATE SET is_admin = TRUE, is_active = TRUE;

-- Insert test user
INSERT INTO users (username, email, password_hash, full_name, phone_number, is_active) 
VALUES ('testuser', '992000000000@autoauction.tj', '$2b$10$Kf8zYQiCt2rCKVXhVi3Wq.vFrJvGzLQ8J0sGjCgHnHKrW5DfA2ZU2', 'Тестовый пользователь', '992000000000', TRUE)
ON CONFLICT (username) DO UPDATE SET is_active = TRUE;

-- Insert sample car listings
INSERT INTO car_listings (seller_id, lot_number, make, model, year, mileage, description, starting_price, status, auction_start, auction_end) 
VALUES 
(1, 'LOT001', 'Toyota', 'Camry', 2020, 45000, 'Отличное состояние, полная комплектация', 25000.00, 'active', NOW(), NOW() + INTERVAL '7 days'),
(1, 'LOT002', 'BMW', 'X5', 2019, 60000, 'Люксовый внедорожник в идеальном состоянии', 45000.00, 'active', NOW(), NOW() + INTERVAL '7 days'),
(1, 'LOT003', 'Mercedes-Benz', 'E-Class', 2021, 30000, 'Премиум седан с полной историей обслуживания', 55000.00, 'pending', NULL, NULL)
ON CONFLICT (lot_number) DO NOTHING;

-- Insert banners
INSERT INTO banners (title, image_url, link_url, position, is_active) 
VALUES 
('Премиум аукцион автомобилей', '/api/placeholder/800/300', '/auctions', 'main', TRUE),
('Продайте свой автомобиль выгодно', '/api/placeholder/800/300', '/sell', 'secondary', TRUE)
ON CONFLICT DO NOTHING;

-- Insert sell car section
INSERT INTO sell_car_section (title, description, button_text, image_url, is_active) 
VALUES ('Продать автомобиль', 'Разместите свое объявление и получите лучшую цену на аукционе', 'Подать объявление', '/api/placeholder/400/300', TRUE)
ON CONFLICT DO NOTHING;
`;

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Creating database schema...');
    await client.query(schema);
    console.log('Schema created successfully');
    
    console.log('Inserting sample data...');
    await client.query(sampleData);
    console.log('Sample data inserted successfully');
    
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Database setup failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase().catch(console.error);