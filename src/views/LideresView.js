import React, { useState } from 'react';
import { ChevronDown, AlertCircle, CheckCircle2, LayoutDashboard, Users, Shield } from 'lucide-react';
import { TablaVotantes } from '../components/TablaVotantes';
import { useTheme } from '../ThemeContext';

export const LideresView = ({
  votantes,
  lideres,
  isAdmin,
  onAgregarLider,
  onEditarLider,
  onEliminarLider,
  onEditarVotante,
  onEliminarVotante
}) => {
  const [nuevoLider, setNuevoLider] = useState({ nombre: '', telefono: '', zona: '' });
  const [lideresExpandidos, setLideresExpandidos] = useState(new Set());
  const [editandoLider, setEditandoLider] = useState(null);
  const [datosEdicionLider, setDatosEdicionLider] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [mensajeError, setMensajeError] = useState(null);
  const { darkMode: d } = useTheme();

  const toggleLider = (id) => {
    setLideresExpandidos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const agregarLider = async () => {
    setMensajeError(null);
    setMensajeExito(null);
    setIsSaving(true);
    try {
      await onAgregarLider(nuevoLider);
      setNuevoLider({ nombre: '', telefono: '', zona: '' });
      setMensajeExito('Líder registrado correctamente.');
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const eliminarLider = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este líder permanentemente? Los votantes asignados quedarán sin líder.')) {
      await onEliminarLider(id);
    }
  };

  const iniciarEdicionLider = (l) => { setEditandoLider(l.id); setDatosEdicionLider({...l}); };
  const cancelarEdicionLider = () => { setEditandoLider(null); setDatosEdicionLider(null); };
  
  const guardarEdicionLider = async () => {
    setMensajeError(null);
    setMensajeExito(null);
    setIsSaving(true);
    try {
      const { id, ...datos } = datosEdicionLider;
      await onEditarLider(editandoLider, datos);
      setEditandoLider(null); 
      setDatosEdicionLider(null);
      setMensajeExito('Datos del líder actualizados.');
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = d
    ? "w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-[12px] focus:bg-[#0f172a] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-white placeholder-slate-500 text-sm font-medium"
    : "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[12px] focus:bg-white focus:ring-4 focus:ring-[#1e3a8a]/10 focus:border-[#1e3a8a] transition-all outline-none text-slate-800 placeholder-slate-400 text-sm font-medium";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="mb-8">
         <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${d ? 'text-white' : 'text-slate-900'}`}>Estructura de Líderes</h2>
         <p className={`font-medium mt-1 ${d ? 'text-slate-400' : 'text-slate-500'}`}>Coordina tu equipo territorial y analiza su desempeño.</p>
      </div>

      {/* Banners */}
      {mensajeError && (
        <div className={`border px-5 py-4 rounded-[16px] flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${d ? 'bg-red-900/20 border-red-900/30 text-red-400' : 'bg-red-50 border-red-100 text-red-800'}`}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-bold text-sm tracking-wide">{mensajeError}</span>
          </div>
          <button onClick={() => setMensajeError(null)} className="text-red-400 hover:text-red-600 transition-colors p-1">✕</button>
        </div>
      )}

      {mensajeExito && (
        <div className={`border px-5 py-4 rounded-[16px] flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${d ? 'bg-emerald-900/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-sm tracking-wide">{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-400 hover:text-emerald-600 transition-colors p-1">✕</button>
        </div>
      )}

      {isAdmin && (
        <div className={`rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border p-6 sm:p-8 relative overflow-hidden mb-8 ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-lg font-extrabold mb-6 flex items-center gap-2 ${d ? 'text-white' : 'text-slate-900'}`}>
            <Shield className={`w-5 h-5 ${d ? 'text-blue-400' : 'text-[#1e3a8a]'}`} />
            Nombrar Nuevo Líder
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <input type="text" placeholder="Nombre completo *" value={nuevoLider.nombre} onChange={(e) => setNuevoLider({...nuevoLider, nombre: e.target.value})} className={inputClass} />
            <input type="text" placeholder="Teléfono" value={nuevoLider.telefono} onChange={(e) => setNuevoLider({...nuevoLider, telefono: e.target.value})} className={inputClass} />
            <input type="text" placeholder="Zona territorial / Sector" value={nuevoLider.zona} onChange={(e) => setNuevoLider({...nuevoLider, zona: e.target.value})} className={inputClass} />
          </div>
          <div className="mt-8 flex justify-end">
            <button onClick={agregarLider} disabled={isSaving}
              className={`px-8 py-4 text-white rounded-xl font-bold tracking-wide transition-all duration-200 shadow-sm flex items-center gap-2 ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-[#152a6b] hover:shadow-lg hover:-translate-y-0.5'}`}>
              {isSaving ? (
                <><span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></span> Procesando...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Registrar Líder</>
              )}
            </button>
          </div>
        </div>
      )}

      {lideres.length === 0 ? (
        <div className={`rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border px-6 py-16 text-center flex flex-col items-center ${d ? 'bg-[#1e293b] border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-400'}`}>
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 border ${d ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <Users className={`w-10 h-10 ${d ? 'text-slate-600' : 'text-slate-300'}`} />
          </div>
          <p className={`text-lg font-extrabold mb-1 ${d ? 'text-slate-300' : 'text-slate-600'}`}>Estructura Vacía</p>
          <p className="text-sm font-medium">Agrega a tu primer líder para comenzar a delegar zonas territoriales.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lideres.map(lider => {
            const vl = votantes.filter(v => v.liderAsignado === lider.id);
            const yv = vl.filter(v => v.yaVoto).length;
            const pct = vl.length > 0 ? Math.round((yv / vl.length) * 100) : 0;
            const expandido = lideresExpandidos.has(lider.id);

            return (
              <div key={lider.id} className={`rounded-[24px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border overflow-hidden transition-all duration-300 ${d ? 'bg-[#1e293b] border-slate-700 hover:shadow-lg' : 'bg-white border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]'}`}>
                <div
                  className={`p-5 lg:p-6 transition-colors select-none ${editandoLider !== lider.id ? `cursor-pointer ${d ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50/50'}` : ''}`}
                  onClick={() => editandoLider !== lider.id && toggleLider(lider.id)}
                >
                  {editandoLider === lider.id ? (
                    <div className="flex flex-col sm:flex-row gap-4" onClick={e => e.stopPropagation()}>
                      {['nombre','telefono','zona'].map(f => (
                        <input key={f} type="text" value={datosEdicionLider[f] || ''} onChange={(e) => setDatosEdicionLider({...datosEdicionLider, [f]: e.target.value})} placeholder={f} className={inputClass} />
                      ))}
                      <div className="flex gap-2 min-w-[200px]">
                        <button onClick={guardarEdicionLider} disabled={isSaving} className={`flex-1 py-3 text-white rounded-[12px] font-bold text-sm transition-all ${isSaving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-[#152a6b] shadow-sm hover:shadow-md'}`}>
                          {isSaving ? '...' : 'Guardar'}
                        </button>
                        <button onClick={cancelarEdicionLider} className={`flex-1 py-3 border rounded-[12px] font-bold text-sm transition-all shadow-sm ${d ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative group">
                      
                      <div className="flex-[3] min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                          <span className={`font-extrabold text-xl tracking-tight leading-none ${d ? 'text-white' : 'text-slate-900'}`}>{lider.nombre}</span>
                          <span className={`text-[13px] font-semibold flex items-center gap-1.5 ml-2 ${d ? 'text-slate-400' : 'text-slate-500'}`}>
                            <LayoutDashboard className={`w-[14px] h-[14px] ${d ? 'text-slate-500' : 'text-slate-400'}`}/> {lider.zona || 'Sin Zona'}
                          </span>
                          {lider.telefono && (
                            <span className={`text-[13px] font-semibold flex items-center gap-1 ${d ? 'text-slate-400' : 'text-slate-500'}`}>
                               <svg className={`w-[14px] h-[14px] ${d ? 'text-slate-500' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> 
                               {lider.telefono}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 max-w-sm">
                          <div className={`flex-1 rounded-full h-2.5 overflow-hidden border ${d ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200/50'}`}>
                            <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-[11px] font-black whitespace-nowrap shrink-0 tracking-wider ${d ? 'text-slate-500' : 'text-slate-400'}`}>
                            {pct}% RENDIMIENTO
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end flex-[2]">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#243c7c] text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-sm uppercase tracking-widest border border-[#1a2d5e]">
                            <Users className="w-4 h-4 opacity-70" /> {vl.length} VOTANTES
                          </span>
                          <span className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-sm uppercase tracking-widest border ${d ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}>
                            <CheckCircle2 className={`w-4 h-4 ${d ? 'text-emerald-400' : 'text-emerald-500'}`} /> {yv} VOTOS
                          </span>
                        </div>

                        {isAdmin && (
                          <div className={`flex items-center gap-3 ml-2 pl-4 border-l ${d ? 'border-slate-700' : 'border-slate-200'}`} onClick={e => e.stopPropagation()}>
                            <button onClick={() => iniciarEdicionLider(lider)} title="Editar Líder" className={`transition-colors p-1 ${d ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-slate-800'}`}>
                               <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button onClick={() => eliminarLider(lider.id)} title="Eliminar Líder" className={`transition-colors p-1 ${d ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}>
                               <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                {expandido && editandoLider !== lider.id && (
                  <div className={`border-t p-2 ${d ? 'border-slate-700 bg-[#0f172a]/30' : 'border-slate-100 bg-slate-50/30'}`}>
                    <TablaVotantes 
                      lista={vl} 
                      votantes={votantes} 
                      lideres={lideres} 
                      isAdmin={isAdmin} 
                      mostrarLider={false} 
                      onEditarVotante={onEditarVotante}
                      onEliminarVotante={onEliminarVotante}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Votantes sin líder */}
      {(() => {
        const sinLider = votantes.filter(v => !v.liderAsignado || !lideres.find(l => l.id === v.liderAsignado));
        if (sinLider.length === 0) return null;
        const expandido = lideresExpandidos.has('__sin_lider__');
        return (
          <div className={`rounded-[24px] shadow-sm border border-dashed overflow-hidden mt-8 ${d ? 'bg-[#1e293b] border-slate-600' : 'bg-white border-slate-300'}`}>
            <div className={`p-6 cursor-pointer select-none flex items-center justify-between transition-colors ${d ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50/50'}`}
              onClick={() => toggleLider('__sin_lider__')}>
              <div className="flex items-center gap-4">
                <span className={`font-bold italic ${d ? 'text-slate-400' : 'text-slate-500'}`}>Votantes sin líder asignado</span>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-widest shadow-sm border ${d ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {sinLider.length} Registros
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${d ? 'text-slate-500' : 'text-slate-400'} ${expandido ? 'rotate-180' : ''}`} />
            </div>
            {expandido && (
              <div className={`border-t p-2 ${d ? 'border-slate-700 bg-[#0f172a]/30' : 'border-slate-100 bg-slate-50/30'}`}>
                <TablaVotantes 
                  lista={sinLider} 
                  votantes={votantes} 
                  lideres={lideres} 
                  isAdmin={isAdmin} 
                  mostrarLider={false} 
                  onEditarVotante={onEditarVotante}
                  onEliminarVotante={onEliminarVotante}
                />
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
