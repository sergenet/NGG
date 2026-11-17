'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface CopyPromoCodeProps {
  code: string;
  label?: string;
  className?: string;
}

export function CopyPromoCode({ code, label = 'Use code', className = '' }: CopyPromoCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      trackEvent('promo_code_copy', { promo_code: code });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      trackEvent('promo_code_copy', { promo_code: code });
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700/80 p-1.5 pl-3 text-xs shadow-xs ${className}`}>
      <span className="text-slate-400 font-semibold">{label}:</span>
      <span className="font-mono font-black text-amber-400 tracking-wider text-sm select-all">{code}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 text-xs font-black transition-all cursor-pointer active:scale-95"
        title={`Copy code ${code}`}
        aria-label={`Copy discount code ${code}`}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
