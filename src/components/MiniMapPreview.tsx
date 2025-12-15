import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../theme/designSystem';

interface MiniMapPreviewProps {
  latitude: number;
  longitude: number;
  placeName?: string;
  onPress?: () => void;
  height?: number;
}

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function MiniMapPreview({
  latitude,
  longitude,
  placeName,
  onPress,
  height = 200,
}: MiniMapPreviewProps) {
  const region: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <TouchableOpacity
      style={[styles.container, { height }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <MapView
        style={styles.map}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        mapType={Platform.OS === 'ios' ? 'standard' : 'none'}
      >
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
          flipY={false}
        />
        <Marker
          coordinate={{ latitude, longitude }}
          title={placeName}
          pinColor={colors.primary}
        />
      </MapView>
      <View style={styles.overlay}>
        <View style={styles.directionsButton}>
          <Feather name="navigation" size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  directionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

