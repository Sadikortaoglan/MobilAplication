import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Place } from '../types';
import RatingStars from './RatingStars';
import { colors, spacing, typography, borderRadius, shadowLg } from '../theme/designSystem';

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
}

export default function PlaceCard({ place, onPress }: PlaceCardProps) {
  const coverPhoto = place.photos?.find((photo) => photo.isCover) || place.photos?.[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {coverPhoto && (
        <Image
          source={{ uri: coverPhoto.url }}
          style={styles.image}
          resizeMode="cover"
        />
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
    marginHorizontal: spacing.md,
    ...shadowLg,
    overflow: 'hidden',
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundSecondary,
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
