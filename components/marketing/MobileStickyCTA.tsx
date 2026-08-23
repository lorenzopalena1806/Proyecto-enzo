'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 animate-fade-in-up">
      <Link
        href="/auth/register"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-base transition-transform shadow-[0_4px_20px_rgba(6,182,212,0.4)] active:scale-95 border border-cyan-400/20"
      >
        Registrar mi Comercio
        <ArrowRight className="h-4 h-4" />
      </Link>
    </div>
  );
}
