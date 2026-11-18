import Link from '@/components/SiteLink';
import {
  ArrowRight,
  BriefcaseBusiness,
  ChefHat,
  Clock,
  Compass,
  Flame,
  House,
  PawPrint,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import { DealCard } from '@/components/DealCard';
import { CopyPromoCode } from '@/components/CopyPromoCode';
import { vendorsWithDeals } from '@/lib/data/blackFridayDeals';
import { NewsletterInline } from '@/components/NewsletterInline';
import { isActiveRetailerUrl, sortByRecency } from '@/lib/utils';
import AdSlot from '@/components/AdSlot';

export const metadata = {
  title: 'Gift Ideas & Useful Gadgets, Thoughtfully Curated',
  description:
    'Discover practical gifts, clever gadgets, and research-based buying guides for home, work, travel, pets, and everyday life.',
  alternates: { canonical: '/' },
};

const categoryDetails = [
  { name: 'Home Office', slug: 'home-office', icon: '⌨️', copy: 'Comfort, focus, and smarter desk setups.' },
  { name: 'Smart Home', slug: 'smart-home', icon: '💡', copy: 'Useful automation without the gimmicks.' },
  { name: 'Kitchen', slug: 'kitchen', icon: '🍳', copy: 'Tools that earn their counter space.' },
  { name: 'Travel Tech', slug: 'travel-tech', icon: '🧳', copy: 'Portable gear for smoother journeys.' },
  { name: 'Pet Tech', slug: 'pet-tech', icon: '🐾', copy: 'Clever upgrades for pets and their people.' },
  { name: 'Desk Toys & Novelty Gifts', slug: 'desk-toys-novelty-gifts', icon: '✨', copy: 'Delightful finds with genuine personality.' },
];

const giftPaths = [
  { title: 'Remote workers', copy: 'Comfort, focus, calls, and portable productivity.', href: '/gifts/remote-workers/', icon: BriefcaseBusiness, tone: 'bg-[#d7e5d2]' },
  { title: 'Home cooks', copy: 'Useful tools that earn their counter or drawer space.', href: '/gifts/home-cooks/', icon: ChefHat, tone: 'bg-[#f5df9d]' },
  { title: 'New homeowners', copy: 'Smart upgrades with compatibility kept in view.', href: '/gifts/new-homeowners/', icon: House, tone: 'bg-[#cddff0]' },
  { title: 'Pet parents', copy: 'Practical help for care, grooming, and checking in.', href: '/gifts/pet-parents/', icon: PawPrint, tone: 'bg-[#f5c7bb]' },
  { title: 'Travelers', copy: 'Portable power and gear for smoother journeys.', href: '/gifts/travelers/', icon: Plane, tone: 'bg-[#d9d1ec]' },
  { title: 'Coworkers', copy: 'Approachable desk gifts with personality and purpose.', href: '/gifts/coworkers/', icon: Users, tone: 'bg-[#eadbc9]' },
];

export default function Home() {
  const products = productsData as Product[];
  const purchasableProducts = products.filter((product) =>
    product.vendors.some((vendor) => vendor.isPrimary && isActiveRetailerUrl(vendor.url)),
  );

  // 1. Black Friday Deals for dedicated showcase: 4 distinct brands with active promos
  const bfFeaturedIds = [
    'P-AW-ANTHBOT-M9-PRO',
    'P-AW-BDB-BASICALLY-BRILLIANT',
    'P-AW-ROCKBROS-HANDLEBAR-BAG-2L',
    'P-AW-DG-ROLLING-GRILL-BASKET',
  ];
  const blackFridayDeals = bfFeaturedIds
    .map((id) => purchasableProducts.find((p) => p.id === id))
    .filter(Boolean) as Product[];
  const bfDealIds = new Set(blackFridayDeals.map((p) => p.id));

  // 2. Fresh New Arrivals: 4 newest products by recency, STRICTLY excluding any Black Friday deals above!
  const newArrivals = sortByRecency(
    purchasableProducts.filter((p) => !bfDealIds.has(p.id))
  ).slice(0, 4);
  const newArrivalIds = new Set(newArrivals.map((p) => p.id));

  // 3. Editor's Shortlist: 6 diverse, high-value standout staples with deep editorial, STRICTLY excluding new arrivals & BF deals
  const curatedStapleIds = [
    'P-AW-GRABO-PRO-20',
    'P-AW-TORNADO-LUMINA-CHRONOSPHERE',
    'P-AW-PERSONALHOUR-JANET-PLUS',
    'P-AW-SKILHUNT-MIX7-GEN2',
    'P-B0CT95KTQH',
    'P-AW-SHADOWAUTO',
  ];
  const staplePicks = curatedStapleIds
    .map((id) =>
      purchasableProducts.find(
        (p) => p.id === id && !newArrivalIds.has(p.id) && !bfDealIds.has(p.id)
      )
    )
    .filter(Boolean) as Product[];

  const remainingCandidates = purchasableProducts.filter(
    (p) =>
      !newArrivalIds.has(p.id) &&
      !bfDealIds.has(p.id) &&
      !curatedStapleIds.includes(p.id) &&
      Boolean(p.editorial && p.editorial.length > 0)
  );
  const featured = [...staplePicks, ...remainingCandidates].slice(0, 6);

  const retailerBacked = products
    .filter(
      (product) =>
        product.images[0] !== '/default-thumbnail.png' &&
        product.vendors.some((vendor) => vendor.isPrimary && isActiveRetailerUrl(vendor.url)),
    )
    .sort((a, b) => Math.min(...a.vendors.map((vendor) => vendor.price)) - Math.min(...b.vendors.map((vendor) => vendor.price)))
    .slice(0, 8);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Verified Partner Promo Codes & Black Friday Deals 2026',
    description:
      'Verified manufacturer promo codes, holiday discounts, and clearance offers across smart home, wellness, tools, and outdoor tech.',
    itemListElement: vendorsWithDeals.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Offer',
        name: `${v.name}: ${v.headline}`,
        description: v.offerDetails,
        url: `https://newgiftsandgadgets.com${v.shopHref}`,
        priceCurrency: 'USD',
        validThrough: v.validThrough || '2026-12-31',
        priceValidUntil: v.validThrough || '2026-12-31',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: v.name,
        },
        ...(v.promoCode
          ? {
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                priceCurrency: 'USD',
                description: `Manufacturer promo code ${v.promoCode} valid through ${v.validThrough || '2026-12-31'}`,
              },
            }
          : {}),
      },
    })),
  };

  return (
    <main id="main-content">
      {/* Inject Structured Data for 9 Verified Partner Offers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {/* Prominent Clickable Black Friday Banner — Top Middle */}
      <section className="site-container pt-4 sm:pt-6 pb-2">
        <Link
          href="/black-friday/"
          className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-stone-950 via-red-950 to-amber-950 p-4 sm:p-5 text-white shadow-xl border-2 border-red-500/50 hover:border-amber-400 transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/30"
          aria-label="View All Black Friday Deals"
        >
          {/* Subtle Ambient Lighting Effects */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-red-600/25 blur-3xl group-hover:bg-red-500/35 transition-all" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-amber-600/20 blur-3xl group-hover:bg-amber-500/30 transition-all" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 px-4 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-md ring-1 ring-white/20 animate-pulse shrink-0">
                <Flame className="h-4 w-4 text-amber-200" />
                Black Friday Deals
              </span>
              <div>
                <p className="text-sm sm:text-base font-black text-white">
                  Exclusive Manufacturer Discounts &amp; Partner Coupon Codes Are Live
                </p>
                <p className="text-xs text-amber-200/90 font-medium hidden sm:block mt-0.5">
                  Save up to 50%–70% across Anthbot, Billion Dollar Beauty, ROCKBROS, DealGenius, Plunge Chill &amp; more
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 text-xs sm:text-sm font-black text-amber-300 group-hover:text-white transition-all whitespace-nowrap shrink-0">
              <span>View All Vendor Deals</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </section>

      <section className="hero-shell">
        <div className="site-container grid gap-12 py-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-20">
          <div>
            <div className="eyebrow"><Sparkles className="h-4 w-4" /> Fresh finds, practical picks</div>
            <h1 className="display-title mt-6 max-w-4xl">Find the gift they’ll actually use.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">A research-led portal for useful gadgets, memorable gifts, and honest trade-offs—organized by person, purpose, and price.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/black-friday/" className="button-primary bg-gradient-to-r from-red-700 to-stone-900 border border-red-500/40 text-white hover:from-red-600 hover:to-stone-800">
                <Flame className="h-4 w-4 text-amber-300 animate-pulse" /> Black Friday Deals
              </Link>
              <Link href="/shop/all/" className="button-secondary">Explore all picks <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/shop/new-arrivals/" className="button-secondary"><Sparkles className="h-4 w-4 text-amber-600" /> New arrivals</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Clear affiliate disclosure</span>
              <span className="inline-flex items-center gap-2"><Compass className="h-4 w-4 text-indigo-600" /> Research-based curation</span>
              <span className="inline-flex items-center gap-2"><Search className="h-4 w-4 text-orange-500" /> Pros, cons, and best fit</span>
            </div>
          </div>
          <div className="hero-card-grid" aria-label="Featured gift categories">
            {categoryDetails.slice(0, 4).map((category, index) => (
              <Link key={category.slug} href={`/shop/${category.slug}/`} className={`hero-category-card hero-category-${index + 1}`}>
                <span className="text-4xl" aria-hidden="true">{category.icon}</span><span className="mt-8 block text-sm font-bold uppercase tracking-[.18em] text-slate-700">Explore</span><span className="mt-1 block text-xl font-black text-slate-950">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Black Friday Deals & Verified Partner Coupons Showcase */}
      <section className="site-container py-12" aria-labelledby="black-friday-heading">
        <div className="rounded-[2.5rem] border-2 border-red-300/80 bg-gradient-to-br from-red-50/70 via-[#fcfaf5] to-amber-50/60 p-6 md:p-10 shadow-sm">
          <div className="section-heading-row mb-8">
            <div>
              <p className="eyebrow inline-flex items-center gap-1.5 text-red-950 bg-red-100/90 px-3 py-1 rounded-full border border-red-200">
                <Flame className="h-3.5 w-3.5 text-red-600 animate-pulse" /> Active Holiday Codes &amp; Verified Badges
              </p>
              <h2 id="black-friday-heading" className="section-title mt-3">
                Black Friday Deals &amp; Verified Partner Coupons
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Verified manufacturer coupon codes, badges, and clearance discounts live for Cyber Season 2026.
              </p>
            </div>
            <Link
              href="/black-friday/"
              className="text-link font-black text-red-900 hover:text-red-700"
            >
              See all 9 partner deals &amp; FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 9 Partner Coupon Cards Grid with Verified Badges & Expiration Dates */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {vendorsWithDeals.map((vendor) => (
              <div
                key={vendor.name}
                className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-0.5">
                        {vendor.category}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-red-700 transition-colors">
                        {vendor.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shrink-0 shadow-xs ${vendor.badgeColor}`}
                    >
                      {vendor.badge}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 mb-1.5 line-clamp-1">
                    {vendor.headline}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600 mb-3 line-clamp-2">
                    {vendor.offerDetails}
                  </p>

                  {vendor.promoCode ? (
                    <div className="mb-3">
                      <CopyPromoCode
                        code={vendor.promoCode}
                        discountText={vendor.discountText}
                        verifiedText={vendor.verifiedDate}
                        expiresText={vendor.expiresLabel}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        {vendor.verifiedDate || 'Verified Active · Nov 2026'}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 border border-stone-200">
                        <Clock className="h-3 w-3 text-stone-500" />
                        {vendor.expiresLabel || vendor.saleWindow}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 mb-3">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Sale Window: {vendor.saleWindow}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <Link
                    href={vendor.shopHref}
                    className="inline-flex items-center gap-1 text-xs font-black text-indigo-700 hover:text-indigo-900 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Shop {vendor.name}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <span className="text-[10px] font-bold text-slate-400">
                    Direct Verified Partner
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Featured Product Deals Highlights */}
          {blackFridayDeals.length > 0 && (
            <div className="pt-6 border-t border-red-200/70">
              <h3 className="text-sm font-black uppercase tracking-wider text-red-950 mb-4 inline-flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-red-600" /> Featured Hand-Picked Deal Highlights
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {blackFridayDeals.map((product, idx) => (
                  <DealCard key={product.id} product={product} priority={idx === 0} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Fresh New Arrivals Showcase */}
      <section className="site-container py-12" aria-labelledby="new-arrivals-heading">
        <div className="rounded-[2.5rem] border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-[#fcfaf4] to-orange-50/40 p-6 md:p-10 shadow-xs">
          <div className="section-heading-row mb-8">
            <div>
              <p className="eyebrow inline-flex items-center gap-1.5 text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Fresh Discoveries
              </p>
              <h2 id="new-arrivals-heading" className="section-title mt-3">New arrivals worth watching</h2>
            </div>
            <Link href="/shop/new-arrivals/" className="text-link font-black text-amber-900 hover:text-amber-700">
              Browse all new arrivals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <DealCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16" aria-labelledby="person-heading">
        <div className="section-heading-row"><div><p className="eyebrow">Start with the person</p><h2 id="person-heading" className="section-title">Who are you shopping for?</h2></div><p className="section-intro">A useful gift begins with their routines, constraints, and interests—not a generic bestseller badge.</p></div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {giftPaths.map(({ icon: Icon, ...path }) => (
            <Link key={path.href} href={path.href} className={`group rounded-[1.75rem] p-6 transition-transform hover:-translate-y-1 ${path.tone}`}>
              <Icon className="h-7 w-7 text-[#18231d]" />
              <h3 className="mt-8 text-2xl font-black text-[#18231d]">{path.title}</h3>
              <p className="mt-2 leading-7 text-slate-700">{path.copy}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#18231d]">See the shortlist <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="site-container pb-16" aria-labelledby="category-heading">
        <div className="section-heading-row"><div><p className="eyebrow">Or start with their interests</p><h2 id="category-heading" className="section-title">Shop ideas, not endless aisles</h2></div><p className="section-intro">Focused collections make it easier to get from “I need a gift” to a shortlist worth comparing.</p></div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryDetails.map((category) => <Link key={category.slug} href={`/shop/${category.slug}/`} className="category-tile group"><span className="category-icon" aria-hidden="true">{category.icon}</span><span><strong className="block text-lg text-slate-950">{category.name}</strong><span className="mt-1 block text-sm text-slate-600">{category.copy}</span></span><ArrowRight className="ml-auto h-5 w-5 text-slate-600 transition-transform group-hover:translate-x-1" /></Link>)}
        </div>
      </section>

      <section className="site-container pb-16">
        <AdSlot className="rounded-[2rem] border border-stone-200 bg-white px-4 py-5" />
      </section>

      {/* Editor's Shortlist — Distinct Standout Gadgets */}
      <section className="site-container pb-16" aria-labelledby="featured-heading">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Editor’s shortlist</p>
            <h2 id="featured-heading" className="section-title">Standout gadgets right now</h2>
          </div>
          <Link href="/shop/all/" className="text-link">View the complete catalog <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => <DealCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* Featured Partner Brands Hub */}
      <section className="site-container pb-16" aria-labelledby="brands-heading">
        <div className="rounded-[2.5rem] border border-stone-200/90 bg-white p-8 md:p-12 shadow-xs">
          <div className="section-heading-row mb-8">
            <div>
              <p className="eyebrow inline-flex items-center gap-1.5 text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Curated Partner Brands
              </p>
              <h2 id="brands-heading" className="section-title mt-3">Shop directly from trusted manufacturers</h2>
            </div>
            <Link href="/brands/" className="text-link font-black text-indigo-700 hover:text-indigo-900">
              Browse all 30 brands <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { name: 'PersonalHour', tag: 'Home Pilates', href: '/shop/all?brand=PersonalHour' },
              { name: 'Tornado', tag: "Men's Watches", href: '/shop/all?brand=Tornado' },
              { name: 'Plunge Chill', tag: 'Cold Therapy', href: '/cold-plunge/' },
              { name: 'Billion Dollar Beauty', tag: 'Cosmetics & Tools', href: '/shop/all?brand=Billion%20Dollar%20Beauty' },
              { name: 'Vari', tag: 'Standing Desks', href: '/shop/all?brand=Vari' },
              { name: 'Ergotron', tag: 'Monitor Arms', href: '/shop/all?brand=Ergotron' },
              { name: 'GRABO', tag: 'Power Tools', href: '/shop/all?brand=GRABO' },
              { name: 'SKILHUNT', tag: 'Tactical Lights', href: '/shop/all?brand=SKILHUNT' },
              { name: 'Herman Miller', tag: 'Ergonomic Seating', href: '/shop/all?brand=Herman%20Miller' },
              { name: 'ShadowGPS', tag: 'Trackers', href: '/shop/all?brand=ShadowGPS' },
              { name: 'DealGenius', tag: 'Home Gadgets', href: '/shop/all?brand=DealGenius' },
              { name: 'Traverseon', tag: 'Travel & Outdoor', href: '/shop/all?brand=Traverseon' },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow-md transition-all text-center"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">{brand.tag}</span>
                  <strong className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors block">{brand.name}</strong>
                </div>
                <span className="mt-3 text-[11px] font-black text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center justify-center gap-1">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container pb-16" aria-labelledby="budget-heading">
        <div className="rounded-[2.5rem] bg-[#18231d] px-6 py-10 text-white md:px-10 md:py-14"><div className="section-heading-row"><div><p className="eyebrow eyebrow-dark">Ready to compare</p><h2 id="budget-heading" className="section-title text-white!">Available from active retailers</h2></div><Link href="/shop/all/" className="text-link text-amber-300!">Browse all researched picks <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{retailerBacked.map((product) => <DealCard key={product.id} product={product} />)}</div></div>
      </section>
      <section className="site-container pb-20"><NewsletterInline /></section>
    </main>
  );
}
