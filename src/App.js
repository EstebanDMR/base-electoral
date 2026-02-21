import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, BarChart3, Eye, EyeOff } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove, update } from 'firebase/database';

// CONFIGURACIÓN DE FIREBASE
// ⚠️ REEMPLAZA ESTOS VALORES CON TU CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyACbhnT4AmukbRlRopBylUtDrNwGFivdCY",
  authDomain: "db-elecciones.firebaseapp.com",
  databaseURL: "https://db-elecciones-default-rtdb.firebaseio.com",
  projectId: "db-elecciones",
  storageBucket: "db-elecciones.firebasestorage.app",
  messagingSenderId: "290500592153",
  appId: "1:290500592153:web:c0382f5a920fdda0b9a088"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const VotantesDB = () => {
  // Estado inicial
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Datos
  const [votantes, setVotantes] = useState([]);
  const [lideres, setLideres] = useState([]);
  
  // Formularios
  const [nuevoVotante, setNuevoVotante] = useState({
    nombreCompleto: '',
    documento: '',
    telefono: '',
    direccion: '',
    barrio: '',
    municipio: '',
    mesa: '',
    puesto: '',
    liderAsignado: ''
  });
  
  const [nuevoLider, setNuevoLider] = useState({
    nombre: '',
    telefono: '',
    zona: ''
  });
  
  // Filtros y búsqueda
  const [filtroLider, setFiltroLider] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('votantes');

  // Exportar a Excel
  const exportarAExcel = () => {
    // Crear encabezados
    const encabezados = ['Nombre', 'Documento', 'Teléfono', 'Dirección', 'Barrio', 'Municipio', 'Mesa', 'Puesto', 'Líder', '¿Ya votó?'];
    
    // Crear filas con los datos
    const filas = votantes.map(votante => {
      const lider = lideres.find(l => l.id === votante.liderAsignado);
      return [
        votante.nombreCompleto,
        votante.documento,
        votante.telefono,
        votante.direccion,
        votante.barrio,
        votante.municipio,
        votante.mesa,
        votante.puesto,
        lider ? lider.nombre : '-',
        votante.yaVoto ? 'Sí' : 'No'
      ];
    });
    
    // Crear CSV
    const csvContent = [
      encabezados.join(','),
      ...filas.map(fila => fila.map(campo => `"${campo || ''}"`).join(','))
    ].join('\n');
    
    // Crear y descargar archivo
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `votantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Edición de votante
  const [editandoVotante, setEditandoVotante] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState(null);
  
 // Edición de líder
  const [editandoLider, setEditandoLider] = useState(null);
  const [datosEdicionLider, setDatosEdicionLider] = useState(null);

  // Mensajes de error
  const [mensajeError, setMensajeError] = useState(null);

  // Cargar datos de Firebase en tiempo real
  useEffect(() => {
    // Escuchar cambios en votantes
    const votantesRef = ref(database, 'votantes');
    const unsubscribeVotantes = onValue(votantesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const votantesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setVotantes(votantesArray);
      } else {
        setVotantes([]);
      }
    });

    // Escuchar cambios en líderes
    const lideresRef = ref(database, 'lideres');
    const unsubscribeLideres = onValue(lideresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lideresArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setLideres(lideresArray);
      } else {
        setLideres([]);
      }
    });

    // Cleanup
    return () => {
      unsubscribeVotantes();
      unsubscribeLideres();
    };
  }, []);

  // Login
  const handleLogin = () => {
    if (password === 'admin2025') {
      setIsAdmin(true);
      setPassword('');
    } else {
      window.alert('Contraseña incorrecta');
    }
  };

  // Agregar votante
  const agregarVotante = async () => {
    setMensajeError(null);
    
    if (!nuevoVotante.nombreCompleto || !nuevoVotante.documento) {
      setMensajeError('Nombre y documento son obligatorios');
      return;
    }

    // Verificar duplicados
    const votanteExistente = votantes.find(v => v.documento === nuevoVotante.documento);
    if (votanteExistente) {
      setMensajeError(`Esta cédula ya está registrada a nombre de: ${votanteExistente.nombreCompleto} (Cédula: ${votanteExistente.documento})`);
      return;
    }

    const votantesRef = ref(database, 'votantes');
    const nuevoVotanteRef = push(votantesRef);
    
    await set(nuevoVotanteRef, {
      ...nuevoVotante,
      yaVoto: false,
      fechaRegistro: new Date().toISOString()
    });

    setNuevoVotante({
      nombreCompleto: '',
      documento: '',
      telefono: '',
      direccion: '',
      barrio: '',
      municipio: '',
      mesa: '',
      puesto: '',
      liderAsignado: ''
    });
  };

  // Agregar líder
  const agregarLider = async () => {
    if (!nuevoLider.nombre) {
      window.alert('El nombre del líder es obligatorio');
      return;
    }

    const lideresRef = ref(database, 'lideres');
    const nuevoLiderRef = push(lideresRef);
    
    await set(nuevoLiderRef, {
      ...nuevoLider,
      fechaRegistro: new Date().toISOString()
    });

    setNuevoLider({ nombre: '', telefono: '', zona: '' });
  };

  // Eliminar votante
  const eliminarVotante = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este votante?')) {
      const votanteRef = ref(database, `votantes/${id}`);
      await remove(votanteRef);
    }
  };
  
  // Iniciar edición de votante
  const iniciarEdicion = (votante) => {
    setEditandoVotante(votante.id);
    setDatosEdicion({...votante});
    setMensajeError(null);
  };
  
  // Guardar edición de votante
  const guardarEdicion = async () => {
    setMensajeError(null);
    
    if (!datosEdicion.nombreCompleto || !datosEdicion.documento) {
      setMensajeError('Nombre y documento son obligatorios');
      return;
    }
    
    // Verificar duplicados (excepto el mismo votante)
    const votanteExistente = votantes.find(v => v.documento === datosEdicion.documento && v.id !== editandoVotante);
    if (votanteExistente) {
      setMensajeError(`Esta cédula ya está registrada a nombre de: ${votanteExistente.nombreCompleto} (Cédula: ${votanteExistente.documento})`);
      return;
    }
    
    const votanteRef = ref(database, `votantes/${editandoVotante}`);
    const { id, ...datosParaGuardar } = datosEdicion;
    await update(votanteRef, datosParaGuardar);
    
    setEditandoVotante(null);
    setDatosEdicion(null);
  };
  
  // Cancelar edición
  const cancelarEdicion = () => {
    setEditandoVotante(null);
    setDatosEdicion(null);
    setMensajeError(null);
  };
  
   // Marcar/desmarcar que ya votó
  const toggleYaVoto = async (id) => {
    const votante = votantes.find(v => v.id === id);
    if (votante) {
      // Si ya votó y quiere desmarcar, solo admin puede hacerlo
      if (votante.yaVoto && !isAdmin) {
        window.alert('Solo el administrador puede desmarcar un voto');
        return;
      }
      
      const votanteRef = ref(database, `votantes/${id}`);
      await update(votanteRef, { yaVoto: !votante.yaVoto });
    }
  };

  // Eliminar líder
  const eliminarLider = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este líder?')) {
      const liderRef = ref(database, `lideres/${id}`);
      await remove(liderRef);
    }
  };
  
  // Iniciar edición de líder
  const iniciarEdicionLider = (lider) => {
    setEditandoLider(lider.id);
    setDatosEdicionLider({...lider});
  };
  
  // Guardar edición de líder
  const guardarEdicionLider = async () => {
    if (!datosEdicionLider.nombre) {
      window.alert('El nombre del líder es obligatorio');
      return;
    }
    
    const liderRef = ref(database, `lideres/${editandoLider}`);
    const { id, ...datosParaGuardar } = datosEdicionLider;
    await update(liderRef, datosParaGuardar);
    
    setEditandoLider(null);
    setDatosEdicionLider(null);
  };
  
  // Cancelar edición de líder
  const cancelarEdicionLider = () => {
    setEditandoLider(null);
    setDatosEdicionLider(null);
  };

  // Filtrar votantes
  const votantesFiltrados = votantes.filter(v => {
    const matchBusqueda = v.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
                          v.documento.includes(busqueda);
    const matchLider = !filtroLider || v.liderAsignado === filtroLider;
    return matchBusqueda && matchLider;
  });

  // Estadísticas
  const stats = {
    totalVotantes: votantes.length,
    totalLideres: lideres.length,
    yaVotaron: votantes.filter(v => v.yaVoto).length,
    votantesPorLider: lideres.map(lider => {
      const votantesDelLider = votantes.filter(v => v.liderAsignado === lider.id);
      const yaVotaronDelLider = votantesDelLider.filter(v => v.yaVoto).length;
      return {
        nombre: lider.nombre,
        cantidad: votantesDelLider.length,
        yaVotaron: yaVotaronDelLider,
        faltan: votantesDelLider.length - yaVotaronDelLider
      };
    })
  };

  // Verificar permisos de edición
  const puedeEditar = isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Base de Datos Electoral</h1>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                🌐 En vivo
              </span>
            </div>
          </div>

          {/* Login / Status */}
          {!isAdmin ? (
            <div className="flex gap-3 items-center flex-wrap">
              <div className="relative flex-1 max-w-md min-w-[200px]">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Contraseña de administrador"
                  autoComplete="off"          // ← NUEVO: Evita que el navegador autocomplete
                  autoCorrect="off"            // ← NUEVO: Desactiva corrección automática en móviles
                  autoCapitalize="off"         // ← NUEVO: Evita mayúsculas automáticas en móviles
                  spellCheck="false"           // ← NUEVO: Desactiva corrector ortográfico
                  inputMode="text"             // ← NUEVO: Le dice al móvil qué tipo de teclado mostrar
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={handleLogin}
                type="button"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap"
              >
                Entrar como Admin
              </button>
              <span className="text-sm text-gray-600 ml-3 w-full sm:w-auto">
                👤 Rol: Usuario
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-semibold flex items-center gap-2">
                ✓ Rol: Administrador
              </span>
              <button
                onClick={() => setIsAdmin(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setVistaActual('votantes')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                vistaActual === 'votantes'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              👥 Votantes ({votantes.length})
            </button>
            <button
              onClick={() => setVistaActual('lideres')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                vistaActual === 'lideres'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔍 Búsqueda
            </button>
            <button
              onClick={() => setVistaActual('lideres')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                vistaActual === 'lideres'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}  
            >
              🎯 Líderes ({lideres.length})
            </button>
            <button
              onClick={() => setVistaActual('estadisticas')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                vistaActual === 'estadisticas'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📊 Estadísticas
            </button>
          </div>
        </div>

        {console.log('Vista actual:', vistaActual)}

        {/* Vista Votantes */}
        {vistaActual === 'votantes' && (
          <div className="space-y-6">
            {/* Mensaje de error */}
            {mensajeError && (
              <div className="bg-red-100 border-2 border-red-500 text-red-800 px-6 py-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⛔</span>
                  <span className="font-semibold">{mensajeError}</span>
                </div>
                <button
                  onClick={() => setMensajeError(null)}
                  className="text-red-600 hover:text-red-800 font-bold text-xl"
                >
                  ✕
                </button>
              </div>
            )}
            
            {/* Formulario nuevo votante */}
            {puedeEditar && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-indigo-600" />
                  Registrar Nuevo Votante
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre completo *"
                    value={nuevoVotante.nombreCompleto}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, nombreCompleto: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Documento (cédula) *"
                    value={nuevoVotante.documento}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, documento: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={nuevoVotante.telefono}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, telefono: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Dirección"
                    value={nuevoVotante.direccion}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, direccion: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Barrio"
                    value={nuevoVotante.barrio}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, barrio: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Municipio"
                    value={nuevoVotante.municipio}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, municipio: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Mesa de votación"
                    value={nuevoVotante.mesa}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, mesa: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Puesto de votación"
                    value={nuevoVotante.puesto}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, puesto: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={nuevoVotante.liderAsignado}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, liderAsignado: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Seleccionar líder</option>
                    {lideres.map(lider => (
                      <option key={lider.id} value={lider.id}>{lider.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={agregarVotante}
                  className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold w-full"
                >
                  ✓ Registrar Votante
                </button>
              </div>
            )}

            {/* Lista de votantes */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Nombre</th>
                      <th className="px-4 py-3 text-left">Documento</th>
                      <th className="px-4 py-3 text-left">Teléfono</th>
                      <th className="px-4 py-3 text-left">Barrio</th>
                      <th className="px-4 py-3 text-left">Mesa</th>
                      <th className="px-4 py-3 text-left">Líder</th>
                      <th className="px-4 py-3 text-center">¿Ya votó?</th>
                      <th className="px-4 py-3 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votantes.map((votante, idx) => (
                      <tr key={votante.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        {editandoVotante === votante.id ? (
                          // Modo edición
                          <>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={datosEdicion.nombreCompleto}
                                onChange={(e) => setDatosEdicion({...datosEdicion, nombreCompleto: e.target.value})}
                                className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={datosEdicion.documento}
                                onChange={(e) => setDatosEdicion({...datosEdicion, documento: e.target.value})}
                                className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none font-mono"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={datosEdicion.telefono}
                                onChange={(e) => setDatosEdicion({...datosEdicion, telefono: e.target.value})}
                                className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={datosEdicion.barrio}
                                onChange={(e) => setDatosEdicion({...datosEdicion, barrio: e.target.value})}
                                className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={datosEdicion.mesa}
                                onChange={(e) => setDatosEdicion({...datosEdicion, mesa: e.target.value})}
                                className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={datosEdicion.liderAsignado}
                                onChange={(e) => setDatosEdicion({...datosEdicion, liderAsignado: e.target.value})}
                                className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none"
                              >
                                <option value="">Sin líder</option>
                                {lideres.map(lider => (
                                  <option key={lider.id} value={lider.id}>{lider.nombre}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                votante.yaVoto 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {votante.yaVoto ? '✓ Votó' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={guardarEdicion}
                                  className="text-green-600 hover:text-green-800 font-semibold"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={cancelarEdicion}
                                  className="text-gray-600 hover:text-gray-800 font-semibold"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // Modo visualización
                          <>
                            <td className="px-4 py-3">{votante.nombreCompleto}</td>
                            <td className="px-4 py-3 font-mono">{votante.documento}</td>
                            <td className="px-4 py-3">{votante.telefono}</td>
                            <td className="px-4 py-3">{votante.barrio}</td>
                            <td className="px-4 py-3">{votante.mesa}</td>
                            <td className="px-4 py-3">
                              {lideres.find(l => l.id === votante.liderAsignado)?.nombre || '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleYaVoto(votante.id)}
                                className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                                  votante.yaVoto 
                                    ? 'bg-green-500 text-white hover:bg-green-600' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {votante.yaVoto ? '✓ Votó' : 'Marcar'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {puedeEditar && (
                                  <>
                                    <button
                                      onClick={() => iniciarEdicion(votante)}
                                      className="text-indigo-600 hover:text-indigo-800 font-semibold"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => eliminarVotante(votante.id)}
                                      className="text-red-600 hover:text-red-800 font-semibold"
                                    >
                                      Eliminar
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {votantes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No hay votantes registrados
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vista Búsqueda */}
        {vistaActual === 'busqueda' && (
          <div className="space-y-6">
            {/* Búsqueda y filtros */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Buscar Votantes</h2>
                <button
                  onClick={exportarAExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  📊 Exportar a Excel
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o documento..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <select
                  value={filtroLider}
                  onChange={(e) => setFiltroLider(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Todos los líderes</option>
                  {lideres.map(lider => (
                    <option key={lider.id} value={lider.id}>{lider.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resultados de búsqueda */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Nombre</th>
                      <th className="px-4 py-3 text-left">Documento</th>
                      <th className="px-4 py-3 text-left">Teléfono</th>
                      <th className="px-4 py-3 text-left">Barrio</th>
                      <th className="px-4 py-3 text-left">Mesa</th>
                      <th className="px-4 py-3 text-left">Líder</th>
                      <th className="px-4 py-3 text-center">¿Ya votó?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votantesFiltrados.map((votante, idx) => (
                      <tr key={votante.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3">{votante.nombreCompleto}</td>
                        <td className="px-4 py-3 font-mono">{votante.documento}</td>
                        <td className="px-4 py-3">{votante.telefono}</td>
                        <td className="px-4 py-3">{votante.barrio}</td>
                        <td className="px-4 py-3">{votante.mesa}</td>
                        <td className="px-4 py-3">
                          {lideres.find(l => l.id === votante.liderAsignado)?.nombre || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            votante.yaVoto 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {votante.yaVoto ? '✓ Votó' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {votantesFiltrados.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    {busqueda || filtroLider ? 'No se encontraron resultados' : 'No hay votantes registrados'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vista Líderes */}
        {vistaActual === 'lideres' && (
          <div className="space-y-6">
            {isAdmin && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar Nuevo Líder</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre del líder *"
                    value={nuevoLider.nombre}
                    onChange={(e) => setNuevoLider({...nuevoLider, nombre: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={nuevoLider.telefono}
                    onChange={(e) => setNuevoLider({...nuevoLider, telefono: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Zona / Sector"
                    value={nuevoLider.zona}
                    onChange={(e) => setNuevoLider({...nuevoLider, zona: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={agregarLider}
                  className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold w-full"
                >
                  ✓ Registrar Líder
                </button>
              </div>
            )}
          
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Teléfono</th>
                    <th className="px-4 py-3 text-left">Zona</th>
                    <th className="px-4 py-3 text-left">Votantes</th>
                    {puedeEditar && <th className="px-4 py-3 text-left">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {lideres.map((lider, idx) => (
                    <tr key={lider.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      {editandoLider === lider.id ? (
                        // Modo edición
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={datosEdicionLider.nombre}
                              onChange={(e) => setDatosEdicionLider({...datosEdicionLider, nombre: e.target.value})}
                              className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={datosEdicionLider.telefono}
                              onChange={(e) => setDatosEdicionLider({...datosEdicionLider, telefono: e.target.value})}
                              className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={datosEdicionLider.zona}
                              onChange={(e) => setDatosEdicionLider({...datosEdicionLider, zona: e.target.value})}
                              className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                              {votantes.filter(v => v.liderAsignado === lider.id).length}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={guardarEdicionLider}
                                className="text-green-600 hover:text-green-800 font-semibold"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={cancelarEdicionLider}
                                className="text-gray-600 hover:text-gray-800 font-semibold"
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // Modo visualización
                        <>
                          <td className="px-4 py-3 font-semibold">{lider.nombre}</td>
                          <td className="px-4 py-3">{lider.telefono}</td>
                          <td className="px-4 py-3">{lider.zona}</td>
                          <td className="px-4 py-3">
                            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                              {votantes.filter(v => v.liderAsignado === lider.id).length}
                            </span>
                          </td>
                          {puedeEditar && (
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => iniciarEdicionLider(lider)}
                                  className="text-indigo-600 hover:text-indigo-800 font-semibold"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => eliminarLider(lider.id)}
                                  className="text-red-600 hover:text-red-800 font-semibold"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {lideres.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No hay líderes registrados
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista Estadísticas */}
        {vistaActual === 'estadisticas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Votantes</p>
                    <p className="text-4xl font-bold text-indigo-600">{stats.totalVotantes}</p>
                  </div>
                  <Users className="w-12 h-12 text-indigo-200" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Ya Votaron</p>
                    <p className="text-4xl font-bold text-green-600">{stats.yaVotaron}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.totalVotantes > 0 ? Math.round((stats.yaVotaron / stats.totalVotantes) * 100) : 0}% del total
                    </p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-green-200" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Líderes</p>
                    <p className="text-4xl font-bold text-purple-600">{stats.totalLideres}</p>
                  </div>
                  <Users className="w-12 h-12 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Promedio por Líder</p>
                    <p className="text-4xl font-bold text-orange-600">
                      {stats.totalLideres > 0 ? Math.round(stats.totalVotantes / stats.totalLideres) : 0}
                    </p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-orange-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Votantes por Líder</h2>
              <div className="space-y-4">
                {stats.votantesPorLider
                  .sort((a, b) => b.cantidad - a.cantidad)
                  .map((item, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-700 text-lg">{item.nombre}</div>
                        <div className="text-sm text-gray-600">
                          Total: {item.cantidad} votantes
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-green-600 text-sm font-medium">Ya votaron</div>
                          <div className="text-green-800 text-2xl font-bold">{item.yaVotaron}</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="text-orange-600 text-sm font-medium">Faltan</div>
                          <div className="text-orange-800 text-2xl font-bold">{item.faltan}</div>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className="bg-indigo-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                          style={{
                            width: `${item.cantidad > 0 ? (item.cantidad / stats.totalVotantes) * 100 : 0}%`
                          }}
                        >
                          <span className="text-white font-semibold text-sm">{item.cantidad}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                {stats.votantesPorLider.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer con instrucciones */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-bold text-gray-800 mb-2">ℹ️ Información del Sistema</h3>
          <p className="text-sm text-gray-600 mb-2">
            👤 <strong>Usuario Normal:</strong> Puede ver votantes y marcar quién ya votó.
          </p>
          <p className="text-sm text-gray-600 mb-2">
            👨‍💼 <strong>Administrador:</strong> Puede agregar, editar y eliminar votantes y líderes. También puede desmarcar votos.
          </p>
          <p className="text-sm text-gray-600">
            🌐 <strong>Sincronización:</strong> Todos los cambios se sincronizan automáticamente con todos los usuarios conectados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VotantesDB;
