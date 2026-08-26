'use client';

import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, Calendar, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addFinanceRecordServer, deleteFinanceRecordServer } from '@/app/actions/admin';

export function FinanceClientPage({ initialFinances }: { initialFinances: any[] }) {
  const [finances, setFinances] = useState(initialFinances);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const totalIncome = finances.filter(f => f.type === 'income').reduce((acc, f) => acc + Number(f.amount), 0);
  const totalExpense = finances.filter(f => f.type === 'expense').reduce((acc, f) => acc + Number(f.amount), 0);
  const balance = totalIncome - totalExpense;

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get('type') as string,
      category: formData.get('category') as string,
      amount: Number(formData.get('amount')),
      description: formData.get('description') as string,
      date: formData.get('date') as string,
    };
    
    const { record } = await addFinanceRecordServer(data);
    if (record) {
      setFinances([record, ...finances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      (e.target as HTMLFormElement).reset();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await deleteFinanceRecordServer(id);
    setFinances(finances.filter(f => f.id !== id));
  };

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Wallet className="w-8 h-8 text-emerald-400" />
          Libro Contable
        </h1>
        <p className="text-slate-400 mt-1">Registrá tus ingresos y gastos operativos (servidores, publicidad, etc).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-16 h-16 text-emerald-500" /></div>
          <p className="text-sm font-semibold tracking-wider text-emerald-400 uppercase">Ingresos Totales</p>
          <p className="text-3xl font-bold text-white mt-2">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown className="w-16 h-16 text-red-500" /></div>
          <p className="text-sm font-semibold tracking-wider text-red-400 uppercase">Gastos Totales</p>
          <p className="text-3xl font-bold text-white mt-2">{fmt(totalExpense)}</p>
        </div>
        <div className={`border p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden ${balance >= 0 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
          <p className={`text-sm font-semibold tracking-wider uppercase ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Rentabilidad (Balance)</p>
          <p className={`text-3xl font-black mt-2 ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(balance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" /> Nuevo Registro
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Tipo</label>
              <select name="type" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500">
                <option value="income">Ingreso (Cobro a comercio)</option>
                <option value="expense">Gasto (Servidor, Meta Ads)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Categoría / Concepto</label>
              <input type="text" name="category" required placeholder="Ej: Vercel, Supabase, Meta Ads" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Monto (ARS)</label>
              <input type="number" name="amount" min="0" step="0.01" required placeholder="10000" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Fecha</label>
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 [color-scheme:dark]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Descripción (Opcional)</label>
              <input type="text" name="description" placeholder="Detalles extra..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Registro'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" /> Historial Financiero
            </h2>
          </div>
          {finances.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No hay registros financieros cargados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Fecha</th>
                    <th className="px-6 py-3 font-medium">Concepto</th>
                    <th className="px-6 py-3 font-medium text-right">Monto</th>
                    <th className="px-6 py-3 font-medium text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {finances.map((f: any) => (
                    <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {new Date(f.date).toLocaleDateString('es-AR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{f.category}</div>
                        {f.description && <div className="text-xs text-slate-400 mt-0.5">{f.description}</div>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-bold ${f.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {f.type === 'income' ? '+' : '-'}{fmt(f.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(f.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10 inline-flex">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
