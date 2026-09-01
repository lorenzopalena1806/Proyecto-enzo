'use client';

import React, { useState } from 'react';
import { Store, MapPin, ChevronDown, Check } from 'lucide-react';
import { setActiveBranchCookie } from '@/app/actions/branch-cookie';

interface Branch {
  id: string;
  name: string;
}

interface BranchSwitcherProps {
  branches: Branch[];
  activeBranchId: string | null;
}

export function BranchSwitcher({ branches, activeBranchId }: BranchSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Si no tiene sucursales extra, no mostramos el switcher
  if (!branches || branches.length === 0) return null;

  const handleSelect = async (id: string | null) => {
    setIsOpen(false);
    setIsPending(true);
    await setActiveBranchCookie(id);
    setIsPending(false);
  };

  const activeBranch = branches.find(b => b.id === activeBranchId);
  let label = 'Visión Global (Todas)';
  if (activeBranchId === 'central') label = 'Sede Central';
  else if (activeBranch) label = activeBranch.name;

  return (
    <div className="relative px-3 py-2 w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-left transition-colors hover:bg-slate-900 group"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {activeBranchId ? (
            <MapPin className="h-4 w-4 text-violet-400 flex-shrink-0" />
          ) : (
            <Store className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-none mb-1">
              Operando como
            </span>
            <span className="text-sm font-semibold text-white truncate leading-none">
              {label}
            </span>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''} ${isPending ? 'animate-pulse' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-3 right-3 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="max-h-60 overflow-y-auto py-1">
            <button
              onClick={() => handleSelect(null)}
              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors ${!activeBranchId ? 'bg-slate-800/50' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">Visión Global</span>
              </div>
              {!activeBranchId && <Check className="h-4 w-4 text-emerald-400" />}
            </button>
            
            <button
              onClick={() => handleSelect('central')}
              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors ${activeBranchId === 'central' ? 'bg-slate-800/50' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Sede Central</span>
              </div>
              {activeBranchId === 'central' && <Check className="h-4 w-4 text-blue-400" />}
            </button>
            
            <div className="h-px bg-slate-800 my-1 mx-2"></div>
            
            <div className="px-3 py-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sucursales Individuales</span>
            </div>

            {branches.map(branch => (
              <button
                key={branch.id}
                onClick={() => handleSelect(branch.id)}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors ${activeBranchId === branch.id ? 'bg-slate-800/50' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-medium text-white truncate text-left max-w-[150px]">{branch.name}</span>
                </div>
                {activeBranchId === branch.id && <Check className="h-4 w-4 text-violet-400" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
