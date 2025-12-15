import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import LoadingIndicator from '../components/LoadingIndicator';
import { Review, Photo } from '../types';
import { colors, spacing, typography, borderRadius, shadowMd } from '../theme/designSystem';
import { sanitizeErrorMessage } from '../utils/errorHandler';

export default function PlaceDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const placeId = route.params?.placeId;
  const { isAuthenticated, showAuthModal, user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: place, isLoading: placeLoading, error: placeError } = useQuery({
    queryKey: ['place', placeId],
    queryFn: () => apiService.getPlaceById(Number(placeId)),
    enabled: !!placeId,
    retry: 2,
  });

  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', placeId],
    queryFn: () => apiService.getPlaceReviews(Number(placeId)),
    enabled: !!placeId,
    retry: 2,
  });

  // Check if user has already reviewed this place - ALWAYS check from backend
  const { data: userReview, isLoading: userReviewLoading, refetch: refetchUserReview } = useQuery({
    queryKey: ['userReview', placeId, user?.id],
    queryFn: () => apiService.getUserReview(Number(placeId)),
    enabled: !!placeId && isAuthenticated && !!user?.id,
    retry: 1,
    // Refetch when placeId or user changes
  });

  // Check if place is favorited
  const { data: favoritesResponse } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiService.getFavorites(),
    enabled: isAuthenticated,
    retry: 1,
  });

  // Check if place is visited
  const { data: visitedResponse } = useQuery({
    queryKey: ['visited'],
    queryFn: () => apiService.getVisited(),
    enabled: isAuthenticated,
    retry: 1,
  });

  const reviews = reviewsResponse?.content || [];
  
  // Handle both array and paginated response formats
  const favorites = Array.isArray(favoritesResponse)
    ? favoritesResponse
    : favoritesResponse?.content || [];
  const visited = Array.isArray(visitedResponse)
    ? visitedResponse
    : visitedResponse?.content || [];
  
  const numericPlaceId = Number(placeId);

  const isFavorited = favorites.some((fav: any) => {
    const favId = fav.id || fav.placeId || fav.place?.id;
    return Number(favId) === numericPlaceId;
  });
  const isVisited = visited.some((vis: any) => {
    const visId = vis.id || vis.placeId || vis.place?.id;
    return Number(visId) === numericPlaceId;
  });
  
  // Review eligibility - ONLY based on backend response
  const hasUserReviewed = !!userReview;

  // Reset review state when placeId or user changes
  useEffect(() => {
    if (placeId && user?.id) {
      refetchUserReview();
    }
  }, [placeId, user?.id, refetchUserReview]);

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        return apiService.removeFavorite(Number(placeId));
      } else {
        return apiService.toggleFavorite(Number(placeId));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', sanitizeErrorMessage(error));
    },
  });

  // Visited mutation - with proper error handling
  const visitedMutation = useMutation({
    mutationFn: async () => {
      if (isVisited) {
        return apiService.removeVisited(Number(placeId));
      } else {
        return apiService.toggleVisited(Number(placeId));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visited'] });
    },
    onError: (error: any) => {
      // 409: zaten ziyaret edilmiş - kullanıcıya nazik mesaj göster
      const status = error.response?.status;
      if (status === 409) {
        Alert.alert('Already marked', 'You have already marked this place as visited.');
        return;
      }

      // Diğer hatalar için sanitize edilmiş mesaj
      const message = sanitizeErrorMessage(error);
      Alert.alert('Error', message);
    },
  });

  const handleAuthRequired = (action: string) => {
    Alert.alert(
      'Sign In Required',
      `Please sign in to ${action}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => showAuthModal() },
      ]
    );
  };

  const handleAddReview = () => {
    if (!isAuthenticated) {
      handleAuthRequired('add a review');
      return;
    }

    // Always allow navigation - let AddReviewScreen check backend
    // This makes the flow feel welcoming, not restrictive
    try {
      navigation.navigate('AddReview', { placeId: place.id });
    } catch (error) {
      Alert.alert('Error', 'Could not open review form. Please try again.');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      handleAuthRequired('favorite this place');
      return;
    }

    if (favoriteMutation.isPending) return;

    try {
      await favoriteMutation.mutateAsync();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleVisited = async () => {
    if (!isAuthenticated) {
      handleAuthRequired('mark this place as visited');
      return;
    }

    if (visitedMutation.isPending) return;

    try {
      await visitedMutation.mutateAsync();
    } catch (error) {
      // Error handled in mutation - sanitized
    }
  };

  if (placeLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingIndicator message="Loading place details..." />
      </SafeAreaView>
    );
  }

  if (placeError || !place) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>Could not load place</Text>
          <Text style={styles.errorSubtext}>
            {placeError ? 'An error occurred. Please try again.' : 'Place not found.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const photos = place.photos || [];
  const coverPhoto = photos.find((photo: Photo) => photo.isCover) || photos[0];
  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Carousel */}
        {photos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.photoCarousel}
            contentContainerStyle={styles.photoCarouselContent}
          >
            {photos.map((photo: Photo, index: number) => (
              <Image
                key={photo.id || index}
                source={{ uri: photo.url }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : coverPhoto ? (
          <Image
            source={{ uri: coverPhoto.url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.content}>
          <Text style={styles.name}>{place.name}</Text>

          {place.averageRating !== undefined && (
            <View style={styles.ratingContainer}>
              <RatingStars rating={place.averageRating} size={20} />
              <Text style={styles.ratingText}>
                {place.averageRating.toFixed(1)} ({place.reviewCount || 0} reviews)
              </Text>
            </View>
          )}

          <Text style={styles.address} numberOfLines={3}>
            {place.address}, {place.district}, {place.city}
          </Text>

          {place.description && (
            <Text style={styles.description}>{place.description}</Text>
          )}

          {/* Action Buttons - Improved Visual Hierarchy */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isFavorited && styles.actionButtonActive,
                favoriteMutation.isPending && styles.actionButtonDisabled,
              ]}
              onPress={handleFavorite}
              disabled={favoriteMutation.isPending}
              activeOpacity={0.7}
            >
              {favoriteMutation.isPending ? (
                <ActivityIndicator size="small" color={isFavorited ? colors.background : colors.primary} />
              ) : (
                <>
                  <Feather
                    name={isFavorited ? 'heart' : 'heart'}
                    size={20}
                    color={isFavorited ? colors.background : colors.favorite}
                    fill={isFavorited ? colors.background : 'transparent'}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      isFavorited && styles.actionButtonTextActive,
                    ]}
                  >
                    {isFavorited ? 'Favorited' : 'Favorite'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                isVisited && styles.actionButtonActive,
                visitedMutation.isPending && styles.actionButtonDisabled,
              ]}
              onPress={handleVisited}
              disabled={visitedMutation.isPending}
              activeOpacity={0.7}
            >
              {visitedMutation.isPending ? (
                <ActivityIndicator size="small" color={isVisited ? colors.background : colors.primary} />
              ) : (
                <>
                  <Feather
                    name={isVisited ? 'check-circle' : 'circle'}
                    size={20}
                    color={isVisited ? colors.background : colors.visited}
                    fill={isVisited ? colors.background : 'transparent'}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      isVisited && styles.actionButtonTextActive,
                    ]}
                  >
                    {isVisited ? 'Visited' : "I've been here"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Review Action - Always Welcoming */}
          <View style={styles.reviewActionContainer}>
            {hasUserReviewed ? (
              <View style={styles.reviewedBadge}>
                <Feather name="check-circle" size={20} color={colors.success} />
                <Text style={styles.reviewedBadgeText}>
                  You've reviewed this place
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addReviewButton}
                onPress={handleAddReview}
                activeOpacity={0.8}
              >
                <Feather name="edit-3" size={20} color={colors.background} />
                <Text style={styles.addReviewButtonText}>
                  {isAuthenticated ? 'Write a Review' : 'Sign In to Review'}
                </Text>
                <Feather name="chevron-right" size={18} color={colors.background} />
              </TouchableOpacity>
            )}
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviewsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : reviews.length > 0 ? (
              <FlatList
                data={reviews}
                keyExtractor={(item: Review) => item.id.toString()}
                renderItem={({ item }) => <ReviewCard review={item} />}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.noReviewsContainer}>
                <Feather name="message-circle" size={32} color={colors.textTertiary} />
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.noReviewsSubtext}>
                  Be the first to review this place
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
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
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.background,
  },
  image: {
    width: '100%',
    height: 320,
    backgroundColor: colors.backgroundSecondary,
  },
  photoCarousel: {
    width: '100%',
    height: 320,
  },
  photoCarouselContent: {
    alignItems: 'center',
  },
  carouselImage: {
    width: Dimensions.get('window').width,
    height: 320,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    padding: spacing.lg,
  },
  name: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '700',
    fontSize: 28,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ratingText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  address: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  description: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
    minHeight: 52,
  },
  actionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  reviewActionContainer: {
    marginBottom: spacing.xl,
  },
  addReviewButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadowMd,
    minHeight: 56,
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.success,
    gap: spacing.sm,
  },
  reviewedBadgeText: {
    ...typography.button,
    color: colors.success,
    fontWeight: '600',
  },
  addReviewButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '700',
    fontSize: 17,
    flex: 1,
    textAlign: 'center',
  },
  reviewsSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noReviewsContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  noReviewsText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  noReviewsSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
