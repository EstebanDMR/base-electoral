import React, { useState, useMemo } from 'react';
import { UserPlus, Download, Trash2, CheckCircle2, AlertCircle, Users, CheckSquare, Clock } from 'lucide-react';
import { exportarAExcel } from '../utils/exportarVotantes';
import { TablaVotantes } from '../components/TablaVotantes';
import { useTheme } from '../ThemeContext';

export const VotantesView = ({
  votantes,
  lideres,
  isAdmin,
  onAgregarVotante,
  onEliminarTodosLosVotantes,
  onEditarVotante,
  onEliminarVotante
}) => {
  const [nuevoVotante, setNuevoVotante] = useState({
    nombreCompleto: '', documento: '', telefono: '', direccion: '',
    barrio: '', municipio: '', mesa: '', puesto: '', liderAsignado: ''
  });
  const [mensajeError, setMensajeError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { darkMode: d } = useTheme();

  const eliminarTodosLosVotantes = async () => {
    if (window.confirm('¿Estás seguro de que deseas ELIMINAR TODA LA LISTA DE VOTANTES? Esta acción no se puede deshacer.')) {
      if (window.confirm('ÚLTIMA CONFIRMACIÓN: Se eliminarán todos los votantes permanentemente. ¿Continuar?')) {
        await onEliminarTodosLosVotantes();
      }
    }
  };

  const agregarVotante = async () => {
    setMensajeError(null);
    setMensajeExito(null);
    setIsSaving(true);
    try {
      await onAgregarVotante(nuevoVotante);
      setNuevoVotante({ nombreCompleto: '', documento: '', telefono: '', direccion: '', barrio: '', municipio: '', mesa: '', puesto: '', liderAsignado: '' });
      setMensajeExito('Votante registrado exitosamente.');
      setShowForm(false);
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = d
    ? "w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-[12px] focus:bg-[#0f172a] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-white placeholder-slate-500 text-sm font-medium"
    : "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[12px] focus:bg-white focus:ring-4 focus:ring-[#1e3a8a]/10 focus:border-[#1e3a8a] transition-all outline-none text-slate-800 placeholder-slate-400 text-sm font-medium";

  const { total, votaron, faltan } = useMemo(() => {
    const t = votantes.length;
    const v = votantes.filter(x => x.yaVoto).length;
    return { total: t, votaron: v, faltan: t - v };
  }, [votantes]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Cabecera Principal y KPIs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
         <div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${d ? 'text-white' : 'text-slate-900'}`}>Panel de Control</h2>
            <p className={`font-medium mt-1 ${d ? 'text-slate-400' : 'text-slate-500'}`}>Visión general y gestión de tu base de datos electoral.</p>
         </div>
         <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button onClick={() => exportarAExcel(votantes, lideres)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 border rounded-xl transition-all shadow-sm font-bold text-sm ${d ? 'bg-[#1e293b] text-slate-300 hover:bg-slate-700 border-slate-600' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'}`}>
              <Download className="w-4 h-4" /> Exportar
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1e3a8a] text-white hover:bg-[#152a6b] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 border border-transparent rounded-xl transition-all font-bold text-sm">
              <UserPlus className="w-4 h-4" /> {showForm ? 'Ocultar Formulario' : '+ Nuevo Votante'}
            </button>
         </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        
        {/* Total Votantes */}
        <div className={`px-6 py-5 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border flex items-center justify-between transition-transform animate-in fade-in duration-500 hover:scale-[1.02] cursor-default relative overflow-hidden ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-gradient-to-br from-white to-[#f4f7fa] border-white'}`}>
          <div className="flex items-center gap-5">
             <div className="relative">
               <div className="absolute inset-0 bg-[#3b82f6] blur-xl opacity-40 translate-y-2 rounded-full scale-110"></div>
               <div className="bg-gradient-to-br from-[#60a5fa] to-[#2563eb] w-14 h-14 flex flex-col justify-center items-center rounded-full relative z-10 shadow-sm">
                  <Users className="w-7 h-7 text-white" />
               </div>
             </div>
             <div className="flex flex-col">
               <p className={`font-extrabold tracking-widest uppercase text-[10px] mb-0.5 opacity-80 ${d ? 'text-slate-400' : 'text-slate-500'}`}>Total Votantes</p>
               <h3 className={`text-3xl font-black leading-none ${d ? 'text-white' : 'text-slate-800'}`}>{total}</h3>
             </div>
          </div>
          <div className="w-20 h-10 ml-2 relative opacity-80">
             <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible drop-shadow-sm">
               <path d="M0,30 Q10,10 25,25 T50,20 T75,35 L100,5" fill="none" stroke="url(#blue-grad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
               <defs>
                 <linearGradient id="blue-grad" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                   <stop offset="0%" stopColor="#93c5fd" />
                   <stop offset="100%" stopColor="#3b82f6" />
                 </linearGradient>
               </defs>
             </svg>
          </div>
        </div>

        {/* Ya Votaron */}
        <div className={`px-6 py-5 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border flex items-center justify-between transition-transform animate-in fade-in duration-500 hover:scale-[1.02] cursor-default relative overflow-hidden ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-gradient-to-br from-white to-[#f0fdf4] border-white'}`}>
          <div className="flex items-center gap-5">
             <div className="relative">
               <div className="absolute inset-0 bg-[#10b981] blur-xl opacity-40 translate-y-2 rounded-full scale-110"></div>
               <div className="bg-gradient-to-br from-[#34d399] to-[#059669] w-14 h-14 flex flex-col justify-center items-center rounded-full relative z-10 shadow-sm">
                  <CheckSquare className="w-7 h-7 text-white relative -mt-0.5" />
               </div>
             </div>
             <div className="flex flex-col">
               <p className={`font-extrabold tracking-widest uppercase text-[10px] mb-0.5 opacity-80 ${d ? 'text-slate-400' : 'text-slate-500'}`}>Ya Votaron</p>
               <h3 className="text-3xl font-black text-[#059669] leading-none">{votaron}</h3>
             </div>
          </div>
          <div className="w-12 h-12 ml-2 relative">
             <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-sm">
               <path className="text-[#34d399]/20" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               <path className="text-[#059669]" strokeDasharray={`${Math.max(0.1, (votaron / (total || 1)) * 100)}, 100`} strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
             </svg>
          </div>
        </div>

        {/* Faltan por Votar */}
        <div className={`px-6 py-5 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border flex items-center justify-between transition-transform animate-in fade-in duration-500 hover:scale-[1.02] cursor-default relative overflow-hidden ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-gradient-to-br from-white to-[#fffbeb] border-white'}`}>
          <div className="flex items-center gap-5">
             <div className="relative">
               <div className="absolute inset-0 bg-[#f59e0b] blur-xl opacity-40 translate-y-2 rounded-full scale-110"></div>
               <div className="bg-gradient-to-br from-[#fbbf24] to-[#d97706] w-14 h-14 flex flex-col justify-center items-center rounded-full relative z-10 shadow-sm">
                  <Clock className="w-7 h-7 text-white" />
               </div>
             </div>
             <div className="flex flex-col">
               <p className={`font-extrabold tracking-widest uppercase text-[10px] mb-0.5 opacity-80 ${d ? 'text-slate-400' : 'text-slate-500'}`}>Faltan por Votar</p>
               <h3 className="text-3xl font-black text-[#d97706] leading-none">{faltan}</h3>
             </div>
          </div>
          <div className="w-12 h-12 ml-2 relative">
             <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-sm">
               <path className="text-[#fbbf24]/20" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               <path className="text-[#d97706]" strokeDasharray={`${Math.max(0.1, (faltan / (total || 1)) * 100)}, 100`} strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
             </svg>
          </div>
        </div>
      </div>

      {/* Banners de Notificación */}
      {mensajeError && (
        <div className={`border px-5 py-4 rounded-[16px] flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${d ? 'bg-red-900/20 border-red-900/30 text-red-400' : 'bg-red-50 border-red-100 text-red-800'}`}>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-bold text-sm tracking-wide">{mensajeError}</span>
          </div>
          <button onClick={() => setMensajeError(null)} className="text-red-400 hover:text-red-600 transition-colors p-1">✕</button>
        </div>
      )}

      {mensajeExito && (
        <div className={`border px-5 py-4 rounded-[16px] flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${d ? 'bg-emerald-900/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-sm tracking-wide">{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-400 hover:text-emerald-600 transition-colors p-1">✕</button>
        </div>
      )}

      {/* Formulario de Registro */}
      {showForm && (
        <div className={`rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border p-6 sm:p-8 animate-in slide-in-from-top-4 fade-in duration-300 ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100'}`}>
          <h2 className={`text-lg font-extrabold mb-6 flex items-center gap-2 ${d ? 'text-white' : 'text-slate-900'}`}>
            <UserPlus className={`w-5 h-5 ${d ? 'text-blue-400' : 'text-[#1e3a8a]'}`} />
            Formulario de Ingreso
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <input type="text" placeholder="Nombre completo *" value={nuevoVotante.nombreCompleto} onChange={(e) => setNuevoVotante({...nuevoVotante, nombreCompleto: e.target.value})} className={inputClass} />
            <input type="text" placeholder="Documento (cédula) *" value={nuevoVotante.documento} onChange={(e) => setNuevoVotante({...nuevoVotante, documento: e.target.value})} className={inputClass} />
            <input type="text" placeholder="Teléfono" value={nuevoVotante.telefono} onChange={(e) => setNuevoVotante({...nuevoVotante, telefono: e.target.value})} className={inputClass} />
            <input type="text" placeholder="Dirección" value={nuevoVotante.direccion} onChange={(e) => setNuevoVotante({...nuevoVotante, direccion: e.target.value})} className={inputClass} />
            <input type="text" placeholder="Barrio" value={nuevoVotante.barrio} onChange={(e) => setNuevoVotante({...nuevoVotante, barrio: e.target.value})} className={inputClass} />
            <input type="text" placeholder="Municipio" value={nuevoVotante.municipio} onChange={(e) => setNuevoVotante({...nuevoVotante, municipio: e.target.value})} className={inputClass} />
            <input type="text" placeholder="Mesa de votación" value={nuevoVotante.mesa} onChange={(e) => setNuevoVotante({...nuevoVotante, mesa: e.target.value})} className={inputClass} />
            <input type="text" placeholder="Puesto de votación" value={nuevoVotante.puesto} onChange={(e) => setNuevoVotante({...nuevoVotante, puesto: e.target.value})} className={inputClass} />
            <select value={nuevoVotante.liderAsignado} onChange={(e) => setNuevoVotante({...nuevoVotante, liderAsignado: e.target.value})} className={inputClass}>
              <option value="">Seleccionar líder...</option>
              {lideres.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </select>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button onClick={agregarVotante} disabled={isSaving}
              className={`px-8 py-4 text-white rounded-xl font-bold tracking-wide transition-all duration-200 shadow-sm flex items-center gap-2 ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-[#152a6b] hover:shadow-lg hover:-translate-y-0.5'}`}>
              {isSaving ? (
                <><span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></span> Procesando...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Guardar Votante</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Contenedor de Tabla */}
      <div className={`rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border overflow-hidden mt-8 ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100/50'}`}>
        <div className={`px-6 py-5 border-b flex items-center justify-between ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100'}`}>
            <h3 className={`font-extrabold text-lg ${d ? 'text-white' : 'text-slate-900'}`}>Listado General</h3>
            <button onClick={eliminarTodosLosVotantes} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
               <Trash2 className="w-3.5 h-3.5" /> Vaciar Todo
            </button>
        </div>
        <TablaVotantes 
          lista={votantes} 
          votantes={votantes} 
          lideres={lideres} 
          isAdmin={isAdmin} 
          mostrarLider={true} 
          onEditarVotante={onEditarVotante}
          onEliminarVotante={onEliminarVotante}
        />
      </div>
    </div>
  );
};
