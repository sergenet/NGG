import Link from 'next/link';
import { ArrowLeft, Check, CircleAlert } from 'lucide-react';
import { DealCard } from '@/components/DealCard';
import productsData from '@/lib/data/products.json';
import type { Product } from '@/lib/schema';

export type TopicGuideItem = {
  slug: string;
  bestFor: string;
  checkFirst: string;
  skipWhen: string;
};

type TopicGuideProps = {
  eyebrow: string;
  title: string;
  dek: string;
  updated: string;
  principles: { title: string; body: string }[];
  items: TopicGuideItem[];
  method: string;
  related: { href: string; label: string }[];
  hubHref?: string;
  hubLabel?: string;
  shopHref?: string;
  shopLabel?: string;
};

const products = productsData as Product[];

export function RemoteWorkerTopicGuide({ eyebrow, title, dek, updated, principles, items, method, related, hubHref = '/gifts/remote-workers/', hubLabel = 'Remote-worker gift hub', shopHref = '/shop/home-office/', shopLabel = 'Browse home-office finds' }: TopicGuideProps) {
  const selections = items
    .map((entry) => ({ entry, product: products.find((product) => product.slug === entry.slug) }))
    .filter((item): item is { entry: TopicGuideItem; product: Product } => Boolean(item.product));
  const schema = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: title, numberOfItems: selections.length,
    itemListElement: selections.map(({ product }, index) => ({ '@type': 'ListItem', position: index + 1, name: product.title, url: `https://newgiftsandgadgets.com/product/${product.slug}/` })),
  };

  return (
    <main id="main-content" className="site-container py-16 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Link href={hubHref} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#bd4b34]"><ArrowLeft className="h-4 w-4" /> {hubLabel}</Link>
      <article>
        <header className="mt-8 max-w-4xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-title mt-6 text-[clamp(3rem,7vw,5.8rem)]">{title}</h1>
          <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-600">{dek}</p>
          <p className="mt-5 text-sm leading-6 text-slate-500">Updated {updated}. Verify the current model, compatibility, price, stock, shipping, warranty, and return terms with the retailer.</p>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-3" aria-label="Buying principles">
          {principles.map((principle, index) => (
            <div key={principle.title} className={`rounded-[1.6rem] p-6 ${index === 0 ? 'bg-[#18231d] text-white' : index === 1 ? 'bg-[#e8d8c4] text-[#18231d]' : 'bg-[#c7d8c0] text-[#18231d]'}`}>
              <span className="text-sm font-black text-[#bd4b34]">0{index + 1}</span><h2 className="mt-4 text-xl font-black">{principle.title}</h2><p className={`mt-2 text-sm leading-6 ${index === 0 ? 'text-slate-300' : 'text-slate-700'}`}>{principle.body}</p>
            </div>
          ))}
        </section>

        {selections.length > 0 && <section className="mt-16" aria-labelledby="compare-heading">
          <p className="eyebrow">Decision table</p><h2 id="compare-heading" className="section-title mt-3">Compare the fit before the features</h2>
          <div className="mt-7 overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white">
            <table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-100 text-slate-900"><tr><th className="p-4 font-black">Gift</th><th className="p-4 font-black">Best for</th><th className="p-4 font-black">Check first</th><th className="p-4 font-black">Skip when</th></tr></thead>
              <tbody className="divide-y divide-slate-200">{selections.map(({ entry, product }) => <tr key={product.id} className="align-top"><th className="p-4 font-black"><Link href={`/product/${product.slug}/`} className="hover:text-[#bd4b34]">{product.title}</Link></th><td className="p-4 leading-6 text-slate-600">{entry.bestFor}</td><td className="p-4 leading-6 text-slate-600">{entry.checkFirst}</td><td className="p-4 leading-6 text-slate-600">{entry.skipWhen}</td></tr>)}</tbody>
            </table>
          </div>
        </section>}

        <section className="mt-16" aria-labelledby="shortlist-heading"><div className="section-heading-row"><div><p className="eyebrow">Curated shortlist</p><h2 id="shortlist-heading" className="section-title">{selections.length > 0 ? `${selections.length} relevant options` : 'Shortlist under revision'}</h2></div><Link href={shopHref} className="text-link">{shopLabel}</Link></div>{selections.length > 0 ? <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{selections.map(({ product }) => <DealCard key={product.id} product={product} />)}</div> : <p className="mt-6 max-w-2xl leading-8 text-slate-600">These picks are being re-sourced, so the shortlist is temporarily empty. <Link href={shopHref} className="font-bold text-[#bd4b34] hover:underline">{shopLabel}</Link> instead.</p>}</section>

        <section className="mt-16 rounded-[2rem] bg-slate-100 p-7 md:p-10" aria-labelledby="method-heading"><div className="grid gap-7 md:grid-cols-[.7fr_1.3fr]"><div><CircleAlert className="h-6 w-6 text-[#bd4b34]" /><p className="eyebrow mt-5">Editorial method</p><h2 id="method-heading" className="mt-3 text-3xl font-black">How this list was built</h2></div><div><p className="leading-8 text-slate-600">{method}</p><p className="mt-5 text-sm leading-6 text-slate-500">This is a research-based editorial comparison of published product information, not a claim that we personally tested every item.</p></div></div></section>

        <nav className="mt-16" aria-label="Related remote-worker guides"><p className="eyebrow">Continue the search</p><div className="mt-4 flex flex-wrap gap-3">{related.map((link) => <Link key={link.href} href={link.href} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 hover:border-[#bd4b34] hover:text-[#bd4b34]"><Check className="h-4 w-4" />{link.label}</Link>)}</div></nav>
      </article>
    </main>
  );
}
