import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Editorial Policy', description: 'Research, review, correction, and commercial standards for NewGiftsAndGadgets.', alternates: { canonical: '/editorial-policy/' } };

const sections: [string, string][] = [
  ['Selection', 'We prioritize usefulness, giftability, product fit, meaningful differentiation, and sufficient public information to assess trade-offs. Commercial terms may affect which retailer button is prominent, but should not determine whether a product is recommended.'],
  ['Research and testing', 'Catalog pages are research-based unless a page explicitly identifies hands-on testing. Research may use manufacturer specifications, retailer information, manuals, and owner feedback; those sources can be incomplete or change. We do not describe a product as tested without documenting who tested it, for how long, under what conditions, and whether the sample was purchased, borrowed, or supplied.'],
  ['Sponsored content and samples', 'Paid placement, free or loaned samples, affiliate compensation, and other material relationships must be disclosed clearly near the affected content. A sponsor may review factual brand details, but may not require a positive conclusion, remove a material drawback, or receive an undisclosed ranking advantage.'],
  ['Prices and availability', 'Prices are catalog snapshots or broad price bands, not live quotes. Visitors should verify price, availability, warranty, shipping, subscriptions, and returns with the retailer or manufacturer.'],
  ['Corrections', 'Factual corrections are welcomed at contact@newgiftsandgadgets.com. Include the page URL and a reliable source. Material corrections are reviewed, applied when verified, and accompanied by an updated review date; significant reversals should be explained on the affected page.'],
  ['AI and automation', 'Automation may assist research, formatting, or catalog maintenance. Published recommendations remain subject to editorial review and must follow the same disclosure and accuracy standards.'],
];

export default function Page() { return <main id="main-content" className="site-container py-16"><article className="mx-auto max-w-3xl"><p className="eyebrow">Trust center</p><h1 className="section-title mt-5">Editorial policy</h1><p className="mt-5 text-xl leading-8 text-slate-600">The rules behind our recommendations, commercial content, and corrections.</p><div className="mt-12 space-y-10">{sections.map(([heading, body]) => <section key={heading}><h2 className="text-2xl font-black">{heading}</h2><p className="mt-3 leading-8 text-slate-600">{body}</p></section>)}</div></article></main>; }
