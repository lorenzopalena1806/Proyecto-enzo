export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="h-10 bg-slate-800/50 rounded-lg w-1/3"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl border-white/5 h-32 flex flex-col justify-between">
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl border-white/5 p-6 h-64 mt-6">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-12 w-12 rounded-full bg-slate-800"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                <div className="h-3 bg-slate-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
