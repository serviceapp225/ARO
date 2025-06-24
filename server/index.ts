import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { initializeDatabaseWithSampleData } from "./initDatabase";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Add caching headers for better performance
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    // Cache API responses for 30 seconds
    res.set('Cache-Control', 'public, max-age=30');
  } else if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    // Cache static assets for 1 hour
    res.set('Cache-Control', 'public, max-age=3600');
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
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
  // Skip database initialization when using mock storage
  if (!process.env.DATABASE_URL?.includes('ep-broad-shadow-adb94hwu')) {
    try {
      await initializeDatabaseWithSampleData();
    } catch (error) {
      console.log("Database initialization failed, using mock data");
      console.log("Error:", error.message);
    }
  } else {
    console.log("Using mock storage due to database connection issues");
  }
  
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

  // Production deployment with fallback port handling
  const port = process.env.PORT || 5000;
  const host = process.env.HOST || "0.0.0.0";
  
  try {
    server.listen(Number(port), host, () => {
      log(`🚀 Auto Auction App serving on ${host}:${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = Number(port) + Math.floor(Math.random() * 1000);
      log(`Port ${port} busy, using fallback port ${fallbackPort}`);
      server.listen(fallbackPort, host, () => {
        log(`🚀 Auto Auction App serving on ${host}:${fallbackPort}`);
      });
    } else {
      throw err;
    }
  }
})();
