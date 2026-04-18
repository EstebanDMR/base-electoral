import React, { useState, useMemo } from 'react';
import { Search, MapPin, Phone, UserCircle2 } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export const BusquedaView = ({
  votantes,
  tenantId,
  lideres,
  isAdmin,
  handleToggleYaVoto
}) => {
  const [busquedaLocal, setBusquedaLocal] = useState('');
  const { darkMode: d } = useTheme();

  const quitarTildes = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  const votantesBusqueda = useMemo(() => {
    if (!busquedaLocal.trim()) return [];
    
    const busquedaLimpia = quitarTildes(busquedaLocal);
    
    return (votantes || []).filter(v => {
        const textoBuscar = quitarTildes(v.nombreCompleto) + " " + (v.documento || "");
        return textoBuscar.includes(busquedaLimpia);
    }).slice(0, 30);
  }, [busquedaLocal, votantes]);

  const isValued = busquedaLocal.trim() !== '';

  return (
    <div className={`animate-in fade-in duration-500 w-full max-w-5xl mx-auto ${isValued ? 'space-y-6' : ''}`}>
      <div className={`transition-all duration-300 relative overflow-hidden group focus-within:shadow-md ${isValued
        ? `rounded-[20px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border p-5 ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100'}`
        : `rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border p-8 sm:p-12 mb-8 flex flex-col items-center ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100'}`
        }`}>

        {!isValued && (
          <div className="w-full text-left mb-6">
            <h2 className={`text-2xl font-bold tracking-tight ${d ? 'text-white' : 'text-slate-900'}`}>Búsqueda de Votantes</h2>
          </div>
        )}

        <div className={`relative group w-full ${!isValued ? 'mb-12' : ''} z-10`}>
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${d ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-[#1e3a8a]'}`} />
          <input type="text" placeholder="Buscar por nombre o cédula..."
            value={busquedaLocal} onChange={(e) => setBusquedaLocal(e.target.value)}
            className={`w-full pl-14 pr-4 rounded-[12px] transition-all outline-none font-medium ${d
              ? `bg-[#0f172a] border border-slate-600 text-white placeholder-slate-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 ${isValued ? 'py-3' : 'py-4 text-base'}`
              : `bg-white border border-[#1e3a8a]/30 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-[#1e3a8a]/10 focus:border-[#1e3a8a] ${isValued ? 'py-3' : 'py-4 text-base'}`
              }`} />
        </div>

        {!isValued && (
          <div className="flex flex-col items-center mt-4 mb-4 opacity-90 animate-in fade-in duration-300">
            <div className="relative w-48 h-32 mb-6 flex justify-center items-center">
              <svg viewBox="0 0 200 120" className={`w-full h-full ${d ? 'text-slate-600' : 'text-slate-300'}`} fill="none" stroke="currentColor">
                <path d="M40 80 H60 M40 65 H70 M40 50 H60" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                <circle cx="95" cy="55" r="22" strokeWidth="4" className={d ? 'stroke-blue-400/70' : 'stroke-[#1e3a8a]/70'} fill={d ? '#1e293b' : '#f8fafc'} />
                <circle cx="95" cy="55" r="8" strokeWidth="3" className={d ? 'stroke-blue-400' : 'stroke-[#1e3a8a]'} fill={d ? '#475569' : '#cbd5e1'} />
                <path d="M78 72 L65 85" strokeWidth="6" className={d ? 'stroke-blue-400/70' : 'stroke-[#1e3a8a]/70'} strokeLinecap="round" />
              </svg>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${d ? 'text-white' : 'text-slate-800'}`}>Realice su búsqueda</h3>
            <p className={`text-[14px] font-medium text-center max-w-lg ${d ? 'text-slate-400' : 'text-slate-500'}`}>
              Utilice el buscador superior para encontrar votantes filtrados instantáneamente.
            </p>
          </div>
        )}
      </div>

      {isValued && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {votantesBusqueda.length === 0 ? (
            <div className={`rounded-[24px] shadow-sm border px-6 py-16 text-center flex flex-col items-center ${d ? 'bg-[#1e293b] border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}`}>
              <div className={`w-20 h-20 rounded-[16px] flex items-center justify-center mb-5 border ${d ? 'bg-red-900/20 border-red-900/30' : 'bg-red-50 border-red-100'}`}>
                <UserCircle2 className="w-10 h-10 text-red-300" />
              </div>
              <p className={`text-lg font-bold mb-1 ${d ? 'text-slate-300' : 'text-slate-700'}`}>Sin coincidencias</p>
              <p className="text-[14px] font-medium">No se encontraron registros indexados en el sistema local.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {votantesBusqueda.map(votante => {
                  const liderNombre = lideres.find(l => l.id === votante.liderAsignado)?.nombre || 'Sin Líder';
                  return (
                    <div key={votante.id} className={`rounded-[24px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border p-6 transition-all relative overflow-hidden group ${d ? 'bg-[#1e293b] border-slate-700 hover:shadow-lg' : 'bg-white border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]'}`}>
                      <div className="flex items-start justify-between mb-5">
                        <div className="pr-3">
                          <p className={`font-extrabold text-lg leading-tight tracking-tight ${d ? 'text-white' : 'text-slate-900'}`}>{votante.nombreCompleto}</p>
                          <p className={`font-mono text-sm mt-1 font-medium ${d ? 'text-slate-400' : 'text-slate-500'}`}>{votante.documento}</p>
                        </div>
                        <button onClick={() => handleToggleYaVoto(votante.id, votante.yaVoto)}
                          className={`px-4 py-2.5 rounded-[12px] text-xs font-extrabold uppercase tracking-widest transition-all shrink-0 shadow-sm ${votante.yaVoto
                            ? (d ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100/50')
                            : (d ? 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300')
                            }`}>
                          {votante.yaVoto ? 'YAVOTÓ ✓' : 'MARCAR'}
                        </button>
                      </div>

                      <div className={`grid grid-cols-1 gap-y-3 text-sm p-4 rounded-[16px] border ${d ? 'bg-[#0f172a] border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100/50 text-slate-600'}`}>
                        <div className="flex items-center gap-3 truncate font-medium">
                          <div className={`p-1.5 rounded-lg shadow-sm border ${d ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}><Phone className="w-4 h-4 shrink-0" /></div>
                          <span className="truncate">{votante.telefono || 'Sin registro'}</span>
                        </div>
                        <div className="flex items-center gap-3 truncate font-medium">
                          <div className={`p-1.5 rounded-lg shadow-sm border ${d ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}><UserCircle2 className="w-4 h-4 shrink-0" /></div>
                          <span className="truncate">{liderNombre}</span>
                        </div>
                        <div className="flex items-center gap-3 truncate font-medium">
                           <div className={`p-1.5 rounded-lg shadow-sm border ${d ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}><MapPin className={`w-4 h-4 shrink-0 ${d ? 'text-slate-500' : 'text-slate-400'}`} /></div>
                           <span className="truncate">{votante.puesto || 'Puesto N/A'} {votante.mesa ? `(Mesa ${votante.mesa})` : ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
