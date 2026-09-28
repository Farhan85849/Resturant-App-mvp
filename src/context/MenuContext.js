// src/context/MenuContext.js
// Shared menu state so Manager edits appear instantly on customer screens
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultMenuItems from '../data/menu';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [menuItems, setMenuItems] = useState(defaultMenuItems);
  const [loaded, setLoaded] = useState(false);

  // Load persisted menu on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@menu');
        if (stored) setMenuItems(JSON.parse(stored));
      } catch (_) {
        // Use default if storage fails
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persist whenever menu changes (but not on the very first load)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem('@menu', JSON.stringify(menuItems)).catch(() => {});
  }, [menuItems, loaded]);

  const updateItem = (id, changes) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  };

  const addItem = (newItem) => {
    setMenuItems((prev) => [...prev, { ...newItem, id: `m${Date.now()}` }]);
  };

  return (
    <MenuContext.Provider value={{ menuItems, setMenuItems, updateItem, addItem, loaded }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error('useMenu must be used inside a <MenuProvider>.');
  }
  return ctx;
}
