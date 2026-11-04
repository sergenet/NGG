'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function FirstPartyAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (localStorage.getItem('ngg_analytics_consent') !== 'granted') return;
    navigator.sendBeacon('/control-room/event', new Blob([JSON.stringify({ type: 'page_view', path: pathname, referrer: document.referrer })], { type: 'application/json' }));
  }, [pathname]);
  return null;
}
