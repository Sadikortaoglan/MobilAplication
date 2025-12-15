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
          <Feather name="map-pin" size={64} color={colors.textTertiary} />
          <Text style={styles.errorTitle}>Location permission required</Text>
          <Text style={styles.errorSubtext}>
            We need your location to show places on the map
          </Text>
          <TouchableOpacity style={styles.button} onPress={fetchLocation}>
            <Text style={styles.buttonText}>Enable Location</Text>
          </TouchableOpacity>
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
  errorTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    ...typography.button,
    color: colors.background,
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
