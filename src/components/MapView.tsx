import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { Place, Location } from '../types';

interface CustomMapViewProps {
  places: Place[];
  currentLocation: Location | null;
  onMarkerPress: (place: Place) => void;
}

// OpenStreetMap tile server URL
const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function CustomMapView({
  places,
  currentLocation,
  onMarkerPress,
}: CustomMapViewProps) {
  const initialRegion = currentLocation
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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        } : undefined}
        showsUserLocation={!!currentLocation}
        showsMyLocationButton={Platform.OS === 'android'}
        mapType={Platform.OS === 'ios' ? 'standard' : 'none'}
        showsCompass={true}
        showsScale={false}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
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
        
        {/* Place markers with activity-based colors */}
        {places.map((place) => {
          // Determine marker color based on activity
          let pinColor = '#FF3B30'; // Default red
          if (place.averageRating && place.averageRating >= 4.5) {
            pinColor = '#34C759'; // Green for highly rated
          } else if (place.reviewCount && place.reviewCount > 10) {
            pinColor = '#FF9500'; // Orange for popular
          } else if (place.averageRating && place.averageRating >= 4.0) {
            pinColor = '#007AFF'; // Blue for good
          }

          return (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              description={place.address}
              onPress={() => onMarkerPress(place)}
              pinColor={pinColor}
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
