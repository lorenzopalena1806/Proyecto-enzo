'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { updateReportStatus } from '@/app/actions/reports_admin';

export function ReportStatusSelect({ reportId, initialStatus }: { reportId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsLoading(true);

    try {
      const res = await updateReportStatus(reportId, newStatus);
      if (res.success) {
        toast.success('Estado actualizado correctamente');
      } else {
        toast.error(res.error || 'Error al actualizar');
        setStatus(initialStatus); // revert
      }
    } catch (err) {
      toast.error('Error de conexión');
      setStatus(initialStatus); // revert
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ignored': return 'bg-slate-800 text-slate-400 border-slate-700';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="relative w-full">
      <select
        value={status}
        onChange={handleChange}
        disabled={isLoading}
        className={`w-full appearance-none border rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${getStatusColor(status)}`}
      >
        <option value="pending">Pendiente de revisión</option>
        <option value="resolved">Resuelto / Aceptado</option>
        <option value="ignored">Ignorado / Falso</option>
      </select>
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        </div>
      )}
    </div>
  );
}
