'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

export function ShareButton({ 
  title = 'Lazoo - Red de Beneficios', 
  text = '¡Mirá esta red de descuentos! Sumate a Lazoo.', 
  url = 'https://lazoo.vercel.app',
  className = ''
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback a copiar al portapapeles si la API nativa no está soportada (ej. PC)
      navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 transition-colors ${className}`}
      title="Compartir"
    >
      <Share2 className="w-5 h-5" />
      <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
    </button>
  );
}
