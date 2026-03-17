import React from 'react';
import { Search } from 'lucide-react';
import { ref, update } from 'firebase/database';
import { database } from '../firebase';

export const BusquedaView = ({
  busqueda,
  setBusqueda,
  votantesBusqueda,
  lideres,
  isAdmin,
  votantes
}) => {
  const toggleYaVoto = async (id) => {
    const v = votantesBusqueda.find(vo => vo.id === id) || votantes.find(vo => vo.id === id);
    if (v) {
      if (v.yaVoto && !isAdmin) { 
        window.alert('Solo el administrador puede desmarcar un voto'); 
        return; 
      }
      await update(ref(database, `votantes/${id}`), { yaVoto: !v.yaVoto });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Buscar Votantes</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar por nombre o documento..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-base" />
        </div>
      </div>

      {busqueda.trim() === '' ? (
        <div className="bg-white rounded-lg shadow-lg p-10 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">Escribe un nombre o documento para buscar</p>
        </div>
      ) : votantesBusqueda.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-10 text-center text-gray-500">
          <p className="text-lg">No se encontraron resultados para "<strong>{busqueda}</strong>"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {votantesBusqueda.map(votante => {
            const liderNombre = lideres.find(l => l.id === votante.liderAsignado)?.nombre || '-';
            return (
              <div key={votante.id} className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg text-gray-800">{votante.nombreCompleto}</p>
                    <p className="text-gray-500 font-mono text-sm">{votante.documento}</p>
                  </div>
                  <button onClick={() => toggleYaVoto(votante.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors shrink-0 ml-2 ${
                      votante.yaVoto
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}>
                    {votante.yaVoto ? '✓ Votó' : 'Marcar voto'}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm text-gray-600">
                  <div><span className="font-medium text-gray-700">📞</span> {votante.telefono || '-'}</div>
                  <div><span className="font-medium text-gray-700">🏫 Puesto:</span> {votante.puesto || '-'}</div>
                  <div><span className="font-medium text-gray-700">🗳️ Mesa:</span> {votante.mesa || '-'}</div>
                  <div><span className="font-medium text-gray-700">🏘️ Barrio:</span> {votante.barrio || '-'}</div>
                  <div><span className="font-medium text-gray-700">🏙️ Municipio:</span> {votante.municipio || '-'}</div>
                  <div><span className="font-medium text-gray-700">👤 Líder:</span> {liderNombre}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
