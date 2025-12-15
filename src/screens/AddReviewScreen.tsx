import React, { useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import ReviewForm from '../components/ReviewForm';
import LoadingIndicator from '../components/LoadingIndicator';
import { ExploreStackParamList } from '../navigation/types';
import { colors, spacing, typography, borderRadius, shadowMd } from '../theme/designSystem';
import { sanitizeErrorMessage } from '../utils/errorHandler';

type AddReviewScreenRouteProp = RouteProp<ExploreStackParamList, 'AddReview'>;

export default function AddReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<AddReviewScreenRouteProp>();
  const placeId = route.params?.placeId;
  const reviewId = route.params?.reviewId;
  const initialRating = route.params?.initialRating;
  const initialComment = route.params?.initialComment;
  const isEditMode = !!reviewId;
  
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  // ALWAYS check from backend - no caching, no assumptions
  // Skip check in edit mode since we already have the review
  const { data: userReview, isLoading: reviewCheckLoading, refetch: refetchUserReview } = useQuery({
    queryKey: ['userReview', placeId, user?.id],
    queryFn: () => apiService.getUserReview(Number(placeId)),
    enabled: !!placeId && isAuthenticated && !!user?.id && !isEditMode,
    retry: 1,
    staleTime: 0, // Always consider stale - never use cache
    cacheTime: 0, // Don't cache - always fetch fresh
  });

  // Reset when placeId or user changes
  useEffect(() => {
    if (placeId && user?.id && !isEditMode) {
      refetchUserReview();
    }
  }, [placeId, user?.id, refetchUserReview, isEditMode]);

  // Create or update mutation
  const mutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) => {
      if (isEditMode && reviewId) {
        return apiService.updateReview(Number(placeId), reviewId, rating, comment);
      } else {
        return apiService.addReview(Number(placeId), rating, comment);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', placeId] });
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      queryClient.invalidateQueries({ queryKey: ['userReview', placeId, user?.id] });
      // Success - navigate back (visual feedback is the navigation)
      navigation.goBack();
    },
    onError: async (error: any) => {
      // Check if it's a 409 (already reviewed) - only for create mode
      if (!isEditMode) {
        const status = error.response?.status;
        if (status === 409) {
          // Backend confirms review exists - refresh state immediately
          await refetchUserReview();
          // This will trigger a re-render showing the "already reviewed" screen
          // Don't throw error - let the component handle the state change
          return;
        }
      }
      // Other errors - re-throw for ReviewForm to handle
      throw error;
    },
  });

  const handleSubmit = async (rating: number, comment: string) => {
    // In edit mode, skip the check
    if (!isEditMode) {
      // Final check before submitting - refetch to ensure we have latest state
      const { data: latestReview } = await refetchUserReview();
      
      // Check again after refetch
      if (latestReview) {
        throw new Error('You have already reviewed this place.');
      }
    }
    
    try {
      await mutation.mutateAsync({ rating, comment });
    } catch (error: any) {
      // If 409, mutation's onError already handled refetch
      // Just re-throw with friendly message
      if (error?.response?.status === 409) {
        throw new Error('You have already reviewed this place.');
      }
      // Other errors - sanitize and show
      const message = sanitizeErrorMessage(error);
      throw new Error(message);
    }
  };

  if (reviewCheckLoading && !isEditMode) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingIndicator message="Checking review status..." />
      </SafeAreaView>
    );
  }

  // Backend confirms user already reviewed - Friendly explanation (only in create mode)
  if (userReview && !isEditMode) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.alreadyReviewedContainer}>
          <View style={styles.successIconContainer}>
            <Feather name="check-circle" size={72} color={colors.success} />
          </View>
          <Text style={styles.alreadyReviewedTitle}>You've already reviewed this place</Text>
          <Text style={styles.alreadyReviewedText}>
            Thank you for your contribution! Each place can only be reviewed once to keep feedback authentic and helpful.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>
            {isEditMode ? 'Edit your review' : 'Share your experience'}
          </Text>
          <Text style={styles.formSubtitle}>
            {isEditMode 
              ? 'Update your review to help others discover great places'
              : 'Your review helps others discover great places'}
          </Text>
        </View>
        <ReviewForm 
          onSubmit={handleSubmit}
          initialRating={initialRating}
          initialComment={initialComment}
        />
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
  formHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
  },
  formTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  formSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  alreadyReviewedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  alreadyReviewedTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  alreadyReviewedText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadowMd,
    minWidth: 200,
  },
  backButtonText: {
    ...typography.button,
    color: colors.background,
  },
});
