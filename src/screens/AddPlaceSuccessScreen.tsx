import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { ExploreStackParamList } from '../navigation/types';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

type AddPlaceSuccessRouteProp = RouteProp<ExploreStackParamList, 'AddPlaceSuccess'>;

export default function AddPlaceSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<AddPlaceSuccessRouteProp>();
  const placeId = route.params?.placeId;

  const handleViewPlace = () => {
    if (placeId) {
      navigation.reset({
        index: 0,
        routes: [
          { name: 'MainTabs', params: { screen: 'Explore' } },
          { name: 'PlaceDetail', params: { placeId } },
        ],
      });
    } else {
      navigation.navigate('ExploreHome');
    }
  };

  const handleExplore = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Explore' } }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="check-circle" size={80} color={colors.success} />
        </View>
        
        <Text style={styles.title}>Thanks for your contribution!</Text>
        
        <Text style={styles.message}>
          Your place has been submitted and will be reviewed by our team before appearing publicly.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Feather name="clock" size={20} color={colors.warning} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Status: Pending Review</Text>
              <Text style={styles.infoSubtitle}>
                We'll notify you once your place is approved
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {placeId && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewPlace}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>View My Place</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleExplore}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Explore Places</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '800',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text,
    fontWeight: '600',
  },
});

