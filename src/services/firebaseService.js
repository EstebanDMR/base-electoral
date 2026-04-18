import { ref, push, set, update, remove, get, query, orderByChild, limitToFirst, startAt, endAt } from 'firebase/database';
import { database } from '../firebase';
import { normalizeText } from '../utils/text';

const getBasePath = (tenantId, collection) => `usuarios/${tenantId}/${collection}`;

export const firebaseService = {
  // LECTURA COMPLETA
  fetchAllVotantes: async (tenantId) => {
    if (!tenantId) return [];
    const votantesRef = ref(database, getBasePath(tenantId, 'votantes'));
    const consulta = query(votantesRef, orderByChild('nombre_normalizado'));
    const snap = await get(consulta);
    
    if (!snap.exists()) return [];
    const d = snap.val();
    return Object.keys(d).map(k => ({ id: k, ...d[k] })).sort((a, b) => (a.nombre_normalizado || "").localeCompare(b.nombre_normalizado || ""));
  },

  // BÚSQUEDA
  buscarVotantes: async (tenantId, searchQuery, pageSize = 20) => {
    if (!tenantId || !searchQuery) return [];
    const minizado = normalizeText(searchQuery);
    const votantesRef = ref(database, getBasePath(tenantId, 'votantes'));
    const consulta = query(
      votantesRef,
      orderByChild('nombre_normalizado'),
      startAt(minizado),
      endAt(minizado + "\uf8ff"),
      limitToFirst(pageSize)
    );
    const snap = await get(consulta);
    if (!snap.exists()) return [];
    const d = snap.val();
    return Object.keys(d).map(k => ({ id: k, ...d[k] }));
  },

  // LÍDERES
  getLideres: async (tenantId) => {
    if (!tenantId) return [];
    const snap = await get(ref(database, getBasePath(tenantId, 'lideres')));
    if (!snap.exists()) return [];
    const d = snap.val();
    return Object.keys(d).map(k => ({ id: k, ...d[k] }));
  },

  // CRUD VOTANTES
  agregarVotante: async (tenantId, datos) => {
    const normalizado = normalizeText(datos.nombreCompleto);
    const payload = { ...datos, nombre_normalizado: normalizado, yaVoto: false, fechaRegistro: new Date().toISOString() };
    await set(push(ref(database, getBasePath(tenantId, 'votantes'))), payload);
  },

  editarVotante: async (tenantId, id, datos) => {
    if (datos.nombreCompleto) {
      datos.nombre_normalizado = normalizeText(datos.nombreCompleto);
    }
    await update(ref(database, `${getBasePath(tenantId, 'votantes')}/${id}`), datos);
  },

  eliminarVotante: async (tenantId, id) => {
    await remove(ref(database, `${getBasePath(tenantId, 'votantes')}/${id}`));
  },

  eliminarTodosLosVotantes: async (tenantId) => {
    await remove(ref(database, getBasePath(tenantId, 'votantes')));
  },

  toggleYaVoto: async (tenantId, id, estadoActual) => {
    await update(ref(database, `${getBasePath(tenantId, 'votantes')}/${id}`), { yaVoto: !estadoActual });
  },

  // CRUD LÍDERES
  agregarLider: async (tenantId, datos) => {
    await set(push(ref(database, getBasePath(tenantId, 'lideres'))), { ...datos, fechaRegistro: new Date().toISOString() });
  },

  editarLider: async (tenantId, id, datos) => {
    await update(ref(database, `${getBasePath(tenantId, 'lideres')}/${id}`), datos);
  },

  eliminarLider: async (tenantId, id) => {
    await remove(ref(database, `${getBasePath(tenantId, 'lideres')}/${id}`));
  },

  // PRUEBAS
  generarVotantesDePrueba: async (tenantId, lideres) => {
    const basePath = getBasePath(tenantId, 'votantes');
    const payload = {};
    
    const nombres = ['Andrés', 'Juan', 'Carlos', 'Diego', 'Alejandro', 'Felipe', 'Santiago', 'David', 'Camilo', 'José', 'María', 'Ana', 'Laura', 'Valentina', 'Isabella', 'Daniela', 'Camila', 'Sofía', 'Mariana', 'Natalia', 'Miguel', 'Luis', 'Pedro', 'Pablo', 'Mateo', 'Sebastián', 'Samuel', 'Nicolás', 'Martín', 'Gabriel'];
    const apellidos = ['García', 'Martínez', 'Rodríguez', 'López', 'Hernández', 'Pérez', 'González', 'Gómez', 'Sánchez', 'Díaz', 'Ramírez', 'Álvarez', 'Fernández', 'Torres', 'Suárez', 'Jiménez', 'Ruiz', 'Castro', 'Vargas', 'Rojas', 'Osorio', 'Ríos', 'Morales', 'Herrera', 'Muñoz', 'Cárdenas', 'Gutiérrez', 'Navarro', 'Quintero', 'Rendón'];
    const puestos = ['Fátima', 'San Juan Bosco', 'Simón Bolívar', 'Santa Rita', 'San José'];
    const liderIds = lideres.map(l => l.id);

    for (let i = 0; i < 1000; i++) {
        const key = push(ref(database, basePath)).key;
        
        const nombreAleatorio = nombres[Math.floor(Math.random() * nombres.length)];
        const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
        let apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
        if (apellido1 === apellido2) {
            apellido2 = apellidos[(apellidos.indexOf(apellido2) + 1) % apellidos.length];
        }
        
        const nombreC = `${nombreAleatorio} ${apellido1} ${apellido2}`;
        const telefono = '3' + Math.floor(Math.random() * 900000000 + 100000000).toString();
        const documento = (1000000000 + i).toString();
        const puesto = puestos[Math.floor(Math.random() * puestos.length)];
        const mesa = String(Math.floor(Math.random() * 10) + 1);
        const lider = liderIds.length > 0 ? liderIds[Math.floor(Math.random() * liderIds.length)] : '';

        payload[`${basePath}/${key}`] = {
            nombreCompleto: nombreC,
            nombre_normalizado: normalizeText(nombreC),
            documento: documento,
            telefono: telefono,
            direccion: `Calle ${Math.floor(Math.random() * 100 + 1)} #${Math.floor(Math.random() * 100 + 1)}-${Math.floor(Math.random() * 100 + 1)}`,
            barrio: 'Centro',
            municipio: 'Ciudad',
            mesa: mesa,
            puesto: puesto,
            liderAsignado: lider,
            yaVoto: Math.random() > 0.5,
            fechaRegistro: new Date().toISOString()
        };
    }
    await update(ref(database), payload);
  }
};
