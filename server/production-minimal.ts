import express from "express";
import compression from "compression";
import fs from "fs";
import path from "path";

const app = express();

// Включаем compression для всех ответов
app.use(compression());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Простое логирование
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api") || req.path === "/health") {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

console.log("🚀 Запуск MINIMAL приложения в продакшене...");
console.log(`🔧 NODE_ENV = ${process.env.NODE_ENV}`);
console.log(`🔧 PORT = ${process.env.PORT || '8080'}`);

// Health check endpoint - должен быть ПЕРВЫМ
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mode: 'minimal-production'
  });
});

// Базовый API endpoint для тестирования
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running', 
    mode: 'minimal-production',
    timestamp: new Date().toISOString()
  });
});

// Статические файлы assets
const possibleAssetsPaths = [
  path.join(process.cwd(), 'dist', 'public', 'assets'),
  path.join(process.cwd(), 'dist', 'assets'),
  path.join(process.cwd(), 'public', 'assets')
];

console.log(`🔍 Ищем assets директории:`);
let assetsPath = null;

for (const testPath of possibleAssetsPaths) {
  console.log(`📁 Проверяем: ${testPath} - ${fs.existsSync(testPath) ? 'ЕСТЬ' : 'НЕТ'}`);
  if (fs.existsSync(testPath)) {
    assetsPath = testPath;
    break;
  }
}

if (assetsPath) {
  console.log(`✅ Найдена assets директория: ${assetsPath}`);
  app.use('/assets', express.static(assetsPath));
}

// Обслуживание статических файлов для продакшена
const staticPath = path.join(process.cwd(), 'dist', 'public');
if (fs.existsSync(staticPath)) {
  console.log(`🔧 PRODUCTION: Обслуживаем статические файлы из: ${staticPath}`);
  app.use(express.static(staticPath));
}

// SPA fallback для всех остальных маршрутов (только для существующих файлов)
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    // Читаем index.html и проверяем наличие Replit зависимостей
    try {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      if (indexContent.includes('@replit/')) {
        // Если есть Replit зависимости - отдаём простую страницу
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>AutoBid.TJ - Minimal Mode</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .status { color: green; font-size: 18px; }
              .info { margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>🚀 AutoBid.TJ</h1>
            <div class="status">✅ Сервер работает в minimal режиме</div>
            <div class="info">Приложение успешно развёрнуто и готово к настройке базы данных</div>
            <div class="info">Health check: <a href="/health">/health</a></div>
            <div class="info">API Status: <a href="/api/status">/api/status</a></div>
          </body>
          </html>
        `);
      } else {
        res.sendFile(indexPath);
      }
    } catch (error) {
      console.error('Ошибка чтения index.html:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(404).send('Not Found - Index.html not available');
  }
});

const PORT = parseInt(process.env.PORT || "8080");
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ MINIMAL PRODUCTION server started on port ${PORT}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/health`);
});