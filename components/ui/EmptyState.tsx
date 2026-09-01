import React from 'react';
import { Ghost, SearchX, Inbox, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Ghost, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-fade-in w-full">
      <div className="h-24 w-24 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 relative group">
        <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-xl group-hover:bg-violet-500/20 transition-colors" />
        <Icon className="h-10 w-10 text-slate-400 group-hover:text-violet-400 transition-colors relative z-10" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
