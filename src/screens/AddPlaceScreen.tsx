import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useLocationStore } from '../store/locationStore';
import LoadingIndicator from '../components/LoadingIndicator';
import MiniMapPreview from '../components/MiniMapPreview';
import { Category } from '../types';
import { colors, spacing, typography, borderRadius, shadowMd } from '../theme/designSystem';
import { sanitizeErrorMessage } from '../utils/errorHandler';

type Step = 1 | 2 | 3 | 4;

export default function AddPlaceScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated, showAuthModal } = useAuthStore();
  const { currentLocation } = useLocationStore();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
  });

  const mutation = useMutation({
    mutationFn: () => {
      // Validate required fields
      if (!name.trim()) {
        throw new Error('Place name is required');
      }
      if (!selectedCategory) {
        throw new Error('Category is required');
      }
      if (!address.trim() || !city.trim() || !district.trim()) {
        throw new Error('Address, city, and district are required');
      }
      if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Valid location coordinates are required');
      }

      return apiService.addPlace({
        name: name.trim(),
        categoryId: selectedCategory.id,
        address: address.trim(),
        city: city.trim(),
        district: district.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        description: description.trim() || undefined,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['popularPlaces'] });
      navigation.replace('AddPlaceSuccess', { placeId: data.id });
    },
    onError: (error: any) => {
      // Show specific error messages
      let errorMessage = 'Failed to submit place';
      
      if (error.message) {
        // Client-side validation error
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        // Backend error message
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data. Please check all fields.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please sign in to add a place.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = sanitizeErrorMessage(error);
      }

      Alert.alert('Error', errorMessage);
    },
  });

  // Flatten categories for selection
  const flattenCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    cats.forEach((cat) => {
      if (!cat.parentId) {
        result.push(cat);
      }
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children));
      }
    });
    return result;
  };

  const displayCategories = categories ? flattenCategories(categories) : [];

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Required', 'Please enter a place name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedCategory) {
        Alert.alert('Required', 'Please select a category');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!address.trim() || !city.trim() || !district.trim() || !latitude || !longitude) {
        Alert.alert('Required', 'Please complete the address and select a location on the map');
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to add a place.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => showAuthModal() },
        ]
      );
      return;
    }

    mutation.mutate();
  };

  const handleMapPress = () => {
    // For now, use current location or default
    if (currentLocation) {
      setLatitude(currentLocation.latitude);
      setLongitude(currentLocation.longitude);
    } else {
      // Default to Istanbul
      setLatitude(41.0082);
      setLongitude(28.9784);
    }
    Alert.alert(
      'Location Selected',
      'Using your current location. You can update this later.',
      [{ text: 'OK' }]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.authRequiredContainer}>
          <Feather name="lock" size={64} color={colors.textTertiary} />
          <Text style={styles.authRequiredTitle}>Sign In Required</Text>
          <Text style={styles.authRequiredText}>
            Please sign in to add a new place to FindSpot.
          </Text>
          <TouchableOpacity style={styles.signInButton} onPress={() => showAuthModal()}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add a Place</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                s <= step && styles.progressDotActive,
                s < step && styles.progressDotCompleted,
              ]}
            />
            {s < 4 && (
              <View
                style={[
                  styles.progressLine,
                  s < step && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Name</Text>
          <Text style={styles.progressLabel}>Category</Text>
          <Text style={styles.progressLabel}>Location</Text>
          <Text style={styles.progressLabel}>Details</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Place Name */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's the name of this place?</Text>
            <Text style={styles.stepSubtitle}>
              Enter the official or commonly used name
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Starbucks, Central Park"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={100}
            />
          </View>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What category is this place?</Text>
            <Text style={styles.stepSubtitle}>
              Select the most appropriate category
            </Text>
            {categoriesLoading ? (
              <LoadingIndicator message="Loading categories..." />
            ) : (
              <View style={styles.categoriesGrid}>
                {displayCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory?.id === category.id && styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory?.id === category.id && styles.categoryButtonTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Where is this place located?</Text>
            <Text style={styles.stepSubtitle}>
              Enter the address and select location on map
            </Text>

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor={colors.textTertiary}
              value={address}
              onChangeText={setAddress}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor={colors.textTertiary}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>District</Text>
                <TextInput
                  style={styles.input}
                  placeholder="District"
                  placeholderTextColor={colors.textTertiary}
                  value={district}
                  onChangeText={setDistrict}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Location on Map</Text>
            <TouchableOpacity onPress={handleMapPress} activeOpacity={0.9}>
              {latitude && longitude ? (
                <MiniMapPreview
                  latitude={latitude}
                  longitude={longitude}
                  height={200}
                />
              ) : (
                <View style={styles.mapPlaceholder}>
                  <Feather name="map-pin" size={32} color={colors.textTertiary} />
                  <Text style={styles.mapPlaceholderText}>
                    Tap to select location
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.mapHint}>
              {latitude && longitude
                ? 'Location selected. Tap map to change.'
                : 'Tap the map to select the location'}
            </Text>
          </View>
        )}

        {/* Step 4: Description (Optional) */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Tell us more (Optional)</Text>
            <Text style={styles.stepSubtitle}>
              Add a description to help others discover this place
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What makes this place special?"
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Name:</Text>
                <Text style={styles.summaryValue}>{name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Category:</Text>
                <Text style={styles.summaryValue}>{selectedCategory?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Address:</Text>
                <Text style={styles.summaryValue}>
                  {address}, {district}, {city}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {step < 4 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Feather name="arrow-right" size={18} color={colors.background} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, mutation.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Place</Text>
                <Feather name="check" size={18} color={colors.background} />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  stepContainer: {
    gap: spacing.md,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  charCount: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.background,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  mapHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    width: 80,
  },
  summaryValue: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadowMd,
  },
  nextButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadowMd,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '600',
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  authRequiredTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  authRequiredText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    minWidth: 200,
  },
  signInButtonText: {
    ...typography.button,
    color: colors.background,
  },
  backButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backButtonText: {
    ...typography.button,
    color: colors.primary,
  },
});

