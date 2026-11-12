/**
 * Reconciles Search Console's "Page indexing" exclusions against the live sitemap.
 *
 * Search Console has no API access on this project (no service account), so the
 * inputs are captured by hand from the property UI and committed under
 * data/search-console/<date>/:
 *
 *   sitemap.txt   every <loc> from https://newgiftsandgadgets.com/sitemap.xml
 *                 curl -s https://newgiftsandgadgets.com/sitemap.xml \
 *                   | grep -o "<loc>[^<]*</loc>" | sed 's/<[^>]*>//g'
 *   buckets.json  the URL list behind each exclusion reason (Page indexing →
 *                 click a reason → the "Examples" table)
 *
 * The point of the exercise: the dashboard totals ("81 indexed, 256 not indexed")
 * cannot be compared across releases on their own, because the sitemap size moves.
 * This reports the overlap instead, which is what a baseline needs.
 *
 * Usage: node scripts/search-console-coverage.mjs [snapshotDir]
 *        (defaults to the newest data/search-console/<date>/ directory)
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const site = 'https://newgiftsandgadgets.com';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshotRoot = join(repoRoot, 'data', 'search-console');

const snapshotDir = process.argv[2]
  ? resolve(process.argv[2])
  : join(snapshotRoot, readdirSync(snapshotRoot).filter((name) => /^\d{4}-\d{2}-\d{2}$/.test(name)).sort().pop() ?? '');

const sitemap = readFileSync(join(snapshotDir, 'sitemap.txt'), 'utf8')
  .trim()
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
const data = JSON.parse(readFileSync(join(snapshotDir, 'buckets.json'), 'utf8'));
const buckets = data.buckets;

const toPath = (url) => (url.startsWith('http') ? url.slice(site.length) || '/' : url);
const section = (path) => {
  const segment = path.split('/').filter(Boolean)[0] ?? '(root)';
  return '/' + segment;
};

// First bucket wins, in the order we want to report it.
const order = ['crawled-not-indexed', 'discovered-not-indexed', 'not-found-404', 'alternate-canonical'];
const status = new Map();
for (const bucket of order) {
  for (const raw of buckets[bucket] ?? []) {
    const path = toPath(raw);
    if (!status.has(path)) status.set(path, bucket);
  }
}

const label = snapshotDir.slice(repoRoot.length + 1).split(/[\\/]/).join('/');
console.log(`Snapshot: ${label} (captured ${data.capturedAt ?? 'unknown'})`);
console.log(`Captured buckets: ${Object.entries(buckets).map(([name, list]) => `${name}=${list.length}`).join(', ')}`);
console.log('"Page with redirect" is deliberately not captured: those URLs are not sitemap candidates.\n');

const inSitemap = sitemap.map(toPath);
const excluded = inSitemap.filter((path) => status.has(path));

console.log(`Sitemap URLs: ${sitemap.length}`);
console.log(`Sitemap URLs listed in an exclusion bucket: ${excluded.length}`);
console.log(`Sitemap URLs in no exclusion bucket (indexed, or never crawled): ${sitemap.length - excluded.length}\n`);

const byBucket = {};
for (const path of excluded) byBucket[status.get(path)] = (byBucket[status.get(path)] ?? 0) + 1;
console.log('Excluded sitemap URLs by reason:');
for (const [name, count] of Object.entries(byBucket)) console.log(`  ${name}: ${count}`);

console.log('\nBy section — sitemap URLs vs excluded:');
const sections = {};
for (const path of inSitemap) {
  const name = section(path);
  sections[name] ??= { total: 0, excluded: 0 };
  sections[name].total += 1;
  if (status.has(path)) sections[name].excluded += 1;
}
for (const [name, counts] of Object.entries(sections).sort((a, b) => b[1].total - a[1].total)) {
  const pct = ((counts.excluded / counts.total) * 100).toFixed(0);
  console.log(`  ${name.padEnd(22)} ${String(counts.total).padStart(3)} listed, ${String(counts.excluded).padStart(3)} excluded (${pct}%)`);
}

console.log('\nExcluded sitemap URLs, section by section:');
for (const [name, counts] of Object.entries(sections).sort((a, b) => b[1].excluded - a[1].excluded)) {
  const list = inSitemap.filter((path) => section(path) === name && status.has(path));
  if (!list.length) continue;
  console.log(`\n  ${name} (${list.length}/${counts.total} excluded)`);
  for (const path of list) console.log(`    ${path}  [${status.get(path)}]`);
}

const stale = [...status.keys()].filter((path) => !inSitemap.includes(path));
console.log(`\nListed pages no longer in the sitemap: ${stale.length} (old URLs, variants, assets — they clear as Google recrawls)`);
