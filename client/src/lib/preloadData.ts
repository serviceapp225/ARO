// Preload critical data to reduce login time
import { queryClient } from './queryClient';

interface PreloadedData {
  listings: any[];
  banners: any[];
  sellSection: any;
  timestamp: number;
}

const PRELOAD_CACHE_KEY = 'autobid-preload-cache';
const PRELOAD_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const preloadCriticalData = async () => {
  try {
    // Check if we have recent cached data
    const cached = localStorage.getItem(PRELOAD_CACHE_KEY);
    if (cached) {
      const data: PreloadedData = JSON.parse(cached);
      if (Date.now() - data.timestamp < PRELOAD_CACHE_DURATION) {
        // Use cached data immediately
        queryClient.setQueryData(['/api/listings'], data.listings);
        queryClient.setQueryData(['/api/advertisement-carousel'], data.banners);
        queryClient.setQueryData(['/api/sell-car-section'], data.sellSection);
        return;
      }
    }

    // Fetch fresh data in parallel
    const [listingsRes, bannersRes, sellSectionRes] = await Promise.all([
      fetch('/api/listings'),
      fetch('/api/advertisement-carousel'),
      fetch('/api/sell-car-section')
    ]);

    const [listings, banners, sellSection] = await Promise.all([
      listingsRes.json(),
      bannersRes.json(),
      sellSectionRes.json()
    ]);

    // Cache the data
    const preloadData: PreloadedData = {
      listings,
      banners,
      sellSection,
      timestamp: Date.now()
    };

    localStorage.setItem(PRELOAD_CACHE_KEY, JSON.stringify(preloadData));

    // Set in React Query cache
    queryClient.setQueryData(['/api/listings'], listings);
    queryClient.setQueryData(['/api/advertisement-carousel'], banners);
    queryClient.setQueryData(['/api/sell-car-section'], sellSection);

  } catch (error) {
    console.error('Preload failed:', error);
  }
};

export const clearPreloadCache = () => {
  localStorage.removeItem(PRELOAD_CACHE_KEY);
};