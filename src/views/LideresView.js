import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ref, push, set, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { TablaVotantes } from '../components/TablaVotantes';

export const LideresView = ({
  votantes,
  lideres,
  isAdmin
}) => {
  const [nuevoLider, setNuevoLider] = useState({ nombre: '', telefono: '', zona: '' });
  const [lideresExpandidos, setLideresExpandidos] = useState(new Set());
  const [editandoLider, setEditandoLider] = useState(null);
  const [datosEdicionLider, setDatosEdicionLider] = useState(null);

  const toggleLider = (id) => {
    setLideresExpandidos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const agregarLider = async () => {
    if (!nuevoLider.nombre) { 
      window.alert('El nombre del líder es obligatorio'); 
      return; 
    }
    await set(push(ref(database, 'lideres')), { ...nuevoLider, fechaRegistro: new Date().toISOString() });
    setNuevoLider({ nombre: '', telefono: '', zona: '' });
  };

  const eliminarLider = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este líder?')) {
      await remove(ref(database, `lideres/${id}`));
    }
  };

  const iniciarEdicionLider = (l) => { setEditandoLider(l.id); setDatosEdicionLider({...l}); };
  const cancelarEdicionLider = () => { setEditandoLider(null); setDatosEdicionLider(null); };
  const guardarEdicionLider = async () => {
    if (!datosEdicionLider.nombre) { 
      window.alert('El nombre del líder es obligatorio'); 
      return; 
    }
    const { id, ...datos } = datosEdicionLider;
    await update(ref(database, `lideres/${editandoLider}`), datos);
    setEditandoLider(null); 
    setDatosEdicionLider(null);
  };

  return (
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
                    <TablaVotantes 
                      lista={vl} 
                      votantes={votantes} 
                      lideres={lideres} 
                      isAdmin={isAdmin} 
                      mostrarLider={false} 
                    />
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
                <TablaVotantes 
                  lista={sinLider} 
                  votantes={votantes} 
                  lideres={lideres} 
                  isAdmin={isAdmin} 
                  mostrarLider={false} 
                />
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
