import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { deploymentSafeInit } from "./deploymentSafeInit";
import { createTables } from "./createTables";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { ImageUpdateService } from "./imageUpdateService";
import fs from "fs";
import path from "path";
import multer from "multer";

// Функция для создания дефолтного банера "Продай свое авто"
async function ensureDefaultSellCarBanner() {
  try {
    console.log("🎯 Проверяем наличие банера 'Продай свое авто'...");
    
    const existingCarousels = await storage.getAdvertisementCarousel();
    
    // Проверяем, есть ли банер "Продать автомобиль"
    const sellCarBanner = existingCarousels.find(carousel => 
      carousel.title.includes("Продай") || 
      carousel.title.includes("автомобиль") || 
      carousel.title.includes("авто")
    );
    
    if (!sellCarBanner) {
      console.log("🎯 Банер 'Продай свое авто' не найден, создаем дефолтный...");
      
      // Создаем банер с рабочими внешними изображениями
      await storage.createAdvertisementCarouselItem({
        title: "Продай свое авто",
        description: "Размести объявление и получи максимальную выгоду от продажи",
        imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        linkUrl: "/create-listing",
        buttonText: "Разместить объявление",
        isActive: true,
        order: 1
      });
      
      console.log("✅ Дефолтный банер 'Продай свое авто' создан успешно!");
    } else {
      console.log("✅ Банер 'Продай свое авто' уже существует");
    }
  } catch (error) {
    console.error("⚠️ Ошибка при создании дефолтного банера:", error);
  }
}

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

// Настройка multer для файловых загрузок
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
    files: 20 // max 20 files
  }
});

// Увеличиваем лимиты для JSON и добавляем multer для файлов
app.use(express.json({ limit: '150mb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '150mb', parameterLimit: 50000 }));

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
    
    // Банер "Продай свое авто" удален по запросу пользователя
    // await ensureDefaultSellCarBanner();
    
    // Инициализация автоматического скачивания изображений
    ImageUpdateService.initializeOnStartup();
    
    console.log("✅ DEPLOYMENT: Инициализация завершена успешно");
  } catch (error) {
    console.error("⚠️ DEPLOYMENT: Ошибка инициализации БД:", error);
    console.log("📝 DEPLOYMENT: Продолжаем запуск приложения...");
  }
  
  // КРИТИЧНО: Всегда обрабатываем статические файлы /assets ПЕРЕД API роутами
  // Проверяем все возможные пути для статических файлов
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
  } else {
    console.log(`❌ Assets директория не найдена ни в одном из путей`);
  }
  
  // Определяем режим работы
  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.env.REPLIT_DEPLOYMENT === '1' ||
                       (typeof process.env.REPL_OWNER !== 'undefined' && process.env.PORT);



  const server = await registerRoutes(app);

  if (isProduction) {
    console.log(`🔧 PRODUCTION: Используем serveStatic`);
    serveStatic(app);
  } else {
    console.log(`🔧 DEVELOPMENT: Используем setupVite`);
    await setupVite(app, server);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // VPS DEPLOYMENT: Use PORT from environment variable
  // For VPS deployment, PORT environment variable must be set explicitly
  // Fallback to 5000 for development mode only
  
  const port = process.env.PORT || 5000;
  server.listen({
    port: Number(port),
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
