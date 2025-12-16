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
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useLocationStore } from '../store/locationStore';
import { usePlacesStore } from '../store/placesStore';
import { Feather } from '@expo/vector-icons';
import PlaceCard from '../components/PlaceCard';
import CustomMapView from '../components/MapView';
import LoadingIndicator from '../components/LoadingIndicator';
import { Place } from '../types';
import { MainTabParamList } from '../navigation/types';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

type NearbyScreenRouteProp = RouteProp<MainTabParamList, 'Nearby'>;

export default function NearbyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<NearbyScreenRouteProp>();
  const { currentLocation, fetchLocation } = useLocationStore();
  const { selectedCategory, selectedSubcategory, setPlaces } = usePlacesStore();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const categoryId = route.params?.categoryId || selectedCategory?.id;

  const { data: placesResponse, isLoading, refetch } = useQuery({
    queryKey: ['places', currentLocation?.latitude, currentLocation?.longitude, categoryId, selectedSubcategory],
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
        maxDistanceKm: 10,
        page: 0,
        size: 20,
        sort: 'distance',
      });
      setPlaces(response.content || []);
      return response;
    },
    enabled: !!currentLocation,
  });

  const places = placesResponse?.content || [];

  useEffect(() => {
    if (!currentLocation) {
      fetchLocation();
    }
  }, []);

  const handlePlacePress = (place: Place) => {
    navigation.navigate('PlaceDetail', { placeId: place.id });
  };

  const handleMarkerPress = (place: Place) => {
    navigation.navigate('PlaceDetail', { placeId: place.id });
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
          <Text style={styles.errorText}>Location permission required</Text>
          <Text style={styles.errorSubtext}>
            We need your location to find nearby places
          </Text>
          <TouchableOpacity style={styles.button} onPress={fetchLocation}>
            <Text style={styles.buttonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={places || []}
          keyExtractor={(item: Place) => item.id.toString()}
          renderItem={({ item }: { item: Place }) => (
            <PlaceCard place={item} onPress={() => handlePlacePress(item)} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Feather name="map" size={64} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No places found nearby</Text>
              <Text style={styles.emptySubtext}>
                {categoryId
                  ? `We couldn't find any places in this category within 10km.`
                  : `We couldn't find any places within 10km.`}
              </Text>
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => navigation.navigate('ExploreHome')}
                activeOpacity={0.8}
              >
                <Feather name="compass" size={18} color={colors.background} />
                <Text style={styles.emptyActionButtonText}>Browse All Places</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <CustomMapView
          places={places || []}
          currentLocation={currentLocation}
          onMarkerPress={handleMarkerPress}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  list: {
    paddingVertical: 8,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyActionButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

