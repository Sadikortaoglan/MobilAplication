import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { usePlacesStore } from '../store/placesStore';
import { useLocationStore } from '../store/locationStore';
import CategoryCard from '../components/CategoryCard';
import PlaceCard from '../components/PlaceCard';
import LoadingIndicator from '../components/LoadingIndicator';
import { Category, Place, Photo } from '../types';
import { colors, spacing, typography, borderRadius, shadowMd } from '../theme/designSystem';

export default function ExploreScreen() {
  const navigation = useNavigation<any>();
  const { setSelectedCategory, setSelectedSubcategory } = usePlacesStore();
  const { currentLocation, fetchLocation } = useLocationStore();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });

  // Fetch popular places (no location required) - always show something
  const { data: popularPlacesResponse, isLoading: placesLoading } = useQuery({
    queryKey: ['popularPlaces'],
    queryFn: async () => {
      // Use Istanbul as default location for curated content
      const defaultLat = 41.0082;
      const defaultLng = 28.9784;
      return apiService.searchPlaces({
        latitude: defaultLat,
        longitude: defaultLng,
        maxDistanceKm: 50,
        page: 0,
        size: 12,
        sort: 'rating',
      });
    },
  });

  // Fetch nearby places if location available
  const { data: nearbyPlacesResponse, isLoading: nearbyLoading } = useQuery({
    queryKey: ['nearbyPlaces', currentLocation?.latitude, currentLocation?.longitude],
    queryFn: async () => {
      if (!currentLocation) return null;
      return apiService.searchPlaces({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        maxDistanceKm: 10,
        page: 0,
        size: 10,
        sort: 'distance',
      });
    },
    enabled: !!currentLocation,
  });

  const popularPlaces = popularPlacesResponse?.content || [];
  const nearbyPlaces = nearbyPlacesResponse?.content || [];
  const topCategories = categories?.slice(0, 8) || [];

  useEffect(() => {
    // Soft location request - non-blocking
    if (!currentLocation) {
      fetchLocation();
    }
  }, []);

  const handleExploreNearby = () => {
    navigation.navigate('Map');
  };

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    navigation.navigate('NearbyPlaces', { categoryId: category.id });
  };

  const handlePlacePress = (place: Place) => {
    navigation.navigate('PlaceDetail', { placeId: place.id });
  };

  if (categoriesLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingIndicator message="Loading..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Rich & Visual with Gradient Effect */}
        <View style={styles.hero}>
          <View style={styles.heroGradient} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Discover great places{'\n'}around you
            </Text>
            <Text style={styles.heroSubtitle}>
              Find gyms, cafes, restaurants and more —{'\n'}rated by real people
            </Text>
            
            {!currentLocation && (
              <View style={styles.locationPrompt}>
                <View style={styles.locationPromptIcon}>
                  <Feather name="map-pin" size={14} color={colors.background} />
                </View>
                <Text style={styles.locationPromptText}>
                  Enable location for nearby results
                </Text>
              </View>
            )}

            {/* Primary Action - Integrated in Hero */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleExploreNearby}
              activeOpacity={0.8}
            >
              <View style={styles.primaryButtonIcon}>
                <Feather name="map" size={22} color={colors.background} />
              </View>
              <Text style={styles.primaryButtonText}>Explore nearby places</Text>
              <Feather name="chevron-right" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Showcase - Horizontal Scroll with Rich Cards */}
        {topCategories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse by category</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {topCategories.map((category: Category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onPress={() => handleCategoryPress(category)}
                  isHorizontal={true}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Nearby Places Section - Horizontal Slider */}
        {currentLocation && nearbyPlaces.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Feather name="map-pin" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Near you</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('NearbyPlaces')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {nearbyPlaces.slice(0, 8).map((place: Place) => (
                <View key={place.id} style={styles.horizontalCard}>
                  <PlaceCard place={place} onPress={() => handlePlacePress(place)} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Popular Places Section - Horizontal Slider */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Feather name="star" size={20} color={colors.warning} />
              <Text style={styles.sectionTitle}>Popular places</Text>
            </View>
            {popularPlaces.length > 5 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('NearbyPlaces')}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            )}
          </View>
          {placesLoading ? (
            <View style={styles.loadingContainer}>
              <LoadingIndicator message="Loading popular places..." />
            </View>
          ) : popularPlaces.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {popularPlaces.slice(0, 8).map((place: Place) => (
                <View key={place.id} style={styles.horizontalCard}>
                  <PlaceCard place={place} onPress={() => handlePlacePress(place)} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.fallbackContainer}>
              <Feather name="map" size={48} color={colors.textTertiary} />
              <Text style={styles.fallbackText}>Discover places on the map</Text>
              <TouchableOpacity
                style={styles.fallbackButton}
                onPress={handleExploreNearby}
              >
                <Text style={styles.fallbackButtonText}>Explore Map</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* All Categories - 2 Column Grid */}
        {categories && categories.length > 8 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All categories</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category: Category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onPress={() => handleCategoryPress(category)}
                  isHorizontal={false}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  hero: {
    position: 'relative',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + spacing.md,
    paddingBottom: spacing.xl + spacing.md,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    borderRadius: 0,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    opacity: 0.95,
  },
  heroContent: {
    maxWidth: '100%',
    position: 'relative',
    zIndex: 1,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.background,
    marginBottom: spacing.md,
    lineHeight: 40,
    fontWeight: '800',
  },
  heroSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.lg,
    lineHeight: 24,
    fontSize: 16,
  },
  locationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  locationPromptIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPromptText: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
    ...shadowMd,
  },
  primaryButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.background,
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 17,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    fontWeight: '700',
    fontSize: 22,
  },
  seeAllText: {
    ...typography.buttonSmall,
    color: colors.primary,
    paddingHorizontal: spacing.lg,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
  },
  horizontalScroll: {
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.md,
  },
  horizontalCard: {
    width: 300,
    marginRight: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xl,
  },
  fallbackContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  fallbackText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  fallbackButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  fallbackButtonText: {
    ...typography.button,
    color: colors.background,
  },
});
