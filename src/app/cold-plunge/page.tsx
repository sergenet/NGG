import type { Metadata } from 'next';
import Image from 'next/image';
import Link from '@/components/SiteLink';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import { CheckCircle2, Zap, Thermometer, Droplets, Ruler, Volume2, Star, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

/**
 * Paid-traffic landing page for Plunge Chill 1HP Cold Plunge Chiller + Tub (Plus).
 *
 * Preserves exact clickrefs for Awin attribution:
 * - lp1-hero
 * - lp1-midpage
 * - lp1-footer
 */

const PRODUCT_ID = 'P-AW-PLUNGE-CHILL-POD';

const product = (productsData as Product[]).find((p) => p.id === PRODUCT_ID);
const vendor = product?.vendors.find((v) => v.isPrimary) ?? product?.vendors?.[0];
const heroImage = product?.images?.[0] ?? '/assets/images/cold-plunge/cold_plunge_patio_setup.jpg';
const priceLabel = vendor ? `$${vendor.price.toLocaleString('en-US')}` : '$1,359';
const price = vendor?.price ?? 1359;

/** The merchant link, with a campaign click reference appended. */
const offer = (clickref: string) => {
  if (!vendor?.url) return 'https://www.awin1.com/cread.php?awinmid=122418&awinaffid=2913559&ued=https%3A%2F%2Fplungechill.com%2Fproducts%2F1hp-cold-plunge-chiller-tub-plus';
  try {
    const url = new URL(vendor.url);
    url.searchParams.set('clickref', clickref);
    return url.toString();
  } catch {
    return 'https://www.awin1.com/cread.php?awinmid=122418&awinaffid=2913559&ued=https%3A%2F%2Fplungechill.com%2Fproducts%2F1hp-cold-plunge-chiller-tub-plus';
  }
};

export const metadata: Metadata = {
  title: `Cold Plunge at Home: What ${priceLabel} Actually Buys (1HP Chiller + Tub)`,
  description:
    'A 1HP commercial chiller and a 120-gallon insulated tub for ice-free cold water immersion at home. 36°F water, running costs, setup guide, and real buyer specifications.',
  alternates: { canonical: '/cold-plunge/' },
  openGraph: {
    title: `Cold Plunge at Home: What ${priceLabel} Actually Buys (1HP Chiller + Tub)`,
    description:
      '1HP commercial chiller, 120-gallon tub, 36°F without buying ice, about $0.70–$1.50 a day to run. Full specifications and buyer guide.',
    type: 'article',
    url: 'https://newgiftsandgadgets.com/cold-plunge/',
    images: [{ url: 'https://newgiftsandgadgets.com/assets/images/cold-plunge/cold_plunge_patio_setup.jpg', width: 1200, height: 628, alt: 'Plunge Chill 1HP Cold Plunge Setup' }],
  },
};

const faqs = [
  {
    question: 'Do you need to buy ice for this plunge?',
    answer:
      'No. The 1HP commercial chiller is rated to hold water down to 36°F, which is colder than an ice bath needs to be. The point of the chiller is that the recurring ice purchase disappears completely.',
  },
  {
    question: 'How long does it take to get cold?',
    answer:
      'The manufacturer quotes roughly 8 hours to take water from 80°F to 40°F, tested at up to 110 gallons. With the 120-gallon tub filled to capacity, expect roughly 8 hours for the initial pull-down with the insulated lid on. Once cold, the thermostat maintains your target temperature around the clock.',
  },
  {
    question: 'What does it cost to run?',
    answer:
      'The manufacturer estimates about $0.70 to $1.50 a day depending on local climate and power rates. The compressor draws 2,600W of cooling power during active cooling cycles, but once at temperature with the insulated cover secured, it only cycles intermittently.',
  },
  {
    question: 'Will it fit a tall or heavy person?',
    answer:
      'The tub is rated for one user up to 6 ft 9 in and 320 lb. It measures 35.4 inches in diameter and 31.5 inches in height, providing true shoulder-deep seated immersion for athletic and tall builds.',
  },
  {
    question: 'Where can it be installed?',
    answer:
      'It needs a level outdoor patio, deck, garage, or dedicated indoor floor with access to a standard 110V power outlet and a drain or garden hose runoff. The chiller has caster wheels, the tub inflates in under five minutes, and the UV-resistant wall is rated for outdoor temperatures up to 158°F.',
  },
  {
    question: 'Is this a permanent acrylic tub?',
    answer:
      'No. The tub is an ultra-rigid inflatable crafted from double-layer military-grade PVC over a drop-stitch nylon core with an 8 cm thermal wall. It feels as solid as a rigid paddleboard when inflated, while giving you the freedom to pack it down, relocate, or store it in minutes.',
  },
];

export default function ColdPlungePage() {
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Plunge Chill 1HP Cold Plunge Chiller + Tub (Plus)',
    image: [
      'https://newgiftsandgadgets.com/assets/images/cold-plunge/cold_plunge_patio_setup.jpg',
      'https://newgiftsandgadgets.com/assets/images/cold-plunge/cold_plunge_chiller_display_36f.jpg',
      'https://newgiftsandgadgets.com/assets/images/cold-plunge/cold_plunge_immersion_lifestyle.jpg',
    ],
    description:
      'A 1HP commercial water chiller paired with a 120-gallon insulated inflatable cold plunge tub. Cools to 36°F without ice.',
    brand: { '@type': 'Brand', name: 'Plunge Chill' },
    offers: {
      '@type': 'Offer',
      price: '1359',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <main className="min-h-screen pt-20 pb-20 bg-stone-50 dark:bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Category Tag */}
        <div className="flex items-center gap-3 mb-6 pt-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            2026 Home Recovery Guide
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified 1HP Specs &amp; Pricing</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-12 gap-10 items-center mb-16">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-5">
              A 36°F Cold Plunge at Home, <span className="text-cyan-600 dark:text-cyan-400">Without Buying Ice</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              A commercial-grade <strong>1HP chiller</strong> and a heavy-duty <strong>120-gallon insulated tub</strong>, bundled for{' '}
              <span className="text-slate-950 dark:text-white font-extrabold text-xl underline decoration-cyan-500 decoration-2">{priceLabel}</span>. 
              Eliminate the weekly ice bag runs and get sub-40°F recovery in your own backyard or garage with precision digital temperature control.
            </p>

            {/* Trustpilot & Social Proof Bar */}
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
              <div className="flex items-center gap-1 text-emerald-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                ))}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                4.7 / 5.0 Rating
              </div>
              <span className="text-xs text-slate-400">|</span>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                From <strong>188 reviews</strong> on Trustpilot
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              {vendor && (
                <PrimaryCTA
                  href={offer('lp1-hero')}
                  storeName={vendor.name}
                  productSlug={product?.slug}
                  placement="lp1_hero"
                  className="sm:max-w-md shadow-lg shadow-cyan-600/20"
                />
              )}
              <a
                href="#specifications"
                className="flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                Inspect Specifications &darr;
              </a>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Direct merchant fulfillment &bull; In stock with free US shipping &bull; Insulated cover &amp; hand pump included.
            </p>
          </div>

          {/* Right Hero Visual Showcase */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900">
              <Image
                src="/assets/images/cold-plunge/cold_plunge_patio_setup.jpg"
                alt="Plunge Chill 1HP cold plunge chiller beside the insulated round plunge tub on cedar patio"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                priority
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cyan-300 border border-cyan-500/30">
                ❄️ Complete Tub + 1HP Chiller Bundle
              </div>
            </div>

            {/* Secondary Thumbnail Gallery */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-950 group">
                <Image
                  src="/assets/images/cold-plunge/cold_plunge_chiller_display_36f.jpg"
                  alt="Close-up of 1HP chiller LED control screen reading 36°F"
                  fill
                  sizes="25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                  Precision 36°F Chill
                </div>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-950 group">
                <Image
                  src="/assets/images/cold-plunge/cold_plunge_immersion_lifestyle.jpg"
                  alt="Full shoulder-deep immersion in 120-gallon insulated tub"
                  fill
                  sizes="25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                  Shoulder-Deep Immersion
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Fact Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16" aria-label="Key specifications">
          {[
            { icon: Thermometer, label: 'Coldest setting', value: '36°F', note: 'no ice required' },
            { icon: Droplets, label: 'Tub capacity', value: '120 gal', note: 'fits up to 6 ft 9 in' },
            { icon: Zap, label: 'Cooling Power', value: '1 HP', note: '2,600W cooling engine' },
            { icon: Volume2, label: 'Daily Running Cost', value: '$0.70–1.50', note: 'insulated lid keeps cost low' },
          ].map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
            >
              <fact.icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-3" aria-hidden="true" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1">
                {fact.label}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">
                {fact.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{fact.note}</div>
            </div>
          ))}
        </section>

        {/* Comparison Matrix: What It Replaces */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
              Return on Investment
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1 mb-3">
              Why the Arithmetic Favors a Dedicated 1HP Chiller
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Compare owning a permanent 36°F home setup against buying bags of ice or commuting to cryo gyms.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50">
                  <th className="py-4 px-6 font-bold text-slate-900 dark:text-white">Solution</th>
                  <th className="py-4 px-6 font-bold text-slate-900 dark:text-white">Initial Spend</th>
                  <th className="py-4 px-6 font-bold text-slate-900 dark:text-white">Ongoing Cost</th>
                  <th className="py-4 px-6 font-bold text-slate-900 dark:text-white">Water Temp</th>
                  <th className="py-4 px-6 font-bold text-slate-900 dark:text-white">Hassle &amp; Prep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="bg-cyan-50/40 dark:bg-cyan-950/20 font-semibold">
                  <td className="py-4 px-6 text-cyan-900 dark:text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    Plunge Chill 1HP + Tub
                  </td>
                  <td className="py-4 px-6 text-slate-900 dark:text-white">{priceLabel}</td>
                  <td className="py-4 px-6 text-emerald-600 dark:text-emerald-400">~$25–$45 / mo power</td>
                  <td className="py-4 px-6 text-slate-900 dark:text-white">Consistent 36°F</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300">Push-button ready 24/7</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-800 dark:text-slate-200">Bagged Ice in Stock Tank</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">$100–$200</td>
                  <td className="py-4 px-6 text-rose-600 dark:text-rose-400">$120–$250 / mo in ice</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">48°F–55°F (fluctuates)</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">Hauling 40–60 lbs of ice daily</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-800 dark:text-slate-200">Cryotherapy / Wellness Club</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">$0</td>
                  <td className="py-4 px-6 text-rose-600 dark:text-rose-400">$150–$300 / mo membership</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">38°F–42°F</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">Driving, scheduling, waiting</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-slate-800 dark:text-slate-200">Custom Acrylic Hard Plunge</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">$4,500–$8,500</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">~$40 / mo power</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">37°F</td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">Fixed installation, non-movable</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">
            For anyone plunging 3+ times per week, the Plunge Chill package breaks even against commercial memberships or bagged ice within 6 to 9 months.
          </p>
        </section>

        {/* Specifications */}
        <section id="specifications" className="mb-20 scroll-mt-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Detailed Engineering Specifications</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-sm">
                Two purpose-built components in one complete delivery: the commercial 1HP chiller handles thermal pull-down, while the 120-gallon drop-stitch tub provides structural rigidity and insulation.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start">
              Model: Plus 1HP Package
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Chiller Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Commercial 1HP Chiller</h3>
                  <p className="text-xs text-slate-500">Fast pull-down cooling engine</p>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                {[
                  ['Compressor', '1 HP, commercial-grade Japanese compressor'],
                  ['Cooling power', '2,600W, R410A refrigerant'],
                  ['Coldest water', '36°F — no ice needed'],
                  ['Pull-down rate', '80°F → 40°F in approx. 8 hours (insulated)'],
                  ['Test volume', 'Tested up to 110 gallons & 120 gallons capacity'],
                  ['Heat exchanger', '20 ft anti-corrosion titanium coil'],
                  ['Filtration', '20-micron inline filter, dual-pump ready'],
                  ['Controls', 'Digital LED, 3-button auto-lock display'],
                  ['Safety', 'Overheat & abnormal-power shutoff, circuit reset'],
                  ['Portability', '16.5 × 13.8 × 18.9 in, 73 lb on heavy-duty casters'],
                  ['Draining', 'One-button quick-drain and venting system'],
                ].map(([term, value]) => (
                  <div key={term} className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-2.5 last:border-0 last:pb-0">
                    <dt className="text-slate-500 dark:text-slate-400 shrink-0">{term}</dt>
                    <dd className="text-slate-900 dark:text-slate-200 font-semibold text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Tub Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">120-Gal Insulated Tub (Plus)</h3>
                  <p className="text-xs text-slate-500">Rigid drop-stitch thermal pod</p>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                {[
                  ['Form factor', 'Round, upright, shoulder-deep immersion'],
                  ['Dimensions', '35.4 in diameter × 31.5 in height'],
                  ['Capacity', '120 gallons (approx. half a ton full)'],
                  ['User rating', 'Rated for users up to 6 ft 9 in and 320 lb'],
                  ['Dry weight', '31.1 lb (easy single-person carry)'],
                  ['Wall thickness', '5-layer thermal, 8 cm rigid inflatable core'],
                  ['Shell material', 'Military-grade PVC + fibreglass drop-stitch'],
                  ['Heat tolerance', 'Outdoor UV stable in heat up to 158°F'],
                  ['Inflation time', 'Under 5 minutes with included double-action pump'],
                  ['Fittings', '1/2 in threaded inlet & outlet, quick adapters included'],
                  ['Included gear', 'Lockable insulated lid (3 buckles), step stool, bag'],
                ].map(([term, value]) => (
                  <div key={term} className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-2.5 last:border-0 last:pb-0">
                    <dt className="text-slate-500 dark:text-slate-400 shrink-0">{term}</dt>
                    <dd className="text-slate-900 dark:text-slate-200 font-semibold text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

          </div>
        </section>

        {/* Buyer Setup Guide (Constructive & Practical) */}
        <section className="mb-20 rounded-3xl border border-cyan-200 dark:border-cyan-900/50 bg-gradient-to-br from-cyan-50/50 to-white dark:from-cyan-950/20 dark:to-slate-900 p-6 md:p-10 shadow-sm">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              Pre-Purchase Siting &amp; Practical Tips
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 mb-3">
              What to Know Before Siting Your Cold Plunge
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              To get the most out of your 1HP system from day one, review these practical electrical, water, and space requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="p-2 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 shrink-0 h-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Standard 110V Dedicated Outlet</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The compressor draws 2,600W of peak cooling power. Use a standard dedicated 110V/15A wall outlet (with built-in GFCI reset) near your setup rather than running daisy-chained extension leads.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-2 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 shrink-0 h-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">The Insulated Lid Is Key to 36°F</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The included 3-buckle insulated cover prevents ambient air heat transfer. Keeping the lid secured when not in use drops energy consumption down to $0.70–$1.50/day and speeds up chill cycles.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-2 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 shrink-0 h-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Floor Load &amp; Level Ground</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  A full 120-gallon tub weighs approximately 1,000 lbs. Site it on flat concrete, reinforced decking, or ground-level patio stone that can support distributed weight comfortably.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-2 rounded-xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 shrink-0 h-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Easy One-Button Drain &amp; Filtration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The 20-micron inline filter catches sediment, and the one-button drain connects to any garden hose when refreshing water every 3–4 weeks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-Page Trust & CTA */}
        <section className="mb-20 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:p-12 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-1.5 text-emerald-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-emerald-500" />
                ))}
                <span className="text-sm font-bold text-slate-900 dark:text-white ml-2">4.7 / 5.0 on Trustpilot</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
                Ready to Experience Sub-40°F Home Recovery?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Join hundreds of athletes, lifters, and wellness enthusiasts who traded daily ice runs for ice-free push-button immersion. Complete package includes 1HP chiller, 120-gal tub, insulated lid, step stool, and hoses.
              </p>
            </div>
            {vendor && (
              <div className="shrink-0 flex flex-col gap-2">
                <PrimaryCTA
                  href={offer('lp1-midpage')}
                  storeName={vendor.name}
                  productSlug={product?.slug}
                  placement="lp1_midpage"
                  className="w-full sm:w-auto shadow-xl shadow-cyan-600/20"
                />
                <span className="text-[11px] text-center text-slate-500">Direct from Plunge Chill Official</span>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Everything you need to know about maintenance, running costs, and delivery.</p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-base">
                  {faq.question}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA Strip */}
        <section className="rounded-3xl bg-slate-950 border border-slate-800 p-8 md:p-14 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-transparent to-indigo-900/20 pointer-events-none"></div>
          <span className="inline-block px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider mb-4">
            Limited Time Bundle
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
            Lock In the 1HP Chiller + Tub Package for {priceLabel}
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Includes the commercial 1HP water chiller, 120-gallon military-grade drop-stitch tub, thermal locking cover, hand pump, and quick-connect adapters.
          </p>
          <div className="flex justify-center">
            {vendor && (
              <PrimaryCTA
                href={offer('lp1-footer')}
                storeName={vendor.name}
                productSlug={product?.slug}
                placement="lp1_footer"
                className="max-w-md w-full shadow-2xl shadow-cyan-500/30 text-base py-4"
              />
            )}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            <Link href="/affiliate-disclosure/" className="underline hover:text-white transition-colors">
              Affiliate Disclosure
            </Link>
            <span>&bull;</span>
            <Link href="/shop/health-and-wellness/" className="underline hover:text-white transition-colors">
              Explore All Recovery Gear
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
