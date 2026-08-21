'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copiar código"
      className="absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 hover:text-white transition-colors"
    >
      {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
    </button>
  );
}
