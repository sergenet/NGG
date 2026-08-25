'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

export function StickyMobileBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => typeof window !== 'undefined' && Boolean(localStorage.getItem('mobile_banner_dismissed')));

  useEffect(() => {
    if (isDismissed) return;

    // Show after 3 seconds on mobile
    const timer = setTimeout(() => {
      if (window.innerWidth < 768) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('mobile_banner_dismissed', 'true');
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-8 duration-500">
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl shadow-2xl border border-white/10 p-4 pr-12 flex items-center gap-4">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/40">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-grow">
          <p className="text-white font-bold text-sm leading-tight">
            Get the Free 2026 Checklist
          </p>
          <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
            Avoid Buying Junk Tech
          </p>
        </div>

        <div className="shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>

        <button 
          onClick={handleDismiss}
          className="absolute top-0 right-0 bottom-0 w-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Clickable area for the whole banner */}
        <a 
          href="#newsletter" 
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById('newsletter');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute inset-0 z-[1]"
        />
      </div>
    </div>
  );
}
