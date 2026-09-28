// src/context/OrdersContext.js
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Reducer ─────────────────────────────────────────────────────────────────
function ordersReducer(state, action) {
  switch (action.type) {
    case 'LOAD_ORDERS':
      return action.payload;

    case 'PLACE_ORDER': {
      const newOrder = {
        id: `ord-${Date.now()}`,
        items: action.payload.items,
        total: action.payload.total,
        type: action.payload.type,        // 'dine-in' | 'takeaway'
        tableId: action.payload.tableId ?? null,
        pickupTime: action.payload.pickupTime ?? null,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        userId: action.payload.userId,
      };
      return [...state, newOrder];
    }

    case 'UPDATE_STATUS':
      return state.map((o) =>
        o.id === action.payload.id ? { ...o, status: action.payload.status } : o
      );

    case 'CANCEL_ORDER':
      return state.map((o) =>
        o.id === action.payload ? { ...o, status: 'Cancelled' } : o
      );

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const [orders, dispatch] = useReducer(ordersReducer, []);
  const [loaded, setLoaded] = useState(false);

  // Load persisted orders on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@orders');
        if (stored) dispatch({ type: 'LOAD_ORDERS', payload: JSON.parse(stored) });
      } catch (_) {}
      finally { setLoaded(true); }
    })();
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem('@orders', JSON.stringify(orders)).catch(() => {});
  }, [orders, loaded]);

  return (
    <OrdersContext.Provider value={{ orders, dispatch, loaded }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error('useOrders must be used inside an <OrdersProvider>.');
  }
  return ctx;
}
