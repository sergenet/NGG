'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  ExternalLink,
  Globe,
  Lock,
  LogOut,
  MousePointerClick,
  Pin,
  Rss,
  Search,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const STORAGE_KEY = 'ngg_admin_auth_v1';
const EXPECTED_HASH = 'b0613ae88721bd35f9287f0c38d3517cc3aa9a331ea438f306f53ca76174bd6c';

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`ngg-admin-v1:${input.trim()}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const launchpadGroups = [
  {
    category: 'Google Analytics 4 (G-VTLRDD8KP0)',
    items: [
      {
        title: 'GA4 Realtime Overview',
        description: 'Live active visitors, traffic sources, and active pages right now.',
        href: 'https://analytics.google.com/analytics/web/#/realtime/overview',
        badge: 'Live Traffic',
        icon: Activity,
      },
      {
        title: 'GA4 Affiliate Click Events',
        description: 'Outbound "Check Price" button clicks (affiliate_click) by product & brand.',
        href: 'https://analytics.google.com/analytics/web/#/engagements/events',
        badge: 'Conversions',
        icon: MousePointerClick,
      },
    ],
  },
  {
    category: 'Google Search Console',
    items: [
      {
        title: 'GSC Search Performance',
        description: 'Search impressions, clicks, CTR, and ranking queries for newgiftsandgadgets.com.',
        href: 'https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fnewgiftsandgadgets.com%2F',
        badge: 'Search SEO',
        icon: Search,
      },
      {
        title: 'GSC Page Indexing & URL Inspection',
        description: 'Indexed pages, rich product snippets, and priority URL indexing requests.',
        href: 'https://search.google.com/search-console/index?resource_id=https%3A%2F%2Fnewgiftsandgadgets.com%2F',
        badge: 'Indexing',
        icon: Globe,
      },
    ],
  },
  {
    category: 'Awin Affiliate Network (ID: 2913559)',
    items: [
      {
        title: 'Awin Performance & Commissions',
        description: 'Clicks, transactions, conversion rate, EPC, and revenue across all brands.',
        href: 'https://ui.awin.com/awin/affiliate/2913559',
        badge: 'Revenue',
        icon: TrendingUp,
      },
      {
        title: 'Awin Pending Approvals',
        description: 'Minoston, POCOCO, Reduce, Select Brands, SKILHUNT, Lunyee, ANCEL & Deal Genius.',
        href: 'https://ui.awin.com/awin/affiliate/2913559/merchant-directory/index/tab/pending',
        badge: '8 Pending',
        icon: ShieldCheck,
      },
      {
        title: 'Awin Active Joined Brands',
        description: 'GRABO, ShadowGPS, Traverseon, Nexbie & Inspire Uplift deep links.',
        href: 'https://ui.awin.com/awin/affiliate/2913559/merchant-directory/index/tab/joined',
        badge: 'Active Brands',
        icon: BarChart3,
      },
    ],
  },
  {
    category: 'Pinterest Traffic & RSS Feeds',
    items: [
      {
        title: 'Pinterest Business Hub',
        description: 'Pin impressions, saves, and outbound traffic clicks to NewGiftsAndGadgets.',
        href: 'https://www.pinterest.com/business/hub/',
        badge: 'Social Traffic',
        icon: Pin,
      },
      {
        title: 'Pinterest Bulk & RSS Settings',
        description: 'Manage CSV bulk Pin uploads and daily auto-publishing from /rss.xml.',
        href: 'https://www.pinterest.com/settings/bulk-create-pins/',
        badge: 'Auto-Publish',
        icon: Rss,
      },
      {
        title: 'Live Site RSS Feed (/rss.xml)',
        description: 'Inspect the live RSS 2.0 product and buying-guide feed connected to Pinterest.',
        href: 'https://newgiftsandgadgets.com/rss.xml',
        badge: 'Live XML',
        icon: Rss,
      },
    ],
  },
];

export function AdminLaunchpadClient() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pin, setPin] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState('');

  // Read the remembered device after paint, then unlock. Setting state directly
  // in the effect body triggers a cascading render (react-hooks/set-state-in-effect),
  // so the result is applied from a zero-delay timeout, as GoogleAnalytics does.
  useEffect(() => {
    let remembered = false;
    try {
      remembered = window.localStorage.getItem(STORAGE_KEY) === EXPECTED_HASH;
    } catch {
      // Ignore storage access errors in private browsing
    }
    const initialize = window.setTimeout(() => {
      if (remembered) setUnlocked(true);
      setChecking(false);
    }, 0);
    return () => window.clearTimeout(initialize);
  }, []);

  const verifyPin = async (candidate: string) => {
    setError('');
    try {
      const digest = await sha256Hex(candidate);
      if (digest === EXPECTED_HASH) {
        setUnlocked(true);
        setPin('');
        if (rememberDevice) {
          try {
            window.localStorage.setItem(STORAGE_KEY, EXPECTED_HASH);
          } catch {
            // Ignore storage errors
          }
        }
        return true;
      }
    } catch {
      // Fallback if Web Crypto fails
    }
    setError('Incorrect PIN. Please try again.');
    return false;
  };

  const handlePinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(digitsOnly);
    if (error) setError('');
    if (digitsOnly.length === 4) {
      const digest = await sha256Hex(digitsOnly);
      if (digest === EXPECTED_HASH) {
        setUnlocked(true);
        setPin('');
        if (rememberDevice) {
          try {
            window.localStorage.setItem(STORAGE_KEY, EXPECTED_HASH);
          } catch {
            // Ignore
          }
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyPin(pin);
  };

  const handleLock = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setUnlocked(false);
    setPin('');
    setError('');
  };

  if (checking) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-md items-center justify-center px-4">
        <div className="text-sm font-bold text-slate-500">Checking access…</div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-md flex-col justify-center px-4 py-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-lg sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#18231d] text-[#e7a977]">
            <Lock className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-center text-2xl font-black tracking-tight text-slate-900">
            Admin Launchpad
          </h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-600">
            Enter your 4-digit PIN to unlock the NewGiftsAndGadgets operations dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-pin" className="sr-only">
                4-Digit PIN
              </label>
              <input
                id="admin-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                autoFocus
                placeholder="••••"
                value={pin}
                onChange={handlePinChange}
                className="w-full rounded-2xl border-2 border-stone-200 bg-[#fbfaf6] px-4 py-4 text-center text-2xl font-black tracking-[0.5em] text-slate-900 outline-none transition focus:border-[#bd4b34] focus:bg-white"
              />
            </div>

            {error && (
              <p role="alert" className="text-center text-xs font-bold text-red-600">
                {error}
              </p>
            )}

            <label className="flex cursor-pointer items-center justify-center gap-2.5 py-1 text-xs font-semibold text-slate-600 select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 accent-[#bd4b34]"
              />
              Remember on this phone / browser
            </label>

            <button
              type="submit"
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#bd4b34] px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-[#a33d28] active:scale-[0.99]"
            >
              Unlock Launchpad
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="rounded-[1.75rem] bg-[#18231d] p-5 text-white sm:rounded-[2rem] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#e7a977]">
              PIN-Protected · Mobile Ready
            </p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
              1-Click Operations Launchpad
            </h1>
            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">
              Tap any card below to open your live traffic, search, social, or Awin affiliate reports.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://newgiftsandgadgets.com/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
            >
              Sitemap.xml
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={handleLock}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-red-400/30 bg-red-500/20 px-4 py-2 text-xs font-bold text-red-100 transition hover:bg-red-500/30"
            >
              <LogOut className="h-3.5 w-3.5" />
              Lock
            </button>
          </div>
        </div>
      </header>

      <div className="mt-7 space-y-8 sm:mt-10 sm:space-y-10">
        {launchpadGroups.map((group) => (
          <section key={group.category}>
            <h2 className="px-1 text-xs font-black uppercase tracking-[0.14em] text-slate-500 sm:text-sm">
              {group.category}
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3.5 sm:mt-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition active:scale-[0.99] hover:border-[#bd4b34] hover:shadow-md sm:rounded-[1.75rem] sm:p-6"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f3ec] text-[#bd4b34] transition group-hover:bg-[#bd4b34] group-hover:text-white">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="mt-3.5 text-base font-black text-slate-900 transition group-hover:text-[#bd4b34] sm:mt-5 sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#bd4b34] sm:mt-6">
                      Open Dashboard
                      <ExternalLink className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
