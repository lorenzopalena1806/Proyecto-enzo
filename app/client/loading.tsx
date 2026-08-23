export default function ClientLoading() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-2xl bg-slate-800"></div>
        <div className="space-y-2">
          <div className="h-6 bg-slate-700 rounded w-40"></div>
          <div className="h-4 bg-slate-800 rounded w-24"></div>
        </div>
      </div>

      {/* QR / Cards Skeleton */}
      <div className="glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col items-center justify-center h-80">
        <div className="w-48 h-48 bg-slate-800 rounded-xl mb-6"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      </div>

      {/* Map / List Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="glass-panel p-4 rounded-2xl border-white/5 h-32 flex items-center gap-4">
             <div className="w-20 h-20 bg-slate-800 rounded-xl"></div>
             <div className="flex-1 space-y-2">
                <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
