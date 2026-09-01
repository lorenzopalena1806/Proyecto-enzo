'use client';

import React from 'react';
import { PlayCircle } from 'lucide-react';

export function RestartTourButton() {
  return (
    <button
      onClick={() => {
        localStorage.removeItem('lazoo_tour_completed');
        window.location.reload();
      }}
      className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-full transition-colors flex items-center gap-1.5 border border-slate-700/50 hover:border-slate-600"
    >
      <PlayCircle className="h-3.5 w-3.5 text-violet-400" />
      Repetir Tutorial
    </button>
  );
}
