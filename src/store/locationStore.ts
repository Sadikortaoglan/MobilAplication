import { create } from 'zustand';
import { Location } from '../types';
import { locationService } from '../services/location';

interface LocationState {
  currentLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  fetchLocation: () => Promise<void>;
  watchLocation: () => Promise<void>;
  stopWatching: () => void;
  subscription: any;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  isLoading: false,
  error: null,
  subscription: null,

  fetchLocation: async () => {
    try {
      set({ isLoading: true, error: null });
      const location = await locationService.getCurrentLocation();
      if (location) {
        set({ currentLocation: location, isLoading: false });
      } else {
        set({
          error: 'Location permission denied',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to get location',
        isLoading: false,
      });
    }
  },

  watchLocation: async () => {
    const subscription = await locationService.watchPosition((location) => {
      set({ currentLocation: location });
    });

    if (subscription) {
      set({ subscription });
    }
  },

  stopWatching: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.remove();
      set({ subscription: null });
    }
  },
}));

