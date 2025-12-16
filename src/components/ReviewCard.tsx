import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Review } from '../types';
import RatingStars from './RatingStars';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, typography, borderRadius, shadowSm } from '../theme/designSystem';

interface ReviewCardProps {
  review: Review;
  placeId?: number;
  onHelpfulPress?: () => void;
}

export default function ReviewCard({ review, placeId, onHelpfulPress }: ReviewCardProps) {
  const { isAuthenticated } = useAuthStore();
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Note: User stats per reviewer would require a different endpoint
  // For now, we show helpful count which is available in the review object

  const handleHelpful = async () => {
    if (!placeId || !isAuthenticated) return;
    try {
      await apiService.markReviewHelpful(placeId, review.id);
      onHelpfulPress?.();
    } catch (error) {
      // Silent fail - helpful is optional
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {review.user.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {review.user.displayName}
            </Text>
            {/* Reviewer stats placeholder - would show "Visited 12 places" if available */}
          </View>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <RatingStars rating={review.rating} size={14} />
      </View>
      {review.comment && (
        <Text style={styles.comment} numberOfLines={10}>
          {review.comment}
        </Text>
      )}
      {(review.helpfulCount !== undefined && review.helpfulCount > 0) && (
        <View style={styles.helpfulContainer}>
          <Feather name="thumbs-up" size={14} color={colors.textSecondary} />
          <Text style={styles.helpfulText}>
            {review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful
          </Text>
        </View>
      )}
      {isAuthenticated && placeId && (
        <TouchableOpacity
          style={styles.helpfulButton}
          onPress={handleHelpful}
          activeOpacity={0.7}
        >
          <Feather name="thumbs-up" size={16} color={colors.primary} />
          <Text style={styles.helpfulButtonText}>Helpful</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    ...shadowSm,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  ratingContainer: {
    marginBottom: spacing.sm,
  },
  comment: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  helpfulContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  helpfulText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  helpfulButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});
