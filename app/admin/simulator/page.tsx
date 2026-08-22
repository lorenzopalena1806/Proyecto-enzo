'use client';

import { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, Users, Target, Activity, Percent } from 'lucide-react';

export default function SimulatorPage() {
  const [matricula, setMatricula] = useState<number>(100000);
  const [cuota, setCuota] = useState<number>(15000);
  const [comercios, setComercios] = useState<number>(50);
  const [referidos, setReferidos] = useState<number>(30); // 30% referred
  const [descuentoReferido, setDescuentoReferido] = useState<number>(30); // 30% discount for referrer

  // Calcular ingresos
  const ingresosAlta = matricula * comercios;
  
  const comerciosRegulares = Math.round(comercios * (1 - (referidos / 100)));
  const comerciosReferidores = comercios - comerciosRegulares;
  
  const mrrRegulares = comerciosRegulares * cuota;
  const mrrReferidores = comerciosReferidores * (cuota * (1 - (descuentoReferido / 100)));
  const mrrTotal = mrrRegulares + mrrReferidores;

  const arr = mrrTotal * 12;

  const formatARS = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 lg:p-8 pt-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calculator className="h-6 w-6 text-violet-400" />
          Simulador de Ingresos (SaaS)
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Proyectá la rentabilidad de Lazoo modificando las variables del modelo de negocio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controles (Sliders/Inputs) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-3">Variables del Negocio</h2>
            
            <div className="space-y-4">
              {/* Matrícula */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-emerald-400"/> Precio Matrícula (Alta)</span>
                  <span className="text-emerald-400 font-bold">{formatARS(matricula)}</span>
                </label>
                <input 
                  type="range" min="10000" max="500000" step="5000"
                  value={matricula} onChange={(e) => setMatricula(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Cuota Mensual */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center justify-between text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-1"><Activity className="h-4 w-4 text-blue-400"/> Cuota Mensual (Mantenimiento)</span>
                  <span className="text-blue-400 font-bold">{formatARS(cuota)}</span>
                </label>
                <input 
                  type="range" min="1000" max="100000" step="1000"
                  value={cuota} onChange={(e) => setCuota(Number(e.target.value))}
                  className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Cantidad de Comercios */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center justify-between text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-1"><Target className="h-4 w-4 text-violet-400"/> Objetivo Comercios Adheridos</span>
                  <span className="text-violet-400 font-bold">{comercios} Locales</span>
                </label>
                <input 
                  type="range" min="10" max="1000" step="5"
                  value={comercios} onChange={(e) => setComercios(Number(e.target.value))}
                  className="w-full accent-violet-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Descuento Referidos */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center justify-between text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-1"><Percent className="h-4 w-4 text-amber-400"/> Comercios que refieren</span>
                  <span className="text-amber-400 font-bold">{referidos}% del total</span>
                </label>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={referidos} onChange={(e) => setReferidos(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-slate-500 mt-1">Lazoo bonifica el {descuentoReferido}% de su cuota.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ingresos por Alta */}
            <div className="glass-panel p-6 rounded-3xl border-emerald-900/30 shadow-[0_0_30px_-15px_rgba(16,185,129,0.3)] bg-gradient-to-br from-slate-900 to-emerald-950/20">
              <h3 className="text-slate-400 text-sm font-medium mb-1">Ingreso de Capital Inicial</h3>
              <div className="text-3xl font-black text-emerald-400 tracking-tight">{formatARS(ingresosAlta)}</div>
              <p className="text-xs text-slate-500 mt-2">Proveniente de la venta del Kit a {comercios} locales.</p>
            </div>

            {/* MRR */}
            <div className="glass-panel p-6 rounded-3xl border-blue-900/30 shadow-[0_0_30px_-15px_rgba(59,130,246,0.3)] bg-gradient-to-br from-slate-900 to-blue-950/20">
              <h3 className="text-slate-400 text-sm font-medium mb-1">MRR (Ingreso Recurrente)</h3>
              <div className="text-3xl font-black text-blue-400 tracking-tight">{formatARS(mrrTotal)}</div>
              <p className="text-xs text-slate-500 mt-2">Facturación asegurada mes a mes.</p>
            </div>
          </div>

          {/* ARR / Resumen Anual */}
          <div className="glass-panel p-8 rounded-3xl border-violet-900/30 shadow-[0_0_50px_-15px_rgba(139,92,246,0.2)] bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/30 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <TrendingUp className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-slate-300 font-medium mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-400" />
                ARR (Ingreso Anual Recurrente)
              </h3>
              <div className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
                {formatARS(arr)}
              </div>
              <div className="inline-flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm bg-black/40 px-6 py-3 rounded-full border border-white/5 mx-auto">
                <div><span className="text-slate-400">Año 1 Total:</span> <span className="font-bold text-emerald-400">{formatARS(arr + ingresosAlta)}</span></div>
                <div className="w-px bg-white/10 hidden sm:block"></div>
                <div><span className="text-slate-400">Locales Activos:</span> <span className="font-bold text-violet-400">{comercios}</span></div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" /> 
              Composición de Cuotas
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-400">Cuota Completa (Sin Referidos)</span>
                <div className="text-right">
                  <div className="font-medium text-white">{comerciosRegulares} locales</div>
                  <div className="text-xs text-blue-400">{formatARS(mrrRegulares)}/mes</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Cuota Bonificada ({descuentoReferido}% OFF)</span>
                <div className="text-right">
                  <div className="font-medium text-white">{comerciosReferidores} locales</div>
                  <div className="text-xs text-amber-400">{formatARS(mrrReferidores)}/mes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
