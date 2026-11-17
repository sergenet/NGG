'use client';

import React, { useState } from 'react';
import { Check, Copy, ShieldCheck, Clock } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface CopyPromoCodeProps {
  code: string;
  label?: string;
  className?: string;
  verifiedText?: string;
  expiresText?: string;
  discountText?: string;
}

export function CopyPromoCode({
  code,
  label = 'Use code',
  className = '',
  verifiedText,
  expiresText,
  discountText,
}: CopyPromoCodeProps) {
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
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="inline-flex items-center justify-between gap-2 rounded-xl bg-slate-900 border border-slate-700/80 p-1.5 pl-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">{label}:</span>
          <span className="font-mono font-black text-amber-400 tracking-wider text-sm select-all">{code}</span>
          {discountText && (
            <span className="hidden sm:inline-flex rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
              {discountText}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0"
          title={`Copy code ${code}`}
          aria-label={`Copy discount code ${code}`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {(verifiedText || expiresText) && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          {verifiedText && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              {verifiedText}
            </span>
          )}
          {expiresText && (
            <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-stone-600 border border-stone-200">
              <Clock className="h-3 w-3 text-stone-500" />
              {expiresText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
