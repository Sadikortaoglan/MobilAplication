import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

export default function AboutScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>About</Text>
        </View>

        {/* App Info Card */}
        <View style={styles.card}>
          <View style={styles.appInfoHeader}>
            <View style={styles.appIconContainer}>
              <Feather name="map-pin" size={32} color={colors.primary} />
            </View>
            <View style={styles.appInfoText}>
              <Text style={styles.appName}>FindSpot</Text>
              <Text style={styles.version}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.description}>
            Discover great places around you. Find gyms, cafes, restaurants and more — rated by real people.
          </Text>
        </View>

        {/* Contact Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>
          <Text style={styles.sectionText}>
            For support or feedback, please contact us:
          </Text>
          <TouchableOpacity
            style={styles.emailContainer}
            onPress={() => handleOpenLink('mailto:support@findspot.com')}
            activeOpacity={0.7}
          >
            <Feather name="mail" size={18} color={colors.primary} />
            <Text style={styles.email}>support@findspot.com</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy & Legal</Text>
          <Text style={styles.sectionText}>
            FindSpot respects your privacy and handles your data securely. We never share your personal information with third parties.
          </Text>
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
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    ...shadowSm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  appIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfoText: {
    flex: 1,
  },
  appName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  version: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  sectionText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  email: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
});

