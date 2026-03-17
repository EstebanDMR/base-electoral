import React, { useState } from 'react';
import { update, remove, ref } from 'firebase/database';
import { database } from '../firebase';

export const TablaVotantes = ({
  lista,
  mostrarLider = true,
  isAdmin = false,
  lideres = [],
  votantes = []
}) => {
  const colBase = 8;
  const colTotal = colBase + (mostrarLider ? 1 : 0) + 1 + (isAdmin ? 1 : 0);
  
  const [editandoVotante, setEditandoVotante] = useState(null);
  const [datosEdicion, setDatosEdicion] = useState(null);
  const [mensajeErrorLocal, setMensajeErrorLocal] = useState(null);

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
    if (!datosEdicion.nombreCompleto || !datosEdicion.documento) { 
      setMensajeErrorLocal('Nombre y documento son obligatorios'); 
      return; 
    }
    const dup = votantes.find(v => v.documento === datosEdicion.documento && v.id !== editandoVotante);
    if (dup) { 
      setMensajeErrorLocal(`Esta cédula ya está registrada a nombre de: ${dup.nombreCompleto}`); 
      return; 
    }
    const { id, ...datos } = datosEdicion;
    await update(ref(database, `votantes/${editandoVotante}`), datos);
    setEditandoVotante(null); 
    setDatosEdicion(null);
  };
  
  const eliminarVotante = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este votante?')) {
      await remove(ref(database, `votantes/${id}`));
    }
  };

  return (
    <div className="overflow-x-auto">
      {mensajeErrorLocal && (
        <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-sm">{mensajeErrorLocal}</span>
          <button onClick={() => setMensajeErrorLocal(null)} className="text-red-600 hover:text-red-800 font-bold ml-2">✕</button>
        </div>
      )}
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
