import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { deploymentSafeInit } from "./deploymentSafeInit";
import { createTables } from "./createTables";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";
import path from "path";

// Загрузка переменных окружения из .env файла
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

const app = express();

// Enable gzip compression for all responses
app.use(compression({
  threshold: 0, // Compress all responses
  level: 6 // Good balance between compression and speed
}));

// Add caching headers for better performance
app.use((req, res, next) => {
  // Максимальное кэширование для критических API запросов
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'public, max-age=120'); // 2 минуты кэш
  } else if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    // Cache static assets for 24 hours
    res.set('Cache-Control', 'public, max-age=86400');
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  // ВРЕМЕННО ВКЛЮЧАЕМ логгирование для диагностики POST запросов
  // if (req.path.startsWith('/api/')) {
  //   return next();
  // }
  
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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
  console.log("🚀 Запуск приложения с безопасной инициализацией...");
  
  try {
    await deploymentSafeInit();
    console.log("✅ DEPLOYMENT: Инициализация завершена успешно");
  } catch (error) {
    console.error("⚠️ DEPLOYMENT: Ошибка инициализации БД:", error);
    console.log("📝 DEPLOYMENT: Продолжаем запуск приложения...");
  }
  
  // КРИТИЧНО: Обрабатываем статические файлы /assets ПЕРЕД API роутами
  if (app.get("env") !== "development") {
    // В production добавляем специальную обработку для /assets
    const assetsPath = path.join(process.cwd(), 'dist', 'assets');
    if (fs.existsSync(assetsPath)) {
      app.use('/assets', express.static(assetsPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
          }
        }
      }));
    }
  }
  
  let server;
  if (app.get("env") === "development") {
    // В разработке Vite обрабатывает статические файлы
    server = await registerRoutes(app);
    await setupVite(app, server);
  } else {
    // В production сначала настраиваем остальные статические файлы
    server = await registerRoutes(app);
    serveStatic(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // DEPLOYMENT: Use PORT from environment or fallback to 3000 for Replit deployment
  // Replit deployment expects port 3000 to be the primary port
  // Development mode uses 5000 as configured in workflow
  
  const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 5000);
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
