import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { SQLiteStorage } from "./sqliteStorage";
import { createTables } from "./createTables";
import { serveStatic, log } from "./vite";
import fs from "fs";
import path from "path";
import { createServer } from "http";
import { WebSocketServer } from "ws";

// Переменные окружения для deployment
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'production';

console.log(`🚀 DEPLOYMENT СЕРВЕР ЗАПУЩЕН`);
console.log(`📦 NODE_ENV: ${NODE_ENV}`);
console.log(`🔌 PORT: ${PORT}`);

const app = express();

// Включаем сжатие для всех ответов
app.use(compression({
  threshold: 0,
  level: 6
}));

// Кэширование для deployment
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'public, max-age=120');
  } else if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.set('Cache-Control', 'public, max-age=86400');
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Инициализация SQLite хранилища
const storage = new SQLiteStorage();

// Настройка статических файлов для deployment
const publicPath = path.join(process.cwd(), 'dist', 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log(`📁 Статические файлы: ${publicPath}`);
}

// Регистрация API роутов
registerRoutes(app, storage);

// Обслуживание SPA для всех не-API роутов
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found');
  }
});

// Создание HTTP сервера
const server = createServer(app);

// WebSocket сервер для real-time обновлений
const wss = new WebSocketServer({ server });

// Простая WebSocket обработка
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket подключение установлено');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (err) {
      console.error('❌ Ошибка WebSocket:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket подключение закрыто');
  });
});

console.log('🔌 WebSocket сервер запущен для real-time аукционов');

// Запуск сервера
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Режим: ${NODE_ENV}`);
  console.log(`📊 SQLite база данных активна`);
  console.log(`🔌 WebSocket работает`);
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});