'use client';

import { Download, ShieldCheck } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { EmailOctopusForm } from '@/components/EmailOctopusForm';

const CHECKLIST_URL = '/downloads/2026-gadget-buyers-checklist.pdf';

export function NewsletterInline() {
  const trackDownload = () => {
    trackEvent('file_download', {
      event_category: 'lead_magnet',
      event_label: '2026_gadget_buyers_checklist',
      source: 'inline',
    });
  };

  return (
    <section id="newsletter" className="my-12 rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-1 shadow-xl shadow-blue-500/20">
      <div className="grid grid-cols-1 items-center gap-10 rounded-[1.9rem] bg-white p-8 md:p-10 lg:grid-cols-2">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
            <ShieldCheck className="h-3.5 w-3.5" /> Free PDF · No email required
          </div>
          <h2 className="mb-4 text-3xl font-black leading-tight text-slate-900">Don&apos;t buy your next gadget without this.</h2>
          <p className="leading-relaxed text-slate-600">
            Download the <strong>2026 Gadget Buyer&apos;s Checklist</strong>: 10 practical questions for spotting useful technology and avoiding expensive clutter.
          </p>
        </div>
        <div className="space-y-4">
          <a href={CHECKLIST_URL} download onClick={trackDownload} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.98]">
            <Download className="h-5 w-5" /> Download the checklist
          </a>
          <p className="text-center text-sm text-slate-500">The PDF downloads immediately. No signup, redirect, or second email entry.</p>
          <div className="border-t border-slate-200 pt-4 text-center">
            <p className="mb-3 text-sm text-slate-600">Get one useful email each month with practical gift ideas, buying checks, and new guides. Unsubscribe anytime.</p>
            <EmailOctopusForm />
          </div>
        </div>
      </div>
    </section>
  );
}
