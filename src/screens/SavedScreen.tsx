import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import PlaceCard from '../components/PlaceCard';
import LoadingIndicator from '../components/LoadingIndicator';
import { Place, VisitedTimelineItem, UserStats } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

export default function SavedScreen() {
  const { isAuthenticated, showAuthModal } = useAuthStore();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  // Fetch favorites
  const {
    data: favoritesResponse,
    isLoading: favoritesLoading,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiService.getFavorites(),
    enabled: isAuthenticated,
    retry: 1,
  });

  // Fetch visited places
  const {
    data: visitedResponse,
    isLoading: visitedLoading,
    refetch: refetchVisited,
  } = useQuery({
    queryKey: ['visited'],
    queryFn: () => apiService.getVisited(),
    enabled: isAuthenticated,
    retry: 1,
  });

  // Fetch visited timeline
  const {
    data: visitedTimelineResponse,
    isLoading: timelineLoading,
    refetch: refetchTimeline,
  } = useQuery({
    queryKey: ['visitedTimeline'],
    queryFn: () => apiService.getVisitedTimeline(0, 20, 'visitedAt'),
    enabled: isAuthenticated,
    retry: 1,
  });

  // Fetch user stats
  const {
    data: userStats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => apiService.getUserStats(),
    enabled: isAuthenticated,
    retry: 1,
  });

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        refetchFavorites();
        refetchVisited();
        refetchTimeline();
      }
    }, [isAuthenticated, refetchFavorites, refetchVisited, refetchTimeline])
  );

  // Handle both array and paginated response formats
  const favorites = Array.isArray(favoritesResponse)
    ? favoritesResponse
    : favoritesResponse?.content || [];
  const visited = Array.isArray(visitedResponse)
    ? visitedResponse
    : visitedResponse?.content || [];
  const visitedTimeline = visitedTimelineResponse?.content || [];
  
  // Group timeline by month
  const timelineByMonth = React.useMemo(() => {
    const grouped: { [key: string]: VisitedTimelineItem[] } = {};
    visitedTimeline.forEach((item: VisitedTimelineItem) => {
      const date = new Date(item.visitedAt);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(item);
    });
    return grouped;
  }, [visitedTimeline]);

  const handlePlacePress = (place: Place) => {
    navigation.getParent()?.navigate('Explore', {
      screen: 'PlaceDetail',
      params: { placeId: place.id },
    });
  };

  const handleTimelineItemPress = (item: VisitedTimelineItem) => {
    navigation.getParent()?.navigate('Explore', {
      screen: 'PlaceDetail',
      params: { placeId: item.placeId },
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Feather name="heart" size={72} color={colors.favorite} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to save places</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite places and track where you've been
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => showAuthModal()}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (favoritesLoading || visitedLoading || timelineLoading || statsLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingIndicator message="Loading saved places..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Saved</Text>
        </View>

        {/* Favorites Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="heart" size={20} color={colors.favorite} />
            <Text style={styles.sectionTitle}>Favorites</Text>
            {favorites.length > 0 && (
              <Text style={styles.count}>({favorites.length})</Text>
            )}
          </View>
          {favorites.length > 0 ? (
            <FlatList
              data={favorites}
              keyExtractor={(item: any) => {
                const place = item.place || item;
                return place.id.toString();
              }}
              renderItem={({ item }) => {
                const place = item.place || item;
                return <PlaceCard place={place} onPress={() => handlePlacePress(place)} />;
              }}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIconContainer}>
                <Feather name="heart" size={48} color={colors.favorite} />
              </View>
              <Text style={styles.emptyStateText}>No favorites yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the heart icon on a place to save it
              </Text>
            </View>
          )}
        </View>

        {/* Visited Timeline Section */}
        {visitedTimeline.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="clock" size={20} color={colors.visited} />
              <Text style={styles.sectionTitle}>Places you've been</Text>
            </View>
            {Object.entries(timelineByMonth).map(([month, items]) => (
              <View key={month} style={styles.monthGroup}>
                <Text style={styles.monthTitle}>{month}</Text>
                <Text style={styles.monthSummary}>
                  You discovered {items.length} {items.length === 1 ? 'place' : 'places'}
                </Text>
                {items.map((item: VisitedTimelineItem) => (
                  <TouchableOpacity
                    key={item.placeId}
                    style={styles.timelineItem}
                    onPress={() => handleTimelineItemPress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.timelineItemContent}>
                      <View style={styles.timelineItemLeft}>
                        <Text style={styles.timelineItemName}>{item.placeName}</Text>
                        <Text style={styles.timelineItemCategory}>{item.category.name}</Text>
                      </View>
                      <Text style={styles.timelineItemDate}>
                        {new Date(item.visitedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Visited Section (Legacy - keep for backward compatibility) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="check-circle" size={20} color={colors.visited} />
            <Text style={styles.sectionTitle}>All visited</Text>
            {visited.length > 0 && (
              <Text style={styles.count}>({visited.length})</Text>
            )}
          </View>
          {visited.length > 0 ? (
            <FlatList
              data={visited}
              keyExtractor={(item: any) => {
                const place = item.place || item;
                return place.id.toString();
              }}
              renderItem={({ item }) => {
                const place = item.place || item;
                return <PlaceCard place={place} onPress={() => handlePlacePress(place)} />;
              }}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIconContainer}>
                <Feather name="check-circle" size={48} color={colors.visited} />
              </View>
              <Text style={styles.emptyStateText}>No visited places yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Mark places you've been to and they'll appear here
              </Text>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  count: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  emptyStateIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyStateText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.favorite}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 200,
  },
  signInButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '700',
  },
  monthGroup: {
    marginBottom: spacing.lg,
  },
  monthTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  monthSummary: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  timelineItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timelineItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineItemLeft: {
    flex: 1,
  },
  timelineItemName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  timelineItemCategory: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  timelineItemDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
