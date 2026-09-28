// src/context/ReservationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockReservations } from '../data/tables';

const ReservationContext = createContext(null);

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState(mockReservations);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('@reservations');
        if (stored) setReservations(JSON.parse(stored));
      } catch (_) {}
      finally { setLoaded(true); }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem('@reservations', JSON.stringify(reservations)).catch(() => {});
  }, [reservations, loaded]);

  const addReservation = (res) => {
    const newRes = { ...res, id: `r${Date.now()}`, status: 'confirmed' };
    setReservations((prev) => [...prev, newRes]);
    return newRes;
  };

  const cancelReservation = (id) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
    );
  };

  const updateReservationStatus = (id, status) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  return (
    <ReservationContext.Provider
      value={{ reservations, addReservation, cancelReservation, updateReservationStatus, loaded }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationContext);
  if (!ctx) {
    throw new Error('useReservations must be used inside a <ReservationProvider>.');
  }
  return ctx;
}
