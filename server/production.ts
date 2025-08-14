import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { deploymentSafeInit } from "./deploymentSafeInit";
import { createTables } from "./createTables";
import { serveStatic, log } from "./vite";
import { storage } from "./storage";
import { ImageUpdateService } from "./imageUpdateService";
import fs from "fs";
import path from "path";


const app = express();

// Включаем compression для всех ответов
app.use(compression());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - только для API запросов
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any = null;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Безопасная инициализация базы данных для деплоя
  console.log("🚀 Запуск приложения в продакшене с безопасной инициализацией...");
  
  try {
    // Простая проверка переменных окружения
    console.log(`🔧 PRODUCTION: NODE_ENV = ${process.env.NODE_ENV}`);
    console.log(`🔧 PRODUCTION: PORT = ${process.env.PORT || '8080'}`);
    console.log(`🔧 PRODUCTION: DATABASE_URL = ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
    
    // Инициализация только если есть подключение к БД
    if (process.env.DATABASE_URL) {
      await deploymentSafeInit();
      ImageUpdateService.initializeOnStartup();
    } else {
      console.log("⚠️ PRODUCTION: База данных не настроена, запускаем в режиме static server");
    }
    
    console.log("✅ DEPLOYMENT: Инициализация завершена успешно");
  } catch (error) {
    console.error("⚠️ DEPLOYMENT: Ошибка инициализации БД:", error);
    console.log("📝 DEPLOYMENT: Продолжаем запуск приложения...");
  }
  
  // Статические файлы assets ПЕРЕД API роутами
  const possibleAssetsPaths = [
    path.join(process.cwd(), 'dist', 'public', 'assets'),
    path.join(import.meta.dirname, 'public', 'assets'),
    path.join(process.cwd(), 'dist', 'assets'),
    path.join(process.cwd(), 'public', 'assets'),
    path.join(process.cwd(), 'server', 'public', 'assets')
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
    
    // Настраиваем обработку /assets с правильными MIME типами ПЕРЕД API роутами
    app.use('/assets', express.static(assetsPath, {
      setHeaders: (res, filePath) => {
        console.log(`📄 Отдаем статический файл: ${filePath}`);
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          console.log(`✅ JS файл: установлен Content-Type: application/javascript`);
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
          console.log(`✅ CSS файл: установлен Content-Type: text/css`);
        }
      }
    }));
    console.log(`✅ Обработка /assets настроена ПЕРЕД API роутами`);
    console.log(`🔧 ROUTES: Настройка обработки /assets для директории: ${assetsPath}`);
    console.log(`✅ ROUTES: Статические файлы /assets настроены`);
  } else {
    console.log(`❌ Не найдена assets директория, /assets может не работать`);
  }

  // Добавляем health check endpoint ПЕРЕД API роутами
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Регистрируем API роуты (включая WebSocket)
  const server = await registerRoutes(app);

  // Обслуживание статических файлов для продакшена
  const staticPath = path.join(process.cwd(), 'dist', 'public');
  if (fs.existsSync(staticPath)) {
    console.log(`🔧 PRODUCTION: Обслуживаем статические файлы из: ${staticPath}`);
    app.use(express.static(staticPath));
  }

  // SPA fallback для всех остальных маршрутов
  app.get('*', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Not Found');
    }
  });

  const PORT = parseInt(process.env.PORT || "8080");
  server.listen(PORT, "0.0.0.0", () => {
    log(`PRODUCTION serving on port ${PORT}`);
  });
})();