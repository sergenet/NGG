import React from 'react';
import { Briefcase, BarChart3, ShieldAlert, Mail } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata = {
  title: 'Work With Us — Media Kit',
  description: 'Partner with NewGiftsAndGadgets. Independent Reviews. Engaged Audience. Real Results.',
  alternates: {
    canonical: '/work-with-us',
  },
};

export default function WorkWithUsPage() {
  const breadcrumbs = [
    { label: 'Work With Us', href: '/work-with-us' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />
        
        <header className="mb-16 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
            Partnerships
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            Partner With NewGiftsAndGadgets
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Independent Reviews. Engaged Audience. Real Results.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* What We Offer */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What We Offer</h2>
            </div>
            <ul className="space-y-4 text-slate-600 dark:text-slate-400">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 font-bold">•</span>
                <span><strong>Sponsored Reviews</strong> (honest, hands-on, transparent disclosure)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 font-bold">•</span>
                <span><strong>Gift Guide Placement</strong> (seasonal/themed features)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 font-bold">•</span>
                <span><strong>Newsletter Sponsorship</strong> (highly engaged, 40%+ open rates)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2 font-bold">•</span>
                <span><strong>Social Features</strong> (YouTube Shorts, TikTok, Instagram Reels)</span>
              </li>
            </ul>
          </div>

          {/* Audience Snapshot */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Audience Snapshot</h2>
            </div>
            <ul className="space-y-4 text-slate-600 dark:text-slate-400">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 font-bold">•</span>
                <span><strong>Demographics:</strong> Ages 25-45, 60% male / 40% female</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 font-bold">•</span>
                <span><strong>Income:</strong> $60K-$150K household income</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 font-bold">•</span>
                <span><strong>Interests:</strong> Remote work, smart home, productivity, cooking</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 font-bold">•</span>
                <span><strong>Traffic Sources:</strong> Organic (40%), Pinterest (25%), YouTube (20%), Direct (15%)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Content Standards */}
        <div className="bg-slate-900 dark:bg-slate-900/50 p-8 md:p-12 rounded-3xl shadow-lg mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldAlert className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4">Our Content Standards</h2>
            <p className="text-slate-300 text-lg mb-6">
              We protect our audience's trust above all else. When you partner with us, you agree to our strict editorial guidelines:
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium">FTC-Compliant Disclosures</span>
              <span className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium">Minimum 2-Week Testing</span>
              <span className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium">Honest Pros & Cons</span>
              <span className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium">No Brand Copy Editing</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Ready to reach highly-qualified buyers?</h2>
          <a 
            href="mailto:contact@newgiftsandgadgets.com?subject=Partnership Inquiry"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
          >
            <Mail className="w-5 h-5" />
            Request Current Rate Card
          </a>
        </div>

      </div>
    </main>
  );
}
