import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import RatingStars from './RatingStars';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
}

export default function ReviewForm({ onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating');
      return;
    }
    if (comment.trim().length === 0) {
      Alert.alert('Comment Required', 'Please enter a comment');
      return;
    }
    if (comment.trim().length < 10) {
      Alert.alert('Comment Too Short', 'Please write at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(rating, comment);
      // Success - form will be reset by parent
    } catch (error: any) {
      // Error message is already sanitized by AddReviewScreen
      const message = error?.message || error?.response?.data?.message || 'Failed to submit review. Please try again.';
      
      // If it's a 409 (already reviewed), show friendly message
      if (error?.response?.status === 409 || message.includes('already reviewed')) {
        Alert.alert(
          'Already Reviewed',
          'You have already reviewed this place. Each place can only be reviewed once.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>How was your experience?</Text>
      <Text style={styles.labelHint}>Tap the stars to rate</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Feather
              name={star <= rating ? 'star' : 'star'}
              size={36}
              color={star <= rating ? colors.warning : colors.border}
              fill={star <= rating ? colors.warning : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
      {rating > 0 && (
        <Text style={styles.ratingFeedback}>
          {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
        </Text>
      )}
      <Text style={styles.label}>Share your thoughts</Text>
      <Text style={styles.labelHint}>Help others by describing your experience</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={6}
        placeholder="Share your experience..."
        placeholderTextColor={colors.textTertiary}
        value={comment}
        onChangeText={setComment}
        textAlignVertical="top"
        editable={!isSubmitting}
        maxLength={500}
      />
      <View style={styles.charCountContainer}>
        <Text style={styles.charCount}>
          {comment.length}/500 characters
        </Text>
        {comment.length >= 10 && (
          <View style={styles.checkIcon}>
            <Feather name="check" size={14} color={colors.success} />
          </View>
        )}
      </View>
      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || rating === 0 || comment.trim().length < 10) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <>
              <Feather name="send" size={18} color={colors.background} />
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    maxWidth: '100%',
  },
  label: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  labelHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  ratingFeedback: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  starButton: {
    padding: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 120,
    marginBottom: spacing.xs,
    width: '100%',
    maxWidth: '100%',
    backgroundColor: colors.background,
  },
  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  charCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    gap: spacing.xs,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textTertiary,
    opacity: 0.5,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.background,
  },
});
