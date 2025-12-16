import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Place } from '../types';
import RatingStars from './RatingStars';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

interface PlacePreviewBottomSheetProps {
  place: Place | null;
  onClose: () => void;
  onViewDetails: () => void;
  visible: boolean;
  snapToIndex?: number; // 0 = collapsed (25%), 1 = mid (60%), 2 = expanded (90%)
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_POINTS = [
  SCREEN_HEIGHT * 0.75, // 25% visible (collapsed)
  SCREEN_HEIGHT * 0.4,  // 60% visible (mid)
  0,                    // 90% visible (expanded)
];

export default function PlacePreviewBottomSheet({
  place,
  onClose,
  onViewDetails,
  visible,
  snapToIndex = 1, // Default to mid position
}: PlacePreviewBottomSheetProps) {
  const translateY = useRef(new Animated.Value(SNAP_POINTS[0])).current;
  const currentSnapIndex = useRef(snapToIndex);

  const animateToSnapPoint = (index: number) => {
    const targetY = SNAP_POINTS[index];
    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    currentSnapIndex.current = index;
  };

  // Update snap index when prop changes
  useEffect(() => {
    if (snapToIndex !== undefined && snapToIndex !== currentSnapIndex.current) {
      currentSnapIndex.current = snapToIndex;
      animateToSnapPoint(snapToIndex);
    }
  }, [snapToIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        translateY.setOffset(translateY._value);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const currentY = translateY._offset + gestureState.dy;
        // Clamp between min (expanded) and max (collapsed)
        const clampedY = Math.max(SNAP_POINTS[2], Math.min(SNAP_POINTS[0], currentY));
        translateY.setValue(clampedY - translateY._offset);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        const currentY = translateY._value;
        const velocity = gestureState.vy;

        // Determine target snap point based on position and velocity
        let targetIndex = currentSnapIndex.current;

        if (Math.abs(velocity) > 0.5) {
          // Fast swipe - go to next/previous snap point
          if (velocity < 0) {
            // Swiping up
            targetIndex = Math.min(2, currentSnapIndex.current + 1);
          } else {
            // Swiping down
            targetIndex = Math.max(0, currentSnapIndex.current - 1);
          }
        } else {
          // Slow drag - snap to nearest point
          const distances = SNAP_POINTS.map((point) => Math.abs(currentY - point));
          targetIndex = distances.indexOf(Math.min(...distances));
        }

        // If dragged to bottom, close
        if (currentY > SNAP_POINTS[0] - 50) {
          onClose();
          return;
        }

        animateToSnapPoint(targetIndex);
      },
    })
  ).current;

  useEffect(() => {
    if (visible && place) {
      // Open to specified snap position when marker is tapped
      animateToSnapPoint(snapToIndex);
    } else {
      // Close completely
      Animated.spring(translateY, {
        toValue: SNAP_POINTS[0],
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      currentSnapIndex.current = 0;
    }
  }, [visible, place, snapToIndex]);

  if (!place || !visible) return null;

  const coverPhoto = place.photos?.find((photo) => photo.isCover) || place.photos?.[0];
  const showTrending = place.isTrending || (place.visitCountLast7Days && place.visitCountLast7Days > 10);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
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
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  handleContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
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
