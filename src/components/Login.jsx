import React, { useState } from 'react';
import { loginUser, registerUser } from '../authService';
import { Users, AlertCircle, Mail, Lock, Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [roleOption, setRoleOption] = useState('admin');
  const [teamCode, setTeamCode] = useState('');
  const { darkMode: d, toggleDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg('Por favor, completa todos los campos.');
      return;
    }
    
    if (isRegistering && roleOption === 'colaborador' && !teamCode.trim()) {
      setErrorMsg('Debes ingresar el Código de Equipo que te proporcionó tu administrador.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        await registerUser(email, password, roleOption, roleOption === 'colaborador' ? teamCode.trim() : null);
      } else {
        await loginUser(email, password);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error de autenticación. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const baseInputClass = d
    ? "w-full pl-11 pr-4 py-3.5 bg-[#0f172a] border rounded-[12px] transition-all outline-none text-white placeholder-slate-500 text-sm font-medium shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
    : "w-full pl-11 pr-4 py-3.5 bg-white border rounded-[12px] transition-all outline-none text-slate-800 placeholder-slate-400 text-sm font-medium shadow-sm focus:ring-4 focus:ring-[#1e3a8a]/10 focus:border-[#1e3a8a]";

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 font-sans relative overflow-hidden transition-colors duration-500 ${d ? 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]' : 'bg-gradient-to-br from-[#e1e7ef] via-[#cbd5e1] to-[#94a3b8]'}`}>
      
      {/* Botón Dark Mode flotante */}
      <button onClick={toggleDarkMode} 
        className={`absolute top-6 right-6 z-50 p-3 rounded-xl transition-all duration-300 border shadow-lg backdrop-blur-sm ${d ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-yellow-300' : 'bg-white/60 border-white/80 hover:bg-white/80 text-slate-600'}`}
        title={d ? 'Modo Claro' : 'Modo Oscuro'}>
        {d ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Patrones de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className={`absolute -top-[10%] -left-[10%] w-[50%] h-[50%] blur-[100px] rounded-full ${d ? 'bg-blue-900/20' : 'bg-white/20'}`}></div>
         <div className={`absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] blur-[120px] rounded-full ${d ? 'bg-slate-800/40' : 'bg-[#cbd5e1]/40'}`}></div>
      </div>

      {/* Tarjeta Flotante Principal */}
      <div className={`w-full max-w-[400px] rounded-[24px] border p-8 sm:p-10 relative z-10 transition-all duration-300 backdrop-blur-md ${d ? 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-slate-700/60' : 'bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-white/60'}`}>
        
        <div className="flex flex-col items-center mb-8">
          {/* Ícono superior */}
          <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center mb-6 border overflow-hidden relative ${d ? 'bg-slate-800 shadow-[0_8px_16px_rgba(0,0,0,0.2)] border-slate-700' : 'bg-white shadow-[0_8px_16px_rgba(0,0,0,0.04)] border-white'}`}>
             <div className={`absolute inset-0 ${d ? 'bg-gradient-to-b from-slate-800 to-slate-900' : 'bg-gradient-to-b from-white to-slate-50'}`}></div>
            <Users className={`w-8 h-8 relative z-10 ${d ? 'text-blue-400' : 'text-[#1e3a8a]'}`} strokeWidth={2} />
          </div>
          
          <h1 className={`text-2xl font-extrabold text-center tracking-tight mb-2 drop-shadow-sm ${d ? 'text-white' : 'text-slate-900'}`}>
            {isRegistering ? 'Crea tu cuenta' : 'Acceso al Sistema'}
          </h1>
          
          <p className={`text-[13px] text-center font-semibold max-w-[280px] leading-relaxed ${d ? 'text-slate-400' : 'text-slate-500'}`}>
            {isRegistering ? 'Comienza a gestionar tu base de datos electoral hoy.' : 'Gestiona tu base de datos electoral de forma segura.'}
          </p>
        </div>

        {errorMsg && (
          <div className={`mb-6 backdrop-blur-sm border px-4 py-3.5 rounded-xl flex items-start gap-3 text-sm animate-in fade-in zoom-in-95 shadow-sm ${d ? 'bg-red-900/30 border-red-900/40 text-red-400' : 'bg-red-50/80 border-red-200/60 text-red-700'}`}>
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3.5">
            <div className="relative group">
              <Mail className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${d ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-[#1e3a8a]'}`} />
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${baseInputClass} ${d ? 'border-slate-600' : 'border-[#1e3a8a]/40'}`}
              />
            </div>
            <div className="relative group">
              <Lock className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${d ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-[#1e3a8a]'}`} />
              <input 
                type="password" 
                placeholder="Contraseña (Mín. 6 caracteres)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${baseInputClass} ${d ? 'border-slate-600' : 'border-slate-200'}`}
              />
            </div>
          </div>
          
          {isRegistering && (
            <div className={`flex flex-col gap-3 py-4 border-t mt-2 ${d ? 'border-slate-700/60' : 'border-slate-200/60'}`}>
              <label className={`flex items-center gap-3 text-sm cursor-pointer font-bold p-3.5 rounded-xl transition-all border shadow-sm backdrop-blur-sm ${d ? 'text-slate-300 hover:bg-slate-700/50 bg-slate-800/50 border-transparent hover:border-slate-700 hover:shadow-md' : 'text-slate-700 hover:bg-white/50 bg-white/30 border-transparent hover:border-white hover:shadow-md'}`}>
                <input type="radio" name="roleOption" value="admin" checked={roleOption === 'admin'} onChange={(e) => setRoleOption(e.target.value)} className="w-4 h-4 text-[#1e3a8a] focus:ring-[#1e3a8a] border-slate-300" />
                <span>Equipo Administrador</span>
              </label>
              <label className={`flex items-center gap-3 text-sm cursor-pointer font-bold p-3.5 rounded-xl transition-all border shadow-sm backdrop-blur-sm ${d ? 'text-slate-300 hover:bg-slate-700/50 bg-slate-800/50 border-transparent hover:border-slate-700 hover:shadow-md' : 'text-slate-700 hover:bg-white/50 bg-white/30 border-transparent hover:border-white hover:shadow-md'}`}>
                <input type="radio" name="roleOption" value="colaborador" checked={roleOption === 'colaborador'} onChange={(e) => setRoleOption(e.target.value)} className="w-4 h-4 text-[#1e3a8a] focus:ring-[#1e3a8a] border-slate-300" />
                <span>Unirme a Colaboradores</span>
              </label>
              
              {roleOption === 'colaborador' && (
                <div className="mt-2 animate-in slide-in-from-top-2 fade-in relative px-1">
                  <input type="text" placeholder="Código de Equipo (Ej: abc123def456)" value={teamCode} onChange={(e) => setTeamCode(e.target.value)} className={`${baseInputClass} !pl-4 !py-3 ${d ? 'border-slate-600' : 'border-[#1e3a8a]/20 bg-white/80'}`} />
                  <p className={`text-[11px] mt-2 font-bold uppercase tracking-wider text-center ${d ? 'text-slate-500' : 'text-slate-500'}`}>Solicita el código al administrador.</p>
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3.5 px-4 text-white rounded-[12px] font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 mt-8 ${isLoading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-b from-[#1e3a8a] to-[#152a6b] hover:to-[#0f1d4a] hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm shadow-[0_8px_20px_-6px_rgba(30,58,138,0.5)]'}`}
          >
            {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></span> : (isRegistering ? 'Comenzar Ahora' : 'Ingresar al Panel')}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center pt-2">
          <p className={`text-[13px] font-bold ${d ? 'text-slate-500' : 'text-slate-500'}`}>
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button 
              type="button" 
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(null); }}
              className={`ml-1.5 font-extrabold transition-colors ${d ? 'text-blue-400 hover:text-blue-300' : 'text-[#1e3a8a] hover:text-[#0f1d4a]'}`}
            >
              {isRegistering ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
