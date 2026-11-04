'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CONSENT_KEY = 'ngg_analytics_consent';
const GA_SCRIPT_ID = 'ngg-ga4-script';
type Consent = 'loading' | 'unknown' | 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

function initializeAnalyticsQueue() {
  if (!GA_ID || typeof window === 'undefined') return;

  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = false;
  window.dataLayer = window.dataLayer || [];

  if (typeof window.gtag !== 'function') {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }

  const analyticsWindow = window as unknown as Record<string, unknown>;
  if (!analyticsWindow.__nggGaConfigured) {
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    analyticsWindow.__nggGaConfigured = true;
  }
}

function disableAnalytics() {
  if (!GA_ID || typeof window === 'undefined') return;
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
  document.getElementById(GA_SCRIPT_ID)?.remove();
  document.getElementById('ga4-init')?.remove();
}

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

  useEffect(() => {
    if (consent === 'granted') initializeAnalyticsQueue();
  }, [consent]);

  if (!GA_ID) return null;

  const choose = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // The choice should still take effect for this page when storage fails.
    }
    if (value === 'granted') initializeAnalyticsQueue();
    if (value === 'denied') disableAnalytics();
    setConsent(value);
  };

  return (
    <>
      {consent === 'granted' && (
        <>
          <Script id={GA_SCRIPT_ID} src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};if(!window.__nggGaConfigured){window.gtag('js',new Date());window.gtag('config','${GA_ID}',{anonymize_ip:true});window.__nggGaConfigured=true;}`}
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
