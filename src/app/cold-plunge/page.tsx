import type { Metadata } from 'next';
import Image from 'next/image';
import Link from '@/components/SiteLink';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import { CheckCircle2, MinusCircle, Zap, Thermometer, Droplets, Ruler, Volume2 } from 'lucide-react';

/**
 * Paid-traffic landing page for the one product in the catalogue whose price
 * supports a paid acquisition cost (>$1,000 at a 10% commission).
 *
 * Conversion is measured on the affiliate link, not here: each CTA carries a
 * distinct Awin `clickref`, so Awin's transaction report attributes a sale to
 * the exact placement that produced it. The clickref values are deliberately
 * stable — changing one orphans the history behind it.
 */

const PRODUCT_ID = 'P-AW-PLUNGE-CHILL-POD';

const product = (productsData as Product[]).find((p) => p.id === PRODUCT_ID);
const vendor = product?.vendors.find((v) => v.isPrimary) ?? product?.vendors?.[0];
const image = product?.images?.[0] ?? '';
const priceLabel = vendor ? `$${vendor.price.toLocaleString('en-US')}` : 'current price';

/** The merchant link, with a campaign click reference appended. */
const offer = (clickref: string) => {
  if (!vendor?.url) return '#';
  try {
    const url = new URL(vendor.url);
    url.searchParams.set('clickref', clickref);
    return url.toString();
  } catch {
    return '#';
  }
};

const price = vendor?.price ?? 0;

export const metadata: Metadata = {
  title: `Cold Plunge at Home: What ${priceLabel} Actually Buys`,
  description:
    'A 1HP chiller and a 120-gallon insulated tub for cold water immersion at home. What the specifications mean in practice, what it costs to run, where the numbers stop being generous, and what to check before you site one.',
  alternates: { canonical: '/cold-plunge/' },
  openGraph: {
    title: `Cold Plunge at Home: What ${priceLabel} Actually Buys`,
    description:
      '1HP chiller, 120-gallon tub, 36°F without ice, about $0.70–$1.50 a day to run. The specifications, the running cost, and the catch.',
    type: 'article',
    url: 'https://newgiftsandgadgets.com/cold-plunge/',
  },
};

const faqs = [
  {
    question: 'Do you need to buy ice for this plunge?',
    answer:
      'No. The 1HP chiller is rated to hold water down to 36°F, which is colder than an ice bath needs to be. The point of the chiller is that the recurring ice purchase disappears.',
  },
  {
    question: 'How long does it take to get cold?',
    answer:
      'The manufacturer quotes roughly 8 hours to take water from 80°F to 40°F, tested at up to 110 gallons. Because the tub holds 120 gallons when full, expect a full tub to take a little longer than the quoted figure rather than exactly as stated.',
  },
  {
    question: 'What does it cost to run?',
    answer:
      'The listing gives about $0.70 to $1.50 a day, and states openly that this depends on climate. The compressor draws 2,600W of cooling power while it is working, so the real cost follows how hard it has to work where you live and whether the insulated lid is on.',
  },
  {
    question: 'Will it fit a tall or heavy person?',
    answer:
      'The tub is rated for one user up to 6 ft 9 in and 320 lb. It is 35.4 inches across and 31.5 inches high, so shoulder-deep immersion depends on your own seated height as much as the rated maximum.',
  },
  {
    question: 'Where can it be installed?',
    answer:
      'It needs a level surface, a mains outlet near the chiller, and somewhere to send water when you drain it. The chiller has caster wheels and a one-button drain, the tub inflates in under five minutes, and the wall is rated to stay stable in outdoor heat up to 158°F. It does not need a permanent plumbing connection.',
  },
  {
    question: 'Is this a permanent acrylic tub?',
    answer:
      'No. The tub is a rigid inflatable: double-layer PVC over drop-stitch nylon with an 8 cm insulated wall. That is what allows it to pack down and ship in a box, and it is the main reason the price sits where it does. If you want a plumbed, permanently sited acrylic plunge, this is the wrong product.',
  },
];

export default function ColdPlungePage() {
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Plunge Chill 1HP Cold Plunge Chiller + Tub (Plus)',
    image: image ? [image] : undefined,
    description:
      'A 1HP water chiller paired with a 120-gallon insulated inflatable cold plunge tub. Cools to 36°F without ice.',
    brand: { '@type': 'Brand', name: 'Plunge Chill' },
    // Only claim an offer when there is a recorded price; a fallback here would
    // publish a number the catalogue does not actually hold.
    ...(price > 0
      ? {
          offers: {
            '@type': 'Offer',
            price: String(price),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
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
    <main className="min-h-screen pt-24 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 text-xs font-bold uppercase tracking-widest mb-6">
              Cold water immersion · buyer&rsquo;s guide
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1]">
              A 36°F plunge at home, without buying ice
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              A 1HP chiller and a 120-gallon insulated tub, sold together for{' '}
              <strong className="text-slate-900 dark:text-white">{priceLabel}</strong>. The reason to own one is
              arithmetic, not luxury: it removes a recurring ice purchase. Here is what the specifications actually
              mean, what it costs to run, and where the numbers stop being generous.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {vendor && (
                <PrimaryCTA
                  href={offer('lp1-hero')}
                  storeName={vendor.name}
                  productSlug={product?.slug}
                  placement="lp1_hero"
                  className="sm:max-w-xs"
                />
              )}
              <a
                href="#specifications"
                className="flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Read the specifications first
              </a>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
              We earn a commission if you buy through our links, at no extra cost to you. Price shown is the
              catalogue snapshot &mdash; confirm the current price and delivery terms with the retailer.
            </p>
          </div>

          <div className="relative aspect-square rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt="Plunge Chill 1HP cold plunge chiller beside the insulated round plunge tub"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-6"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">Plunge Chill</div>
            )}
          </div>
        </div>

        {/* Fact strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20" aria-label="Key specifications">
          {[
            { icon: Thermometer, label: 'Coldest setting', value: '36°F', note: 'no ice required' },
            { icon: Droplets, label: 'Tub capacity', value: '120 gal', note: '31.1 lb dry' },
            { icon: Zap, label: 'Chiller', value: '1 HP', note: '2,600W cooling' },
            { icon: Volume2, label: 'Running cost', value: '$0.70–1.50', note: 'per day, climate-dependent' },
          ].map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5"
            >
              <fact.icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-3" aria-hidden="true" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                {fact.label}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">
                {fact.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500">{fact.note}</div>
            </div>
          ))}
        </section>

        {/* The economics */}
        <section className="mb-20">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
            The number that decides it: cost per session
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
            <p>
              A chest freezer or a dedicated chiller is bought once and then runs. The listing puts the running cost at
              roughly <strong className="text-slate-900 dark:text-white">$0.70 to $1.50 a day</strong> and says plainly
              that climate moves it. That is the honest shape of the figure: it is not a fixed subscription, it is
              whatever your compressor has to do to fight the air around the tub.
            </p>
            <p>
              So the comparison that matters is not this product against another product, it is this product against
              whatever you are doing now. Fill in your own number for the alternative &mdash; bags of ice each week,
              drop-in cryotherapy sessions, or a gym membership you keep mainly for the cold plunge &mdash; and compare it
              with a daily figure in that range plus the {priceLabel} up front. If your current spend is a couple of
              sessions a month, this rarely pays back quickly. If you are buying ice weekly through summer, the
              arithmetic flips.
            </p>
            <p>
              That is also why the specification sheet matters more than usual here. A chiller that struggles to reach
              temperature runs constantly, and a tub whose lid does not seal loses the cold you paid for. Both numbers
              below are the ones to hold the product to.
            </p>
          </div>
        </section>

        {/* Specifications */}
        <section id="specifications" className="mb-20 scroll-mt-28">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">What you are actually buying</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-3xl">
            Two separate pieces of equipment in one box. The chiller does the work; the tub holds the water and the
            cold. Treat the specifications of each on their own terms.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">The 1HP chiller</h3>
              <dl className="space-y-3 text-sm">
                {[
                  ['Compressor', '1 HP, commercial-grade Japanese compressor'],
                  ['Cooling power', '2,600W, R410A refrigerant'],
                  ['Coldest water', '36°F — no ice needed'],
                  ['Pull-down', '80°F → 40°F in about 8 hours'],
                  ['Test volume', 'Up to 110 gallons'],
                  ['Heat exchanger', '20 ft anti-corrosion titanium coil'],
                  ['Filtration', '20-micron inline filter, dual-pump ready'],
                  ['Controls', 'Digital LED, 3-button, auto-lock'],
                  ['Safety', 'Overheat and abnormal-power shutoff, rear circuit reset'],
                  ['Size & weight', '16.5 × 13.8 × 18.9 in, 73 lb, on casters'],
                  ['Draining', 'One-button drain and venting system'],
                ].map(([term, value]) => (
                  <div key={term} className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0">
                    <dt className="text-slate-500 dark:text-slate-500 shrink-0">{term}</dt>
                    <dd className="text-slate-900 dark:text-slate-200 font-semibold text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">The insulated tub (Plus)</h3>
              <dl className="space-y-3 text-sm">
                {[
                  ['Form', 'Round, upright, shoulder-deep'],
                  ['Dimensions', '35.4 in diameter × 31.5 in high'],
                  ['Water capacity', '120 gallons'],
                  ['Rated for', 'One user up to 6 ft 9 in and 320 lb'],
                  ['Dry weight', '31.1 lb'],
                  ['Wall', '5-layer thermal, 8 cm rigid inflatable'],
                  ['Shell', 'Military-grade PVC + fibreglass, drop-stitch nylon'],
                  ['Heat resistance', 'Stable in outdoor heat up to 158°F'],
                  ['Inflation', 'Under 5 minutes, self-sealing valve'],
                  ['Ports', '1/2 in threaded inlet and outlet, adapters included'],
                  ['Included', 'Lockable insulated lid (3 buckles), step stool, carry bag'],
                ].map(([term, value]) => (
                  <div key={term} className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0">
                    <dt className="text-slate-500 dark:text-slate-500 shrink-0">{term}</dt>
                    <dd className="text-slate-900 dark:text-slate-200 font-semibold text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
            Figures are the manufacturer&rsquo;s published specifications on the product listing. We have not tested this
            unit, and where the listing is silent we have said so rather than filling the gap.
          </p>
        </section>

        {/* Honest limits */}
        <section className="mb-20 rounded-[2rem] border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Where the specifications stop being generous
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-3xl">
            Every product page is written to put its best numbers forward. These are the places where the listing&rsquo;s
            own figures work against the sales pitch, and they are worth reading before you spend four figures.
          </p>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <MinusCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">The tub holds more water than the test volume.</strong>{' '}
                Capacity is 120 gallons, but the cooling figures are quoted against &ldquo;up to 110 gallons&rdquo;. A
                full tub is outside the figure the manufacturer tested, so expect the quoted 8-hour pull-down to be
                optimistic rather than exact.
              </p>
            </li>
            <li className="flex gap-3">
              <MinusCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">36°F is a floor, not a starting point.</strong> The
                chiller will not go lower. If you want water close to freezing, this is not that machine, and no amount
                of extra insulation will change it.
              </p>
            </li>
            <li className="flex gap-3">
              <MinusCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">2,600W is a real electrical load.</strong> The unit
                has a rear circuit reset switch and overheat shutoff for a reason. Plan a dedicated outlet near the
                chiller rather than running an extension lead across a patio, and check what else shares that circuit.
              </p>
            </li>
            <li className="flex gap-3">
              <MinusCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">The tub is inflatable, and that is the trade.</strong>{' '}
                PVC over drop-stitch nylon is what makes it shippable and packable. It is not a plumbed acrylic tub, and
                the listing does not publish a puncture or lifespan rating &mdash; a gap worth asking about directly.
              </p>
            </li>
            <li className="flex gap-3">
              <MinusCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">No warranty or return term is published here.</strong>{' '}
                For a purchase at this price that matters more than any specification above. Confirm both with the
                retailer before ordering, in writing.
              </p>
            </li>
          </ul>
        </section>

        {/* Fit and siting */}
        <section className="mb-20">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Will it fit you, and your space?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Ruler,
                title: 'Footprint',
                body: 'A 35.4-inch circle, plus clearance to step in and out. The chiller adds a 16.5 × 13.8-inch box beside it — the two are connected by hoses and both need access.',
              },
              {
                icon: Droplets,
                title: 'Water and drainage',
                body: '120 gallons is roughly half a tonne of water. It needs a level surface that can take that load, and somewhere to drain to — the one-button drain still needs a destination.',
              },
              {
                icon: Zap,
                title: 'Power',
                body: 'A mains outlet within hose reach. The chiller is on casters, so it can move, but the outlet and the water are the two things you cannot relocate cheaply.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
                <item.icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mb-3" aria-hidden="true" />
                <h3 className="font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
            <p>
              The fit question is the one people get wrong. The tub is rated for a user up to 6 ft 9 in and 320 lb, but
              the number that decides shoulder-deep immersion is your seated height in the water, not the maximum the
              manufacturer will warranty. If you are tall through the torso, measure the 31.5-inch wall height against
              your own shoulder before assuming.
            </p>
          </div>
        </section>

        {/* Setup */}
        <section className="mb-20">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Setup and upkeep, realistically</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
            <p>
              The tub inflates in under five minutes and the ports are standard half-inch threaded fittings with valves
              and adapters included, so the connection between chiller and tub is plug-and-play rather than plumbing.
              The chiller has casters, which matters more than it sounds: moving a 73 lb box full of refrigerant to
              where the hose reaches is the difference between a weekend job and an afternoon one.
            </p>
            <p>
              Upkeep is the part the marketing does not dwell on. There is a 20-micron inline filter to change, water to
              treat, and a lid to put back on every single time &mdash; the insulated lockable lid is not an accessory,
              it is what keeps the compressor from undoing its own work overnight. Budget for the filter as a recurring
              cost alongside the electricity.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="mb-20">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">What it replaces</h2>
          <div className="space-y-4">
            {[
              {
                title: 'Against buying ice',
                body: 'A 120-gallon tub needs a lot of ice to drop even ten degrees. Removing that recurring purchase is the entire premise, and the daily running cost is the number to compare against whatever you spend now.',
              },
              {
                title: 'Against cryotherapy or a gym membership',
                body: 'A drop-in session is a per-visit cost with travel attached. Once the unit is bought, a session costs cents and happens in your garden. The payback period depends entirely on how often you would otherwise go.',
              },
              {
                title: 'Against a plumbed acrylic plunge',
                body: 'An acrylic all-in-one is a permanent fixture: it is sited, filled and left. This is a tub you can deflate, move and store. If you are renting, that portability is the deciding feature; if you own your home and want it permanent, it is a compromise.',
              },
            ].map((row) => (
              <div key={row.title} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
                <h3 className="font-black text-slate-900 dark:text-white mb-2">{row.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{row.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who should skip */}
        <section className="mb-20 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Who should not buy this</h2>
          <ul className="space-y-3">
            {[
              'You want water colder than 36°F — this chiller will not reach it.',
              'You have no outdoor or garage space, no drain, and no outlet near either.',
              'You want a permanent plumbed fixture rather than a tub you can pack away.',
              'You are not going to use it several times a week. The running cost only makes sense against a habit.',
            ].map((line) => (
              <li key={line} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Trust + mid CTA */}
        <section className="mb-20 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Merchant record</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                4.7 out of 5 on Trustpilot, from 188 reviews
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                That is the retailer&rsquo;s Trustpilot score at the time of writing, not our assessment. Trustpilot marks
                the company as inviting reviews from its customers. Read the recent ones yourself &mdash; on a device with
                a compressor and a pump, the support record matters more than the star average.
              </p>
            </div>
            {vendor && (
              <PrimaryCTA
                href={offer('lp1-midpage')}
                storeName={vendor.name}
                productSlug={product?.slug}
                placement="lp1_midpage"
                className="md:max-w-xs shrink-0"
              />
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Questions people ask first</h2>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 border-y border-slate-200 dark:border-slate-800">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white">
                  {faq.question}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="rounded-[2rem] bg-slate-900 dark:bg-slate-950 border border-slate-800 p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Check the current price</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Prices on cold plunge equipment move with the season, and this bracket is the one that sees the biggest
            swings. The catalogue figure of {priceLabel} is a snapshot.
          </p>
          <div className="flex justify-center">
            {vendor && (
              <PrimaryCTA
                href={offer('lp1-footer')}
                storeName={vendor.name}
                productSlug={product?.slug}
                placement="lp1_footer"
                className="max-w-sm"
              />
            )}
          </div>
          <p className="mt-6 text-xs text-slate-400">
            <Link href="/affiliate-disclosure/" className="underline hover:text-white">
              How this page makes money
            </Link>
            {' · '}
            <Link href="/shop/health-and-wellness/" className="underline hover:text-white">
              More health &amp; wellness picks
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
