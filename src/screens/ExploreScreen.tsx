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
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

export default function ExploreScreen() {
  const navigation = useNavigation<any>();
  const { setSelectedCategory, setSelectedSubcategory } = usePlacesStore();
  const { currentLocation, fetchLocation } = useLocationStore();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });

  // Discovery endpoints - always show something
  const locationForDiscovery = currentLocation || { latitude: 41.0082, longitude: 28.9784 }; // Istanbul fallback

  // Trending near you
  const { data: trendingResponse, isLoading: trendingLoading } = useQuery({
    queryKey: ['discover', 'trending', locationForDiscovery.latitude, locationForDiscovery.longitude],
    queryFn: () => apiService.getTrendingPlaces(
      locationForDiscovery.latitude,
      locationForDiscovery.longitude,
      12
    ),
    retry: 1,
  });

  // Popular this week
  const { data: popularResponse, isLoading: popularLoading } = useQuery({
    queryKey: ['discover', 'popular', locationForDiscovery.latitude, locationForDiscovery.longitude],
    queryFn: () => apiService.getPopularThisWeek(
      locationForDiscovery.latitude,
      locationForDiscovery.longitude,
      12
    ),
    retry: 1,
  });

  // Hidden gems
  const { data: hiddenGemsResponse, isLoading: hiddenGemsLoading } = useQuery({
    queryKey: ['discover', 'hidden-gems', locationForDiscovery.latitude, locationForDiscovery.longitude],
    queryFn: () => apiService.getHiddenGems(
      locationForDiscovery.latitude,
      locationForDiscovery.longitude,
      12
    ),
    retry: 1,
  });

  // Nearby active places
  const { data: nearbyActiveResponse, isLoading: nearbyActiveLoading } = useQuery({
    queryKey: ['discover', 'nearby-active', locationForDiscovery.latitude, locationForDiscovery.longitude],
    queryFn: () => apiService.getNearbyActive(
      locationForDiscovery.latitude,
      locationForDiscovery.longitude,
      12
    ),
    retry: 1,
  });

  // Aggressive fallback - always show something
  const { data: fallbackResponse, isLoading: fallbackLoading } = useQuery({
    queryKey: ['fallbackPlaces', locationForDiscovery.latitude, locationForDiscovery.longitude],
    queryFn: async () => {
      // Try multiple fallback strategies
      try {
        // Strategy 1: Popular places in city
        const response = await apiService.searchPlaces({
          latitude: locationForDiscovery.latitude,
          longitude: locationForDiscovery.longitude,
          maxDistanceKm: 50,
          page: 0,
          size: 20,
          sort: 'rating',
        });
        if (response?.content && response.content.length > 0) {
          return response;
        }
      } catch (error) {
        // Continue to next strategy
      }

      // Strategy 2: All places sorted by rating
      try {
        const response = await apiService.searchPlaces({
          latitude: locationForDiscovery.latitude,
          longitude: locationForDiscovery.longitude,
          maxDistanceKm: 100,
          page: 0,
          size: 20,
          sort: 'rating',
        });
        return response;
      } catch (error) {
        // Return empty but valid structure
        return { content: [] };
      }
    },
    enabled: true, // Always enabled as ultimate fallback
  });

  // Backend discovery endpoints return arrays directly (not objects with 'places' property)
  const trendingPlaces = Array.isArray(trendingResponse) ? trendingResponse : trendingResponse?.places || [];
  const popularPlaces = Array.isArray(popularResponse) ? popularResponse : popularResponse?.places || [];
  const hiddenGems = Array.isArray(hiddenGemsResponse) ? hiddenGemsResponse : hiddenGemsResponse?.places || [];
  const nearbyActivePlaces = Array.isArray(nearbyActiveResponse) 
    ? nearbyActiveResponse 
    : nearbyActiveResponse?.places || nearbyActiveResponse?.content || [];
  const fallbackPlaces = fallbackResponse?.content || [];
  const topCategories = categories?.slice(0, 8) || [];

  // Smart section visibility - always show at least 2 sections
  const hasAnyDiscoveryData = trendingPlaces.length > 0 || popularPlaces.length > 0 || hiddenGems.length > 0 || nearbyActivePlaces.length > 0;
  const shouldShowFallback = !hasAnyDiscoveryData && fallbackPlaces.length > 0;

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
            
            {/* Add Place CTA */}
            <TouchableOpacity
              style={styles.addPlaceButton}
              onPress={() => navigation.navigate('AddPlace')}
              activeOpacity={0.8}
            >
              <Feather name="plus-circle" size={18} color={colors.background} />
              <Text style={styles.addPlaceButtonText}>
                Can't find a place? Add it
              </Text>
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

        {/* Nearby Active Section - Show first if available */}
        {(nearbyActivePlaces.length > 0 || nearbyActiveLoading) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Feather name="activity" size={20} color={colors.success} />
                <Text style={styles.sectionTitle}>Active nearby</Text>
              </View>
              {nearbyActivePlaces.length > 5 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('NearbyPlaces')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              )}
            </View>
            {nearbyActiveLoading ? (
              <View style={styles.loadingContainer}>
                <LoadingIndicator message="Finding active places..." />
              </View>
            ) : nearbyActivePlaces.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {nearbyActivePlaces.slice(0, 8).map((place: Place) => (
                  <View key={place.id} style={styles.horizontalCard}>
                    <PlaceCard place={place} onPress={() => handlePlacePress(place)} />
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        )}

        {/* Trending Near You Section */}
        {(trendingPlaces.length > 0 || trendingLoading) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Feather name="trending-up" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Trending near you</Text>
              </View>
              {trendingPlaces.length > 5 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('NearbyPlaces')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              )}
            </View>
            {trendingLoading ? (
              <View style={styles.loadingContainer}>
                <LoadingIndicator message="Loading trending places..." />
              </View>
            ) : trendingPlaces.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {trendingPlaces.slice(0, 8).map((place: Place) => (
                  <View key={place.id} style={styles.horizontalCard}>
                    <PlaceCard place={place} onPress={() => handlePlacePress(place)} />
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        )}

        {/* Popular This Week Section */}
        {(popularPlaces.length > 0 || popularLoading) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Feather name="star" size={20} color={colors.warning} />
                <Text style={styles.sectionTitle}>Popular this week</Text>
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
            {popularLoading ? (
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
            ) : null}
          </View>
        )}

        {/* Hidden Gems Section */}
        {(hiddenGems.length > 0 || hiddenGemsLoading) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Feather name="gem" size={20} color={colors.success} />
                <Text style={styles.sectionTitle}>Hidden gems</Text>
              </View>
              {hiddenGems.length > 5 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('NearbyPlaces')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              )}
            </View>
            {hiddenGemsLoading ? (
              <View style={styles.loadingContainer}>
                <LoadingIndicator message="Discovering hidden gems..." />
              </View>
            ) : hiddenGems.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {hiddenGems.slice(0, 8).map((place: Place) => (
                  <View key={place.id} style={styles.horizontalCard}>
                    <PlaceCard place={place} onPress={() => handlePlacePress(place)} />
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        )}

        {/* Fallback: Popular Places (ALWAYS show if no discovery data) */}
        {shouldShowFallback && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Feather name="star" size={20} color={colors.warning} />
                <Text style={styles.sectionTitle}>Popular places</Text>
              </View>
            </View>
            {fallbackLoading ? (
              <View style={styles.loadingContainer}>
                <LoadingIndicator message="Loading places..." />
              </View>
            ) : fallbackPlaces.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {fallbackPlaces.slice(0, 8).map((place: Place) => (
                  <View key={place.id} style={styles.horizontalCard}>
                    <PlaceCard place={place} onPress={() => handlePlacePress(place)} />
                  </View>
                ))}
              </ScrollView>
            ) : (
              // Ultimate fallback - show categories and map CTA
              <View style={styles.ultimateFallback}>
                <Text style={styles.ultimateFallbackText}>
                  Start exploring by category or use the map
                </Text>
                <TouchableOpacity
                  style={styles.ultimateFallbackButton}
                  onPress={handleExploreNearby}
                  activeOpacity={0.8}
                >
                  <Feather name="map" size={18} color={colors.background} />
                  <Text style={styles.ultimateFallbackButtonText}>Explore Map</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  addPlaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addPlaceButtonText: {
    ...typography.buttonSmall,
    color: colors.background,
    fontWeight: '600',
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
  ultimateFallback: {
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  ultimateFallbackText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  ultimateFallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ultimateFallbackButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '700',
  },
});
