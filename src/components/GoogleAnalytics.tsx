'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CONSENT_KEY = 'ngg_analytics_consent';
type Consent = 'loading' | 'unknown' | 'granted' | 'denied';

export default function GoogleAnalytics() {
  // Keep the server and the browser's first render identical. Reading storage
  // during initial render can cause a hydration mismatch and leave the
  // server-rendered consent buttons visible but without click handlers.
  const [consent, setConsent] = useState<Consent>('loading');

  useEffect(() => {
    let savedConsent: Consent = 'unknown';
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      savedConsent = saved === 'granted' || saved === 'denied' ? saved : 'unknown';
    } catch {
      // Storage can be unavailable in hardened/private browser contexts.
    }
    const initialize = window.setTimeout(() => setConsent(savedConsent), 0);

    const reopen = () => setConsent('unknown');
    window.addEventListener('ngg:analytics-preferences', reopen);
    return () => {
      window.clearTimeout(initialize);
      window.removeEventListener('ngg:analytics-preferences', reopen);
    };
  }, []);

  if (!GA_ID) return null;

  const choose = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // The choice should still take effect for this page when storage fails.
    }
    window.gtag?.('consent', 'update', { analytics_storage: value });
    setConsent(value);
  };

  return (
    <>
      {consent === 'granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {consent === 'unknown' && (
        <aside className="fixed inset-x-4 bottom-4 z-[120] mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl" aria-label="Analytics preferences">
          <p className="text-sm leading-6 text-slate-700">May we use privacy-conscious analytics to understand which guides and retailer links are useful? No advertising profiles are created by this site.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => choose('granted')} className="button-primary px-5 py-2 text-sm">Allow analytics</button>
            <button type="button" onClick={() => choose('denied')} className="button-secondary px-5 py-2 text-sm">No thanks</button>
          </div>
        </aside>
      )}
    </>
  );
}
