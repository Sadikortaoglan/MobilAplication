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
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Sonra app.json'dan (Constants.expoConfig.extra)
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  // Varsayılan değer
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

  // Reviews
  async getPlaceReviews(placeId: number, page: number = 0, size: number = 20) {
    const response = await this.client.get(`/api/places/${placeId}/reviews`, {
      params: { page, size },
    });
    return response.data;
  }

  async addReview(placeId: number, rating: number, comment: string) {
    const response = await this.client.post(`/api/places/${placeId}/reviews`, {
      rating,
      comment,
    });
    return response.data;
  }
}

export const apiService = new ApiService();

