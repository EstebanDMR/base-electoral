import React, { useState } from 'react';
import { Users, Eye, EyeOff } from 'lucide-react';
import { registerUser, loginUser } from './authService';
import { useVotantesData } from './hooks/useVotantesData';
import { BusquedaView } from './views/BusquedaView';
import { VotantesView } from './views/VotantesView';
import { LideresView } from './views/LideresView';
import { EstadisticasView } from './views/EstadisticasView';

window.testRegistro = (email, password) => registerUser(email, password);
window.testLogin = (email, password) => loginUser(email, password);

const VotantesDB = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('busqueda');

  // Firebase data sync extracted to custom hook
  const { votantes, lideres, firebaseUser } = useVotantesData();

  const handleLogin = () => {
    if (password === 'admin2025') { 
      setIsAdmin(true); 
      setPassword(''); 
    } else {
      window.alert('Contraseña incorrecta');
    }
  };

  const votantesBusqueda = busqueda.trim() === '' ? [] : votantes.filter(v =>
    v.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) || v.documento.includes(busqueda)
  );

  const tabs = [
    { id: 'busqueda',     emoji: '🔍', label: 'Búsqueda' },
    ...(isAdmin ? [{ id: 'votantes', emoji: '👥', label: `Votantes (${votantes.length})` }] : []),
    { id: 'lideres',      emoji: '🎯', label: `Líderes (${lideres.length})` },
    { id: 'estadisticas', emoji: '📊', label: 'Estadísticas' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Users className="w-7 h-7 text-indigo-600 shrink-0" />
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Base de Datos Electoral</h1>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              🌐 En vivo
            </span>
          </div>
          {!isAdmin ? (
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Contraseña de administrador"
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button onClick={handleLogin} type="button"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap">
                Entrar como Admin
              </button>
              <span className="text-sm text-gray-600">👤 Rol: Usuario</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-semibold">✓ Rol: Administrador</span>
              <button onClick={() => { setIsAdmin(false); setVistaActual('busqueda'); }}
                className="text-sm text-gray-600 hover:text-gray-800">Cerrar sesión</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg mb-4 overflow-hidden">
          <div className="flex overflow-x-auto border-b">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setVistaActual(tab.id)}
                className={`flex-1 min-w-[70px] px-2 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
                  vistaActual === tab.id
                    ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline ml-1">{tab.label}</span>
                <span className="sm:hidden block text-xs">{tab.label.replace(/\s*\(\d+\)/, '')}</span>
              </button>
            ))}
          </div>
        </div>

        {vistaActual === 'busqueda' && (
          <BusquedaView
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            votantesBusqueda={votantesBusqueda}
            lideres={lideres}
            isAdmin={isAdmin}
            votantes={votantes}
          />
        )}

        {vistaActual === 'votantes' && isAdmin && (
          <VotantesView
            votantes={votantes}
            lideres={lideres}
            isAdmin={isAdmin}
          />
        )}

        {vistaActual === 'lideres' && (
          <LideresView
            votantes={votantes}
            lideres={lideres}
            isAdmin={isAdmin}
          />
        )}

        {vistaActual === 'estadisticas' && (
          <EstadisticasView
            votantes={votantes}
            lideres={lideres}
          />
        )}

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-4">
          <h3 className="font-bold text-gray-800 mb-2">ℹ️ Información del Sistema</h3>
          <p className="text-sm text-gray-600 mb-1">
            👤 <strong>Usuario Normal:</strong> Puede buscar votantes, ver líderes y marcar quién ya votó.
          </p>
          <p className="text-sm text-gray-600 mb-1">
            👨‍💼 <strong>Administrador:</strong> Acceso completo: agregar, editar, eliminar, exportar y desmarcar votos.
          </p>
          <p className="text-sm text-gray-600">
            🌐 <strong>Sincronización:</strong> Todos los cambios se sincronizan automáticamente en tiempo real.
          </p>
        </div>

      </div>
    </div>
  );
};

export default VotantesDB;