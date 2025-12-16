export interface User {
  id: number;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parentName: string | null;
  children: Category[];
}

export interface PlaceCategory {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parentName: string | null;
}

export interface Photo {
  id: number;
  url: string;
  isCover: boolean;
  createdAt: string;
}

export interface Place {
  id: number;
  name: string;
  description?: string;
  category: PlaceCategory;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  priceLevel?: string;
  averageRating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  distance?: number;
  photos: Photo[];
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  user: User;
  createdAt: string;
  updatedAt: string;
  helpfulCount?: number;
}

export interface VisitedTimelineItem {
  placeId: number;
  placeName: string;
  category: PlaceCategory;
  visitedAt: string;
  photos?: Photo[];
}

export interface UserStats {
  visitedCount: number;
  reviewCount: number;
  favoriteCount: number;
  helpfulReviewsGiven?: number;
}

export interface DiscoveryResponse {
  places: Place[];
  context: 'trending' | 'popular-this-week' | 'hidden-gems';
  fallbackApplied: boolean;
  fallbackReason?: string;
  generatedAt: string;
  metadata?: {
    totalPlaces: number;
    userLocation?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface MapMarker {
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  category: PlaceCategory;
  visitIntensity: number;
  isTrending: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface MapMarkersResponse {
  markers: MapMarker[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  totalMarkers: number;
  zoomLevel?: number;
  clustered?: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface SearchParams {
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
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

