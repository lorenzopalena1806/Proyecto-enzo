'use client';
import { useEffect, useState, useRef } from 'react';

function Counter({ value, prefix = '', suffix = '' }: { value: number, prefix?: string, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const end = value;
          const duration = 2000; // 2 seconds
          const steps = 60;
          const increment = end / steps;
          const stepTime = Math.abs(Math.floor(duration / steps));
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, stepTime);
          
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{prefix}{count.toLocaleString('es-AR')}{suffix}</span>;
}

export function AnimatedStats({ stats }: { stats: { label: string, value: number, prefix?: string, suffix?: string }[] }) {
  return (
    <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto border-t border-cyan-500/10">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col items-center justify-center space-y-1 p-4 rounded-2xl bg-white/3 border border-cyan-500/10 backdrop-blur-sm">
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 tracking-tight">
            <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
          </span>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider text-center">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
