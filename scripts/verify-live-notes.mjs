#!/usr/bin/env node
/**
 * Verify every product page on the deployed site renders its own editorial notes.
 *
 * The rewrite work replaced template paragraphs with per-product notes. A build can
 * succeed and still ship pages where the notes are missing or belong to a different
 * product, so this checks the live HTML rather than the source data: HTTP 200, the
 * "Editorial notes" block present, and every heading from that product's own notes
 * found in the response body.
 *
 *   node scripts/verify-live-notes.mjs [--origin=https://newgiftsandgadgets.com]
 *
 * Exit code 0 only when all pages pass. Writes a per-page record to tmp/live-notes-crawl.log.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const originArg = process.argv.find((a) => a.startsWith('--origin='));
const ORIGIN = (originArg ? originArg.split('=')[1] : 'https://newgiftsandgadgets.com').replace(/\/$/, '');
const CONCURRENCY = Number(process.env.CRAWL_CONCURRENCY || 4);
const TIMEOUT_MS = Number(process.env.CRAWL_TIMEOUT_MS || 25000);
const LOG = join(ROOT, 'tmp', 'live-notes-crawl.log');

const products = JSON.parse(readFileSync(join(ROOT, 'src/lib/data/products.json'), 'utf8'));
const list = Array.isArray(products) ? products : Object.values(products);

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'",
  '&apos;': "'", '&nbsp;': ' ', '&#x2F;': '/', '&hellip;': '\u2026', '&mdash;': '\u2014',
  '&ndash;': '\u2013', '&rsquo;': '\u2019', '&lsquo;': '\u2018', '&ldquo;': '\u201c',
  '&rdquo;': '\u201d',
};

/** Next escapes text in the HTML stream; compare like for like. */
function decode(html) {
  return html
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&[a-z]+;|&#39;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
    .replace(/<!-- -->/g, '');
}

async function check(product) {
  const url = `${ORIGIN}/product/${product.slug}/`;
  const started = Date.now();
  let response;
  try {
    response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': 'newgiftsandgadgets-live-notes-crawl/1.0 (+verification)' },
    });
  } catch (error) {
    return { slug: product.slug, url, pass: false, reason: `request failed: ${error.message}`, ms: Date.now() - started };
  }
  const html = decode(await response.text());
  const ms = Date.now() - started;

  if (response.status !== 200) {
    return { slug: product.slug, url, pass: false, reason: `HTTP ${response.status} (final ${response.url})`, ms };
  }

  const expected = Array.isArray(product.editorial) ? product.editorial : [];
  if (expected.length === 0) {
    return { slug: product.slug, url, pass: true, note: 'no editorial notes in data', checked: 0, ms };
  }
  if (!html.includes('Editorial notes')) {
    return { slug: product.slug, url, pass: false, reason: 'no "Editorial notes" block', ms };
  }

  const missing = expected.filter((note) => {
    const heading = String(note.heading || '').trim();
    return heading && !html.includes(heading) ? true : false;
  }).map((note) => note.heading);

  if (missing.length) {
    return { slug: product.slug, url, pass: false, reason: `${missing.length}/${expected.length} headings missing: ${missing[0]}`, ms };
  }
  return { slug: product.slug, url, pass: true, checked: expected.length, ms };
}

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (true) {
        const index = next++;
        if (index >= items.length) return;
        results[index] = await worker(items[index]);
      }
    }),
  );
  return results;
}

console.log(`Crawling ${list.length} product pages at ${ORIGIN} (concurrency ${CONCURRENCY})`);
const results = await pool(list, CONCURRENCY, check);

const failed = results.filter((r) => !r.pass);
const lines = results.map((r) =>
  r.pass
    ? `OK   ${r.slug}  ${r.checked ?? 0} headings  ${r.ms}ms`
    : `FAIL ${r.slug}  ${r.reason}  ${r.ms}ms`,
);
mkdirSync(join(ROOT, 'tmp'), { recursive: true });
writeFileSync(LOG, `${lines.join('\n')}\n`, 'utf8');

console.log(`\nPages crawled: ${results.length}`);
console.log(`Passed:        ${results.length - failed.length}`);
console.log(`Failed:        ${failed.length}`);
console.log(`Log:           ${LOG}`);
if (failed.length) {
  console.log('\nFailures:');
  for (const f of failed) console.log(`  ${f.slug}\n    ${f.url}\n    ${f.reason}`);
  process.exit(1);
}
