import type { Metadata } from 'next';
import Link from '@/components/SiteLink';
import { notFound } from 'next/navigation';
import { ArrowLeft, Compass, ShieldCheck } from 'lucide-react';
import productsData from '@/lib/data/products.json';
import type { Product } from '@/lib/schema';
import { DealCard } from '@/components/DealCard';
import AdSlot, { AD_SLOT_FOOTER } from '@/components/AdSlot';

const audiences = {
  'remote-workers': { label: 'Remote Workers', title: 'Useful gifts for remote workers', intro: 'Practical desk, comfort, video-call, and travel upgrades for people whose workspace matters every day.', note: 'Start with the friction they mention most: posture, lighting, charging, focus, or portability.' },
  'home-cooks': { label: 'Home Cooks', title: 'Useful gifts for home cooks', intro: 'Kitchen tools chosen around repeat use, cleanup, storage, and the recipient’s actual cooking habits.', note: 'Check counter space, capacity, cleaning requirements, and whether they already own a similar tool.' },
  'new-homeowners': { label: 'New Homeowners', title: 'Smart gifts for new homeowners', intro: 'Connected-home upgrades for lighting, shared scheduling, and lawn care—without pretending every device fits every ecosystem.', note: 'Confirm Wi-Fi requirements, platform compatibility, subscriptions, installation, and privacy expectations.' },
  'pet-parents': { label: 'Pet Parents', title: 'Helpful gifts for pet parents', intro: 'Grooming vacuums and practical pet tools selected for real routines rather than novelty alone.', note: 'Safety instructions, cleaning, backup behavior, noise, and ongoing subscriptions matter more than app screenshots.' },
  travelers: { label: 'Travelers', title: 'Practical gifts for travelers', intro: 'Packing, laundry, and in-transit gear for smoother trips and fewer cable-drawer mistakes.', note: 'Check dimensions, weight, airline restrictions, regional compatibility, and what the recipient already carries.' },
  coworkers: { label: 'Coworkers', title: 'Giftable desk finds for coworkers', intro: 'Approachable desk gifts with personality, useful function, and budgets that work for exchanges or thank-yous.', note: 'For workplace gifts, favor compact, easy-to-share items and avoid anything too personal or difficult to return.' },
} as const;

type AudienceKey = keyof typeof audiences;

export function generateStaticParams() {
  return Object.keys(audiences).map((audience) => ({ audience }));
}

export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }): Promise<Metadata> {
  const { audience } = await params;
  const config = audiences[audience as AudienceKey];
  if (!config) return { title: 'Gift collection not found' };
  return {
    title: config.title,
    description: config.intro,
    alternates: { canonical: `/gifts/${audience}/` },
    openGraph: { title: config.title, description: config.intro, url: `/gifts/${audience}/`, images: ['/social/gifts.png'] },
  };
}

export default async function AudiencePage({ params }: { params: Promise<{ audience: string }> }) {
  const { audience } = await params;
  const config = audiences[audience as AudienceKey];
  if (!config) notFound();

  const products = (productsData as Product[]).filter((product) => product.tags.recipient.includes(config.label));

  return (
    <main id="main-content" className="site-container py-16 md:py-24">
      <Link href="/gift-guides/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#bd4b34]"><ArrowLeft className="h-4 w-4" /> All gift paths</Link>
      <header className="mt-8 max-w-4xl">
        <p className="eyebrow">Gifts by person</p>
        <h1 className="display-title mt-6 text-[clamp(3rem,7vw,6rem)]">{config.title}</h1>
        <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-600">{config.intro}</p>
      </header>
      <section className="mt-10 grid gap-4 rounded-[2rem] bg-[#18231d] p-7 text-white md:grid-cols-2 md:p-9">
        <div className="flex gap-3"><Compass className="mt-1 h-5 w-5 shrink-0 text-amber-300" /><div><h2 className="font-black">A better starting question</h2><p className="mt-2 text-sm leading-6 text-slate-300">{config.note}</p></div></div>
        <div className="flex gap-3"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-300" /><div><h2 className="font-black">Before purchasing</h2><p className="mt-2 text-sm leading-6 text-slate-300">Prices are catalog snapshots. Verify the current model, price, stock, shipping, warranty, and return policy with the retailer.</p></div></div>
      </section>
      {audience === 'remote-workers' && (
        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/gifts/small-home-office/" className="group rounded-[1.75rem] border border-[#b8cdb1] bg-[#edf5e9] p-6 transition-transform hover:-translate-y-1 md:p-8">
            <p className="eyebrow">Desk-fit guide</p><h2 className="mt-2 text-2xl font-black text-[#18231d]">Working with a small home office?</h2><p className="mt-2 leading-7 text-slate-600">Measure clamp clearance, cable reach, monitor compatibility, and usable surface before choosing.</p><span className="mt-5 inline-flex font-black text-[#bd4b34]">Open the small-office guide →</span>
          </Link>
          <Link href="/gifts/remote-workers-under-50/" className="group rounded-[1.75rem] border border-[#d8c7ad] bg-[#fff8e8] p-6 transition-transform hover:-translate-y-1 md:p-8">
            <p className="eyebrow">Budget guide</p><h2 className="mt-2 text-2xl font-black text-[#18231d]">Shopping with a $50 ceiling?</h2><p className="mt-2 leading-7 text-slate-600">See which low-cost desk gifts solve a real problem—and what to check first.</p><span className="mt-5 inline-flex font-black text-[#bd4b34]">Compare gifts under $50 →</span>
          </Link>
          <Link href="/gifts/video-call-gifts/" className="group rounded-[1.75rem] border border-[#c7c3dd] bg-[#f3f0ff] p-6 transition-transform hover:-translate-y-1 md:p-8"><p className="eyebrow">Call-quality guide</p><h2 className="mt-2 text-2xl font-black text-[#18231d]">On video calls all day?</h2><p className="mt-2 leading-7 text-slate-600">Choose among lighting, cameras, portability, privacy, and eye-contact tools.</p><span className="mt-5 inline-flex font-black text-[#bd4b34]">Find video-call gifts →</span></Link>
          <Link href="/gifts/ergonomic-desk-worker-gifts/" className="group rounded-[1.75rem] border border-[#b8cdb1] bg-[#edf5e9] p-6 transition-transform hover:-translate-y-1 md:p-8"><p className="eyebrow">Fit-first guide</p><h2 className="mt-2 text-2xl font-black text-[#18231d]">Shopping for better ergonomics?</h2><p className="mt-2 leading-7 text-slate-600">Start with body fit, adjustability, desk construction, and returnability.</p><span className="mt-5 inline-flex font-black text-[#bd4b34]">Compare ergonomic gifts →</span></Link>
          <Link href="/gifts/tech-gifts-without-subscriptions/" className="group rounded-[1.75rem] border border-[#d8c7ad] bg-[#fff8e8] p-6 transition-transform hover:-translate-y-1 md:p-8"><p className="eyebrow">No recurring fee</p><h2 className="mt-2 text-2xl font-black text-[#18231d]">Avoid gifting another bill</h2><p className="mt-2 leading-7 text-slate-600">Find useful hardware whose core function does not require a paid plan.</p><span className="mt-5 inline-flex font-black text-[#bd4b34]">Browse no-subscription gifts →</span></Link>
        </section>
      )}
      {audience === 'home-cooks' && (
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/gifts/home-cooks-under-50/" className="group rounded-[1.75rem] border border-[#d8c7ad] bg-[#fff8e8] p-6 transition-transform hover:-translate-y-1 md:p-8"><p className="eyebrow">Budget guide</p><h2 className="mt-2 text-2xl font-black text-[#18231d]">Useful gifts under $50</h2><p className="mt-2 leading-7 text-slate-600">A deliberately short list built around repeat use and realistic cleanup.</p><span className="mt-5 inline-flex font-black text-[#bd4b34]">Compare budget gifts →</span></Link>
          <Link href="/gifts/small-kitchen-gifts/" className="group rounded-[1.75rem] border border-[#b8cdb1] bg-[#edf5e9] p-6 transition-transform hover:-translate-y-1 md:p-8"><p className="eyebrow">Space guide</p><h2 className="mt-2 text-2xl font-black text-[#18231d]">Shopping for a small kitchen?</h2><p className="mt-2 leading-7 text-slate-600">Check operating clearance, storage state, outlets, attachments, and cleanup.</p><span className="mt-5 inline-flex font-black text-[#bd4b34]">Open the space guide →</span></Link>
          <Link href="/gifts/home-cooks-by-cooking-style/" className="group rounded-[1.75rem] border border-[#c7c3dd] bg-[#f3f0ff] p-6 transition-transform hover:-translate-y-1 md:p-8"><p className="eyebrow">Habit guide</p><h2 className="mt-2 text-2xl font-black text-[#18231d]">Match how they cook</h2><p className="mt-2 leading-7 text-slate-600">Choose for batch prep, meat cooking, air frying, coffee, or hands-on espresso.</p><span className="mt-5 inline-flex font-black text-[#bd4b34]">Choose by cooking style →</span></Link>
        </section>
      )}
      <AdSlot className="mt-12 rounded-[2rem] border border-stone-200 bg-white px-4 py-5" />
      <section className="mt-14" aria-labelledby="collection-heading">
        <div className="section-heading-row"><div><p className="eyebrow">Curated shortlist</p><h2 id="collection-heading" className="section-title">{products.length} ideas to compare</h2></div><Link href="/shop/all/" className="text-link">Browse the full catalog</Link></div>
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <DealCard key={product.id} product={product} />)}</div>
      </section>
      <AdSlot slot={AD_SLOT_FOOTER} className="mt-14 rounded-[2rem] border border-stone-200 bg-white px-4 py-5" />
    </main>
  );
}
