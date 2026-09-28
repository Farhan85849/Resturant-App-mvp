// src/context/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';
import { lightTheme, darkTheme } from '../theme/colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a <ThemeProvider>. Check your provider tree.');
  }
  return ctx;
}
