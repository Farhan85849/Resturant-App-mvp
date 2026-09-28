// src/hooks/useDebounce.js
// Returns a debounced copy of `value` that updates only after `delay` ms of silence.
import { useState, useEffect } from 'react';

export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);   // cleanup cancels the timer on every new value
  }, [value, delay]);

  return debouncedValue;
}
