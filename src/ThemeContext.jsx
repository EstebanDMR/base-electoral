import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const DEVICE_KEY = 'darkMode_device';

export const ThemeProvider = ({ children }) => {
  // Inicializar con la preferencia del dispositivo (para el Login)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem(DEVICE_KEY) === 'true';
  });
  const [currentUserKey, setCurrentUserKey] = useState(null);

  // Cargar preferencia del usuario al iniciar sesión
  const loadUserTheme = useCallback((userEmail) => {
    if (userEmail) {
      const key = `darkMode_${userEmail}`;
      setCurrentUserKey(key);
      const saved = localStorage.getItem(key);
      // Si el usuario tiene preferencia guardada, usarla; si no, heredar la del dispositivo
      if (saved !== null) {
        setDarkMode(saved === 'true');
      }
    } else {
      // Cerró sesión: volver a la preferencia del dispositivo
      setCurrentUserKey(null);
      setDarkMode(localStorage.getItem(DEVICE_KEY) === 'true');
    }
  }, []);

  // Guardar cambios en la clave correcta
  useEffect(() => {
    if (currentUserKey) {
      // Dentro del dashboard: guardar por usuario
      localStorage.setItem(currentUserKey, JSON.stringify(darkMode));
    } else {
      // En el login: guardar por dispositivo
      localStorage.setItem(DEVICE_KEY, JSON.stringify(darkMode));
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
