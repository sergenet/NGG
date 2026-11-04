// Checks every /shop/ collection page that the live sitemap advertises:
// title uniqueness, meta description, canonical, robots directive and H1.
// Run: node tools/shop-index-audit.mjs

const ORIGIN = 'https://newgiftsandgadgets.com';

const withTimeout = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(30000) });

function pick(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim().replace(/\s+/g, ' ') : null;
}

function decode(value) {
  return (value || '')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

const sitemap = await (await withTimeout(`${ORIGIN}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const shopUrls = urls.filter((u) => /\/shop\/[^/]+\/?$/.test(u));

console.log(`sitemap urls: ${urls.length}, /shop/ collections in sitemap: ${shopUrls.length}\n`);

const rows = [];
for (const url of shopUrls) {
  const response = await withTimeout(url);
  const html = await response.text();
  rows.push({
    url: url.replace(ORIGIN, ''),
    status: response.status,
    title: decode(pick(html, /<title>([\s\S]*?)<\/title>/i)),
    description: decode(pick(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i)),
    canonical: pick(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i),
    robots: pick(html, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i),
    h1: decode(pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i))?.replace(/<[^>]+>/g, ''),
  });
}

rows.sort((a, b) => a.url.localeCompare(b.url));
for (const row of rows) {
  console.log(`${row.status} ${row.url}`);
  console.log(`   title:   ${row.title}`);
  console.log(`   desc:    ${row.description ? row.description.slice(0, 90) + (row.description.length > 90 ? '…' : '') : '(MISSING)'}`);
  console.log(`   canon:   ${row.canonical}`);
  console.log(`   robots:  ${row.robots || '(none)'}`);
  console.log(`   h1:      ${row.h1}\n`);
}

const byTitle = new Map();
for (const row of rows) {
  const key = row.title || '(no title)';
  byTitle.set(key, [...(byTitle.get(key) || []), row.url]);
}
const collisions = [...byTitle.entries()].filter(([, list]) => list.length > 1);
console.log('--- duplicate titles ---');
if (!collisions.length) {
  console.log('none');
} else {
  for (const [title, list] of collisions) console.log(`${title}\n   ${list.join('\n   ')}`);
}

const missingDesc = rows.filter((r) => !r.description);
const badCanonical = rows.filter((r) => !r.canonical || !r.canonical.includes(r.url.replace(/\/$/, '')));
const noindex = rows.filter((r) => /noindex/i.test(r.robots || ''));
console.log('\n--- summary ---');
console.log(`pages: ${rows.length}`);
console.log(`missing description: ${missingDesc.length}${missingDesc.length ? ' -> ' + missingDesc.map((r) => r.url).join(', ') : ''}`);
console.log(`canonical mismatch: ${badCanonical.length}${badCanonical.length ? ' -> ' + badCanonical.map((r) => r.url).join(', ') : ''}`);
console.log(`noindex: ${noindex.length}${noindex.length ? ' -> ' + noindex.map((r) => r.url).join(', ') : ''}`);
