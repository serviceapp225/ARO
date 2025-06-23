import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 10000; // 10 seconds

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Clear all caches endpoint
  function clearAllCaches() {
    cache.clear();
    console.log("All caches cleared");
  }

  // API Routes
  app.get("/api/listings", async (req, res) => {
    try {
      console.log("Loading main listings...");
      const start = Date.now();
      
      const cacheKey = `listings-${req.query.status || 'active'}`;
      
      // Check cache first for ultra-fast response
      let cached = getCached(cacheKey);
      if (cached) {
        console.log(`Main listings loaded from cache in ${Date.now() - start}ms`);
        return res.json(cached);
      }

      console.log('Starting ultra-fast main listings query for status:', req.query.status || 'active');
      
      const listings = await storage.getListingsByStatus(req.query.status as string || 'active');
      console.log(`Main listings loaded in ${Date.now() - start}ms`);
      
      // Cache the results
      setCache(cacheKey, listings, CACHE_TTL);
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  // Create new listing
  app.post("/api/listings", async (req, res) => {
    try {
      const listingData = req.body;
      
      // Set required fields for new listing
      listingData.status = 'active';
      listingData.currentBid = null;
      listingData.auctionStartTime = new Date();
      listingData.auctionEndTime = new Date(Date.now() + (listingData.auctionDuration * 60 * 60 * 1000));
      
      // Generate lot number if not provided
      if (!listingData.lotNumber) {
        listingData.lotNumber = Math.floor(100000 + Math.random() * 900000).toString();
      }
      
      const listing = await storage.createListing(listingData);
      
      // Clear cache to show new listing immediately
      clearCachePattern('listings');
      
      res.json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ error: "Failed to create listing" });
    }
  });

  // Photo endpoint with SVG placeholder generation
  app.get("/api/listings/:id/photo/:index", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const photoIndex = parseInt(req.params.index);
      
      if (isNaN(listingId) || listingId <= 0 || isNaN(photoIndex) || photoIndex < 0) {
        return res.status(400).json({ error: "Invalid parameters" });
      }
      
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Generate SVG placeholder for car photos
      const carSvg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="#f8fafc"/>
        <rect x="50" y="200" width="700" height="200" rx="20" fill="url(#carGradient)"/>
        <circle cx="200" cy="450" r="50" fill="#1f2937"/>
        <circle cx="600" cy="450" r="50" fill="#1f2937"/>
        <circle cx="200" cy="450" r="30" fill="#6b7280"/>
        <circle cx="600" cy="450" r="30" fill="#6b7280"/>
        <rect x="100" y="220" width="150" height="80" rx="10" fill="#1e40af" opacity="0.8"/>
        <text x="400" y="300" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
          ${listing.make} ${listing.model}
        </text>
        <text x="400" y="330" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.8">
          ${listing.year} • ${listing.mileage.toLocaleString()} km
        </text>
      </svg>`;
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(carSvg);
    } catch (error) {
      console.error("Error in photo route:", error);
      res.status(500).json({ error: "Failed to fetch photo" });
    }
  });

  // User notifications endpoint
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Sell car section endpoint
  app.get("/api/sell-car-section", async (req, res) => {
    try {
      const sellCarSection = await storage.getSellCarSection();
      res.json(sellCarSection);
    } catch (error) {
      console.error("Error fetching sell car section:", error);
      res.status(500).json({ error: "Failed to fetch sell car section" });
    }
  });

  // Advertisement carousel endpoint
  app.get("/api/advertisement-carousel", async (req, res) => {
    try {
      const carousel = await storage.getAdvertisementCarousel();
      res.json(carousel);
    } catch (error) {
      console.error("Error fetching advertisement carousel:", error);
      res.status(500).json({ error: "Failed to fetch advertisement carousel" });
    }
  });

  // Sell car section image placeholder
  app.get("/api/sell-car-section/image", (req, res) => {
    const sellCarSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sellGradient)"/>
      <text x="200" y="160" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" font-weight="bold">
        Sell Your Car
      </text>
      <text x="200" y="190" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.9">
        Get the best price today
      </text>
    </svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(sellCarSvg);
  });

  // Advertisement carousel image placeholder
  app.get("/api/advertisement-carousel/:id/image", (req, res) => {
    const adSvg = `<svg width="400" height="250" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="adGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#adGradient)"/>
      <text x="200" y="130" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">
        Premium Cars
      </text>
      <text x="200" y="160" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.9">
        Available Now
      </text>
    </svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(adSvg);
  });

  const server = createServer(app);
  return server;
}