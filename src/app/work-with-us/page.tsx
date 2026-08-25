import type { Metadata } from 'next';
import { Briefcase, Mail, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Work With Us',
  description: 'Current partnership availability and editorial standards for NewGiftsAndGadgets.',
  alternates: { canonical: '/work-with-us/' },
};

const available = [
  'Direct-brand or retailer link consideration when the product is a genuine editorial fit',
  'Clearly labeled sponsored content proposals, reviewed case by case',
  'Future newsletter sponsorship inquiries, subject to verified list eligibility and current performance data',
];

const unavailable = [
  'Guaranteed placement, rankings, traffic, clicks, sales, or campaign results',
  'Hands-on review claims unless a documented product test is actually completed',
  'Published audience demographics, traffic mix, or newsletter open-rate claims without a current evidence report',
  'YouTube, TikTok, Instagram, or other social-production packages',
];

export default function WorkWithUsPage() {
  return <main id="main-content" className="site-container py-16 md:py-24">
    <div className="mx-auto max-w-4xl">
      <Breadcrumbs items={[{ label: 'Work With Us', href: '/work-with-us/' }]} />
      <header className="mt-10 max-w-3xl">
        <p className="eyebrow">Partnerships</p>
        <h1 className="display-title mt-5 text-[clamp(3rem,7vw,5.5rem)]">Clear terms before promotion.</h1>
        <p className="mt-7 text-xl leading-9 text-slate-600">NewGiftsAndGadgets is rebuilding its retailer and brand relationships after ending Amazon participation. We welcome relevant inquiries, but we do not currently publish a rate card or make unsupported audience and performance claims.</p>
      </header>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-7 md:p-9">
          <Briefcase className="h-7 w-7 text-[#bd4b34]" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-black">Currently open to discussion</h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-slate-600">{available.map(item => <li key={item}>{item}</li>)}</ul>
        </section>
        <section className="rounded-[2rem] border border-stone-200 bg-[#f7f3ec] p-7 md:p-9">
          <ShieldCheck className="h-7 w-7 text-[#3d6552]" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-black">Not currently offered or claimed</h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-slate-600">{unavailable.map(item => <li key={item}>{item}</li>)}</ul>
        </section>
      </div>
      <section className="mt-8 rounded-[2rem] bg-[#18231d] p-8 text-white md:p-10">
        <h2 className="text-2xl font-black">Editorial and disclosure boundary</h2>
        <p className="mt-4 max-w-3xl leading-8 text-slate-300">Payment may fund clearly labeled placement, but it does not purchase a positive conclusion or suppress a material drawback. Product samples, affiliate compensation, sponsorship, and other material relationships must be disclosed near the relevant content. Research-based content is not represented as hands-on testing.</p>
      </section>
      <section className="mt-12 text-center">
        <h2 className="text-2xl font-black">Send a specific proposal</h2>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">Include the product, intended audience, requested deliverable, compensation, sample terms, timing, and disclosure requirements. Availability and pricing will be confirmed in writing; no outcome is guaranteed.</p>
        <a href="mailto:contact@newgiftsandgadgets.com?subject=Partnership%20Inquiry" className="button-primary mt-7"><Mail className="h-4 w-4" />contact@newgiftsandgadgets.com</a>
      </section>
    </div>
  </main>;
}
