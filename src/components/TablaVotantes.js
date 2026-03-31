import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export const TablaVotantes = ({ lista, votantes, lideres, isAdmin, mostrarLider = true, onEditarVotante, onEliminarVotante }) => {
  const [editandoVotante, setEditandoVotante] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState(null);
  const [mensajeErrorLocal, setMensajeErrorLocal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const iniciarEdicion = (v) => { 
    setEditandoVotante(v.id); 
    setDatosEdicion({...v}); 
    setMensajeErrorLocal(null);
  };
  
  const cancelarEdicion = () => { 
    setEditandoVotante(null); 
    setDatosEdicion(null); 
    setMensajeErrorLocal(null);
  };
  
  const guardarEdicion = async () => {
    setMensajeErrorLocal(null);
    setIsSaving(true);
    try {
      const { id, ...datos } = datosEdicion;
      if (onEditarVotante) await onEditarVotante(editandoVotante, datos);
      setEditandoVotante(null); 
      setDatosEdicion(null);
    } catch (error) {
      setMensajeErrorLocal(error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const eliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar a este votante de la base de datos?')) {
      if (onEliminarVotante) await onEliminarVotante(id);
    }
  };

  if (!lista || lista.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No hay votantes registrados en esta vista.</p>
        <p className="text-gray-400 text-sm mt-1">Cuando agregues nuevos registros aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {mensajeErrorLocal && (
        <div className="mx-4 my-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
          <span className="font-medium text-sm">⛔ {mensajeErrorLocal}</span>
          <button onClick={() => setMensajeErrorLocal(null)} className="text-red-500 hover:text-red-700 transition-colors font-bold ml-2">✕</button>
        </div>
      )}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/60">
            <th className="px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold text-slate-500 whitespace-nowrap">Documento</th>
            <th className="px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold text-slate-500 whitespace-nowrap">Nombre Completo</th>
            <th className="px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold text-slate-500 whitespace-nowrap">Teléfono</th>
            {mostrarLider && <th className="px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold text-slate-500 whitespace-nowrap">Líder Asignado</th>}
            <th className="px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold text-slate-500 whitespace-nowrap">Puesto</th>
            <th className="px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold text-slate-500 whitespace-nowrap">Estado</th>
            {isAdmin && <th className="px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold text-slate-500 whitespace-nowrap text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/50">
          {lista.map(votante => (
            <tr key={votante.id} className="hover:bg-slate-50/50 transition-colors group">
              {editandoVotante === votante.id ? (
                <>
                  <td className="px-5 py-3">
                    <input type="text" value={datosEdicion.documento} onChange={(e) => setDatosEdicion({...datosEdicion, documento: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm outline-none transition-all font-medium" />
                  </td>
                  <td className="px-5 py-3">
                    <input type="text" value={datosEdicion.nombreCompleto} onChange={(e) => setDatosEdicion({...datosEdicion, nombreCompleto: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm outline-none transition-all font-medium" />
                  </td>
                  <td className="px-5 py-3">
                    <input type="text" value={datosEdicion.telefono} onChange={(e) => setDatosEdicion({...datosEdicion, telefono: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm outline-none transition-all font-medium" />
                  </td>
                  {mostrarLider && (
                    <td className="px-5 py-3">
                      <select value={datosEdicion.liderAsignado} onChange={(e) => setDatosEdicion({...datosEdicion, liderAsignado: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm outline-none transition-all font-medium text-slate-700">
                        <option value="">Ninguno</option>
                        {lideres.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                      </select>
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <input type="text" value={datosEdicion.puesto} onChange={(e) => setDatosEdicion({...datosEdicion, puesto: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm outline-none transition-all font-medium" />
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${votante.yaVoto ? 'bg-emerald-500/10 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {votante.yaVoto ? 'Ya Votó' : 'Pendiente'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3 w-[180px]">
                      <div className="flex gap-2">
                        <button onClick={guardarEdicion} disabled={isSaving} className={`flex-1 py-2 text-white rounded-lg font-bold text-xs transition-all ${isSaving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-[#152a6b] shadow-sm'}`}>
                          {isSaving ? '⏳' : 'Guardar'}
                        </button>
                        <button onClick={cancelarEdicion} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold text-xs shadow-sm transition-all">
                          Cancelar
                        </button>
                      </div>
                    </td>
                  )}
                </>
              ) : (
                <>
                  <td className="px-5 py-4 text-sm text-slate-500 font-mono whitespace-nowrap">{votante.documento}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-800 whitespace-nowrap truncate max-w-[200px]" title={votante.nombreCompleto}>{votante.nombreCompleto}</td>
                  <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap font-medium">{votante.telefono || '-'}</td>
                  {mostrarLider && (
                    <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap truncate max-w-[150px] font-medium" title={lideres.find(l => l.id === votante.liderAsignado)?.nombre || 'Sin líder'}>
                      {lideres.find(l => l.id === votante.liderAsignado)?.nombre || <span className="text-slate-400 italic font-normal">Sin líder</span>}
                    </td>
                  )}
                  <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap truncate max-w-[150px] font-medium" title={votante.puesto}>{votante.puesto || '-'}</td>
                  <td className="px-5 py-4 whitespace-nowrap border-l border-transparent">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wide uppercase leading-none shadow-sm border ${votante.yaVoto ? 'bg-emerald-50 border-emerald-200/50 text-emerald-700' : 'bg-slate-50 border-slate-200/50 text-slate-500'}`}>
                      {votante.yaVoto ? 'VOTÓ ✓' : 'PENDIENTE'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => iniciarEdicion(votante)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar Votante">
                          <Pencil className="w-[18px] h-[18px]" />
                        </button>
                        <button onClick={() => eliminar(votante.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Eliminar Votante">
                          <Trash2 className="w-[18px] h-[18px]" />
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
    </div>
  );
};
