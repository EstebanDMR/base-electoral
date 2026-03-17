import React from 'react';
import { Users, BarChart3 } from 'lucide-react';

export const EstadisticasView = ({ votantes, lideres }) => {
  const stats = {
    totalVotantes: votantes.length,
    totalLideres: lideres.length,
    yaVotaron: votantes.filter(v => v.yaVoto).length,
    votantesPorLider: lideres.map(l => {
      const vl = votantes.filter(v => v.liderAsignado === l.id);
      const yv = vl.filter(v => v.yaVoto).length;
      return { nombre: l.nombre, cantidad: vl.length, yaVotaron: yv, faltan: vl.length - yv };
    })
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total Votantes', value: stats.totalVotantes, color: 'text-indigo-600', Icon: Users,     ic: 'text-indigo-200' },
          { label: 'Ya Votaron',     value: stats.yaVotaron,     color: 'text-green-600',  Icon: BarChart3, ic: 'text-green-200',
            sub: `${stats.totalVotantes > 0 ? Math.round((stats.yaVotaron/stats.totalVotantes)*100) : 0}% del total` },
          { label: 'Total Líderes',  value: stats.totalLideres,  color: 'text-purple-600', Icon: Users,     ic: 'text-purple-200' },
          { label: 'Prom. / Líder',  value: stats.totalLideres > 0 ? Math.round(stats.totalVotantes/stats.totalLideres) : 0,
            color: 'text-orange-600', Icon: BarChart3, ic: 'text-orange-200' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">{item.label}</p>
                <p className={`text-3xl sm:text-4xl font-bold ${item.color}`}>{item.value}</p>
                {item.sub && <p className="text-xs text-gray-500 mt-1">{item.sub}</p>}
              </div>
              <item.Icon className={`w-8 h-8 sm:w-12 sm:h-12 ${item.ic}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Votantes por Líder</h2>
        <div className="space-y-4">
          {stats.votantesPorLider.sort((a,b) => b.cantidad - a.cantidad).map((item, idx) => (
            <div key={idx} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">{item.nombre}</span>
                <span className="text-sm text-gray-600">Total: {item.cantidad}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                  <div className="text-green-600 text-xs font-medium">Ya votaron</div>
                  <div className="text-green-800 text-xl sm:text-2xl font-bold">{item.yaVotaron}</div>
                </div>
                <div className="bg-orange-50 p-2 sm:p-3 rounded-lg">
                  <div className="text-orange-600 text-xs font-medium">Faltan</div>
                  <div className="text-orange-800 text-xl sm:text-2xl font-bold">{item.faltan}</div>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-5">
                <div className="bg-indigo-600 h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${item.cantidad > 0 ? (item.cantidad/stats.totalVotantes)*100 : 0}%` }}>
                  <span className="text-white font-semibold text-xs">{item.cantidad}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
