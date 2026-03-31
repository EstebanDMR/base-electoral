import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export const TablaVotantes = ({ lista, votantes, lideres, isAdmin, mostrarLider = true, onEditarVotante, onEliminarVotante }) => {
  const [editandoVotante, setEditandoVotante] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState(null);
  const [mensajeErrorLocal, setMensajeErrorLocal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { darkMode: d } = useTheme();

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

  const editInputClass = d
    ? "w-full px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition-all font-medium text-white"
    : "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-sm outline-none transition-all font-medium";

  if (!lista || lista.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${d ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
          <svg className={`w-8 h-8 ${d ? 'text-slate-600' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className={`font-medium ${d ? 'text-slate-400' : 'text-gray-500'}`}>No hay votantes registrados en esta vista.</p>
        <p className={`text-sm mt-1 ${d ? 'text-slate-500' : 'text-gray-400'}`}>Cuando agregues nuevos registros aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {mensajeErrorLocal && (
        <div className={`mx-4 my-3 border px-4 py-3 rounded-xl flex items-center justify-between shadow-sm ${d ? 'bg-red-900/20 border-red-900/30 text-red-400' : 'bg-red-50 border-red-100 text-red-700'}`}>
          <span className="font-medium text-sm">{mensajeErrorLocal}</span>
          <button onClick={() => setMensajeErrorLocal(null)} className="text-red-500 hover:text-red-700 transition-colors font-bold ml-2">✕</button>
        </div>
      )}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`border-b ${d ? 'bg-[#0f172a]/50 border-slate-700' : 'bg-slate-50/80 border-slate-200/60'}`}>
            <th className={`px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold whitespace-nowrap ${d ? 'text-slate-400' : 'text-slate-500'}`}>Documento</th>
            <th className={`px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold whitespace-nowrap ${d ? 'text-slate-400' : 'text-slate-500'}`}>Nombre Completo</th>
            <th className={`px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold whitespace-nowrap ${d ? 'text-slate-400' : 'text-slate-500'}`}>Teléfono</th>
            {mostrarLider && <th className={`px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold whitespace-nowrap ${d ? 'text-slate-400' : 'text-slate-500'}`}>Líder Asignado</th>}
            <th className={`px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold whitespace-nowrap ${d ? 'text-slate-400' : 'text-slate-500'}`}>Puesto</th>
            <th className={`px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold whitespace-nowrap ${d ? 'text-slate-400' : 'text-slate-500'}`}>Estado</th>
            {isAdmin && <th className={`px-5 py-4 text-[11px] uppercase tracking-widest font-extrabold whitespace-nowrap text-right ${d ? 'text-slate-400' : 'text-slate-500'}`}>Acciones</th>}
          </tr>
        </thead>
        <tbody className={`divide-y ${d ? 'divide-slate-700/50' : 'divide-slate-100/50'}`}>
          {lista.map(votante => (
            <tr key={votante.id} className={`transition-colors group ${d ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50/50'}`}>
              {editandoVotante === votante.id ? (
                <>
                  <td className="px-5 py-3">
                    <input type="text" value={datosEdicion.documento} onChange={(e) => setDatosEdicion({...datosEdicion, documento: e.target.value})} className={editInputClass} />
                  </td>
                  <td className="px-5 py-3">
                    <input type="text" value={datosEdicion.nombreCompleto} onChange={(e) => setDatosEdicion({...datosEdicion, nombreCompleto: e.target.value})} className={editInputClass} />
                  </td>
                  <td className="px-5 py-3">
                    <input type="text" value={datosEdicion.telefono} onChange={(e) => setDatosEdicion({...datosEdicion, telefono: e.target.value})} className={editInputClass} />
                  </td>
                  {mostrarLider && (
                    <td className="px-5 py-3">
                      <select value={datosEdicion.liderAsignado} onChange={(e) => setDatosEdicion({...datosEdicion, liderAsignado: e.target.value})} className={editInputClass}>
                        <option value="">Ninguno</option>
                        {lideres.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                      </select>
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <input type="text" value={datosEdicion.puesto} onChange={(e) => setDatosEdicion({...datosEdicion, puesto: e.target.value})} className={editInputClass} />
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${votante.yaVoto ? 'bg-emerald-500/10 text-emerald-700' : (d ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                      {votante.yaVoto ? 'Ya Votó' : 'Pendiente'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3 w-[180px]">
                      <div className="flex gap-2">
                        <button onClick={guardarEdicion} disabled={isSaving} className={`flex-1 py-2 text-white rounded-lg font-bold text-xs transition-all ${isSaving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-[#152a6b] shadow-sm'}`}>
                          {isSaving ? '...' : 'Guardar'}
                        </button>
                        <button onClick={cancelarEdicion} className={`flex-1 py-2 border rounded-lg font-bold text-xs shadow-sm transition-all ${d ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                          Cancelar
                        </button>
                      </div>
                    </td>
                  )}
                </>
              ) : (
                <>
                  <td className={`px-5 py-4 text-sm font-mono whitespace-nowrap ${d ? 'text-slate-400' : 'text-slate-500'}`}>{votante.documento}</td>
                  <td className={`px-5 py-4 text-sm font-bold whitespace-nowrap truncate max-w-[200px] ${d ? 'text-white' : 'text-slate-800'}`} title={votante.nombreCompleto}>{votante.nombreCompleto}</td>
                  <td className={`px-5 py-4 text-sm whitespace-nowrap font-medium ${d ? 'text-slate-400' : 'text-slate-600'}`}>{votante.telefono || '-'}</td>
                  {mostrarLider && (
                    <td className={`px-5 py-4 text-sm whitespace-nowrap truncate max-w-[150px] font-medium ${d ? 'text-slate-400' : 'text-slate-600'}`} title={lideres.find(l => l.id === votante.liderAsignado)?.nombre || 'Sin líder'}>
                      {lideres.find(l => l.id === votante.liderAsignado)?.nombre || <span className={`italic font-normal ${d ? 'text-slate-600' : 'text-slate-400'}`}>Sin líder</span>}
                    </td>
                  )}
                  <td className={`px-5 py-4 text-sm whitespace-nowrap truncate max-w-[150px] font-medium ${d ? 'text-slate-400' : 'text-slate-600'}`} title={votante.puesto}>{votante.puesto || '-'}</td>
                  <td className="px-5 py-4 whitespace-nowrap border-l border-transparent">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wide uppercase leading-none shadow-sm border ${
                      votante.yaVoto 
                        ? (d ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200/50 text-emerald-700')
                        : (d ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-slate-50 border-slate-200/50 text-slate-500')
                    }`}>
                      {votante.yaVoto ? 'VOTÓ ✓' : 'PENDIENTE'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => iniciarEdicion(votante)} className={`p-1.5 rounded-lg transition-all ${d ? 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/10' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`} title="Editar Votante">
                          <Pencil className="w-[18px] h-[18px]" />
                        </button>
                        <button onClick={() => eliminar(votante.id)} className={`p-1.5 rounded-lg transition-all ${d ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`} title="Eliminar Votante">
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
