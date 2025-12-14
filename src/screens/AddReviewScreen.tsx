import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import ReviewForm from '../components/ReviewForm';
import { RootStackParamList } from '../navigation/types';

type AddReviewScreenRouteProp = RouteProp<RootStackParamList, 'AddReview'>;

export default function AddReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<AddReviewScreenRouteProp>();
  const placeId = route.params?.placeId;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      apiService.addReview(Number(placeId), rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', placeId] });
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      navigation.goBack();
    },
  });

  const handleSubmit = async (rating: number, comment: string) => {
    await mutation.mutateAsync({ rating, comment });
  };

  return (
    <ScrollView style={styles.container}>
      <ReviewForm onSubmit={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});

