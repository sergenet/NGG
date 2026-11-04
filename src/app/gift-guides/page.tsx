import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, ChefHat, Gift, Home, PawPrint, Plane, Users } from 'lucide-react';

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
      <section className="mt-16 rounded-[2.25rem] bg-[#18231d] p-8 text-white md:flex md:items-center md:justify-between md:p-10">
        <div><p className="text-sm font-black uppercase tracking-[.2em] text-amber-300">Featured budget guide</p><h2 className="mt-3 text-3xl font-black">Remote-worker gifts under $50 that fit a real desk.</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">Compare desk fit, setup effort, and compatibility before choosing a seemingly simple accessory.</p></div>
        <Link href="/gifts/remote-workers-under-50/" className="button-secondary mt-6 shrink-0 md:ml-8 md:mt-0">Open the guide <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </main>
  );
}
