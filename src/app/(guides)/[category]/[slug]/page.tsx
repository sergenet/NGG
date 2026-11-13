import React from 'react';
import Link from '@/components/SiteLink';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { TableOfContents } from '@/components/TableOfContents';
import { DealCard } from '@/components/DealCard';
import { NewsletterInline } from '@/components/NewsletterInline';
import productsData from '@/lib/data/products.json';
import articlesData from '@/lib/data/articles.json';
import { Product } from '@/lib/schema';
import { formatPriceBracket, guideSlug } from '@/lib/utils';

/**
 * The article queue, typed once. `publishedAt` is optional because the guides
 * written before the field existed have no recorded publication date, and the
 * page must not invent one for them.
 */
type Guide = {
  title: string;
  category_slug: string;
  product_asins: string[];
  status: string;
  body_intro: string;
  publishedAt?: string;
};

const guides = articlesData.queue as Guide[];

const slugify = guideSlug;

const getGuideAngle = (category: string) => {
  switch (category) {
    case 'home-office':
      return 'Focus on productivity, ergonomics, and upgrades that remove friction from daily work.';
    case 'smart-home':
      return 'Prioritize devices that automate repetitive tasks, improve comfort, or make the home feel more responsive.';
    case 'kitchen':
      return 'Lead with practical utility, cleanup time, and how often the item will actually get used.';
    default:
      return 'Choose products that solve a real problem and make the buying decision easier for the reader.';
  }
};

const categoryToSlug = (categoryName: string) => categoryName.toLowerCase().replace(/\s+/g, '-');

const MIN_GUIDE_PRODUCTS = 3;
const MAX_GUIDE_PRODUCTS = 5;

const normalizeGuideHtml = (html: string) => html
  .replace(/<p>## ([^<\n]+)\n?/g, '<h2>$1</h2><p>')
  .replace(/<p>### ([^<\n]+)\n?/g, '<h3>$1</h3><p>');

export async function generateStaticParams() {
  return guides.map((article) => ({
    category: article.category_slug,
    slug: slugify(article.title),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string, slug: string }> }) {
  const { category, slug } = await params;
  const article = guides.find((a) => slugify(a.title) === slug && a.category_slug === category);
  
  if (!article) return { title: 'Not Found' };

  const title = `${article.title} — Research-Based Buying Guide`;
  const description = article.body_intro.replace(/<[^>]*>/g, '').substring(0, 160);
  const url = `https://newgiftsandgadgets.com/${category}/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: `/${category}/${slug}/` },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      images: [
        {
          url: '/social/gift-guides.png',
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ category: string, slug: string }> }) {
  const { category, slug } = await params;
  const article = guides.find((a) => slugify(a.title) === slug && a.category_slug === category);

  if (!article) {
    notFound();
  }

  const allProducts = productsData as Product[];

  // Deduplicate source ASINs to avoid repeated cards in guides.
  const uniqueAsins = Array.from(new Set(article.product_asins));

  const linkedProducts = uniqueAsins
    .map((asin: string) => allProducts.find((product) => product.id === `P-${asin}`))
    .filter(Boolean) as Product[];

  const linkedIds = new Set(linkedProducts.map((product) => product.id));

  // A guide renders the products it actually names. This used to pad every
  // short guide from the same category, which silently turned unrelated items
  // into picks — a vacuum suction lifter appeared as a recommendation in the
  // tracker comparison, and the page's copy never mentioned it. Backfilling now
  // applies only to a guide that names nothing at all, so such a page still has
  // something to show instead of an empty list.
  const categoryFallback = linkedProducts.length > 0 ? [] : allProducts
    .filter((product) => categoryToSlug(product.tags.category) === category)
    .slice(0, MIN_GUIDE_PRODUCTS);

  const products = [...linkedProducts, ...categoryFallback].slice(0, MAX_GUIDE_PRODUCTS);

  const guideUrl = `https://newgiftsandgadgets.com/${category}/${slug}`;
  const lastReviewed = products.map((product) => product.lastUpdated).filter(Boolean).sort().at(-1) || '2026-08-22';

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.body_intro.replace(/<[^>]*>/g, '').substring(0, 200),
    mainEntityOfPage: guideUrl,
    author: {
      '@type': 'Organization',
      name: 'NewGiftsAndGadgets Research Desk',
    },
    publisher: {
      '@type': 'Organization',
      name: 'New Gifts And Gadgets',
    },
    dateModified: lastReviewed,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: article.title,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://newgiftsandgadgets.com/product/${product.slug}`,
      name: product.title,
    })),
  };

  const relatedArticles = guides
    .filter((candidate) => candidate.category_slug === category && slugify(candidate.title) !== slug)
    .slice(0, 3);

  const breadcrumbs = [
    { label: category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), href: `/shop/${category}` },
    { label: article.title, href: `/${category}/${slug}` },
  ];

  const tocItems = products.map((p) => ({
    id: `product-${p.id}`,
    label: p.title
  }));

  return (
    <main className="min-h-screen pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />
        
        <header className="mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
            {category.replace(/-/g, ' ')} Guide
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
            {article.title}
          </h1>
          <p className="mb-8 text-sm font-semibold text-slate-500">
            Research-based guide by the NewGiftsAndGadgets Research Desk
            {article.publishedAt ? ` · Published ${article.publishedAt}` : ''} · Reviewed {lastReviewed}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-600 mb-2">Guide angle</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{getGuideAngle(category)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-600 mb-2">Picks in this guide</div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{products.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-600 mb-2">Next step</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Jump into the product cards below, then verify current retailer terms before you buy.</p>
            </div>
          </div>
          <div 
            className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: normalizeGuideHtml(article.body_intro) }}
          />
        </header>

        <section className="mb-12 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-600 mb-2">Before you buy</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">What this guide is really helping you do</h2>
            </div>
            <Link href={`/shop/${category}`} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View the full category
            </Link>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            This is a research-based shortlist assembled from published product information and catalog data; it is not a hands-on test. Compare the use case, main tradeoff, compatibility, current price, warranty, and recent owner feedback before choosing.
          </p>
        </section>

        <section className="mb-12 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm" aria-labelledby="compare-heading">
          <div className="p-6 md:p-8"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-600">Decision table</p><h2 id="compare-heading" className="mt-2 text-2xl font-black text-slate-900">Compare the shortlist</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600"><tr><th className="px-6 py-4">Product</th><th className="px-6 py-4">Best fit</th><th className="px-6 py-4">Catalog price</th><th className="px-6 py-4">Main tradeoff</th></tr></thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product) => {
                  return <tr key={product.id} className="align-top"><th className="px-6 py-5 font-bold text-slate-900"><Link href={`/product/${product.slug}/`} className="hover:text-blue-700">{product.title}</Link></th><td className="px-6 py-5 text-slate-600">{product.whoShouldBuy?.[0] || 'Compare against your use case'}</td><td className="px-6 py-5 font-bold text-slate-900">{formatPriceBracket(product.tags.priceBracket)}*</td><td className="px-6 py-5 text-slate-600">{product.cons?.[0] || 'Confirm retailer terms'}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
          <p className="px-6 py-4 text-xs leading-5 text-slate-500">*Catalog snapshot, not a live quote. Verify current price and availability with the retailer.</p>
        </section>

        <TableOfContents items={tocItems} />

        <div className="space-y-16">
          {products.map((product, index) => (
            <section key={product.id} id={`product-${product.id}`} className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-lg">
                  {index + 1}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {product.title}
                </h2>
              </div>
              <DealCard product={product} />
            </section>
          ))}
        </div>

        {relatedArticles.length > 0 && (
          <section className="mt-20 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-600 mb-2">Related guides</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">More pages in the same category</h2>
              </div>
              <Link href={`/shop/${category}`} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Shop this category
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((related) => (
                <Link
                  key={related.title}
                  href={`/${category}/${slugify(related.title)}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">More to read</div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-snug mb-2">{related.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{related.body_intro.replace(/<[^>]*>/g, '')}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-20">
          <NewsletterInline />
        </div>
      </div>
    </main>
  );
}
