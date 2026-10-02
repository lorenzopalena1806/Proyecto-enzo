import { QrCode, ScanLine, ImageIcon, TrendingUp, ArrowRight, AlertTriangle, Star, ShieldCheck, Briefcase, Printer, Heart, Package, CheckCircle2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-slate-800/50 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-blue-500/20 rounded-xl animate-pulse" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Skeleton */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="h-6 w-32 bg-slate-800 rounded-lg animate-pulse mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center justify-center p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-700 mb-3" />
                  <div className="w-20 h-3 bg-slate-700 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Chart Skeleton */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-40 bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-slate-800 rounded-lg animate-pulse" />
            </div>
            <div className="h-64 w-full bg-slate-800/30 rounded-2xl animate-pulse flex items-end justify-between p-4">
               {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                 <div key={i} className="w-[10%] bg-slate-700/50 rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }} />
               ))}
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="h-6 w-32 bg-slate-800 rounded-lg animate-pulse mb-2" />
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-700" />
                   <div className="space-y-2">
                     <div className="w-24 h-3 bg-slate-700 rounded-full" />
                     <div className="w-16 h-2 bg-slate-700/50 rounded-full" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
