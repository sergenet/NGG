import { readFile } from 'node:fs/promises';

const products = JSON.parse(await readFile(new URL('../src/lib/data/products.json', import.meta.url), 'utf8'));
const errors = [];
const ids = new Set();
const slugs = new Set();
const closedAmazonStoreId = 'sergenet05-20';
let suspendedAmazonOffers = 0;

const expectedBracket = (price) => {
  if (price < 50) return 'under-50';
  if (price < 100) return '50-100';
  if (price <= 250) return '100-250';
  return 'over-250';
};

for (const product of products) {
  if (!product.id || ids.has(product.id)) errors.push(`Duplicate or missing id: ${product.id}`);
  if (!product.slug || slugs.has(product.slug)) errors.push(`Duplicate or missing slug: ${product.slug}`);
  ids.add(product.id);
  slugs.add(product.slug);

  if (!product.title || !product.description) errors.push(`${product.slug}: missing title or description`);
  if (!product.brand?.trim()) errors.push(`${product.slug}: missing brand`);
  if (!Array.isArray(product.images) || !product.images[0]) errors.push(`${product.slug}: missing image`);
  if (!product.tags?.category) errors.push(`${product.slug}: missing category`);
  if (!Array.isArray(product.tags?.recipient) || !product.tags.recipient.length) errors.push(`${product.slug}: missing recipient audience`);
  const publicText = JSON.stringify({ description: product.description, features: product.features, pros: product.pros, cons: product.cons });
  if (/commission|publisher|set cookies|drive clicks|high-click|move deeper into the funnel|offer stack/i.test(publicText)) {
    errors.push(`${product.slug}: contains publisher-facing or conversion-manipulation language`);
  }
  if (product.setupTips?.some((tip) => tip === 'Follow manufacturer instructions')) errors.push(`${product.slug}: generic setup filler`);
  if (product.whoShouldSkip?.length === 1 && product.whoShouldSkip[0] === 'Budget shoppers') errors.push(`${product.slug}: generic skip filler`);

  const usable = (product.vendors || []).filter((vendor) => /^https:\/\//.test(vendor.url || ''));

  // A product with no purchasable link is a dead end for the reader: the page
  // renders "retailer links are being updated" and the schema points at a price
  // nobody can pay. Every product must resolve to a retailer an editor verified.
  const purchasable = (product.vendors || []).some((vendor) => {
    if (!/^https:\/\//.test(vendor.url || '')) return false;
    try {
      const host = new URL(vendor.url).hostname.toLowerCase();
      return !(host.includes('amazon.') || host === 'amzn.to');
    } catch {
      return false;
    }
  });
  if (!purchasable) {
    errors.push(`${product.slug}: no purchasable retailer link — remove the product or point it at a real storefront`);
  }

  for (const vendor of product.vendors || []) {
    const isAmazon = /amazon/i.test(vendor.name || '') || /amazon\.|amzn\.to/i.test(vendor.url || '');
    if (!isAmazon) continue;
    suspendedAmazonOffers += 1;
    if (vendor.url) errors.push(`${product.slug}: Amazon offer must remain disabled while the Associates account is closed`);
  }

  if (JSON.stringify(product).includes(closedAmazonStoreId)) errors.push(`${product.slug}: contains closed Amazon Store ID`);

  const recordedPrices = (product.vendors || []).map((vendor) => vendor.price).filter(Number.isFinite);
  const price = Math.min(...recordedPrices);
  if (Number.isFinite(price) && product.tags.priceBracket !== expectedBracket(price)) {
    errors.push(`${product.slug}: price bracket ${product.tags.priceBracket} does not match $${price}`);
  }
}

if (errors.length) {
  console.error(`Catalog validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Catalog validation passed: ${products.length} products, ${slugs.size} unique routes, ${suspendedAmazonOffers} Amazon offers suspended; closed Store ID absent.`);
