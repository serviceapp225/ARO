import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { deploymentSafeInit } from "./deploymentSafeInit";
import { createTables } from "./createTables";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { storage } from "./storage";
import fs from "fs";
import multer from "multer";
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { websocketManager } from './websocket';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Инициализация базы данных
async function initializeDatabase() {
  try {
    console.log('🔄 Инициализация базы данных...');
    await deploymentSafeInit();
    await createTables();
    console.log('✅ База данных инициализирована');
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
  }
}

// Создаем Express приложение
const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Инициализируем базу данных
await initializeDatabase();

// Middleware
app.use(compression({
  threshold: 0,
  level: 6
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Кэширование
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'public, max-age=120');
  } else if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000');
  }
  next();
});

// Настройка multer для загрузки файлов
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.use('/uploads', express.static(uploadsDir));

// CORS для production
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://oyster-app-mfkeh.ondigitalocean.app',
    'https://narxi.tu',
    'https://www.narxi.tu'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID, X-User-Email');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

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
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Production server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Создаем HTTP сервер
const server = createServer(app);

// Настройка WebSocket
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

// Инициализация WebSocket менеджера
websocketManager.initialize(wss);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`📊 Health check available at http://0.0.0.0:${PORT}/health`);
  console.log(`🔌 WebSocket server available at ws://0.0.0.0:${PORT}/ws`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});

export default app;