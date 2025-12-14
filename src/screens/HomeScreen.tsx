import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
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
    return <LoadingIndicator message="Loading categories..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FindSpot</Text>
        <Text style={styles.subtitle}>Discover places near you</Text>
      </View>
      <ScrollView style={styles.content}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    margin: 16,
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
});

