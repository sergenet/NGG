import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Check, Ruler, ShieldCheck, WalletCards } from 'lucide-react';
import { DealCard } from '@/components/DealCard';
import productsData from '@/lib/data/products.json';
import type { Product } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Gifts for Remote Workers Under $50 That Fit a Real Desk',
  description: 'Compare useful gifts for remote workers under $50 by desk space, setup, compatibility, and everyday usefulness—not novelty alone.',
  alternates: { canonical: '/gifts/remote-workers-under-50/' },
  openGraph: {
    title: 'Gifts for Remote Workers Under $50 That Fit a Real Desk',
    description: 'A practical shortlist organized by workspace fit, setup effort, and likely everyday use.',
    url: '/gifts/remote-workers-under-50/',
    images: ['/default-thumbnail.png'],
  },
};

const shortlist = [
  {
    slug: 'vivo-dual-monitor-desk-mount',
    bestFor: 'A two-monitor desk that needs more usable surface area',
    checkFirst: 'Monitor weight and VESA pattern; height changes require manual adjustment',
  },
  {
    slug: 'ergear-single-monitor-arm',
    bestFor: 'A single monitor that needs smoother height and position changes',
    checkFirst: 'Desk edge, clamp clearance, monitor weight, and cable slack',
  },
  {
    slug: 'taotronics-led-desk-lamp',
    bestFor: 'A dim workspace that also needs convenient USB charging',
    checkFirst: 'Available desktop area and tolerance for touch controls',
  },
  {
    slug: 'lepower-metal-desk-lamp',
    bestFor: 'A simple, adjustable task light without app setup',
    checkFirst: 'A compatible bulb is needed; this model does not provide dimming',
  },
  {
    slug: 'levitating-globe-lamp',
    bestFor: 'A compact conversation piece for a desk or video-call background',
    checkFirst: 'It needs constant power and takes a little practice to balance',
  },
] as const;

const products = productsData as Product[];
const selectedProducts = shortlist
  .map((entry) => ({ entry, product: products.find((product) => product.slug === entry.slug) }))
  .filter((item): item is { entry: (typeof shortlist)[number]; product: Product } => Boolean(item.product));

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Gifts for remote workers under $50',
  numberOfItems: selectedProducts.length,
  itemListElement: selectedProducts.map(({ product }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `https://newgiftsandgadgets.com/product/${product.slug}/`,
    name: product.title,
  })),
};

export default function RemoteWorkerGiftsUnderFiftyPage() {
  return (
    <main id="main-content" className="site-container py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <Link href="/gifts/remote-workers/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#bd4b34]">
        <ArrowLeft className="h-4 w-4" /> Remote-worker gift hub
      </Link>

      <article>
        <header className="mt-8 max-w-4xl">
          <p className="eyebrow">Useful gifts · Under $50</p>
          <h1 className="display-title mt-6 text-[clamp(3rem,7vw,5.8rem)]">Gifts for remote workers that fit a real desk</h1>
          <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-600">
            A low price does not make a desk accessory useful. These ideas solve a specific workspace problem and include the fit or setup question worth checking before you buy.
          </p>
          <p className="mt-5 text-sm leading-6 text-slate-500">
            Updated August 23, 2026. “Under $50” reflects our catalog snapshot, not a guaranteed retailer price. Confirm the current total, shipping, model, and return terms before purchasing.
          </p>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-3" aria-label="How this guide helps">
          <div className="rounded-[1.6rem] bg-[#18231d] p-6 text-white">
            <Ruler className="h-6 w-6 text-amber-300" />
            <h2 className="mt-5 text-xl font-black">Check the footprint</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Measure the desk edge, wall clearance, and the space used when an arm or lamp is fully extended.</p>
          </div>
          <div className="rounded-[1.6rem] bg-[#e8d8c4] p-6 text-[#18231d]">
            <WalletCards className="h-6 w-6" />
            <h2 className="mt-5 text-xl font-black">Protect the budget</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">Check shipping and required extras—such as a bulb—because the accessory cost can push a gift past $50.</p>
          </div>
          <div className="rounded-[1.6rem] bg-[#c7d8c0] p-6 text-[#18231d]">
            <ShieldCheck className="h-6 w-6" />
            <h2 className="mt-5 text-xl font-black">Avoid compatibility misses</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">For monitor mounts, verify VESA pattern, screen weight, desktop thickness, and clamp clearance.</p>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="quick-compare-heading">
          <p className="eyebrow">Decision table</p>
          <h2 id="quick-compare-heading" className="section-title mt-3">Choose by the problem, not the packaging</h2>
          <div className="mt-7 overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-900">
                <tr>
                  <th className="p-4 font-black">Gift</th>
                  <th className="p-4 font-black">Best fit</th>
                  <th className="p-4 font-black">Check before buying</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedProducts.map(({ entry, product }) => (
                  <tr key={product.id} className="align-top">
                    <th className="p-4 font-black text-slate-900"><Link href={`/product/${product.slug}/`} className="hover:text-[#bd4b34]">{product.title}</Link></th>
                    <td className="p-4 leading-6 text-slate-600">{entry.bestFor}</td>
                    <td className="p-4 leading-6 text-slate-600">{entry.checkFirst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="shortlist-heading">
          <div className="section-heading-row">
            <div><p className="eyebrow">Shortlist</p><h2 id="shortlist-heading" className="section-title">Five ideas worth comparing</h2></div>
            <Link href="/shop/all/?price=under-50" className="text-link">Browse every gift under $50</Link>
          </div>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {selectedProducts.map(({ product }) => <DealCard key={product.id} product={product} />)}
          </div>
        </section>

        <section className="mt-16 grid gap-8 rounded-[2rem] bg-slate-100 p-7 md:grid-cols-2 md:p-10" aria-labelledby="skip-heading">
          <div>
            <p className="eyebrow">Fast filter</p>
            <h2 id="skip-heading" className="mt-3 text-3xl font-black text-slate-950">When to skip these gifts</h2>
          </div>
          <ul className="space-y-4 text-slate-700">
            {[
              'Skip a monitor arm if you cannot confirm the monitor and desk specifications.',
              'Skip a lamp if the recipient already has controlled overhead or monitor lighting they like.',
              'Skip decorative desk objects when usable surface area is already limited.',
              'Skip any workspace accessory when the recipient cannot return or exchange it easily.',
            ].map((reason) => <li key={reason} className="flex gap-3 leading-7"><Check className="mt-1 h-5 w-5 shrink-0 text-[#bd4b34]" />{reason}</li>)}
          </ul>
        </section>

        <section className="mt-16 max-w-3xl" aria-labelledby="method-heading">
          <p className="eyebrow">How we chose</p>
          <h2 id="method-heading" className="section-title mt-3">Selection method</h2>
          <p className="mt-5 leading-8 text-slate-600">
            We filtered the current catalog for remote-worker relevance and a recorded price below $50, then favored products with a clear everyday use. We excluded items that could not be described with a concrete fit, setup, or ownership consideration. This is an editorial comparison based on published product information; it is not a claim that we personally tested every item.
          </p>
          <p className="mt-5 leading-8 text-slate-600">Need to optimize a constrained workspace first? Use our <Link href="/gifts/small-home-office/" className="font-black text-[#bd4b34] underline underline-offset-4">small-home-office desk-fit guide</Link>.</p>
        </section>
      </article>
    </main>
  );
}
