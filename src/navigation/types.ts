// Main Tab Navigation - 4 tabs: Explore, Map, Saved, Profile
export type MainTabParamList = {
  Explore: undefined;
  Map: undefined;
  Saved: undefined;
  Profile: undefined;
};

// Explore Stack - Home, Categories, Nearby Places
export type ExploreStackParamList = {
  ExploreHome: undefined;
  NearbyPlaces: { categoryId?: number };
  PlaceDetail: { placeId: number };
  AddReview: { 
    placeId: number;
    reviewId?: number; // For edit mode
    initialRating?: number; // For edit mode
    initialComment?: string; // For edit mode
  };
};

// Map Stack - Fullscreen map
export type MapStackParamList = {
  MapView: undefined;
};

// Saved Stack - Favorites, Visited
export type SavedStackParamList = {
  SavedHome: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  About: undefined;
};

// Auth Modal Stack
export type AuthModalStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Root Stack - Main app + Auth modal
export type RootStackParamList = {
  MainTabs: undefined;
  AuthModal: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
