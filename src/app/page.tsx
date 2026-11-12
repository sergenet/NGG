import Link from '@/components/SiteLink';
import { ArrowRight, BriefcaseBusiness, ChefHat, Compass, House, PawPrint, Plane, Search, ShieldCheck, Sparkles, Users } from 'lucide-react';
import productsData from '@/lib/data/products.json';
import { Product } from '@/lib/schema';
import { DealCard } from '@/components/DealCard';
import { NewsletterInline } from '@/components/NewsletterInline';
import { isActiveRetailerUrl, sortByRecency } from '@/lib/utils';
import AdSlot from '@/components/AdSlot';

export const metadata = {
  title: 'Gift Ideas & Useful Gadgets, Thoughtfully Curated',
  description: 'Discover practical gifts, clever gadgets, and research-based buying guides for home, work, travel, pets, and everyday life.',
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
  const newArrivals = sortByRecency(
    products.filter((product) => product.vendors.some((vendor) => vendor.isPrimary && isActiveRetailerUrl(vendor.url))),
  ).slice(0, 4);
  const featured = products
    .filter((product) => product.vendors.some((vendor) => vendor.isPrimary && isActiveRetailerUrl(vendor.url)))
    .reverse()
    .slice(0, 6);
  const retailerBacked = products
    .filter((product) =>
      product.images[0] !== '/default-thumbnail.png'
      && product.vendors.some((vendor) => vendor.isPrimary && isActiveRetailerUrl(vendor.url)),
    )
    .sort((a, b) => Math.min(...a.vendors.map((vendor) => vendor.price)) - Math.min(...b.vendors.map((vendor) => vendor.price)))
    .slice(0, 8);

  return (
    <main id="main-content">
      <section className="hero-shell">
        <div className="site-container grid gap-12 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24">
          <div>
            <div className="eyebrow"><Sparkles className="h-4 w-4" /> Fresh finds, practical picks</div>
            <h1 className="display-title mt-6 max-w-4xl">Find the gift they’ll actually use.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">A research-led portal for useful gadgets, memorable gifts, and honest trade-offs—organized by person, purpose, and price.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop/all/" className="button-primary">Explore all picks <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/shop/new-arrivals/" className="button-secondary"><Sparkles className="h-4 w-4 text-amber-600" /> See new arrivals</Link>
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

      <section className="site-container pb-16" aria-labelledby="featured-heading">
        <div className="section-heading-row"><div><p className="eyebrow">Editor’s shortlist</p><h2 id="featured-heading" className="section-title">Standout gadgets right now</h2></div><Link href="/shop/all/" className="text-link">View the complete catalog <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured.map((product) => <DealCard key={product.id} product={product} />)}</div>
      </section>

      <section className="site-container pb-16" aria-labelledby="budget-heading">
        <div className="rounded-[2.5rem] bg-[#18231d] px-6 py-10 text-white md:px-10 md:py-14"><div className="section-heading-row"><div><p className="eyebrow eyebrow-dark">Ready to compare</p><h2 id="budget-heading" className="section-title text-white!">Available from active retailers</h2></div><Link href="/shop/all/" className="text-link text-amber-300!">Browse all researched picks <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{retailerBacked.map((product) => <DealCard key={product.id} product={product} />)}</div></div>
      </section>
      <section className="site-container pb-20"><NewsletterInline /></section>
    </main>
  );
}
