#!/bin/bash

# AutoBid.TJ - Миграция базы данных на VPS
# Создание полной схемы базы данных для production

echo "🗄️  Начинаем миграцию базы данных AutoBid.TJ..."

# Проверка подключения к PostgreSQL
echo "🔍 Проверка подключения к PostgreSQL..."
sudo -u postgres psql -d autobid_db -c "SELECT version();" || {
    echo "❌ Ошибка подключения к базе данных"
    exit 1
}

# Создание полной схемы базы данных
echo "📋 Создание схемы базы данных..."
sudo -u postgres psql -d autobid_db << 'EOF'

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_photo TEXT,
    role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    is_active BOOLEAN DEFAULT false,
    verification_code VARCHAR(6),
    verification_expires_at TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы объявлений автомобилей
CREATE TABLE IF NOT EXISTS car_listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    mileage INTEGER,
    engine_volume DECIMAL(3,1),
    color VARCHAR(50),
    body_type VARCHAR(50),
    drive_type VARCHAR(50),
    condition VARCHAR(50),
    description TEXT,
    images TEXT[], -- JSON массив URL изображений
    starting_price DECIMAL(12,2) NOT NULL,
    current_price DECIMAL(12,2) DEFAULT 0,
    reserve_price DECIMAL(12,2),
    buy_now_price DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'ended', 'sold', 'rejected')),
    auction_start TIMESTAMP,
    auction_end TIMESTAMP,
    location VARCHAR(100),
    vin VARCHAR(17),
    license_plate VARCHAR(20),
    technical_passport TEXT,
    is_damaged BOOLEAN DEFAULT false,
    damage_description TEXT,
    electric_range INTEGER, -- для электромобилей в км
    battery_capacity INTEGER, -- для электромобилей в kWh
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы ставок
CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES car_listings(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    is_auto_bid BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, user_id, amount) -- предотвращение дублирования ставок
);

-- Создание таблицы избранного
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES car_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Создание таблицы уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'bid', 'auction')),
    is_read BOOLEAN DEFAULT false,
    listing_id INTEGER REFERENCES car_listings(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы автоматических оповещений
CREATE TABLE IF NOT EXISTS car_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(100),
    model VARCHAR(100),
    year_from INTEGER,
    year_to INTEGER,
    price_from DECIMAL(12,2),
    price_to DECIMAL(12,2),
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    body_type VARCHAR(50),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы баннеров
CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы сообщений
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES car_listings(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы автоматических ставок
CREATE TABLE IF NOT EXISTS auto_bids (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES car_listings(id) ON DELETE CASCADE,
    max_amount DECIMAL(12,2) NOT NULL,
    increment DECIMAL(12,2) DEFAULT 100.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- Создание индексов для оптимизации производительности
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_car_listings_user_id ON car_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_car_listings_status ON car_listings(status);
CREATE INDEX IF NOT EXISTS idx_car_listings_brand_model ON car_listings(brand, model);
CREATE INDEX IF NOT EXISTS idx_car_listings_year ON car_listings(year);
CREATE INDEX IF NOT EXISTS idx_car_listings_price ON car_listings(current_price);
CREATE INDEX IF NOT EXISTS idx_car_listings_auction_end ON car_listings(auction_end);
CREATE INDEX IF NOT EXISTS idx_car_listings_created_at ON car_listings(created_at);

CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(amount);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Создание триггеров для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_listings_updated_at BEFORE UPDATE ON car_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных для демонстрации
INSERT INTO users (phone, email, first_name, last_name, role, is_active) 
VALUES 
    ('+992901234567', 'admin@autoauction.tj', 'Админ', 'Системный', 'admin', true),
    ('+992911234567', 'seller@autoauction.tj', 'Продавец', 'Тестовый', 'seller', true),
    ('+992921234567', 'buyer@autoauction.tj', 'Покупатель', 'Тестовый', 'buyer', true)
ON CONFLICT (phone) DO NOTHING;

-- Вставка тестового баннера
INSERT INTO banners (title, description, image_url, is_active, display_order)
VALUES 
    ('Добро пожаловать в AutoBid.TJ', 'Лучшая платформа для автомобильных аукционов в Таджикистане', '/assets/banner1.jpg', true, 1)
ON CONFLICT DO NOTHING;

-- Создание функции для автоматического завершения аукционов
CREATE OR REPLACE FUNCTION check_auction_end()
RETURNS void AS $$
BEGIN
    -- Обновляем статус завершенных аукционов
    UPDATE car_listings 
    SET status = 'ended' 
    WHERE status = 'active' 
    AND auction_end < CURRENT_TIMESTAMP;
    
    -- Создаем уведомления для завершенных аукционов
    INSERT INTO notifications (user_id, title, message, type, listing_id)
    SELECT DISTINCT 
        b.user_id,
        'Аукцион завершен',
        CASE 
            WHEN b.amount = (SELECT MAX(amount) FROM bids WHERE listing_id = b.listing_id)
            THEN 'Поздравляем! Вы выиграли аукцион на ' || cl.brand || ' ' || cl.model
            ELSE 'Аукцион на ' || cl.brand || ' ' || cl.model || ' завершен. К сожалению, ваша ставка не была максимальной.'
        END,
        CASE 
            WHEN b.amount = (SELECT MAX(amount) FROM bids WHERE listing_id = b.listing_id)
            THEN 'success'
            ELSE 'info'
        END,
        cl.id
    FROM bids b
    JOIN car_listings cl ON b.listing_id = cl.id
    WHERE cl.status = 'ended' 
    AND cl.updated_at > CURRENT_TIMESTAMP - INTERVAL '1 minute'
    AND NOT EXISTS (
        SELECT 1 FROM notifications n 
        WHERE n.user_id = b.user_id 
        AND n.listing_id = cl.id 
        AND n.type IN ('success', 'info')
        AND n.created_at > cl.updated_at
    );
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- Проверка созданных таблиц
SELECT 'Создано таблиц: ' || COUNT(*) as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'car_listings', 'bids', 'favorites', 'notifications', 'car_alerts', 'banners', 'messages', 'auto_bids');

-- Показать статистику базы данных
SELECT 
    schemaname as schema,
    tablename as table_name,
    COALESCE(n_tup_ins, 0) as inserts,
    COALESCE(n_tup_upd, 0) as updates,
    COALESCE(n_tup_del, 0) as deletes,
    COALESCE(n_live_tup, 0) as live_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

EOF

echo "✅ Миграция базы данных завершена успешно!"
echo ""
echo "📊 Созданные таблицы:"
echo "   - users (пользователи)"
echo "   - car_listings (объявления)"  
echo "   - bids (ставки)"
echo "   - favorites (избранное)"
echo "   - notifications (уведомления)"
echo "   - car_alerts (автоматические оповещения)"
echo "   - banners (баннеры)"
echo "   - messages (сообщения)"
echo "   - auto_bids (автоматические ставки)"
echo ""
echo "🔧 Созданы индексы для оптимизации производительности"
echo "⚡ Созданы триггеры для автоматического обновления временных меток"
echo "🎯 Созданы функции для автоматического управления аукционами"
echo ""
echo "📋 Тестовые данные:"
echo "   - 3 тестовых пользователя (admin, seller, buyer)"
echo "   - 1 тестовый баннер"
echo ""