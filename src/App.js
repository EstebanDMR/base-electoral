import React, { useState } from 'react';
import { Users, LayoutDashboard, Search, FileBarChart2, Copy, CheckCircle2, Shield } from 'lucide-react';
import { logoutUser } from './authService';
import { useVotantesData } from './hooks/useVotantesData';
import { Login } from './components/Login';
import { BusquedaView } from './views/BusquedaView';
import { VotantesView } from './views/VotantesView';
import { LideresView } from './views/LideresView';
import { EstadisticasView } from './views/EstadisticasView';

const VotantesDB = () => {
  const [busqueda, setBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('busqueda');
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const [codigoIngresado, setCodigoIngresado] = useState('');

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
    vincularAEquipo
  } = useVotantesData();

  if (!firebaseUser) return <Login />;

  const handleLogout = async () => {
    try { await logoutUser(); } catch (e) { console.error(e); }
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(firebaseUser.uid);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  };

  const handleVincular = async () => {
    try {
      await vincularAEquipo(codigoIngresado);
      alert('¡Te has vinculado al equipo exitosamente! Ahora puedes buscar votantes y marcar su asistencia.');
      setCodigoIngresado('');
    } catch (error) {
       alert(error.message);
    }
  };

  const handleToggleYaVoto = (votante) => {
    toggleYaVoto(votante.id, votante.yaVoto);
  };

  const votantesBusqueda = busqueda.trim() === '' ? [] : votantes.filter(v =>
    v.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) || v.documento.includes(busqueda)
  );

  const tabs = [
    { id: 'busqueda',     icon: <Search className="w-4 h-4"/>, label: 'Búsqueda' },
    ...(isAdmin ? [
      { id: 'votantes',     icon: <Users className="w-4 h-4"/>, label: `Votantes (${votantes.length})` },
      { id: 'lideres',      icon: <LayoutDashboard className="w-4 h-4"/>, label: `Líderes (${lideres.length})` },
      { id: 'estadisticas', icon: <FileBarChart2 className="w-4 h-4"/>, label: 'Estadísticas' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-10 font-sans">
      {/* Header Visual Moderno - Estilo Premium Stitch - BANNER SUPERIOR AZUL MODO IMAGEN */}
      <div className="bg-[#1e3a8a] text-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Users className="w-6 h-6 text-[#1e3a8a] shrink-0 fill-current opacity-80" />
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

            {/* Titulo Central Absoluto (Panel de Búsqueda Electoral Premium) */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 font-bold text-xl text-white tracking-wide">
              Panel de Búsqueda Electoral Premium
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <p className="text-white font-medium text-sm leading-tight">{firebaseUser.email}</p>
                <div className="flex justify-end mt-0.5 items-center gap-1">
                   <Shield className="w-3 h-3 text-blue-200" />
                   <span className="text-blue-200 text-xs tracking-wide">
                     {!tenantId ? 'Cargando...' : (isAdmin ? 'Administrador' : 'Colaborador')}
                   </span>
                </div>
              </div>
              <button onClick={handleLogout} className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm font-bold transition-all flex items-center shadow-sm backdrop-blur-sm">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Panel Inferior del Header (Barra Azul más Oscura) */}
        {firebaseUser && !isLoadingData && (
          <div className="bg-[#152a6b]/80 border-t border-white/5 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 text-sm">
              {isAdmin ? (
                <div className="flex items-center gap-2 w-full sm:w-auto text-blue-100">
                   <span className="font-medium text-[13px] opacity-80">Tu Código de Equipo:</span>
                   <code className="font-bold tracking-wide select-all">{firebaseUser.uid}</code>
                   <button onClick={copiarCodigo} className="p-1 hover:bg-white/10 rounded transition-colors" title="Copiar código">
                     {codigoCopiado ? <CheckCircle2 className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4 text-blue-200"/>}
                   </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto text-blue-100">
                   <span className="font-medium text-[13px] opacity-80">Actuando en Equipo:</span>
                   <code className="font-bold tracking-wide">{tenantId}</code>
                </div>
              )}
              
              {/* Opción para Administradores de convertirse en Colaboradores (Mini-Form) */}
              {isAdmin && (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto ml-auto">
                  <span className="text-blue-200 text-[13px] opacity-80">Invitar a otro equipo...</span>
                  <div className="flex w-full sm:w-auto">
                    <input type="text" placeholder="Código" value={codigoIngresado} onChange={e => setCodigoIngresado(e.target.value)}
                      className="w-full sm:w-32 px-3 py-1.5 bg-[#0f1d4a] border border-[#0f1d4a] text-white placeholder-blue-300/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all text-[13px] rounded-l-lg font-mono hidden sm:block" />
                    <button onClick={handleVincular} className="bg-emerald-500 hover:bg-emerald-400 border border-emerald-500 text-white px-4 py-1.5 text-[13px] font-bold transition-colors whitespace-nowrap rounded-lg sm:rounded-l-none">
                      Unirme
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {tabs.length > 1 && (
          <div className="bg-white rounded-[12px] shadow-sm border border-slate-200 mb-8 p-1.5 flex flex-nowrap overflow-x-auto gap-1 w-fit mx-auto">
            {tabs.map((tab, idx) => (
              <React.Fragment key={tab.id}>
                {idx !== 0 && <div className="w-px bg-slate-200 my-2 mx-1 hidden sm:block"></div>}
                <button onClick={() => setVistaActual(tab.id)}
                  className={`flex items-center justify-center px-6 py-2.5 font-bold rounded-[8px] text-[13px] transition-all duration-200 outline-none select-none ${
                    vistaActual === tab.id
                      ? 'bg-[#1e3a8a] text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                  <span className="tracking-wide">{tab.label.replace(/\s*\(\d+\)/, '')}</span>
                  {tab.id !== 'busqueda' && tab.id !== 'estadisticas' && (
                     <span className={`ml-1.5 text-[11px] ${vistaActual===tab.id ? 'opacity-80' : 'opacity-60'} hidden sm:inline`}>
                        ({tab.id === 'votantes' ? votantes.length : lideres.length})
                     </span>
                  )}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {isLoadingData ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-20 text-center flex flex-col items-center justify-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-slate-100 rounded-full absolute"></div>
              <div className="w-16 h-16 border-4 border-[#1e3a8a] rounded-full animate-spin border-t-transparent"></div>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">Conectando a la Base de Datos...</h3>
            <p className="text-slate-500 font-medium text-sm">Validando credenciales encriptadas</p>
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
      </div>
    </div>
  );
};

export default VotantesDB;