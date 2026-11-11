import type { Metadata } from 'next';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact NewGiftsAndGadgets about corrections, product suggestions, partnerships, and privacy requests.',
  alternates: { canonical: '/contact/' },
};

const reasons = [
  {
    title: 'A correction',
    body: 'Send the page URL and a source we can check — the manufacturer page, the current listing, or the specification sheet. If the note is wrong we rewrite it rather than quietly deleting it, and the product page keeps its updated date so the change is visible.',
  },
  {
    title: 'A product worth covering',
    body: 'Tell us what the product replaces and who it is for. "It looks good" is not enough to include something; a clear job it does better than the obvious alternative is. We do not publish paid placements, so a suggestion is never an order.',
  },
  {
    title: 'Partnerships and press',
    body: 'Include the product, the audience you have in mind, the commercial arrangement, and your disclosure requirements. Affiliate relationships are disclosed on the pages they affect, and editorial conclusions are not for sale.',
  },
  {
    title: 'A privacy request',
    body: 'Ask for access, correction, or deletion of a newsletter subscription and we will action it. Requests are verified before anything is changed, and you can also unsubscribe from the link in any message.',
  },
  {
    title: 'An accessibility barrier',
    body: 'If a page is unusable with a screen reader, a keyboard, or increased text size, say which page and what happened. Those reports are treated as bugs rather than feedback.',
  },
];

export default function Page() {
  return (
    <main id="main-content" className="site-container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2.5rem] border border-stone-200 bg-white p-8 md:p-12">
          <p className="eyebrow">Contact</p>
          <h1 className="section-title mt-5">Questions, corrections, or a genuinely clever find?</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Email is the only channel — there is no phone line and no chat widget behind this page.
            One address reaches the person who writes the guides, which is also why replies come
            between other work rather than instantly.
          </p>
          <a href="mailto:contact@newgiftsandgadgets.com" className="button-primary mt-8">
            <Mail className="h-4 w-4" />
            contact@newgiftsandgadgets.com
          </a>
        </div>

        <section className="mt-10 rounded-[2.5rem] border border-stone-200 bg-white p-8 md:p-12">
          <h2 className="section-title text-3xl">What is worth writing in about</h2>
          <p className="mt-4 leading-8 text-slate-600">
            Each of these gets read and acted on. Including the page URL and the specific detail
            saves a round trip.
          </p>
          <div className="mt-8 space-y-6">
            {reasons.map((reason) => (
              <div key={reason.title} className="border-t border-stone-200 pt-6 first:border-0 first:pt-0">
                <h3 className="text-lg font-black">{reason.title}</h3>
                <p className="mt-2 leading-8 text-slate-600">{reason.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2.5rem] border border-stone-200 bg-white p-8 md:p-12">
          <h2 className="section-title text-3xl">What we cannot help with</h2>
          <p className="mt-4 leading-8 text-slate-600">
            Orders, delivery dates, warranty claims, and returns belong to the retailer you bought
            from, not to this site. We do not hold stock, cannot look up an order number, and have
            no leverage over a courier. The product page links to the retailers we compared, so the
            order confirmation email is the fastest route to support.
          </p>
          <p className="mt-4 leading-8 text-slate-600">
            We also cannot give personal shopping advice by email. A shortlist built around a real
            constraint — a budget, a desk, a person — is what the guides are for, and they answer
            the question faster than a reply would.
          </p>
        </section>
      </div>
    </main>
  );
}
