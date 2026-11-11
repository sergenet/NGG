'use client';

import { useEffect, useState } from 'react';
import { Download, Mail, X } from 'lucide-react';
import Link from '@/components/SiteLink';
import { trackEvent } from '@/lib/analytics';

const CHECKLIST_URL = '/downloads/2026-gadget-buyers-checklist.pdf';

export function NewsletterPopup() {
  const [isDismissed, setIsDismissed] = useState(() =>
    typeof window === 'undefined' ? false : Boolean(localStorage.getItem('newsletter_dismissed')),
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isDismissed) return;
    const handleMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0) setIsVisible(true);
    };
    document.addEventListener('mouseleave', handleMouseOut);
    return () => document.removeEventListener('mouseleave', handleMouseOut);
  }, [isDismissed]);

  const dismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('newsletter_dismissed', 'true');
  };

  const download = () => {
    trackEvent('file_download', {
      event_category: 'lead_magnet',
      event_label: '2026_gadget_buyers_checklist',
      source: 'popup',
    });
    dismiss();
  };

  const trackNewsletterClick = () => {
    trackEvent('newsletter_click', {
      event_category: 'newsletter',
      event_label: 'monthly_gift_ideas',
      source: 'popup',
    });
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button onClick={dismiss} aria-label="Close" className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-500 hover:text-slate-900"><X className="h-5 w-5" /></button>
        <div className="p-8 text-center md:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100"><Download className="h-8 w-8 text-blue-700" /></div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-700">Free PDF · No email required</p>
          <h2 className="mb-3 text-3xl font-black text-slate-900">Make your next gadget worth it.</h2>
          <p className="mb-6 leading-relaxed text-slate-600">Get the 2026 Gadget Buyer&apos;s Checklist—10 practical questions for avoiding disappointing tech purchases.</p>
          <a href={CHECKLIST_URL} download onClick={download} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700"><Download className="h-5 w-5" /> Download the checklist</a>
          <p className="mt-3 text-xs text-slate-500">Immediate download. No signup or redirect.</p>
          <p className="mt-5 text-sm text-slate-600">Optional: one useful email each month with gift ideas, buying checks, and new guides. Unsubscribe anytime.</p>
          <a href="#newsletter" onClick={() => { trackNewsletterClick(); dismiss(); }} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"><Mail className="h-4 w-4" /> Join the monthly newsletter</a>
          <p className="mt-2 text-xs text-slate-500">See our <Link href="/privacy/" className="underline hover:text-slate-700">privacy policy</Link>.</p>
        </div>
      </div>
    </div>
  );
}
