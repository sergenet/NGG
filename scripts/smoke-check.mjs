#!/usr/bin/env node
/**
 * Post-deploy smoke check.
 *
 * An FTP release can report success while the site is broken: a bad .htaccess
 * directive 500s every page, a missing file leaves a 404 behind a schema
 * reference, a CSP change silently blocks a third-party widget, and a stale
 * deploy leaves the sitemap disagreeing with the build. These checks cover the
 * failures this project actually shipped.
 *
 * Usage:
 *   node scripts/smoke-check.mjs           # fast pass
 *   node scripts/smoke-check.mjs --full    # also fetch every sitemap page body
 *
 * Exits 0 when everything passes, 1 otherwise.
 */
import { readFile } from 'node:fs/promises';

const ORIGIN = process.env.SMOKE_ORIGIN ?? 'https://newgiftsandgadgets.com';
const CONCURRENCY = 8;
const WANT_FULL = process.argv.includes('--full');

const failures = [];
const passed = [];

function check(ok, message) {
  if (ok) passed.push(message);
  else failures.push(message);
}

async function request(path, { method = 'GET' } = {}) {
  const res = await fetch(ORIGIN + path, { method, redirect: 'manual' });
  const body = method === 'GET' && res.status === 200 ? await res.text() : '';
  return { status: res.status, location: res.headers.get('location'), headers: res.headers, body };
}

async function pool(items, worker) {
  let cursor = 0;
  const run = async () => {
    while (cursor < items.length) await worker(items[cursor++]);
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, run));
}

const canonicalOf = (html) => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null;

// 1. Every page a visitor is expected to reach answers 200.
const REQUIRED = [
  '/', '/shop/all/', '/gift-guides/', '/brands/', '/about/', '/contact/', '/admin/',
  '/sitemap.xml', '/rss.xml', '/robots.txt', '/ads.txt', '/assets/images/ngg-logo.png',
];
await pool(REQUIRED, async (path) => {
  const { status } = await request(path, { method: 'HEAD' });
  check(status === 200, `${path} answered ${status}, expected 200`);
});

// 2. Unknown paths must 404 rather than render the app with a 200.
{
  const { status } = await request('/this-page-does-not-exist-smoke-check/');
  check(status === 404, `/this-page-does-not-exist-smoke-check/ answered ${status}, expected 404`);
}

// 3. Legacy roots and slashless URLs redirect, never 403 or 200.
const REDIRECTS = {
  '/home-office/': '/shop/home-office/',
  '/kitchen/': '/shop/kitchen/',
  '/smart-home/': '/shop/smart-home/',
  '/gifts/': '/shop/all/',
  '/shop/': '/shop/all/',
  '/product/': '/shop/all/',
  '/shop/all': '/shop/all/',
  '/about': '/about/',
};
await pool(Object.entries(REDIRECTS), async ([from, to]) => {
  const { status, location } = await request(from, { method: 'HEAD' });
  const ok = status === 301 && (location ?? '').replace(ORIGIN, '').endsWith(to);
  check(ok, `${from} answered ${status} -> ${location}, expected 301 -> ${to}`);
});

// 4. The deployed sitemap must match the build and every URL must resolve.
let sitemapLocs = [];
{
  const { status, body } = await request('/sitemap.xml');
  check(status === 200, `/sitemap.xml answered ${status}`);
  sitemapLocs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check(sitemapLocs.length > 0, 'sitemap.xml contains no <loc> entries');

  try {
    const local = await readFile(new URL('../out/sitemap.xml', import.meta.url), 'utf8');
    const localCount = (local.match(/<loc>/g) ?? []).length;
    check(
      localCount === sitemapLocs.length,
      `sitemap has ${sitemapLocs.length} URLs but the build produced ${localCount} (stale deploy?)`,
    );
  } catch {
    passed.push('local out/sitemap.xml absent; skipped build/release parity');
  }

  const broken = [];
  await pool(sitemapLocs, async (loc) => {
    const { status } = await request(loc.replace(ORIGIN, ''), { method: 'HEAD' });
    if (status !== 200) broken.push(`${loc} -> ${status}`);
  });
  check(broken.length === 0, `sitemap URLs not returning 200: ${broken.slice(0, 5).join(', ')}`);
}

// 5. Canonicals must point at the URL being served, or Google consolidates wrongly.
{
  const sample = WANT_FULL ? sitemapLocs : sitemapLocs.filter((_, i) => i % 9 === 0);
  const wrong = [];
  await pool(sample, async (loc) => {
    const { body } = await request(loc.replace(ORIGIN, ''));
    const canonical = canonicalOf(body);
    if (canonical !== loc) wrong.push(`${loc} claims ${canonical}`);
  });
  check(wrong.length === 0, `canonical mismatch: ${wrong.slice(0, 3).join('; ')}`);
  passed.push(`checked canonicals on ${sample.length} of ${sitemapLocs.length} pages`);
}

// 6. Security and caching headers that took real incidents to get right.
{
  const home = await request('/');
  const csp = home.headers.get('content-security-policy') ?? '';
  check(csp.includes('https://www.recaptcha.net'), 'CSP is missing https://www.recaptcha.net (newsletter reCAPTCHA)');
  check(/strict-transport-security/i.test([...home.headers.keys()].join(',')), 'HSTS header missing');

  const asset = home.body.match(/\/_next\/static\/[^"']+\.js/)?.[0];
  check(Boolean(asset), 'homepage references no /_next/static script');
  if (asset) {
    const head = await request(asset, { method: 'HEAD' });
    const cache = head.headers.get('cache-control') ?? '';
    check(cache.includes('immutable'), `${asset} cache-control is "${cache || 'absent'}", expected immutable`);
  }
}

// 7. robots.txt must advertise only the XML sitemap.
{
  const { body } = await request('/robots.txt');
  check(body.includes('Sitemap: https://newgiftsandgadgets.com/sitemap.xml'), 'robots.txt does not advertise sitemap.xml');
  check(!body.includes('rss.xml'), 'robots.txt still advertises the RSS feed as a sitemap');
}

// 8. The 404 document must not carry contradictory robots directives.
{
  const { body } = await request('/404.html');
  const tags = body.match(/<meta name="robots"/g) ?? [];
  check(tags.length === 1, `/404.html has ${tags.length} robots meta tags, expected 1`);
}

// 9. The control room must refuse anonymous data requests.
{
  const session = await request('/control-room/api.php?action=session');
  check(session.status === 200 && session.body.includes('"authenticated":false'), 'control room session endpoint did not report an anonymous visitor');
  const summary = await request('/control-room/api.php?action=summary&days=1');
  check(summary.status === 401, `control room summary answered ${summary.status} without a session, expected 401`);
}

// Report.
if (failures.length) {
  console.error(`\nSmoke check FAILED: ${failures.length} of ${failures.length + passed.length} checks\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}
console.log(`Smoke check passed: ${passed.length} checks against ${ORIGIN}`);
