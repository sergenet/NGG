'use client';

import { Mail, Sparkles } from 'lucide-react';
import { EmailOctopusForm } from '@/components/EmailOctopusForm';

export function NewsletterInline() {
  return (
    <section id="newsletter" className="my-12 rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-1 shadow-xl shadow-blue-500/20">
      <div className="grid grid-cols-1 items-center gap-8 rounded-[1.9rem] bg-white p-8 md:p-10 lg:grid-cols-2">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Sparkles className="h-3.5 w-3.5" /> Free Buyer&apos;s Guide &amp; Newsletter
          </div>
          <h2 className="mb-4 text-3xl font-black leading-tight text-slate-900">
            Get the 2026 Gadget Buyer&apos;s Checklist.
          </h2>
          <p className="leading-relaxed text-slate-600 mb-4">
            10 practical checks for spotting durable tech, avoiding expensive clutter, and finding gift-worthy products. Delivered straight to your inbox with our monthly curation of tested picks.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-blue-500" /> One concise email/month</span>
            <span>·</span>
            <span>No spam</span>
            <span>·</span>
            <span>Unsubscribe anytime</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 shadow-sm">
          <p className="mb-3 text-sm font-bold text-slate-800 text-center">
            Enter your email to receive the guide and monthly updates:
          </p>
          <EmailOctopusForm />
        </div>
      </div>
    </section>
  );
}
