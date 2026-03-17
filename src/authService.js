import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

/**
 * Registra un usuario nuevo con email y contraseña en Firebase Auth.
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña (mínimo 6 caracteres)
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Usuario registrado exitosamente:', {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      createdAt: userCredential.user.metadata.creationTime
    });
    return userCredential;
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error.code, error.message);
    throw error;
  }
};

/**
 * Inicia sesión con email y contraseña en Firebase Auth.
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Sesión iniciada exitosamente:', {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      lastLogin: userCredential.user.metadata.lastSignInTime
    });
    return userCredential;
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error.code, error.message);
    throw error;
  }
};

/**
 * Observa cambios en el estado de autenticación (login/logout).
 * @param {function} callback - Recibe el usuario (o null si no hay sesión)
 * @returns {function} Función para cancelar la suscripción
 */
export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('🔓 Sesión activa:', { uid: user.uid, email: user.email });
    } else {
      console.log('🔒 Sin sesión activa');
    }
    callback(user);
  });
};
