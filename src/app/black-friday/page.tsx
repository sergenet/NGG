import React from 'react';
import Link from '@/components/SiteLink';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import { DealCard } from '@/components/DealCard';
import { CopyPromoCode } from '@/components/CopyPromoCode';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Percent,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { isActiveRetailerUrl } from '@/lib/utils';

export const metadata = {
  title: 'Black Friday Deals 2026: Verified Partner Coupons & Discounts',
  description:
    'Browse all verified Black Friday deals, manufacturer promo codes, and holiday discounts across Anthbot, Billion Dollar Beauty, ROCKBROS, DealGenius, and more.',
  alternates: {
    canonical: '/black-friday/',
  },
};

interface VendorDeal {
  name: string;
  category: string;
  headline: string;
  offerDetails: string;
  promoCode?: string;
  discountText?: string;
  verifiedDate?: string;
  validThrough?: string;
  expiresLabel?: string;
  saleWindow: string;
  badge: string;
  badgeColor: string;
  shopHref: string;
  featuredProductId: string;
}

const vendorsWithDeals: VendorDeal[] = [
  {
    name: 'Anthbot',
    category: 'Robotic Lawn Mowers & Yard Tech',
    headline: 'Up to $250 Off + Extra 10% With Code',
    offerDetails:
      'Save $250 direct on boundary-free LiDAR & RTK mowers (M5 at $549). Stack coupon code ABAFF10 for an additional 10% off (M9 PRO down to $1,139.05). Plus, $1 protective garage flash sale.',
    promoCode: 'ABAFF10',
    discountText: 'Extra 10% Off',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-07',
    expiresLabel: 'Expires Dec 07, 2026',
    saleWindow: 'Nov 12 – Dec 7, 2026',
    badge: 'Save $250 + 10% Extra',
    badgeColor: 'bg-red-600 text-white',
    shopHref: '/shop/all?brand=Anthbot',
    featuredProductId: 'P-AW-ANTHBOT-M9-PRO',
  },
  {
    name: 'Billion Dollar Beauty',
    category: 'Magnetic Makeup Systems & Beauty',
    headline: 'Up to 50% Off Sitewide & Bundles',
    offerDetails:
      'Take 50% off holiday bundle sets and save sitewide with coupon code BLACKFRIDAY. Customizable magnetic palette boxes, vegan travel brushes, and universal eyebrow kits.',
    promoCode: 'BLACKFRIDAY',
    discountText: '50% Off Bundles',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-05',
    expiresLabel: 'Expires Dec 05, 2026',
    saleWindow: 'Black Friday & Cyber Week 2026',
    badge: 'Up to 50% Off Sitewide',
    badgeColor: 'bg-pink-600 text-white',
    shopHref: '/shop/all?brand=Billion%20Dollar%20Beauty',
    featuredProductId: 'P-AW-BDB-BASICALLY-BRILLIANT',
  },
  {
    name: 'ROCKBROS',
    category: 'Cycling Gear & Outdoor Tech',
    headline: '10% Off Sitewide Coupon',
    offerDetails:
      'Save 10% on aerodynamic bike handlebar bags, top tube phone packs, and smart brake-sensing tail lights with coupon code WELCOME10 (or 5% with WELCOME5 / MINTY5).',
    promoCode: 'WELCOME10',
    discountText: '10% Off Sitewide',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-01',
    expiresLabel: 'Expires Dec 01, 2026',
    saleWindow: 'Through Dec 1, 2026',
    badge: '10% Off Sitewide',
    badgeColor: 'bg-emerald-600 text-white',
    shopHref: '/shop/all?brand=ROCKBROS',
    featuredProductId: 'P-AW-ROCKBROS-HANDLEBAR-BAG-2L',
  },
  {
    name: 'DealGenius',
    category: 'Home Gadgets & Everyday Tools',
    headline: 'Direct Clearance Up to 70% Off',
    offerDetails:
      'Massive clearance markdowns on kitchen electrics, rolling BBQ grill baskets, 4.2-gal portable mini washers, digital food scales, and 750 LED holiday lights.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Holiday Season 2026',
    saleWindow: 'Holiday Season 2026',
    badge: 'Up to 70% Off Clearance',
    badgeColor: 'bg-amber-600 text-white',
    shopHref: '/shop/all?brand=DealGenius',
    featuredProductId: 'P-AW-DG-ROLLING-GRILL-BASKET',
  },
  {
    name: 'Plunge Chill',
    category: 'Cold Plunge & Athletic Recovery',
    headline: 'Factory-Direct Cold Therapy Systems',
    offerDetails:
      'Commercial 1HP & 0.6HP indoor/outdoor water chillers paired with 120-gallon insulated immersion tubs. Real 36°F cold exposure without ice bag runs.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Holiday Season 2026',
    saleWindow: 'Holiday Special 2026',
    badge: 'Factory Direct Pricing',
    badgeColor: 'bg-cyan-600 text-white',
    shopHref: '/cold-plunge/',
    featuredProductId: 'P-AW-PLUNGE-CHILL-POD',
  },
  {
    name: 'PersonalHour',
    category: 'Home Studio Fitness & Pilates',
    headline: 'Studio-Quality Foldable Pilates Reformers',
    offerDetails:
      'Factory direct pricing on foldable wooden and aluminum home Pilates reformers (Janet Elite Plus, Nour Advanced, Nano Elite) with free sitting box and jumpboard packages.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Holiday Season 2026',
    saleWindow: 'Holiday Season 2026',
    badge: 'Direct Studio Pricing',
    badgeColor: 'bg-indigo-600 text-white',
    shopHref: '/shop/all?brand=PersonalHour',
    featuredProductId: 'P-AW-PERSONALHOUR-JANET-PLUS',
  },
  {
    name: 'Tornado',
    category: "Men's Luxury Chronographs & Automatic Watches",
    headline: 'Pilot & Diver Timepieces Under $300',
    offerDetails:
      'Skeleton automatic mechanical watches and high-precision chronograph watches with scratch-proof sapphire crystal and 100m water resistance at direct partner rates.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Holiday Season 2026',
    saleWindow: 'Holiday Season 2026',
    badge: 'Under $300 Luxury Spec',
    badgeColor: 'bg-slate-800 text-white',
    shopHref: '/shop/all?brand=Tornado',
    featuredProductId: 'P-AW-TORNADO-LUMINA-CHRONOSPHERE',
  },
  {
    name: 'GRABO',
    category: 'Heavy-Duty Power Tools & Lifters',
    headline: 'Smart Electric Vacuum Suction Lifters',
    offerDetails:
      'Heavy-duty electric suction cups for large tiles, glass panels, stone countertops, and drywall. Digital pressure sensors and 375+ lb load capacities at factory rates.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Black Friday 2026',
    saleWindow: 'Black Friday 2026',
    badge: 'Pro Contractor Direct',
    badgeColor: 'bg-orange-600 text-white',
    shopHref: '/shop/all?brand=GRABO',
    featuredProductId: 'P-AW-GRABO-PRO-20',
  },
  {
    name: 'SKILHUNT',
    category: 'Everyday Carry & Tactical Lighting',
    headline: 'Multi-Spectrum RGB & UV LED Flashlights',
    offerDetails:
      'Direct manufacturer discounts on MiX-7 Gen 2 (White, Red, Green, Blue, UV 365nm) and H04 RC magnetic rechargeable EDC lights and headlamps.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Black Friday 2026',
    saleWindow: 'Black Friday 2026',
    badge: 'Tactical EDC Deals',
    badgeColor: 'bg-emerald-700 text-white',
    shopHref: '/shop/all?brand=SKILHUNT',
    featuredProductId: 'P-AW-SKILHUNT-MIX7-GEN2',
  },
];

export default function BlackFridayPage() {
  const products = productsData as Product[];
  const purchasableProducts = products.filter((p) =>
    p.vendors.some((v) => v.isPrimary && isActiveRetailerUrl(v.url))
  );

  // Exactly one distinct featured product per vendor to guarantee zero brand or item repetition
  const brandDealItems: Product[] = vendorsWithDeals
    .map((vendor) => purchasableProducts.find((p) => p.id === vendor.featuredProductId))
    .filter(Boolean) as Product[];

  const faqItems = [
    {
      q: 'When do Black Friday 2026 tech and gadget deals start and end?',
      a: 'Many partner sales begin in mid-November (such as Anthbot starting Nov 12 through Dec 7, 2026) and run continuously through Cyber Week into early December.',
    },
    {
      q: 'How do I use publisher promo codes like ABAFF10 or BLACKFRIDAY?',
      a: "Click our one-click 'Copy Code' button on any partner card, click through to the official brand store, and paste the coupon in the checkout discount field for instant extra savings.",
    },
    {
      q: 'Are these Black Friday gadget discounts authentic?',
      a: 'Yes. All deals link directly to official brand stores and authorized manufacturers through certified partner networks (like Awin), ensuring full brand warranties, verified support, and authentic stock.',
    },
    {
      q: 'Can coupon codes be stacked with existing markdowns?',
      a: 'Yes! Major featured deals—such as Anthbot robot lawn mowers and Billion Dollar Beauty palettes—allow you to stack our exclusive codes on top of existing Black Friday site markdowns.',
    },
  ];

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Black Friday & Cyber Week 2026 Verified Tech & Gadget Deals',
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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#fbfaf6] pb-24">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Hero Header */}
      <section className="border-b border-stone-200/90 bg-gradient-to-b from-stone-950 via-slate-950 to-slate-900 py-16 text-white md:py-20">
        <div className="site-container text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-gradient-to-r from-red-600/30 to-amber-600/30 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300 shadow-md">
            <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
            Black Friday &amp; Cyber Week 2026
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl text-white">
            Vendors With Black Friday Deals
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
            Every active Black Friday promotion, manufacturer clearance discount, and verified publisher promo code from our trusted brand partners—gathered in one transparent hub.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-bold text-slate-300">
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Verified Coupon Codes
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <Percent className="h-4 w-4 text-amber-400" />
              Up to 50%–70% Off Retail
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              Direct Manufacturer Guarantees
            </span>
          </div>
        </div>
      </section>

      {/* Vendor Directory Section */}
      <section className="site-container py-14" aria-labelledby="vendors-heading">
        <div className="mb-8">
          <p className="eyebrow inline-flex items-center gap-1.5 text-red-900 bg-red-100/90 px-3 py-1 rounded-full border border-red-200">
            <Tag className="h-3.5 w-3.5 text-red-600" /> Partner Roster
          </p>
          <h2 id="vendors-heading" className="section-title mt-2">
            Participating Brands &amp; Offers
          </h2>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Click through to view full product reviews and copy exclusive coupon codes before heading to the official merchant checkout.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vendorsWithDeals.map((vendor) => (
            <div
              key={vendor.name}
              className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:border-amber-400 hover:shadow-xl transition-all duration-300 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-0.5">
                      {vendor.category}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                      {vendor.name}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide shrink-0 ${vendor.badgeColor}`}
                  >
                    {vendor.badge}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-800 mb-2">
                  {vendor.headline}
                </p>
                <p className="text-xs leading-relaxed text-slate-600 mb-3">
                  {vendor.offerDetails}
                </p>

                {vendor.promoCode ? (
                  <div className="mb-4">
                    <CopyPromoCode
                      code={vendor.promoCode}
                      discountText={vendor.discountText}
                      verifiedText={vendor.verifiedDate}
                      expiresText={vendor.expiresLabel}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      {vendor.verifiedDate || 'Verified Active · Nov 2026'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600 border border-stone-200">
                      <Clock className="h-3 w-3 text-stone-500" />
                      {vendor.expiresLabel || vendor.saleWindow}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Sale Window: {vendor.saleWindow}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <Link
                  href={vendor.shopHref}
                  className="inline-flex items-center gap-1 text-xs font-black text-indigo-700 hover:text-indigo-900 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Browse All {vendor.name} Deals</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-[11px] font-bold text-slate-400">
                  Direct Verified Partner
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Deals Showcase — Distinct Brand Picks */}
      <section className="site-container py-10" aria-labelledby="deals-grid-heading">
        <div className="rounded-[2.5rem] border border-amber-300/80 bg-gradient-to-br from-amber-50/80 via-[#fcfaf5] to-orange-50/50 p-6 md:p-10 shadow-xs">
          <div className="section-heading-row mb-8">
            <div>
              <p className="eyebrow inline-flex items-center gap-1.5 text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-200">
                <Flame className="h-3.5 w-3.5 text-amber-600" /> 1 Hand-Picked Deal Per Partner
              </p>
              <h2 id="deals-grid-heading" className="section-title mt-3">
                Featured Black Friday Products &amp; Promos
              </h2>
              <p className="text-slate-600 max-w-2xl mt-2 text-sm">
                A diverse selection of top-performing gadgets across each partner brand with verified coupon codes and active retailer discounts.
              </p>
            </div>
            <Link
              href="/shop/all/"
              className="text-link font-black text-amber-900 hover:text-amber-700"
            >
              Browse entire 250-item catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brandDealItems.map((product) => (
              <DealCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Black Friday Buying Advice & Transparency */}
      <section className="site-container py-12">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 md:p-10">
          <h2 className="text-xl font-black text-slate-900 mb-4">
            How We Track &amp; Verify Black Friday Offers
          </h2>
          <div className="grid gap-6 md:grid-cols-3 text-sm text-slate-600 leading-relaxed">
            <div>
              <h3 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600" /> Manufacturer Direct
              </h3>
              <p>
                We partner directly with official brand stores on networks like Awin. You get authentic manufacturer warranties, direct customer support, and no third-party markups.
              </p>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-emerald-600" /> Code Stacking &amp; Exclusions
              </h3>
              <p>
                Codes like <code>ABAFF10</code> (Anthbot), <code>BLACKFRIDAY</code> (Billion Dollar Beauty), and <code>WELCOME10</code> (ROCKBROS) apply at checkout. Ensure no trailing spaces are copied.
              </p>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-600" /> Holiday Return Windows
              </h3>
              <p>
                Most featured brands extend holiday return windows through January 2027. Review specific merchant return terms on their official checkout page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="site-container pb-12" aria-labelledby="faq-heading">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 md:p-10">
          <h2 id="faq-heading" className="text-xl font-black text-slate-900 mb-6">
            Frequently Asked Questions About Our Holiday &amp; Black Friday Deals
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {faqItems.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5">
                <h3 className="font-extrabold text-slate-900 text-sm mb-2">
                  {item.q}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
