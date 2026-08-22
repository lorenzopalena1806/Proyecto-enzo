'use client';

import { useState, useEffect } from 'react';
import { setEmployeePinServer, getEmployeePinServer } from '@/app/actions/employee';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Copy, Check, Loader2, KeyRound } from 'lucide-react';

export function EmployeeConfigForm({ posUrl, merchantId }: { posUrl: string; merchantId: string }) {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    getEmployeePinServer().then(currentPin => {
      if (currentPin) {
        setHasPin(true);
      }
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setMessage({ text: 'El PIN debe ser de 4 dígitos', type: 'error' });
      return;
    }
    
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    const res = await setEmployeePinServer(pin);
    if (res.success) {
      setMessage({ text: 'PIN configurado correctamente', type: 'success' });
      setHasPin(true);
      setPin('');
    } else {
      setMessage({ text: res.reason || 'Error', type: 'error' });
    }
    setIsSaving(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(posUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-violet-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 space-y-4">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-violet-400" />
          {hasPin ? 'Cambiar PIN de Acceso' : 'Configurar PIN de Acceso'}
        </h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nuevo PIN (4 dígitos numéricos)</label>
            <div className="flex gap-3">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="****"
                className="w-32 px-4 py-2 text-center tracking-widest font-bold text-xl rounded-xl bg-slate-900 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={isSaving || pin.length !== 4}
                className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium"
              >
                {isSaving ? 'Guardando...' : 'Guardar PIN'}
              </button>
            </div>
          </div>
          
          {message.text && (
            <p className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>

      {hasPin && (
        <div className="rounded-2xl border border-emerald-700 bg-emerald-900/20 p-6 space-y-5">
          <div>
            <h2 className="text-emerald-300 font-semibold flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Acceso Activo para Empleados
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Compartí este enlace o el código QR con tus empleados. Ellos deberán ingresar el PIN que configuraste arriba.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG value={posUrl} size={150} />
            </div>
            
            <div className="space-y-3 flex-1 w-full">
              <label className="text-sm font-medium text-slate-300">Enlace directo</label>
              <div className="flex bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                <input 
                  type="text" 
                  readOnly 
                  value={posUrl} 
                  className="bg-transparent flex-1 px-4 py-3 text-slate-300 text-sm focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 transition-colors border-l border-slate-700"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
