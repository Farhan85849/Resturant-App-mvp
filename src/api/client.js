// src/api/client.js
// Central API client — automatically resolves backend server address
// Works seamlessly across Web, Physical Phone (Expo Go), and Emulators

import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Known laptop fallback IP
const FALLBACK_IP = '192.168.100.150';

export const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return `http://${window.location.hostname}:5000`;
    }
    return 'http://localhost:5000';
  }

  // On physical mobile device with Expo Go:
  // Extract host IP dynamically from Metro bundle scriptURL
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const host = scriptURL.split('://')[1]?.split('/')[0]?.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5000`;
    }
  }

  return `http://${FALLBACK_IP}:5000`;
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
