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
    if (isPending) {
      Alert.alert(
        'Place Pending Review',
        'This place is currently under review. Reviews and favorites will be available once it\'s approved.',
        [{ text: 'OK' }]
      );
      return;
    }
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
    if (isPending) {
      Alert.alert(
        'Place Pending Review',
        'This place is currently under review. Reviews and favorites will be available once it\'s approved.',
        [{ text: 'OK' }]
      );
      return;
    }
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
    if (isPending) {
      Alert.alert(
        'Place Pending Review',
        'This place is currently under review. Reviews and favorites will be available once it\'s approved.',
        [{ text: 'OK' }]
      );
      return;
    }
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
      <View style={styles.container}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <LoadingIndicator message="Loading place details..." />
        </SafeAreaView>
      </View>
    );
  }

  if (placeError || !place) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  const photos = place.photos || [];
  const isPending = place.status === 'PENDING';
  const isRejected = place.status === 'REJECTED';
  const isApproved = place.status === 'APPROVED' || !place.status; // Default to approved if no status

  const getStatusBadge = () => {
    if (isPending) {
      return (
        <View style={styles.statusBadge}>
          <Feather name="clock" size={14} color={colors.warning} />
          <Text style={styles.statusBadgeText}>Pending Review</Text>
        </View>
      );
    }
    if (isRejected) {
      return (
        <View style={[styles.statusBadge, styles.statusBadgeRejected]}>
          <Feather name="x-circle" size={14} color={colors.error} />
          <Text style={[styles.statusBadgeText, styles.statusBadgeTextRejected]}>
            Rejected
          </Text>
        </View>
      );
    }
    return null;
  };

  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const HERO_HEIGHT = 320;

  return (
    <View style={styles.container}>
      {/* Hero Image - Fixed Top */}
      <View style={[styles.heroContainer, { height: HERO_HEIGHT }]}>
        <ImageCarousel photos={photos} height={HERO_HEIGHT} />
        <View style={styles.heroOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <View style={styles.backButtonInner}>
              <Feather name="arrow-left" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>
          {place.averageRating !== undefined && (
            <View style={styles.heroRatingBadge}>
              <RatingStars rating={place.averageRating} size={16} />
              <Text style={styles.heroRatingText}>
                {place.averageRating.toFixed(1)} · {place.reviewCount || 0}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Scrollable Bottom Sheet */}
      <View style={[styles.bottomSheet, { top: HERO_HEIGHT - 20 }]}>
        {/* Sheet Handle */}
        <View style={styles.sheetHandle} />

        <ScrollView
          style={styles.sheetScrollView}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Place Name & Status */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle} numberOfLines={2}>
                {place.name}
              </Text>
              {getStatusBadge()}
            </View>
          </View>

          {/* Status Message for Rejected */}
          {isRejected && place.rejectionReason && (
            <View style={styles.rejectionCard}>
              <Feather name="alert-circle" size={18} color={colors.error} />
              <View style={styles.rejectionText}>
                <Text style={styles.rejectionTitle}>This place was rejected</Text>
                <Text style={styles.rejectionReason}>{place.rejectionReason}</Text>
              </View>
            </View>
          )}

          {/* Primary Actions Row */}
          <View style={styles.primaryActions}>
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
              style={[
                styles.quickActionButton,
                isPending && styles.quickActionButtonDisabled,
              ]}
              onPress={handleAddReview}
              activeOpacity={0.7}
              disabled={isPending}
            >
              <Feather 
                name="edit-3" 
                size={18} 
                color={isPending ? colors.textTertiary : colors.primary} 
              />
              <Text style={[
                styles.quickActionText,
                isPending && styles.quickActionTextDisabled,
              ]}>
                Review
              </Text>
            </TouchableOpacity>
          </View>

            {/* Category & Price Badges */}
            <View style={styles.badgesRow}>
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
                      ? `${(place.distance * 1000).toFixed(0)}m`
                      : `${place.distance.toFixed(1)}km`}
                  </Text>
                </View>
              )}
            </View>

            {/* About Section */}
            {place.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.descriptionText} numberOfLines={4}>
                  {place.description}
                </Text>
              </View>
            )}

            {/* Location Section */}
            <View style={styles.section}>
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
              <View style={styles.contactActions}>
                {place.phone && (
                  <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                    <Feather name="phone" size={20} color={colors.primary} />
                    <Text style={styles.contactLabel}>Call</Text>
                  </TouchableOpacity>
                )}
                {place.website && (
                  <TouchableOpacity style={styles.contactButton} onPress={handleWebsite}>
                    <Feather name="globe" size={20} color={colors.primary} />
                    <Text style={styles.contactLabel}>Website</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.contactButton} onPress={handleDirections}>
                  <Feather name="navigation" size={20} color={colors.primary} />
                  <Text style={styles.contactLabel}>Directions</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Reviews Section */}
            <View style={styles.section}>
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
              <View style={styles.emptyReviewsIcon}>
                <Feather name="message-circle" size={40} color={colors.textTertiary} />
              </View>
              <Text style={styles.emptyReviewsText}>No reviews yet</Text>
              <Text style={styles.emptyReviewsSubtext}>
                Be the first to share your experience
              </Text>
              {isAuthenticated && (
                <TouchableOpacity
                  style={styles.emptyReviewsButton}
                  onPress={handleAddReview}
                  activeOpacity={0.8}
                >
                  <Feather name="edit-3" size={16} color={colors.background} />
                  <Text style={styles.emptyReviewsButtonText}>Write a Review</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
            </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    paddingTop: spacing.xl + 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowSm,
  },
  heroRatingBadge: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...shadowSm,
  },
  heroRatingText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadowMd,
    zIndex: 2,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetScrollView: {
    flex: 1,
  },
  sheetContent: {
    paddingBottom: spacing.xxl + 20,
  },
  sheetHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  sheetTitle: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  primaryActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
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
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  badgeText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '700',
    fontSize: 20,
  },
  descriptionText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    fontSize: 15,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  contactButton: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    paddingVertical: spacing.sm,
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
    paddingVertical: spacing.xxl,
  },
  emptyReviewsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyReviewsText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  emptyReviewsSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  emptyReviewsButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '600',
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
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  statusBadgeRejected: {
    borderColor: colors.error,
  },
  statusBadgeText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
    fontSize: 11,
  },
  statusBadgeTextRejected: {
    color: colors.error,
  },
  rejectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: `${colors.error}10`,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
  },
  rejectionText: {
    flex: 1,
  },
  rejectionTitle: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  rejectionReason: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
  },
  quickActionTextDisabled: {
    color: colors.textTertiary,
  },
});
