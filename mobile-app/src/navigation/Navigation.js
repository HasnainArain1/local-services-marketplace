/**
 * Navigation — bottom tab bar + stack navigators.
 *
 * Tab bar: Home | My Requests | Profile
 * Stack screens: SubmitRequest, RequestDetail, Chat, Review, SupportChat, ProviderOnboarding
 * Auth stack: Login, Signup (shown when not logged in)
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Fonts } from '../theme';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import SubmitRequestScreen from '../screens/SubmitRequestScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';
import ChatScreen from '../screens/ChatScreen';
import ReviewScreen from '../screens/ReviewScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SupportChatScreen from '../screens/SupportChatScreen';
import ProviderOnboardingScreen from '../screens/ProviderOnboardingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: Colors.card, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitleStyle: { color: Colors.ink, ...Fonts.semibold, fontSize: 17 },
  headerTintColor: Colors.teal,
  headerBackTitleVisible: false,
};

// ─── Auth Stack ────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// ─── Home Stack ────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'LocalServ' }} />
      <Stack.Screen name="SubmitRequest" component={SubmitRequestScreen} options={{ title: 'New Request' }} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request Details' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'Leave Review' }} />
      <Stack.Screen name="SupportChat" component={SupportChatScreen} options={{ title: 'Support' }} />
    </Stack.Navigator>
  );
}

// ─── Requests Stack ────────────────────────────────────────────
function RequestsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="RequestsList" component={MyRequestsScreen} options={{ title: 'My Requests' }} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request Details' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'Leave Review' }} />
    </Stack.Navigator>
  );
}

// ─── Profile Stack ─────────────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="SupportChat" component={SupportChatScreen} options={{ title: 'Support' }} />
      <Stack.Screen name="ProviderOnboarding" component={ProviderOnboardingScreen} options={{ title: 'Service Profile' }} />
    </Stack.Navigator>
  );
}

// ─── Main Tab Navigator ────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.teal,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: 4,
          height: 58,
        },
        tabBarLabelStyle: { fontSize: 11, ...Fonts.medium },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Requests') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Requests" component={RequestsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ────────────────────────────────────────────
export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.paper },
});
