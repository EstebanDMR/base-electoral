import { auth, database } from './firebase';
import { ref, set, get } from 'firebase/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';

/**
 * Registra un usuario nuevo con email y contraseña en Firebase Auth.
 * Si es colaborador, valida el teamCode DESPUÉS de crear la cuenta (cuando ya hay auth)
 * y ANTES de guardar el rol. Si la validación falla, borra la cuenta recién creada.
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña (mínimo 6 caracteres)
 * @param {string} role - 'admin' o 'colaborador'
 * @param {string} tenantId - ID del equipo (solo si role === 'colaborador')
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const registerUser = async (email, password, role = 'admin', tenantId = null) => {
  // 1. Crear la cuenta en Firebase Auth (esto autentica al usuario inmediatamente)
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  try {
    // FIX MÁGICO: Firebase RTDB usa un WebSocket independiente de FirebaseAuth.
    // Aunque Auth ya diga que el usuario existe, el WebSocket de RTDB tarda unos 
    // milisegundos en enviar el nuevo token de sesión al backend.
    // Si escribimos INMEDIATAMENTE, RTDB evalúa auth == null y lanza "Permission denied".
    await userCredential.user.getIdToken(true); // Fuerza la consolidación del token
    await new Promise(resolve => setTimeout(resolve, 1000)); // Da tiempo al WebSocket de RTDB para hacer el handshake

    // 2. Si es colaborador, validar que el código de equipo sea real y pertenezca a un admin
    if (role === 'colaborador') {
      if (!tenantId || tenantId.trim() === '') {
        throw new Error("Debes proporcionar un código de equipo válido.");
      }
      const adminSnap = await get(ref(database, `user_roles/${tenantId.trim()}`));
      if (!adminSnap.exists() || adminSnap.val().role !== 'admin') {
        throw new Error("El código proporcionado no es válido o no pertenece a una cuenta Administradora.");
      }
    }

    const finalTenantId = role === 'admin' ? uid : tenantId.trim();

    // 3. Guardar el rol en Firebase RTDB
    try {
      await set(ref(database, `user_roles/${uid}`), {
        role,
        tenantId: finalTenantId
      });
      console.log('Usuario registrado y perfil creado:', { uid, role, tenantId: finalTenantId });
    } catch (dbError) {
      console.error('Fallo al guardar rol localmente por WebSocket. Dependeremos del auto-provisionamiento futuro.', dbError);
    }
    
    return userCredential;

  } catch (validationError) {
    if (userCredential && userCredential.user && validationError.code !== 'PERMISSION_DENIED') {
       try { await deleteUser(userCredential.user); } catch (e) {}
    }
    throw validationError;
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
    const uid = userCredential.user.uid;

    // Auto-provisionar cuentas legacy (creadas antes del sistema de roles)
    const roleSnap = await get(ref(database, `user_roles/${uid}`));
    if (!roleSnap.exists()) {
      console.log('Cuenta legacy detectada. Auto-provisionando como admin...');
      await set(ref(database, `user_roles/${uid}`), {
        role: 'admin',
        tenantId: uid
      });
    }

    return userCredential;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.code, error.message);
    throw error;
  }
};

/**
 * Cierra la sesión activa del usuario.
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log('✅ Sesión cerrada.');
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error.code, error.message);
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
