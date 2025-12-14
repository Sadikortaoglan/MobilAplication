import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Review } from '../types';
import RatingStars from './RatingStars';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.userName}>{review.user.displayName}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <RatingStars rating={review.rating} size={16} />
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    marginBottom: 8,
  },
  comment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

