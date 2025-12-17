// Design System - Production-ready, consumer-grade
import { Platform } from 'react-native';

// ============================================================================
// Shadow styles - Use inline styles in StyleSheet.create() instead of exports
// ============================================================================
// NOTE: shadowMd export removed to prevent runtime errors
// Use inline shadow properties directly in StyleSheet definitions:
// shadowColor: '#000',
// shadowOffset: { width: 0, height: 2 },
// shadowOpacity: 0.1,
// shadowRadius: 4,
// elevation: 3,
// ============================================================================

// Shadow exports REMOVED - Use inline shadow properties in StyleSheet.create()
// DO NOT export shadow objects - they cause native bridge serialization failures
// Use inline properties:
// shadowColor: '#000',
// shadowOffset: { width: 0, height: 1 },
// shadowOpacity: 0.05,
// shadowRadius: 2,
// elevation: 2,

export const colors = {
  // Primary - Modern blue
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#5AC8FA',
  primaryGradient: ['#007AFF', '#5AC8FA'],
  
  // Neutral - Calm, clean
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundTertiary: '#F5F5F7',
  border: '#E5E5EA',
  borderLight: '#F0F0F0',
  text: '#1D1D1F',
  textSecondary: '#6E6E73',
  textTertiary: '#8E8E93',
  
  // Semantic - Apple-inspired
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  
  // Interactive - Emotional colors
  favorite: '#FF3B30',
  visited: '#34C759',
  
  // Overlay - For gradients and overlays
  overlay: 'rgba(0, 0, 0, 0.3)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  // Buttons
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Card styles for consistency
// Note: Using direct shadow references to avoid circular dependency
export const cardStyles = {
  default: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    // shadowMd applied directly - no spread to avoid runtime issues
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  elevated: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    // shadowLg applied directly
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  flat: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
};

