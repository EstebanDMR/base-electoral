import { useState, useEffect } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { observeAuthState } from '../authService';

export const useVotantesData = () => {
  const [votantes, setVotantes] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [firebaseUser, setFirebaseUser] = useState(null);
  
  // Jerarquía Multi-Tenant
  const [isAdmin, setIsAdmin] = useState(false);
  const [tenantId, setTenantId] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. Observar Auth
  useEffect(() => {
    const unsubAuth = observeAuthState((user) => {
      setFirebaseUser(user);
    });
    return () => unsubAuth();
  }, []);

  // 2. Resolver Roles y TenantID
  useEffect(() => {
    if (!firebaseUser) {
      setIsAdmin(false);
      setTenantId(null);
      setIsLoadingData(false);
      return;
    }

    const roleRef = ref(database, `user_roles/${firebaseUser.uid}`);
    const unsubRole = onValue(roleRef, (snap) => {
      if (snap.exists()) {
         const data = snap.val();
         setIsAdmin(data.role === 'admin');
         setTenantId(data.tenantId);
      }
      // NOTA CRÍTICA: NO AUTO-PROVISIONAR ABSOLUTAMENTE NADA AQUÍ.
      // Si la cuenta no tiene rol (porque recién se está creando o porque falló),
      // dejamos que el flujo lo resuelva. Cualquier escritura aquí causa
      // colisión con el registro de authService.js y !data.exists()
    }, (error) => {
      console.error("Error leyendo rol:", error);
    });

    return () => unsubRole();
  }, [firebaseUser]);

  // 3. Cargar la base de datos del Tenant correspondiente
  useEffect(() => {
    if (!tenantId) {
      setVotantes([]);
      setLideres([]);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    const votantesRef = ref(database, `usuarios/${tenantId}/votantes`);
    const lideresRef = ref(database, `usuarios/${tenantId}/lideres`);

    let loadedV = false;
    let loadedL = false;

    const checkLoaded = () => {
      if (loadedV && loadedL) setIsLoadingData(false);
    };

    const unsubV = onValue(votantesRef, snap => {
      const d = snap.val();
      setVotantes(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
      loadedV = true;
      checkLoaded();
    });
    
    const unsubL = onValue(lideresRef, snap => {
      const d = snap.val();
      setLideres(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
      loadedL = true;
      checkLoaded();
    });

    return () => { unsubV(); unsubL(); };
  }, [tenantId, firebaseUser]);


  // --- MÉTODOS DE BASE DE DATOS CENTRALIZADOS --- //
  
  const getBasePath = (collection) => {
    if (!tenantId) throw new Error("Acción denegada: No perteneces a un equipo (Tenant ID vacío).");
    return `usuarios/${tenantId}/${collection}`;
  };

  const validarPermisoAdmin = () => {
    if (!isAdmin) throw new Error("Acción denegada: Solo los administradores pueden realizar alteraciones estructurales.");
  };

  const validarVotante = (datos, idAExcluir = null) => {
    if (!datos.nombreCompleto || String(datos.nombreCompleto).trim().length < 3) throw new Error("El nombre completo es obligatorio.");
    if (!datos.documento || String(datos.documento).trim() === '') throw new Error("El documento es obligatorio.");
    
    const dup = votantes.find(v => v.documento === String(datos.documento).trim() && v.id !== idAExcluir);
    if (dup) throw new Error(`Esta cédula ya está registrada a nombre de: ${dup.nombreCompleto}`);
  };

  const validarLider = (datos) => {
    if (!datos.nombre || String(datos.nombre).trim().length < 3) throw new Error("El nombre del líder es obligatorio.");
  };

  // --- ACCIONES VOTANTES --- //
  const agregarVotante = async (nuevoVotante) => {
    validarPermisoAdmin();
    validarVotante(nuevoVotante);
    await set(push(ref(database, getBasePath('votantes'))), { ...nuevoVotante, yaVoto: false, fechaRegistro: new Date().toISOString() });
  };

  const editarVotante = async (id, datosEditados) => {
    validarPermisoAdmin();
    validarVotante(datosEditados, id);
    await update(ref(database, `${getBasePath('votantes')}/${id}`), datosEditados);
  };

  const eliminarVotante = async (id) => {
    validarPermisoAdmin();
    await remove(ref(database, `${getBasePath('votantes')}/${id}`));
  };

  const eliminarTodosLosVotantes = async () => {
    validarPermisoAdmin();
    await remove(ref(database, getBasePath('votantes')));
  };

  const toggleYaVoto = async (id, estadoActual) => {
    // Both Admin and Colaborador can update the yaVoto status
    await update(ref(database, `${getBasePath('votantes')}/${id}`), { yaVoto: !estadoActual });
  };

  // --- ACCIONES LÍDERES --- //
  const agregarLider = async (nuevoLider) => {
    validarPermisoAdmin();
    validarLider(nuevoLider);
    await set(push(ref(database, getBasePath('lideres'))), { ...nuevoLider, fechaRegistro: new Date().toISOString() });
  };

  const editarLider = async (id, datosEditados) => {
    validarPermisoAdmin();
    validarLider(datosEditados);
    await update(ref(database, `${getBasePath('lideres')}/${id}`), datosEditados);
  };

  const eliminarLider = async (id) => {
    validarPermisoAdmin();
    await remove(ref(database, `${getBasePath('lideres')}/${id}`));
  };

  return { 
    votantes, 
    lideres, 
    firebaseUser,
    isLoadingData,
    isAdmin,
    tenantId,
    agregarVotante,
    editarVotante,
    eliminarVotante,
    eliminarTodosLosVotantes,
    toggleYaVoto,
    agregarLider,
    editarLider,
    eliminarLider
  };
};
