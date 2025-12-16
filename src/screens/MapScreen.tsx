import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useLocationStore } from '../store/locationStore';
import CustomMapView from '../components/MapView';
import LoadingIndicator from '../components/LoadingIndicator';
import { Place } from '../types';
import { colors, spacing, typography, borderRadius, shadowLg } from '../theme/designSystem';

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const { currentLocation, fetchLocation } = useLocationStore();
  const [showList, setShowList] = useState(false);

  const { data: placesResponse, isLoading } = useQuery({
    queryKey: ['places', 'map', currentLocation?.latitude, currentLocation?.longitude],
    queryFn: async () => {
      if (!currentLocation) {
        await fetchLocation();
        return null;
      }
      return apiService.searchPlaces({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        maxDistanceKm: 10,
        page: 0,
        size: 50,
        sort: 'distance',
      });
    },
    enabled: !!currentLocation,
  });

  const places = placesResponse?.content || [];

  useEffect(() => {
    if (!currentLocation) {
      fetchLocation();
    }
  }, []);

  const handleMarkerPress = (place: Place) => {
    // Navigate to Explore stack for PlaceDetail
    navigation.getParent()?.navigate('Explore', {
      screen: 'PlaceDetail',
      params: { placeId: place.id },
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

  if (places.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.mapContainer}>
          <CustomMapView
            places={[]}
            currentLocation={currentLocation}
            onMarkerPress={() => {}}
          />
        </View>
        <View style={styles.emptyOverlay}>
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              <Feather name="map" size={64} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No places found nearby</Text>
            <Text style={styles.emptySubtext}>
              Try expanding your search or browse popular places
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.getParent()?.navigate('Explore')}
              activeOpacity={0.8}
            >
              <Feather name="compass" size={18} color={colors.background} />
              <Text style={styles.emptyButtonText}>Browse All Places</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.mapContainer}>
        <CustomMapView
          places={places}
          currentLocation={currentLocation}
          onMarkerPress={handleMarkerPress}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleShowList}
        activeOpacity={0.8}
      >
        <Feather name="list" size={20} color={colors.background} />
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
    ...shadowMd,
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
    ...shadowMd,
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
