import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { registerRoutes } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Создаем Express приложение
const app = express();
const PORT = Number(process.env.PORT) || 5000;

console.log('🔗 Подключение к базе данных PostgreSQL');

// Middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS для production
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://oyster-app-mfkeh.ondigitalocean.app',
    'https://narxi.tu',
    'https://www.narxi.tu'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID, X-User-Email');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Настройка статических файлов
console.log('🔧 ROUTES: Настройка обработки /assets для директории:', path.join(__dirname, '../public/assets'));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));
console.log('✅ ROUTES: Статические файлы /assets настроены');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API routes
registerRoutes(app);

// Serve static files from public directory  
app.use(express.static(path.join(__dirname, '../public')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Production server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running at http://0.0.0.0:${PORT}`);
  console.log(`📁 Static files served from: ${path.join(__dirname, '../public')}`);
});