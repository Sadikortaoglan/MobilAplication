import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Place } from '../types';
import RatingStars from './RatingStars';

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
}

export default function PlaceCard({ place, onPress }: PlaceCardProps) {
  const coverPhoto = place.photos?.find((photo) => photo.isCover) || place.photos?.[0];
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {coverPhoto && (
        <Image source={{ uri: coverPhoto.url }} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.address} numberOfLines={1}>
          {place.address}
        </Text>
        {place.averageRating !== undefined && (
          <View style={styles.ratingContainer}>
            <RatingStars rating={place.averageRating} size={16} />
            <Text style={styles.ratingText}>
              {place.averageRating.toFixed(1)} ({place.reviewCount || 0})
            </Text>
          </View>
        )}
        {place.distance !== undefined && (
          <Text style={styles.distance}>
            {place.distance < 1
              ? `${(place.distance * 1000).toFixed(0)}m away`
              : `${place.distance.toFixed(1)}km away`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#E5E5E5',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  distance: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
});

