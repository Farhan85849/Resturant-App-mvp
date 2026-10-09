// src/api/client.js
// Central API client — BASE_URL is the only place to update the server address.
// When running on a physical phone, use your laptop's LAN IP (e.g. http://192.168.1.15:5000).
// When running on the Android emulator, use http://10.0.2.2:5000.
// For web (browser on same machine), http://localhost:5000 works.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'http://192.168.1.15:5000'; // ← Change this to your laptop's IP

/**
 * apiFetch — a thin wrapper around fetch that:
 *  - Sets Content-Type: application/json
 *  - Reads the stored JWT and adds Authorization: Bearer <token>
 *  - Throws an Error with the server's message on non-2xx responses
 */
export async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Parse the body (always JSON from our server)
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = data.message || `Request failed with status ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

