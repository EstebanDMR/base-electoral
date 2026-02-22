import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, BarChart3, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove, update } from 'firebase/database';
import * as XLSX from 'xlsx';

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
  const [lideresExpandidos, setLideresExpandidos] = useState(new Set());

  const [nuevoVotante, setNuevoVotante] = useState({
    nombreCompleto: '', documento: '', telefono: '', direccion: '',
    barrio: '', municipio: '', mesa: '', puesto: '', liderAsignado: ''
  });
  const [nuevoLider, setNuevoLider] = useState({ nombre: '', telefono: '', zona: '' });

  const [busqueda, setBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('busqueda');

  const [editandoVotante, setEditandoVotante] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState(null);
  const [editandoLider, setEditandoLider] = useState(null);
  const [datosEdicionLider, setDatosEdicionLider] = useState(null);
  const [mensajeError, setMensajeError] = useState(null);

  const toggleLider = (id) => {
    setLideresExpandidos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exportarAExcel = () => {
    // Crear datos para Excel
    const datos = votantes.map(v => {
      const lider = lideres.find(l => l.id === v.liderAsignado);
      return {
        'Nombre': v.nombreCompleto,
        'Documento': v.documento,
        'Teléfono': v.telefono || '-',
        'Dirección': v.direccion || '-',
        'Barrio': v.barrio || '-',
        'Municipio': v.municipio || '-',
        'Mesa': v.mesa || '-',
        'Puesto': v.puesto || '-',
        'Líder': lider ? lider.nombre : '-',
        '¿Ya votó?': v.yaVoto ? 'Sí' : 'No'
      };
    });

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Votantes');

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 25 }, // Nombre
      { wch: 15 }, // Documento
      { wch: 12 }, // Teléfono
      { wch: 30 }, // Dirección
      { wch: 15 }, // Barrio
      { wch: 15 }, // Municipio
      { wch: 8 },  // Mesa
      { wch: 20 }, // Puesto
      { wch: 20 }, // Líder
      { wch: 10 }  // ¿Ya votó?
    ];
    worksheet['!cols'] = columnWidths;

    // Descargar archivo
    XLSX.writeFile(workbook, `votantes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const eliminarTodosLosVotantes = async () => {
    if (window.confirm('⚠️ ¿Estás seguro de que deseas ELIMINAR TODA LA LISTA DE VOTANTES? Esta acción no se puede deshacer.')) {
      if (window.confirm('⛔ ÚLTIMA CONFIRMACIÓN: Se eliminarán todos los votantes permanentemente. ¿Continuar?')) {
        await remove(ref(database, 'votantes'));
      }
    }
  };

  useEffect(() => {
    const unsubV = onValue(ref(database, 'votantes'), snap => {
      const d = snap.val();
      setVotantes(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
    });
    const unsubL = onValue(ref(database, 'lideres'), snap => {
      const d = snap.val();
      setLideres(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
    });
    return () => { unsubV(); unsubL(); };
  }, []);

  const handleLogin = () => {
    if (password === 'admin2025') { setIsAdmin(true); setPassword(''); }
    else window.alert('Contraseña incorrecta');
  };

  const agregarVotante = async () => {
    setMensajeError(null);
    if (!nuevoVotante.nombreCompleto || !nuevoVotante.documento) { setMensajeError('Nombre y documento son obligatorios'); return; }
    const dup = votantes.find(v => v.documento === nuevoVotante.documento);
    if (dup) { setMensajeError(`Esta cédula ya está registrada a nombre de: ${dup.nombreCompleto}`); return; }
    await set(push(ref(database, 'votantes')), { ...nuevoVotante, yaVoto: false, fechaRegistro: new Date().toISOString() });
    setNuevoVotante({ nombreCompleto: '', documento: '', telefono: '', direccion: '', barrio: '', municipio: '', mesa: '', puesto: '', liderAsignado: '' });
  };

  const agregarLider = async () => {
    if (!nuevoLider.nombre) { window.alert('El nombre del líder es obligatorio'); return; }
    await set(push(ref(database, 'lideres')), { ...nuevoLider, fechaRegistro: new Date().toISOString() });
    setNuevoLider({ nombre: '', telefono: '', zona: '' });
  };

  const eliminarVotante = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este votante?')) await remove(ref(database, `votantes/${id}`));
  };

  const iniciarEdicion = (v) => { setEditandoVotante(v.id); setDatosEdicion({...v}); setMensajeError(null); };
  const cancelarEdicion = () => { setEditandoVotante(null); setDatosEdicion(null); setMensajeError(null); };
  const guardarEdicion = async () => {
    setMensajeError(null);
    if (!datosEdicion.nombreCompleto || !datosEdicion.documento) { setMensajeError('Nombre y documento son obligatorios'); return; }
    const dup = votantes.find(v => v.documento === datosEdicion.documento && v.id !== editandoVotante);
    if (dup) { setMensajeError(`Esta cédula ya está registrada a nombre de: ${dup.nombreCompleto}`); return; }
    const { id, ...datos } = datosEdicion;
    await update(ref(database, `votantes/${editandoVotante}`), datos);
    setEditandoVotante(null); setDatosEdicion(null);
  };

  const toggleYaVoto = async (id) => {
    const v = votantes.find(v => v.id === id);
    if (v) {
      if (v.yaVoto && !isAdmin) { window.alert('Solo el administrador puede desmarcar un voto'); return; }
      await update(ref(database, `votantes/${id}`), { yaVoto: !v.yaVoto });
    }
  };

  const eliminarLider = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este líder?')) await remove(ref(database, `lideres/${id}`));
  };
  const iniciarEdicionLider = (l) => { setEditandoLider(l.id); setDatosEdicionLider({...l}); };
  const cancelarEdicionLider = () => { setEditandoLider(null); setDatosEdicionLider(null); };
  const guardarEdicionLider = async () => {
    if (!datosEdicionLider.nombre) { window.alert('El nombre del líder es obligatorio'); return; }
    const { id, ...datos } = datosEdicionLider;
    await update(ref(database, `lideres/${editandoLider}`), datos);
    setEditandoLider(null); setDatosEdicionLider(null);
  };

  // Búsqueda: solo por texto, sin filtro de líder
  const votantesBusqueda = busqueda.trim() === '' ? [] : votantes.filter(v =>
    v.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) || v.documento.includes(busqueda)
  );

  const stats = {
    totalVotantes: votantes.length,
    totalLideres: lideres.length,
    yaVotaron: votantes.filter(v => v.yaVoto).length,
    votantesPorLider: lideres.map(l => {
      const vl = votantes.filter(v => v.liderAsignado === l.id);
      const yv = vl.filter(v => v.yaVoto).length;
      return { nombre: l.nombre, cantidad: vl.length, yaVotaron: yv, faltan: vl.length - yv };
    })
  };

  // ── Tabla reutilizable ──
  const TablaVotantes = ({ lista, mostrarLider = true }) => {
    const colBase = 8;
    const colTotal = colBase + (mostrarLider ? 1 : 0) + 1 + (isAdmin ? 1 : 0);
    return (
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: isAdmin ? (mostrarLider ? '1080px' : '940px') : (mostrarLider ? '920px' : '780px') }}>
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">Nombre</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Documento</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Teléfono</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Dirección</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Barrio</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Municipio</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Mesa</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Puesto</th>
              {mostrarLider && <th className="px-4 py-3 text-left whitespace-nowrap">Líder</th>}
              <th className="px-4 py-3 text-center whitespace-nowrap">¿Ya votó?</th>
              {isAdmin && <th className="px-4 py-3 text-left whitespace-nowrap">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={colTotal} className="text-center py-8 text-gray-400 italic text-sm">
                  Sin votantes registrados
                </td>
              </tr>
            ) : lista.map((votante, idx) => (
              <tr key={votante.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {editandoVotante === votante.id ? (
                  <>
                    {['nombreCompleto','documento','telefono','direccion','barrio','municipio','mesa','puesto'].map(f => (
                      <td key={f} className="px-3 py-2">
                        <input type="text" value={datosEdicion[f] || ''}
                          onChange={(e) => setDatosEdicion({...datosEdicion, [f]: e.target.value})}
                          className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none text-sm"
                          style={{minWidth:'80px'}} />
                      </td>
                    ))}
                    {mostrarLider && (
                      <td className="px-3 py-2">
                        <select value={datosEdicion.liderAsignado || ''}
                          onChange={(e) => setDatosEdicion({...datosEdicion, liderAsignado: e.target.value})}
                          className="w-full px-2 py-1 border-2 border-indigo-300 rounded focus:border-indigo-500 focus:outline-none text-sm"
                          style={{minWidth:'100px'}}>
                          <option value="">Sin líder</option>
                          {lideres.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                        </select>
                      </td>
                    )}
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${votante.yaVoto ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {votante.yaVoto ? '✓ Votó' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2 whitespace-nowrap">
                        <button onClick={guardarEdicion} className="text-green-600 hover:text-green-800 font-semibold text-sm">Guardar</button>
                        <button onClick={cancelarEdicion} className="text-gray-600 hover:text-gray-800 font-semibold text-sm">Cancelar</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{votante.nombreCompleto}</td>
                    <td className="px-4 py-3 font-mono whitespace-nowrap">{votante.documento}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{votante.telefono || '-'}</td>
                    <td className="px-4 py-3">{votante.direccion || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{votante.barrio || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{votante.municipio || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{votante.mesa || '-'}</td>
                    <td className="px-4 py-3">{votante.puesto || '-'}</td>
                    {mostrarLider && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {lideres.find(l => l.id === votante.liderAsignado)?.nombre || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${votante.yaVoto ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {votante.yaVoto ? '✓ Votó' : 'Pendiente'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2 whitespace-nowrap">
                          <button onClick={() => iniciarEdicion(votante)} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">Editar</button>
                          <button onClick={() => eliminarVotante(votante.id)} className="text-red-600 hover:text-red-800 font-semibold text-sm">Eliminar</button>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const tabs = [
    { id: 'busqueda',     emoji: '🔍', label: 'Búsqueda' },
    ...(isAdmin ? [{ id: 'votantes', emoji: '👥', label: `Votantes (${votantes.length})` }] : []),
    { id: 'lideres',      emoji: '🎯', label: `Líderes (${lideres.length})` },
    { id: 'estadisticas', emoji: '📊', label: 'Estadísticas' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
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
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Contraseña de administrador"
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button onClick={handleLogin} type="button"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap">
                Entrar como Admin
              </button>
              <span className="text-sm text-gray-600">👤 Rol: Usuario</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-semibold">✓ Rol: Administrador</span>
              <button onClick={() => { setIsAdmin(false); setVistaActual('busqueda'); }}
                className="text-sm text-gray-600 hover:text-gray-800">Cerrar sesión</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg mb-4 overflow-hidden">
          <div className="flex overflow-x-auto border-b">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setVistaActual(tab.id)}
                className={`flex-1 min-w-[70px] px-2 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
                  vistaActual === tab.id
                    ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline ml-1">{tab.label}</span>
                <span className="sm:hidden block text-xs">{tab.label.replace(/\s*\(\d+\)/, '')}</span>
              </button>
            ))}
          </div>
        </div>

        {vistaActual === 'busqueda' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Buscar Votantes</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Buscar por nombre o documento..."
                  value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-base" />
              </div>
            </div>

            {busqueda.trim() === '' ? (
              <div className="bg-white rounded-lg shadow-lg p-10 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">Escribe un nombre o documento para buscar</p>
              </div>
            ) : votantesBusqueda.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-10 text-center text-gray-500">
                <p className="text-lg">No se encontraron resultados para "<strong>{busqueda}</strong>"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {votantesBusqueda.map(votante => {
                  const liderNombre = lideres.find(l => l.id === votante.liderAsignado)?.nombre || '-';
                  return (
                    <div key={votante.id} className="bg-white rounded-lg shadow-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg text-gray-800">{votante.nombreCompleto}</p>
                          <p className="text-gray-500 font-mono text-sm">{votante.documento}</p>
                        </div>
                        <button onClick={() => toggleYaVoto(votante.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors shrink-0 ml-2 ${
                            votante.yaVoto
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}>
                          {votante.yaVoto ? '✓ Votó' : 'Marcar voto'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm text-gray-600">
                        <div><span className="font-medium text-gray-700">📞</span> {votante.telefono || '-'}</div>
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

        {vistaActual === 'votantes' && isAdmin && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800">Lista Completa de Votantes</h2>
                <div className="flex flex-wrap gap-2">
                  <button onClick={exportarAExcel}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm">
                    📊 Exportar a Excel
                  </button>
                  <button onClick={eliminarTodosLosVotantes}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm">
                    🗑️ Eliminar toda la lista
                  </button>
                </div>
              </div>
            </div>

            {mensajeError && (
              <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⛔</span>
                  <span className="font-semibold text-sm">{mensajeError}</span>
                </div>
                <button onClick={() => setMensajeError(null)} className="text-red-600 hover:text-red-800 font-bold text-xl ml-2">✕</button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-indigo-600" />
                Registrar Nuevo Votante
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'nombreCompleto', ph: 'Nombre completo *' },
                  { key: 'documento',      ph: 'Documento (cédula) *' },
                  { key: 'telefono',       ph: 'Teléfono' },
                  { key: 'direccion',      ph: 'Dirección' },
                  { key: 'barrio',         ph: 'Barrio' },
                  { key: 'municipio',      ph: 'Municipio' },
                  { key: 'mesa',           ph: 'Mesa de votación' },
                  { key: 'puesto',         ph: 'Puesto de votación' },
                ].map(f => (
                  <input key={f.key} type="text" placeholder={f.ph} value={nuevoVotante[f.key]}
                    onChange={(e) => setNuevoVotante({...nuevoVotante, [f.key]: e.target.value})}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                ))}
                <select value={nuevoVotante.liderAsignado}
                  onChange={(e) => setNuevoVotante({...nuevoVotante, liderAsignado: e.target.value})}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none">
                  <option value="">Seleccionar líder</option>
                  {lideres.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </select>
              </div>
              <button onClick={agregarVotante}
                className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold w-full">
                ✓ Registrar Votante
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <TablaVotantes lista={votantes} mostrarLider={true} />
            </div>
          </div>
        )}

        {vistaActual === 'lideres' && (
          <div className="space-y-4">
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
                <button onClick={agregarLider}
                  className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold w-full">
                  ✓ Registrar Líder
                </button>
              </div>
            )}

            {lideres.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-10 text-center text-gray-500">
                No hay líderes registrados
              </div>
            ) : (
              <div className="space-y-3">
                {lideres.map(lider => {
                  const vl = votantes.filter(v => v.liderAsignado === lider.id);
                  const yv = vl.filter(v => v.yaVoto).length;
                  const pct = vl.length > 0 ? Math.round((yv / vl.length) * 100) : 0;
                  const expandido = lideresExpandidos.has(lider.id);

                  return (
                    <div key={lider.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div
                        className={`p-4 transition-colors select-none ${editandoLider !== lider.id ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                        onClick={() => editandoLider !== lider.id && toggleLider(lider.id)}
                      >
                        {editandoLider === lider.id ? (
                          <div className="space-y-2" onClick={e => e.stopPropagation()}>
                            {['nombre','telefono','zona'].map(f => (
                              <input key={f} type="text" value={datosEdicionLider[f] || ''}
                                onChange={(e) => setDatosEdicionLider({...datosEdicionLider, [f]: e.target.value})}
                                placeholder={f}
                                className="w-full px-3 py-2 border-2 border-indigo-300 rounded text-sm focus:border-indigo-500 focus:outline-none" />
                            ))}
                            <div className="flex gap-2">
                              <button onClick={guardarEdicionLider} className="flex-1 py-2 bg-green-600 text-white rounded font-semibold text-sm">Guardar</button>
                              <button onClick={cancelarEdicionLider} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded font-semibold text-sm">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mb-2">
                                <span className="font-bold text-lg text-gray-800">{lider.nombre}</span>
                                {lider.zona     && <span className="text-sm text-gray-500">📍 {lider.zona}</span>}
                                {lider.telefono && <span className="text-sm text-gray-500">📞 {lider.telefono}</span>}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                                  {yv}/{vl.length} votaron ({pct}%)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                              <div className="flex gap-1 flex-wrap">
                                <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                                  {vl.length} total
                                </span>
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                                  ✓ {yv}
                                </span>
                                {vl.length - yv > 0 && (
                                  <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                                    ⏳ {vl.length - yv}
                                  </span>
                                )}
                              </div>
                              {isAdmin && (
                                <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                                  <button onClick={() => iniciarEdicionLider(lider)}
                                    className="px-2.5 py-1 text-xs border border-indigo-400 text-indigo-600 rounded hover:bg-indigo-50 font-semibold">
                                    Editar
                                  </button>
                                  <button onClick={() => eliminarLider(lider.id)}
                                    className="px-2.5 py-1 text-xs border border-red-400 text-red-600 rounded hover:bg-red-50 font-semibold">
                                    Eliminar
                                  </button>
                                </div>
                              )}
                              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        )}
                      </div>

                      {expandido && editandoLider !== lider.id && (
                        <div className="border-t border-indigo-100">
                          <div className="px-4 py-2 bg-indigo-50">
                            <span className="text-sm font-semibold text-indigo-700">Votantes de {lider.nombre}</span>
                          </div>
                          <TablaVotantes lista={vl} mostrarLider={false} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {(() => {
              const sinLider = votantes.filter(v => !v.liderAsignado || !lideres.find(l => l.id === v.liderAsignado));
              if (sinLider.length === 0) return null;
              const expandido = lideresExpandidos.has('__sin_lider__');
              return (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-dashed border-gray-300">
                  <div className="p-4 cursor-pointer hover:bg-gray-50 select-none flex items-center justify-between"
                    onClick={() => toggleLider('__sin_lider__')}>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-400 italic">Sin líder asignado</span>
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {sinLider.length} votantes
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`} />
                  </div>
                  {expandido && (
                    <div className="border-t border-gray-100">
                      <TablaVotantes lista={sinLider} mostrarLider={false} />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {vistaActual === 'estadisticas' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[
                { label: 'Total Votantes', value: stats.totalVotantes, color: 'text-indigo-600', Icon: Users,     ic: 'text-indigo-200' },
                { label: 'Ya Votaron',     value: stats.yaVotaron,     color: 'text-green-600',  Icon: BarChart3, ic: 'text-green-200',
                  sub: `${stats.totalVotantes > 0 ? Math.round((stats.yaVotaron/stats.totalVotantes)*100) : 0}% del total` },
                { label: 'Total Líderes',  value: stats.totalLideres,  color: 'text-purple-600', Icon: Users,     ic: 'text-purple-200' },
                { label: 'Prom. / Líder',  value: stats.totalLideres > 0 ? Math.round(stats.totalVotantes/stats.totalLideres) : 0,
                  color: 'text-orange-600', Icon: BarChart3, ic: 'text-orange-200' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm">{item.label}</p>
                      <p className={`text-3xl sm:text-4xl font-bold ${item.color}`}>{item.value}</p>
                      {item.sub && <p className="text-xs text-gray-500 mt-1">{item.sub}</p>}
                    </div>
                    <item.Icon className={`w-8 h-8 sm:w-12 sm:h-12 ${item.ic}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Votantes por Líder</h2>
              <div className="space-y-4">
                {stats.votantesPorLider.sort((a,b) => b.cantidad - a.cantidad).map((item, idx) => (
                  <div key={idx} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">{item.nombre}</span>
                      <span className="text-sm text-gray-600">Total: {item.cantidad}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                        <div className="text-green-600 text-xs font-medium">Ya votaron</div>
                        <div className="text-green-800 text-xl sm:text-2xl font-bold">{item.yaVotaron}</div>
                      </div>
                      <div className="bg-orange-50 p-2 sm:p-3 rounded-lg">
                        <div className="text-orange-600 text-xs font-medium">Faltan</div>
                        <div className="text-orange-800 text-xl sm:text-2xl font-bold">{item.faltan}</div>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-5">
                      <div className="bg-indigo-600 h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${item.cantidad > 0 ? (item.cantidad/stats.totalVotantes)*100 : 0}%` }}>
                        <span className="text-white font-semibold text-xs">{item.cantidad}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-4">
          <h3 className="font-bold text-gray-800 mb-2">ℹ️ Información del Sistema</h3>
          <p className="text-sm text-gray-600 mb-1">
            👤 <strong>Usuario Normal:</strong> Puede buscar votantes, ver líderes y marcar quién ya votó.
          </p>
          <p className="text-sm text-gray-600 mb-1">
            👨‍💼 <strong>Administrador:</strong> Acceso completo: agregar, editar, eliminar, exportar y desmarcar votos.
          </p>
          <p className="text-sm text-gray-600">
            🌐 <strong>Sincronización:</strong> Todos los cambios se sincronizan automáticamente en tiempo real.
          </p>
        </div>

      </div>
    </div>
  );
};

export default VotantesDB;