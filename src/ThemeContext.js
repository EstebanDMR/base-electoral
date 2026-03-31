import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentUserKey, setCurrentUserKey] = useState(null);

  // Cargar preferencia del usuario actual
  const loadUserTheme = useCallback((userEmail) => {
    if (userEmail) {
      const key = `darkMode_${userEmail}`;
      setCurrentUserKey(key);
      const saved = localStorage.getItem(key);
      setDarkMode(saved === 'true');
    } else {
      // Sin usuario = sin preferencia guardada, volver a light
      setCurrentUserKey(null);
      setDarkMode(false);
    }
  }, []);

  // Guardar cada vez que cambia
  useEffect(() => {
    if (currentUserKey) {
      localStorage.setItem(currentUserKey, JSON.stringify(darkMode));
    }
  }, [darkMode, currentUserKey]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, loadUserTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
