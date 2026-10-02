export default function HistoryLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-slate-800/50 rounded-lg animate-pulse" />
      </div>

      <div className="space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-800" />
              <div className="w-24 h-6 bg-slate-800 rounded-lg" />
              <div className="w-32 h-3 bg-slate-800/50 rounded-full" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="glass-panel rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
             <div className="w-5 h-5 rounded-full bg-slate-800 animate-pulse" />
             <div className="h-5 w-48 bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-64 w-full bg-slate-800/30 rounded-2xl animate-pulse flex items-end justify-between p-4">
               {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                 <div key={i} className="w-[10%] bg-slate-700/50 rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }} />
               ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between">
             <div className="h-5 w-32 bg-slate-800 rounded-lg animate-pulse" />
             <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-slate-800/50 last:border-0 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-800 rounded-lg" />
                  <div className="h-3 w-24 bg-slate-800/50 rounded-lg" />
                </div>
                <div className="h-6 w-20 bg-slate-800 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
