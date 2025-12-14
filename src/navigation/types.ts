export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  PlaceDetail: { placeId: number };
  AddReview: { placeId: number };
};

export type MainTabParamList = {
  Home: undefined;
  Nearby: { categoryId?: number };
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

