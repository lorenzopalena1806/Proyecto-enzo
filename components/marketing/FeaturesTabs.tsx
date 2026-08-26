'use client';

import { useState } from 'react';
import { QrCode, ShieldCheck, TrendingUp, Zap, Gift, Wallet, Smartphone, Sparkles, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

export function FeaturesTabs() {
  const [activeTab, setActiveTab] = useState<'comercio' | 'cliente'>('comercio');

  return (
    <section id="features" className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Diseñado para todos</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Beneficios reales tanto para los dueños de locales como para los compradores del barrio.</p>
        </div>

        {/* Custom Tabs Switcher */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/5 border border-cyan-500/20 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('comercio')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'comercio' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-900/30' : 'text-slate-400 hover:text-white'}`}
            >
              Para Comercios
            </button>
            <button
              onClick={() => setActiveTab('cliente')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'cliente' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-900/30' : 'text-slate-400 hover:text-white'}`}
            >
              Para Clientes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500">
          {activeTab === 'comercio' ? (
            <>
              <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
                <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-white/3 border border-cyan-500/15 p-8 hover:border-cyan-400/40 transition-all backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 mb-6 border border-cyan-500/25">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Mostrá tu código y listo</h3>
                      <p className="text-slate-400">No necesitás comprar aparatos raros. Solo mostrá tu código QR (impreso o en el celu) para que el cliente lo escanee. La app se encarga de aplicar el descuento al instante.</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl bg-white/3 border border-emerald-500/15 p-8 hover:border-emerald-400/40 transition-all backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(52,211,153,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 mb-6 border border-emerald-500/25">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Seguro y sin trampas</h3>
                      <p className="text-slate-400 text-sm">Cada código QR cambia todo el tiempo. Nadie puede usar el descuento de otra persona ni hacer capturas falsas.</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl bg-white/3 border border-blue-500/15 p-8 hover:border-blue-400/40 transition-all backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(96,165,250,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 mb-6 border border-blue-500/25">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Controlá tus ventas</h3>
                      <p className="text-slate-400 text-sm">Mirá cuántos descuentos diste y cuánta plata entró a tu local, todo fácil y al momento desde tu pantalla.</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl bg-white/3 border border-fuchsia-500/15 p-8 hover:border-fuchsia-400/40 transition-all backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 mb-6 border border-fuchsia-500/25">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Lazoo Inteligencia Artificial</h3>
                      <p className="text-slate-400 text-sm">Nuestro asistente virtual analiza tus ventas y te da consejos personalizados para atraer más clientes los días flojos.</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl bg-white/3 border border-amber-500/15 p-8 hover:border-amber-400/40 transition-all backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 mb-6 border border-amber-500/25">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Red de dueños</h3>
                      <p className="text-slate-400 text-sm">Por ser parte de la red, tenés descuentos especiales (mucho más altos) cuando vas a comprar a otros locales.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-center animate-fade-in">
                <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  Unir mi comercio
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
                <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-white/3 border border-pink-500/15 p-8 hover:border-pink-400/40 transition-all backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/15 text-pink-400 mb-6 border border-pink-500/25">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Ahorrá en cada compra</h3>
                      <p className="text-slate-400">Escaneá el código del local desde tu celular y pagá con el medio que prefieras (efectivo, transferencia o tarjeta). El descuento se aplica automático en la caja.</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-3xl bg-white/3 border border-purple-500/15 p-8 hover:border-purple-400/40 transition-all backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 mb-6 border border-purple-500/25">
                      <Gift className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Descubrí nuevos lugares</h3>
                      <p className="text-slate-400 text-sm">Explorá el mapa y encontrá promociones exclusivas cerca tuyo todos los días.</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 group relative overflow-hidden rounded-3xl bg-white/3 border border-teal-500/15 p-8 hover:border-teal-400/40 transition-all backdrop-blur-sm hover:shadow-[0_0_40px_-10px_rgba(20,184,166,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/15 text-teal-400 mb-6 border border-teal-500/25">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Todo en tu celular, siempre gratis</h3>
                      <p className="text-slate-400 text-sm">Crear tu cuenta como cliente no cuesta nada y nunca te vamos a cobrar comisión.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-center animate-fade-in">
                <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                  Empezar a ahorrar gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
