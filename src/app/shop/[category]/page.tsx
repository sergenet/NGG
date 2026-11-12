import React, { Suspense } from 'react';
import Link from '@/components/SiteLink';
import { notFound } from 'next/navigation';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import { GiftFinderClient, ProductGrid } from './GiftFinderClient';
import { StickyMobileFilter } from '@/components/StickyMobileFilter';
import ProductImageDisplay from '@/components/ProductImageDisplay';
import { categorySlug, formatPriceBracket, isActiveRetailerUrl, sortByRecency } from '@/lib/utils';

// How many picks "New Arrivals" shows. The window is recency-ordered rather than
// date-filtered so the page can never render empty when the catalog goes quiet.
const NEW_ARRIVAL_LIMIT = 12;

type CategorySection = { title: string; body: string };
type CategoryCopy = {
  eyebrow: string;
  intro: string;
  faqs: { question: string; answer: string }[];
  sections?: CategorySection[];
};

function getCategoryCopy(categoryName: string): CategoryCopy {
  switch (categoryName) {
    case 'Home Office':
      return {
        eyebrow: 'Remote work essentials',
        intro: 'Build a more comfortable, focused workspace with practical upgrades for posture, screen height, cable routing, and desk organization.',
        faqs: [
          { question: 'What is the best home office category to start with?', answer: 'Start with the item that removes your biggest daily bottleneck first: ergonomics, monitor setup, or desk organization.' },
          { question: 'Should I buy direct or from a marketplace?', answer: 'Compare the current price, delivery estimate, return window, warranty coverage, and support. The best retailer can vary by product and location.' },
          { question: 'Is a standing desk worth it without an anti-fatigue mat?', answer: 'A mat helps mainly because standing still for hours is uncomfortable. Alternating between sitting and standing through the day matters more than either the mat or the desk, so treat the mat as an optional comfort add-on.' },
          { question: 'How much desk depth do monitor arms need?', answer: 'Most clamps need roughly five centimetres of clear edge and a flat underside. Check the manufacturer’s minimum and maximum desk thickness as well, because thin tops can flex under the load.' },
        ],
        sections: [
          {
            title: 'What earns a place at the desk',
            body: 'The picks here fix something you feel by the end of a working day: screen height, wrist angle, light on the desk, or the minutes spent tidying cables. A desk or chair that puts you at the right height matters more than any accessory, which is why furniture comes before extras in this collection.',
          },
          {
            title: 'What we leave out',
            body: 'Desk decor that takes space without doing a job, and anything that needs a phone app or an account for basic operation. Complete computer systems are out of scope as well: this collection covers the desk around a machine you already own, not the machine itself.',
          },
          {
            title: 'Measure before you buy',
            body: 'Three numbers decide most of these purchases: the depth of your desk edge for a clamp, the weight a monitor arm has to hold, and the height range you need between sitting and standing. Check each against the published specification before ordering, because a clamp that is a centimetre too shallow is a return.',
          },
        ],
      };
    case 'Smart Home':
      return {
        eyebrow: 'Automation and convenience',
        intro: 'Start with a device that solves a recurring problem—outdoor lighting, shared scheduling, or lawn care—and confirm it works with what is already in the home.',
        faqs: [
          { question: 'Do smart home buyers care about ecosystem?', answer: 'Yes. Compatibility with Alexa, Google Home, and Matter can make or break the purchase decision.' },
          { question: 'Which smart-home upgrade should come first?', answer: 'Choose one repeated frustration to solve. Lighting is the easiest place to start, a shared calendar only pays off if the household will use it, and a robotic mower is the largest commitment of the three.' },
        ],
      };
    case 'Kitchen':
      return {
        eyebrow: 'Cooking upgrades and giftable gear',
        intro: 'Prioritize tools that save time, simplify cleanup, or replace a task you perform often. Counter space and ease of storage matter as much as headline features.',
        faqs: [
          { question: 'What makes a kitchen gadget a good gift?', answer: 'The safest choices are easy to learn, useful every week, simple to clean, and sized appropriately for the recipient’s kitchen.' },
          { question: 'What should I verify before buying a kitchen tool?', answer: 'Check dimensions, materials, what is included, cleaning requirements, warranty coverage, and the retailer’s return policy.' },
          { question: 'Does a more expensive kitchen tool last longer?', answer: 'Not reliably. Price buys better materials and motors up to a point, then buys capacity you may not need. Compare the parts that wear — blades, seals, motors — and the warranty that covers them.' },
          { question: 'How do I judge a kitchen gadget without handling it?', answer: 'Read the dimensions, the material grades, and what is in the box. Then look at how it is cleaned: dishwasher-safe parts and removable blades are often the difference between a tool you use weekly and one you avoid.' },
        ],
        sections: [
          {
            title: 'What earns a place in this collection',
            body: 'Counter space is the real budget in a kitchen, so a tool has to replace a step you already repeat. The strongest picks here remove a knife task, shorten a cleanup, or take over a job an appliance was doing badly. We favour models that store in a drawer or tuck against a backsplash over anything that needs to live permanently on the counter.',
          },
          {
            title: 'What we leave out',
            body: 'Single-purpose machines that handle one shape of food, appliances that need pods or proprietary refills, and anything whose cleaning routine takes longer than the task it performs. Novelty shapes are skipped too: a cartoon silicone mould is harder to wash and stores worse than a plain one doing the same job.',
          },
          {
            title: 'How to buy in the right order',
            body: 'Start with the tool you reach for most and work backwards. Prep tools — choppers, scales, good openers — return more per dollar than a second appliance, and they rarely need warranty service. If a large appliance is the goal, size it from your storage and your usual batch size rather than from the feature list.',
          },
        ],
      };
    case 'Outdoor & Adventure':
      return {
        eyebrow: 'Gear for the wild and travel',
        intro: 'Explore outdoor gear selected for useful features, durability signals, and comfort—from rechargeable lighting and rugged accessories to e-bikes, fishing kit, and heated wear.',
        faqs: [
          { question: 'What is the most essential outdoor gear to invest in?', answer: 'Focus on what the trip actually needs: dependable lighting, weather protection, secure luggage, and repairable components before specialty extras.' },
          { question: 'How should I assess outdoor product durability?', answer: 'Check material specifications, weather-resistance ratings, repairability, warranty terms, weight, and patterns in recent owner feedback. Current catalog pages are research-based, not hands-on tests.' },
        ],
      };
    case 'Pet Tech & Smart Pet Gear':
      return {
        eyebrow: 'Practical gear for pet parents',
        intro: 'Keep shedding and grooming mess under control with tools judged on suction, noise, attachment storage, and how easy the bin is to empty.',
        faqs: [
          { question: 'Is grooming equipment safe for an anxious pet?', answer: 'Introduce it slowly and at the lowest setting. Noise is the usual problem, so follow the manufacturer’s guidance, keep sessions short, and stop if the animal is distressed.' },
          { question: 'Does pet grooming gear need a subscription?', answer: 'No. Nothing in this catalog requires an account or a monthly fee; the running costs to weigh are replacement bags, filters, and blades.' },
        ],
      };
    case 'Travel & Digital Nomad Tech':
      return {
        eyebrow: 'Gear for mobile productivity',
        intro: 'Compare packing and in-transit gear by weight, dimensions, power requirements, airline constraints, and how much complexity they remove from a real trip.',
        faqs: [
          { question: 'What should I confirm before taking a portable appliance abroad?', answer: 'Voltage and plug type at the destination, whether the device is dual-voltage, and the airline’s rules on anything with a battery or a heating element.' },
          { question: 'What makes a backpack good for tech travel?', answer: 'Look for dedicated, padded laptop compartments, water-resistant zippers/materials, ergonomic support, and TSA lay-flat designs to speed up airport security.' },
          { question: 'Do I need a power converter or just an adapter?', answer: 'An adapter only changes the plug shape; a converter changes the voltage. Most electronics are dual-voltage and need only an adapter, but heating appliances usually are not, so check the label before plugging anything in.' },
          { question: 'What is the practical limit for a carry-on bag?', answer: 'Check the specific airline, because limits differ by a few centimetres and some carriers weigh cabin bags. A bag comfortably under the published limit is safer than one that claims to be exact.' },
        ],
        sections: [
          {
            title: 'What earns a place in the bag',
            body: 'Travel gear earns its weight by surviving the trip: it packs flat, runs on the power available where you are going, and does not need a proprietary cable left behind at home. Everything here is judged on packed size and on how many separate items it replaces.',
          },
          {
            title: 'What we leave out',
            body: 'Anything with a heating element that is not dual-voltage, bags that exceed the carry-on limits of the airlines you actually fly, and devices that only work through their own app. A gadget needing a subscription to function is a running cost disguised as luggage.',
          },
          {
            title: 'Check the destination, not the listing',
            body: 'Voltage and plug type come first, then the airline rules on lithium batteries and anything that heats. A portable appliance that works at home may need a converter abroad, and the converter often costs more than the device, so confirm the destination before committing.',
          },
        ],
      };
    case 'Desk Toys & Novelty Gifts':
      return {
        eyebrow: 'Fun, visual, and highly satisfying',
        intro: 'Add a touch of personality and stress relief to your workspace with these curated desk toys and novelty items. Perfect for resetting your focus or finding a unique gift.',
        faqs: [
          { question: 'What are the benefits of desk toys?', answer: 'Desk toys provide micro-breaks that can help relieve stress, stimulate creative thinking, and improve focus during long tasks.' },
          { question: 'Are these items good for professional settings?', answer: 'Yes. Our picks favour restrained finishes—brushed metal, tinted glass, soft glow—that read as deliberate rather than gimmicky in a shared office.' },
        ],
      };
    case 'Home Decor':
      return {
        eyebrow: 'Pieces that hold a room together',
        intro: 'Decor earns its place through material, finish, and how it ages rather than through trend. Compare exact dimensions, placement, and care requirements before buying.',
        faqs: [
          { question: 'What should I check before buying decor online?', answer: 'Confirm the exact dimensions and weight against the space you have in mind, then read the return terms. Finish and colour often read differently in person than on a screen.' },
          { question: 'Is a decorative piece a safe gift?', answer: 'It is when the recipient has room for it. Ask about shelf depth, wall space, or whether they would rather receive something practical.' },
          { question: 'Is decor a good gift if I do not know their space?', answer: 'Only when it is small and easy to place. Anything needing a wall, a shelf of a specific depth, or a particular colour scheme is a risk, so lean towards something the recipient can move between rooms.' },
          { question: 'How do I judge finish quality online?', answer: 'Look for the material description and the care instructions. Solid materials with simple care notes tend to age better than finishes that need special cleaners, and a listing will usually say which it is.' },
        ],
        sections: [
          {
            title: 'What earns a place in the room',
            body: 'Decor here is judged on what a photograph cannot show: exact dimensions, weight, how the finish wears, and whether it needs dusting every week. A piece that fits the space it was bought for ages better than one chosen for how it photographs.',
          },
          {
            title: 'What we leave out',
            body: 'Trend pieces with a short shelf life, anything sold without published dimensions, and fragile items whose packaging is never described. If a listing will not state a size or a material, that is usually the answer.',
          },
          {
            title: 'Measure the space first',
            body: 'Shelf depth, wall width, and the height of whatever already sits there decide whether a piece works. Note those numbers before browsing, then compare them against the listing. Colour is the other risk: screen calibration shifts warm and cool tones, so treat the photo as a guide rather than a match.',
          },
        ],
      };
    case 'Novelty Tech':
      return {
        eyebrow: 'Fun hardware with a clear purpose',
        intro: 'Novelty tech is worth buying when it does one thing well and installs cleanly. The fun is in the effect, so check fit, power, and compatibility first.',
        faqs: [
          { question: 'What is the most common mistake with novelty tech?', answer: 'Buying for the effect instead of the setup. Confirm the power source, the mounting method, and whether it needs an app or account to work at all.' },
          { question: 'Do collector lighting kits fit any build?', answer: 'No. Kits are usually cut for one specific set or scale, so match the kit to the exact model and check whether it replaces or overlays existing pieces.' },
          { question: 'Will a display lighting kit fit my set?', answer: 'Only if the kit names the exact model or scale. Most are cut for one specific build, so match the set number and check whether the kit replaces existing parts or layers over them.' },
          { question: 'Are novelty pieces office-appropriate?', answer: 'The restrained ones are: brushed metal, tinted glass, soft light. Anything with a moving part or a speaker tends to be noticed by everyone nearby, which is worth considering before it goes on a shared desk.' },
        ],
        sections: [
          {
            title: 'What earns a place on the desk',
            body: 'A novelty piece earns its space when it does one thing convincingly and installs cleanly. That means a standard power source, a mounting method that needs no tools you do not have, and an effect you still like after a month.',
          },
          {
            title: 'What we leave out',
            body: 'App-only effects, kits that need permanent modification of the item they light, and anything loud enough to be noticed at the next desk. Pieces that only work in the dark are skipped as well: an effect you cannot see in daylight rarely survives an office.',
          },
          {
            title: 'Plan the install, not just the effect',
            body: 'Trace the power route before buying. A cable that has to cross a walkway will not stay there, and a battery piece needing a weekly charge ends up switched off. Check the footprint too, since these pieces compete for the same few centimetres as everything else on the desk.',
          },
        ],
      };
    case 'Smart Wearables':
      return {
        eyebrow: 'Wearables worth the wrist time',
        intro: 'Compare wearables on what decides daily use: sizing, battery behaviour with real notifications, app requirements, and the data you actually want to see.',
        faqs: [
          { question: 'Is a smart ring a replacement for a smartwatch?', answer: 'Usually not. Rings trade a screen and sensors for size and battery life, so they suit people who want passive tracking without another display to charge.' },
          { question: 'What should I confirm before buying a wearable?', answer: 'Sizing, phone compatibility, any subscription requirement, water resistance, and the return window in case the fit is wrong.' },
        ],
      };
    case 'Home Entertainment':
      return {
        eyebrow: 'Streaming hardware that fits the room',
        intro: 'Media players and streaming hubs differ mainly in codec support, port layout, and how much of the interface you can live with. Match the box to your screen and your habits.',
        faqs: [
          { question: 'Do I need a media player if my TV is already smart?', answer: 'Only if the built-in interface is slow, missing apps you use, or cannot pass the audio format your soundbar or receiver expects.' },
          { question: 'What matters more: resolution or ports?', answer: 'Ports and audio handling, usually. 4K output is common; whether the device can drive your speakers and read your storage is what causes returns.' },
        ],
      };
    case 'Health & Wellness':
      return {
        eyebrow: 'Recovery equipment for the home',
        intro: 'Recovery gear is a space, power, and maintenance decision as much as a health one. Check footprint, drainage, cleaning routine, and the manufacturer’s safety guidance before buying.',
        faqs: [
          { question: 'What should I confirm before buying a cold plunge?', answer: 'Filled weight on your floor, drainage and refill access, the chiller’s noise and power draw, and the manufacturer’s limits on temperature and duration.' },
          { question: 'Is recovery equipment safe for everyone?', answer: 'No. Cold exposure and similar routines are not appropriate for every health condition. Check with a clinician before starting and follow the manufacturer’s limits.' },
        ],
      };
    case 'New Arrivals':
      return {
        eyebrow: 'Fresh finds & newly added tech',
        intro: 'The most recently added and updated picks in the catalog, newest first — each one linked to a live retailer listing.',
        faqs: [
          { question: 'How is this list ordered?', answer: 'Newest first, by the date a pick was added or last updated. The list re-sorts itself whenever the catalog changes, so an item can drop off without being removed.' },
          { question: 'Are all new arrivals backed by active warranties and return windows?', answer: 'Warranty and returns come from the retailer, not from us. Every pick links to an authorized storefront, so confirm the current terms on that listing before buying.' },
          { question: 'Does this list ever run out?', answer: 'No. It shows the most recent picks rather than everything published after a fixed date, so it stays populated even when nothing new has been added for a while.' },
        ],
      };
    default:
      return {
        eyebrow: 'All products',
        intro: 'Browse every product in the catalog, then narrow by price, category, and recipient to find the best-fit recommendation faster.',
        faqs: [
          { question: 'How are products organized on this site?', answer: 'Collections prioritize relevance, usefulness, clear product fit, and meaningful alternatives. Affiliate compensation is disclosed separately.' },
          { question: 'Can I filter by price?', answer: 'Yes. Use the sidebar to narrow by category and price bracket before jumping into the product details.' },
        ],
      };
  }
}

export async function generateStaticParams() {
  // Extract all unique categories
  const categories = Array.from(new Set(productsData.map(p => categorySlug(p.tags.category))));
  return [
    { category: 'all' },
    { category: 'new-arrivals' },
    ...categories.map(category => ({ category }))
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const metadataMap: Record<string, {title: string; description: string; keywords: string}> = {
    'all': {
      title: 'Best Gadgets & Gift Ideas 2026',
      description: 'Discover useful gadgets, gift ideas, and tech products for 2026. Browse research-based picks for home office, smart home, kitchen, and more.',
      keywords: 'best gadgets, gift ideas, tech gifts, gadget reviews'
    },
    'home-office': {
      title: 'Best Home Office Gadgets & Furniture 2026 | Buying Guides',
      description: 'Find standing desks, ergonomic chairs, monitor arms and stands, and desk accessories with research-based buying notes for remote workers.',
      keywords: 'home office gadgets, standing desk, ergonomic chair, monitor arm, office accessories, workspace'
    },
    'smart-home': {
      title: 'Smart Home Devices 2026 | Guides & Comparisons',
      description: 'Smart displays, connected calendars, outdoor lighting, robotic mowers, and lifting tools compared on setup, apps, subscriptions, and privacy.',
      keywords: 'smart home devices, smart display, smart lighting, robotic lawn mower, connected calendar'
    },
    'kitchen': {
      title: 'Best Kitchen Gadgets & Tools 2026 | Buying Guides',
      description: 'Compare choppers, slicers, milk frothers, digital scales, jar openers, and grill baskets with practical notes for home cooks.',
      keywords: 'kitchen gadgets, food chopper, milk frother, kitchen scale, jar opener, grill basket'
    },
    'outdoor-adventure': {
      title: 'Best Outdoor & Adventure Gear 2026 | Buying Guides',
      description: 'Find outdoor gear, travel essentials, and adventure gadgets with research-based comparison guides for active explorers.',
      keywords: 'outdoor gear, adventure gadgets, travel gear, camping equipment, active gear'
    },
    'pet-tech': {
      title: 'Pet Tech & Smart Pet Gear 2026 | Guides & Comparisons',
      description: 'Grooming vacuums and pet-care tools compared on suction, noise, attachment storage, and cleanup for pet owners.',
      keywords: 'pet tech, pet grooming vacuum, dog grooming, pet hair removal'
    },
    'travel-tech': {
      title: 'Best Travel & Digital Nomad Tech 2026 | Buying Guides',
      description: 'Travel backpacks, portable washing, and in-vehicle gear compared on packed weight, power needs, and real-world maintenance.',
      keywords: 'travel tech, digital nomad gear, travel backpack, portable washing machine, car heater'
    },
    'desk-toys-novelty-gifts': {
      title: 'Desk Toys & Novelty Gifts 2026 | Buying Notes',
      description: 'Levitating lamps, mood lighting, and desk novelty pieces judged on footprint, power, noise, and whether they earn their space.',
      keywords: 'desk toys, novelty gifts, cool desk accessories, levitating lamp, mood lamp'
    },
    'home-decor': {
      title: 'Home Decor & Display Pieces 2026 | Buying Notes',
      description: 'Decor and display pieces judged on material, finish, sizing, and how they age in a real room, with the care and placement questions to check first.',
      keywords: 'home decor, display pieces, preserved rose gift, decorative accents, room styling'
    },
    'novelty-tech': {
      title: 'Novelty Tech & Collector Kits 2026 | Buying Notes',
      description: 'Novelty tech, display lighting kits, and collector accessories, with the fit, power, and build-compatibility checks worth making before you buy.',
      keywords: 'novelty tech, led lighting kit, collector display, novelty gifts, tech toys'
    },
    'smart-wearables': {
      title: 'Smart Wearables & Smart Rings 2026 | Buying Notes',
      description: 'Wearables compared on sizing, battery behaviour, app requirements, and subscription traps, so you know what each screen-free or on-wrist device adds.',
      keywords: 'smart ring, smart wearables, wearable tech, fitness tracker, smart ring display'
    },
    'home-entertainment': {
      title: 'Home Entertainment & Streaming Hardware 2026 | Buying Notes',
      description: 'Media players and streaming hubs compared on codec support, port layout, audio passthrough, and whether the built-in apps are the ones you use.',
      keywords: 'android media player, streaming box, home entertainment hub, 4k player, media player'
    },
    'health-and-wellness': {
      title: 'Health & Wellness Recovery Gear 2026 | Buying Notes',
      description: 'Recovery and wellness equipment compared on footprint, power draw, drainage, maintenance, and the safety guidance to settle before buying.',
      keywords: 'cold plunge tub, recovery gear, wellness equipment, cold therapy, home recovery'
    },
    'new-arrivals': {
      title: 'New Arrivals: Latest Clever Gadgets & Trending Gifts 2026',
      description: 'Browse the newest clever gadgets, wearable tech, and innovative gifts just added to NewGiftsAndGadgets. Explore practical new releases.',
      keywords: 'new gadgets, new arrivals, latest tech gifts, smart gadgets 2026, trending tech'
    },
  };

  const meta = metadataMap[category] || metadataMap['all'];
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `/shop/${category}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: `https://newgiftsandgadgets.com/shop/${category}`,
      images: [
        {
          url: '/social/shop.png',
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function CategoryPage({ 
  params
}: { 
  params: Promise<{ category: string }>
}) {
  const { category } = await params;
  const products: Product[] = productsData as Product[];
  
  // Base filtering by category param
  const baseProducts = category === 'all' 
    ? products 
    : category === 'new-arrivals'
      ? sortByRecency(products.filter(p => p.images[0] !== '/default-thumbnail.png' && p.vendors.some(v => v.isPrimary && isActiveRetailerUrl(v.url)))).slice(0, NEW_ARRIVAL_LIMIT)
      : products.filter(p => categorySlug(p.tags.category) === category);

  if (baseProducts.length === 0) {
    notFound();
  }

  // Extract available filter options for this specific category
  const availableCategories = Array.from(new Set(products.map(p => p.tags.category)));
  
  const priceBrackets = [
    { label: 'Under $50', value: 'under-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $250', value: '100-250' },
    { label: 'Over $250', value: 'over-250' },
  ];

  const categoryName = category === 'all' 
    ? 'All Gifts & Gadgets' 
    : category === 'new-arrivals'
      ? 'New Arrivals'
      : category === 'outdoor-adventure' 
        ? 'Outdoor & Adventure' 
        : category === 'pet-tech'
          ? 'Pet Tech & Smart Pet Gear'
          : category === 'travel-tech'
            ? 'Travel & Digital Nomad Tech'
            : category === 'desk-toys-novelty-gifts'
              ? 'Desk Toys & Novelty Gifts'
              : category === 'health-and-wellness'
                ? 'Health & Wellness'
                : category === 'home-decor'
                  ? 'Home Decor'
                  : category === 'novelty-tech'
                    ? 'Novelty Tech'
                    : category === 'smart-wearables'
                      ? 'Smart Wearables'
                      : category === 'home-entertainment'
                        ? 'Home Entertainment'
                        : category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const categoryCopy = getCategoryCopy(categoryName);
  const featuredProducts = baseProducts.slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <StickyMobileFilter categories={availableCategories} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <section className="mb-10 rounded-[2.25rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-3">{categoryCopy.eyebrow}</p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                {categoryName}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {categoryCopy.intro}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Products</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{baseProducts.length}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Filters</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">3</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8 mb-14 items-start">
          <aside className="w-full md:w-64 lg:w-72 shrink-0 lg:sticky lg:top-24">
            <GiftFinderClient 
              categories={availableCategories} 
              priceBrackets={priceBrackets}
              initialCategory={category === 'all' || category === 'new-arrivals' ? null : availableCategories.find(c => categorySlug(c) === category) || null}
            />
          </aside>

          <div className="space-y-8">
            <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-600 mb-2">Featured picks</p>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {category === 'new-arrivals' ? 'Latest Highlight Launches' : 'Best starting points in this category'}
                  </h2>
                </div>
                <Link href="/gift-guides/" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Browse Gift Guides
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-video w-full bg-white dark:bg-slate-900 overflow-hidden border-b border-slate-100 dark:border-slate-800">
                      <ProductImageDisplay
                        src={product.images?.[0] || '🎁'}
                        alt={product.title}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                        Featured
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      {product.brand && (
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                          {product.brand}
                        </span>
                      )}
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="mt-auto pt-2 flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatPriceBracket(product.tags.priceBracket)}
                        </span>
                        <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                          View details &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-600 mb-2">How to choose</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">What to look for before you click</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
                {category === 'new-arrivals' ? (
                  <>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                      <strong className="block text-slate-900 dark:text-white font-bold mb-1.5">Direct Brand Backing</strong>
                      Every newly added item links directly to verified brand storefronts or authorized merchants with genuine warranties and customer support.
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                      <strong className="block text-slate-900 dark:text-white font-bold mb-1.5">Verified Specifications</strong>
                      Dimensions, materials, battery claims, and compatibility are cross-checked directly against manufacturer spec sheets and early reviews.
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                      <strong className="block text-slate-900 dark:text-white font-bold mb-1.5">Launch Pricing &amp; Stock</strong>
                      Newly introduced gadgets often feature early-bird promotional pricing or introductory coupons—compare live vendor listings before buying.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                      Compare the current retailer price with warranty, shipping, returns, and direct-brand support before choosing where to buy.
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                      Check the related guide pages in the same silo to understand comparisons, seasonal angles, and gift intent.
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                      Use the filter sidebar to narrow by price bracket, then open the product page for a full vendor comparison.
                    </div>
                  </>
                )}
              </div>
            </section>

            {categoryCopy.sections && categoryCopy.sections.length > 0 && (
              <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-600 mb-2">In depth</p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                  How this {categoryName.toLowerCase()} collection is built
                </h2>

                <div className="space-y-6">
                  {categoryCopy.sections.map((section) => (
                    <div key={section.title}>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">{section.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{section.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-600 mb-2">Frequently asked</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Common questions for this category</h2>

              <div className="space-y-4">
                {categoryCopy.faqs.map((faq) => (
                  <details key={faq.question} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
                    <summary className="cursor-pointer list-none font-bold text-slate-900 dark:text-white">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-6 shadow-sm">
          <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading products...</div>}>
            <ProductGrid initialProducts={baseProducts} allProducts={category === 'new-arrivals' ? baseProducts : products} category={category} />
          </Suspense>
        </section>

        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link href="/gift-guides/" className="rounded-full bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700 transition-colors">
            View Gift Guides Hub
          </Link>
          <Link href="/shop/all" className="rounded-full bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800 transition-colors">
            Browse Everything
          </Link>
          <Link href="/about" className="rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-400 transition-colors">
            How We Research
          </Link>
        </div>
      </div>
    </main>
  );
}
