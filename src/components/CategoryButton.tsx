import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Category } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

interface CategoryButtonProps {
  category: Category;
  onPress: () => void;
  isSelected?: boolean;
}

export default function CategoryButton({
  category,
  onPress,
  isSelected = false,
}: CategoryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, isSelected && styles.selectedButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isSelected && styles.selectedText]} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    margin: spacing.xs,
    minWidth: 100,
    maxWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    flex: 1,
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  text: {
    ...typography.buttonSmall,
    color: colors.text,
    textAlign: 'center',
  },
  selectedText: {
    color: colors.background,
  },
});
