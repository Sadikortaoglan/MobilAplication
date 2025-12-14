import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import LoadingIndicator from '../components/LoadingIndicator';
import { Review, Photo } from '../types';
import { RootStackParamList } from '../navigation/types';

type PlaceDetailScreenRouteProp = RouteProp<RootStackParamList, 'PlaceDetail'>;

export default function PlaceDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<PlaceDetailScreenRouteProp>();
  const placeId = route.params?.placeId;
  const { isAuthenticated } = useAuthStore();

  const { data: place, isLoading: placeLoading } = useQuery({
    queryKey: ['place', placeId],
    queryFn: () => apiService.getPlaceById(Number(placeId)),
    enabled: !!placeId,
  });

  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', placeId],
    queryFn: () => apiService.getPlaceReviews(Number(placeId)),
    enabled: !!placeId,
  });

  const reviews = reviewsResponse?.content || [];

  if (placeLoading) {
    return <LoadingIndicator message="Loading place details..." />;
  }

  if (!place) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Place not found</Text>
      </View>
    );
  }

  const coverPhoto = place.photos?.find((photo: Photo) => photo.isCover) || place.photos?.[0];

  return (
    <ScrollView style={styles.container}>
      {coverPhoto && (
        <Image source={{ uri: coverPhoto.url }} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        {place.averageRating !== undefined && (
          <View style={styles.ratingContainer}>
            <RatingStars rating={place.averageRating} size={24} />
            <Text style={styles.ratingText}>
              {place.averageRating.toFixed(1)} ({place.reviewCount || 0} reviews)
            </Text>
          </View>
        )}
        <Text style={styles.address}>
          {place.address}, {place.district}, {place.city}
        </Text>
        {place.description && (
          <Text style={styles.description}>{place.description}</Text>
        )}

        {isAuthenticated && (
          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => navigation.navigate('AddReview', { placeId: place.id })}
          >
            <Text style={styles.addReviewButtonText}>Add Review</Text>
          </TouchableOpacity>
        )}

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviewsLoading ? (
            <LoadingIndicator message="Loading reviews..." />
          ) : reviews.length > 0 ? (
            <FlatList
              data={reviews}
              keyExtractor={(item: Review) => item.id.toString()}
              renderItem={({ item }) => <ReviewCard review={item} />}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#E5E5E5',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  addReviewButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  addReviewButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 32,
  },
});

