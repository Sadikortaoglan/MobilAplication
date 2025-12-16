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

  const initialRegion: Region = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 41.0082,
        longitude: 28.9784,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  const handleRegionChangeComplete = (region: Region) => {
    setCurrentRegion(region);
    onRegionChange?.(region);
  };

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
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
        
        {/* User location marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            pinColor="#007AFF"
            identifier="user-location"
          />
        )}
        
        {/* Place markers with activity-based colors and sizes */}
        {places.map((place) => {
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

          return (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              description={description}
              onPress={() => onMarkerPress(place)}
              pinColor={pinColor}
              anchor={{ x: 0.5, y: 1 }}
            />
          );
        })}
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
