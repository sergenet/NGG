import { readFile } from 'node:fs/promises';

const products = JSON.parse(await readFile(new URL('../src/lib/data/products.json', import.meta.url), 'utf8'));
const articles = JSON.parse(await readFile(new URL('../src/lib/data/articles.json', import.meta.url), 'utf8'));
const partnership = await readFile(new URL('../src/app/work-with-us/page.tsx', import.meta.url), 'utf8');
const errors = [];

const publicClaimRules = [
  [/we (?:spent|tested|used|tried|reviewed).{0,40}\b(?:hours?|days?|weeks?|models?|products?)\b/i, 'unsupported first-hand testing'],
  [/\b(?:prevents?|cures?|treats?|eliminates?) (?:eye strain|pain|injury|disease)\b/i, 'unsupported health outcome'],
  [/\b(?:guaranteed results?|guaranteed recovery|complete peace of mind|without you lifting a finger)\b/i, 'guaranteed outcome'],
  [/\b(?:top-rated|resounding yes|belongs on your counter|worth your money)\b/i, 'unsupported ranking or verdict'],
  [/\b(?:rock-solid reliability|investment for a lifetime|keeps? your data safe from drops and spills)\b/i, 'unsupported durability or reliability'],
];

for (const article of articles.queue || []) {
  const text = `${article.title} ${article.body_intro}`;
  for (const [pattern, label] of publicClaimRules) if (pattern.test(text)) errors.push(`article "${article.title}": ${label}`);
}

for (const product of products) {
  const text = JSON.stringify(product);
  for (const [pattern, label] of publicClaimRules) if (pattern.test(text)) errors.push(`product "${product.slug}": ${label}`);
}

const unsupportedPartnershipClaims = [
  /40%\+ open rates/i,
  /ages 25-45/i,
  /60% male/i,
  /\borganic \(40%\)/i,
  /minimum 2-week testing/i,
  /independent reviews\. engaged audience\. real results\./i,
];
for (const pattern of unsupportedPartnershipClaims) if (pattern.test(partnership)) errors.push(`work-with-us: forbidden legacy claim ${pattern}`);

const serializedCatalog = JSON.stringify({ products, articles });
if (/sergenet05-20/i.test(serializedCatalog)) errors.push('catalog/editorial data contains the closed Amazon Store ID');
if (/\bafter testing\b|\bwe tested\b|\bwe spent 100\+ hours\b/i.test(serializedCatalog)) errors.push('catalog/editorial data contains an undocumented hands-on claim');

if (errors.length) {
  console.error('Truthmode validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Truthmode validation passed: ${articles.queue?.length || 0} guides, ${products.length} products, and partnership claims checked.`);
