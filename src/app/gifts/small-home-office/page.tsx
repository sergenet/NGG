import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Check, MonitorUp, PlugZap, Ruler, TriangleAlert } from 'lucide-react';
import { DealCard } from '@/components/DealCard';
import productsData from '@/lib/data/products.json';
import type { Product } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Gifts for Small Home Offices: A Desk-Fit Guide',
  description: 'Choose useful gifts for a small home office by measuring desk space, clamp clearance, cable reach, compatibility, and setup requirements first.',
  alternates: { canonical: '/gifts/small-home-office/' },
  openGraph: {
    title: 'Gifts for Small Home Offices: A Desk-Fit Guide',
    description: 'A practical gift guide for limited workspaces, organized around fit, compatibility, and setup.',
    url: '/gifts/small-home-office/',
    images: ['/default-thumbnail.png'],
  },
};

const guideItems = [
  {
    slug: 'ergear-single-monitor-arm',
    role: 'Free desk surface by lifting one monitor',
    fitCheck: 'Confirm VESA pattern, monitor weight, desktop thickness, rear clamp clearance, and wall clearance.',
    skipWhen: 'The desk is glass, unusually thin, built into a wall, or cannot accept the clamp safely.',
  },
  {
    slug: 'vivo-dual-monitor-desk-mount',
    role: 'Consolidate two monitor bases into one mount',
    fitCheck: 'Confirm both screens fit the stated limits and can move without hitting a wall or one another.',
    skipWhen: 'The recipient frequently changes monitor height; this model uses manual height adjustment.',
  },
  {
    slug: 'benq-screenbar-halo',
    role: 'Add task lighting without using desktop surface',
    fitCheck: 'Confirm the monitor shape can accept a screen-mounted light and that USB power is available.',
    skipWhen: 'A webcam, monitor hood, or curved display occupies the mounting area without adequate clearance.',
  },
  {
    slug: 'anker-555-usb-c-hub-8-in-1',
    role: 'Replace several loose adapters with one compact hub',
    fitCheck: 'Confirm laptop USB-C capabilities, required display output, charging needs, and cable reach.',
    skipWhen: 'The laptop port does not support the video or charging function the recipient expects.',
  },
  {
    slug: 'magsafe-compatible-phone-stand',
    role: 'Give a phone a predictable upright position',
    fitCheck: 'Confirm MagSafe compatibility, including the phone model and case.',
    skipWhen: 'The recipient uses an incompatible phone or a thick, non-magnetic case.',
  },
  {
    slug: 'logitech-mx-master-3s',
    role: 'Reduce cable clutter and support multi-device work',
    fitCheck: 'Confirm right-handed use, operating-system support, and room for the mouse’s larger ergonomic shape.',
    skipWhen: 'The recipient is left-handed or prefers a compact, symmetrical mouse.',
  },
] as const;

const products = productsData as Product[];
const selectedProducts = guideItems
  .map((entry) => ({ entry, product: products.find((product) => product.slug === entry.slug) }))
  .filter((item): item is { entry: (typeof guideItems)[number]; product: Product } => Boolean(item.product));

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Gifts for small home offices',
  numberOfItems: selectedProducts.length,
  itemListElement: selectedProducts.map(({ product }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `https://newgiftsandgadgets.com/product/${product.slug}/`,
    name: product.title,
  })),
};

export default function SmallHomeOfficeGiftGuidePage() {
  return (
    <main id="main-content" className="site-container py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <Link href="/gifts/remote-workers/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#bd4b34]">
        <ArrowLeft className="h-4 w-4" /> Remote-worker gift hub
      </Link>

      <article>
        <header className="mt-8 max-w-4xl">
          <p className="eyebrow">Constraint guide · Small spaces</p>
          <h1 className="display-title mt-6 text-[clamp(3rem,7vw,5.8rem)]">Gifts for small home offices that earn their desk space</h1>
          <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-600">
            The wrong office gift creates clutter. The right one replaces something bulky, moves equipment off the desk, or removes a recurring setup annoyance. Measure first, then choose.
          </p>
          <p className="mt-5 text-sm leading-6 text-slate-500">
            Updated August 23, 2026. Product details and catalog prices can change. Verify dimensions, compatibility, current price, shipping, warranty, and return terms with the retailer.
          </p>
        </header>

        <section className="mt-10 rounded-[2rem] bg-[#18231d] p-7 text-white md:p-10" aria-labelledby="measurement-heading">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <Ruler className="h-7 w-7 text-amber-300" />
              <p className="mt-6 text-sm font-black uppercase tracking-[.2em] text-amber-300">Five-minute desk-fit check</p>
              <h2 id="measurement-heading" className="mt-3 text-3xl font-black">Write down these six measurements</h2>
              <p className="mt-4 leading-7 text-slate-300">A tape measure and one photo of the cable area prevent most avoidable fit mistakes.</p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {[
                'Usable desktop width and depth',
                'Space behind the desk to the wall',
                'Desktop thickness at the rear edge',
                'Clearance under the rear edge for a clamp',
                'Distance to power and USB ports',
                'Monitor weight and VESA mounting pattern',
              ].map((measurement, index) => (
                <li key={measurement} className="flex gap-3 rounded-2xl bg-white/10 p-4 leading-6"><span className="font-black text-amber-300">{index + 1}</span>{measurement}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="fit-matrix-heading">
          <p className="eyebrow">Fit matrix</p>
          <h2 id="fit-matrix-heading" className="section-title mt-3">What each gift replaces—or gets off the desk</h2>
          <div className="mt-7 overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-900">
                <tr><th className="p-4 font-black">Gift</th><th className="p-4 font-black">Space-saving role</th><th className="p-4 font-black">Fit check</th><th className="p-4 font-black">Skip when</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedProducts.map(({ entry, product }) => (
                  <tr key={product.id} className="align-top">
                    <th className="p-4 font-black text-slate-900"><Link href={`/product/${product.slug}/`} className="hover:text-[#bd4b34]">{product.title}</Link></th>
                    <td className="p-4 leading-6 text-slate-600">{entry.role}</td>
                    <td className="p-4 leading-6 text-slate-600">{entry.fitCheck}</td>
                    <td className="p-4 leading-6 text-slate-600">{entry.skipWhen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 grid gap-5 md:grid-cols-3" aria-label="Small-office buying rules">
          <div className="rounded-[1.6rem] bg-[#c7d8c0] p-6 text-[#18231d]"><MonitorUp className="h-6 w-6" /><h2 className="mt-5 text-xl font-black">Vertical beats additional</h2><p className="mt-2 text-sm leading-6 text-slate-700">A mount can reclaim surface area; another freestanding device usually consumes it.</p></div>
          <div className="rounded-[1.6rem] bg-[#e8d8c4] p-6 text-[#18231d]"><PlugZap className="h-6 w-6" /><h2 className="mt-5 text-xl font-black">Count cables too</h2><p className="mt-2 text-sm leading-6 text-slate-700">Power bricks, short leads, and inaccessible ports can make a compact product awkward in practice.</p></div>
          <div className="rounded-[1.6rem] bg-[#f4d98a] p-6 text-[#18231d]"><TriangleAlert className="h-6 w-6" /><h2 className="mt-5 text-xl font-black">Compatibility is part of size</h2><p className="mt-2 text-sm leading-6 text-slate-700">A physically small hub or mount is not useful when the laptop, monitor, phone, or desk cannot support it.</p></div>
        </section>

        <section className="mt-16" aria-labelledby="products-heading">
          <div className="section-heading-row"><div><p className="eyebrow">Shortlist</p><h2 id="products-heading" className="section-title">Six upgrades to compare</h2></div><Link href="/shop/home-office/" className="text-link">Browse all home-office finds</Link></div>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{selectedProducts.map(({ product }) => <DealCard key={product.id} product={product} />)}</div>
        </section>

        <section className="mt-16 grid gap-8 rounded-[2rem] bg-slate-100 p-7 md:grid-cols-2 md:p-10" aria-labelledby="gift-check-heading">
          <div><p className="eyebrow">Before checkout</p><h2 id="gift-check-heading" className="mt-3 text-3xl font-black text-slate-950">A giftable fit checklist</h2></div>
          <ul className="space-y-4 text-slate-700">
            {[
              'The product solves a problem the recipient has actually mentioned.',
              'The desk, monitor, laptop, phone, or operating system is compatible.',
              'There is room for the product through its full range of movement.',
              'Required cables, bulbs, adapters, or mounting hardware are included or budgeted.',
              'The retailer offers a practical return window if the fit is wrong.',
            ].map((item) => <li key={item} className="flex gap-3 leading-7"><Check className="mt-1 h-5 w-5 shrink-0 text-[#bd4b34]" />{item}</li>)}
          </ul>
        </section>

        <section className="mt-16 max-w-3xl" aria-labelledby="method-heading">
          <p className="eyebrow">How we chose</p>
          <h2 id="method-heading" className="section-title mt-3">Selection method</h2>
          <p className="mt-5 leading-8 text-slate-600">We selected catalog items relevant to remote work that can reduce surface clutter, consolidate connections, or use vertical space. The fit guidance is based on the products’ published functions and known compatibility questions. This is an editorial comparison, not a claim that we personally tested every item.</p>
          <p className="mt-5 leading-8 text-slate-600">Working with a tighter budget? Continue to <Link href="/gifts/remote-workers-under-50/" className="font-black text-[#bd4b34] underline underline-offset-4">remote-worker gifts under $50</Link>.</p>
        </section>
      </article>
    </main>
  );
}
