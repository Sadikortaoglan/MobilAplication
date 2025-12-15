import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showRating?: boolean;
}

export default function RatingStars({
  rating,
  size = 20,
  showRating = false,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={i} style={[styles.star, { fontSize: size }]}>
            ★
          </Text>
        ))}
        {hasHalfStar && (
          <Text style={[styles.star, { fontSize: size }]}>☆</Text>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={i} style={[styles.star, styles.emptyStar, { fontSize: size }]}>
            ★
          </Text>
        ))}
      </View>
      {showRating && (
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    color: '#FFD700',
  },
  emptyStar: {
    color: '#E5E5E5',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});


