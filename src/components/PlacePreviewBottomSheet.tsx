import React from 'react';
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
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.4; // 40% of screen
const MIN_SHEET_HEIGHT = 120; // Minimum height when collapsed

export default function PlacePreviewBottomSheet({
  place,
  onClose,
  onViewDetails,
  visible,
}: PlacePreviewBottomSheetProps) {
  const translateY = React.useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [isExpanded, setIsExpanded] = React.useState(false);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          // Dragged down - close
          Animated.spring(translateY, {
            toValue: SHEET_HEIGHT,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start(() => {
            onClose();
            setIsExpanded(false);
          });
        } else if (gestureState.dy < -50) {
          // Dragged up - expand
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start(() => setIsExpanded(true));
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: isExpanded ? 0 : SHEET_HEIGHT - MIN_SHEET_HEIGHT,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (visible && place) {
      Animated.spring(translateY, {
        toValue: SHEET_HEIGHT - MIN_SHEET_HEIGHT,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: SHEET_HEIGHT,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [visible, place]);

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
      <View style={styles.handle} />
      <ScrollView
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
    height: SHEET_HEIGHT,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    height: 150,
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

