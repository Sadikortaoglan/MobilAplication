import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import ExploreScreen from '../screens/ExploreScreen';
import NearbyPlacesScreen from '../screens/NearbyPlacesScreen';
import MapScreen from '../screens/MapScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import AddReviewScreen from '../screens/AddReviewScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import {
  RootStackParamList,
  MainTabParamList,
  ExploreStackParamList,
  MapStackParamList,
  SavedStackParamList,
  ProfileStackParamList,
  AuthModalStackParamList,
} from './types';
import { colors } from '../theme/designSystem';

// Root Stack Navigator
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Stack Navigators
const ExploreStack = createNativeStackNavigator<ExploreStackParamList>();
const MapStack = createNativeStackNavigator<MapStackParamList>();
const SavedStack = createNativeStackNavigator<SavedStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const AuthStack = createNativeStackNavigator<AuthModalStackParamList>();

// Tab Navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

// Explore Stack
function ExploreStackNavigator() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="ExploreHome" component={ExploreScreen} />
      <ExploreStack.Screen
        name="NearbyPlaces"
        component={NearbyPlacesScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <ExploreStack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{
          headerShown: true,
          title: 'Place Details',
          presentation: 'card',
        }}
      />
      <ExploreStack.Screen
        name="AddReview"
        component={AddReviewScreen}
        options={{
          headerShown: true,
          title: 'Add Review',
          presentation: 'card',
        }}
      />
    </ExploreStack.Navigator>
  );
}

// Map Stack
function MapStackNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="MapView" component={MapScreen} />
    </MapStack.Navigator>
  );
}

// Saved Stack
function SavedStackNavigator() {
  return (
    <SavedStack.Navigator screenOptions={{ headerShown: false }}>
      <SavedStack.Screen name="SavedHome" component={SavedScreen} />
    </SavedStack.Navigator>
  );
}

// Profile Stack
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
          presentation: 'card',
        }}
      />
      <ProfileStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: true,
          title: 'About',
          presentation: 'card',
        }}
      />
    </ProfileStack.Navigator>
  );
}

// Main Tabs - 4 tabs with proper icons
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreStackNavigator}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Feather name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapStackNavigator}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Feather name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedStackNavigator}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Feather name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Modal Stack
function AuthModalStack() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Sign In',
          headerLeft: () => null,
        }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Sign Up',
        }}
      />
    </AuthStack.Navigator>
  );
}

// Root App Navigator
export default function AppNavigator() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  // Expose auth modal trigger globally
  useEffect(() => {
    (global as any).showAuthModal = () => {
      // This will be handled by navigation reference
      if ((global as any).navigationRef?.current) {
        (global as any).navigationRef.current.navigate('AuthModal');
      }
    };
    (global as any).hideAuthModal = () => {
      if ((global as any).navigationRef?.current) {
        (global as any).navigationRef.current.goBack();
      }
    };
  }, []);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen
        name="AuthModal"
        component={AuthModalStack}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </RootStack.Navigator>
  );
}
