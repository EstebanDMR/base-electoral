import React, { useState } from 'react';
import { loginUser, registerUser } from '../authService';
import { Users, AlertCircle, Mail, Lock } from 'lucide-react';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [roleOption, setRoleOption] = useState('admin');
  const [teamCode, setTeamCode] = useState('');

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

  const baseInputClass = "w-full pl-11 pr-4 py-3.5 bg-white border rounded-[12px] transition-all outline-none text-slate-800 placeholder-slate-400 text-sm font-medium shadow-sm focus:ring-4 focus:ring-[#1e3a8a]/10 focus:border-[#1e3a8a]";

  return (
    // Fondo principal: Gradiente similar a la imagen (tonos fríos/plata)
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 font-sans bg-gradient-to-br from-[#e1e7ef] via-[#cbd5e1] to-[#94a3b8] relative overflow-hidden">
      
      {/* Patrones de fondo sutiles (simulados con blur y posicionamiento radial) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-white/20 blur-[100px] rounded-full"></div>
         <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-[#cbd5e1]/40 blur-[120px] rounded-full"></div>
      </div>

      {/* Tarjeta Flotante Principal */}
      <div className="w-full max-w-[400px] bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/60 p-8 sm:p-10 relative z-10 transition-all duration-300 backdrop-blur-md">
        
        <div className="flex flex-col items-center mb-8">
          {/* Ícono superior */}
          <div className="w-16 h-16 bg-white rounded-[20px] flex items-center justify-center mb-6 shadow-[0_8px_16px_rgba(0,0,0,0.04)] border border-white overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50"></div>
            <Users className="w-8 h-8 text-[#1e3a8a] relative z-10" strokeWidth={2} />
          </div>
          
          <h1 className="text-2xl font-extrabold text-slate-900 text-center tracking-tight mb-2 drop-shadow-sm">
            {isRegistering ? 'Crea tu cuenta' : 'Acceso al Sistema'}
          </h1>
          
          <p className="text-slate-500 text-[13px] text-center font-semibold max-w-[280px] leading-relaxed">
            {isRegistering ? 'Comienza a gestionar tu base de datos electoral hoy.' : 'Gestiona tu base de datos electoral de forma segura.'}
          </p>
          
          {/* DEPÚRACIÓN VISUAL (TEMPORAL) */}
          {localStorage.getItem('authErrorDebug') && (
             <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs w-full break-all">
                <strong className="block mb-1">Error Interno Firebase:</strong>
                {localStorage.getItem('authErrorDebug')}
                <button 
                  onClick={() => { localStorage.removeItem('authErrorDebug'); window.location.reload(); }} 
                  className="mt-2 text-red-600 underline font-bold w-full text-right block">
                  Limpiar esto
                </button>
             </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200/60 text-red-700 px-4 py-3.5 rounded-xl flex items-start gap-3 text-sm animate-in fade-in zoom-in-95 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3.5">
            <div className="relative group">
              <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#1e3a8a]" />
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${baseInputClass} border-[#1e3a8a]/40`} // Borde azulado sutil como en la imagen
              />
            </div>
            <div className="relative group">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#1e3a8a]" />
              <input 
                type="password" 
                placeholder="Contraseña (Mín. 6 caracteres)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${baseInputClass} border-slate-200`} // Borde neutral
              />
            </div>
          </div>
          
          {isRegistering && (
            <div className="flex flex-col gap-3 py-4 border-t border-slate-200/60 mt-2">
              <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer font-bold hover:bg-white/50 p-3.5 rounded-xl transition-all border border-transparent hover:border-white shadow-sm hover:shadow-md bg-white/30 backdrop-blur-sm">
                <input type="radio" name="roleOption" value="admin" checked={roleOption === 'admin'} onChange={(e) => setRoleOption(e.target.value)} className="w-4 h-4 text-[#1e3a8a] focus:ring-[#1e3a8a] border-slate-300" />
                <span>Equipo Administrador</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer font-bold hover:bg-white/50 p-3.5 rounded-xl transition-all border border-transparent hover:border-white shadow-sm hover:shadow-md bg-white/30 backdrop-blur-sm">
                <input type="radio" name="roleOption" value="colaborador" checked={roleOption === 'colaborador'} onChange={(e) => setRoleOption(e.target.value)} className="w-4 h-4 text-[#1e3a8a] focus:ring-[#1e3a8a] border-slate-300" />
                <span>Unirme a Colaboradores</span>
              </label>
              
              {roleOption === 'colaborador' && (
                <div className="mt-2 animate-in slide-in-from-top-2 fade-in relative px-1">
                  <input type="text" placeholder="Código de Equipo (Ej: abc123def456)" value={teamCode} onChange={(e) => setTeamCode(e.target.value)} className={`${baseInputClass} !py-3 bg-white/80 border-[#1e3a8a]/20`} />
                  <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wider text-center">Solicita el código al administrador.</p>
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3.5 px-4 text-white rounded-[12px] font-bold tracking-wide transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(30,58,138,0.5)] flex items-center justify-center gap-2 mt-8 ${isLoading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-b from-[#1e3a8a] to-[#152a6b] hover:to-[#0f1d4a] hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm'}`}
          >
            {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></span> : (isRegistering ? 'Comenzar Ahora' : 'Ingresar al Panel')}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center pt-2">
          <p className="text-[13px] text-slate-500 font-bold">
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button 
              type="button" 
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(null); }}
              className="ml-1.5 font-extrabold text-[#1e3a8a] hover:text-[#0f1d4a] transition-colors"
            >
              {isRegistering ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
