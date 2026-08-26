'use client';

import React, { useState } from 'react';
import { Store, QrCode, TrendingDown, Check, ArrowRight } from 'lucide-react';
import { updateProfileServer } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export function OnboardingTutorial({ userId, hasSeen }: { userId: string, hasSeen: boolean }) {
  const [isOpen, setIsOpen] = useState(!hasSeen);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const slides = [
    {
      title: '¡Bienvenido a Lazoo!',
      desc: 'La red de beneficios donde ahorrar es fácil y rápido.',
      icon: <Store className="w-16 h-16 text-blue-400 mb-4" />
    },
    {
      title: '1. Buscá Comercios',
      desc: 'Explorá el mapa o buscá tus locales favoritos para ver las ofertas activas.',
      icon: <TrendingDown className="w-16 h-16 text-emerald-400 mb-4" />
    },
    {
      title: '2. Escaneá y Ahorrá',
      desc: 'Escaneá el código QR que está en el mostrador del comercio al momento de pagar para aplicar tu descuento.',
      icon: <QrCode className="w-16 h-16 text-violet-400 mb-4" />
    }
  ];

  const handleNext = async () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      await updateProfileServer(userId, { has_seen_tutorial: true });
      setIsOpen(false);
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Progress Bar */}
        <div className="flex gap-1 p-4">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-blue-500' : 'bg-slate-800'}`} />
          ))}
        </div>

        <div className="p-8 pt-4 flex flex-col items-center text-center min-h-[300px]">
          <div className="flex-1 flex flex-col items-center justify-center animate-in slide-in-from-right-4 duration-300" key={step}>
            {slides[step].icon}
            <h2 className="text-2xl font-bold text-white mb-2">{slides[step].title}</h2>
            <p className="text-slate-400 leading-relaxed">{slides[step].desc}</p>
          </div>

          <button 
            onClick={handleNext} 
            disabled={loading}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
             step === slides.length - 1 ? (
               <><Check className="w-5 h-5" /> ¡Empezar a ahorrar!</>
             ) : (
               <>Siguiente <ArrowRight className="w-5 h-5" /></>
             )
            }
          </button>
        </div>
      </div>
    </div>
  );
}
