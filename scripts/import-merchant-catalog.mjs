// Imports real products from the public product feeds of the Awin merchants this
// site is already approved for, and writes them into the catalog behind Awin
// deep links.
//
// Why a feed and not a scraper of hand-picked pages: every imported product has
// to be something a reader can buy, at a price the merchant actually publishes,
// pointing at a page that exists. The merchant's own product feed is the only
// source where all three are true at once.
//
// What this deliberately does NOT do: invent editorial. Imported products carry
// the merchant's own description and feature bullets, their real variants,
// prices and images. They get no `editorial` notes and no `pros`/`cons` lines,
// because those are meant to be judgement about a product a person looked at.
//
// Usage:
//   node scripts/import-merchant-catalog.mjs --dry-run
//   node scripts/import-merchant-catalog.mjs --merchant traverseon --limit 60
//   node scripts/import-merchant-catalog.mjs --write
//
// Exit codes: 0 = imported (or dry-ran) cleanly, 1 = a feed could not be read.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const CATALOG = 'src/lib/data/products.json';
const AFFILIATE_ID = '2913559';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const WRITE = flag('write');
const DRY = flag('dry-run') || !WRITE;
const TOTAL_LIMIT = Number(option('limit', 200));
const ONLY = option('merchant', '');

/**
 * How many products each category may gain. A single merchant can supply
 * hundreds of camping SKUs, and importing them all would turn a gift catalog
 * into a camping store — and fill it with near-duplicates, which is the exact
 * pattern Google already refuses to index. Quotas keep the mix deliberate.
 */
const CATEGORY_QUOTA = {
  'Outdoor Adventure': 55,
  Kitchen: 55,
  'Travel Tech': 30,
  'Home Office': 20,
  'Home Decor': 20,
  'Pet Tech': 20,
};

/** Variants of the same thing (four car heaters, six sleeping bags) are near-duplicate pages. */
const CLUSTER_CAP = 2;

/**
 * Merchants we hold an approved Awin relationship with, and the Awin merchant
 * ID each storefront maps to. `types` maps the store's own product_type to one
 * of this site's categories; anything unmapped is skipped rather than guessed.
 */
const MERCHANTS = [
  {
    key: 'traverseon',
    brand: 'Traverseon',
    origin: 'https://traverseon.com',
    awinMid: '124816',
    idPrefix: 'TR',
    types: {
      'Camping Gears': 'Outdoor Adventure',
      'Camping Shelter': 'Outdoor Adventure',
      'Camping Cooking': 'Outdoor Adventure',
      'Camping Daily': 'Outdoor Adventure',
      'Fishing Gear': 'Outdoor Adventure',
      'Outdoor Pet': 'Pet Tech',
      roadtrip: 'Travel Tech',
      winter: 'Outdoor Adventure',
      'cold season': 'Outdoor Adventure',
    },
    // Types with no mapping still get a keyword pass, because the store leaves
    // product_type blank on a chunk of its catalog.
    keywordRules: [
      [/heater|defrost|road ?trip|car (?:fan|cooler)|12v/i, 'Travel Tech'],
      [/camp|tent|sleeping|hammock|lantern|stove|cooler|hiking|trail|fishing|rod|reel|survival|first aid/i, 'Outdoor Adventure'],
      [/pet|dog|cat |leash|harness|groom/i, 'Pet Tech'],
      [/lamp|light|decor|string/i, 'Home Decor'],
    ],
  },
  {
    key: 'dealgenius',
    brand: 'DealGenius',
    origin: 'https://www.dealgenius.com',
    awinMid: '122504',
    idPrefix: 'DG',
    types: {},
    keywordRules: [
      [/scale|frother|opener|chopper|slicer|grill|kitchen|bottle|jar|blender|washer|knife|cutting/i, 'Kitchen'],
      [/light|string|solar|lamp|decor|art/i, 'Home Decor'],
      [/organizer|storage|desk|office/i, 'Home Office'],
    ],
  },
];

const RECIPIENTS = {
  'Outdoor Adventure': ['Outdoor Enthusiasts', 'Campers', 'Hikers'],
  'Travel Tech': ['Travelers', 'Road Trippers', 'Commuters'],
  'Pet Tech': ['Pet Owners', 'Outdoor Enthusiasts'],
  Kitchen: ['Home Cooks', 'New Homeowners'],
  'Home Decor': ['New Homeowners', 'Hosts'],
  'Home Office': ['Remote Workers', 'Students'],
};

const EXCLUDE = [
  /gift ?card/i,
  /warranty|protection plan|replacement (?:part|blade|seal)/i,
  /game bags?|meat bags?/i,
  /\bammo|ammunition|firearm|rifle scope|suppressor\b/i,
  /^\s*$/,
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');

const decodeEntities = (value) =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&#x27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&[a-z]+;/gi, ' ');

const plain = (html) =>
  decodeEntities(String(html || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

function firstSentences(text, max = 320) {
  if (text.length <= max) return text;
  const clipped = text.slice(0, max);
  const stop = Math.max(clipped.lastIndexOf('. '), clipped.lastIndexOf('! '), clipped.lastIndexOf('? '));
  return `${(stop > 80 ? clipped.slice(0, stop + 1) : clipped.replace(/[,;\s]+\S*$/, '')).trim()}`;
}

/**
 * Prefer the first real paragraph over the flattened body: Shopify bodies open
 * with an <h2> headline, and concatenating it into the description made every
 * page start with the merchant's marketing line twice.
 */
function describe(bodyHtml) {
  const paragraphs = [...String(bodyHtml || '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => plain(match[1]))
    .filter((text) => text.length >= 100);
  const source = paragraphs[0] || plain(bodyHtml);
  return firstSentences(source);
}

/** Truncate on a word boundary so slugs never end mid-word. */
function clampSlug(value, max = 78) {
  if (value.length <= max) return value.replace(/-+$/g, '');
  return value.slice(0, max).replace(/-[^-]*$/, '').replace(/-+$/g, '');
}

const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'from', 'new', 'set', 'pack', 'pcs', 'inch', 'cm', 'pro', 'plus']);
const clusterKey = (title) =>
  [...titleTokens(title)]
    .filter((token) => !STOPWORDS.has(token) && !/^\d+$/.test(token))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 3)
    .join('+');

function bullets(bodyHtml) {
  const items = [...String(bodyHtml || '').matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => plain(match[1]))
    .filter((text) => text.length >= 18 && text.length <= 180);
  return [...new Set(items)].slice(0, 5);
}

function priceBracket(price) {
  if (price < 50) return 'under-50';
  if (price < 100) return '50-100';
  if (price <= 250) return '100-250';
  return 'over-250';
}

function categoryFor(merchant, product) {
  const type = String(product.product_type || '').trim();
  if (type && merchant.types[type]) return merchant.types[type];
  const haystack = `${product.title} ${type} ${(product.tags || []).join(' ')}`;
  for (const [pattern, category] of merchant.keywordRules) {
    if (pattern.test(haystack)) return category;
  }
  return null;
}

function awinUrl(destination, awinMid) {
  return `https://www.awin1.com/cread.php?awinmid=${awinMid}&awinaffid=${AFFILIATE_ID}&clickref=&ued=${encodeURIComponent(destination)}`;
}

/** curl rather than fetch: two of these storefronts rate-limit Node's TLS fingerprint outright. */
function fetchFeed(origin, page) {
  const url = `${origin}/products.json?limit=250&page=${page}`;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let body;
    try {
      body = execFileSync(
        'curl',
        ['-sS', '--compressed', '--max-time', '45', '-A', USER_AGENT, url],
        { encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 },
      );
    } catch (error) {
      console.warn(`   curl failed (${error.status ?? 'error'}); retrying`);
      continue;
    }
    if (body.trim().startsWith('{')) {
      try {
        return JSON.parse(body).products || [];
      } catch {
        console.warn('   feed returned invalid JSON; retrying');
      }
    } else {
      console.warn(`   ${origin} answered "${body.trim().slice(0, 40)}"; backing off`);
    }
    execFileSync('sleep', [String(4 * (attempt + 1))]);
  }
  return null;
}

const catalog = JSON.parse(readFileSync(CATALOG, 'utf8'));
const existingSlugs = new Set(catalog.map((product) => product.slug));
const existingTitles = new Set(
  catalog.map((product) => product.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()),
);
let nextId = catalog.length + 1;

const titleTokens = (title) =>
  new Set(title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((word) => word.length > 2));

const existingTokenSets = [...existingTitles].map(titleTokens);
const jaccard = (tokens, other) => {
  let shared = 0;
  for (const token of tokens) if (other.has(token)) shared += 1;
  const union = tokens.size + other.size - shared;
  return union > 0 ? shared / union : 1;
};

// 0.72 against the hand-picked catalog (different brands rarely collide higher),
// 0.55 against products imported earlier in this run, where the same store sells
// six near-identical variants of the same item.
const tooSimilar = (title, threshold = 0.72) => {
  const tokens = titleTokens(title);
  if (!tokens.size) return true;
  return existingTokenSets.some((other) => jaccard(tokens, other) > threshold);
};

const imported = [];
const skipped = {};
const skip = (reason) => { skipped[reason] = (skipped[reason] || 0) + 1; };

for (const merchant of MERCHANTS) {
  if (ONLY && ONLY !== merchant.key) continue;
  console.log(`\n${merchant.brand} (${merchant.origin})`);
  const feed = [];
  for (let page = 1; page <= 4; page += 1) {
    const batch = fetchFeed(merchant.origin, page);
    if (!batch) {
      console.error(`FAILED  could not read ${merchant.origin} page ${page}`);
      process.exitCode = 1;
      break;
    }
    feed.push(...batch);
    if (batch.length < 250) break;
  }
  console.log(`  feed: ${feed.length} products`);

  for (const product of feed) {
    if (imported.length >= TOTAL_LIMIT) break;

    const title = plain(product.title);
    if (!title || EXCLUDE.some((pattern) => pattern.test(title))) { skip('excluded title'); continue; }

    const variants = (product.variants || []).filter((variant) => Number(variant.price) > 0 && variant.available !== false);
    if (!variants.length) { skip('no purchasable variant'); continue; }

    const prices = variants.map((variant) => Number(variant.price)).filter(Number.isFinite);
    const price = Math.min(...prices);
    if (!Number.isFinite(price) || price < 8 || price > 800) { skip('price out of range'); continue; }

    const description = describe(product.body_html);
    if (description.length < 120) { skip('description too thin'); continue; }

    const image = product.images?.[0]?.src;
    if (!image) { skip('no image'); continue; }

    const category = categoryFor(merchant, product);
    if (!category) { skip('no category match'); continue; }

    if (tooSimilar(title, 0.55)) { skip('near-duplicate of an existing product'); continue; }

    const categoryCount = imported.filter((entry) => entry.tags.category === category).length;
    if (categoryCount >= (CATEGORY_QUOTA[category] ?? 15)) { skip(`quota full: ${category}`); continue; }

    const cluster = clusterKey(title);
    const clusterCount = imported.filter((entry) => entry._cluster === cluster).length;
    if (clusterCount >= CLUSTER_CAP) { skip('cluster cap (near-identical variants)'); continue; }

    const slug = clampSlug(slugify(title));
    if (!slug || existingSlugs.has(slug)) { skip('slug collision'); continue; }

    const destination = `${merchant.origin}/products/${product.handle}`;
    const features = bullets(product.body_html);
    if (!features.length && variants.length > 1) {
      const options = (product.options || []).map((option) => option.name).filter(Boolean);
      if (options.length) features.push(`${variants.length} variants — ${options.join(', ')}`);
    }

    const record = {
      id: `P-AW-${merchant.idPrefix}-${String(nextId).padStart(3, '0')}`,
      slug,
      title,
      description,
      images: (product.images || []).slice(0, 3).map((entry) => entry.src).filter(Boolean),
      vendors: [{
        name: `${merchant.brand} (Awin)`,
        url: awinUrl(destination, merchant.awinMid),
        price,
        isPrimary: true,
      }],
      tags: {
        category,
        recipient: RECIPIENTS[category] || ['Gift Shoppers'],
        priceBracket: priceBracket(price),
      },
      brand: merchant.brand,
      ...(features.length ? { features } : {}),
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    existingSlugs.add(slug);
    existingTitles.add(title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim());
    existingTokenSets.push(titleTokens(title));
    nextId += 1;
    imported.push({ ...record, _cluster: cluster });
  }
  console.log(`  accepted: ${imported.length} so far`);
}

const byCategory = imported.reduce((acc, product) => {
  acc[product.tags.category] = (acc[product.tags.category] || 0) + 1;
  return acc;
}, {});
for (const product of imported) delete product._cluster;

console.log(`\nImport summary`);
console.log(`  accepted: ${imported.length}`);
console.log('  by category:', byCategory);
console.log('  skipped:', skipped);
console.log(`  catalog: ${catalog.length} -> ${catalog.length + imported.length}`);

if (!imported.length) {
  console.log('\nNothing to import.');
  process.exit(process.exitCode ?? 0);
}

if (DRY) {
  console.log('\nDry run. Sample:');
  for (const product of imported.slice(0, 8)) {
    console.log(`- ${product.title} | ${product.tags.category} | $${product.vendors[0].price} | ${product.slug}`);
    console.log(`  ${product.description.slice(0, 130)}...`);
  }
  console.log('\nRe-run with --write to append these to the catalog.');
  process.exit(process.exitCode ?? 0);
}

const merged = [...catalog, ...imported];
writeFileSync(CATALOG, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`\nWrote ${imported.length} products to ${CATALOG}. Run npm run check next.`);
