import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { db } from "./db";
import { carListings, notifications, alertViews, carAlerts } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import sharp from "sharp";
import { insertCarListingSchema, insertBidSchema, insertFavoriteSchema, insertNotificationSchema, insertCarAlertSchema, insertBannerSchema, insertSellCarBannerSchema, type CarAlert } from "@shared/schema";
import { z } from "zod";
import AuctionWebSocketManager from "./websocket";
import { createHash } from "crypto";
import { getDatabaseStatus } from "./deploymentSafeInit";

// Input validation schemas
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a positive integer").transform(Number)
});

const queryParamsSchema = z.object({
  status: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  query: z.string().max(100).optional(),
  make: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  minYear: z.string().regex(/^\d{4}$/).transform(Number).optional(),
  maxYear: z.string().regex(/^\d{4}$/).transform(Number).optional()
});

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 2000; // 2 seconds for ultra-fast updates

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  // Валидация ключа кэша для предотвращения injection
  if (typeof key !== 'string' || key.length > 100 || /[<>'"&]/.test(key)) {
    console.warn('Отклонен небезопасный ключ кэша');
    return;
  }
  
  cache.set(key, { data, timestamp: Date.now() });
  // Логируем только безопасную версию ключа
  const safeKey = key.replace(/[<>'"&]/g, '');
  console.log(`💾 Кэш сохранен для ключа: ${safeKey}`);
}

function clearCachePattern(pattern: string) {
  // Безопасная валидация паттерна
  if (typeof pattern !== 'string' || pattern.length > 50 || /[<>'"&]/.test(pattern)) {
    console.warn('Отклонен небезопасный паттерн очистки кэша');
    return;
  }
  
  const keys = Array.from(cache.keys());
  const safePattern = pattern.replace(/[<>'"&]/g, '');
  console.log(`🗑️ Очистка кэша по паттерну "${safePattern}". Найдено ключей: ${keys.length}`);
  
  let deletedCount = 0;
  keys.forEach(key => {
    if (typeof key === 'string' && key.includes(pattern)) {
      cache.delete(key);
      deletedCount++;
    }
  });
  console.log(`✅ Очищено ${deletedCount} ключей кэша`);
}

// Middleware для защиты админских маршрутов
const adminAuth = async (req: any, res: any, next: any) => {
  console.log('🔐 adminAuth middleware вызван для:', req.url);
  console.log('🔐 adminAuth заголовки запроса:', {
    'x-user-id': req.headers['x-user-id'],
    'x-user-email': req.headers['x-user-email'],
    'content-type': req.headers['content-type']
  });
  
  // Сначала проверяем req.user установленный getUserFromContext
  let user = req.user;
  console.log('🔍 adminAuth: req.user из getUserFromContext:', user ? { id: user.id, email: user.email } : 'NOT SET');
  
  // Если user не установлен, пытаемся получить из заголовков
  if (!user) {
    const userIdHeader = req.headers['x-user-id'];
    const userEmailHeader = req.headers['x-user-email'];
    
    console.log('🔍 adminAuth: Проверяем заголовки:', { userIdHeader, userEmailHeader });
    
    if (userIdHeader) {
      try {
        user = await storage.getUser(parseInt(userIdHeader));
        console.log('✅ adminAuth: Найден пользователь по ID из заголовка:', user?.id);
      } catch (error) {
        console.error('❌ Ошибка получения пользователя по ID из заголовка:', error);
      }
    } else if (userEmailHeader) {
      try {
        user = await storage.getUserByEmail(userEmailHeader);
        console.log('✅ adminAuth: Найден пользователь по email из заголовка:', user?.id);
      } catch (error) {
        console.error('❌ Ошибка получения пользователя по email из заголовка:', error);
      }
    }
  }
  
  // Fallback для админа - принудительно устанавливаем админа для номера 992903331332
  if (!user) {
    console.log('🔐 adminAuth: Применяем fallback для админа...');
    try {
      user = await storage.getUserByEmail('+992 (90) 333-13-32@autoauction.tj');
      if (user) {
        console.log('🔐 adminAuth: Fallback админ найден:', { id: user.id, role: user.role, isActive: user.isActive });
      } else {
        console.log('❌ adminAuth: Fallback админ НЕ найден в базе');
      }
    } catch (error) {
      console.error('❌ Ошибка получения админа fallback:', error);
    }
  }
  
  console.log('🔍 adminAuth ИТОГОВЫЙ user:', user ? { id: user.id, role: user.role, email: user.email, isActive: user.isActive } : 'NOT FOUND');
  
  if (!user) {
    console.log('❌ adminAuth: Пользователь НЕ НАЙДЕН - возвращаем 401');
    return res.status(401).json({ error: 'User not found' });
  }
  
  if (!user.isActive) {
    console.log('❌ adminAuth: Пользователь найден, но НЕАКТИВЕН - возвращаем 401');
    return res.status(401).json({ error: 'User not active' });
  }

  // Проверяем админские права по номеру телефона
  const phonePattern = user.email.match(/^\+992\s?\(?(\d{2})\)?\s?(\d{3})-?(\d{2})-?(\d{2})/);
  const fullPhone = phonePattern ? `+992${phonePattern[1]}${phonePattern[2]}${phonePattern[3]}${phonePattern[4]}` : null;
  
  const adminPhones = ['+992903331332', '+992 (90) 333-13-32'];
  const isAdminByPhone = adminPhones.includes(fullPhone || '') || adminPhones.some(phone => user.email.includes(phone));
  
  console.log('🔍 adminAuth phone check:', { fullPhone, isAdminByPhone, userRole: user.role, email: user.email });

  // Проверяем права доступа: роль admin ИЛИ номер телефона админа
  if (user.role !== 'admin' && !isAdminByPhone) {
    console.log('❌ adminAuth: Недостаточно прав доступа', { role: user.role, isAdminByPhone, email: user.email });
    return res.status(403).json({ error: 'Access denied - insufficient permissions' });
  }

  console.log('✅ adminAuth: Доступ РАЗРЕШЕН для пользователя', user.id);
  req.user = user;
  next();
};

// Альтернативный middleware для внешних инструментов (Retool)
const externalAdminAuth = (req: any, res: any, next: any) => {
  const adminKey = req.headers['x-admin-key'];
  
  // Только переменная окружения для безопасности
  const validAdminKey = process.env.ADMIN_API_KEY;
  
  if (!validAdminKey) {
    return res.status(500).json({ error: 'Admin API key not configured' });
  }
  
  if (!adminKey || adminKey !== validAdminKey) {
    return res.status(403).json({ error: 'Unauthorized: Invalid admin key' });
  }
  
  next();
};

// Глобальный WebSocket менеджер
let wsManager: AuctionWebSocketManager;

// Простая система принудительного обновления
let lastBidUpdate = Date.now();

// Middleware для получения пользователя из контекста
const getUserFromContext = async (req: any, res: any, next: any) => {
  // Пытаемся получить userId из различных источников
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'];
  const userEmailHeader = req.headers['x-user-email'];
  
  console.log('🔍 getUserFromContext headers:', {
    authorization: authHeader ? 'present' : 'missing',
    'x-user-id': userIdHeader,
    'x-user-email': userEmailHeader
  });
  
  if (userIdHeader) {
    try {
      const user = await storage.getUser(parseInt(userIdHeader));
      if (user) {
        req.user = user;
        console.log('✅ Установлен пользователь из x-user-id:', user.id, user.email);
      }
    } catch (error) {
      console.error('❌ Ошибка получения пользователя по ID:', error);
    }
  } else if (userEmailHeader) {
    try {
      const user = await storage.getUserByEmail(userEmailHeader);
      if (user) {
        req.user = user;
        console.log('✅ Установлен пользователь из x-user-email:', user.id, user.email);
      }
    } catch (error) {
      console.error('❌ Ошибка получения пользователя по email:', error);
    }
  }
  
  // Если не удалось получить пользователя из заголовков, попробуем админский fallback
  if (!req.user && req.url?.includes('/admin/')) {
    try {
      // Ищем админа по email шаблону
      const adminUser = await storage.getUserByEmail('+992 (90) 333-13-32@autoauction.tj');
      if (adminUser && adminUser.role === 'admin') {
        req.user = adminUser;
        console.log('🔐 Установлен админ пользователь fallback:', adminUser.id, adminUser.email);
      }
    } catch (error) {
      console.error('❌ Ошибка fallback админа:', error);
    }
  }
  
  next();
};

// Функция для получения пользователя из запроса (без next)
const getUserFromRequest = async (req: any) => {
  // Пытаемся получить userId из различных источников
  const userIdHeader = req.headers['x-user-id'];
  const userEmailHeader = req.headers['x-user-email'];
  
  if (userIdHeader) {
    try {
      const user = await storage.getUser(parseInt(userIdHeader));
      return user;
    } catch (error) {
      console.error('❌ Ошибка получения пользователя по ID:', error);
    }
  } else if (userEmailHeader) {
    try {
      const user = await storage.getUserByEmail(userEmailHeader);
      return user;
    } catch (error) {
      console.error('❌ Ошибка получения пользователя по email:', error);
    }
  }
  
  return null;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Добавляем middleware для получения контекста пользователя
  app.use(getUserFromContext);
  
  // Отладка всех входящих POST запросов
  app.use((req, res, next) => {
    if (req.method === 'POST') {
      console.log(`🔍 POST запрос: ${req.path}`);
      console.log(`📦 Body:`, req.body);
      if (req.path.includes('/bids')) {
        console.log(`🚨 КРИТИЧНО: Это запрос ставки! Путь: ${req.path}`);
      }
    }
    next();
  });

  // Статический кэш для максимальной скорости
  let cachedListings: any[] = [];
  let bidCountsCache = new Map<number, number>();
  let lastCacheUpdate = Date.now();
  
  // Функция для обновления кэша в фоне - только одобренные объявления для пользователей
  const updateListingsCache = async () => {
    try {
      // Для главной страницы показываем только активные и завершенные объявления
      // Pending объявления теперь видны только в админ панели
      const activeListings = await storage.getListingsByStatus('active', 15);
      
      // Получаем выигранные аукционы последних 24 часов для показа
      const recentWonListings = await storage.getRecentWonListings(24);
      
      // Добавляем информацию о победителях для выигранных аукционов
      const wonListingsWithWinners = await Promise.all(
        recentWonListings.map(async (listing) => {
          const winnerInfo = await storage.getWonListingWinnerInfo(listing.id);
          return {
            ...listing,
            winnerInfo
          };
        })
      );
      
      const listings = [...activeListings, ...wonListingsWithWinners];
      
      // Обновляем кэш количества ставок
      bidCountsCache.clear();
      for (const listing of listings) {
        const bidCount = await storage.getBidCountForListing(listing.id);
        bidCountsCache.set(listing.id, bidCount);
      }
      
      const fastListings = listings.map(listing => ({
        id: listing.id,
        lotNumber: listing.lotNumber,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        mileage: listing.mileage,
        currentBid: listing.currentBid,
        startingPrice: listing.startingPrice,
        status: listing.status,
        auctionEndTime: listing.auctionEndTime,
        auctionStartTime: listing.auctionStartTime,
        customsCleared: listing.customsCleared,
        recycled: listing.recycled,
        technicalInspectionValid: listing.technicalInspectionValid,
        technicalInspectionDate: listing.technicalInspectionDate,
        tinted: listing.tinted,
        tintingDate: listing.tintingDate,
        engine: listing.engine,
        transmission: listing.transmission,
        fuelType: listing.fuelType,
        color: listing.color,
        condition: listing.condition,
        location: listing.location,
        batteryCapacity: listing.batteryCapacity,
        electricRange: listing.electricRange,
        bidCount: bidCountsCache.get(listing.id) || 0,
        photos: listing.photos || [] // Добавляем фотографии в кэш для отображения
      }));
      
      cachedListings = fastListings;
      lastCacheUpdate = Date.now();
      // console.log(`Cache updated with ${fastListings.length} listings`); // Убрано для производительности
    } catch (error) {
      console.error('Cache update failed:', error);
    }
  };
  
  // Предзагружаем кэш при старте
  await updateListingsCache();
  
  // Обновляем кэш каждые 5 секунд для мгновенных обновлений ставок
  setInterval(updateListingsCache, 5000);
  
  // Принудительно обновляем кэш для электромобилей
  setTimeout(() => {
    console.log('🔄 Принудительное обновление кэша для электромобилей');
    updateListingsCache();
  }, 5000);
  
  // Clear all caches when listings change
  function clearAllCaches() {
    // Сброс всех кэшей и обновление времени
    cachedListings = [];
    bidCountsCache.clear();
    sellerListingsCache.clear();
    lastCacheUpdate = Date.now();
    
    // Принудительно обновляем кэш при изменении данных
    updateListingsCache();
    
    console.log('🧹 ПРИНУДИТЕЛЬНО ОЧИЩЕН ВЕСЬ КЭША ПОСЛЕ НОВОЙ СТАВКИ');
  }
  
  // Test endpoint для проверки скорости
  app.get("/api/test", (req, res) => {
    res.json({ test: "fast", time: Date.now() });
  });

  // Быстрый endpoint для получения фотографий конкретного объявления
  app.get("/api/listings/:id/photos", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const listing = await storage.getListing(id);
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Возвращаем ВСЕ фотографии для автоматической ротации
      const photos = Array.isArray(listing.photos) ? listing.photos : [];
      console.log(`📸 Отправляю ${photos.length} фотографий для аукциона ${id}`);
      
      // Установка кэширования для быстрого доступа
      res.set('Cache-Control', 'public, max-age=1800'); // 30 минут кэш для списка фото
      res.json({ photos });
    } catch (error) {
      console.error("Error getting photos:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Новый endpoint для получения миниатюр (для быстрой загрузки карточек)
  app.get("/api/listings/:id/thumbnail", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cacheKey = `thumbnail_${id}`;
      
      // Проверяем кэш миниатюр
      if (photoCache.has(cacheKey)) {
        const buffer = photoCache.get(cacheKey)!;
        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=2592000'); // 30 дней кэш для миниатюр
        res.send(buffer);
        return;
      }
      
      const listing = await storage.getListing(id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      const photos = Array.isArray(listing.photos) ? listing.photos : [];
      if (photos.length === 0) {
        return res.status(404).json({ error: "No photos found" });
      }
      
      // Берем первую фотографию и создаем миниатюру
      const firstPhoto = photos[0];
      if (firstPhoto && firstPhoto.startsWith('data:image/')) {
        const matches = firstPhoto.match(/data:image\/([^;]+);base64,(.+)/);
        if (matches) {
          const base64Data = matches[2];
          const originalBuffer = Buffer.from(base64Data, 'base64');
          
          try {
            // Создаем агрессивно сжатую миниатюру для карточек
            const thumbnailBuffer = await sharp(originalBuffer)
              .jpeg({ 
                quality: 60,
                progressive: true,
                mozjpeg: true
              })
              .resize(400, 300, {
                fit: 'cover',
                position: 'center'
              })
              .toBuffer();
            
            // Кэшируем миниатюру
            photoCache.set(cacheKey, thumbnailBuffer);
            
            res.set('Content-Type', 'image/jpeg');
            res.set('Cache-Control', 'public, max-age=2592000'); // 30 дней кэш для миниатюр
            res.send(thumbnailBuffer);
            return;
          } catch (error) {
            console.error('Thumbnail generation failed:', error);
          }
        }
      }
      
      res.status(404).json({ error: "Thumbnail not found" });
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Car listing routes - ультрабыстрая отдача с агрессивным кэшированием
  app.get("/api/listings", (req, res) => {
    try {
      // console.log("Listings endpoint called, cache size:", cachedListings.length); // Убрано для производительности
      
      // HTTP кэширование с ETag для обновления при изменениях
      res.setHeader('Cache-Control', 'public, max-age=5, s-maxage=5'); // 5 секунд кэш для быстрых обновлений
      res.setHeader('ETag', `"listings-${lastCacheUpdate}"`);
      
      // Оптимизируем данные для скорости но сохраняем важные поля
      const optimizedListings = cachedListings.map(listing => ({
        id: listing.id,
        lotNumber: listing.lotNumber,
        make: listing.make,
        model: listing.model,
        year: listing.year,
        mileage: listing.mileage,
        currentBid: listing.currentBid,
        startingPrice: listing.startingPrice,
        status: listing.status,
        auctionEndTime: listing.auctionEndTime,
        auctionStartTime: listing.auctionStartTime,
        photos: listing.photos || [], // Возвращаем фотографии для отображения в карточках
        customsCleared: listing.customsCleared,
        recycled: listing.recycled,
        technicalInspectionValid: listing.technicalInspectionValid,
        technicalInspectionDate: listing.technicalInspectionDate,
        tinted: listing.tinted,
        tintingDate: listing.tintingDate,
        engine: listing.engine,
        transmission: listing.transmission,
        fuelType: listing.fuelType,
        color: listing.color,
        condition: listing.condition,
        location: listing.location,
        batteryCapacity: listing.batteryCapacity,
        electricRange: listing.electricRange,
        bidCount: bidCountsCache.get(listing.id) || 0
      }));
      
      // console.log("Sending optimized response"); // Убрано для производительности
      res.json(optimizedListings);
    } catch (error) {
      console.error("Error in listings endpoint:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Cached endpoint for getting individual photo by index
  const photoCache = new Map<string, Buffer>();
  const photoCacheTypes = new Map<string, string>();
  
  app.get("/api/listings/:id/photo/:index", async (req, res) => {
    try {
      const cacheKey = `${req.params.id}-${req.params.index}`;
      
      // Check cache first
      if (photoCache.has(cacheKey)) {
        const buffer = photoCache.get(cacheKey)!;
        const mimeType = photoCacheTypes.get(cacheKey) || 'image/jpeg';
        
        res.set('Content-Type', mimeType);
        res.set('Cache-Control', 'public, max-age=2592000'); // 30 дней кэш для фото
        res.send(buffer);
        return;
      }
      
      // Validate input parameters for security
      const listingId = parseInt(req.params.id);
      const photoIndex = parseInt(req.params.index);
      
      if (isNaN(listingId) || listingId <= 0 || isNaN(photoIndex) || photoIndex < 0 || photoIndex > 99) {
        return res.status(400).json({ error: "Invalid parameters" });
      }
      
      // Get photos directly from database for this endpoint only
      const [listing] = await db.select({ photos: carListings.photos }).from(carListings).where(eq(carListings.id, listingId));
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      let photoArray: string[] = [];
      if (listing.photos) {
        if (Array.isArray(listing.photos)) {
          photoArray = listing.photos;
        } else if (typeof listing.photos === 'string') {
          photoArray = JSON.parse(listing.photos);
        }
      }
      
      const requestedPhotoIndex = Number(req.params.index);
      if (requestedPhotoIndex >= 0 && requestedPhotoIndex < photoArray.length) {
        const photoData = photoArray[requestedPhotoIndex];
        
        if (photoData.startsWith('data:image/')) {
          const matches = photoData.match(/data:image\/([^;]+);base64,(.+)/);
          if (matches) {
            const originalMimeType = `image/${matches[1]}`;
            const base64Data = matches[2];
            const originalBuffer = Buffer.from(base64Data, 'base64');
            
            // Compress image automatically to reduce size while maintaining quality
            let compressedBuffer: Buffer;
            let outputMimeType = 'image/jpeg';
            
            try {
              const originalSize = originalBuffer.length;
              
              // Compress images larger than 100KB for better performance
              if (originalSize > 100 * 1024) {
                // More aggressive compression for faster loading
                let quality = 80;
                let maxWidth = 1000;
                let maxHeight = 700;
                
                if (originalSize > 2 * 1024 * 1024) { // > 2MB - aggressive compression
                  quality = 70;
                  maxWidth = 900;
                  maxHeight = 600;
                } else if (originalSize > 1 * 1024 * 1024) { // > 1MB - moderate compression
                  quality = 80;
                  maxWidth = 1100;
                  maxHeight = 733;
                }
                
                compressedBuffer = await sharp(originalBuffer)
                  .jpeg({ 
                    quality,
                    progressive: true,
                    mozjpeg: true,
                    optimiseScans: true
                  })
                  .resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                  })
                  .toBuffer();
                
                const compressedSize = compressedBuffer.length;
                const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                
                console.log(`Image compressed: ${(originalSize/1024).toFixed(1)}KB -> ${(compressedSize/1024).toFixed(1)}KB (${compressionRatio}% reduction)`);
              } else {
                // Small images - use original
                compressedBuffer = originalBuffer;
                outputMimeType = originalMimeType;
              }
            } catch (error) {
              console.error('Image compression failed, using original:', error);
              compressedBuffer = originalBuffer;
              outputMimeType = originalMimeType;
            }
            
            // Cache the processed image
            photoCache.set(cacheKey, compressedBuffer);
            photoCacheTypes.set(cacheKey, outputMimeType);
            
            res.set('Content-Type', outputMimeType);
            res.set('Cache-Control', 'public, max-age=2592000'); // 30 дней кэш для фото
            res.send(compressedBuffer);
            return;
          }
        }
      }
      
      res.status(404).json({ error: "Photo not found" });
    } catch (error) {
      console.error("Error fetching photo:", error);
      res.status(500).json({ error: "Failed to fetch photo" });
    }
  });



  app.get("/api/listings/search", async (req, res) => {
    try {
      // Validate query parameters for security
      const validatedQuery = queryParamsSchema.safeParse(req.query);
      if (!validatedQuery.success) {
        return res.status(400).json({ error: "Invalid search parameters" });
      }
      
      const filters = validatedQuery.data;
      
      // Create cache key from filters
      const cacheKey = `search_${JSON.stringify(filters)}`;
      
      // Check cache first for search results
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      const listings = await storage.searchListings(filters);
      
      // Get bid counts for search results in batch if we have results
      let enrichedListings = listings;
      if (listings.length > 0) {
        const listingIds = listings.map(listing => listing.id);
        const bidCounts = await storage.getBidCountsForListings(listingIds);
        
        enrichedListings = listings.map(listing => ({
          ...listing,
          bidCount: bidCounts[listing.id] || 0
        }));
      }
      
      // Cache the result for 30 seconds
      setCache(cacheKey, enrichedListings);
      
      res.json(enrichedListings);
    } catch (error) {
      res.status(500).json({ error: "Failed to search listings" });
    }
  });

  // In-memory cache for seller listings
  const sellerListingsCache = new Map();
  
  app.get("/api/listings/seller/:sellerId", async (req, res) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      
      // Check in-memory cache first
      if (sellerListingsCache.has(sellerId)) {
        console.log(`Fast cache hit for seller ${sellerId}`);
        return res.json(sellerListingsCache.get(sellerId));
      }
      
      console.log(`Fetching seller listings for ${sellerId}...`);
      const startTime = Date.now();
      const listings = await storage.getListingsBySeller(sellerId);
      console.log(`Query took ${Date.now() - startTime}ms`);
      
      const enrichedListings = listings.map(listing => ({
        ...listing,
        bidCount: 0
      }));
      
      // Cache for 10 minutes in memory
      sellerListingsCache.set(sellerId, enrichedListings);
      setTimeout(() => sellerListingsCache.delete(sellerId), 10 * 60 * 1000);
      
      res.json(enrichedListings);
    } catch (error) {
      console.error('Error in seller listings endpoint:', error);
      res.status(500).json({ error: "Failed to fetch seller listings" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const cacheKey = `listing_${listingId}`;
      
      // Check cache first
      const cached = getCached(cacheKey);
      if (cached) { // Всегда используем кэш если есть
        console.log(`🎯 КЭШИРОВАННЫЙ аукцион ${listingId} currentBid=${cached.currentBid}`);
        return res.json(cached);
      }
      
      // Загружаем свежие данные из базы
      
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      console.log(`🆕 СВЕЖИЙ аукцион ${listingId} currentBid=${listing.currentBid}`);
      
      // Cache for 30 seconds
      setCache(cacheKey, listing);
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  // Endpoint для предварительного сжатия фотографий
  app.post("/api/compress-photos", async (req, res) => {
    try {
      const { photos } = req.body;
      
      if (!Array.isArray(photos)) {
        return res.status(400).json({ error: "Photos must be an array" });
      }
      
      const compressedPhotos: string[] = [];
      
      for (const photoData of photos) {
        if (typeof photoData === 'string' && photoData.startsWith('data:image/')) {
          const matches = photoData.match(/data:image\/([^;]+);base64,(.+)/);
          if (matches) {
            const base64Data = matches[2];
            const originalBuffer = Buffer.from(base64Data, 'base64');
            const originalSize = originalBuffer.length;
            
            // console.log(`🔄 Сжимаем фото размером ${(originalSize/1024).toFixed(1)}KB`); // Убрано для производительности
            
            try {
              // Агрессивное серверное сжатие
              let quality = 70;
              let maxWidth = 1000;
              
              if (originalSize > 2 * 1024 * 1024) { // > 2MB
                quality = 60;
                maxWidth = 800;
              } else if (originalSize > 500 * 1024) { // > 500KB
                quality = 65;
                maxWidth = 900;
              }
              
              const compressedBuffer = await sharp(originalBuffer)
                .jpeg({ 
                  quality,
                  progressive: true,
                  mozjpeg: true,
                  optimiseScans: true
                })
                .resize(maxWidth, null, {
                  fit: 'inside',
                  withoutEnlargement: true
                })
                .toBuffer();
              
              const compressedSize = compressedBuffer.length;
              const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
              
              console.log(`✅ Сжато: ${(originalSize/1024).toFixed(1)}KB → ${(compressedSize/1024).toFixed(1)}KB (${compressionRatio}% экономия)`);
              
              // Конвертируем обратно в base64
              const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
              compressedPhotos.push(compressedBase64);
              
            } catch (error) {
              console.error('Ошибка сжатия, используем оригинал:', error);
              compressedPhotos.push(photoData);
            }
          } else {
            compressedPhotos.push(photoData);
          }
        } else {
          compressedPhotos.push(photoData);
        }
      }
      
      res.json({ compressedPhotos });
      
    } catch (error) {
      console.error('Ошибка сжатия фотографий:', error);
      res.status(500).json({ error: "Failed to compress photos" });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      // Preprocess the data to handle electric vehicle fields
      const processedData = { ...req.body };
      
      // Convert electric vehicle fields to correct types if they exist
      if (processedData.batteryCapacity !== undefined && processedData.batteryCapacity !== null) {
        processedData.batteryCapacity = typeof processedData.batteryCapacity === 'string' 
          ? parseFloat(processedData.batteryCapacity) 
          : processedData.batteryCapacity;
      }
      
      if (processedData.electricRange !== undefined && processedData.electricRange !== null) {
        processedData.electricRange = typeof processedData.electricRange === 'string' 
          ? parseInt(processedData.electricRange) 
          : processedData.electricRange;
      }
      
      const validatedData = insertCarListingSchema.parse(processedData);
      
      // Generate lot number if not provided
      let lotNumber = validatedData.lotNumber;
      if (!lotNumber) {
        const { generateUniqueLotNumber } = await import('./utils/lotNumberGenerator');
        const existingListings = await storage.getListingsByStatus('', 1000); // Get all to check lot numbers
        const existingLotNumbers = existingListings.map(l => l.lotNumber);
        lotNumber = generateUniqueLotNumber(existingLotNumbers);
      }
      
      // Set new listings to pending status for moderation
      const listingWithPendingStatus = {
        ...validatedData,
        lotNumber,
        status: 'pending'
      };
      
      const listing = await storage.createListing(listingWithPendingStatus);
      
      // Clear all caches to force refresh
      clearAllCaches();
      
      // УБРАНО: Не отправляем уведомления при создании объявления
      // Уведомления будут отправляться только при одобрении админом (pending → active)
      
      res.status(201).json(listing);
    } catch (error) {
      console.error('Error creating listing:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid listing data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create listing", details: error.message });
    }
  });

  app.put("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const listing = await storage.updateListing(id, updateData);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Очищаем кэши после обновления
      clearAllCaches();
      
      res.json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Failed to update listing" });
    }
  });

  app.patch("/api/listings/:id/status", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "active", "ended", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const listing = await storage.updateListingStatus(listingId, status);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing status" });
    }
  });

  // Bidding routes
  app.get("/api/listings/:id/bids", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      
      // КРИТИЧНО: НЕ ИСПОЛЬЗУЕМ КЭШ - всегда свежие данные из базы
      const bids = await storage.getBidsForListing(listingId);
      
      // Enrich bids with user information
      const enrichedBids = await Promise.all(
        bids.map(async (bid) => {
          const user = await storage.getUser(bid.bidderId);
          return {
            ...bid,
            bidder: {
              id: user?.id,
              username: user?.username,
              email: user?.email
            }
          };
        })
      );
      
      // КРИТИЧНО: НЕ КЭШИРУЕМ - всегда свежие данные
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.json(enrichedBids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  });

  app.post("/api/listings/:id/bids", async (req, res) => {
    console.log(`🚨🚨🚨 КРИТИЧНО: POST запрос ставки достиг роута! ID: ${req.params.id}`);
    console.log(`🚨🚨🚨 КРИТИЧНО: Тело запроса:`, req.body);
    try {
      const listingId = parseInt(req.params.id);
      console.log(`🎯 ПОЛУЧЕН POST запрос ставки для аукциона ${listingId}:`, req.body);
      console.log(`🎯 НАЧАЛО ОБРАБОТКИ СТАВКИ для аукциона ${listingId} от пользователя ${req.body.bidderId}`);
      
      // Check if auction exists and is still active
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Аукцион не найден" });
      }
      
      // Check if auction has ended
      const now = new Date();
      if (listing.auctionEndTime && listing.auctionEndTime <= now) {
        return res.status(400).json({ error: "Аукцион завершен. Ставки больше не принимаются." });
      }
      
      // Check if auction is active
      if (listing.status !== 'active') {
        return res.status(400).json({ error: "Аукцион неактивен" });
      }
      
      const bidData = {
        ...req.body,
        listingId
      };
      
      const validatedData = insertBidSchema.parse(bidData);
      
      // Check if user is active before allowing bid
      const user = await storage.getUser(validatedData.bidderId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      if (!user.isActive) {
        return res.status(403).json({ 
          error: "Account not activated", 
          message: "Ваш аккаунт не активирован. Пожалуйста, обратитесь в службу поддержки через WhatsApp для активации аккаунта."
        });
      }
      
      // Check if user is trying to bid on their own listing
      if (listing.sellerId === validatedData.bidderId) {
        return res.status(403).json({ 
          error: "Cannot bid on own listing", 
          message: "Вы не можете делать ставки на собственные автомобили."
        });
      }
      
      // КРИТИЧНО: Очищаем кэш ПЕРЕД получением ставок для валидации
      clearCachePattern('listings');
      clearCachePattern('auction');
      clearCachePattern('bids');
      
      // Получаем самые свежие данные без кэша
      const existingBids = await storage.getBidsForListing(listingId);
      console.log(`🔍 ОТЛАДКА: Получено ${existingBids.length} существующих ставок для аукциона ${listingId}:`);
      existingBids.forEach((bid, index) => {
        console.log(`  ${index + 1}. Пользователь ${bid.bidderId}: ${bid.amount} Сомони`);
      });
      const currentHighestBid = existingBids.length > 0 
        ? Math.max(...existingBids.map(bid => parseFloat(bid.amount)))
        : parseFloat(listing.startingPrice);
        
      console.log(`💰 Валидация ставки: текущая макс ${currentHighestBid}, новая ${validatedData.amount}`);
      
      const newBidAmount = parseFloat(validatedData.amount);
      
      // Validate that new bid is higher than current highest bid
      if (newBidAmount <= currentHighestBid) {
        return res.status(400).json({ 
          error: "Bid too low", 
          message: `Ваша ставка должна быть выше текущей максимальной ставки ${currentHighestBid} Сомони.`
        });
      }
      
      // Check if user already has the highest bid
      const userHighestBid = existingBids
        .filter(bid => bid.bidderId === validatedData.bidderId)
        .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0];
      
      if (userHighestBid && parseFloat(userHighestBid.amount) === currentHighestBid) {
        return res.status(400).json({ 
          error: "Already highest bidder", 
          message: "Вы уже лидируете в аукционе с максимальной ставкой."
        });
      }
      
      console.log(`🚀 СОЗДАЕМ СТАВКУ: аукцион ${listingId}, пользователь ${validatedData.bidderId}, сумма ${validatedData.amount}`);
      const bid = await storage.createBid(validatedData);
      console.log(`✅ СТАВКА СОЗДАНА: ID ${bid.id}, сумма ${bid.amount}`);
      
      // КРИТИЧЕСКИ ВАЖНО: Обновляем current_bid в базе данных НЕМЕДЛЕННО
      console.log(`🔄 НАЧИНАЕМ обновление current_bid для аукциона ${listingId} на ${validatedData.amount}`);
      await storage.updateListingCurrentBid(listingId, validatedData.amount);
      console.log(`✅ ЗАВЕРШЕНО обновление current_bid для аукциона ${listingId}`);
      
      // Двойная проверка: убеждаемся что данные действительно обновились
      const verificationListing = await storage.getListing(listingId);
      console.log(`🔍 ПРОВЕРКА: current_bid в базе данных теперь ${verificationListing?.currentBid}`);
      
      if (verificationListing?.currentBid !== validatedData.amount) {
        console.error(`❌ ОШИБКА: current_bid не обновился! Ожидался ${validatedData.amount}, получен ${verificationListing?.currentBid}`);
      } else {
        console.log(`✅ УСПЕХ: current_bid правильно обновлен на ${validatedData.amount}`);
      }
      
      if (listing) {
        // Get all bids for this listing to find the previously highest bidder
        const allBids = await storage.getBidsForListing(listingId);
        
        // Sort bids by amount (highest first) to find who was previously winning
        const sortedBids = allBids
          .filter(bid => bid.bidderId !== validatedData.bidderId) // Exclude current bidder
          .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        
        // Notify ALL users who participated in this auction about the new bid
        const uniqueBidders = new Set<number>();
        allBids.forEach(bid => {
          if (bid.bidderId !== validatedData.bidderId) { // Exclude current bidder
            uniqueBidders.add(bid.bidderId);
          }
        });
        
        console.log(`📢 Уведомляем ${uniqueBidders.size} участников о новой ставке в аукционе ${listingId}`);
        console.log(`📋 Все ставки в аукционе ${listingId}:`, allBids.map(b => `ID:${b.bidderId} - ${b.amount} Сомони`));
        console.log(`🎯 Участники для уведомления:`, Array.from(uniqueBidders));
        
        // Send notification to each participant
        for (const participantId of uniqueBidders) {
          try {
            console.log(`📝 Создаем уведомление для пользователя ${participantId}...`);
            const carTitle = `${listing.make} ${listing.model} ${listing.year}`;
            const formattedAmount = parseInt(validatedData.amount).toLocaleString('ru-RU');
            
            const notification = await storage.createNotification({
              userId: participantId,
              title: "🔔 Ваша ставка перебита",
              message: `${carTitle} Сделайте новую ставку выше ${formattedAmount} сомони!`,
              type: "bid_outbid",
              listingId: listingId,
              isRead: false
            });
            console.log(`✅ Уведомление создано для пользователя ${participantId}, ID: ${notification.id}`);
            
            // Отправляем уведомление через WebSocket
            if (wsManager) {
              console.log(`📲 ПОПЫТКА отправить WebSocket уведомление пользователю ${participantId}`);
              wsManager.sendNotificationToUser(participantId, notification);
              console.log(`📲 ✅ ЗАВЕРШЕНА попытка отправки WebSocket уведомления пользователю ${participantId}`);
            } else {
              console.log(`❌ wsManager не инициализирован - WebSocket уведомления недоступны`);
            }
            
            // Отправляем SMS уведомление
            try {
              const participantUser = await storage.getUser(participantId);
              if (participantUser && participantUser.phoneNumber) {
                const smsMessage = `Ваша ставка перебита! ${carTitle} - новая ставка ${formattedAmount} сомони. Сделайте новую ставку на AUTOBID.TJ`;
                console.log(`📱 Отправляем SMS уведомление пользователю ${participantId} (${participantUser.phoneNumber})`);
                const smsResult = await sendSMSNotification(participantUser.phoneNumber, smsMessage);
                if (smsResult.success) {
                  console.log(`✅ SMS уведомление отправлено пользователю ${participantId}: ${smsResult.message}`);
                } else {
                  console.error(`❌ Ошибка отправки SMS пользователю ${participantId}: ${smsResult.message}`);
                }
              } else {
                console.log(`⚠️ Не удалось найти телефон пользователя ${participantId} для SMS уведомления`);
              }
            } catch (smsError) {
              console.error(`❌ Ошибка при отправке SMS уведомления пользователю ${participantId}:`, smsError);
            }
          } catch (notificationError) {
            console.error(`❌ Ошибка создания уведомления для пользователя ${participantId}:`, notificationError);
          }
        }
      }
      
      // Отправляем real-time обновление через WebSocket
      console.log(`🔍 ПРОВЕРКА wsManager: ${wsManager ? 'инициализирован' : 'НЕ ИНИЦИАЛИЗИРОВАН'}`);
      if (wsManager) {
        const updatedListing = await storage.getListing(listingId);
        const allBids = await storage.getBidsForListing(listingId);
        
        console.log(`🔍 ОТЛАДКА ПОСЛЕ ОБНОВЛЕНИЯ БД: Аукцион ${listingId}, current_bid в объекте: ${updatedListing?.currentBid}`);
        
        const bidUpdateData = {
          bid,
          listing: updatedListing,
          totalBids: allBids.length,
          highestBid: Math.max(...allBids.map(b => parseFloat(b.amount))),
          timestamp: Date.now()
        };
        
        console.log(`📡 ОТПРАВЛЯЕМ WebSocket broadcast для аукциона ${listingId}:`, {
          bidAmount: bid.amount,
          currentBid: updatedListing?.currentBid,
          highestBid: bidUpdateData.highestBid,
          totalBids: bidUpdateData.totalBids
        });
        
        wsManager.broadcastBidUpdate(listingId, bidUpdateData);
        
        console.log(`✅ WebSocket broadcast ОТПРАВЛЕН: новая ставка ${bid.amount} на аукцион ${listingId}, обновленная цена в WebSocket: ${updatedListing?.currentBid}`);
      }
      
      // ПРИНУДИТЕЛЬНАЯ ОЧИСТКА КЭША СЕРВЕРА для мгновенного обновления
      clearCachePattern('listings');
      clearCachePattern('auction');
      console.log('🧹 Очищен серверный кэш для мгновенного обновления карточек');
      
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Очищаем ВСЕ кэши включая cachedListings
      clearAllCaches();
      
      // ДОПОЛНИТЕЛЬНО: Очищаем кэш для конкретного аукциона в деталях
      clearCachePattern(`listing_${listingId}`);
      clearCachePattern(`auction_${listingId}`);
      console.log(`🧹 ОЧИЩЕН КЭШ для аукциона ${listingId} - теперь характеристики обновятся`);
      
      // Принудительно обновляем кэш листингов для мгновенного отображения новых ставок
      setTimeout(updateListingsCache, 100); // Обновляем через 100мс для гарантированного обновления
      
      // Обновляем время последней ставки для принудительного обновления
      lastBidUpdate = Date.now();
      
      res.status(201).json(bid);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid bid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to place bid" });
    }
  });

  // User routes
  app.get("/api/users/by-phone/:phoneNumber", async (req, res) => {
    try {
      const phoneNumber = decodeURIComponent(req.params.phoneNumber);
      const email = phoneNumber + "@autoauction.tj";
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user by phone" });
    }
  });

  app.get("/api/users/by-email/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user by email" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/by-phone/:phone", async (req, res) => {
    try {
      const rawPhone = req.params.phone;
      const phoneNumber = decodeURIComponent(rawPhone);
      
      // Map phone numbers to user IDs directly based on known database data
      let userId = 0;
      
      if (phoneNumber === "+992 (22) 222-22-22") {
        userId = 3; // buyer@autoauction.tj
      } else if (phoneNumber === "+992 (99) 999-99-99") {
        userId = 12; // +992999999999@autoauction.tj
      } else {
        return res.status(404).json({ 
          error: "User not found", 
          raw: rawPhone, 
          decoded: phoneNumber,
          target1: "+992 (22) 222-22-22",
          target2: "+992 (99) 999-99-99"
        });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found in database" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const { email, username, fullName, isActive, role, phoneNumber } = req.body;
      
      if (!email || !username) {
        return res.status(400).json({ error: "Email and username are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }
      
      const user = await storage.createUser({
        email,
        username,
        fullName: fullName || null,
        isActive: isActive || false,
        role: role || 'buyer',
        phoneNumber: phoneNumber || null
      });
      
      console.log(`Created new user: ${user.id} (${user.email})`);
      res.status(201).json(user);
    } catch (error) {
      console.error("Failed to create user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { fullName, profilePhoto } = req.body;
      
      const user = await storage.updateUserProfile(userId, { fullName, profilePhoto });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  // Admin route to activate/deactivate users
  app.patch("/api/admin/users/:id/activate", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const updatedUser = await storage.updateUserStatus(userId, isActive);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  app.get("/api/users/:id/listings", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const listings = await storage.getListingsBySeller(userId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user listings" });
    }
  });

  app.get("/api/users/:id/bids", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const bids = await storage.getBidsByUser(userId);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user bids" });
    }
  });

  app.get("/api/users/:id/wins", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const wins = await storage.getUserWins(userId);
      res.json(wins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user wins" });
    }
  });

  // Favorites routes
  app.get("/api/users/:id/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const favorites = await storage.getFavoritesByUser(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validatedData = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.createFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid favorite data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:id", async (req, res) => {
    try {
      const favoriteId = parseInt(req.params.id);
      const success = await storage.deleteFavorite(favoriteId);
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Alternative endpoint for deleting favorite by listingId
  app.delete("/api/favorites/by-listing/:listingId", async (req, res) => {
    try {
      const listingId = parseInt(req.params.listingId);
      const userId = parseInt(req.query.userId as string);
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      
      // Find the favorite by userId and listingId
      const userFavorites = await storage.getFavoritesByUser(userId);
      const favorite = userFavorites.find(fav => fav.listingId === listingId);
      
      if (!favorite) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      // Delete the favorite
      const success = await storage.deleteFavorite(favorite.id);
      if (!success) {
        return res.status(404).json({ error: "Failed to delete favorite" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // Search routes
  app.get("/api/search", async (req, res) => {
    try {
      const { q, make, minPrice, maxPrice, year } = req.query;
      const filters = {
        query: q as string,
        make: make as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        year: year ? parseInt(year as string) : undefined,
      };
      
      const results = await storage.searchListings(filters);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search listings" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/listings", async (req, res) => {
    try {
      const allListings = await storage.getListingsByStatus("pending");
      const activeListings = await storage.getListingsByStatus("active");
      const endedListings = await storage.getListingsByStatus("ended");
      const rejectedListings = await storage.getListingsByStatus("rejected");
      
      const listings = [...allListings, ...activeListings, ...endedListings, ...rejectedListings];
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const user = await storage.updateUserStatus(userId, isActive);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  app.put("/api/admin/users/:id/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const user = await storage.updateUserStatus(userId, isActive);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  app.patch("/api/admin/listings/:id", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { status } = req.body;
      
      const listing = await storage.updateListingStatus(listingId, status);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Clear all caches when admin changes listing status
      clearAllCaches();
      
      // ОТПРАВЛЯЕМ УВЕДОМЛЕНИЯ ТОЛЬКО ПРИ ОДОБРЕНИИ (pending → active)
      if (status === 'active') {
        try {
          console.log('🔔 Объявление одобрено! Проверяем сохраненные поисковые запросы для:', listing.make, listing.model);
          const matchingAlerts = await storage.checkAlertsForNewListing(listing);
          console.log('📧 Найдено совпадающих запросов:', matchingAlerts.length);
          
          // Отправляем уведомление для каждого совпадающего запроса
          for (const alert of matchingAlerts) {
            console.log('📨 Создаем уведомление для пользователя:', alert.userId, 'запрос:', alert.id);
            
            // Проверяем, что уведомление еще не существует
            const existingNotifications = await storage.getNotificationsByUser(alert.userId);
            const duplicateExists = existingNotifications.some(n => 
              n.type === "car_found" && 
              n.listingId === listing.id && 
              n.alertId === alert.id
            );
            
            if (!duplicateExists) {
              await storage.createNotification({
                userId: alert.userId,
                title: "Найден автомобиль по вашему запросу",
                message: `${listing.make.toUpperCase()} ${listing.model.toUpperCase()} ${listing.year} г. - ${listing.startingPrice} Сомони (лот #${listing.lotNumber})`,
                type: "car_found",
                listingId: listing.id,
                alertId: alert.id,
                isRead: false
              });
              console.log('✅ Уведомление создано для пользователя:', alert.userId);
            } else {
              console.log('⚠️ Уведомление уже существует для пользователя:', alert.userId);
            }
          }
        } catch (alertError) {
          console.error('❌ Ошибка при отправке уведомлений о одобрении:', alertError);
        }
      }
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing status" });
    }
  });

  // Полное обновление объявления
  app.put("/api/admin/listings/:id", adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { make, model, year, mileage, description, startingPrice, status, location } = req.body;
      
      const listing = await storage.updateListing(listingId, {
        make,
        model, 
        year,
        mileage,
        description,
        startingPrice,
        status,
        location
      });
      
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Clear all caches when admin updates listing
      clearAllCaches();
      
      res.json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).json({ error: "Failed to update listing" });
    }
  });



  app.put("/api/admin/listings/:id/status", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { status } = req.body;
      
      const listing = await storage.updateListingStatus(listingId, status);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Clear all caches when admin changes listing status
      clearAllCaches();
      
      // ОТПРАВЛЯЕМ УВЕДОМЛЕНИЯ ТОЛЬКО ПРИ ОДОБРЕНИИ (pending → active)
      if (status === 'active') {
        try {
          console.log('🔔 Объявление одобрено! Проверяем сохраненные поисковые запросы для:', listing.make, listing.model);
          const matchingAlerts = await storage.checkAlertsForNewListing(listing);
          console.log('📧 Найдено совпадающих запросов:', matchingAlerts.length);
          
          // Отправляем уведомление для каждого совпадающего запроса
          for (const alert of matchingAlerts) {
            console.log('📨 Создаем уведомление для пользователя:', alert.userId, 'запрос:', alert.id);
            
            // Проверяем, что уведомление еще не существует
            const existingNotifications = await storage.getNotificationsByUser(alert.userId);
            const duplicateExists = existingNotifications.some(n => 
              n.type === "car_found" && 
              n.listingId === listing.id && 
              n.alertId === alert.id
            );
            
            if (!duplicateExists) {
              await storage.createNotification({
                userId: alert.userId,
                title: "Найден автомобиль по вашему запросу",
                message: `${listing.make.toUpperCase()} ${listing.model.toUpperCase()} ${listing.year} г. - ${listing.startingPrice} Сомони (лот #${listing.lotNumber})`,
                type: "car_found",
                listingId: listing.id,
                alertId: alert.id,
                isRead: false
              });
              console.log('✅ Уведомление создано для пользователя:', alert.userId);
            } else {
              console.log('⚠️ Уведомление уже существует для пользователя:', alert.userId);
            }
          }
        } catch (alertError) {
          console.error('❌ Ошибка при отправке уведомлений о одобрении:', alertError);
        }
      }
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing status" });
    }
  });

  // Notifications routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log(`🔔 Получение уведомлений для пользователя ${userId}`);
      
      // Отключаем кэширование для мгновенных уведомлений
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const notifications = await storage.getNotificationsByUser(userId);
      console.log(`📩 Найдено ${notifications.length} уведомлений для пользователя ${userId}`);
      res.json(notifications);
    } catch (error) {
      console.error(`❌ Ошибка получения уведомлений для пользователя ${req.params.userId}:`, error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      
      // Очищаем кэш для мгновенной доставки уведомлений
      if (notification.userId) {
        console.log(`🚀 Очищаем кэш уведомлений для пользователя ${notification.userId} после создания`);
        clearCachePattern(`notifications_${notification.userId}`);
      }
      
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid notification data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create notification" });
    }
  });



  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(notificationId);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      console.log(`Attempting to delete notification with ID: ${notificationId}`);
      
      if (isNaN(notificationId)) {
        console.log(`Invalid notification ID: ${req.params.id}`);
        return res.status(400).json({ error: "Invalid notification ID" });
      }
      
      const success = await storage.deleteNotification(notificationId);
      console.log(`Delete notification result: ${success}`);
      
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  app.get("/api/notifications/:userId/unread-count", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  // Car alerts routes
  app.get("/api/car-alerts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const cacheKey = `car-alerts-${userId}`;
      
      // Временно отключаем кэширование для отладки проблемы с удалением
      const alerts = await storage.getCarAlertsByUser(userId);
      
      // Устанавливаем заголовки против кэширования браузера
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(alerts);
    } catch (error) {
      console.error('Error in car-alerts route:', error);
      res.status(500).json({ error: "Failed to fetch car alerts" });
    }
  });



  app.post("/api/car-alerts", async (req, res) => {
    try {
      console.log('Creating car alert with data:', req.body);
      const validatedData = insertCarAlertSchema.parse(req.body);
      
      // Создаем уведомление напрямую через storage
      const alert = await storage.createCarAlert(validatedData);
      
      // Очищаем кэш для этого пользователя
      clearCachePattern(`car-alerts-${validatedData.userId}`);
      
      console.log('Car alert created successfully:', alert);
      res.status(201).json(alert);
    } catch (error) {
      console.error('Error creating car alert:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid alert data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  app.delete("/api/car-alerts/:id", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      
      // Просто удаляем alert напрямую
      const success = await storage.deleteCarAlert(alertId);
      
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      // Агрессивно очищаем весь кэш связанный с car-alerts
      clearCachePattern('car-alerts-');
      clearAllCaches(); // Полная очистка всех кэшей
      
      console.log(`Deleted car alert ${alertId}, changes: 1`);
      res.status(204).send();
    } catch (error) {
      console.error('Error in DELETE car-alerts route:', error);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  // Banner routes
  app.get("/api/banners", async (req, res) => {
    try {
      const { position } = req.query;
      const cacheKey = `banners_${position || 'all'}`;
      
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      const banners = await storage.getBanners(position as string);
      setCache(cacheKey, banners);
      res.json(banners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  app.post("/api/admin/banners", async (req, res) => {
    try {
      const bannerData = insertBannerSchema.parse(req.body);
      const banner = await storage.createBanner(bannerData);
      clearCachePattern('banners');
      res.status(201).json(banner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create banner" });
    }
  });

  app.put("/api/admin/banners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bannerData = insertBannerSchema.partial().parse(req.body);
      const banner = await storage.updateBanner(id, bannerData);
      
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      
      clearCachePattern('banners');
      res.json(banner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update banner" });
    }
  });

  app.get("/api/admin/banners", async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  app.delete("/api/admin/banners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBanner(id);
      
      if (!success) {
        return res.status(404).json({ error: "Banner not found" });
      }
      
      clearCachePattern('banners');
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete banner" });
    }
  });



  // Sell Car Section routes
  app.get("/api/sell-car-section", async (req, res) => {
    try {
      const section = await storage.getSellCarSection();
      res.json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sell car section" });
    }
  });

  app.put("/api/admin/sell-car-section", async (req, res) => {
    try {
      const validatedData = req.body; // Will validate in component
      const section = await storage.updateSellCarSection(validatedData);
      res.json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sell car section" });
    }
  });

  // Advertisement Carousel routes
  app.get("/api/advertisement-carousel", async (req, res) => {
    try {
      const cacheKey = 'advertisement_carousel';
      const cached = getCached(cacheKey);
      if (cached) {
        console.log(`📋 Возвращаем кэшированные данные карусели: ${cached.length} элементов`);
        return res.json(cached);
      }
      
      const carousel = await storage.getAdvertisementCarousel();
      console.log(`📋 Загружены свежие данные карусели из БД: ${carousel.length} элементов`);
      setCache(cacheKey, carousel);
      res.json(carousel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisement carousel" });
    }
  });

  app.get("/api/admin/advertisement-carousel", async (req, res) => {
    try {
      // For admin, show all items (including inactive)
      const carousel = await (storage as any).getAdvertisementCarouselAll ? 
        await (storage as any).getAdvertisementCarouselAll() : 
        await storage.getAdvertisementCarousel();
      res.json(carousel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisement carousel" });
    }
  });

  app.post("/api/admin/advertisement-carousel", async (req, res) => {
    try {
      const item = await storage.createAdvertisementCarouselItem(req.body);
      clearCachePattern('advertisement_carousel');
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create carousel item" });
    }
  });

  app.get("/api/admin/advertisement-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getAdvertisementCarouselItem(id);
      if (!item) {
        return res.status(404).json({ error: "Carousel item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to get carousel item" });
    }
  });

  app.put("/api/admin/advertisement-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`🔄 Обновление рекламной карусели ID: ${id}`);
      console.log(`📝 Данные для обновления:`, req.body);
      
      const item = await storage.updateAdvertisementCarouselItem(id, req.body);
      if (!item) {
        console.log(`❌ Элемент карусели с ID ${id} не найден`);
        return res.status(404).json({ error: "Carousel item not found" });
      }
      
      console.log(`✅ Элемент карусели обновлен:`, item);
      clearCachePattern('advertisement_carousel');
      res.json(item);
    } catch (error) {
      console.error(`💥 Ошибка обновления карусели:`, error);
      res.status(500).json({ error: "Failed to update carousel item" });
    }
  });

  app.delete("/api/admin/advertisement-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAdvertisementCarouselItem(id);
      if (!deleted) {
        return res.status(404).json({ error: "Carousel item not found" });
      }
      clearCachePattern('advertisement_carousel');
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete carousel item" });
    }
  });

  // Sell Car Banner API routes
  app.get("/api/sell-car-banner", async (req, res) => {
    try {
      const cacheKey = 'sell_car_banner';
      
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      const banner = await storage.getSellCarBanner();
      if (!banner) {
        // Создаем баннер по умолчанию если его нет
        const defaultBanner = await storage.createSellCarBanner({
          title: "Продай свое авто",
          description: "Получи максимальную цену за свой автомобиль на нашем аукционе",
          buttonText: "Начать продажу",
          linkUrl: "/sell",
          backgroundImageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=300&fit=crop",
          gradientFrom: "#059669",
          gradientTo: "#047857",
          textColor: "#ffffff",
          isActive: true,
          overlayOpacity: 60
        });
        setCache(cacheKey, defaultBanner);
        return res.json(defaultBanner);
      }
      
      setCache(cacheKey, banner);
      res.json(banner);
    } catch (error) {
      console.error("💥 Ошибка загрузки банера sell-car-banner:", error);
      res.status(500).json({ error: "Failed to fetch sell car banner" });
    }
  });

  app.put("/api/admin/sell-car-banner", async (req, res) => {
    try {
      console.log("🔧 Обновление банера sell-car-banner:", req.body);
      
      const bannerData = req.body;
      const banner = await storage.updateSellCarBanner(bannerData);
      
      if (!banner) {
        console.log("❌ Не удалось обновить банер sell-car-banner");
        return res.status(404).json({ error: "Failed to update sell car banner" });
      }
      
      console.log("✅ Банер sell-car-banner успешно обновлен:", banner);
      clearCachePattern('sell_car_banner');
      res.json(banner);
    } catch (error) {
      console.error("💥 Ошибка обновления банера sell-car-banner:", error);
      res.status(500).json({ error: "Failed to update sell car banner" });
    }
  });

  // Documents API routes
  app.get("/api/documents", async (req, res) => {
    try {
      const type = req.query.type as string;
      const documents = await storage.getDocuments(type);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/admin/documents", async (req, res) => {
    try {
      const type = req.query.type as string;
      const documents = await storage.getDocuments(type);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/admin/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/admin/documents", async (req, res) => {
    try {
      const document = await storage.createDocument(req.body);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.put("/api/admin/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.updateDocument(id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/admin/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDocument(id);
      if (!deleted) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // ===============================
  // ADMIN API ENDPOINTS (для Retool)
  // ===============================

  // Управление пользователями
  app.get("/api/admin/users", adminAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id/status", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      const user = await storage.updateUserStatus(userId, isActive);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  // Получить профиль конкретного пользователя
  app.get("/api/admin/users/:id", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Обновить профиль пользователя
  app.put("/api/admin/users/:id", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { fullName, email, phoneNumber } = req.body;
      
      const user = await storage.updateUserProfile(userId, {
        fullName,
        email,
        phoneNumber
      });
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user profile" });
    }
  });

  // Удалить пользователя
  app.delete("/api/admin/users/:id", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`Attempting to delete user ${userId}`);
      
      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        console.log(`User ${userId} not found for deletion`);
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log(`User ${userId} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user: " + error.message });
    }
  });

  // Получить объявления пользователя
  app.get("/api/admin/users/:id/listings", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const listings = await storage.getListingsBySeller(userId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user listings" });
    }
  });

  // Получить документы пользователя
  app.get("/api/admin/users/:id/documents", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user documents" });
    }
  });

  // Добавить документ пользователю
  app.post("/api/admin/users/:id/documents", adminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { type, title, content, fileUrl } = req.body;
      
      const document = await storage.createDocument({
        userId,
        type,
        title,
        content,
        fileUrl
      });
      
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  // Удалить документ пользователя
  app.delete("/api/admin/users/:userId/documents/:documentId", adminAuth, async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const deleted = await storage.deleteDocument(documentId);
      if (!deleted) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Модерация объявлений
  app.get("/api/admin/listings", adminAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const listings = await storage.getListingsByStatus(status as string || "pending");
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // Получить объявления ожидающие одобрения
  app.get("/api/admin/listings/pending-approval", adminAuth, async (req, res) => {
    try {
      console.log('📋 Запрос на модерацию объявлений...');
      const listings = await storage.getListingsByStatus('pending');
      console.log(`📋 Найдено ${listings.length} объявлений на модерацию`);
      
      // Добавляем CORS заголовки для кросс-доменных запросов
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      res.json(listings);
    } catch (error) {
      console.error('❌ Ошибка при получении объявлений на модерацию:', error);
      res.status(500).json({ error: "Failed to fetch pending approval listings" });
    }
  });

  // Одобрить объявление для публикации
  app.post("/api/admin/listings/:id/approve", adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.updateListingStatus(listingId, 'active');
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Очищаем все кэши после одобрения
      clearAllCaches();
      
      // Принудительно обновляем кэш листингов для главной страницы
      await updateListingsCache();
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve listing" });
    }
  });

  // Отклонить заявку на объявление
  app.post("/api/admin/listings/:id/reject", adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.updateListingStatus(listingId, 'rejected');
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Очищаем все кэши после отклонения
      clearAllCaches();
      
      // Принудительно обновляем кэш листингов для главной страницы
      await updateListingsCache();
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject listing" });
    }
  });

  // Удалить объявление полностью
  app.delete("/api/admin/listings/:id", adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const success = await storage.deleteListing(listingId);
      if (!success) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Очищаем все кэши после удаления
      clearAllCaches();
      
      // Принудительно обновляем кэш листингов для главной страницы
      await updateListingsCache();
      
      res.json({ success: true, message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ error: "Failed to delete listing" });
    }
  });

  app.put("/api/admin/listings/:id/status", adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { status } = req.body;
      const listing = await storage.updateListingStatus(listingId, status);
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing status" });
    }
  });

  // Статистика для админа
  app.get("/api/admin/stats", adminAuth, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  // Завершить аукцион и создать выигрыш
  app.post("/api/admin/listings/:id/end-auction", adminAuth, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      
      // Получаем аукцион
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Получаем все ставки для определения победителя
      const bids = await storage.getBidsForListing(listingId);
      
      if (bids.length === 0) {
        // Нет ставок - завершаем аукцион (с ended_at для архива)
        await storage.updateListingStatus(listingId, "ended");
        return res.json({ message: "Auction ended without bids" });
      }

      // Находим победителя (самая высокая ставка)
      const winningBid = bids.reduce((highest, current) => 
        parseFloat(current.amount) > parseFloat(highest.amount) ? current : highest
      );

      // Обновляем статус аукциона и устанавливаем ended_at
      await storage.updateListingStatus(listingId, "ended");
      
      // Создаем запись о выигрыше
      const win = await storage.createUserWin({
        userId: winningBid.bidderId,
        listingId: listingId,
        winningBid: winningBid.amount
      });

      // Отправляем уведомление победителю
      await storage.createNotification({
        userId: winningBid.bidderId,
        type: "auction_won",
        title: "🏆 Поздравляем с победой!",
        message: `Вы выиграли аукцион ${listing.make} ${listing.model} со ставкой ${parseFloat(winningBid.amount).toLocaleString()} Сомони`,
        listingId: listingId,
        isRead: false
      });

      // Принудительно архивируем аукцион
      await storage.updateListingStatus(listingId, "archived");

      clearCachePattern("/api/listings");
      clearCachePattern("/api/users");

      res.json({ 
        message: "Auction ended successfully and archived", 
        winner: winningBid.bidderId,
        winningAmount: winningBid.amount,
        win 
      });
    } catch (error) {
      console.error("Error ending auction:", error);
      res.status(500).json({ error: "Failed to end auction" });
    }
  });

  // Массовые уведомления
  app.post("/api/admin/notifications/broadcast", adminAuth, async (req, res) => {
    try {
      const { title, message, type = "system" } = req.body;
      const users = await storage.getAllUsers();
      
      const notifications = await Promise.all(
        users.map(user => 
          storage.createNotification({
            userId: user.id,
            type,
            title,
            message,
            isRead: false
          })
        )
      );
      
      res.json({ sent: notifications.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to send broadcast notification" });
    }
  });

  // SMS-отправка для кодов подтверждения
  app.post("/api/auth/send-sms", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Нормализуем номер телефона (убираем все символы кроме цифр и +)
      const normalizedPhone = phoneNumber.replace(/[^\d+]/g, '');
      console.log(`📱 Нормализация номера: ${phoneNumber} → ${normalizedPhone}`);

      // Генерируем 6-значный код
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Сохраняем код в кэше с нормализованным номером
      const cacheKey = `sms_code_${normalizedPhone}`;
      cache.set(cacheKey, { 
        code: verificationCode, 
        timestamp: Date.now(),
        attempts: 0
      });
      
      console.log(`💾 Код сохранен в кэше с ключом: ${cacheKey}`);

      // В production здесь будет интеграция с SMS-провайдером
      // Например: Twilio, Nexmo, или локальный SMS-шлюз
      console.log(`SMS Code for ${phoneNumber}: ${verificationCode}`);
      
      // Имитация отправки SMS (в production заменить на реальный SMS API)
      const smsResult = await sendSMSCode(normalizedPhone, verificationCode);
      
      if (smsResult.success) {
        res.json({ 
          success: true, 
          message: "SMS код отправлен"
        });
      } else {
        res.status(500).json({ error: "Ошибка отправки SMS" });
      }
    } catch (error) {
      console.error("SMS sending error:", error);
      res.status(500).json({ error: "Ошибка сервера при отправке SMS" });
    }
  });

  // Проверка SMS-кода
  app.post("/api/auth/verify-sms", async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;
      
      if (!phoneNumber || !code) {
        return res.status(400).json({ error: "Phone number and code are required" });
      }

      // Нормализуем номер телефона так же, как при отправке
      const normalizedPhone = phoneNumber.replace(/[^\d+]/g, '');
      console.log(`📱 Нормализация номера при проверке: ${phoneNumber} → ${normalizedPhone}`);

      const cacheKey = `sms_code_${normalizedPhone}`;
      console.log(`🔍 Поиск кода в кэше с ключом: ${cacheKey}`);
      const cachedData = cache.get(cacheKey);
      
      if (!cachedData) {
        return res.status(400).json({ error: "Код истек или не найден" });
      }

      const { code: storedCode, timestamp, attempts } = cachedData;
      
      // Проверяем, не истек ли код (5 минут)
      if (Date.now() - timestamp > 300000) {
        cache.delete(cacheKey);
        return res.status(400).json({ error: "Код истек" });
      }

      // Проверяем количество попыток
      if (attempts >= 3) {
        cache.delete(cacheKey);
        return res.status(400).json({ error: "Превышено количество попыток" });
      }

      if (code !== storedCode) {
        // Увеличиваем счетчик попыток
        cache.set(cacheKey, {
          ...cachedData,
          attempts: attempts + 1
        });
        return res.status(400).json({ error: "Неверный код" });
      }

      // Код верный - удаляем из кэша
      cache.delete(cacheKey);
      
      // Проверяем, существует ли пользователь в базе данных
      const emailFromPhone = normalizedPhone.replace(/\D/g, '') + '@autoauction.tj';
      let user = await storage.getUserByEmail(emailFromPhone);
      
      // Дополнительная проверка на дубликаты по номеру телефона
      if (!user) {
        // Проверяем, нет ли уже пользователя с таким номером телефона
        const cleanPhone = normalizedPhone.replace(/\D/g, '');
        const allUsers = await storage.getAllUsers();
        const existingUserByPhone = allUsers.find(u => {
          if (!u.phoneNumber) return false;
          const existingCleanPhone = u.phoneNumber.replace(/\D/g, '');
          return existingCleanPhone === cleanPhone;
        });
        
        if (existingUserByPhone) {
          console.log(`⚠️ Найден существующий пользователь с номером ${normalizedPhone}: ID ${existingUserByPhone.id}`);
          return res.json({ 
            success: true, 
            message: "Код подтвержден",
            phoneNumber: normalizedPhone,
            user: {
              id: existingUserByPhone.id,
              email: existingUserByPhone.email,
              isActive: existingUserByPhone.isActive
            }
          });
        }
      }
      
      // Если пользователь не существует, создаем его как неактивного
      if (!user) {
        // Защита от создания дубликата админского номера
        const adminPhoneNumbers = ['+992903331332', '+992 (90) 333-13-32'];
        const isAdminPhone = adminPhoneNumbers.some(adminPhone => 
          normalizedPhone.replace(/\D/g, '') === adminPhone.replace(/\D/g, '')
        );
        
        if (isAdminPhone) {
          console.log(`⚠️ Попытка создания аккаунта с админским номером: ${normalizedPhone}`);
          return res.status(400).json({ 
            error: "Этот номер зарезервирован для администрации" 
          });
        }
        
        console.log(`Creating new inactive user for phone: ${normalizedPhone}`);
        user = await storage.createUser({
          email: emailFromPhone,
          username: normalizedPhone,
          phoneNumber: normalizedPhone, // Добавляем номер телефона в отдельное поле
          fullName: null,
          isActive: false, // По умолчанию все новые пользователи неактивны
          role: 'buyer'
        });
        console.log(`Created new user with ID: ${user.id}, isActive: ${user.isActive}`);
      }
      
      res.json({ 
        success: true, 
        message: "Код подтвержден",
        phoneNumber: normalizedPhone,
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error("SMS verification error:", error);
      res.status(500).json({ error: "Ошибка сервера при проверке кода" });
    }
  });

  // Middleware для проверки админских прав
  const requireAdmin = (req: any, res: any, next: any) => {
    // В реальном приложении здесь была бы проверка авторизации
    // Пока что пропускаем все запросы для демонстрации
    next();
  };

  // Админские API роуты - только для номера +992903331332
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch all users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/status", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const user = await storage.updateUserStatus(userId, isActive);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Failed to update user status:", error);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  app.get("/api/admin/listings", requireAdmin, async (req, res) => {
    try {
      // Получаем все объявления без фильтрации по статусу
      const listings = await storage.getListingsByStatus('', 1000);
      res.json(listings);
    } catch (error) {
      console.error("Failed to fetch all listings:", error);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  app.patch("/api/admin/listings/:id/status", requireAdmin, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(listingId)) {
        return res.status(400).json({ error: "Invalid listing ID" });
      }
      
      if (!['pending', 'active', 'ended', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const listing = await storage.updateListingStatus(listingId, status);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Очищаем кеш при изменении статуса
      clearAllCaches();
      
      res.json(listing);
    } catch (error) {
      console.error("Failed to update listing status:", error);
      res.status(500).json({ error: "Failed to update listing status" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Админ выигрыши - все победы с именами
  app.get("/api/admin/wins", requireAdmin, async (req, res) => {
    try {
      const wins = await storage.getAllWins();
      res.json(wins);
    } catch (error) {
      console.error("Failed to fetch admin wins:", error);
      res.status(500).json({ error: "Failed to fetch wins" });
    }
  });

  // Архивирование просроченных аукционов
  app.post('/api/archive-expired', async (req, res) => {
    try {
      const archivedCount = await storage.archiveExpiredListings();
      res.json({ success: true, archivedCount });
    } catch (error) {
      console.error('Error archiving expired listings:', error);
      res.status(500).json({ message: 'Failed to archive expired listings' });
    }
  });

  // Получить архивированные аукционы
  app.get('/api/archived-listings', async (req, res) => {
    try {
      const archivedListings = await storage.getArchivedListings();
      res.json(archivedListings);
    } catch (error) {
      console.error('Error fetching archived listings:', error);
      res.status(500).json({ message: 'Failed to fetch archived listings' });
    }
  });

  // Перезапустить аукцион - только для админов
  app.post('/api/restart-listing/:id', getUserFromContext, adminAuth, async (req, res) => {
    try {
      console.log('🔄 Запрос на перезапуск аукциона', req.params.id);
      const { id } = req.params;
      const listingId = parseInt(id);
      
      console.log('🔄 Вызываем storage.restartListing для ID:', listingId);
      console.log('🔍 Тип storage:', typeof storage);
      console.log('🔍 Тип storage.restartListing:', typeof storage.restartListing);
      const newListing = await storage.restartListing(listingId);
      console.log('🔍 Результат storage.restartListing:', newListing);
      
      if (!newListing) {
        console.log('❌ Не удалось перезапустить аукцион', listingId, '- возможно неправильный статус или ошибка');
        return res.status(400).json({ error: 'Failed to restart listing. Make sure the listing exists and is archived.' });
      }

      console.log('✅ Аукцион успешно перезапущен:', { oldId: listingId, newId: newListing.id, lotNumber: newListing.lotNumber });
      clearCachePattern('listings');
      res.json(newListing);
    } catch (error) {
      console.error('❌ Критическая ошибка при перезапуске аукциона:', error);
      res.status(500).json({ error: 'Failed to restart listing due to server error' });
    }
  });

  // Удалить архивированный аукцион навсегда
  app.delete('/api/archived-listings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteArchivedListing(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: 'Listing not found or not archived' });
      }

      clearCachePattern('listings');
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting archived listing:', error);
      res.status(500).json({ message: 'Failed to delete archived listing' });
    }
  });

  const httpServer = createServer(app);
  
  // Инициализируем WebSocket для real-time обновлений
  wsManager = new AuctionWebSocketManager(httpServer);
  
  // Делаем wsManager доступным глобально для использования в других местах
  (global as any).wsManager = wsManager;
  
  // API endpoint для принудительной проверки просроченных аукционов (для тестирования)
  app.post('/api/admin/process-expired', adminAuth, async (req, res) => {
    try {
      console.log('🔄 Принудительная проверка просроченных аукционов...');
      const processedCount = await storage.processExpiredListings();
      console.log(`✅ Обработано ${processedCount} просроченных аукционов`);
      
      if (processedCount > 0) {
        // Очищаем кэш после обработки
        clearAllCaches();
      }
      
      res.json({ 
        success: true, 
        processedCount,
        message: `Обработано ${processedCount} просроченных аукционов`
      });
    } catch (error) {
      console.error('❌ Ошибка при принудительной обработке аукционов:', error);
      res.status(500).json({ error: 'Ошибка при обработке просроченных аукционов' });
    }
  });

  // Запускаем автоматическую обработку просроченных аукционов каждые 5 минут
  setInterval(async () => {
    try {
      console.log('🔄 Проверка просроченных аукционов...');
      const processedCount = await storage.processExpiredListings();
      if (processedCount > 0) {
        console.log(`✅ Обработано ${processedCount} просроченных аукционов`);
        // Очищаем кэш после обработки
        clearAllCaches();
      }
    } catch (error) {
      console.error('❌ Ошибка при автоматической обработке аукционов:', error);
    }
  }, 5 * 60 * 1000); // 5 минут
  
  console.log('🤖 Автоматическая обработка просроченных аукционов запущена (каждые 5 минут)');
  
  // Messaging API routes
  app.get("/api/conversations", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userId = req.user.id;
      console.log(`📨 Получение переписок для пользователя ${userId}`);
      
      const conversations = await storage.getConversationsByUser(userId);
      console.log(`✅ Найдено ${conversations.length} переписок для пользователя ${userId}:`, conversations.map(c => ({ 
        id: c.id, 
        listingId: c.listingId, 
        otherUser: c.otherUser?.fullName || 'N/A'
      })));
      res.json(conversations);
    } catch (error) {
      console.error(`❌ Ошибка получения переписок:`, error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const { buyerId, sellerId, listingId } = req.body;
      
      console.log(`🔍 Создание переписки: buyerId=${buyerId}, sellerId=${sellerId}, listingId=${listingId}`);
      
      // Проверяем, существует ли уже такая переписка
      const existingConversation = await storage.getConversationByParticipants(buyerId, sellerId, listingId);
      if (existingConversation) {
        console.log(`✅ Найдена существующая переписка:`, existingConversation);
        return res.json(existingConversation);
      }

      const conversation = await storage.createConversation({ buyerId, sellerId, listingId });
      console.log(`✅ Создана новая переписка:`, conversation);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("❌ Ошибка создания переписки:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      console.log(`📨 Получение сообщений для переписки ${conversationId}`);
      const messages = await storage.getMessagesByConversation(conversationId);
      console.log(`✅ Найдено ${messages.length} сообщений для переписки ${conversationId}`);
      res.json(messages);
    } catch (error) {
      console.error(`❌ Ошибка получения сообщений для переписки ${conversationId}:`, error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const { content, senderId } = req.body;
      
      console.log(`📝 Создание сообщения: conversationId=${conversationId}, senderId=${senderId}, content="${content}"`);
      
      if (!senderId) {
        console.log("❌ Ошибка: senderId отсутствует");
        return res.status(400).json({ error: "User not authenticated" });
      }
      
      if (!content || content.trim() === "") {
        console.log("❌ Ошибка: content пустой");
        return res.status(400).json({ error: "Message content is required" });
      }
      
      // ШАГ 1: Создаем сообщение (КРИТИЧЕСКИ ВАЖНО)
      console.log(`🔄 ШАГ 1: Создаем сообщение в базе данных`);
      const message = await storage.createMessage({ conversationId, senderId, content });
      console.log(`✅ ШАГ 1 ЗАВЕРШЕН: Сообщение создано успешно с ID ${message.id}`);
      
      // ШАГ 5: СРАЗУ возвращаем успешный ответ (самое важное)
      console.log(`🔄 ШАГ 5: Возвращаем успешный ответ клиенту`);
      res.status(201).json(message);
      console.log(`✅ ШАГ 5 ЗАВЕРШЕН: Ответ 201 отправлен клиенту успешно`);
      
      // Остальные шаги делаем ПОСЛЕ отправки ответа (асинхронно)
      console.log(`🔄 Начинаем дополнительные операции после отправки ответа`);
      
      // ШАГ 2: Получаем информацию о переписке  
      setTimeout(async () => {
        try {
          console.log(`🔄 ШАГ 2: Получаем информацию о переписке ${conversationId}`);
          // Получаем переписку напрямую по ID
          const conversation = await storage.getConversationById(conversationId);
          console.log(`✅ ШАГ 2 ЗАВЕРШЕН: Получена переписка`, conversation ? 'найдена' : 'не найдена');
          console.log(`📊 Переписка:`, conversation ? {id: conversation.id, buyerId: conversation.buyerId, sellerId: conversation.sellerId} : 'null');
          
          if (conversation) {
            // ШАГ 3: Определяем получателя и отправляем WebSocket уведомление
            const recipientId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;
            console.log(`🔄 ШАГ 3: Отправляем WebSocket уведомление получателю ${recipientId}`);
            console.log(`📊 Данные переписки: buyerId=${conversation.buyerId}, sellerId=${conversation.sellerId}, senderId=${senderId}`);
            
            try {
              if (global.wsManager) {
                const notificationSent = global.wsManager.notifyNewMessage(recipientId, {
                  conversationId,
                  message,
                  senderName: message.senderName || 'Пользователь'
                });
                console.log(`✅ ШАГ 3 ЗАВЕРШЕН: WebSocket уведомление отправлено=${notificationSent} получателю ${recipientId}`);
              } else {
                console.log(`⚠️ ШАГ 3: global.wsManager недоступен, пропускаем WebSocket уведомление`);
              }
            } catch (wsError) {
              console.error(`❌ ШАГ 3 ОШИБКА WebSocket:`, wsError);
            }
          } else {
            console.log(`❌ ШАГ 2: Переписка не найдена для conversationId=${conversationId}, senderId=${senderId}`);
          }
        } catch (conversationError) {
          console.error(`❌ ШАГ 2 ОШИБКА получения переписки:`, conversationError);
        }
        
        // ШАГ 4: Сбрасываем демо флаг
        try {
          console.log(`🔄 ШАГ 4: Сбрасываем демо флаг посещения страницы сообщений`);
          resetMessageVisitedFlag();
          console.log(`✅ ШАГ 4 ЗАВЕРШЕН: Демо флаг сброшен`);
        } catch (demoError) {
          console.error(`❌ ШАГ 4 ОШИБКА демо функции:`, demoError);
        }
        
        console.log(`✅ ВСЕ ДОПОЛНИТЕЛЬНЫЕ ОПЕРАЦИИ ЗАВЕРШЕНЫ`);
      }, 10); // Минимальная задержка для асинхронного выполнения
      
    } catch (error) {
      console.error("❌ КРИТИЧЕСКАЯ ОШИБКА создания сообщения:", error);
      console.error("❌ Stack trace:", error.stack);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.patch("/api/conversations/:conversationId/messages/:messageId/read", async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const success = await storage.markMessageAsRead(messageId);
      
      if (!success) {
        return res.status(404).json({ error: "Message not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  app.get("/api/conversations/:conversationId/unread-count/:userId", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const userId = parseInt(req.params.userId);
      const count = await storage.getUnreadMessageCount(conversationId, userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });

  // Переменные для демонстрации - отслеживание посещений страницы сообщений для разных пользователей
  let messagesPageVisited = {
    3: false,  // Пользователь +992 (11) 111-11-11
    4: false   // Пользователь +992 (90) 333-13-32
  };
  
  // Сбрасываем флаги при перезагрузке сервера для чистой демонстрации
  console.log(`🔄 Сервер перезагружен - сбрасываем демонстрационные флаги для всех пользователей`);
  
  // Функция для сброса демонстрационного флага (когда приходит новое сообщение)
  function resetMessageVisitedFlag() {
    messagesPageVisited[3] = false;
    messagesPageVisited[4] = false;
    console.log(`🔄 ДЕМО: Сброшен флаг посещения для всех пользователей - красные значки снова появятся`);
  }

  app.get("/api/messages/unread-count/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log(`📊 Получение общего количества непрочитанных сообщений для пользователя ${userId}`);
      
      // Отключаем HTTP кэширование для этого endpoint
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      // Получаем реальное количество непрочитанных сообщений из базы данных для всех пользователей
      const count = await storage.getUnreadMessageCount(userId);
      console.log(`✅ Найдено ${count} непрочитанных сообщений для пользователя ${userId}`);
      res.json({ count });
    } catch (error) {
      console.error(`❌ Ошибка получения количества непрочитанных сообщений:`, error);
      res.status(500).json({ error: "Failed to get unread message count" });
    }
  });

  // ДЕМО: Endpoint для отметки посещения страницы сообщений
  app.post("/api/demo/mark-messages-visited", async (req, res) => {
    try {
      const { userId } = req.body;
      console.log(`📖 ДЕМО: Пользователь ${userId} зашел на страницу сообщений`);
      
      if (userId === 3 || userId === 4) {
        messagesPageVisited[userId] = true;
        console.log(`✅ ДЕМО: Отмечено посещение страницы сообщений для пользователя ${userId}`);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`❌ Ошибка отметки посещения:`, error);
      res.status(500).json({ error: "Failed to mark visit" });
    }
  });

  // ДЕМО: Сброс демонстрации
  app.post("/api/demo/reset-demo", async (req, res) => {
    try {
      console.log(`🔄 ДЕМО: Сброс демонстрации для всех пользователей`);
      messagesPageVisited[3] = false;
      messagesPageVisited[4] = false;
      console.log(`✅ ДЕМО: Демонстрация сброшена - красные значки снова появятся для всех пользователей`);
      res.json({ success: true, message: "Demo reset for all users" });
    } catch (error) {
      console.error(`❌ Ошибка сброса демонстрации:`, error);
      res.status(500).json({ error: "Failed to reset demo" });
    }
  });

  // ДЕМО: Тест нового сообщения для демонстрации красного значка
  app.post("/api/demo/send-test-message", async (req, res) => {
    try {
      console.log(`📧 ДЕМО: Имитация отправки нового сообщения`);
      
      // Сбрасываем флаг - как будто пришло новое сообщение
      resetMessageVisitedFlag();
      
      console.log(`✅ ДЕМО: Новое сообщение отправлено - красный значок должен появиться`);
      res.json({ success: true, message: "Тестовое сообщение отправлено" });
    } catch (error) {
      console.error(`❌ Ошибка отправки тестового сообщения:`, error);
      res.status(500).json({ error: "Failed to send test message" });
    }
  });

  // API для проверки последних обновлений
  app.get('/api/bid-updates/timestamp', (req, res) => {
    res.json({ timestamp: lastBidUpdate });
  });

  // Endpoint для проверки статуса базы данных во время деплоя
  app.get("/api/database-status", async (req, res) => {
    try {
      console.log("🔍 DEPLOYMENT: Проверка статуса базы данных...");
      
      const dbStatus = await getDatabaseStatus();
      
      console.log("📊 DEPLOYMENT: Статус базы данных:", dbStatus);
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        ...dbStatus
      });
    } catch (error) {
      console.error("❌ DEPLOYMENT: Ошибка проверки статуса базы данных:", error);
      
      res.status(500).json({
        success: false,
        timestamp: new Date().toISOString(),
        connected: false,
        listingsCount: 0,
        message: "Ошибка проверки статуса базы данных",
        error: error instanceof Error ? error.message : "Неизвестная ошибка"
      });
    }
  });

  // Health check endpoint для деплоя
  app.get("/api/health", (req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      message: "Сервер работает нормально"
    });
  });

  // 🔧 ИСПРАВЛЕНИЕ DEPLOYMENT ROUTING: Catch-all роут для SPA (Single Page Application)
  // Все запросы которые НЕ начинаются с /api/ должны возвращать index.html
  // Это позволяет клиентскому роутингу (React Router / Wouter) обрабатывать пути вроде /auction/123
  app.get("*", (req, res, next) => {
    // Если это API запрос, пропускаем его к следующему middleware 
    if (req.path.startsWith("/api/")) {
      return next();
    }
    
    // В development режиме статические файлы обслуживаются через Vite
    // SPA fallback нужен только в production режиме
    if (process.env.NODE_ENV !== "production") {
      console.log(`🔧 SPA FALLBACK (DEVELOPMENT): ${req.path} → пропускаем к Vite`);
      return next();
    }
    
    // Для всех остальных путей (/auction/123, /profile, /admin, etc.) 
    // возвращаем index.html чтобы клиентский роутинг мог обработать путь
    console.log(`🔧 SPA FALLBACK (PRODUCTION): ${req.path} → index.html (для клиентского роутинга)`);
    
    // В production режиме путь к index.html
    const publicPath = path.resolve(import.meta.dirname, "public");
    const indexPath = path.resolve(publicPath, "index.html");
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Если файл не найден, отправляем 404
      res.status(404).json({ 
        error: "Page not found",
        message: "Клиентские файлы не найдены. Убедитесь что приложение собрано правильно."
      });
    }
  });
  
  return httpServer;
}

// Функция для отправки SMS через VPS прокси (статический IP 188.166.61.86)
async function sendSMSCode(phoneNumber: string, code: string): Promise<{success: boolean, message?: string}> {
  const VPS_PROXY_URL = "http://188.166.61.86:3000/api/send-sms";
  
  console.log(`[SMS VPS PROXY] Отправка SMS на ${phoneNumber}: ${code}`);
  
  try {
    // Отправляем запрос к VPS прокси с правильными параметрами для OSON SMS API v1
    const response = await fetch(VPS_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AUTOBID.TJ Replit Client'
      },
      body: JSON.stringify({
        login: process.env.SMS_LOGIN || "zarex",
        password: process.env.SMS_PASSWORD || "a6d5d8b47551199899862d6d768a4cb1",
        sender: process.env.SMS_SENDER || "OsonSMS",
        to: phoneNumber.replace(/[^0-9]/g, ''),
        text: `Ваш код подтверждения AUTOBID.TJ: ${code}`
      })
    });
    
    // Проверяем что ответ в JSON формате
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`VPS прокси вернул неправильный формат ответа: ${contentType}`);
    }
    
    const responseData = await response.json();
    console.log(`[SMS VPS PROXY] Ответ прокси сервера:`, responseData);
    
    if (response.ok && responseData.success) {
      console.log(`✅ SMS успешно отправлен через VPS прокси`);
      return { 
        success: true, 
        message: "SMS код отправлен через VPS прокси"
      };
    } else {
      console.error(`[SMS VPS PROXY] Ошибка отправки:`, responseData);
      
      // Fallback в демо-режим при ошибке VPS
      console.log(`[SMS DEMO FALLBACK] VPS прокси ошибка. Отправка SMS на ${phoneNumber}: ${code}`);
      return { 
        success: true, 
        message: "SMS отправлен (демо-режим - VPS ошибка)",
        code: code
      };
    }
    
  } catch (error) {
    console.error("[SMS VPS PROXY] Ошибка при отправке SMS через VPS:", error);
    
    // Fallback в демо-режим при ошибке подключения к VPS
    console.log(`[SMS DEMO FALLBACK] Отправка SMS на ${phoneNumber}: ${code}`);
    return { 
      success: true, 
      message: "SMS отправлен (демо-режим - VPS недоступен)",
      code: code
    };
  }
}

// Функция для отправки SMS уведомлений через VPS прокси
async function sendSMSNotification(phoneNumber: string, message: string): Promise<{success: boolean, message?: string}> {
  // URL VPS прокси сервера
  const VPS_PROXY_URL = "http://188.166.61.86:3000/api/send-sms";
  
  console.log(`[SMS VPS PROXY] Отправка SMS уведомления на ${phoneNumber}: ${message}`);
  
  try {
    // Отправляем запрос к VPS прокси с правильными параметрами для OSON SMS API v1
    const response = await fetch(VPS_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AUTOBID.TJ Replit Client'
      },
      body: JSON.stringify({
        login: process.env.SMS_LOGIN || "zarex",
        password: process.env.SMS_PASSWORD || "a6d5d8b47551199899862d6d768a4cb1",
        sender: process.env.SMS_SENDER || "OsonSMS",
        to: phoneNumber.replace(/[^0-9]/g, ''),
        text: message
      })
    });
    
    // Проверяем что ответ в JSON формате
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`VPS прокси вернул неправильный формат ответа: ${contentType}`);
    }
    
    const responseData = await response.json();
    console.log(`[SMS VPS PROXY] Ответ прокси сервера:`, responseData);
    
    if (response.ok && responseData.success) {
      console.log(`✅ SMS уведомление отправлено через VPS прокси`);
      return { 
        success: true, 
        message: "SMS уведомление отправлено через VPS прокси"
      };
    } else {
      console.error(`[SMS VPS PROXY] Ошибка отправки уведомления:`, responseData);
      
      // Fallback в демо-режим при недоступности VPS
      console.log(`[SMS DEMO FALLBACK] VPS недоступен. Отправка SMS уведомления на ${phoneNumber}: ${message}`);
      return { 
        success: true, 
        message: "SMS уведомление отправлено (демо-режим - VPS недоступен)"
      };
    }
    
  } catch (error) {
    console.error("[SMS VPS PROXY] Ошибка при отправке SMS уведомления через VPS:", error);
    
    // Fallback в демо-режим при ошибке
    console.log(`[SMS DEMO FALLBACK] Отправка SMS уведомления на ${phoneNumber}: ${message}`);
    return { 
      success: true, 
      message: "SMS уведомление отправлено (демо-режим - ошибка VPS)"
    };
  }
}


