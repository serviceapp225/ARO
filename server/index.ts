import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { initializeDatabaseWithSampleData } from "./initDatabase";
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
  // Приложение использует память для хранения данных
  console.log("✅ Приложение запущено с функциональными данными в памяти");
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // Отключаем автоматическое архивирование для лучшей производительности
  // Архивирование доступно через админ панель по требованию

  const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 5000);
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
