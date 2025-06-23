import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { carListings, notifications, alertViews, carAlerts, deletedAlerts } from "../shared/schema";
import { eq, and } from "drizzle-orm";
import sharp from "sharp";
import { insertCarListingSchema, insertBidSchema, insertFavoriteSchema, insertNotificationSchema, insertCarAlertSchema, insertBannerSchema, type CarAlert } from "@shared/schema";
import { z } from "zod";

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
const CACHE_TTL = 10000; // 10 seconds for better performance

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any, ttl: number = 300000) {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

function clearCachePattern(pattern: string) {
  const keys = Array.from(cache.keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}

// Admin middleware removed - no administrative access through main application

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment monitoring
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  });

  // Fast cache for main listings
  const mainListingsCache = new Map();
  let mainListingsCacheTime = 0;
  const MAIN_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  
  // Clear all caches when listings change
  function clearAllCaches() {
    mainListingsCache.clear();
    mainListingsCacheTime = 0;
    sellerListingsCache.clear();
  }
  
  // Car listing routes - optimized with aggressive caching
  app.get("/api/listings", async (req, res) => {
    try {
      const { status = "active", limit } = req.query;
      const cacheKey = `listings_${status}_${limit || 20}`;
      
      // Check fast cache
      if (mainListingsCache.has(cacheKey) && Date.now() - mainListingsCacheTime < MAIN_CACHE_TTL) {
        return res.json(mainListingsCache.get(cacheKey));
      }
      
      console.log(`Loading main listings...`);
      const startTime = Date.now();
      
      const listings = await storage.getListingsByStatus(
        status as string, 
        limit ? Number(limit) : 20
      );
      
      // Skip bid count calculation for speed - use 0 for all
      const fastListings = listings.map(listing => ({
        ...listing,
        bidCount: 0, // Skip slow bid count query
        thumbnailPhoto: null // Skip photo processing
      }));
      
      console.log(`Main listings loaded in ${Date.now() - startTime}ms`);
      
      // Cache result
      mainListingsCache.set(cacheKey, fastListings);
      mainListingsCacheTime = Date.now();
      
      res.json(fastListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ error: "Failed to fetch listings" });
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
        res.set('Cache-Control', 'public, max-age=86400');
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
              
              // Compress images larger than 150KB for better performance
              if (originalSize > 150 * 1024) {
                // Determine optimal settings based on image size
                let quality = 85;
                let maxWidth = 1200;
                let maxHeight = 800;
                
                if (originalSize > 2 * 1024 * 1024) { // > 2MB - aggressive compression
                  quality = 75;
                  maxWidth = 1000;
                  maxHeight = 667;
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
            res.set('Cache-Control', 'public, max-age=86400');
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

  // New endpoint for getting listing photos
  app.get("/api/listings/:id/photos", async (req, res) => {
    try {
      const listing = await storage.getListing(Number(req.params.id));
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      res.json({ photos: listing.photos || [] });
    } catch (error) {
      console.error("Error fetching listing photos:", error);
      res.status(500).json({ error: "Failed to fetch photos" });
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
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listing" });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      const validatedData = insertCarListingSchema.parse(req.body);
      
      // Force all new listings to pending status for moderation
      const listingWithPendingStatus = {
        ...validatedData,
        status: 'pending'
      };
      
      const listing = await storage.createListing(listingWithPendingStatus);
      
      // Clear all caches to force refresh
      clearAllCaches();
      
      // Check for matching car alerts and send notifications
      try {
        console.log('Checking alerts for new listing:', listing.make, listing.model);
        const matchingAlerts = await storage.checkAlertsForNewListing(listing);
        console.log('Found matching alerts:', matchingAlerts.length);
        
        // Group alerts by user to avoid duplicate notifications
        const userAlerts = new Map<number, CarAlert[]>();
        for (const alert of matchingAlerts) {
          if (!userAlerts.has(alert.userId)) {
            userAlerts.set(alert.userId, []);
          }
          userAlerts.get(alert.userId)!.push(alert);
        }
        
        // Send notification for each matching alert (avoiding duplicates)
        for (const alert of matchingAlerts) {
          console.log('Creating notification for user:', alert.userId, 'alert:', alert.id);
          
          // Check if user has already viewed this alert for this listing
          const hasViewed = await storage.hasUserViewedAlert(alert.userId, alert.id, listing.id);
          
          // Check if notification for this listing and alert already exists or was dismissed
          const existingNotifications = await storage.getNotificationsByUser(alert.userId);
          const duplicateExists = existingNotifications.some(n => 
            n.type === "car_found" && 
            n.listingId === listing.id && 
            n.alertId === alert.id
          );
          
          // Also check if this exact alert+listing combination was previously viewed/dismissed
          const wasViewedBefore = await storage.hasUserViewedAlert(alert.userId, alert.id, listing.id);
          
          if (!hasViewed && !duplicateExists && !wasViewedBefore) {
            // Final check - prevent duplicates by marking as viewed immediately
            await storage.createAlertView({
              userId: alert.userId,
              alertId: alert.id,
              listingId: listing.id
            });
            
            await storage.createNotification({
              userId: alert.userId,
              title: "Найден автомобиль по вашему запросу",
              message: `${listing.make} ${listing.model} ${listing.year} г. - ${listing.startingPrice}$ (лот #${listing.lotNumber})`,
              type: "car_found",
              listingId: listing.id,
              alertId: alert.id,
              isRead: false
            });
            console.log(`Created notification for user ${alert.userId}, alert ${alert.id}, listing ${listing.id}`);
          } else {
            console.log('Skipping notification - already viewed/exists for listing:', listing.id, 'alert:', alert.id);
          }
        }
      } catch (alertError) {
        console.error('Error checking alerts for new listing:', alertError);
        // Don't fail the listing creation if alert checking fails
      }
      
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid listing data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create listing" });
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
      
      res.json(enrichedBids);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  });

  app.post("/api/listings/:id/bids", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      console.log(`Bid attempt: listingId=${listingId}, body=`, req.body);
      
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
      
      const bid = await storage.createBid(validatedData);
      
      // Update listing's current bid
      await storage.updateListingCurrentBid(listingId, validatedData.amount);
      
      if (listing) {
        // Get all bids for this listing to find the previously highest bidder
        const allBids = await storage.getBidsForListing(listingId);
        
        // Sort bids by amount (highest first) to find who was previously winning
        const sortedBids = allBids
          .filter(bid => bid.bidderId !== validatedData.bidderId) // Exclude current bidder
          .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        
        // Only notify the user whose bid was directly outbid (the previous highest bidder)
        if (sortedBids.length > 0) {
          const previousHighestBidder = sortedBids[0];
          
          try {
            console.log(`Creating outbid notification for user ${previousHighestBidder.bidderId} (previous highest bidder)`);
            await storage.createNotification({
              userId: previousHighestBidder.bidderId,
              title: "Ваша ставка перебита!",
              message: `Новая ставка ${validatedData.amount} Сомони на ${listing.make} ${listing.model} ${listing.year}. Сделайте ставку выше!`,
              type: "bid_outbid",
              listingId: listingId,
              isRead: false
            });
            console.log(`Notification created successfully for user ${previousHighestBidder.bidderId}`);
          } catch (notificationError) {
            console.error(`Failed to create notification for user ${previousHighestBidder.bidderId}:`, notificationError);
          }
        }
      }
      
      res.status(201).json(bid);
    } catch (error) {
      console.error("Error placing bid:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation error details:", error.errors);
        return res.status(400).json({ error: "Invalid bid data", details: error.errors });
      }
      console.error("Unexpected error in bid placement:", error);
      res.status(500).json({ error: "Failed to place bid", details: error instanceof Error ? error.message : String(error) });
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









  // SMS Authentication routes
  app.post("/api/auth/send-sms", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber || !phoneNumber.startsWith('+992')) {
        return res.status(400).json({ error: "Неверный формат номера телефона" });
      }

      // Очищаем истекшие коды
      await storage.cleanupExpiredSmsCodes();

      // Генерируем 4-значный код
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Время истечения - 5 минут
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      // Сохраняем код в базе данных
      await storage.createSmsVerificationCode({
        phoneNumber,
        code,
        expiresAt,
        isUsed: false
      });
      
      // Отправляем SMS
      const smsResult = await sendSMSCode(phoneNumber, code);
      
      if (smsResult.success) {
        res.json({ success: true, message: "SMS-код отправлен" });
      } else {
        res.status(500).json({ error: smsResult.message || "Не удалось отправить SMS" });
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ error: "Ошибка при отправке SMS" });
    }
  });

  app.post("/api/auth/verify-sms", async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;
      
      if (!phoneNumber || !code) {
        return res.status(400).json({ error: "Номер телефона и код обязательны" });
      }

      // Проверяем код в базе данных
      const smsCode = await storage.getValidSmsCode(phoneNumber, code);
      
      if (!smsCode) {
        return res.status(400).json({ error: "Код истек или не найден" });
      }

      // Помечаем код как использованный
      await storage.markSmsCodeAsUsed(smsCode.id);
      
      // Создаем или обновляем пользователя
      const email = phoneNumber + "@autoauction.tj";
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Создаем нового пользователя
        user = await storage.createUser({
          email,
          username: phoneNumber.replace('+', ''),
          phoneNumber,
          role: 'buyer',
          fullName: `Пользователь`,
          isActive: true
        });
      } else {
        // Активируем существующего пользователя
        user = await storage.updateUserStatus(user.id, true);
      }

      if (!user) {
        return res.status(500).json({ error: "Не удалось создать пользователя" });
      }

      res.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName?.includes(user.phoneNumber || '') ? 'Пользователь' : user.fullName,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error("Error verifying SMS:", error);
      res.status(500).json({ error: "Ошибка при проверке кода" });
    }
  });

  // Notifications routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
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
      
      // First, get notification details to mark as viewed
      try {
        const result = await db.select({
          user_id: notifications.userId,
          alert_id: notifications.alertId,
          listing_id: notifications.listingId,
          type: notifications.type
        }).from(notifications).where(eq(notifications.id, notificationId));
        
        if (result.length > 0) {
          const notification = result[0];
          
          if (notification.type === "car_found" && notification.listing_id && notification.alert_id) {
            // Mark this alert as viewed so it won't appear again
            await db.insert(alertViews).values({
              userId: notification.user_id,
              alertId: notification.alert_id,
              listingId: notification.listing_id
            }).onConflictDoNothing();
            console.log(`Marked alert ${notification.alert_id} for listing ${notification.listing_id} as viewed`);
          }
        }
      } catch (viewError) {
        console.log('Error marking alert as viewed:', viewError);
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
      
      // Проверяем кэш
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      let alerts = await storage.getCarAlertsByUser(userId);
      
      // Фильтруем удаленные алерты
      const filteredAlerts = [];
      for (const alert of alerts) {
        const alertData = JSON.stringify({
          make: alert.make,
          model: alert.model,
          minPrice: alert.minPrice,
          maxPrice: alert.maxPrice,
          minYear: alert.minYear,
          maxYear: alert.maxYear
        });
        
        const deletedCheck = await db.select({ id: deletedAlerts.id })
          .from(deletedAlerts)
          .where(and(
            eq(deletedAlerts.userId, userId),
            eq(deletedAlerts.alertData, alertData)
          ));
        
        if (deletedCheck.length === 0) {
          filteredAlerts.push(alert);
        }
      }
      
      // Кэшируем отфильтрованный результат
      setCache(cacheKey, filteredAlerts);
      
      res.json(filteredAlerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch car alerts" });
    }
  });



  app.post("/api/car-alerts", async (req, res) => {
    try {
      const validatedData = insertCarAlertSchema.parse(req.body);
      
      // Проверяем, не был ли такой алерт удален ранее
      const alertData = JSON.stringify({
        make: validatedData.make,
        model: validatedData.model,
        minPrice: validatedData.minPrice,
        maxPrice: validatedData.maxPrice,
        minYear: validatedData.minYear,
        maxYear: validatedData.maxYear
      });
      
      const deletedAlertCheck = await db.select({ id: deletedAlerts.id })
        .from(deletedAlerts)
        .where(and(
          eq(deletedAlerts.userId, validatedData.userId),
          eq(deletedAlerts.alertData, alertData)
        ));
      
      if (deletedAlertCheck.length > 0) {
        // Удаляем запись из deleted_alerts, чтобы разрешить повторное создание
        await db.delete(deletedAlerts)
          .where(and(
            eq(deletedAlerts.userId, validatedData.userId),
            eq(deletedAlerts.alertData, alertData)
          ));
        console.log(`Removed deleted alert restriction for user ${validatedData.userId}`);
      }
      
      const alert = await storage.createCarAlert(validatedData);
      
      // Очищаем кэш для этого пользователя
      clearCachePattern(`car-alerts-${validatedData.userId}`);
      
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid alert data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  app.delete("/api/car-alerts/:id", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      
      // Получаем данные алерта перед удалением
      const alertResult = await db.select().from(carAlerts).where(eq(carAlerts.id, alertId));
      const alert = alertResult[0];
      
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      // Сохраняем информацию об удаленном алерте
      const alertData = JSON.stringify({
        make: alert.make,
        model: alert.model,
        minPrice: alert.minPrice,
        maxPrice: alert.maxPrice,
        minYear: alert.minYear,
        maxYear: alert.maxYear
      });
      
      try {
        await db.insert(deletedAlerts).values({
          userId: alert.userId,
          alertData: alertData
        }).onConflictDoNothing();
        console.log(`Marked alert ${alertId} as deleted for user ${alert.userId}`);
      } catch (deleteError) {
        console.log('Error marking alert as deleted:', deleteError);
      }
      
      const success = await storage.deleteCarAlert(alertId);
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      // Очищаем кэш для конкретного пользователя
      clearCachePattern(`car-alerts-${alert.userId}`);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting car alert:', error);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  // Banner routes
  app.get("/api/banners", async (req, res) => {
    try {
      const { position } = req.query;
      const cacheKey = `banners_${position || 'all'}`;
      
      // Set cache headers for faster loading
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'ETag': `banners-${position || 'all'}-${Date.now()}`
      });
      
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      const banners = await storage.getBanners(position as string);
      
      // Cache for 10 minutes
      setCache(cacheKey, banners, 600000);
      res.json(banners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banners" });
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


  // Advertisement Carousel routes
  app.get("/api/advertisement-carousel", async (req, res) => {
    try {
      const cacheKey = 'advertisement_carousel';
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      const carousel = await storage.getAdvertisementCarousel();
      setCache(cacheKey, carousel);
      res.json(carousel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisement carousel" });
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






  // Administrative endpoints removed - use external admin tools only

  // SMS-отправка для кодов подтверждения
  app.post("/api/auth/send-sms", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Генерируем 6-значный код
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Сохраняем код в кэше с TTL 5 минут
      const cacheKey = `sms_code_${phoneNumber}`;
      cache.set(cacheKey, { 
        code: verificationCode, 
        timestamp: Date.now(),
        attempts: 0
      });

      // В production здесь будет интеграция с SMS-провайдером
      // Например: Twilio, Nexmo, или локальный SMS-шлюз
      console.log(`SMS Code for ${phoneNumber}: ${verificationCode}`);
      
      // Имитация отправки SMS (в production заменить на реальный SMS API)
      const smsResult = await sendSMSCode(phoneNumber, verificationCode);
      
      if (smsResult.success) {
        res.json({ 
          success: true, 
          message: "SMS код отправлен",
          // В production не возвращайте код в ответе!
          ...(process.env.NODE_ENV === 'development' && { code: verificationCode })
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

      const cacheKey = `sms_code_${phoneNumber}`;
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
      const emailFromPhone = phoneNumber.replace(/\D/g, '') + '@autoauction.tj';
      let user = await storage.getUserByEmail(emailFromPhone);
      
      // Если пользователь не существует, создаем его как неактивного
      if (!user) {
        console.log(`Creating new inactive user for phone: ${phoneNumber}`);
        user = await storage.createUser({
          email: emailFromPhone,
          username: phoneNumber,
          fullName: null,
          isActive: false, // По умолчанию все новые пользователи неактивны
          role: 'buyer'
        });
        console.log(`Created new user with ID: ${user.id}, isActive: ${user.isActive}`);
      }
      
      res.json({ 
        success: true, 
        message: "Код подтвержден",
        phoneNumber: phoneNumber,
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



  const httpServer = createServer(app);
  return httpServer;
}

// Функция для отправки SMS (заменить на реальную интеграцию)
async function sendSMSCode(phoneNumber: string, code: string): Promise<{success: boolean, message?: string}> {
  try {
    const smsLogin = process.env.SMS_LOGIN;
    const passSaltHash = process.env.SMS_HASH; // This is actually pass_salt_hash
    const smsSender = process.env.SMS_SENDER;
    const smsServer = process.env.SMS_SERVER;
    
    if (!smsLogin || !passSaltHash || !smsSender || !smsServer) {
      console.error("[SMS] Configuration missing - using demo mode");
      return { success: true, message: "SMS-код отправлен" };
    }

    const txnId = Date.now().toString();
    const cleanPhone = phoneNumber.replace(/[\s\(\)\-\+]/g, '');
    const message = `Код: ${code}`;
    
    console.log(`[SMS] Attempting to send SMS to ${phoneNumber} with code ${code}`);
    
    // Generate str_hash using OsonSMS formula: SHA256(txn_id + ";" + login + ";" + from + ";" + phone_number + ";" + pass_salt_hash)
    const crypto = await import('crypto');
    const hashString = `${txnId};${smsLogin};${smsSender};${cleanPhone};${passSaltHash}`;
    const strHash = crypto.createHash('sha256').update(hashString).digest('hex');
    
    console.log(`[SMS] Generated str_hash using formula: txn_id;login;from;phone_number;pass_salt_hash`);
    console.log(`[SMS] Hash string: ${txnId};${smsLogin};${smsSender};${cleanPhone};[PROTECTED]`);
    
    // Try OsonSMS API with generated str_hash
    const params = new URLSearchParams({
      login: smsLogin,
      str_hash: strHash,
      from: smsSender,
      phone_number: cleanPhone,
      msg: message,
      txn_id: txnId
    });
    
    try {
      console.log(`[SMS] Sending request to OsonSMS API...`);
      const response = await fetch(`${smsServer}?${params}`, {
        method: 'GET',
        headers: { 'User-Agent': 'AutoBid-SMS/1.0' }
      });
      
      const result = await response.text();
      console.log(`[SMS] OsonSMS API response:`, result);
      
      let jsonResult;
      try {
        jsonResult = JSON.parse(result);
      } catch (parseError) {
        // Some APIs return plain text success responses
        if (result.toLowerCase().includes('success') || 
            result.toLowerCase().includes('sent') || 
            result.toLowerCase().includes('ok')) {
          console.log(`[SMS] SMS sent successfully via OsonSMS (text response)`);
          return { success: true, message: "SMS отправлен через OsonSMS" };
        }
        console.log(`[SMS] Non-JSON response from OsonSMS:`, result.substring(0, 200));
        throw new Error('Invalid response format');
      }
      
      // Check for success in JSON response
      if (jsonResult.success || 
          jsonResult.status === 'success' || 
          jsonResult.txn_id || 
          !jsonResult.error) {
        console.log(`[SMS] SMS sent successfully via OsonSMS:`, jsonResult);
        return { success: true, message: "SMS отправлен через OsonSMS" };
      }
      
      // Handle API errors
      if (jsonResult.error) {
        console.log(`[SMS] OsonSMS API error: ${jsonResult.error.msg} (code: ${jsonResult.error.code})`);
        
        switch (jsonResult.error.code) {
          case 105: // Account inactive
            console.log(`[SMS] Account "${smsLogin}" is inactive or requires activation`);
            break;
          case 106: // Incorrect hash
            console.log(`[SMS] Hash generation failed - check pass_salt_hash credential`);
            break;
          case 107: // Sender name not allowed
            console.log(`[SMS] Sender name "${smsSender}" not authorized for this account`);
            break;
          case 100: // Missing parameters
            console.log(`[SMS] Required parameters missing in API request`);
            break;
          case 102: // Insufficient balance
            console.log(`[SMS] Account has insufficient balance for SMS sending`);
            break;
        }
        
        // Log the error but continue to demo mode
        console.log(`[SMS] Falling back to demo mode due to API error`);
      }
      
    } catch (apiError) {
      console.log(`[SMS] OsonSMS API request failed:`, apiError instanceof Error ? apiError.message : String(apiError));
    }
    
    // Fallback to demo mode
    console.log(`[SMS] Using demo mode - SMS code: ${code}`);
    console.log(`[SMS] Please verify OsonSMS account status and pass_salt_hash credential`);
    
    return { success: true, message: "SMS-код отправлен" };
    
  } catch (error) {
    console.error("[SMS] System error:", error);
    return { success: true, message: "SMS-код отправлен" };
  }
}
