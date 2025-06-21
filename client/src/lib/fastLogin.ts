// Ultra-fast login system - eliminates all slow operations during login
import { queryClient } from './queryClient';

interface FastLoginData {
  listings: any[];
  userFavorites: any[];
  userNotifications: any[];
  banners: any[];
  sellSection: any;
  timestamp: number;
}

const FAST_LOGIN_CACHE = 'fast-login-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const prepareFastLogin = async (userId: number) => {
  try {
    // Fetch all data in parallel with minimal delay
    const [
      listingsResponse,
      favoritesResponse,
      notificationsResponse,
      bannersResponse,
      sellSectionResponse
    ] = await Promise.allSettled([
      fetch('/api/listings'),
      fetch(`/api/users/${userId}/favorites`),
      fetch(`/api/notifications/${userId}`),
      fetch('/api/advertisement-carousel'),
      fetch('/api/sell-car-section')
    ]);

    const data: FastLoginData = {
      listings: listingsResponse.status === 'fulfilled' ? await listingsResponse.value.json() : [],
      userFavorites: favoritesResponse.status === 'fulfilled' ? await favoritesResponse.value.json() : [],
      userNotifications: notificationsResponse.status === 'fulfilled' ? await notificationsResponse.value.json() : [],
      banners: bannersResponse.status === 'fulfilled' ? await bannersResponse.value.json() : [],
      sellSection: sellSectionResponse.status === 'fulfilled' ? await sellSectionResponse.value.json() : null,
      timestamp: Date.now()
    };

    // Cache for fast access
    localStorage.setItem(`${FAST_LOGIN_CACHE}-${userId}`, JSON.stringify(data));

    // Immediately populate React Query cache
    queryClient.setQueryData(['/api/listings'], data.listings);
    queryClient.setQueryData([`/api/users/${userId}/favorites`], data.userFavorites);
    queryClient.setQueryData([`/api/notifications/${userId}`], data.userNotifications);
    queryClient.setQueryData(['/api/advertisement-carousel'], data.banners);
    queryClient.setQueryData(['/api/sell-car-section'], data.sellSection);

    return data;
  } catch (error) {
    console.error('Fast login preparation failed:', error);
    return null;
  }
};

export const loadFastLoginData = (userId: number): FastLoginData | null => {
  try {
    const cached = localStorage.getItem(`${FAST_LOGIN_CACHE}-${userId}`);
    if (!cached) return null;

    const data: FastLoginData = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(`${FAST_LOGIN_CACHE}-${userId}`);
      return null;
    }

    // Immediately populate React Query cache with valid data
    queryClient.setQueryData(['/api/listings'], data.listings);
    queryClient.setQueryData([`/api/users/${userId}/favorites`], data.userFavorites);
    queryClient.setQueryData([`/api/notifications/${userId}`], data.userNotifications);
    queryClient.setQueryData(['/api/advertisement-carousel'], data.banners);
    queryClient.setQueryData(['/api/sell-car-section'], data.sellSection);

    return data;
  } catch (error) {
    console.error('Fast login cache load failed:', error);
    return null;
  }
};

export const clearFastLoginCache = (userId?: number) => {
  if (userId) {
    localStorage.removeItem(`${FAST_LOGIN_CACHE}-${userId}`);
  } else {
    // Clear all fast login caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(FAST_LOGIN_CACHE)) {
        localStorage.removeItem(key);
      }
    });
  }
};