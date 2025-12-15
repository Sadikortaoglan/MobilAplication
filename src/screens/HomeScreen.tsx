import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { usePlacesStore } from '../store/placesStore';
import { useLocationStore } from '../store/locationStore';
import CategoryButton from '../components/CategoryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import { Category } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { setSelectedCategory, setSelectedSubcategory } = usePlacesStore();
  const { currentLocation, fetchLocation } = useLocationStore();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });

  useEffect(() => {
    // Soft location request - non-blocking
    if (!currentLocation) {
      fetchLocation();
    }
  }, []);

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    navigation.navigate('Nearby', { categoryId: category.id });
  };

  // Flatten categories tree for display
  const flattenCategories = (categories: Category[]): Category[] => {
    const result: Category[] = [];
    categories.forEach((category) => {
      result.push(category);
      if (category.children && category.children.length > 0) {
        result.push(...flattenCategories(category.children));
      }
    });
    return result;
  };

  const displayCategories = categories ? flattenCategories(categories) : [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingIndicator message="Loading categories..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>FindSpot</Text>
        <Text style={styles.subtitle}>Discover places near you</Text>
      </View>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {displayCategories.map((category: Category) => (
            <CategoryButton
              key={category.id}
              category={category}
              onPress={() => handleCategoryPress(category)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    justifyContent: 'flex-start',
  },
});

