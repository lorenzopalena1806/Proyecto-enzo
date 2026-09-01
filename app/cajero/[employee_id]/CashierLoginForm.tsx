'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyEmployeePinServer } from '@/app/actions/employee';
import { Loader2, KeyRound } from 'lucide-react';

export function CashierLoginForm({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await verifyEmployeePinServer(employeeId, pin);
    if (res.success) {
      router.push(`/cajero/${employeeId}/pos`);
    } else {
      setError(res.reason || 'PIN incorrecto');
      setIsLoading(false);
      setPin('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 text-center">Ingresá tu PIN de Acceso</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <KeyRound className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="password"
            pattern="[0-9]*"
            inputMode="numeric"
            required
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-4 pl-12 pr-4 font-mono tracking-[0.5em] text-center text-xl focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="••••"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

      <button
        type="submit"
        disabled={isLoading || pin.length < 4}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ingresar'}
      </button>
    </form>
  );
}
