import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, get, update } from 'firebase/database';
import { database } from '../firebase';
import { observeAuthState } from '../authService';
import { firebaseService } from '../services/firebaseService';

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

  // Pagination
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

    // Role realtime (necesario para detectar cambios de tenant o baneos)
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

  // 3. Cargar datos iniciales
  useEffect(() => {
    if (!tenantId) {
      setVotantes([]);
      setLideres([]);
      setIsLoadingData(false);
      setAccessDenied(false);
      return;
    }

    const loadInitialData = async () => {
        setIsLoadingData(true);
        setAccessDenied(false);
        try {
            const [votantesIniciales, lideresIniciales] = await Promise.all([
                firebaseService.fetchVotantesPaginados(tenantId, 20, null),
                firebaseService.getLideres(tenantId)
            ]);
            setVotantes(votantesIniciales);
            setLideres(lideresIniciales);
            setHasMore(votantesIniciales.length === 20); // asumiendo pageSize 20
        } catch (error) {
            if (error.code === 'PERMISSION_DENIED' || error.message.includes('permission_denied')) {
                setAccessDenied(true);
            }
            console.error(error);
        } finally {
            setIsLoadingData(false);
        }
    };
    
    loadInitialData();
  }, [tenantId, accessToken]);

  const loadMoreVotantes = useCallback(async () => {
    if (!tenantId || !hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
        const lastVotante = votantes[votantes.length - 1];
        if (!lastVotante) return;
        
        // Obtenemos 20 adicionales, el primero podría solaparse dependiendo de la lógica de startAt
        // Usamos lastVotante.nombre_normalizado
        const nuevos = await firebaseService.fetchVotantesPaginados(tenantId, 21, lastVotante.nombre_normalizado);
        
        // Si hay solapamiento (el registro existe), lo evitamos
        const filtrados = nuevos.filter(n => !votantes.find(v => v.id === n.id));
        
        setVotantes(prev => [...prev, ...filtrados]);
        setHasMore(nuevos.length >= 21);
    } catch (e) {
        console.error("Error paginando:", e);
    } finally {
        setIsLoadingMore(false);
    }
  }, [tenantId, votantes, hasMore, isLoadingMore]);


  const validarPermisoAdmin = () => {
    if (!isAdmin) throw new Error("Acción denegada: Solo los administradores pueden realizar alteraciones estructurales.");
  };



  // --- Wrapper CRUD usando Service --- //
  
  const agregarVotante = async (nuevoVotante) => {
    validarPermisoAdmin();
    // Reemplaza fetch completo con actualización local (Optimista)
    await firebaseService.agregarVotante(tenantId, nuevoVotante);
    // Para simplificar, re-cargamos la primera página
    const recargados = await firebaseService.fetchVotantesPaginados(tenantId, 20);
    setVotantes(recargados);
  };

  const editarVotante = async (id, datosEditados) => {
    validarPermisoAdmin();
    await firebaseService.editarVotante(tenantId, id, datosEditados);
    setVotantes(prev => prev.map(v => v.id === id ? { ...v, ...datosEditados } : v));
  };

  const eliminarVotante = async (id) => {
    validarPermisoAdmin();
    await firebaseService.eliminarVotante(tenantId, id);
    setVotantes(prev => prev.filter(v => v.id !== id));
  };

  const eliminarTodosLosVotantes = async () => {
    validarPermisoAdmin();
    await firebaseService.eliminarTodosLosVotantes(tenantId);
    setVotantes([]);
  };

  const toggleYaVoto = async (id, estadoActual) => {
    await firebaseService.toggleYaVoto(tenantId, id, estadoActual);
    setVotantes(prev => prev.map(v => v.id === id ? { ...v, yaVoto: !estadoActual } : v));
  };

  const agregarLider = async (nuevoLider) => {
    validarPermisoAdmin();
    await firebaseService.agregarLider(tenantId, nuevoLider);
    const updLideres = await firebaseService.getLideres(tenantId);
    setLideres(updLideres);
  };

  const editarLider = async (id, datosEditados) => {
    validarPermisoAdmin();
    await firebaseService.editarLider(tenantId, id, datosEditados);
    const updLideres = await firebaseService.getLideres(tenantId);
    setLideres(updLideres);
  };

  const eliminarLider = async (id) => {
    validarPermisoAdmin();
    await firebaseService.eliminarLider(tenantId, id);
    setLideres(prev => prev.filter(l => l.id !== id));
  };

  const vincularAEquipo = async (codigoInput) => {
    const rawCode = codigoInput.trim().toLowerCase();
    if (!rawCode) throw new Error("Código vacío");

    let targetAdminUid = rawCode;
    const aliasSnap = await get(ref(database, `team_aliases/${rawCode}`));
    if (aliasSnap.exists()) {
        targetAdminUid = aliasSnap.val().owner;
    }

    const adminSnap = await get(ref(database, `user_roles/${targetAdminUid}`));
    if (!adminSnap.exists() || adminSnap.val().role !== 'admin') {
        throw new Error("El código de equipo no es válido.");
    }

    await update(ref(database, `user_roles/${firebaseUser.uid}`), {
        role: 'colaborador',
        tenantId: targetAdminUid,
        accessToken: rawCode
    });
  };

  const crearAliasEquipo = async (aliasRaw) => {
    if (!isAdmin) throw new Error("Acceso denegado.");
    const validAliasRegex = /^[a-zA-Z0-9]+$/;
    if (!validAliasRegex.test(aliasRaw)) throw new Error("Formato inválido.");

    const aliasLimpiado = aliasRaw.trim().toLowerCase();
    const snap = await get(ref(database, `team_aliases/${aliasLimpiado}`));
    if (snap.exists()) throw new Error("Código en uso.");

    try {
        const payload = {
            [`team_aliases/${aliasLimpiado}/owner`]: firebaseUser.uid,
            [`team_aliases/${aliasLimpiado}/createdAt`]: new Date().toISOString(),
            [`user_roles/${firebaseUser.uid}/teamAlias`]: aliasLimpiado
        };
        if (teamAlias) payload[`team_aliases/${teamAlias}`] = null;
        await update(ref(database), payload);
        setTeamAlias(aliasLimpiado);
    } catch (e) {
        throw new Error("Error registrando código.");
    }
  };

  const generarVotantesDePrueba = async () => {
    validarPermisoAdmin();
    await firebaseService.generarVotantesDePrueba(tenantId, lideres);
    // Recargar la primera página tras generar datos
    const recargados = await firebaseService.fetchVotantesPaginados(tenantId, 20);
    setVotantes(recargados);
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
    paginacion: { hasMore, isLoadingMore, loadMoreVotantes, setVotantes },
    agregarVotante,
    editarVotante,
    eliminarVotante,
    eliminarTodosLosVotantes,
    toggleYaVoto,
    agregarLider,
    editarLider,
    eliminarLider,
    vincularAEquipo,
    crearAliasEquipo,
    generarVotantesDePrueba
  };
};
