import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useLocationStore } from '../store/locationStore';
import CustomMapView from '../components/MapView';
import PlacePreviewBottomSheet from '../components/PlacePreviewBottomSheet';
import LoadingIndicator from '../components/LoadingIndicator';
import { Place } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const { currentLocation, fetchLocation } = useLocationStore();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const mapRef = useRef<any>(null);

  // Default location (Istanbul) for fallback
  const defaultLocation = { latitude: 41.0082, longitude: 28.9784 };
  const mapCenter = currentLocation || defaultLocation;

  // Try map markers endpoint first, fallback to search
  const { data: mapMarkersResponse, isLoading: markersLoading } = useQuery({
    queryKey: ['mapMarkers', mapCenter.latitude, mapCenter.longitude, mapRegion],
    queryFn: async () => {
      try {
        // Calculate bounds from region or use default
        const bounds = mapRegion || {
          north: mapCenter.latitude + 0.05,
          south: mapCenter.latitude - 0.05,
          east: mapCenter.longitude + 0.05,
          west: mapCenter.longitude - 0.05,
        };
        return await apiService.getMapMarkers(bounds);
      } catch (error) {
        // Fallback to regular search
        return null;
      }
    },
    retry: 1,
  });

  // Fallback: Regular search
  const { data: placesResponse, isLoading: placesLoading } = useQuery({
    queryKey: ['places', 'map', mapCenter.latitude, mapCenter.longitude],
    queryFn: async () => {
      return apiService.searchPlaces({
        latitude: mapCenter.latitude,
        longitude: mapCenter.longitude,
        maxDistanceKm: 50, // Wider radius for map
        page: 0,
        size: 100, // More places for map
        sort: 'distance',
      });
    },
    enabled: !mapMarkersResponse || (mapMarkersResponse?.markers?.length || 0) === 0,
  });

  // Fallback: Trending places if no nearby data
  const { data: trendingResponse } = useQuery({
    queryKey: ['trendingFallback', mapCenter.latitude, mapCenter.longitude],
    queryFn: async () => {
      try {
        return await apiService.getTrendingPlaces(mapCenter.latitude, mapCenter.longitude, 50);
      } catch (error) {
        return null;
      }
    },
    enabled: (!mapMarkersResponse || (mapMarkersResponse?.markers?.length || 0) === 0) &&
             (!placesResponse || (placesResponse?.content?.length || 0) === 0),
  });

  // Extract places from different sources
  const mapMarkers = mapMarkersResponse?.markers || [];
  const searchPlaces = placesResponse?.content || [];
  // Backend discovery endpoints return arrays directly
  const trendingPlaces = Array.isArray(trendingResponse) ? trendingResponse : trendingResponse?.places || [];

  // Convert map markers to places if needed
  const placesFromMarkers = mapMarkers.map((marker: any) => ({
    id: marker.id,
    name: marker.name,
    latitude: marker.latitude,
    longitude: marker.longitude,
    category: marker.category,
    averageRating: marker.averageRating,
    reviewCount: marker.reviewCount,
    address: marker.address || '',
    city: marker.city || 'Istanbul',
    district: marker.district || '',
    photos: marker.photos || [],
    distance: marker.distance,
    isTrending: marker.isTrending,
    visitCountLast7Days: marker.visitIntensity ? Math.round(marker.visitIntensity * 10) : undefined,
  }));

  // Priority: map markers > search places > trending places
  const places = placesFromMarkers.length > 0
    ? placesFromMarkers
    : searchPlaces.length > 0
    ? searchPlaces
    : trendingPlaces;

  const isLoading = markersLoading || placesLoading;

  useEffect(() => {
    if (!currentLocation) {
      fetchLocation();
    }
  }, []);

  const handleMarkerPress = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleViewDetails = () => {
    if (selectedPlace) {
      navigation.getParent()?.navigate('Explore', {
        screen: 'PlaceDetail',
        params: { placeId: selectedPlace.id },
      });
      setSelectedPlace(null);
    }
  };

  const handleMapRegionChange = (region: any) => {
    setMapRegion({
      north: region.latitude + region.latitudeDelta / 2,
      south: region.latitude - region.latitudeDelta / 2,
      east: region.longitude + region.longitudeDelta / 2,
      west: region.longitude - region.longitudeDelta / 2,
    });
  };

  const handleShowList = () => {
    navigation.getParent()?.navigate('Explore', {
      screen: 'NearbyPlaces',
    });
  };

  if (isLoading && !currentLocation) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <LoadingIndicator message="Getting your location..." />
      </SafeAreaView>
    );
  }

  if (!currentLocation) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Feather name="map-pin" size={72} color={colors.primary} />
          </View>
          <Text style={styles.errorTitle}>Location permission required</Text>
          <Text style={styles.errorSubtext}>
            We need your location to show places on the map.{'\n'}
            Your location is only used to find nearby places.
          </Text>
          <TouchableOpacity style={styles.button} onPress={fetchLocation} activeOpacity={0.8}>
            <Feather name="map-pin" size={18} color={colors.background} />
            <Text style={styles.buttonText}>Enable Location</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.getParent()?.navigate('Explore')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Browse without location</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Never show empty map - always show something
  const displayPlaces = places.length > 0 ? places : [];

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.mapContainer}>
        <CustomMapView
          places={displayPlaces}
          currentLocation={currentLocation || defaultLocation}
          onMarkerPress={handleMarkerPress}
          onRegionChange={handleMapRegionChange}
          mapRef={mapRef}
        />
      </View>

      {/* Place Preview Bottom Sheet */}
      <PlacePreviewBottomSheet
        place={selectedPlace}
        visible={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
        onViewDetails={handleViewDetails}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleShowList}
        activeOpacity={0.8}
      >
        <Feather name="list" size={20} color={colors.text} />
        <Text style={styles.floatingButtonText}>Show list</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
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
  errorTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 200,
  },
  buttonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  secondaryButtonText: {
    ...typography.buttonSmall,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadowLg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  emptyButton: {
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
  emptyButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '700',
  },
  floatingButton: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadowLg,
  },
  floatingButtonText: {
    ...typography.button,
    color: colors.text,
  },
});
