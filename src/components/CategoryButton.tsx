import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { Category } from '../types';

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
    >
      <View style={styles.content}>
        {category.icon && <Text style={styles.icon}>{category.icon}</Text>}
        <Text style={[styles.text, isSelected && styles.selectedText]}>
          {category.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
    borderColor: '#0051D5',
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFF',
  },
});

