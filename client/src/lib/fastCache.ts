// Ultra-fast caching system for instant loading
interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

class FastCache {
  private cache = new Map<string, CacheEntry>();
  
  set(key: string, data: any, expiryMinutes: number = 30) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiryMinutes * 60 * 1000
    });
    
    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`fast_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        expiry: expiryMinutes * 60 * 1000
      }));
    } catch (e) {
      // Ignore localStorage errors
    }
  }
  
  get(key: string): any | null {
    // Check memory cache first
    const memoryEntry = this.cache.get(key);
    if (memoryEntry && Date.now() - memoryEntry.timestamp < memoryEntry.expiry) {
      return memoryEntry.data;
    }
    
    // Check localStorage cache
    try {
      const stored = localStorage.getItem(`fast_cache_${key}`);
      if (stored) {
        const entry = JSON.parse(stored);
        if (Date.now() - entry.timestamp < entry.expiry) {
          // Restore to memory cache
          this.cache.set(key, entry);
          return entry.data;
        } else {
          // Expired, clean up
          localStorage.removeItem(`fast_cache_${key}`);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return null;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  clear(pattern?: string) {
    if (pattern) {
      // Clear by pattern
      const keys = Array.from(this.cache.keys());
      for (const key of keys) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          localStorage.removeItem(`fast_cache_${key}`);
        }
      }
    } else {
      // Clear all
      this.cache.clear();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('fast_cache_')) {
          localStorage.removeItem(key);
        }
      }
    }
  }
}

export const fastCache = new FastCache();

// Pre-cache critical data for instant loading
export const preCacheUserData = (phoneNumber: string, userData: any) => {
  fastCache.set(`user_${phoneNumber}`, userData, 60); // 1 hour cache
};

export const getCachedUserData = (phoneNumber: string) => {
  return fastCache.get(`user_${phoneNumber}`);
};

export const preCacheListings = (listings: any[]) => {
  fastCache.set('main_listings', listings, 10); // 10 minutes cache
};

export const getCachedListings = () => {
  return fastCache.get('main_listings');
};