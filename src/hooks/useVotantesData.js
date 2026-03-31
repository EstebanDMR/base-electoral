import { useState, useEffect } from 'react';
import { ref, onValue, push, set, update, remove, get } from 'firebase/database';
import { database } from '../firebase';
import { observeAuthState } from '../authService';

export const useVotantesData = () => {
  const [votantes, setVotantes] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [firebaseUser, setFirebaseUser] = useState(null);
  
  // Jerarquía Multi-Tenant
  const [isAdmin, setIsAdmin] = useState(false);
  const [tenantId, setTenantId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [teamAlias, setTeamAlias] = useState(null);
  const [adminAlias, setAdminAlias] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

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
         setTeamAlias(data.teamAlias || null);
         setAccessToken(data.accessToken || null);
         
         if (data.role === 'colaborador') {
            setAdminAlias(data.accessToken || data.tenantId);
         } else {
            setAdminAlias(data.teamAlias || data.tenantId);
         }
      }
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
      setAccessDenied(false);
      return;
    }

    setIsLoadingData(true);
    setAccessDenied(false);
    const votantesRef = ref(database, `usuarios/${tenantId}/votantes`);
    const lideresRef = ref(database, `usuarios/${tenantId}/lideres`);

    let loadedV = false;
    let loadedL = false;

    const checkLoaded = () => {
      if (loadedV && loadedL) setIsLoadingData(false);
    };

    const unsubV = onValue(votantesRef, snap => {
      setAccessDenied(false);
      const d = snap.val();
      setVotantes(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
      loadedV = true;
      checkLoaded();
    }, (error) => {
      if (error.code === 'PERMISSION_DENIED') setAccessDenied(true);
      loadedV = true;
      checkLoaded();
    });
    
    const unsubL = onValue(lideresRef, snap => {
      setAccessDenied(false);
      const d = snap.val();
      setLideres(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
      loadedL = true;
      checkLoaded();
    }, (error) => {
      if (error.code === 'PERMISSION_DENIED') setAccessDenied(true);
      loadedL = true;
      checkLoaded();
    });

    return () => { unsubV(); unsubL(); };
  }, [tenantId, firebaseUser, accessToken]);


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

  const vincularAEquipo = async (codigoInput) => {
    const rawCode = codigoInput.trim().toLowerCase();
    if (!rawCode) throw new Error("Código vacío");

    let targetAdminUid = rawCode;

    // Buscar si es un alias
    const aliasSnap = await get(ref(database, `team_aliases/${rawCode}`));
    if (aliasSnap.exists()) {
        targetAdminUid = aliasSnap.val().owner;
    }

    // Verificar destino
    const adminSnap = await get(ref(database, `user_roles/${targetAdminUid}`));
    if (!adminSnap.exists() || adminSnap.val().role !== 'admin') {
        throw new Error("El código de equipo no es válido o no pertenece a un Administrador.");
    }

    // Guardar
    await update(ref(database, `user_roles/${firebaseUser.uid}`), {
        role: 'colaborador',
        tenantId: targetAdminUid,
        accessToken: rawCode
    });
  };

  const crearAliasEquipo = async (aliasRaw) => {
    if (!isAdmin) throw new Error("Solo los administradores pueden crear códigos de equipo.");
    
    // Solo letras y numeros, sin espacios
    const validAliasRegex = /^[a-zA-Z0-9]+$/;
    if (!validAliasRegex.test(aliasRaw)) {
        throw new Error("El código del equipo solo puede contener letras y números, sin espacios ni caracteres especiales.");
    }

    const aliasLimpiado = aliasRaw.trim().toLowerCase();

    // Comprobar si existe
    const aliasRef = ref(database, `team_aliases/${aliasLimpiado}`);
    const snap = await get(aliasRef);
    if (snap.exists()) {
        throw new Error("Ese código de equipo ya está en uso. Por favor, elige otro distinto.");
    }

    try {
        const payload = {
            [`team_aliases/${aliasLimpiado}/owner`]: firebaseUser.uid,
            [`team_aliases/${aliasLimpiado}/createdAt`]: new Date().toISOString(),
            [`user_roles/${firebaseUser.uid}/teamAlias`]: aliasLimpiado
        };
        
        // Si el admin ya tenía un alias y lo está re-escribiendo (rotando llave), liberamos el viejo
        if (teamAlias) {
            payload[`team_aliases/${teamAlias}`] = null;
        }

        await update(ref(database), payload);
        setTeamAlias(aliasLimpiado);
    } catch (e) {
        throw new Error("Hubo un error al registrar el código. Informa a soporte o revisa la red.");
    }
  };

  return { 
    votantes, 
    lideres, 
    firebaseUser,
    isLoadingData,
    isAdmin,
    tenantId,
    teamAlias,
    adminAlias,
    accessDenied,
    agregarVotante,
    editarVotante,
    eliminarVotante,
    eliminarTodosLosVotantes,
    toggleYaVoto,
    agregarLider,
    editarLider,
    eliminarLider,
    vincularAEquipo,
    crearAliasEquipo
  };
};
