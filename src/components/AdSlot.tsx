'use client';

import { useEffect, useRef } from 'react';

// AdSense inventory for this publisher account (the same account that serves
// Blue Seas Fishing). These are the account's two units, matching what Blue Seas
// and TimerHaven run: IN_ARTICLE in the body, FOOTER at the end of a page. Swap
// either for a dedicated NGG unit once one is created in AdSense, so reporting
// stays separated by site.
const AD_CLIENT = 'ca-pub-0467059729557007';
const AD_SLOT = '2835722251';
export const AD_SLOT_FOOTER = '1522640584';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({ className = '', slot = AD_SLOT }: { className?: string; slot?: string }) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const el = insRef.current;
    if (!el) return;

    // The loader stamps data-adsbygoogle-status on an <ins> once it has claimed
    // it. Pushing a second time for the same element throws
    // "adsbygoogle.push() error: All ins elements in the DOM with class
    // adsbygoogle already have ads in them" — this happens on client-side
    // navigation back to a page that already served an ad.
    if (el.getAttribute('data-adsbygoogle-status')) return;

    try {
      // Pushing before the async loader has arrived is fine: the library
      // adopts the existing queue when it loads.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Blocked by a script blocker, or the loader never arrived. The slot
      // stays empty rather than breaking the page.
    }
  }, []);

  return (
    <div className={`ad-slot ${className}`.trim()}>
      <p className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
        Advertisement
      </p>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
