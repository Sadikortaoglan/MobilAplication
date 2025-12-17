import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useLocationStore } from '../store/locationStore';
import LoadingIndicator from '../components/LoadingIndicator';
import { colors } from '../theme/designSystem';
import { Place } from '../types';

// STEP 3: STRICT COORDINATE VALIDATION
// Helper: Validate coordinates - MANDATORY before passing to native
const isValidCoord = (lat: any, lng: any): boolean => {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(latNum) &&
    !isNaN(lngNum) &&
    isFinite(latNum) &&
    isFinite(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
};

// Safe initial region (Istanbul) - NUMBERS ONLY
const SAFE_INITIAL_REGION: Region = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MapScreen() {
  // STEP 1: ✅ Re-enabled MapScreen
  // STEP 2: ✅ Minimal implementation - CONFIRMED WORKING
  // STEP 3: Adding API markers with STRICT validation
  
  const { currentLocation } = useLocationStore();
  const mapCenter = currentLocation || { latitude: 41.0082, longitude: 28.9784 };

  // Fetch places from API
  const { data: placesResponse, isLoading } = useQuery({
    queryKey: ['places', 'map', mapCenter.latitude, mapCenter.longitude],
    queryFn: async () => {
      return apiService.searchPlaces({
        latitude: mapCenter.latitude,
        longitude: mapCenter.longitude,
        maxDistanceKm: 50,
        page: 0,
        size: 100,
        sort: 'distance',
      });
    },
    retry: 1,
  });

  // STEP 3: STRICT VALIDATION - Filter invalid places BEFORE rendering
  const validPlaces = useMemo(() => {
    const places = placesResponse?.content || [];
    
    return places.filter((place: Place) => {
      // CRITICAL: Must have id
      if (!place || !place.id) {
        if (__DEV__) {
          console.warn('[MapScreen] Skipping place without id:', place);
        }
        return false;
      }

      // CRITICAL: Validate coordinates
      if (!isValidCoord(place.latitude, place.longitude)) {
        if (__DEV__) {
          console.warn('[MapScreen] Skipping place with invalid coordinates:', {
            id: place.id,
            latitude: place.latitude,
            longitude: place.longitude,
          });
        }
        return false;
      }

      return true;
    }).map((place: Place) => ({
      ...place,
      // CRITICAL: Ensure coordinates are numbers
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
    }));
  }, [placesResponse]);

  // Calculate safe initial region
  const initialRegion: Region = useMemo(() => {
    if (currentLocation && isValidCoord(currentLocation.latitude, currentLocation.longitude)) {
      return {
        latitude: Number(currentLocation.latitude),
        longitude: Number(currentLocation.longitude),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return SAFE_INITIAL_REGION;
  }, [currentLocation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <LoadingIndicator message="Loading map..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={!!currentLocation && isValidCoord(currentLocation.latitude, currentLocation.longitude)}
          showsMyLocationButton={false}
          mapType="standard"
          showsCompass={true}
          showsScale={false}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
        >
          {/* API markers - STRICTLY VALIDATED */}
          {validPlaces.map((place: Place) => {
            // SAFE: Already validated in useMemo
            return (
              <Marker
                key={String(place.id)}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.name || 'Place'}
                description={place.address || ''}
                pinColor="#FF3B30"
              />
            );
          })}
        </MapView>
      </View>
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
  map: {
    width: '100%',
    height: '100%',
  },
});
