// src/api/client.js
// Central API client — automatically resolves backend server address
// Works seamlessly across Web, Physical Phone (Expo Go), and Emulators

import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Live Production Backend URL (Hosted on Railway)
const PRODUCTION_API_URL = 'https://resturant-app-mvp-production.up.railway.app';

export const getBaseUrl = () => {
  return PRODUCTION_API_URL;
};

export const BASE_URL = getBaseUrl();

/**
 * apiFetch — a thin wrapper around fetch that:
 *  - Dynamically resolves backend base URL
 *  - Sets Content-Type: application/json
 *  - Reads stored JWT and adds Authorization: Bearer <token>
 *  - Throws an Error with server's message on non-2xx responses
 */
export async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('token');
  const baseUrl = getBaseUrl();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  // Parse body (always JSON from server)
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = data.message || `Request failed with status ${response.status}`;
    throw new Error(msg);
  }

  return data;
}
