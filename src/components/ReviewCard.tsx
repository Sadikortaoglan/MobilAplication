import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Review } from '../types';
import RatingStars from './RatingStars';
import { colors, spacing, typography, borderRadius, shadowSm } from '../theme/designSystem';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.userName} numberOfLines={1}>
          {review.user.displayName}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <RatingStars rating={review.rating} size={14} />
      </View>
      <Text style={styles.comment} numberOfLines={10}>
        {review.comment}
      </Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: spacing.xs,
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
  },
});
