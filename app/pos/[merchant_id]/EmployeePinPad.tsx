'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyEmployeePinServer } from '@/app/actions/employee';
import { Loader2, KeyRound, Delete } from 'lucide-react';

export function EmployeePinPad({ merchantId }: { merchantId: string }) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    setIsLoading(true);
    
    const res = await verifyEmployeePinServer(merchantId, pin);
    if (res.success) {
      // Forzar recarga para que el Server Component detecte la cookie nueva
      window.location.reload();
    } else {
      setError(res.reason || 'PIN incorrecto');
      setPin('');
      setIsLoading(false);
    }
  };

  // Auto-submit when 4 digits are entered
  if (pin.length === 4 && !isLoading && !error) {
    handleSubmit();
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-8">
      {/* Visualizer */}
      <div className="flex justify-center gap-4">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i}
            className={`w-12 h-14 rounded-xl flex items-center justify-center border-2 transition-all
              ${pin.length > i 
                ? 'border-violet-500 bg-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                : 'border-slate-800 bg-slate-900/50'
              }
              ${error ? 'border-red-500/50 bg-red-950/20' : ''}
            `}
          >
            {pin.length > i && <div className="w-3 h-3 rounded-full bg-violet-400" />}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-center text-sm font-medium animate-bounce">{error}</p>
      )}
      
      {isLoading && (
        <p className="text-violet-400 text-center text-sm font-medium flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
        </p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            disabled={isLoading}
            onClick={() => handleInput(num.toString())}
            className="h-16 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-2xl font-bold text-white transition-colors disabled:opacity-50"
          >
            {num}
          </button>
        ))}
        <div className="h-16" /> {/* Empty spot */}
        <button
          disabled={isLoading}
          onClick={() => handleInput('0')}
          className="h-16 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-2xl font-bold text-white transition-colors disabled:opacity-50"
        >
          0
        </button>
        <button
          disabled={isLoading || pin.length === 0}
          onClick={handleDelete}
          className="h-16 flex items-center justify-center rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 transition-colors disabled:opacity-30"
        >
          <Delete className="w-7 h-7" />
        </button>
      </div>

    </div>
  );
}
