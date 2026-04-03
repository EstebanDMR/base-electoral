import React, { useState, useEffect } from 'react';
import { Users, LayoutDashboard, Search, FileBarChart2, Copy, CheckCircle2, Shield, RefreshCw, AlertTriangle, Moon, Sun } from 'lucide-react';
import { logoutUser } from './authService';
import { useVotantesData } from './hooks/useVotantesData';
import { Login } from './components/Login';
import { BusquedaView } from './views/BusquedaView';
import { VotantesView } from './views/VotantesView';
import { LideresView } from './views/LideresView';
import { EstadisticasView } from './views/EstadisticasView';
import { useTheme } from './ThemeContext';

const VotantesDB = () => {
  const [busqueda, setBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('busqueda');
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [nuevoAlias, setNuevoAlias] = useState('');
  const [estaEditandoAlias, setEstaEditandoAlias] = useState(false);
  const [codigoRevincular, setCodigoRevincular] = useState('');
  const [revinculando, setRevinculando] = useState(false);
  const { darkMode, toggleDarkMode, loadUserTheme } = useTheme();

  const {
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
    eliminarLider,
    vincularAEquipo,
    teamAlias,
    adminAlias,
    accessDenied,
    crearAliasEquipo
  } = useVotantesData();

  // Cargar el tema del usuario cuando cambia la sesión
  useEffect(() => {
    loadUserTheme(firebaseUser?.email || null);
  }, [firebaseUser, loadUserTheme]);

  if (!firebaseUser) return <Login />;

  const handleLogout = async () => {
    try {
      await logoutUser();
      setNuevoAlias('');
    } catch (e) { console.error(e); }
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(teamAlias || firebaseUser.uid);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const handleCrearAlias = async () => {
    if (!nuevoAlias.trim()) return;
    try {
      await crearAliasEquipo(nuevoAlias);
      setEstaEditandoAlias(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRecuperarAcceso = async () => {
    if (!codigoRevincular.trim()) return;
    setRevinculando(true);
    try {
      await vincularAEquipo(codigoRevincular);
      alert('¡Código aceptado! Has recuperado el acceso al equipo.');
      setCodigoRevincular('');
    } catch (e) {
      alert(e.message);
    } finally {
      setRevinculando(false);
    }
  };

  const handleToggleYaVoto = (votante) => {
    toggleYaVoto(votante.id, votante.yaVoto);
  };

  const votantesBusqueda = busqueda.trim() === '' ? [] : votantes.filter(v =>
    v.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) || v.documento.includes(busqueda)
  );

  const tabs = [
    { id: 'busqueda', icon: <Search className="w-4 h-4" />, label: 'Búsqueda' },
    ...(isAdmin ? [
      { id: 'votantes', icon: <Users className="w-4 h-4" />, label: `Votantes (${votantes.length})` },
      { id: 'lideres', icon: <LayoutDashboard className="w-4 h-4" />, label: `Líderes (${lideres.length})` },
      { id: 'estadisticas', icon: <FileBarChart2 className="w-4 h-4" />, label: 'Estadísticas' }
    ] : [])
  ];

  // Clases dinámicas por tema
  const d = darkMode;

  return (
    <div className={`min-h-screen pb-10 font-sans transition-colors duration-300 ${d ? 'bg-[#111827]' : 'bg-[#f1f5f9]'}`}>
      {/* Header Visual Moderno */}
      <div className={`text-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] relative z-20 ${d ? 'bg-[#1e293b]' : 'bg-[#1e3a8a]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shadow-sm ${d ? 'bg-slate-700' : 'bg-white'}`}>
                <Users className={`w-6 h-6 shrink-0 fill-current opacity-80 ${d ? 'text-blue-400' : 'text-[#1e3a8a]'}`} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Base de Datos Electoral</h1>
                <div className="flex items-center gap-2 mt-0">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="text-blue-200 text-[10px] font-bold tracking-wider">Sincronización en vivo</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Botón Dark Mode */}
              <button onClick={toggleDarkMode}
                className={`p-2.5 rounded-xl transition-all duration-300 border ${d ? 'bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30 text-yellow-300' : 'bg-white/10 border-white/20 hover:bg-white/20 text-blue-200'}`}
                title={d ? 'Modo Claro' : 'Modo Oscuro'}>
                {d ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="hidden sm:flex flex-col text-right">
                <p className="text-white font-medium text-sm leading-tight">{firebaseUser.email}</p>
                <div className="flex justify-end mt-0.5 items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-200" />
                  <span className="text-blue-200 text-xs tracking-wide">
                    {!tenantId ? 'Cargando...' : (isAdmin ? 'Administrador' : 'Colaborador')}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className={`px-5 py-2 border text-white rounded-lg text-sm font-bold transition-all flex items-center shadow-sm backdrop-blur-sm ${d ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white/10 hover:bg-white/20 border-white/20'}`}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Panel Inferior del Header */}
        {firebaseUser && !isLoadingData && (
          <div className={`border-t backdrop-blur-md ${d ? 'bg-[#0f172a]/80 border-slate-700/50' : 'bg-[#152a6b]/80 border-white/5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 text-sm">
              {isAdmin ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto text-blue-100 mb-4 sm:mb-0">
                  <span className="font-medium text-[13px] opacity-80">Código de Equipo:</span>

                  {teamAlias && !estaEditandoAlias ? (
                    <div className="flex items-center gap-2">
                      <code className={`px-3 py-1 rounded-lg text-emerald-400 font-bold tracking-widest text-[14px] uppercase select-all shadow-inner border ${d ? 'bg-slate-800 border-slate-700' : 'bg-[#0f1d4a] border-[#1a2d5e]'}`}>
                        {teamAlias}
                      </code>
                      <button onClick={copiarCodigo} className="p-1 hover:bg-white/10 rounded transition-colors" title="Copiar código">
                        {codigoCopiado ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-blue-200" />}
                      </button>
                      <button onClick={() => setEstaEditandoAlias(true)} className="p-1 hover:bg-red-500/20 rounded transition-colors group" title="Regenerar Código (Expulsará a todos)">
                        <RefreshCw className="w-4 h-4 text-red-300 group-hover:text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-0 sm:gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                      <input type="text" placeholder={teamAlias ? "Nuevo alias..." : "Ej: MiguelElectoral"}
                        value={nuevoAlias} onChange={(e) => setNuevoAlias(e.target.value)}
                        className={`px-3 py-1.5 border text-white placeholder-blue-300/50 rounded-l-lg sm:rounded-lg outline-none focus:ring-1 focus:ring-emerald-400 text-[13px] w-full sm:w-48 font-mono flex-1 min-w-[120px] ${d ? 'bg-slate-800 border-slate-700' : 'bg-[#0f1d4a] border-[#0f1d4a]'}`}
                      />
                      <button onClick={handleCrearAlias} className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-none sm:rounded-lg text-[13px] font-bold transition-all whitespace-nowrap border border-emerald-500">
                        {teamAlias ? "Actualizar" : "Reclamar"}
                      </button>
                      {teamAlias && (
                        <button onClick={() => { setEstaEditandoAlias(false); setNuevoAlias(''); }} className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1.5 rounded-r-lg sm:rounded-lg text-[13px] font-bold transition-all whitespace-nowrap border border-slate-600 border-l-0 sm:border-l">
                          Cerrar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto text-blue-100 mb-2 sm:mb-0">
                  <span className="font-medium text-[13px] opacity-80">Equipo:</span>
                  <span className="font-bold tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-md border border-emerald-400/20 text-[13px] shadow-inner uppercase" title={adminAlias || tenantId}>
                    {adminAlias || tenantId}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20">
        {accessDenied && !isAdmin ? (
          <div className={`rounded-2xl shadow-lg border p-8 sm:p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-10 ${d ? 'bg-[#1e293b] border-red-900/30' : 'bg-white border-red-100'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${d ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className={`text-2xl font-extrabold mb-3 ${d ? 'text-white' : 'text-slate-800'}`}>Acceso Suspendido</h2>
            <p className={`font-medium max-w-md mb-8 leading-relaxed ${d ? 'text-slate-400' : 'text-slate-600'}`}>
              El administrador principal ha modificado el código de acceso del equipo por seguridad. Necesitas la nueva clave para continuar trabajando.
            </p>

            <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3">
              <input type="text" placeholder="Nuevo Código de Equipo"
                value={codigoRevincular} onChange={e => setCodigoRevincular(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl outline-none font-mono text-center sm:text-left transition-all ${d ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-400' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-400'}`}
              />
              <button onClick={handleRecuperarAcceso} disabled={revinculando} className={`px-6 py-3 rounded-xl font-bold tracking-wide text-white transition-all shadow-md flex items-center justify-center whitespace-nowrap ${revinculando ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-red-500 hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5'}`}>
                {revinculando ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Reconectar"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {tabs.length > 1 && (
              <div className={`rounded-[12px] shadow-sm border mb-8 p-1.5 flex flex-nowrap overflow-x-auto gap-1 w-full sm:w-fit max-w-full mx-auto ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
                {tabs.map((tab, idx) => (
                  <React.Fragment key={tab.id}>
                    {idx !== 0 && <div className={`w-px my-2 mx-1 hidden sm:block ${d ? 'bg-slate-700' : 'bg-slate-200'}`}></div>}
                    <button onClick={() => setVistaActual(tab.id)}
                      className={`flex items-center justify-center px-6 py-2.5 font-bold rounded-[8px] text-[13px] transition-all duration-200 outline-none select-none ${vistaActual === tab.id
                          ? (d ? 'bg-blue-600 text-white shadow-md' : 'bg-[#1e3a8a] text-white shadow-md')
                          : (d ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-50')
                        }`}>
                      <span className="tracking-wide">{tab.label.replace(/\s*\(\d+\)/, '')}</span>
                      {tab.id !== 'busqueda' && tab.id !== 'estadisticas' && (
                        <span className={`ml-1.5 text-[11px] ${vistaActual === tab.id ? 'opacity-80' : 'opacity-60'} hidden sm:inline`}>
                          ({tab.id === 'votantes' ? votantes.length : lideres.length})
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            {isLoadingData ? (
              <div className={`rounded-[24px] shadow-sm border p-20 text-center flex flex-col items-center justify-center ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="relative mb-6">
                  <div className={`w-16 h-16 border-4 rounded-full absolute ${d ? 'border-slate-700' : 'border-slate-100'}`}></div>
                  <div className="w-16 h-16 border-4 border-[#1e3a8a] rounded-full animate-spin border-t-transparent"></div>
                </div>
                <h3 className={`text-xl font-extrabold mb-2 ${d ? 'text-white' : 'text-slate-800'}`}>Conectando a la Base de Datos...</h3>
                <p className={`font-medium text-sm ${d ? 'text-slate-400' : 'text-slate-500'}`}>Validando credenciales encriptadas</p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {vistaActual === 'busqueda' && (
                  <BusquedaView
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    votantesBusqueda={votantesBusqueda}
                    lideres={lideres}
                    isAdmin={isAdmin}
                    handleToggleYaVoto={handleToggleYaVoto}
                  />
                )}

                {vistaActual === 'votantes' && isAdmin && (
                  <VotantesView
                    votantes={votantes}
                    lideres={lideres}
                    isAdmin={isAdmin}
                    onAgregarVotante={agregarVotante}
                    onEditarVotante={editarVotante}
                    onEliminarVotante={eliminarVotante}
                    onEliminarTodosLosVotantes={eliminarTodosLosVotantes}
                  />
                )}

                {vistaActual === 'lideres' && isAdmin && (
                  <LideresView
                    votantes={votantes}
                    lideres={lideres}
                    isAdmin={isAdmin}
                    onAgregarLider={agregarLider}
                    onEditarLider={editarLider}
                    onEliminarLider={eliminarLider}
                    onEditarVotante={editarVotante}
                    onEliminarVotante={eliminarVotante}
                  />
                )}

                {vistaActual === 'estadisticas' && isAdmin && (
                  <EstadisticasView
                    votantes={votantes}
                    lideres={lideres}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VotantesDB;