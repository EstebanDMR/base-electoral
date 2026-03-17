import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { ref, push, set, remove } from 'firebase/database';
import { database } from '../firebase';
import { exportarAExcel } from '../utils/exportarVotantes';
import { TablaVotantes } from '../components/TablaVotantes';

export const VotantesView = ({
  votantes,
  lideres,
  isAdmin
}) => {
  const [nuevoVotante, setNuevoVotante] = useState({
    nombreCompleto: '', documento: '', telefono: '', direccion: '',
    barrio: '', municipio: '', mesa: '', puesto: '', liderAsignado: ''
  });
  const [mensajeError, setMensajeError] = useState(null);

  const eliminarTodosLosVotantes = async () => {
    if (window.confirm('⚠️ ¿Estás seguro de que deseas ELIMINAR TODA LA LISTA DE VOTANTES? Esta acción no se puede deshacer.')) {
      if (window.confirm('⛔ ÚLTIMA CONFIRMACIÓN: Se eliminarán todos los votantes permanentemente. ¿Continuar?')) {
        await remove(ref(database, 'votantes'));
      }
    }
  };

  const agregarVotante = async () => {
    setMensajeError(null);
    if (!nuevoVotante.nombreCompleto || !nuevoVotante.documento) { 
      setMensajeError('Nombre y documento son obligatorios'); 
      return; 
    }
    const dup = votantes.find(v => v.documento === nuevoVotante.documento);
    if (dup) { 
      setMensajeError(`Esta cédula ya está registrada a nombre de: ${dup.nombreCompleto}`); 
      return; 
    }
    await set(push(ref(database, 'votantes')), { ...nuevoVotante, yaVoto: false, fechaRegistro: new Date().toISOString() });
    setNuevoVotante({ nombreCompleto: '', documento: '', telefono: '', direccion: '', barrio: '', municipio: '', mesa: '', puesto: '', liderAsignado: '' });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-800">Lista Completa de Votantes</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportarAExcel(votantes, lideres)}
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
        <TablaVotantes 
          lista={votantes} 
          votantes={votantes} 
          lideres={lideres} 
          isAdmin={isAdmin} 
          mostrarLider={true} 
        />
      </div>
    </div>
  );
};
