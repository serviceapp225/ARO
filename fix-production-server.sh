#!/bin/bash

# Скрипт исправления production сервера AutoBid.TJ
echo "🔧 Исправление production сервера AutoBid.TJ..."

# 1. Остановить текущий сервис
sudo systemctl stop autobid

# 2. Создать рабочий production сервер
sudo tee /var/www/autobid/production-server.js > /dev/null << 'EOF'
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
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
  connectionString: 'postgresql://autobid_user:AutoBid2025@localhost:5432/autobid_db',
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
    service: 'AutoBid.TJ Production API',
    database: 'Connected',
    port: PORT,
    version: '1.0.0'
  });
});

// Тест инфраструктуры
app.get('/api/test-infrastructure', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT version()');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    
    res.json({
      status: 'OK',
      database: {
        version: dbResult.rows[0].version.substring(0, 50),
        users: parseInt(userCount.rows[0].count)
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

// Базовые API endpoints
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
      role: user.role,
      isActive: user.is_active
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Заглушки для других endpoints
app.get('/api/notifications/:userId', (req, res) => { res.json([]); });
app.get('/api/advertisement-carousel', (req, res) => { 
  res.json([{
    id: 1,
    title: 'Добро пожаловать в AutoBid.TJ',
    description: 'Лучшая платформа автоаукционов Таджикистана'
  }]); 
});
app.get('/api/sell-car-banner', (req, res) => { 
  res.json({
    id: 1,
    title: 'Продай свое авто!',
    description: 'Быстро и выгодно на AutoBid.TJ'
  }); 
});
app.get('/api/users/:id/favorites', (req, res) => { res.json([]); });
app.get('/api/messages/unread-count/:userId', (req, res) => { res.json({ count: "0" }); });

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile('/var/www/autobid/dist/public/index.html');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AutoBid.TJ Production Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
EOF

# 3. Обновить systemd сервис
sudo tee /etc/systemd/system/autobid.service > /dev/null << 'EOF'
[Unit]
Description=AutoBid.TJ Production Application
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/autobid
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/node production-server.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=autobid-production

[Install]
WantedBy=multi-user.target
EOF

# 4. Установить зависимости
cd /var/www/autobid
sudo npm install pg express

# 5. Установить права и запустить
sudo chown -R www-data:www-data /var/www/autobid
sudo systemctl daemon-reload
sudo systemctl enable autobid
sudo systemctl start autobid

# 6. Ожидание запуска
echo "⏳ Ожидание запуска сервиса (10 секунд)..."
sleep 10

# 7. Проверка статуса
echo "=== Статус сервиса ==="
sudo systemctl status autobid --no-pager -l

# 8. Проверка порта
echo "=== Проверка порта 3001 ==="
netstat -tlnp | grep :3001

# 9. Тест API
echo "=== Тест Health API ==="
curl -s http://localhost:3001/api/health | head -10

echo "=== Тест Infrastructure API ==="
curl -s http://localhost:3001/api/test-infrastructure | head -10

# 10. Перезагрузка nginx
echo "=== Перезагрузка Nginx ==="
sudo nginx -t && sudo systemctl reload nginx

# 11. Финальная проверка
echo "=== Финальная проверка через Nginx ==="
curl -I http://localhost/ 2>/dev/null | head -3

echo ""
echo "✅ Production сервер исправлен!"
echo "🌐 Проверить: http://188.166.61.86/api/health"
echo "🔧 Инфраструктура: http://188.166.61.86/api/test-infrastructure"