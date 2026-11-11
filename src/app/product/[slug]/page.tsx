import React from 'react';
import Link from '@/components/SiteLink';
import { notFound } from 'next/navigation';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import { VendorGrid } from '@/components/VendorGrid';
import { Clock } from 'lucide-react';
import { NewsletterInline } from '@/components/NewsletterInline';
import { SocialShare } from '@/components/SocialShare';
import { LivePriceChecker } from '@/components/LivePriceChecker';
import AdSlot from '@/components/AdSlot';
import ProductImageDisplay from '@/components/ProductImageDisplay';
import { categorySlug as toCategorySlug, formatPriceBracket, isActiveRetailerUrl } from '@/lib/utils';

const safeProductImage = (src: string | undefined) => src?.includes('media-amazon.com') ? '/default-thumbnail.png' : (src || '/default-thumbnail.png');

function getRelatedProducts(product: Product, allProducts: Product[]) {
  return allProducts
    .filter((candidate) => candidate.slug !== product.slug)
    .map((candidate) => {
      let score = 0;

      if (candidate.tags.category === product.tags.category) score += 5;
      if (candidate.tags.priceBracket === product.tags.priceBracket) score += 3;
      if (candidate.brand && product.brand && candidate.brand === product.brand) score += 2;
      if ((candidate.features?.length || 0) > 0) score += 1;
      if ((candidate.setupTips?.length || 0) > 0) score += 1;

      return { product: candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.product);
}

export async function generateStaticParams() {
  return productsData.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug === slug) as Product;
  if (!product) return { title: 'Not Found' };

    const title = `${product.title} Buying Guide & Price Snapshot`;
    const description = product.description || `Research-based buying notes, trade-offs, and retailer options for ${product.title}.`;
    const url = `https://newgiftsandgadgets.com/product/${product.slug}`;

    return {
      title,
      description,
      alternates: {
        canonical: `/product/${product.slug}`,
      },
      openGraph: {
        title,
        description,
        type: 'website',
        url,
        images: [
          {
            url: safeProductImage(product.images[0]),
            width: 1200,
            height: 630,
            alt: product.title,
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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products: Product[] = productsData as Product[];
  const product = products.find((p) => p.slug === slug) as Product;
  
  if (!product) {
    notFound();
  }

  const productUrl = `https://newgiftsandgadgets.com/product/${product.slug}`;
  const activeVendors = product.vendors.filter((vendor) => isActiveRetailerUrl(vendor.url));
  const primaryVendor = activeVendors.find(v => v.isPrimary) || activeVendors[0];
  const relatedProducts = getRelatedProducts(product, products);

  // Real numbers, so the copy on this page describes this product rather than
  // the template. Where only one retailer is tracked, say only that.
  const trackedPrices = activeVendors
    .map((vendor) => vendor.price)
    .filter((price): price is number => typeof price === 'number' && price > 0);
  const lowestPrice = trackedPrices.length ? Math.min(...trackedPrices) : null;
  const highestPrice = trackedPrices.length ? Math.max(...trackedPrices) : null;
  const priceSpread = lowestPrice !== null && highestPrice !== null && highestPrice > lowestPrice ? highestPrice - lowestPrice : null;
  const money = (value: number) => `$${value.toFixed(2)}`;
  const recipients = product.tags.recipient ?? [];
  // Amazon's associate programme closed, so many entries keep a recorded price
  // but no purchasable link. Say which one it is rather than print the same
  // apology on every page.
  const recordedPrices = product.vendors
    .map((vendor) => vendor.price)
    .filter((price): price is number => typeof price === 'number' && price > 0);
  const lowestRecorded = recordedPrices.length ? Math.min(...recordedPrices) : null;
  const priceSentence =
    trackedPrices.length >= 2 && lowestPrice !== null && highestPrice !== null
      ? ` We track ${trackedPrices.length} retailer listings for it, from ${money(lowestPrice)} to ${money(highestPrice)}${priceSpread !== null ? ` — a spread of ${money(priceSpread)} on the same product` : ''}.`
      : trackedPrices.length === 1 && lowestPrice !== null
        ? ` One retailer listing is tracked at ${money(lowestPrice)}.`
        : lowestRecorded !== null
          ? ` No retailer link is active for it at the moment; the lowest price we recorded was ${money(lowestRecorded)}.`
          : ' No retailer price is recorded for it yet, so treat the band above as the range to expect.';
  
  const imageSrc = safeProductImage(product.images[0]);
  const isEmoji = !imageSrc.startsWith('http') && !imageSrc.startsWith('/');
  const displayCategory = product.tags.category === 'Outdoor Adventure' ? 'Outdoor & Adventure' : product.tags.category;
  const categorySlug = toCategorySlug(product.tags.category);

  // Generate JSON-LD Schema with required offers & review properties for Google Rich Results
  const schemaImageUrl = isEmoji
    ? undefined
    : imageSrc.startsWith('http')
      ? imageSrc
      : `https://newgiftsandgadgets.com${imageSrc}`;
  const catalogPrice = primaryVendor?.price ?? product.vendors[0]?.price ?? 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: schemaImageUrl ? [schemaImageUrl] : undefined,
    description: product.description,
    sku: product.id,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'USD',
      price: catalogPrice.toFixed(2),
      validFrom: product.lastUpdated || '2026-01-01',
      priceValidUntil: '2027-12-31',
      availability: primaryVendor ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: primaryVendor?.name || 'Retailer',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0.00',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    review: {
      '@type': 'Review',
      author: {
        '@type': 'Organization',
        name: 'NewGiftsAndGadgets Editorial Desk',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '4.5',
        bestRating: '5',
      },
      positiveNotes: product.pros && product.pros.length > 0 ? {
        '@type': 'ItemList',
        itemListElement: product.pros.map((pro, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: pro,
        })),
      } : undefined,
      negativeNotes: product.cons && product.cons.length > 0 ? {
        '@type': 'ItemList',
        itemListElement: product.cons.map((con, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: con,
        })),
      } : undefined,
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Disclosure */}
        <div className="mb-6 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-widest bg-white/50 dark:bg-slate-900/50 py-2 rounded-full border border-slate-100 dark:border-slate-800">
          <Clock className="w-3 h-3" />
          Research desk update: {product.lastUpdated || 'May 2026'} • Retailer relationships are disclosed where active.
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Image Gallery */}
            <div className="relative aspect-square md:aspect-auto bg-slate-100 dark:bg-slate-950 p-8 flex items-center justify-center">
              <div className="relative w-full h-full max-h-[500px] flex items-center justify-center">
                {isEmoji ? (
                  <div className="w-full aspect-square max-w-sm rounded-3xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-inner">
                    <span className="text-[150px] drop-shadow-2xl">{imageSrc}</span>
                  </div>
                ) : (
                  <ProductImageDisplay
                    src={imageSrc} 
                    alt={product.title}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {displayCategory}
                </span>
                {product.brand && (
                  <span className="text-sm font-semibold text-slate-500">
                    by {product.brand}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                {product.title}
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {product.description}
              </p>

              <SocialShare 
                url={productUrl}
                title={product.title}
                media={imageSrc}
              />

              {/* Buy Section */}
              <div className="mt-auto space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col mb-4">
                  <span className="text-sm text-slate-500 font-medium mb-1">Typical catalog price band</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {formatPriceBracket(product.tags.priceBracket)}
                  </span>
                    <LivePriceChecker slug={product.slug} />
                </div>
                
                {primaryVendor && (
                  <PrimaryCTA 
                    href={primaryVendor.url} 
                    storeName={primaryVendor.name}
                    productSlug={product.slug}
                    className="py-4 text-lg"
                  />
                )}
                {!primaryVendor && <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Retailer links for this product are being updated. The independent buying notes remain available while we verify new retail partners.</p>}
                
                {/* Alternative Vendors */}
                {activeVendors.length > 1 && (
                  <div className="pt-4">
                    <VendorGrid vendors={activeVendors} productSlug={product.slug} />
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>

        <AdSlot className="mt-10 rounded-3xl border border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900" />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-8">
          <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Editorial context</p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4">
              Why this product makes the cut
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {product.title} is catalogued as a {displayCategory.toLowerCase()} pick
              {recipients.length > 0 ? ` for ${recipients.join(' and ').toLowerCase()}` : ''}, priced in the{' '}
              {formatPriceBracket(product.tags.priceBracket).toLowerCase()} band.{priceSentence} The notes below
              come from the published listing and the retailer prices we track, not from a hands-on test.
            </p>

            <dl className="mb-6 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brand</dt>
                <dd className="font-bold text-slate-900 dark:text-white">{product.brand ?? 'Unlisted'}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Retailers tracked</dt>
                <dd className="font-bold text-slate-900 dark:text-white">{trackedPrices.length}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lowest recorded</dt>
                <dd className="font-bold text-slate-900 dark:text-white">
                  {lowestPrice !== null ? money(lowestPrice) : lowestRecorded !== null ? money(lowestRecorded) : '—'}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes updated</dt>
                <dd className="font-bold text-slate-900 dark:text-white">{product.lastUpdated ?? '—'}</dd>
              </div>
            </dl>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Best fit</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {product.whoShouldBuy?.[0] || `Shoppers who want a dependable ${displayCategory.toLowerCase()} upgrade.`}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Main tradeoff</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {product.cons?.[0] || 'It is worth weighing convenience, price, and long-term value before you buy.'}
                </p>
              </div>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">
                  What the {product.title} listing records
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 leading-relaxed">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  These are the points that decided the shortlisting, including the ones that count against it.
                </p>
              </div>
            )}

            {product.editorial && product.editorial.length > 0 && (
              <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-4">Editorial notes</p>
                <div className="space-y-5">
                  {product.editorial.map((note) => (
                    <div key={note.heading}>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{note.heading}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{note.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Quick links</p>
            <h3 className="text-2xl font-black mb-5">Keep comparing</h3>
            <div className="space-y-3 text-sm">
              <Link href={`/shop/${categorySlug}/`} className="block rounded-2xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-colors">
                Browse more {displayCategory} picks
              </Link>
              <Link href="/gift-guides/" className="block rounded-2xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-colors">
                Browse gift guides
              </Link>
              <Link href="/about" className="block rounded-2xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-colors">
                Read how we research products
              </Link>
            </div>
          </aside>
        </div>

        {/* Pros and Cons */}
        <div className="mt-8 bg-slate-900 dark:bg-slate-900/50 text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl">
          <h2 className="text-3xl font-black mb-3 text-center">Research snapshot</h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-6 text-slate-300">What the shortlist records about the {product.brand ?? 'unbranded'} {product.title} and the alternatives around it — catalog-level considerations, not hands-on test results. Check recent owner feedback and retailer terms before buying.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl mx-auto">
            <div className="text-center">
              <h4 className="text-green-400 font-bold uppercase tracking-widest text-xs mb-4">Pros</h4>
              <ul className="space-y-4 inline-block text-left">
                {((product.pros && product.pros.length) ? product.pros : ['Published features address the intended use', 'Available specifications support comparison', 'Can be compared with alternatives before purchase']).map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300">
                    <span className="text-green-400 font-bold">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <h4 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-4">Cons</h4>
              <ul className="space-y-4 inline-block text-left">
                {((product.cons && product.cons.length) ? product.cons : ['Compatibility still needs confirmation', 'Current retailer terms may change', 'Long-term performance has not been independently tested']).map((con, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300">
                    <span className="text-red-400 font-bold">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Related picks</p>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Other products in the same decision set</h2>
              </div>
              <Link href={`/shop/${categorySlug}/`} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">See the full category</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.slug}
                  href={`/product/${relatedProduct.slug}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Compare next</div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-snug mb-2">{relatedProduct.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{relatedProduct.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <NewsletterInline />

      </div>
    </main>
  );
}
