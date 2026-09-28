// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useReservations } from '../context/ReservationContext';
import { useMenu } from '../context/MenuContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import ReservationScreen from '../screens/ReservationScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MenuStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="MenuMain" component={MenuScreen} options={{ title: 'Menu' }} />
    </Stack.Navigator>
  );
}

function CartStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="CartMain" component={CartScreen} options={{ title: 'Cart' }} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Checkout' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { state: cart } = useCart();
  
  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.border },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Menu') iconName = 'food';
          else if (route.name === 'Cart') iconName = 'cart';
          else if (route.name === 'Reserve') iconName = 'calendar-clock';
          else if (route.name === 'Track') iconName = 'map-marker-path';
          else if (route.name === 'Profile') iconName = 'account';
          else if (route.name === 'Dashboard') iconName = 'view-dashboard';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Menu" component={MenuStack} />
      <Tab.Screen 
        name="Cart" 
        component={CartStack} 
        options={{ tabBarBadge: cartItemCount > 0 ? cartItemCount : null, tabBarBadgeStyle: { backgroundColor: theme.primary, color: '#fff' } }} 
      />
      <Tab.Screen name="Reserve" component={ReservationScreen} options={{ headerShown: true, headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }} />
      <Tab.Screen name="Track" component={OrderTrackingScreen} options={{ headerShown: true, title: 'Tracking', headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }} />
      
      {/* Q6: Restrict navigation by role */}
      {user?.role === 'manager' && (
        <Tab.Screen name="Dashboard" component={ManagerDashboardScreen} options={{ headerShown: true, title: 'Manager Dashboard', headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }} />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // Q10: Show loading screen until local storage is loaded to prevent empty data flashes
  const { loaded: ordersLoaded } = useOrders();
  const { loaded: resLoaded } = useReservations();
  const { loaded: menuLoaded } = useMenu();

  if (user && (!ordersLoaded || !resLoaded || !menuLoaded)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}
