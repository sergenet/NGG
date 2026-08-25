import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, CircleDollarSign, FileSearch, RefreshCw } from 'lucide-react';

export const metadata: Metadata = { title: 'How We Choose Gifts & Gadgets', description: 'Our research, selection, disclosure, and correction standards.', alternates: { canonical: '/about/' } };

const principles = [
  { icon: FileSearch, title: 'Research first', copy: 'We compare intended use, specifications, retailer information, owner feedback patterns, and the alternatives that matter most.' },
  { icon: CheckCircle2, title: 'Best fit, not “best” for everyone', copy: 'Recommendations explain who a product suits, who should skip it, and which trade-offs deserve attention.' },
  { icon: CircleDollarSign, title: 'Commercial transparency', copy: 'Affiliate links may earn us a commission. Compensation does not change the price you pay, and paid placement must be identified.' },
  { icon: RefreshCw, title: 'Corrections over pretending', copy: 'Prices, availability, and products change. We date catalog records, welcome corrections, and avoid presenting snapshots as live data.' },
];

export default function AboutPage() {
  return <main id="main-content" className="site-container py-16 md:py-24">
    <div className="max-w-4xl"><p className="eyebrow">How we choose</p><h1 className="display-title mt-6 text-[clamp(3rem,7vw,6rem)]">Useful beats hyped.</h1><p className="mt-7 max-w-3xl text-xl leading-9 text-slate-600">NewGiftsAndGadgets is an independent discovery portal. We turn product research into approachable shortlists while being clear about what we know, what we have not personally tested, and how the site earns money.</p></div>
    <section className="mt-16 grid gap-5 md:grid-cols-2" aria-label="Editorial principles">{principles.map(({ icon: Icon, title, copy }) => <article key={title} className="rounded-3xl border border-stone-200 bg-white p-7"><Icon className="h-7 w-7 text-[#bd4b34]" /><h2 className="mt-5 text-2xl font-black text-[#18231d]">{title}</h2><p className="mt-3 leading-7 text-slate-600">{copy}</p></article>)}</section>
    <section className="mt-16 rounded-[2.5rem] bg-[#18231d] p-8 text-white md:p-12"><p className="eyebrow eyebrow-dark">Our labeling standard</p><h2 className="mt-4 text-3xl font-black">Research-based unless explicitly labeled hands-on.</h2><p className="mt-4 max-w-3xl leading-8 text-slate-300">The current catalog is curated from research and product information. We do not claim every item was purchased or personally tested. When first-hand testing is completed, the relevant page should identify the tester, method, timeframe, and sample source.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/editorial-policy/" className="button-secondary">Read editorial policy</Link><Link href="/contact/" className="button-secondary">Send a correction</Link></div></section>
  </main>;
}
