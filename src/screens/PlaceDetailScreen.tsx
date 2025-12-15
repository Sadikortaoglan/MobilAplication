import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
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
import ImageCarousel from '../components/ImageCarousel';
import MiniMapPreview from '../components/MiniMapPreview';
import { Review, Photo } from '../types';
import { colors, spacing, typography, borderRadius, shadowMd, shadowSm } from '../theme/designSystem';
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

  const { data: userReview, isLoading: userReviewLoading, refetch: refetchUserReview } = useQuery({
    queryKey: ['userReview', placeId, user?.id],
    queryFn: () => apiService.getUserReview(Number(placeId)),
    enabled: !!placeId && isAuthenticated && !!user?.id,
    retry: 1,
  });

  const { data: favoritesResponse } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiService.getFavorites(),
    enabled: isAuthenticated,
    retry: 1,
  });

  const { data: visitedResponse } = useQuery({
    queryKey: ['visited'],
    queryFn: () => apiService.getVisited(),
    enabled: isAuthenticated,
    retry: 1,
  });

  const reviews = reviewsResponse?.content || [];
  const favorites = Array.isArray(favoritesResponse) ? favoritesResponse : favoritesResponse?.content || [];
  const visited = Array.isArray(visitedResponse) ? visitedResponse : visitedResponse?.content || [];
  
  const numericPlaceId = Number(placeId);
  const isFavorited = favorites.some((fav: any) => {
    const favId = fav.id || fav.placeId || fav.place?.id;
    return Number(favId) === numericPlaceId;
  });
  const isVisited = visited.some((vis: any) => {
    const visId = vis.id || vis.placeId || vis.place?.id;
    return Number(visId) === numericPlaceId;
  });
  const hasUserReviewed = !!userReview;

  // Separate user review from other reviews
  const otherReviews = reviews.filter((review: Review) => review.user.id !== user?.id);

  useEffect(() => {
    if (placeId && user?.id) {
      refetchUserReview();
    }
  }, [placeId, user?.id, refetchUserReview]);

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
      const message = sanitizeErrorMessage(error);
      Alert.alert('Error', message);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => apiService.deleteReview(Number(placeId), reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', placeId] });
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      queryClient.invalidateQueries({ queryKey: ['userReview', placeId, user?.id] });
    },
    onError: (error: any) => {
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
    try {
      navigation.navigate('AddReview', { placeId: place.id });
    } catch (error) {
      Alert.alert('Error', 'Could not open review form. Please try again.');
    }
  };

  const handleEditReview = (review: Review) => {
    if (!isAuthenticated) {
      handleAuthRequired('edit your review');
      return;
    }
    try {
      navigation.navigate('AddReview', { 
        placeId: place.id,
        reviewId: review.id,
        initialRating: review.rating,
        initialComment: review.comment,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not open review editor. Please try again.');
    }
  };

  const handleDeleteReview = (review: Review) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete your review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteReviewMutation.mutate(review.id);
          },
        },
      ]
    );
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
      // Error handled in mutation
    }
  };

  const handleCall = () => {
    if (place.phone) {
      Linking.openURL(`tel:${place.phone}`);
    }
  };

  const handleWebsite = () => {
    if (place.website) {
      let url = place.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      Linking.openURL(url);
    }
  };

  const handleDirections = () => {
    const { latitude, longitude } = place;
    const url = Platform.select({
      ios: `maps://maps.apple.com/?daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to web maps
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
      });
    } else {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
    }
  };

  const getPriceLevelSymbols = (priceLevel?: string) => {
    if (!priceLevel) return '';
    const levels: { [key: string]: string } = {
      FREE: 'Free',
      LOW: '$',
      MEDIUM: '$$',
      HIGH: '$$$',
      VERY_HIGH: '$$$$',
    };
    return levels[priceLevel] || '';
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
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const photos = place.photos || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Hero Header - Image Carousel */}
      <View style={styles.heroContainer}>
        <ImageCarousel photos={photos} height={360} />
        <View style={styles.heroContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <View style={styles.backButtonInner}>
              <Feather name="arrow-left" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroName} numberOfLines={2}>
              {place.name}
            </Text>
            {place.averageRating !== undefined && (
              <View style={styles.heroRating}>
                <RatingStars rating={place.averageRating} size={18} />
                <Text style={styles.heroRatingText}>
                  {place.averageRating.toFixed(1)} · {place.reviewCount || 0} reviews
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Sticky Quick Action Bar */}
      <View style={styles.quickActionBar}>
        <TouchableOpacity
          style={[
            styles.quickActionButton,
            isFavorited && styles.quickActionButtonActive,
            favoriteMutation.isPending && styles.quickActionButtonDisabled,
          ]}
          onPress={handleFavorite}
          disabled={favoriteMutation.isPending}
          activeOpacity={0.7}
        >
          {favoriteMutation.isPending ? (
            <ActivityIndicator size="small" color={isFavorited ? colors.background : colors.error} />
          ) : (
            <>
              <Feather
                name="heart"
                size={18}
                color={isFavorited ? colors.background : colors.error}
                fill={isFavorited ? colors.background : 'transparent'}
              />
              <Text
                style={[
                  styles.quickActionText,
                  isFavorited && styles.quickActionTextActive,
                ]}
              >
                {isFavorited ? 'Favorited' : 'Favorite'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionButton,
            isVisited && styles.quickActionButtonActive,
            visitedMutation.isPending && styles.quickActionButtonDisabled,
          ]}
          onPress={handleVisited}
          disabled={visitedMutation.isPending}
          activeOpacity={0.7}
        >
          {visitedMutation.isPending ? (
            <ActivityIndicator size="small" color={isVisited ? colors.background : colors.success} />
          ) : (
            <>
              <Feather
                name="check-circle"
                size={18}
                color={isVisited ? colors.background : colors.success}
                fill={isVisited ? colors.background : 'transparent'}
              />
              <Text
                style={[
                  styles.quickActionText,
                  isVisited && styles.quickActionTextActive,
                ]}
              >
                {isVisited ? 'Visited' : 'Visited'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleAddReview}
          activeOpacity={0.7}
        >
          <Feather name="edit-3" size={18} color={colors.primary} />
          <Text style={styles.quickActionText}>Review</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Place Meta Info Card */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            {place.category && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{place.category.name}</Text>
              </View>
            )}
            {place.priceLevel && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getPriceLevelSymbols(place.priceLevel)}</Text>
              </View>
            )}
            {place.distance !== undefined && place.distance !== null && (
              <View style={styles.badge}>
                <Feather name="map-pin" size={12} color={colors.primary} />
                <Text style={styles.badgeText}>
                  {place.distance < 1
                    ? `${(place.distance * 1000).toFixed(0)}m away`
                    : `${place.distance.toFixed(1)}km away`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* About Section */}
        {place.description && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About this place</Text>
            <Text style={styles.descriptionText}>{place.description}</Text>
          </View>
        )}

        {/* Location Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Location</Text>
          <MiniMapPreview
            latitude={place.latitude}
            longitude={place.longitude}
            placeName={place.name}
            onPress={handleDirections}
          />
          <Text style={styles.addressText}>
            {place.address}, {place.district}, {place.city}
          </Text>
          <TouchableOpacity style={styles.directionsButton} onPress={handleDirections}>
            <Feather name="navigation" size={18} color={colors.background} />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Contact Actions */}
        {(place.phone || place.website) && (
          <View style={styles.sectionCard}>
            <View style={styles.contactActions}>
              {place.phone && (
                <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                  <View style={styles.contactIcon}>
                    <Feather name="phone" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.contactLabel}>Call</Text>
                </TouchableOpacity>
              )}
              {place.website && (
                <TouchableOpacity style={styles.contactButton} onPress={handleWebsite}>
                  <View style={styles.contactIcon}>
                    <Feather name="globe" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.contactLabel}>Website</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.contactButton} onPress={handleDirections}>
                <View style={styles.contactIcon}>
                  <Feather name="navigation" size={20} color={colors.primary} />
                </View>
                <Text style={styles.contactLabel}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.sectionCard}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.length > 0 && (
              <Text style={styles.reviewCount}>({reviews.length})</Text>
            )}
          </View>

          {/* User's Review First */}
          {hasUserReviewed && userReview ? (
            <View style={styles.userReviewCard}>
              <View style={styles.userReviewHeader}>
                <View style={styles.userReviewHeaderLeft}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {userReview.user.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userReviewName}>Your Review</Text>
                    <View style={styles.userReviewMeta}>
                      <RatingStars rating={userReview.rating} size={14} />
                      <Text style={styles.userReviewDate}>
                        {new Date(userReview.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.userReviewActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditReview(userReview)}
                  >
                    <Feather name="edit-2" size={14} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteReview(userReview)}
                  >
                    <Feather name="trash-2" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.userReviewComment}>{userReview.comment}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.addReviewCard} onPress={handleAddReview}>
              <Feather name="edit-3" size={24} color={colors.primary} />
              <Text style={styles.addReviewCardText}>Share your experience</Text>
              <Text style={styles.addReviewCardSubtext}>
                Help others discover this place
              </Text>
            </TouchableOpacity>
          )}

          {/* Other Reviews */}
          {otherReviews.length > 0 ? (
            <FlatList
              data={otherReviews}
              keyExtractor={(item: Review) => item.id.toString()}
              renderItem={({ item }) => <ReviewCard review={item} />}
              scrollEnabled={false}
            />
          ) : !hasUserReviewed ? (
            <View style={styles.emptyReviews}>
              <Feather name="message-circle" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyReviewsText}>No reviews yet</Text>
              <Text style={styles.emptyReviewsSubtext}>
                Be the first to review this place
              </Text>
            </View>
          ) : null}
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
  heroContainer: {
    position: 'relative',
    width: '100%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 10,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowSm,
  },
  heroTextContainer: {
    marginTop: spacing.xl,
  },
  heroName: {
    ...typography.h1,
    color: colors.background,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroRatingText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickActionBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
    ...shadowSm,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  quickActionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickActionButtonDisabled: {
    opacity: 0.6,
  },
  quickActionText: {
    ...typography.buttonSmall,
    color: colors.text,
    fontWeight: '600',
  },
  quickActionTextActive: {
    color: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  metaCard: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  badgeText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  descriptionText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  addressText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  directionsButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  contactButton: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  contactLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  reviewCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userReviewCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadowSm,
  },
  userReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  userReviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    ...typography.h3,
    color: colors.background,
    fontWeight: '700',
  },
  userReviewName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userReviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userReviewDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  userReviewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    padding: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  userReviewComment: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  addReviewCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  addReviewCardText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  addReviewCardSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyReviews: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyReviewsText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyReviewsSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
});
