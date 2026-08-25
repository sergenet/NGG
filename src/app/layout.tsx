import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Gift, Mail } from 'lucide-react';
import './globals.css';
import productsData from '@/lib/data/products.json';
import { CategoriesDropdown } from '@/components/CategoriesDropdown';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { AnalyticsPreferencesButton } from '@/components/AnalyticsPreferencesButton';

export const metadata: Metadata = {
  metadataBase: new URL('https://newgiftsandgadgets.com'),
  title: { default: 'NewGiftsAndGadgets — Useful Gifts, Clever Gadgets', template: '%s | NewGiftsAndGadgets' },
  description: 'Practical gifts, clever gadgets, and research-based buying guides with clear trade-offs and transparent affiliate disclosure.',
  applicationName: 'NewGiftsAndGadgets',
  category: 'shopping',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', url: '/', siteName: 'NewGiftsAndGadgets',
    title: 'NewGiftsAndGadgets — Useful Gifts, Clever Gadgets',
    description: 'Find a gift they’ll actually use. Browse practical picks by person, purpose, and price.',
    images: [{ url: '/default-thumbnail.png', width: 1200, height: 630, alt: 'NewGiftsAndGadgets gift and gadget portal' }],
  },
  twitter: { card: 'summary_large_image', title: 'NewGiftsAndGadgets', description: 'Useful gifts and clever gadgets, thoughtfully curated.', images: ['/default-thumbnail.png'] },
  robots: { index: true, follow: true },
  verification: { other: { 'p:domain_verify': '72cef8dccd016abd8a0325a8f305d18d' } },
};

const organizationSchema = {
  '@context': 'https://schema.org', '@type': 'Organization', name: 'NewGiftsAndGadgets',
  url: 'https://newgiftsandgadgets.com', logo: 'https://newgiftsandgadgets.com/assets/images/ngg-logo.png',
  description: 'An independent gift and gadget discovery portal built around useful recommendations and transparent affiliate disclosure.',
  sameAs: ['https://www.facebook.com/NewGiftsandGadgetsOfficial/', 'https://www.pinterest.com/sergenet/'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const categories = Array.from(new Set(productsData.map((product) => product.tags.category)));
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div className="border-b border-amber-200 bg-amber-100 px-4 py-2 text-center text-xs font-bold text-amber-950">
          Independent curation · Prices can change · Affiliate links may earn us a commission
        </div>
        <header className="sticky top-0 z-50 border-b border-stone-200/90 bg-[#fbfaf6]/95 backdrop-blur-xl">
          <div className="site-container flex min-h-18 items-center justify-between gap-6 py-3">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-black tracking-tight text-[#18231d]" aria-label="NewGiftsAndGadgets home">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ef6a4d] text-white"><Gift className="h-5 w-5" /></span>
              <span>NewGifts<span className="text-[#bd4b34]">&amp;</span>Gadgets</span>
            </Link>
            <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm font-bold text-slate-700 lg:flex">
              <Link href="/shop/all/" className="hover:text-[#bd4b34]">All finds</Link>
              <Link href="/gift-guides/" className="hover:text-[#bd4b34]">Gift guides</Link>
              <CategoriesDropdown categories={categories} />
              <Link href="/brands/" className="hover:text-[#bd4b34]">Brands</Link>
              <Link href="/about/" className="hover:text-[#bd4b34]">How we choose</Link>
            </nav>
            <Link href="/shop/all/" className="button-primary min-h-10 px-4 py-2 text-xs">Find a gift <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <nav aria-label="Mobile navigation" className="site-container flex gap-5 overflow-x-auto border-t border-stone-200 py-2 text-sm font-bold text-slate-700 no-scrollbar lg:hidden">
            <Link href="/shop/all/">All finds</Link><Link href="/gift-guides/">Gift guides</Link><Link href="/shop/home-office/">Home office</Link><Link href="/shop/kitchen/">Kitchen</Link><Link href="/about/">About</Link>
          </nav>
        </header>
        {children}
        <footer className="border-t border-stone-200 bg-[#18231d] text-white">
          <div className="site-container grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
            <div><div className="flex items-center gap-2 text-xl font-black"><Gift className="h-5 w-5 text-[#ef8a73]" /> NewGifts&amp;Gadgets</div><p className="mt-4 max-w-md text-sm leading-7 text-slate-300">A practical portal for finding useful, giftable products. We explain who each pick suits, what to consider, and where affiliate compensation may apply.</p><div className="mt-5"><a className="inline-flex rounded-full border border-white/20 p-2.5 hover:bg-white/10" href="mailto:contact@newgiftsandgadgets.com" aria-label="Email NewGiftsAndGadgets"><Mail className="h-4 w-4" /></a></div></div>
            <div><h2 className="text-sm font-black uppercase tracking-[.18em] text-[#efb09f]">Explore</h2><ul className="mt-5 space-y-3 text-sm text-slate-300"><li><Link href="/shop/all/">All gifts &amp; gadgets</Link></li><li><Link href="/gift-guides/">Gift guides</Link></li><li><Link href="/brands/">Browse brands</Link></li><li><Link href="/work-with-us/">Work with us</Link></li></ul></div>
            <div><h2 className="text-sm font-black uppercase tracking-[.18em] text-[#efb09f]">Trust</h2><ul className="mt-5 space-y-3 text-sm text-slate-300"><li><Link href="/about/">How we choose</Link></li><li><Link href="/editorial-policy/">Editorial policy</Link></li><li><Link href="/affiliate-disclosure/">Affiliate disclosure</Link></li><li><Link href="/privacy/">Privacy</Link></li><li><AnalyticsPreferencesButton /></li><li><Link href="/terms/">Terms</Link></li><li><Link href="/contact/">Contact</Link></li></ul></div>
          </div>
          <div className="border-t border-white/10"><div className="site-container flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:justify-between"><p>© 2026 NewGiftsAndGadgets. All rights reserved.</p><p>Prices and availability may change after publication.</p></div></div>
        </footer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
