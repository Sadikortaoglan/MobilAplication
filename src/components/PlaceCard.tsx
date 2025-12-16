import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Place } from '../types';
import RatingStars from './RatingStars';
import { colors, spacing, typography, borderRadius, shadowLg } from '../theme/designSystem';

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
}

export default function PlaceCard({ place, onPress }: PlaceCardProps) {
  const coverPhoto = place.photos?.find((photo) => photo.isCover) || place.photos?.[0];
  const showTrending = place.isTrending || (place.visitCountLast7Days && place.visitCountLast7Days > 10);
  const showActivity = place.visitCountLast7Days && place.visitCountLast7Days > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {coverPhoto && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: coverPhoto.url }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Activity Badges Overlay */}
          {showTrending && (
            <View style={styles.trendingBadge}>
              <Feather name="trending-up" size={12} color={colors.background} />
              <Text style={styles.trendingText}>Trending</Text>
            </View>
          )}
          {showActivity && !showTrending && (
            <View style={styles.activityBadge}>
              <Feather name="users" size={12} color={colors.background} />
              <Text style={styles.activityText}>
                {place.visitCountLast7Days} {place.visitCountLast7Days === 1 ? 'visit' : 'visits'} this week
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {place.name}
        </Text>
        <Text style={styles.address} numberOfLines={1} ellipsizeMode="tail">
          {place.address}
        </Text>
        {place.averageRating !== undefined && (
          <View style={styles.ratingContainer}>
            <RatingStars rating={place.averageRating} size={14} />
            <Text style={styles.ratingText} numberOfLines={1}>
              {place.averageRating.toFixed(1)} ({place.reviewCount || 0})
            </Text>
          </View>
        )}
        {place.distance !== undefined && (
          <Text style={styles.distance} numberOfLines={1}>
            {place.distance < 1
              ? `${(place.distance * 1000).toFixed(0)}m away`
              : `${place.distance.toFixed(1)}km away`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
    marginHorizontal: 0, // Horizontal scroll'da margin ekleniyor
    ...shadowLg,
    overflow: 'hidden',
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundSecondary,
  },
  trendingBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  trendingText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '700',
    fontSize: 11,
  },
  activityBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  activityText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
    fontSize: 11,
  },
  content: {
    padding: spacing.lg,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    flexShrink: 1,
    fontWeight: '600',
    fontSize: 20,
  },
  address: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    flexShrink: 1,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ratingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flexShrink: 1,
    fontWeight: '500',
  },
  distance: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});
