import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import { GiftFinderClient, ProductGrid } from './GiftFinderClient';
import { StickyMobileFilter } from '@/components/StickyMobileFilter';

function getCategoryCopy(categoryName: string) {
  switch (categoryName) {
    case 'Home Office':
      return {
        eyebrow: 'Remote work essentials',
        intro: 'Build a more comfortable, focused workspace with practical upgrades for posture, lighting, video calls, charging, and desk organization.',
        faqs: [
          { question: 'What is the best home office category to start with?', answer: 'Start with the item that removes your biggest daily bottleneck first: ergonomics, monitor setup, or desk organization.' },
          { question: 'Should I buy direct or from a marketplace?', answer: 'Compare the current price, delivery estimate, return window, warranty coverage, and support. The best retailer can vary by product and location.' },
        ],
      };
    case 'Smart Home':
      return {
        eyebrow: 'Automation and convenience',
        intro: 'Start with devices that solve a recurring problem—lighting, cleaning, climate, or security—and confirm they work with the ecosystem already in the home.',
        faqs: [
          { question: 'Do smart home buyers care about ecosystem?', answer: 'Yes. Compatibility with Alexa, Google Home, and Matter can make or break the purchase decision.' },
          { question: 'Which smart-home upgrade should come first?', answer: 'Choose one repeated frustration to solve. Lighting is approachable, security needs careful privacy decisions, and robot vacuums require the largest budget.' },
        ],
      };
    case 'Kitchen':
      return {
        eyebrow: 'Cooking upgrades and giftable gear',
        intro: 'Prioritize tools that save time, simplify cleanup, or replace a task you perform often. Counter space and ease of storage matter as much as headline features.',
        faqs: [
          { question: 'What makes a kitchen gadget a good gift?', answer: 'The safest choices are easy to learn, useful every week, simple to clean, and sized appropriately for the recipient’s kitchen.' },
          { question: 'What should I verify before buying an appliance?', answer: 'Check dimensions, voltage, capacity, included accessories, cleaning requirements, warranty coverage, and the retailer’s return policy.' },
        ],
      };
    case 'Outdoor & Adventure':
      return {
        eyebrow: 'Gear for the wild and travel',
        intro: 'Explore outdoor and adventure gear selected for useful features, durability signals, and comfort. From lightweight tools to rugged accessories, find your next travel companion.',
        faqs: [
          { question: 'What is the most essential outdoor gear to invest in?', answer: 'Focus on high-durability essentials first: reliable weather protection, modular storage, and versatile multi-tools.' },
          { question: 'How should I assess outdoor product durability?', answer: 'Check material specifications, weather-resistance ratings, repairability, warranty terms, weight, and patterns in recent owner feedback. Current catalog pages are research-based, not hands-on tests.' },
        ],
      };
    case 'Pet Tech & Smart Pet Gear':
      return {
        eyebrow: 'Smart solutions for pet parents',
        intro: 'Upgrade your pet care routine with smart feeders, cameras, and grooming tech selected for practical features, quieter operation, and ease of use.',
        faqs: [
          { question: 'Is smart pet gear safe to leave unattended?', answer: 'Do not assume so. Review the manufacturer’s safety instructions, backup-power behavior, failure modes, cleaning requirements, and recent owner reports before relying on a device while away.' },
          { question: 'Does pet tech require premium subscriptions?', answer: 'Some cameras and trackers require subscriptions for cloud storage or GPS cellular tracking. However, most feeders and fountains operate fully with their free basic apps.' },
        ],
      };
    case 'Travel & Digital Nomad Tech':
      return {
        eyebrow: 'Gear for mobile productivity',
        intro: 'Compare portable power, bags, and organizers by weight, dimensions, compatibility, airline constraints, and how much complexity they remove from a real trip.',
        faqs: [
          { question: 'Are high-capacity power banks allowed on airplanes?', answer: 'Yes. Most airlines and the TSA allow power banks under 100Wh (approximately 27,000mAh) in carry-on luggage. You should not place them in checked bags.' },
          { question: 'What makes a backpack good for tech travel?', answer: 'Look for dedicated, padded laptop compartments, water-resistant zippers/materials, ergonomic support, and TSA lay-flat designs to speed up airport security.' },
        ],
      };
    case 'Desk Toys & Novelty Gifts':
      return {
        eyebrow: 'Fun, visual, and highly satisfying',
        intro: 'Add a touch of personality and stress relief to your workspace with these curated desk toys and novelty items. Perfect for resetting your focus or finding a unique gift.',
        faqs: [
          { question: 'What are the benefits of desk toys?', answer: 'Desk toys provide micro-breaks that can help relieve stress, stimulate creative thinking, and improve focus during long tasks.' },
          { question: 'Are these items good for professional settings?', answer: 'Yes. Our picks combine satisfying tactile feedback with premium aesthetics (like matte black finishes and glass prisms) that look great in any modern office.' },
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
  const categories = Array.from(new Set(productsData.map(p => p.tags.category.toLowerCase().replace(/\s+/g, '-'))));
  return [
    { category: 'all' },
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
      description: 'Find standing desks, ergonomic chairs, monitors, and home office gadgets with research-based buying notes for remote workers.',
      keywords: 'home office gadgets, standing desk, ergonomic chair, office accessories, workspace'
    },
    'smart-home': {
      title: 'Smart Home Devices 2026 | Guides & Comparisons',
      description: 'Discover the best smart speakers, security cameras, thermostats, and automations. Compare Alexa, Google Home, and smart home tech.',
      keywords: 'smart home devices, smart speakers, smart lights, robot vacuum, smart thermostat'
    },
    'kitchen': {
      title: 'Best Kitchen Gadgets & Appliances 2026 | Buying Guides',
      description: 'Find air fryers, blenders, coffee makers, and kitchen gadgets with practical comparisons for home cooks.',
      keywords: 'kitchen gadgets, air fryer, best blender, coffee maker, kitchen appliances'
    },
    'outdoor-adventure': {
      title: 'Best Outdoor & Adventure Gear 2026 | Buying Guides',
      description: 'Find outdoor gear, travel essentials, and adventure gadgets with research-based comparison guides for active explorers.',
      keywords: 'outdoor gear, adventure gadgets, travel gear, camping equipment, active gear'
    },
    'pet-tech': {
      title: 'Pet Tech & Smart Pet Gear 2026 | Guides & Comparisons',
      description: 'Discover smart pet cameras, automatic feeders, and grooming vacuums with practical buying notes for pet owners.',
      keywords: 'pet tech, smart pet gear, dog camera, smart feeder, automatic litter box'
    },
    'travel-tech': {
      title: 'Best Travel & Digital Nomad Tech 2026 | Buying Guides',
      description: 'Find travel backpacks, high-speed power banks, and portable gear with research-based notes for productive travelers.',
      keywords: 'travel tech, digital nomad gear, travel backpack, portable power bank, tech organizer'
    },
    'desk-toys-novelty-gifts': {
      title: 'Desk Toys & Novelty Gifts 2026 | Buying Notes',
      description: 'Discover the coolest desk toys, optical prisms, levitating lights, and novelty gifts for your workspace. Enhance your office aesthetics and boost focus.',
      keywords: 'desk toys, novelty gifts, cool desk accessories, levitating lamp, fidget toys, office gadgets'
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
          url: '/default-thumbnail.png',
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
    : products.filter(p => p.tags.category.toLowerCase().replace(/\s+/g, '-') === category);

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
    : category === 'outdoor-adventure' 
      ? 'Outdoor & Adventure' 
      : category === 'pet-tech'
        ? 'Pet Tech & Smart Pet Gear'
        : category === 'travel-tech'
          ? 'Travel & Digital Nomad Tech'
          : category === 'desk-toys-novelty-gifts'
            ? 'Desk Toys & Novelty Gifts'
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
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Products</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{baseProducts.length}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Filters</div>
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
              initialCategory={category === 'all' ? null : availableCategories.find(c => c.toLowerCase().replace(/\s+/g, '-') === category) || null}
            />
          </aside>

          <div className="space-y-8">
            <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Featured picks</p>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Best starting points in this category</h2>
                </div>
                  <Link href="/gift-guides/" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Browse Gift Guides
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Featured pick</div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-snug mb-2">{product.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{product.description}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">How to choose</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">What to look for before you click</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                  Compare the current retailer price with warranty, shipping, returns, and direct-brand support before choosing where to buy.
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                  Check the related guide pages in the same silo to understand comparisons, seasonal angles, and gift intent.
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
                  Use the filter sidebar to narrow by price bracket, then open the product page for a full vendor comparison.
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Frequently asked</p>
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
            <ProductGrid initialProducts={baseProducts} allProducts={products} category={category} />
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
