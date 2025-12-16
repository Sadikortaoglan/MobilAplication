import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Category } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  isHorizontal?: boolean;
}

export default function CategoryCard({
  category,
  onPress,
  isHorizontal = false,
}: CategoryCardProps) {
  const iconName = getCategoryIcon(category.name);
  const iconColor = getCategoryColor(category.name);

  if (isHorizontal) {
    // Horizontal card - for horizontal scroll - Larger, more visual
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Feather name={iconName} size={36} color={iconColor} />
        </View>
        <Text style={styles.horizontalText} numberOfLines={2}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  }

  // Large card - for 2-column grid - More visual
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Feather name={iconName} size={48} color={iconColor} />
      </View>
      <Text style={styles.cardText} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Horizontal card style - Larger, more visual
  horizontalCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  horizontalText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
  // Large card style - More visual, larger tap target
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    margin: spacing.sm,
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 160,
  },
  cardIconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardText: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
});

