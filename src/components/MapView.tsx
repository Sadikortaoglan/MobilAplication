import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';
import { Place, Location } from '../types';

interface CustomMapViewProps {
  places: Place[];
  currentLocation: Location | null;
  onMarkerPress: (place: Place) => void;
  onRegionChange?: (region: Region) => void;
  mapRef?: React.RefObject<MapView>;
}

// OpenStreetMap tile server URL
const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function CustomMapView({
  places,
  currentLocation,
  onMarkerPress,
  onRegionChange,
  mapRef: externalMapRef,
}: CustomMapViewProps) {
  const internalMapRef = useRef<MapView>(null);
  const mapRef = externalMapRef || internalMapRef;
  const [currentRegion, setCurrentRegion] = React.useState<Region | null>(null);

  // HARD LOGGING: Track component lifecycle and data
  React.useEffect(() => {
    if (__DEV__) {
      console.log('[MapView] Component mounted/updated:', {
        placesCount: places?.length || 0,
        hasCurrentLocation: !!currentLocation,
        currentLocationCoords: currentLocation ? {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        } : null,
      });
    }
  }, [places?.length, currentLocation]);

  // CRITICAL: Validate and ensure initialRegion always has valid numeric values
  const initialRegion: Region = React.useMemo(() => {
    if (currentLocation && 
        typeof currentLocation.latitude === 'number' && 
        typeof currentLocation.longitude === 'number' &&
        !isNaN(currentLocation.latitude) &&
        !isNaN(currentLocation.longitude)) {
      return {
        latitude: Number(currentLocation.latitude),
        longitude: Number(currentLocation.longitude),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    // Fallback to Istanbul with validated numbers
    return {
      latitude: 41.0082,
      longitude: 28.9784,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [currentLocation]);

  const handleRegionChangeComplete = (region: Region) => {
    setCurrentRegion(region);
    onRegionChange?.(region);
  };

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      // CRITICAL: Validate coordinates before passing to native
      const lat = Number(currentLocation.latitude);
      const lng = Number(currentLocation.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        if (__DEV__) {
          console.warn('MapView: Invalid currentLocation coordinates:', currentLocation);
        }
        return;
      }
      
      try {
        mapRef.current.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 500);
      } catch (error) {
        if (__DEV__) {
          console.warn('MapView: animateToRegion error:', error);
        }
      }
    }
  }, [currentLocation]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={!!currentLocation}
        showsMyLocationButton={Platform.OS === 'android'}
        mapType={Platform.OS === 'ios' ? 'standard' : 'none'}
        showsCompass={true}
        showsScale={false}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
          flipY={false}
        />
        
        {/* User location marker - with validation */}
        {currentLocation && 
         typeof currentLocation.latitude === 'number' && 
         typeof currentLocation.longitude === 'number' &&
         !isNaN(currentLocation.latitude) &&
         !isNaN(currentLocation.longitude) && (
          <Marker
            coordinate={{
              latitude: Number(currentLocation.latitude),
              longitude: Number(currentLocation.longitude),
            }}
            title="Your Location"
            pinColor="#007AFF"
            identifier="user-location"
          />
        )}
        
        {/* Place markers with activity-based colors and sizes */}
        {React.useMemo(() => {
          const validPlaces = places.filter((place) => {
            // CRITICAL VALIDATION: Filter out invalid places BEFORE mapping
            if (!place || !place.id) {
              if (__DEV__) {
                console.warn('[MapView] Skipping place without id:', place);
              }
              return false;
            }
            
            // CRITICAL: Ensure latitude and longitude are valid numbers
            const lat = Number(place.latitude);
            const lng = Number(place.longitude);
            
            if (isNaN(lat) || isNaN(lng)) {
              if (__DEV__) {
                console.warn('[MapView] Skipping place with invalid coordinates:', {
                  id: place.id,
                  latitude: place.latitude,
                  longitude: place.longitude,
                });
              }
              return false;
            }
            
            // Validate coordinate ranges
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
              if (__DEV__) {
                console.warn('[MapView] Skipping place with out-of-range coordinates:', {
                  id: place.id,
                  latitude: lat,
                  longitude: lng,
                });
              }
              return false;
            }
            
            return true;
          });
          
          if (__DEV__) {
            console.log('[MapView] Valid places count:', validPlaces.length, 'out of', places.length);
          }
          
          return validPlaces.map((place) => {
            // SAFE: At this point, place is guaranteed to have valid coordinates
            const lat = Number(place.latitude);
            const lng = Number(place.longitude);

            // Determine marker color and size based on activity
            let pinColor = '#FF3B30'; // Default red
            let markerSize = 1.0; // Default size

            // Activity-based coloring
            if (place.isTrending || (place.visitCountLast7Days && place.visitCountLast7Days > 10)) {
              pinColor = '#FF3B30'; // Red for trending/high activity
              markerSize = 1.2; // Larger for trending
            } else if (place.averageRating && place.averageRating >= 4.5) {
              pinColor = '#34C759'; // Green for highly rated
              markerSize = 1.1;
            } else if (place.reviewCount && place.reviewCount > 10) {
              pinColor = '#FF9500'; // Orange for popular
              markerSize = 1.1;
            } else if (place.averageRating && place.averageRating >= 4.0) {
              pinColor = '#007AFF'; // Blue for good
            }

            // Build description with activity info
            let description = place.address || '';
            if (place.visitCountLast7Days && place.visitCountLast7Days > 0) {
              description += ` • ${place.visitCountLast7Days} visits this week`;
            }
            if (place.isTrending) {
              description += ' • Trending';
            }

            // CRITICAL: Use validated numeric coordinates
            return (
              <Marker
                key={String(place.id)}
                coordinate={{
                  latitude: lat,
                  longitude: lng,
                }}
                title={place.name || 'Place'}
                description={description || ''}
                onPress={() => onMarkerPress(place)}
                pinColor={pinColor}
              anchor={{ x: 0.5, y: 1 }}
            />
          );
          });
        }, [places, onMarkerPress])}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});