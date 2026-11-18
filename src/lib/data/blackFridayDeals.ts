export interface VendorDeal {
  name: string;
  category: string;
  headline: string;
  offerDetails: string;
  promoCode?: string;
  discountText?: string;
  verifiedDate?: string;
  validThrough?: string;
  expiresLabel?: string;
  saleWindow: string;
  badge: string;
  badgeColor: string;
  shopHref: string;
  featuredProductId: string;
}

export const vendorsWithDeals: VendorDeal[] = [
  {
    name: 'Anthbot',
    category: 'Robotic Lawn Mowers & Yard Tech',
    headline: 'Up to $250 Off + Extra 10% With Code',
    offerDetails:
      'Save $250 direct on boundary-free LiDAR & RTK mowers (M5 at $549). Stack coupon code ABAFF10 for an additional 10% off (M9 PRO down to $1,139.05). Plus, $1 protective garage flash sale.',
    promoCode: 'ABAFF10',
    discountText: 'Extra 10% Off',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-07',
    expiresLabel: 'Expires Dec 07, 2026',
    saleWindow: 'Nov 12 – Dec 7, 2026',
    badge: 'Save $250 + 10% Extra',
    badgeColor: 'bg-red-600 text-white',
    shopHref: '/shop/all?brand=Anthbot',
    featuredProductId: 'P-AW-ANTHBOT-M9-PRO',
  },
  {
    name: 'Billion Dollar Beauty',
    category: 'Magnetic Makeup Systems & Beauty',
    headline: 'Up to 50% Off Sitewide & Bundles',
    offerDetails:
      'Take 50% off holiday bundle sets and save sitewide with coupon code BLACKFRIDAY. Customizable magnetic palette boxes, vegan travel brushes, and universal eyebrow kits.',
    promoCode: 'BLACKFRIDAY',
    discountText: '50% Off Bundles',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-05',
    expiresLabel: 'Expires Dec 05, 2026',
    saleWindow: 'Black Friday & Cyber Week 2026',
    badge: 'Up to 50% Off Sitewide',
    badgeColor: 'bg-pink-600 text-white',
    shopHref: '/shop/all?brand=Billion%20Dollar%20Beauty',
    featuredProductId: 'P-AW-BDB-BASICALLY-BRILLIANT',
  },
  {
    name: 'ROCKBROS',
    category: 'Cycling Gear & Outdoor Tech',
    headline: '10% Off Sitewide Coupon',
    offerDetails:
      'Save 10% on aerodynamic bike handlebar bags, top tube phone packs, and smart brake-sensing tail lights with coupon code WELCOME10 (or 5% with WELCOME5 / MINTY5).',
    promoCode: 'WELCOME10',
    discountText: '10% Off Sitewide',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-01',
    expiresLabel: 'Expires Dec 01, 2026',
    saleWindow: 'Through Dec 1, 2026',
    badge: '10% Off Sitewide',
    badgeColor: 'bg-emerald-600 text-white',
    shopHref: '/shop/all?brand=ROCKBROS',
    featuredProductId: 'P-AW-ROCKBROS-HANDLEBAR-BAG-2L',
  },
  {
    name: 'DealGenius',
    category: 'Home Gadgets & Everyday Tools',
    headline: 'Direct Clearance Up to 70% Off',
    offerDetails:
      'Massive clearance markdowns on kitchen electrics, rolling BBQ grill baskets, 4.2-gal portable mini washers, digital food scales, and 750 LED holiday lights.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Holiday Season 2026',
    saleWindow: 'Holiday Season 2026',
    badge: 'Up to 70% Off Clearance',
    badgeColor: 'bg-amber-600 text-white',
    shopHref: '/shop/all?brand=DealGenius',
    featuredProductId: 'P-AW-DG-ROLLING-GRILL-BASKET',
  },
  {
    name: 'Plunge Chill',
    category: 'Cold Plunge & Athletic Recovery',
    headline: 'Factory-Direct Cold Therapy Systems',
    offerDetails:
      'Commercial 1HP & 0.6HP indoor/outdoor water chillers paired with 120-gallon insulated immersion tubs. Real 36°F cold exposure without ice bag runs.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Holiday Season 2026',
    saleWindow: 'Holiday Special 2026',
    badge: 'Factory Direct Pricing',
    badgeColor: 'bg-cyan-600 text-white',
    shopHref: '/cold-plunge/',
    featuredProductId: 'P-AW-PLUNGE-CHILL-POD',
  },
  {
    name: 'PersonalHour',
    category: 'Home Studio Fitness & Pilates',
    headline: 'Studio-Quality Foldable Pilates Reformers',
    offerDetails:
      'Factory direct pricing on foldable wooden and aluminum home Pilates reformers (Janet Elite Plus, Nour Advanced, Nano Elite) with free sitting box and jumpboard packages.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Holiday Season 2026',
    saleWindow: 'Holiday Season 2026',
    badge: 'Direct Studio Pricing',
    badgeColor: 'bg-indigo-600 text-white',
    shopHref: '/shop/all?brand=PersonalHour',
    featuredProductId: 'P-AW-PERSONALHOUR-JANET-PLUS',
  },
  {
    name: 'Tornado',
    category: "Men's Luxury Chronographs & Automatic Watches",
    headline: 'Pilot & Diver Timepieces Under $300',
    offerDetails:
      'Skeleton automatic mechanical watches and high-precision chronograph watches with scratch-proof sapphire crystal and 100m water resistance at direct partner rates.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Holiday Season 2026',
    saleWindow: 'Holiday Season 2026',
    badge: 'Under $300 Luxury Spec',
    badgeColor: 'bg-slate-800 text-white',
    shopHref: '/shop/all?brand=Tornado',
    featuredProductId: 'P-AW-TORNADO-LUMINA-CHRONOSPHERE',
  },
  {
    name: 'GRABO',
    category: 'Heavy-Duty Power Tools & Lifters',
    headline: 'Smart Electric Vacuum Suction Lifters',
    offerDetails:
      'Heavy-duty electric suction cups for large tiles, glass panels, stone countertops, and drywall. Digital pressure sensors and 375+ lb load capacities at factory rates.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Black Friday 2026',
    saleWindow: 'Black Friday 2026',
    badge: 'Pro Contractor Direct',
    badgeColor: 'bg-orange-600 text-white',
    shopHref: '/shop/all?brand=GRABO',
    featuredProductId: 'P-AW-GRABO-PRO-20',
  },
  {
    name: 'SKILHUNT',
    category: 'Everyday Carry & Tactical Lighting',
    headline: 'Multi-Spectrum RGB & UV LED Flashlights',
    offerDetails:
      'Direct manufacturer discounts on MiX-7 Gen 2 (White, Red, Green, Blue, UV 365nm) and H04 RC magnetic rechargeable EDC lights and headlamps.',
    verifiedDate: 'Verified Active · Nov 2026',
    validThrough: '2026-12-31',
    expiresLabel: 'Black Friday 2026',
    saleWindow: 'Black Friday 2026',
    badge: 'Tactical EDC Deals',
    badgeColor: 'bg-emerald-700 text-white',
    shopHref: '/shop/all?brand=SKILHUNT',
    featuredProductId: 'P-AW-SKILHUNT-MIX7-GEN2',
  },
];
