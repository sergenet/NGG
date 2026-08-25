import { readFile, writeFile } from 'node:fs/promises';

const products = JSON.parse(await readFile(new URL('../src/lib/data/products.json', import.meta.url), 'utf8'));
const items = products.flatMap((product) => product.vendors
  .filter((vendor) => vendor.name.toLowerCase().includes('amazon'))
  .map((vendor) => ({ slug: product.slug, expected: product.title, url: vendor.url.replace(/\?.*$/, '') })));

const ignored = new Set(['with', 'wireless', 'smart', 'plus', 'latest', 'model', 'series', 'premium', 'professional']);
const tokens = (value) => [...new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 4 && !ignored.has(word)))];
const decode = (value) => value.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"').replace(/\s+/g, ' ').trim();

async function check(item) {
  try {
    const response = await fetch(item.url, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36', 'accept-language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(25000) });
    const html = await response.text();
    const title = decode(html.match(/<title>(.*?)<\/title>/is)?.[1] || '');
    const expectedTokens = tokens(item.expected);
    const hits = expectedTokens.filter((word) => title.toLowerCase().includes(word)).length;
    const match = expectedTokens.length ? Number((hits / expectedTokens.length).toFixed(2)) : 0;
    return { ...item, status: response.status, match, amazonTitle: title };
  } catch (error) {
    return { ...item, status: 0, match: 0, amazonTitle: error instanceof Error ? error.message : String(error) };
  }
}

const results = [];
for (let index = 0; index < items.length; index += 4) {
  results.push(...await Promise.all(items.slice(index, index + 4).map(check)));
}

await writeFile(new URL('../scratch/amazon-destination-audit.json', import.meta.url), `${JSON.stringify(results, null, 2)}\n`);
const review = results.filter((item) => item.status !== 200 || item.match < 0.34);
console.log(JSON.stringify({ checked: results.length, http200: results.filter((item) => item.status === 200).length, likelyCorrect: results.filter((item) => item.status === 200 && item.match >= 0.34).length, needsReview: review.length }, null, 2));
for (const item of review) console.log(`${item.status}\t${item.match}\t${item.slug}\t${item.expected}\t${item.amazonTitle}`);
