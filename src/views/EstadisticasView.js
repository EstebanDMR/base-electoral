import React from 'react';
import { Users, BarChart3, TrendingUp, UserCheck, Activity, CheckCircle2, Clock } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export const EstadisticasView = ({ votantes, lideres }) => {
   const { darkMode: d } = useTheme();

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
      <div className="space-y-8 animate-in fade-in duration-500">

         <div className="mb-8">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${d ? 'text-white' : 'text-slate-900'}`}>Centro de Análisis</h2>
            <p className={`font-medium mt-1 ${d ? 'text-slate-400' : 'text-slate-500'}`}>Métricas en tiempo real del avance de la campaña.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">

            {/* Total Votantes */}
            <div className={`rounded-[16px] shadow-sm border p-5 relative overflow-hidden flex flex-col justify-between h-[160px] hover:shadow-md transition-shadow group ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-gradient-to-br from-white to-[#f4f7fb] border-[#e2e8f0]'}`}>
               <svg viewBox="0 0 100 40" className="absolute top-8 right-0 w-32 h-16 opacity-30 group-hover:opacity-50 transition-opacity" preserveAspectRatio="none">
                  <path d="M0,40 Q15,10 30,30 T60,20 T100,25" fill="none" stroke="url(#blue-graf)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                     <linearGradient id="blue-graf" x1="0" y1="0" x2="100" y2="0">
                        <stop offset="0%" stopColor="#93c5fd" />
                        <stop offset="100%" stopColor="#2563eb" />
                     </linearGradient>
                  </defs>
               </svg>
               <div className="z-10">
                  <div className="bg-[#3b82f6] w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-[0_4px_10px_rgba(59,130,246,0.3)]">
                     <Users className="w-5 h-5 text-white" />
                  </div>
                  <p className={`text-[11px] font-extrabold uppercase tracking-widest leading-none mb-1 ${d ? 'text-slate-400' : 'text-slate-500'}`}>Total Votantes</p>
                  <h3 className={`text-3xl font-black leading-none ${d ? 'text-white' : 'text-slate-900'}`}>{stats.totalVotantes}</h3>
               </div>
            </div>

            {/* Ya Votaron */}
            <div className={`rounded-[16px] shadow-sm border p-5 relative overflow-hidden flex flex-col justify-between h-[160px] hover:shadow-md transition-shadow ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-gradient-to-br from-[#f8fafc] to-[#f0fdf4] border-[#bbf7d0]'}`}>
               <div className="absolute top-5 right-5 flex items-end gap-1 opacity-40">
                  <div className="w-1.5 h-4 bg-[#10b981] rounded-t-sm"></div>
                  <div className="w-1.5 h-6 bg-[#34d399] rounded-t-sm"></div>
                  <div className="w-1.5 h-3 bg-[#10b981] rounded-t-sm"></div>
                  <div className="w-1.5 h-8 bg-[#059669] rounded-t-sm"></div>
                  <div className="w-1.5 h-5 bg-[#34d399] rounded-t-sm"></div>
               </div>

               <div className="absolute bottom-4 right-4 w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                     <path className="text-[#10b981]/20" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path className="text-[#10b981]" strokeDasharray={`${Math.max(0.1, (stats.yaVotaron / (stats.totalVotantes || 1)) * 100)}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className={`text-[10px] font-black leading-none ${d ? 'text-white' : 'text-slate-700'}`}>{Math.round((stats.yaVotaron / (stats.totalVotantes || 1)) * 100)}%</span>
                  </div>
               </div>

               <div className="z-10">
                  <div className="bg-[#10b981] w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-[0_4px_10px_rgba(16,185,129,0.3)]">
                     <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <p className={`text-[11px] font-extrabold uppercase tracking-widest leading-none mb-1 ${d ? 'text-slate-400' : 'text-slate-500'}`}>Ya Votaron</p>
                  <h3 className={`text-3xl font-black leading-none ${d ? 'text-white' : 'text-slate-900'}`}>{stats.yaVotaron}</h3>
                  <p className={`text-[10px] font-bold mt-1 tracking-wide ${d ? 'text-slate-500' : 'text-slate-400'}`}>{Math.round((stats.yaVotaron / (stats.totalVotantes || 1)) * 100)}% del total</p>
               </div>
            </div>

            {/* Total Líderes */}
            <div className={`rounded-[16px] shadow-sm border p-5 relative overflow-hidden flex flex-col justify-between h-[160px] hover:shadow-md transition-shadow ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-gradient-to-br from-[#fdfaef] to-[#faf5ff] border-[#e9d5ff]'}`}>
               <div className="absolute top-5 right-4 w-16 h-8 opacity-50">
                  <svg viewBox="0 0 100 40" className="w-full h-full">
                     <path d="M5,30 L25,15 L45,25 L70,5 L95,20" fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                     <circle cx="5" cy="30" r="4" fill="#d8b4fe" />
                     <circle cx="25" cy="15" r="4" fill="#a855f7" />
                     <circle cx="45" cy="25" r="4" fill="#c084fc" />
                     <circle cx="70" cy="5" r="4" fill="#9333ea" />
                     <circle cx="95" cy="20" r="4" fill="#a855f7" />
                  </svg>
               </div>

               <svg viewBox="0 0 100 30" className="absolute bottom-5 right-4 w-20 h-6 opacity-30" preserveAspectRatio="none">
                  <path d="M0,25 Q10,5 25,15 T50,15 T75,5 T100,20" fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" />
               </svg>

               <div className="z-10">
                  <div className="bg-[#8b5cf6] w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-[0_4px_10px_rgba(139,92,246,0.3)]">
                     <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <p className={`text-[11px] font-extrabold uppercase tracking-widest leading-none mb-1 ${d ? 'text-slate-400' : 'text-slate-500'}`}>Total Líderes</p>
                  <h3 className={`text-3xl font-black leading-none ${d ? 'text-white' : 'text-slate-900'}`}>{stats.totalLideres}</h3>
               </div>
            </div>

            {/* Promedio por Líder */}
            <div className={`rounded-[16px] shadow-sm border p-5 relative overflow-hidden flex flex-col justify-between h-[160px] hover:shadow-md transition-shadow ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-gradient-to-br from-[#fefce8] to-[#fff7ed] border-[#fed7aa]'}`}>
               <div className="absolute top-5 right-5 grid grid-cols-4 gap-1 opacity-40">
                  {[...Array(12)].map((_, i) => (
                     <div key={i} className={`w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? 'bg-[#f97316]' : 'bg-[#fdba74]'}`}></div>
                  ))}
               </div>

               <div className="absolute bottom-5 right-5 flex items-end gap-1.5 opacity-60">
                  <div className="w-2 h-4 bg-[#fdba74] rounded-t-sm"></div>
                  <div className="w-2 h-7 bg-[#f97316] rounded-t-sm"></div>
                  <div className="w-2 h-3 bg-[#fdba74] rounded-t-sm"></div>
                  <div className="w-2 h-9 bg-[#ea580c] rounded-t-sm"></div>
                  <div className="w-2 h-6 bg-[#f97316] rounded-t-sm"></div>
               </div>

               <div className="z-10">
                  <div className="bg-[#f97316] w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
                     <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <p className={`text-[11px] font-extrabold uppercase tracking-widest leading-none mb-1 ${d ? 'text-slate-400' : 'text-slate-500'}`}>Promedio por Líder</p>
                  <h3 className={`text-3xl font-black leading-none ${d ? 'text-white' : 'text-slate-900'}`}>{stats.totalLideres > 0 ? (stats.totalVotantes / stats.totalLideres).toFixed(1) : 0}</h3>
               </div>
            </div>

         </div>

         <div className={`rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border p-6 sm:p-10 ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-100'}`}>
            <h2 className={`text-xl font-extrabold mb-8 flex items-center gap-2 ${d ? 'text-white' : 'text-slate-900'}`}>
               <Activity className={`w-6 h-6 ${d ? 'text-blue-400' : 'text-[#1e3a8a]'}`} />
               Rendimiento por Líder
            </h2>
            {stats.votantesPorLider.length === 0 ? (
               <div className={`text-center py-16 flex flex-col items-center ${d ? 'text-slate-500' : 'text-slate-400'}`}>
                  <BarChart3 className={`w-12 h-12 mb-4 ${d ? 'text-slate-600' : 'text-slate-200'}`} />
                  <p className="font-semibold">No hay datos suficientes para mostrar el rendimiento.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {stats.votantesPorLider.sort((a, b) => b.yaVotaron - a.yaVotaron).map((item, idx) => (
                     <div key={idx} className={`rounded-[24px] shadow-sm border p-6 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group ${d ? 'bg-[#0f172a] border-slate-700' : 'bg-gradient-to-br from-white to-[#f4f7fb] border-[#e2e8f0]'}`}>

                        <div className={`absolute top-0 right-0 -m-4 w-32 h-32 opacity-60 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 ${d ? 'bg-blue-500/10' : 'bg-[#3b82f6]/5'}`}></div>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                           <div className="bg-[#3b82f6] w-12 h-12 rounded-xl flex items-center justify-center shadow-[0_4px_10px_rgba(59,130,246,0.3)] shrink-0">
                              <Users className="w-6 h-6 text-white" />
                           </div>
                           <div className="flex flex-col">
                              <span className={`font-extrabold text-xl tracking-tight leading-tight ${d ? 'text-white' : 'text-slate-900'}`}>{item.nombre}</span>
                              <span className="text-[11px] font-black text-[#3b82f6] uppercase tracking-widest mt-1">
                                 {item.cantidad} Totales
                              </span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10 mt-auto">
                           <div className={`p-4 rounded-[16px] border shadow-sm flex flex-col ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-gradient-to-br from-white to-[#f0fdf4] border-[#bbf7d0]'}`}>
                              <span className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-1 ${d ? 'text-slate-400' : 'text-slate-500'}`}>
                                 <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" /> Ya Votaron
                              </span>
                              <span className="text-[#059669] text-3xl font-black">{item.yaVotaron}</span>
                           </div>

                           <div className={`p-4 rounded-[16px] border shadow-sm flex flex-col ${d ? 'bg-[#1e293b] border-slate-700' : 'bg-gradient-to-br from-white to-[#fffbeb] border-[#fed7aa]'}`}>
                              <span className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-1 ${d ? 'text-slate-400' : 'text-slate-500'}`}>
                                 <Clock className="w-3.5 h-3.5 text-[#f59e0b]" /> Pendientes
                              </span>
                              <span className="text-[#d97706] text-3xl font-black">{item.faltan}</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};
