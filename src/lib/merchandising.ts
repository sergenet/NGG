import { Product } from '@/lib/schema';

const FEATURED_CATEGORIES = ['Home Office', 'Smart Home', 'Kitchen', 'Outdoor & Adventure', 'Pet Tech', 'Travel Tech'];

function hasUsableVendorUrl(product: Product): boolean {
  return product.vendors.some((vendor) => vendor.url && vendor.url !== '#');
}

function scoreProduct(product: Product): number {
  const primaryVendor = product.vendors.find((vendor) => vendor.isPrimary);
  const directPartnerBoost = primaryVendor?.name.toLowerCase().includes('direct') ? 1000 : 0;
  const usableLinkBoost = hasUsableVendorUrl(product) ? 100 : 0;
  const recencyBoost = product.lastUpdated ? new Date(product.lastUpdated).getTime() / 1_000_000_000 : 0;
  return directPartnerBoost + usableLinkBoost + recencyBoost - (primaryVendor?.price ?? 0) / 100;
}

export function getWeeklyPicks(products: Product[]): Product[] {
  const picks: Product[] = [];

  for (const category of FEATURED_CATEGORIES) {
    const categoryPicks = products
      .filter((product) => product.tags.category === category)
      .sort((left, right) => scoreProduct(right) - scoreProduct(left));

    const winner = categoryPicks[0];
    if (winner && !picks.some((product) => product.id === winner.id)) {
      picks.push(winner);
    }
  }

  if (picks.length < 3) {
    const fallback = [...products]
      .sort((left, right) => scoreProduct(right) - scoreProduct(left))
      .filter((product) => !picks.some((picked) => picked.id === product.id));

    picks.push(...fallback.slice(0, 3 - picks.length));
  }

  return picks.slice(0, 3);
}
