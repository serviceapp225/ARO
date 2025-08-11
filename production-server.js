const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS для development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id, x-user-email');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// PostgreSQL соединение
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://autobid_user:AutoBid2025@localhost:5432/autobid_db',
  ssl: false
});

// Тестирование БД при запуске
pool.connect()
  .then(client => {
    console.log('✅ База данных подключена');
    return client.query('SELECT COUNT(*) FROM users');
  })
  .then(result => {
    console.log(`✅ Найдено пользователей: ${result.rows[0].count}`);
    pool.end;
  })
  .catch(err => {
    console.error('❌ Ошибка БД:', err.message);
  });

// Статические файлы
app.use('/assets', express.static('/var/www/autobid/dist/public/assets'));
app.use(express.static('/var/www/autobid/dist/public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'AutoBid.TJ Production',
    database: 'Connected',
    port: PORT,
    version: '1.0.0'
  });
});

// Инфраструктурный тест
app.get('/api/test-infrastructure', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT version()');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const listingCount = await pool.query('SELECT COUNT(*) FROM car_listings');
    
    res.json({
      status: 'OK',
      database: {
        version: dbResult.rows[0].version,
        users: parseInt(userCount.rows[0].count),
        listings: parseInt(listingCount.rows[0].count)
      },
      server: {
        nodeVersion: process.version,
        uptime: Math.floor(process.uptime()),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message 
    });
  }
});

// API endpoints для приложения
app.get('/api/listings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, brand as make, model, year, fuel_type, transmission,
        mileage, engine_volume, color, description, images,
        starting_price, current_price, reserve_price, buy_now_price,
        status, auction_start, auction_end, location,
        created_at, updated_at
      FROM car_listings 
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 50
    `);
    
    res.json(result.rows.map(row => ({
      ...row,
      images: row.images || [],
      lotNumber: row.id.toString().padStart(6, '0')
    })));
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT id, phone, email, first_name, last_name, profile_photo, role, is_active
      FROM users WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email || user.phone,
      phoneNumber: user.phone,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePhoto: user.profile_photo,
      role: user.role,
      isActive: user.is_active
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT id, title, message, type, is_read, listing_id, created_at
      FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Заглушки для других API endpoints
app.get('/api/advertisement-carousel', (req, res) => {
  res.json([{
    id: 1,
    title: 'Добро пожаловать в AutoBid.TJ',
    description: 'Лучшая платформа автоаукционов Таджикистана',
    imageUrl: '/assets/banner1.jpg'
  }]);
});

app.get('/api/sell-car-banner', (req, res) => {
  res.json({
    id: 1,
    title: 'Продай свое авто!',
    description: 'Быстро и выгодно на AutoBid.TJ',
    buttonText: 'Подать объявление'
  });
});

app.get('/api/users/:id/favorites', (req, res) => {
  res.json([]);
});

app.get('/api/messages/unread-count/:userId', (req, res) => {
  res.json({ count: "0" });
});

// SPA fallback для фронтенда
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile('/var/www/autobid/dist/public/index.html');
  }
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AutoBid.TJ Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Infrastructure test: http://localhost:${PORT}/api/test-infrastructure`);
});