import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useLocationStore } from '../store/locationStore';
import { usePlacesStore } from '../store/placesStore';
import PlaceCard from '../components/PlaceCard';
import LoadingIndicator from '../components/LoadingIndicator';
import { Place } from '../types';
import { ExploreStackParamList } from '../navigation/types';
import { colors, spacing, typography, borderRadius, shadowMd, shadowSm } from '../theme/designSystem';

type NearbyPlacesRouteProp = RouteProp<ExploreStackParamList, 'NearbyPlaces'>;

export default function NearbyPlacesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<NearbyPlacesRouteProp>();
  const { currentLocation, fetchLocation } = useLocationStore();
  const { selectedCategory, selectedSubcategory, setPlaces } = usePlacesStore();
  const categoryId = route.params?.categoryId || selectedCategory?.id;
  const [searchDistance, setSearchDistance] = useState(10);

  const { data: placesResponse, isLoading, refetch } = useQuery({
    queryKey: ['places', currentLocation?.latitude, currentLocation?.longitude, categoryId, selectedSubcategory, searchDistance],
    queryFn: async () => {
      if (!currentLocation) {
        await fetchLocation();
        return null;
      }
      const response = await apiService.searchPlaces({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        categoryId: categoryId ? Number(categoryId) : undefined,
        subcategoryId: selectedSubcategory ? Number(selectedSubcategory) : undefined,
        maxDistanceKm: searchDistance,
        page: 0,
        size: 20,
        sort: 'distance',
      });
      setPlaces(response.content || []);
      return response;
    },
    enabled: !!currentLocation,
  });

  // Fallback: If no nearby places, fetch popular places
  const { data: popularPlacesResponse } = useQuery({
    queryKey: ['popularPlacesFallback', categoryId],
    queryFn: async () => {
      // Use Istanbul as default for fallback
      const defaultLat = 41.0082;
      const defaultLng = 28.9784;
      return apiService.searchPlaces({
        latitude: defaultLat,
        longitude: defaultLng,
        categoryId: categoryId ? Number(categoryId) : undefined,
        maxDistanceKm: 50,
        page: 0,
        size: 10,
        sort: 'rating',
      });
    },
    enabled: !!placesResponse && (placesResponse?.content || []).length === 0,
  });

  const places = placesResponse?.content || [];
  const fallbackPlaces = popularPlacesResponse?.content || [];
  const hasNearbyPlaces = places.length > 0;
  const showFallback = !hasNearbyPlaces && fallbackPlaces.length > 0;

  useEffect(() => {
    if (!currentLocation) {
      fetchLocation();
    }
  }, []);

  const handlePlacePress = (place: Place) => {
    navigation.navigate('PlaceDetail', { placeId: place.id });
  };

  const handleExpandDistance = () => {
    setSearchDistance(prev => Math.min(prev + 10, 50));
  };

  const handleChangeCategory = () => {
    navigation.goBack();
  };

  if (isLoading && !currentLocation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingIndicator message="Getting your location..." />
      </SafeAreaView>
    );
  }

  if (!currentLocation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Feather name="map-pin" size={72} color={colors.primary} />
          </View>
          <Text style={styles.errorText}>Location permission required</Text>
          <Text style={styles.errorSubtext}>
            We need your location to find nearby places
          </Text>
          <TouchableOpacity style={styles.button} onPress={fetchLocation} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Smart empty state with fallback
  if (!hasNearbyPlaces && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedCategory ? selectedCategory.name : 'Nearby Places'}
          </Text>
          <View style={styles.backButton} />
        </View>

        {showFallback ? (
          // Show fallback popular places instead of empty state
          <View style={styles.fallbackSection}>
            <View style={styles.fallbackHeader}>
              <Feather name="info" size={20} color={colors.primary} />
              <Text style={styles.fallbackHeaderText}>
                No places found nearby. Here are some popular places:
              </Text>
            </View>
            <FlatList
              data={fallbackPlaces}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <PlaceCard place={item} onPress={() => handlePlacePress(item)} />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          // Empty state with suggestions
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="map" size={72} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No places found nearby</Text>
            <Text style={styles.emptySubtext}>
              {categoryId
                ? `We couldn't find any ${selectedCategory?.name?.toLowerCase() || 'places'} within ${searchDistance}km.`
                : `We couldn't find any places within ${searchDistance}km.`}
            </Text>

            <View style={styles.suggestionsContainer}>
              {searchDistance < 50 && (
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={handleExpandDistance}
                  activeOpacity={0.8}
                >
                  <View style={styles.suggestionIconContainer}>
                    <Feather name="maximize-2" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.suggestionButtonText}>
                    Expand search to {searchDistance + 10}km
                  </Text>
                </TouchableOpacity>
              )}

              {categoryId && (
                <TouchableOpacity
                  style={styles.suggestionButton}
                  onPress={handleChangeCategory}
                  activeOpacity={0.8}
                >
                  <View style={styles.suggestionIconContainer}>
                    <Feather name="filter" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.suggestionButtonText}>
                    Try a different category
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={() => navigation.navigate('ExploreHome')}
                activeOpacity={0.8}
              >
                <View style={styles.suggestionIconContainer}>
                  <Feather name="compass" size={20} color={colors.primary} />
                </View>
                <Text style={styles.suggestionButtonText}>
                  Browse all places
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCategory ? selectedCategory.name : 'Nearby Places'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={places}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PlaceCard place={item} onPress={() => handlePlacePress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  errorSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadowMd,
    minWidth: 200,
  },
  buttonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  suggestionsContainer: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    gap: spacing.md,
    ...shadowSm,
    minHeight: 56,
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  fallbackSection: {
    flex: 1,
  },
  fallbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  fallbackHeaderText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});
