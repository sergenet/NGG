import type { Metadata } from 'next';
import Link from '@/components/SiteLink';
import { ArrowRight, BriefcaseBusiness, ChefHat, Gift, Home, PawPrint, Plane, Users } from 'lucide-react';
import AdSlot, { AD_SLOT_FOOTER } from '@/components/AdSlot';

export const metadata: Metadata = {
  title: 'Gift Guides by Person, Interest, and Budget',
  description: 'Find practical gift ideas for remote workers, home cooks, new homeowners, pet parents, travelers, and coworkers.',
  alternates: { canonical: '/gift-guides/' },
  openGraph: { images: ['/social/gift-guides.png'] },
  twitter: { card: 'summary_large_image', images: ['/social/gift-guides.png'] },
};

const guides = [
  { icon: BriefcaseBusiness, title: 'Gifts for remote workers', copy: 'Desk, comfort, call-quality, and portable-work upgrades.', href: '/gifts/remote-workers/', tone: 'bg-[#c7d8c0]' },
  { icon: ChefHat, title: 'Gifts for home cooks', copy: 'Useful kitchen upgrades chosen around repeat use and cleanup.', href: '/gifts/home-cooks/', tone: 'bg-[#f4d98a]' },
  { icon: Home, title: 'Gifts for new homeowners', copy: 'Smart-home ideas with ecosystem and privacy considerations.', href: '/gifts/new-homeowners/', tone: 'bg-[#cbdff2]' },
  { icon: PawPrint, title: 'Gifts for pet parents', copy: 'Care, grooming, and check-in tools for pets and their people.', href: '/gifts/pet-parents/', tone: 'bg-[#f7b7a8]' },
  { icon: Plane, title: 'Gifts for travelers', copy: 'Portable power, bags, and practical gear for smoother trips.', href: '/gifts/travelers/', tone: 'bg-[#d8ceeb]' },
  { icon: Users, title: 'Gifts for coworkers', copy: 'Approachable desk finds for exchanges, thanks, and team gifts.', href: '/gifts/coworkers/', tone: 'bg-[#e8d8c4]' },
];

export default function GiftGuidesPage() {
  return (
    <main id="main-content" className="site-container py-16 md:py-24">
      <div className="max-w-4xl">
        <p className="eyebrow"><Gift className="h-4 w-4" /> Gift paths</p>
        <h1 className="display-title mt-6 text-[clamp(3.2rem,7vw,6rem)]">Start with the person, not the product.</h1>
        <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-600">The best gift is shaped by what they do, what frustrates them, what they already own, and how much space or setup they can tolerate. Choose a person below, then compare the shortlist.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {guides.map(({ icon: Icon, ...guide }) => (
          <Link key={guide.title} href={guide.href} className={`group rounded-[2rem] p-7 text-[#18231d] transition-transform hover:-translate-y-1 ${guide.tone}`}>
            <Icon className="h-8 w-8" />
            <h2 className="mt-12 text-3xl font-black">{guide.title}</h2>
            <p className="mt-3 leading-7 text-slate-700">{guide.copy}</p>
            <span className="mt-8 inline-flex items-center gap-2 font-black">Open shortlist <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
      <section className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-[2.25rem] border border-stone-200 bg-white p-8 md:p-10">
          <p className="eyebrow">How a guide gets built</p>
          <h2 className="section-title mt-5 text-4xl">Three steps, in this order</h2>
          <ol className="mt-8 space-y-6">
            <li>
              <h3 className="text-xl font-black">Start from a job, not a list</h3>
              <p className="mt-2 leading-8 text-slate-600">Every guide begins with a person and the thing they are trying to do: take calls from a shared room, cook without a dishwasher, keep a flat tidy with a dog in it. The occasion only changes the budget and the wrapping, not the shortlist.</p>
            </li>
            <li>
              <h3 className="text-xl font-black">Cut the catalogue down</h3>
              <p className="mt-2 leading-8 text-slate-600">A product only appears when its published specification supports the reason it is included, and when a current retailer listing exists. Everything else stays out, however well it photographs.</p>
            </li>
            <li>
              <h3 className="text-xl font-black">Name the trade-off</h3>
              <p className="mt-2 leading-8 text-slate-600">Each entry has to say what it is not good at. A gift that suits one desk and frustrates another is only useful if you know which one you are buying for.</p>
            </li>
          </ol>
        </div>

        <div className="space-y-8">
          <div className="rounded-[2.25rem] border border-stone-200 bg-white p-8">
            <p className="eyebrow">Choosing a path</p>
            <h2 className="mt-5 text-2xl font-black">Person, interest, or budget</h2>
            <p className="mt-4 leading-8 text-slate-600"><strong className="font-black text-slate-900">By person</strong> is the safest start when you know who the gift is for but not what they need. <strong className="font-black text-slate-900">By interest</strong> narrows faster if they have a hobby or a room you can name. <strong className="font-black text-slate-900">By budget</strong> is the honest one when the number is already fixed: see the banded guides below rather than stretching a pick that does not fit.</p>
          </div>
          <div className="rounded-[2.25rem] border border-stone-200 bg-white p-8">
            <p className="eyebrow">What these guides are not</p>
            <h2 className="mt-5 text-2xl font-black">Limits worth knowing</h2>
            <p className="mt-4 leading-8 text-slate-600">These are research-based shortlists, not hands-on test results, and no retailer pays for placement. We cannot check a recipient’s shelf depth or answer order questions — returns, warranties, and delivery belong to the retailer you buy from.</p>
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-[2.25rem] border border-stone-200 bg-white p-8 md:p-10">
        <p className="eyebrow">Frequently asked</p>
        <h2 className="section-title mt-5 text-4xl">Questions about the shortlists</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <details className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <summary className="cursor-pointer list-none font-black">How often are these updated?</summary>
            <p className="mt-3 text-sm leading-7 text-slate-600">Picks are revised when a retailer listing changes or a product stops being a sensible recommendation. Each product page shows the date its notes were last touched, so you can see how current the advice is before you buy.</p>
          </details>
          <details className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <summary className="cursor-pointer list-none font-black">There is no guide for my person. Now what?</summary>
            <p className="mt-3 text-sm leading-7 text-slate-600">Open the closest person guide and read the trade-offs rather than the titles. The reasoning transfers: a pick chosen for a small flat usually suits a student too, and the shop filters narrow the same catalogue by price if the shortlist is the wrong size.</p>
          </details>
          <details className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <summary className="cursor-pointer list-none font-black">Do brands pay to appear?</summary>
            <p className="mt-3 text-sm leading-7 text-slate-600">No. Retailer links are affiliate links, which means we may earn a commission if you buy, and that is disclosed on every product page. Inclusion is decided before commission is considered, and a product is removed when it stops earning its place.</p>
          </details>
        </div>
      </section>

      <AdSlot className="mt-16 rounded-[2rem] border border-stone-200 bg-white px-4 py-5" />
      <section className="mt-16 rounded-[2.25rem] bg-[#18231d] p-8 text-white md:flex md:items-center md:justify-between md:p-10">
        <div><p className="text-sm font-black uppercase tracking-[.2em] text-amber-300">Featured budget guide</p><h2 className="mt-3 text-3xl font-black">Remote-worker gifts under $50 that fit a real desk.</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">Compare desk fit, setup effort, and compatibility before choosing a seemingly simple accessory.</p></div>
        <Link href="/gifts/remote-workers-under-50/" className="button-secondary mt-6 shrink-0 md:ml-8 md:mt-0">Open the guide <ArrowRight className="h-4 w-4" /></Link>
      </section>
      <AdSlot slot={AD_SLOT_FOOTER} className="mt-16 rounded-[2rem] border border-stone-200 bg-white px-4 py-5" />
    </main>
  );
}
