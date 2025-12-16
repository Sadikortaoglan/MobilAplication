import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { Place } from '../types';
import RatingStars from './RatingStars';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

interface PlacePreviewBottomSheetProps {
  place: Place | null;
  onClose: () => void;
  onViewDetails: () => void;
  visible: boolean;
  snapToIndex?: number; // 0 = collapsed (15%), 1 = mid (55%), 2 = expanded (95%)
}

export default function PlacePreviewBottomSheet({
  place,
  onClose,
  onViewDetails,
  visible,
  snapToIndex = 1, // Default to mid position
}: PlacePreviewBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points: 15% (collapsed/peek), 55% (mid/preview), 95% (full/details)
  const snapPoints = useMemo(() => ['15%', '55%', '95%'], []);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    // Close sheet if dragged to bottom (index -1 means closed)
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  // Open/close sheet based on visibility
  useEffect(() => {
    if (!bottomSheetRef.current) return;

    if (visible && place) {
      // Open to specified snap point
      bottomSheetRef.current.snapToIndex(snapToIndex);
    } else {
      // Close sheet
      bottomSheetRef.current.close();
    }
  }, [visible, place, snapToIndex]);

  if (!place) return null;

  const coverPhoto = place.photos?.find((photo) => photo.isCover) || place.photos?.[0];
  const showTrending = place.isTrending || (place.visitCountLast7Days && place.visitCountLast7Days > 10);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? snapToIndex : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      animateOnMount={true}
      enableDynamicSizing={false}
    >
        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with image */}
          <View style={styles.header}>
            {coverPhoto && (
              <Image source={{ uri: coverPhoto.url }} style={styles.headerImage} resizeMode="cover" />
            )}
            <View style={styles.headerOverlay}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
                <Feather name="x" size={20} color={colors.background} />
              </TouchableOpacity>
              {showTrending && (
                <View style={styles.trendingBadge}>
                  <Feather name="trending-up" size={12} color={colors.background} />
                  <Text style={styles.trendingText}>Trending</Text>
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.name} numberOfLines={2}>
              {place.name}
            </Text>
            <Text style={styles.address} numberOfLines={1}>
              {place.address}
            </Text>

            {place.averageRating !== undefined && (
              <View style={styles.ratingContainer}>
                <RatingStars rating={place.averageRating} size={16} />
                <Text style={styles.ratingText}>
                  {place.averageRating.toFixed(1)} ({place.reviewCount || 0} reviews)
                </Text>
              </View>
            )}

            {place.distance !== undefined && (
              <View style={styles.distanceContainer}>
                <Feather name="map-pin" size={14} color={colors.primary} />
                <Text style={styles.distance}>
                  {place.distance < 1
                    ? `${(place.distance * 1000).toFixed(0)}m away`
                    : `${place.distance.toFixed(1)}km away`}
                </Text>
              </View>
            )}

            {place.visitCountLast7Days && place.visitCountLast7Days > 0 && (
              <View style={styles.activityContainer}>
                <Feather name="users" size={14} color={colors.textSecondary} />
                <Text style={styles.activityText}>
                  {place.visitCountLast7Days} {place.visitCountLast7Days === 1 ? 'person' : 'people'} visited this week
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.viewDetailsButton} onPress={onViewDetails} activeOpacity={0.8}>
              <Text style={styles.viewDetailsButtonText}>View Details</Text>
              <Feather name="arrow-right" size={18} color={colors.background} />
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  handleIndicator: {
    backgroundColor: colors.border,
    width: 40,
    height: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    height: 200,
    position: 'relative',
    marginBottom: spacing.md,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xl,
    alignSelf: 'flex-start',
  },
  trendingText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '700',
    fontSize: 11,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  address: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ratingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  distance: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  activityText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  viewDetailsButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '700',
  },
});
