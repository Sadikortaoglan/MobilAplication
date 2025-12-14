import { create } from 'zustand';
import { Category, Place, SearchParams } from '../types';

interface PlacesState {
  selectedCategory: Category | null;
  selectedSubcategory: number | null;
  searchParams: SearchParams | null;
  places: Place[];
  setSelectedCategory: (category: Category | null) => void;
  setSelectedSubcategory: (subcategoryId: number | null) => void;
  setSearchParams: (params: SearchParams) => void;
  setPlaces: (places: Place[]) => void;
  clearFilters: () => void;
}

export const usePlacesStore = create<PlacesState>((set) => ({
  selectedCategory: null,
  selectedSubcategory: null,
  searchParams: null,
  places: [],

  setSelectedCategory: (category) => {
    set({ selectedCategory: category, selectedSubcategory: null });
  },

  setSelectedSubcategory: (subcategoryId) => {
    set({ selectedSubcategory: subcategoryId });
  },

  setSearchParams: (params) => {
    set({ searchParams: params });
  },

  setPlaces: (places) => {
    set({ places });
  },

  clearFilters: () => {
    set({
      selectedCategory: null,
      selectedSubcategory: null,
      searchParams: null,
    });
  },
}));

