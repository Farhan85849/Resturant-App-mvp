// src/hooks/useApi.js
// Generic data-fetching hook used across the app.
// Returns { data, loading, error, refetch } for any API call.

import { useState, useEffect, useCallback } from 'react';

/**
 * useApi - custom hook for fetching data from the backend.
 *
 * @param {Function} fetchFn - an async function that returns data (must be stable or memoized)
 * @param {any[]} deps - dependency array (re-fetch when these change)
 * @returns {{ data: any, loading: boolean, error: string|null, refetch: Function }}
 */
export default function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

