// Category icon mapping - Airbnb/Apple Maps style
import { Feather } from '@expo/vector-icons';

export const getCategoryIcon = (categoryName: string): keyof typeof Feather.glyphMap => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('sport') || name.includes('gym') || name.includes('fitness')) {
    return 'activity';
  }
  if (name.includes('food') || name.includes('restaurant') || name.includes('dining')) {
    return 'coffee';
  }
  if (name.includes('cafe') || name.includes('coffee')) {
    return 'coffee';
  }
  if (name.includes('market') || name.includes('shop') || name.includes('store')) {
    return 'shopping-bag';
  }
  if (name.includes('park') || name.includes('outdoor')) {
    return 'tree';
  }
  if (name.includes('hotel') || name.includes('accommodation')) {
    return 'home';
  }
  if (name.includes('entertainment') || name.includes('cinema') || name.includes('theater')) {
    return 'film';
  }
  if (name.includes('health') || name.includes('medical') || name.includes('hospital')) {
    return 'heart';
  }
  if (name.includes('education') || name.includes('school') || name.includes('university')) {
    return 'book';
  }
  if (name.includes('transport') || name.includes('station')) {
    return 'navigation';
  }
  
  return 'map-pin'; // default
};

export const getCategoryColor = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('sport') || name.includes('gym') || name.includes('fitness')) {
    return '#FF6B6B';
  }
  if (name.includes('food') || name.includes('restaurant') || name.includes('dining')) {
    return '#FF9500';
  }
  if (name.includes('cafe') || name.includes('coffee')) {
    return '#8B4513';
  }
  if (name.includes('market') || name.includes('shop') || name.includes('store')) {
    return '#34C759';
  }
  if (name.includes('park') || name.includes('outdoor')) {
    return '#5AC8FA';
  }
  
  return '#007AFF'; // default
};

