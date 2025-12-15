import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Web için localStorage, native için SecureStore
interface StorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  deleteItem: (key: string) => Promise<void>;
}

const getStorage = (): StorageInterface => {
  if (Platform.OS === 'web') {
    return {
      getItem: async (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch {}
      },
      deleteItem: async (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch {}
      },
    };
  }
  // Native için SecureStore wrapper
  return {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    deleteItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
};

const storage = getStorage();

// Backend API URL - .env dosyasından veya app.json'dan okunur
const getApiUrl = () => {
  // Önce .env dosyasından (babel-plugin-inline-dotenv ile)
  if (process.env.EXPO_PUBLIC_API_URL) {
    let url = process.env.EXPO_PUBLIC_API_URL;
    // Mobil cihazda localhost yerine bilgisayarın IP'sini kullan
    if (Platform.OS !== 'web' && url.includes('localhost')) {
      // Expo development server'ın IP'sini al
      const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
      if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
        url = url.replace('localhost', expoHost).replace('127.0.0.1', expoHost);
      }
    }
    return url;
  }
  // Sonra app.json'dan (Constants.expoConfig.extra)
  if (Constants.expoConfig?.extra?.apiUrl) {
    let url = Constants.expoConfig.extra.apiUrl;
    // Mobil cihazda localhost yerine bilgisayarın IP'sini kullan
    if (Platform.OS !== 'web' && url.includes('localhost')) {
      const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
      if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
        url = url.replace('localhost', expoHost).replace('127.0.0.1', expoHost);
      }
    }
    return url;
  }
  // Varsayılan değer - mobil için IP'yi otomatik bul
  if (Platform.OS !== 'web') {
    const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
    if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
      return `http://${expoHost}:8080`;
    }
  }
  return 'http://localhost:8080';
};

const API_BASE_URL = getApiUrl();

// Debug için (geliştirme sırasında kontrol edebilirsiniz)
if (__DEV__) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use(async (config) => {
      const token = await storage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await storage.deleteItem('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/api/auth/login', { email, password });
    if (response.data.token) {
      await storage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }

  async register(email: string, password: string, displayName: string) {
    const response = await this.client.post('/api/auth/register', { email, password, displayName });
    if (response.data.token) {
      await storage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  async logout() {
    await storage.deleteItem('auth_token');
  }

  // Categories
  async getCategories() {
    const response = await this.client.get('/api/categories');
    return response.data;
  }

  // Places
  async searchPlaces(params: {
    latitude: number;
    longitude: number;
    categoryId?: number;
    subcategoryId?: number;
    maxDistanceKm?: number;
    minRating?: number;
    priceLevel?: string;
    sort?: 'distance' | 'rating' | 'reviewCount';
    page?: number;
    size?: number;
  }) {
    const response = await this.client.get('/api/places/search', { params });
    return response.data;
  }

  async getPlaceById(id: number) {
    const response = await this.client.get(`/api/places/${id}`);
    return response.data;
  }

  // Add Place (User Submission)
  async addPlace(data: {
    name: string;
    categoryId: number;
    address: string;
    city: string;
    district: string;
    latitude: number;
    longitude: number;
    description?: string;
  }) {
    const response = await this.client.post('/api/places', data);
    return response.data;
  }

  // Favorites
  async toggleFavorite(placeId: number) {
    const response = await this.client.post(`/api/places/${placeId}/favorite`);
    return response.data;
  }

  async removeFavorite(placeId: number) {
    const response = await this.client.delete(`/api/places/${placeId}/favorite`);
    return response.data;
  }

  async getFavorites() {
    const response = await this.client.get('/api/user/favorites');
    return response.data;
  }

  // Visited
  async toggleVisited(placeId: number) {
    const response = await this.client.post(`/api/places/${placeId}/visited`);
    return response.data;
  }

  async removeVisited(placeId: number) {
    const response = await this.client.delete(`/api/places/${placeId}/visited`);
    return response.data;
  }

  async getVisited() {
    const response = await this.client.get('/api/user/visited');
    return response.data;
  }

  // Reviews
  async getPlaceReviews(placeId: number, page: number = 0, size: number = 20) {
    const response = await this.client.get(`/api/places/${placeId}/reviews`, {
      params: { page, size },
    });
    return response.data;
  }

  async getUserReview(placeId: number) {
    try {
      const response = await this.client.get(`/api/places/${placeId}/reviews/me`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // User hasn't reviewed yet
      }
      throw error;
    }
  }

  async addReview(placeId: number, rating: number, comment: string) {
    const response = await this.client.post(`/api/places/${placeId}/reviews`, {
      rating,
      comment,
    });
    return response.data;
  }

  async updateReview(placeId: number, reviewId: number, rating: number, comment: string) {
    const response = await this.client.put(`/api/places/${placeId}/reviews/${reviewId}`, {
      rating,
      comment,
    });
    return response.data;
  }

  async deleteReview(placeId: number, reviewId: number) {
    const response = await this.client.delete(`/api/places/${placeId}/reviews/${reviewId}`);
    return response.data;
  }
}

export const apiService = new ApiService();
