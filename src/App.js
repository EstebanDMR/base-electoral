import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, BarChart3, Eye, EyeOff } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove, update } from 'firebase/database';

// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyACbhnT4AmukbRlRopBylUtDrNwGFivdCY",
  authDomain: "db-elecciones.firebaseapp.com",
  databaseURL: "https://db-elecciones-default-rtdb.firebaseio.com",
  projectId: "db-elecciones",
  storageBucket: "db-elecciones.firebasestorage.app",
  messagingSenderId: "290500592153",
  appId: "1:290500592153:web:c0382f5a920fdda0b9a088"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const VotantesDB = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [votantes, setVotantes] = useState([]);
  const [lideres, setLideres] = useState([]);

  const [nuevoVotante, setNuevoVotante] = useState({
    nombreCompleto: '', documento: '', telefono: '', direccion: '',
    barrio: '', municipio: '', mesa: '', puesto: '', liderAsignado: ''
  });

  const [nuevoLider, setNuevoLider] = useState({ nombre: '', telefono: '', zona: '' });

  const [filtroLider, setFiltroLider] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('votantes');

  const [editandoVotante, setEditandoVotante] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState(null);
  const [editandoLider, setEditandoLider] = useState(null);
  const [datosEdicionLider, setDatosEdicionLider] = useState(null);
  const [mensajeError, setMensajeError] = useState(null);

  // Exportar a Excel (CSV)
  const exportarAExcel = () => {
    const encabezados = ['Nombre', 'Documento', 'Teléfono', 'Dirección', 'Barrio', 'Municipio', 'Mesa', 'Puesto', 'Líder', '¿Ya votó?'];
    const filas = votantes.map(votante => {
      const lider = lideres.find(l => l.id === votante.liderAsignado);
      return [
        votante.nombreCompleto, votante.documento, votante.telefono,
        votante.direccion, votante.barrio, votante.municipio,
        votante.mesa, votante.puesto,
        lider ? lider.nombre : '-',
        votante.yaVoto ? 'Sí' : 'No'
      ];
    });
    const csvContent = [
      encabezados.join(','),
      ...filas.map(fila => fila.map(campo => `"${campo || ''}"`).join(','))
    ].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `votantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Eliminar TODOS los votantes
  const eliminarTodosLosVotantes = async () => {
    if (window.confirm('⚠️ ¿Estás seguro de que deseas ELIMINAR TODA LA LISTA DE VOTANTES? Esta acción no se puede deshacer.')) {
      if (window.confirm('⛔ ÚLTIMA CONFIRMACIÓN: Se eliminarán todos los votantes permanentemente. ¿Continuar?')) {
        const votantesRef = ref(database, 'votantes');
        await remove(votantesRef);
      }
    }
  };

  useEffect(() => {
    const votantesRef = ref(database, 'votantes');
    const unsubscribeVotantes = onValue(votantesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setVotantes(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setVotantes([]);
      }
    });
    const lideresRef = ref(database, 'lideres');
    const unsubscribeLideres = onValue(lideresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLideres(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setLideres([]);
      }
    });
    return () => { unsubscribeVotantes(); unsubscribeLideres(); };
  }, []);

  const handleLogin = () => {
    if (password === 'admin2025') {
      setIsAdmin(true);
      setPassword('');
    } else {
      window.alert('Contraseña incorrecta');
    }
  };

  const agregarVotante = async () => {
    setMensajeError(null);
    if (!nuevoVotante.nombreCompleto || !nuevoVotante.documento) {
      setMensajeError('Nombre y documento son obligatorios');
      return;
    }
    const votanteExistente = votantes.find(v => v.documento === nuevoVotante.documento);
    if (votanteExistente) {
      setMensajeError(`Esta cédula ya está registrada a nombre de: ${votanteExistente.nombreCompleto}`);
      return;
    }
    const votantesRef = ref(database, 'votantes');
    await set(push(votantesRef), { ...nuevoVotante, yaVoto: false, fechaRegistro: new Date().toISOString() });
    setNuevoVotante({ nombreCompleto: '', documento: '', telefono: '', direccion: '', barrio: '', municipio: '', mesa: '', puesto: '', liderAsignado: '' });
  };

  const agregarLider = async () => {
    if (!nuevoLider.nombre) { window.alert('El nombre del líder es obligatorio'); return; }
    await set(push(ref(database, 'lideres')), { ...nuevoLider, fechaRegistro: new Date().toISOString() });
    setNuevoLider({ nombre: '', telefono: '', zona: '' });
  };

  const eliminarVotante = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este votante?')) {
      await remove(ref(database, `votantes/${id}`));
    }
  };

  const iniciarEdicion = (votante) => { setEditandoVotante(votante.id); setDatosEdicion({...votante}); setMensajeError(null); };

  const guardarEdicion = async () => {
    setMensajeError(null);
    if (!datosEdicion.nombreCompleto || !datosEdicion.documento) { setMensajeError('Nombre y documento son obligatorios'); return; }
    const dup = votantes.find(v => v.documento === datosEdicion.documento && v.id !== editandoVotante);
    if (dup) { setMensajeError(`Esta cédula ya está registrada a nombre de: ${dup.nombreCompleto}`); return; }
    const { id, ...datos } = datosEdicion;
    await update(ref(database, `votantes/${editandoVotante}`), datos);
    setEditandoVotante(null); setDatosEdicion(null);
  };

  const cancelarEdicion = () => { setEditandoVotante(null); setDatosEdicion(null); setMensajeError(null); };

  const toggleYaVoto = async (id) => {
    const votante = votantes.find(v => v.id === id);
    if (votante) {
      if (votante.yaVoto && !isAdmin) { window.alert('Solo el administrador puede desmarcar un voto'); return; }
      await update(ref(database, `votantes/${id}`), { yaVoto: !votante.yaVoto });
    }
  };

  const eliminarLider = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este líder?')) await remove(ref(database, `lideres/${id}`));
  };

  const iniciarEdicionLider = (lider) => { setEditandoLider(lider.id); setDatosEdicionLider({...lider}); };

  const guardarEdicionLider = async () => {
    if (!datosEdicionLider.nombre) { window.alert('El nombre del líder es obligatorio'); return; }
    const { id, ...datos } = datosEdicionLider;
    await update(ref(database, `lideres/${editandoLider}`), datos);
    setEditandoLider(null); setDatosEdicionLider(null);
  };

  const cancelarEdicionLider = () => { setEditandoLider(null); setDatosEdicionLider(null); };

  // Filtrar votantes para búsqueda (usa busqueda y filtroLider)
  const votantesBusqueda = votantes.filter(v => {
    const matchBusqueda = busqueda.trim() !== '' && (
      v.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.documento.includes(busqueda)
    );
    const matchLider = !filtroLider || v.liderAsignado === filtroLider;
    return matchBusqueda && matchLider;
  });

  // Filtrar votantes para la lista (sin filtro de búsqueda, solo por líder)
  const votantesFiltrados = votantes.filter(v => !filtroLider || v.liderAsignado === filtroLider);

  const stats = {
    totalVotantes: votantes.length,
    totalLideres: lideres.length,
    yaVotaron: votantes.filter(v => v.yaVoto).length,
    votantesPorLider: lideres.map(lider => {
      const vl = votantes.filter(v => v.liderAsignado === lider.id);
      const yv = vl.filter(v => v.yaVoto).length;
      return { nombre: lider.nombre, cantidad: vl.length, yaVotaron: yv, faltan: vl.length - yv };
    })
  };

  const puedeEditar = isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Users className="w-7 h-7 text-indigo-600 shrink-0" />
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Base de Datos Electoral</h1>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              🌐 En vivo
            </span>
          </div>

          {!isAdmin ? (
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Contraseña de administrador"
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
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
              <span className="text-sm text-gray-600">👤 Rol: Usuario</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-semibold flex items-center gap-2">✓ Rol: Administrador</span>
              <button onClick={() => setIsAdmin(false)} className="text-sm text-gray-600 hover:text-gray-800">Cerrar sesión</button>
            </div>
          )}
        </div>

        {/* Tabs — scroll horizontal en móvil */}
        <div className="bg-white rounded-lg shadow-lg mb-4 sm:mb-6 overflow-hidden">
          <div className="flex overflow-x-auto border-b scrollbar-hide">
            {[
              { id: 'busqueda', label: '🔍', fullLabel: 'Búsqueda' },
              { id: 'votantes', label: '👥', fullLabel: `Votantes (${votantes.length})` },
              { id: 'lideres', label: '🎯', fullLabel: `Líderes (${lideres.length})` },
              { id: 'estadisticas', label: '📊', fullLabel: 'Estadísticas' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setVistaActual(tab.id)}
                className={`flex-1 min-w-[70px] px-2 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
                  vistaActual === tab.id
                    ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="sm:hidden">{tab.label}</span>
                <span className="hidden sm:inline">{tab.fullLabel}</span>
                <span className="sm:hidden block text-xs font-normal">{tab.fullLabel.replace(/\s*\(\d+\)/, '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== VISTA VOTANTES ===== */}
        {vistaActual === 'votantes' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Encabezado con botones solo admin */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800">Lista de Votantes</h2>
                {isAdmin && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={exportarAExcel}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm sm:text-base"
                    >
                      📊 Exportar a Excel
                    </button>
                    <button
                      onClick={eliminarTodosLosVotantes}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm sm:text-base"
                    >
                      🗑️ Eliminar toda la lista
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje de error */}
            {mensajeError && (
              <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⛔</span>
                  <span className="font-semibold text-sm sm:text-base">{mensajeError}</span>
                </div>
                <button onClick={() => setMensajeError(null)} className="text-red-600 hover:text-red-800 font-bold text-xl ml-2">✕</button>
              </div>
            )}

            {/* Formulario nuevo votante */}
            {puedeEditar && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-indigo-600" />
                  Registrar Nuevo Votante
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { key: 'nombreCompleto', placeholder: 'Nombre completo *' },
                    { key: 'documento', placeholder: 'Documento (cédula) *' },
                    { key: 'telefono', placeholder: 'Teléfono' },
                    { key: 'direccion', placeholder: 'Dirección' },
                    { key: 'barrio', placeholder: 'Barrio' },
                    { key: 'municipio', placeholder: 'Municipio' },
                    { key: 'mesa', placeholder: 'Mesa de votación' },
                    { key: 'puesto', placeholder: 'Puesto de votación' },
                  ].map(field => (
                    <input
                      key={field.key}
                      type="text"
                      placeholder={field.placeholder}
                      value={nuevoVotante[field.key]}
                      onChange={(e) => setNuevoVotante({...nuevoVotante, [field.key]: e.target.value})}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    />
                  ))}
                  <select
                    value={nuevoVotante.liderAsignado}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, liderAsignado: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Seleccionar líder</option>
                    {lideres.map(lider => <option key={lider.id} value={lider.id}>{lider.nombre}</option>)}
                  </select>
                </div>
                <button onClick={agregarVotante} className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold w-full">
                  ✓ Registrar Votante
                </button>
              </div>
            )}

            {/* Lista de votantes — tarjetas en móvil, tabla en desktop */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Vista tarjetas (móvil) */}
              <div className="block sm:hidden">
                {votantesFiltrados.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No hay votantes registrados</div>
                ) : (
                  votantesFiltrados.map((votante) => {
                    const liderNombre = lideres.find(l => l.id === votante.liderAsignado)?.nombre || '-';
                    return (
                      <div key={votante.id} className="border-b p-4 last:border-b-0">
                        {editandoVotante === votante.id ? (
                          // Modo edición tarjeta
                          <div className="space-y-2">
                            {['nombreCompleto','documento','telefono','direccion','barrio','municipio','mesa','puesto'].map(field => (
                              <input key={field} type="text" value={datosEdicion[field] || ''}
                                onChange={(e) => setDatosEdicion({...datosEdicion, [field]: e.target.value})}
                                placeholder={field}
                                className="w-full px-3 py-2 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none text-sm"
                              />
                            ))}
                            <select value={datosEdicion.liderAsignado || ''}
                              onChange={(e) => setDatosEdicion({...datosEdicion, liderAsignado: e.target.value})}
                              className="w-full px-3 py-2 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none text-sm"
                            >
                              <option value="">Sin líder</option>
                              {lideres.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                            </select>
                            <div className="flex gap-2 pt-1">
                              <button onClick={guardarEdicion} className="flex-1 py-2 bg-green-600 text-white rounded font-semibold text-sm">Guardar</button>
                              <button onClick={cancelarEdicion} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded font-semibold text-sm">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-bold text-gray-800">{votante.nombreCompleto}</p>
                                <p className="text-sm text-gray-500 font-mono">{votante.documento}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ml-2 ${votante.yaVoto ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {votante.yaVoto ? '✓ Votó' : 'Pendiente'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                              <span>📞 {votante.telefono || '-'}</span>
                              <span>🏘️ {votante.barrio || '-'}</span>
                              <span>📍 {votante.direccion || '-'}</span>
                              <span>🏙️ {votante.municipio || '-'}</span>
                              <span>🗳️ Mesa: {votante.mesa || '-'}</span>
                              <span>🏫 Puesto: {votante.puesto || '-'}</span>
                              <span className="col-span-2">👤 Líder: {liderNombre}</span>
                            </div>
                            {puedeEditar && (
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => iniciarEdicion(votante)} className="flex-1 py-1.5 border border-indigo-400 text-indigo-600 rounded text-sm font-semibold">Editar</button>
                                <button onClick={() => eliminarVotante(votante.id)} className="flex-1 py-1.5 border border-red-400 text-red-600 rounded text-sm font-semibold">Eliminar</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Vista tabla (desktop) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Nombre</th>
                      <th className="px-4 py-3 text-left">Documento</th>
                      <th className="px-4 py-3 text-left">Teléfono</th>
                      <th className="px-4 py-3 text-left">Dirección</th>
                      <th className="px-4 py-3 text-left">Barrio</th>
                      <th className="px-4 py-3 text-left">Municipio</th>
                      <th className="px-4 py-3 text-left">Mesa</th>
                      <th className="px-4 py-3 text-left">Puesto</th>
                      <th className="px-4 py-3 text-left">Líder</th>
                      <th className="px-4 py-3 text-center">¿Ya votó?</th>
                      <th className="px-4 py-3 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votantesFiltrados.map((votante, idx) => (
                      <tr key={votante.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        {editandoVotante === votante.id ? (
                          <>
                            {['nombreCompleto','documento','telefono','direccion','barrio','municipio','mesa','puesto'].map(field => (
                              <td key={field} className="px-4 py-3">
                                <input type="text" value={datosEdicion[field] || ''}
                                  onChange={(e) => setDatosEdicion({...datosEdicion, [field]: e.target.value})}
                                  className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none min-w-[80px]"
                                />
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <select value={datosEdicion.liderAsignado || ''}
                                onChange={(e) => setDatosEdicion({...datosEdicion, liderAsignado: e.target.value})}
                                className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none"
                              >
                                <option value="">Sin líder</option>
                                {lideres.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${votante.yaVoto ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {votante.yaVoto ? '✓ Votó' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={guardarEdicion} className="text-green-600 hover:text-green-800 font-semibold">Guardar</button>
                                <button onClick={cancelarEdicion} className="text-gray-600 hover:text-gray-800 font-semibold">Cancelar</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3">{votante.nombreCompleto}</td>
                            <td className="px-4 py-3 font-mono">{votante.documento}</td>
                            <td className="px-4 py-3">{votante.telefono}</td>
                            <td className="px-4 py-3">{votante.direccion}</td>
                            <td className="px-4 py-3">{votante.barrio}</td>
                            <td className="px-4 py-3">{votante.municipio}</td>
                            <td className="px-4 py-3">{votante.mesa}</td>
                            <td className="px-4 py-3">{votante.puesto}</td>
                            <td className="px-4 py-3">{lideres.find(l => l.id === votante.liderAsignado)?.nombre || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${votante.yaVoto ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {votante.yaVoto ? '✓ Votó' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {puedeEditar && (
                                <div className="flex gap-2">
                                  <button onClick={() => iniciarEdicion(votante)} className="text-indigo-600 hover:text-indigo-800 font-semibold">Editar</button>
                                  <button onClick={() => eliminarVotante(votante.id)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button>
                                </div>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {votantes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">No hay votantes registrados</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== VISTA BÚSQUEDA ===== */}
        {vistaActual === 'busqueda' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Buscar Votantes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  {lideres.map(lider => <option key={lider.id} value={lider.id}>{lider.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* Resultados */}
            {busqueda.trim() === '' ? (
              <div className="bg-white rounded-lg shadow-lg p-10 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">Escribe un nombre o documento para buscar un votante</p>
              </div>
            ) : votantesBusqueda.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-10 text-center text-gray-500">
                <p className="text-lg">No se encontraron resultados para "<strong>{busqueda}</strong>"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {votantesBusqueda.map((votante) => {
                  const liderNombre = lideres.find(l => l.id === votante.liderAsignado)?.nombre || '-';
                  return (
                    <div key={votante.id} className="bg-white rounded-lg shadow-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg text-gray-800">{votante.nombreCompleto}</p>
                          <p className="text-gray-500 font-mono text-sm">{votante.documento}</p>
                        </div>
                        <button
                          onClick={() => toggleYaVoto(votante.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors shrink-0 ml-2 ${
                            votante.yaVoto
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {votante.yaVoto ? '✓ Votó' : 'Marcar voto'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-gray-600">
                        <div><span className="font-medium text-gray-700">📞 Teléfono:</span> {votante.telefono || '-'}</div>
                        <div><span className="font-medium text-gray-700">🏫 Puesto:</span> {votante.puesto || '-'}</div>
                        <div><span className="font-medium text-gray-700">🗳️ Mesa:</span> {votante.mesa || '-'}</div>
                        <div><span className="font-medium text-gray-700">🏘️ Barrio:</span> {votante.barrio || '-'}</div>
                        <div><span className="font-medium text-gray-700">🏙️ Municipio:</span> {votante.municipio || '-'}</div>
                        <div><span className="font-medium text-gray-700">👤 Líder:</span> {liderNombre}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== VISTA LÍDERES ===== */}
        {vistaActual === 'lideres' && (
          <div className="space-y-4 sm:space-y-6">
            {isAdmin && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar Nuevo Líder</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input type="text" placeholder="Nombre del líder *" value={nuevoLider.nombre}
                    onChange={(e) => setNuevoLider({...nuevoLider, nombre: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                  <input type="text" placeholder="Teléfono" value={nuevoLider.telefono}
                    onChange={(e) => setNuevoLider({...nuevoLider, telefono: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                  <input type="text" placeholder="Zona / Sector" value={nuevoLider.zona}
                    onChange={(e) => setNuevoLider({...nuevoLider, zona: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                </div>
                <button onClick={agregarLider} className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold w-full">
                  ✓ Registrar Líder
                </button>
              </div>
            )}

            {/* Lista líderes — tarjetas en móvil */}
            <div className="block sm:hidden space-y-3">
              {lideres.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-10 text-center text-gray-500">No hay líderes registrados</div>
              ) : lideres.map((lider) => (
                <div key={lider.id} className="bg-white rounded-lg shadow-lg p-4">
                  {editandoLider === lider.id ? (
                    <div className="space-y-2">
                      {['nombre','telefono','zona'].map(field => (
                        <input key={field} type="text" value={datosEdicionLider[field] || ''}
                          onChange={(e) => setDatosEdicionLider({...datosEdicionLider, [field]: e.target.value})}
                          placeholder={field}
                          className="w-full px-3 py-2 border-2 border-indigo-300 rounded text-sm focus:border-indigo-500 focus:outline-none" />
                      ))}
                      <div className="flex gap-2">
                        <button onClick={guardarEdicionLider} className="flex-1 py-2 bg-green-600 text-white rounded font-semibold text-sm">Guardar</button>
                        <button onClick={cancelarEdicionLider} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded font-semibold text-sm">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-gray-800">{lider.nombre}</p>
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold text-sm">
                          {votantes.filter(v => v.liderAsignado === lider.id).length} votantes
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">📞 {lider.telefono || '-'} · {lider.zona || '-'}</p>
                      {puedeEditar && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => iniciarEdicionLider(lider)} className="flex-1 py-1.5 border border-indigo-400 text-indigo-600 rounded text-sm font-semibold">Editar</button>
                          <button onClick={() => eliminarLider(lider.id)} className="flex-1 py-1.5 border border-red-400 text-red-600 rounded text-sm font-semibold">Eliminar</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tabla desktop */}
            <div className="hidden sm:block bg-white rounded-lg shadow-lg overflow-hidden">
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
                        <>
                          <td className="px-4 py-3"><input type="text" value={datosEdicionLider.nombre || ''} onChange={(e) => setDatosEdicionLider({...datosEdicionLider, nombre: e.target.value})} className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:outline-none" /></td>
                          <td className="px-4 py-3"><input type="text" value={datosEdicionLider.telefono || ''} onChange={(e) => setDatosEdicionLider({...datosEdicionLider, telefono: e.target.value})} className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:outline-none" /></td>
                          <td className="px-4 py-3"><input type="text" value={datosEdicionLider.zona || ''} onChange={(e) => setDatosEdicionLider({...datosEdicionLider, zona: e.target.value})} className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:outline-none" /></td>
                          <td className="px-4 py-3"><span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">{votantes.filter(v => v.liderAsignado === lider.id).length}</span></td>
                          <td className="px-4 py-3"><div className="flex gap-2"><button onClick={guardarEdicionLider} className="text-green-600 hover:text-green-800 font-semibold">Guardar</button><button onClick={cancelarEdicionLider} className="text-gray-600 hover:text-gray-800 font-semibold">Cancelar</button></div></td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-semibold">{lider.nombre}</td>
                          <td className="px-4 py-3">{lider.telefono}</td>
                          <td className="px-4 py-3">{lider.zona}</td>
                          <td className="px-4 py-3"><span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">{votantes.filter(v => v.liderAsignado === lider.id).length}</span></td>
                          {puedeEditar && (
                            <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => iniciarEdicionLider(lider)} className="text-indigo-600 hover:text-indigo-800 font-semibold">Editar</button><button onClick={() => eliminarLider(lider.id)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button></div></td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {lideres.length === 0 && <div className="text-center py-12 text-gray-500">No hay líderes registrados</div>}
            </div>
          </div>
        )}

        {/* ===== VISTA ESTADÍSTICAS ===== */}
        {vistaActual === 'estadisticas' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[
                { label: 'Total Votantes', value: stats.totalVotantes, color: 'text-indigo-600', Icon: Users, iconColor: 'text-indigo-200' },
                { label: 'Ya Votaron', value: stats.yaVotaron, color: 'text-green-600', Icon: BarChart3, iconColor: 'text-green-200', sub: `${stats.totalVotantes > 0 ? Math.round((stats.yaVotaron / stats.totalVotantes) * 100) : 0}% del total` },
                { label: 'Total Líderes', value: stats.totalLideres, color: 'text-purple-600', Icon: Users, iconColor: 'text-purple-200' },
                { label: 'Promedio por Líder', value: stats.totalLideres > 0 ? Math.round(stats.totalVotantes / stats.totalLideres) : 0, color: 'text-orange-600', Icon: BarChart3, iconColor: 'text-orange-200' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm">{item.label}</p>
                      <p className={`text-3xl sm:text-4xl font-bold ${item.color}`}>{item.value}</p>
                      {item.sub && <p className="text-xs text-gray-500 mt-1">{item.sub}</p>}
                    </div>
                    <item.Icon className={`w-8 h-8 sm:w-12 sm:h-12 ${item.iconColor}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Votantes por Líder</h2>
              <div className="space-y-4">
                {stats.votantesPorLider.sort((a, b) => b.cantidad - a.cantidad).map((item, idx) => (
                  <div key={idx} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-700">{item.nombre}</div>
                      <div className="text-sm text-gray-600">Total: {item.cantidad}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                        <div className="text-green-600 text-xs sm:text-sm font-medium">Ya votaron</div>
                        <div className="text-green-800 text-xl sm:text-2xl font-bold">{item.yaVotaron}</div>
                      </div>
                      <div className="bg-orange-50 p-2 sm:p-3 rounded-lg">
                        <div className="text-orange-600 text-xs sm:text-sm font-medium">Faltan</div>
                        <div className="text-orange-800 text-xl sm:text-2xl font-bold">{item.faltan}</div>
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-5 relative">
                      <div
                        className="bg-indigo-600 h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${item.cantidad > 0 ? (item.cantidad / stats.totalVotantes) * 100 : 0}%` }}
                      >
                        <span className="text-white font-semibold text-xs">{item.cantidad}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {stats.votantesPorLider.length === 0 && <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <h3 className="font-bold text-gray-800 mb-2">ℹ️ Información del Sistema</h3>
          <p className="text-sm text-gray-600 mb-2">👤 <strong>Usuario Normal:</strong> Puede ver votantes y marcar quién ya votó.</p>
          <p className="text-sm text-gray-600 mb-2">👨‍💼 <strong>Administrador:</strong> Puede agregar, editar, eliminar votantes y líderes. También puede exportar y desmarcar votos.</p>
          <p className="text-sm text-gray-600">🌐 <strong>Sincronización:</strong> Todos los cambios se sincronizan automáticamente en tiempo real.</p>
        </div>
      </div>
    </div>
  );
};

export default VotantesDB;