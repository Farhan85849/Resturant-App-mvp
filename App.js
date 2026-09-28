// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { MenuProvider } from './src/context/MenuContext';
import { CartProvider } from './src/context/CartContext';
import { OrdersProvider } from './src/context/OrdersContext';
import { ReservationProvider } from './src/context/ReservationContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MenuProvider>
            <CartProvider>
              <OrdersProvider>
                <ReservationProvider>
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </ReservationProvider>
              </OrdersProvider>
            </CartProvider>
          </MenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
