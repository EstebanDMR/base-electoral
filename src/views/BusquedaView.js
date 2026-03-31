import React from 'react';
import { Search, MapPin, Phone, UserCircle2 } from 'lucide-react';

export const BusquedaView = ({
  busqueda,
  setBusqueda,
  votantesBusqueda,
  lideres,
  isAdmin,
  handleToggleYaVoto
}) => {
  const isBuscando = busqueda.trim() !== '';

  return (
    <div className={`animate-in fade-in duration-500 w-full max-w-5xl mx-auto ${isBuscando ? 'space-y-6' : ''}`}>
      
      {/* Contenedor principal del input (Unificado para no perder el DOM/foco) */}
      <div className={`bg-white transition-all duration-300 relative overflow-hidden group focus-within:shadow-md ${
        isBuscando 
          ? 'rounded-[20px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 p-5' 
          : 'rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-12 mb-8 flex flex-col items-center'
      }`}>
        
        {!isBuscando && (
          <div className="w-full text-left mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Búsqueda Centralizada</h2>
          </div>
        )}

        <div className={`relative group w-full ${!isBuscando ? 'mb-12' : ''} z-10`}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-[#1e3a8a] transition-colors" />
          <input type="text" placeholder="Buscar por nombre, documento de identidad, o ubicación..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-14 pr-4 bg-white border border-[#1e3a8a]/30 rounded-[12px] focus:bg-white focus:ring-4 focus:ring-[#1e3a8a]/10 focus:border-[#1e3a8a] transition-all outline-none text-slate-800 placeholder-slate-400 font-medium ${
                  isBuscando ? 'py-3' : 'py-4 text-base'
                }`} />
        </div>

        {!isBuscando && (
          /* Ilustración y texto inferior - Estética Dashboard */
          <div className="flex flex-col items-center mt-4 mb-4 opacity-90 animate-in fade-in duration-300">
              <div className="relative w-48 h-32 mb-6 flex justify-center items-center">
                  <svg viewBox="0 0 200 120" className="w-full h-full text-slate-300" fill="none" stroke="currentColor">
                      <path d="M40 80 H60 M40 65 H70 M40 50 H60" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                      <circle cx="95" cy="55" r="22" strokeWidth="4" className="stroke-[#1e3a8a]/70" fill="#f8fafc"/>
                      <circle cx="95" cy="55" r="8" strokeWidth="3" className="stroke-[#1e3a8a]" fill="#cbd5e1"/>
                      <path d="M78 72 L65 85" strokeWidth="6" className="stroke-[#1e3a8a]/70" strokeLinecap="round"/>
                      <path d="M120 40 L135 55 L145 45 L155 35" strokeWidth="3" className="stroke-slate-400" strokeLinejoin="round"/>
                      <circle cx="120" cy="40" r="4" fill="currentColor"/>
                      <circle cx="135" cy="55" r="4" fill="currentColor"/>
                      <circle cx="145" cy="45" r="4" fill="currentColor"/>
                      <circle cx="155" cy="35" r="4" fill="currentColor"/>
                      <path d="M85 95 H150 V110 H85 Z" strokeWidth="3" fill="#f8fafc" className="stroke-[#1e3a8a]/50"/>
                      <path d="M110 75 L125 95 L95 95 Z" strokeWidth="3" fill="#e2e8f0" className="stroke-[#1e3a8a]/60"/>
                      <path d="M75 110 H160 M95 95 V80 M105 95 V85" strokeWidth="3" opacity="0.8"/>
                  </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Comience su Investigación Electoral</h3>
              <p className="text-[14px] text-slate-500 font-medium text-center max-w-lg">
                  Utilice el buscador superior para localizar votantes, líderes o analizar datos demográficos rápidamente.
              </p>
          </div>
        )}
      </div>

      {isBuscando && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {votantesBusqueda.length === 0 ? (
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 px-6 py-16 text-center text-slate-400 flex flex-col items-center">
              <div className="w-20 h-20 bg-red-50 rounded-[16px] flex items-center justify-center mb-5 border border-red-100">
                <UserCircle2 className="w-10 h-10 text-red-300" />
              </div>
              <p className="text-lg font-bold text-slate-700 mb-1">Sin coincidencias</p>
              <p className="text-[14px] font-medium">No se encontraron registros para "<strong className="text-slate-800">{busqueda}</strong>".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {votantesBusqueda.map(votante => {
                const liderNombre = lideres.find(l => l.id === votante.liderAsignado)?.nombre || 'Sin Líder';
                return (
                  <div key={votante.id} className="bg-white rounded-[24px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1e3a8a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-start justify-between mb-5">
                      <div className="pr-3">
                        <p className="font-extrabold text-lg text-slate-900 leading-tight tracking-tight">{votante.nombreCompleto}</p>
                        <p className="text-slate-500 font-mono text-sm mt-1 font-medium">{votante.documento}</p>
                      </div>
                      <button onClick={() => handleToggleYaVoto(votante)}
                        className={`px-4 py-2.5 rounded-[12px] text-xs font-extrabold uppercase tracking-widest transition-all shrink-0 shadow-sm ${
                          votante.yaVoto
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100/50'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                        }`}>
                        {votante.yaVoto ? 'YAVOTÓ ✓' : 'MARCAR'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-y-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-[16px] border border-slate-100/50">
                      <div className="flex items-center gap-3 truncate font-medium" title={votante.telefono}>
                        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100"><Phone className="w-4 h-4 text-slate-400 shrink-0"/></div>
                        <span className="truncate">{votante.telefono || 'Sin registro'}</span>
                      </div>
                      <div className="flex items-center gap-3 truncate font-bold text-slate-700" title={liderNombre}>
                        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100"><UserCircle2 className="w-4 h-4 text-[#1e3a8a] shrink-0"/></div>
                        <span className="truncate">{liderNombre}</span>
                      </div>
                      <div className="flex items-center gap-3 truncate font-medium" title={`${votante.puesto} - Mesa ${votante.mesa}`}>
                        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100"><MapPin className="w-4 h-4 text-slate-400 shrink-0"/></div>
                        <span className="truncate">{votante.puesto || 'Puesto N/A'} {votante.mesa ? `(Mesa ${votante.mesa})` : ''}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
