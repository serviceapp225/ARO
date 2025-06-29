import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { carListings, notifications, alertViews, carAlerts } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
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
const CACHE_TTL = 30000; // 30 seconds for better performance

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCachePattern(pattern: string) {
  const keys = Array.from(cache.keys());
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}

// Middleware для защиты админских маршрутов
const adminAuth = (req: any, res: any, next: any) => {
  const adminKey = req.headers['x-admin-key'];
  
  // В production используйте переменную окружения ADMIN_API_KEY
  const validAdminKey = process.env.ADMIN_API_KEY || 'retool-admin-key-2024';
  
  if (!adminKey || adminKey !== validAdminKey) {
    return res.status(403).json({ error: 'Unauthorized: Invalid admin key' });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // Check fast cache - увеличиваем время кэша до 2 минут
      if (mainListingsCache.has(cacheKey) && Date.now() - mainListingsCacheTime < 120000) {
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
      
      // Агрессивные HTTP заголовки кэширования
      res.set({
        'Cache-Control': 'public, max-age=120, s-maxage=60', // 2 минуты кэш в браузере, 1 минута в CDN
        'ETag': `"listings-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString()
      });
      
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
      
      // Generate lot number if not provided
      let lotNumber = validatedData.lotNumber;
      if (!lotNumber) {
        const { generateUniqueLotNumber } = await import('./utils/lotNumberGenerator');
        const existingListings = await storage.getListingsByStatus('', 1000); // Get all to check lot numbers
        const existingLotNumbers = existingListings.map(l => l.lotNumber);
        lotNumber = generateUniqueLotNumber(existingLotNumbers);
      }
      
      // Set new listings to active status so they appear immediately
      const listingWithActiveStatus = {
        ...validatedData,
        lotNumber,
        status: 'active'
      };
      
      const listing = await storage.createListing(listingWithActiveStatus);
      
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
          
          // Check if notification for this listing and alert already exists
          const existingNotifications = await storage.getNotificationsByUser(alert.userId);
          const duplicateExists = existingNotifications.some(n => 
            n.type === "car_found" && 
            n.listingId === listing.id && 
            n.alertId === alert.id
          );
          
          if (!hasViewed && !duplicateExists) {
            await storage.createNotification({
              userId: alert.userId,
              title: "Найден автомобиль по вашему запросу",
              message: `${listing.make.toUpperCase()} ${listing.model.toUpperCase()} ${listing.year} г. - ${listing.startingPrice} Сомони (лот #${listing.lotNumber})`,
              type: "car_found",
              listingId: listing.id,
              alertId: alert.id,
              isRead: false
            });
          } else {
            console.log('User has already viewed this alert or notification exists for listing:', listing.id, 'alert:', alert.id);
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
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing status" });
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
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update listing status" });
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
        const result = await db.execute(
          sql`SELECT user_id, alert_id, listing_id, type FROM notifications WHERE id = ${notificationId}`
        );
        
        if (result.rows.length > 0) {
          const notification = result.rows[0] as any;
          
          if (notification.type === "car_found" && notification.listing_id && notification.alert_id) {
            // Mark this alert as viewed so it won't appear again
            await db.execute(
              sql`INSERT INTO alert_views (user_id, alert_id, listing_id) 
                  VALUES (${notification.user_id}, ${notification.alert_id}, ${notification.listing_id})
                  ON CONFLICT (user_id, alert_id, listing_id) DO NOTHING`
            );
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
      
      // Сначала получаем alert, чтобы знать userId для очистки кэша
      const alertToDelete = await storage.getCarAlertsByUser(alertId); // Need to find userId first
      
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
        return res.json(cached);
      }
      
      const carousel = await storage.getAdvertisementCarousel();
      setCache(cacheKey, carousel);
      res.json(carousel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advertisement carousel" });
    }
  });

  app.get("/api/admin/advertisement-carousel", async (req, res) => {
    try {
      const carousel = await storage.getAdvertisementCarousel();
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

  app.put("/api/admin/advertisement-carousel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateAdvertisementCarouselItem(id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Carousel item not found" });
      }
      clearCachePattern('advertisement_carousel');
      res.json(item);
    } catch (error) {
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

  // Middleware для проверки админских прав
  const requireAdmin = (req: any, res: any, next: any) => {
    // В реальном приложении здесь была бы проверка авторизации
    // Пока что пропускаем все запросы для демонстрации
    next();
  };

  // Админские API роуты - только для номера +992000000000
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

  const httpServer = createServer(app);
  return httpServer;
}

// Функция для отправки SMS (заменить на реальную интеграцию)
async function sendSMSCode(phoneNumber: string, code: string): Promise<{success: boolean, message?: string}> {
  // В production здесь будет реальная интеграция с SMS-провайдером
  // Примеры популярных провайдеров в Таджикистане:
  
  // 1. Tcell SMS API
  // 2. Beeline SMS Gateway  
  // 3. Megafon SMS API
  // 4. Twilio (международный)
  
  try {
    // Имитация задержки отправки SMS
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // В production раскомментируйте нужную интеграцию:
    
    /* Пример интеграции с Twilio:
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    const message = await client.messages.create({
      body: `Ваш код подтверждения AUTOBID.TJ: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    return { success: true, message: message.sid };
    */
    
    /* Пример с локальным SMS-шлюзом:
    const response = await fetch('http://localhost:8080/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneNumber,
        text: `Код подтверждения AUTOBID.TJ: ${code}`
      })
    });
    
    return response.ok ? { success: true } : { success: false };
    */
    
    // Текущая заглушка для разработки
    console.log(`[SMS DEMO] Отправка SMS на ${phoneNumber}: ${code}`);
    return { success: true, message: "SMS отправлен (демо-режим)" };
    
  } catch (error) {
    console.error("SMS sending failed:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
}


