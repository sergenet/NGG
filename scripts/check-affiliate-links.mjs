// Follows every affiliate link in the catalog through its redirect chain and
// fails when the chain ends somewhere a reader cannot buy anything.
//
// Why this exists: a dead affiliate link does not return 404, so status-code
// checks miss it. Awin, for example, answers a click for a closed merchant with
// a perfectly healthy 200 page at awin1.com/closedMerchant.html. The only way to
// catch that is to follow the chain and look at where it actually lands.
//
// Storefronts increasingly sit behind Cloudflare, which answers a request that
// claims to be Chrome but arrives with a non-browser TLS fingerprint with 429.
// That is why this sends several honest-or-plain identities instead of one
// spoofed browser: a wall that blocks "Chrome" often lets the plain one through,
// and vice versa. Whichever answers without a bot-wall status is used.
//
// Usage:
//   node scripts/check-affiliate-links.mjs                # every catalog link
//   node scripts/check-affiliate-links.mjs <url> [<url>]  # ad-hoc links
//
// Exit codes: 0 = no dead links found, 1 = at least one link is dead.
// "Unverified" is not a pass: it means the merchant walled the script, so that
// link's status is unknown. A closed programme still reports dead, because
// Awin signals it at its own hop, before any merchant is contacted.

import { readFile } from 'node:fs/promises';

const TIMEOUT_MS = Number(process.env.AFFILIATE_TIMEOUT_MS || 20000);
const MAX_HOPS = 10;
const CONCURRENCY = Number(process.env.AFFILIATE_CONCURRENCY || 2);
const RETRY_DELAYS_MS = [4000, 10000];

// Tried in turn on each bot-wall answer. The browser identity goes last on
// purpose: a Chrome user-agent on a non-browser connection is the easiest
// combination for a wall to reject, so it is the fallback rather than the
// opening move.
const IDENTITIES = [
  { label: 'identifying', headers: { 'user-agent': 'NGG-LinkCheck/1.0 (+https://newgiftsandgadgets.com/contact/)' } },
  { label: 'plain', headers: {} },
  {
    label: 'browser',
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    },
  },
];
const MAX_ATTEMPTS = IDENTITIES.length;

const args = process.argv.slice(2);
const adHoc = args.filter((arg) => /^https?:\/\//.test(arg));

/** Landings that mean the merchant is not there any more. */
const CLOSED_PATTERNS = [
  /closed-?merchant/i,
  /merchant-?closed/i,
  /closedmerchant/i,
  /merchantno longer |merchant-not-found/i,
  /awin1\.com\/(?:closed|removed)/i,
];

/** Bot walls: the page is real, a script just cannot see it. Reported, not failed. */
const BOT_WALL_STATUSES = new Set([401, 403, 429, 503]);

async function loadCatalogUrls() {
  const products = JSON.parse(
    await readFile(new URL('../src/lib/data/products.json', import.meta.url), 'utf8'),
  );
  const urls = new Map();
  for (const product of products) {
    for (const vendor of product.vendors || []) {
      if (!/^https:\/\//.test(vendor.url || '')) continue;
      const entry = urls.get(vendor.url) || { url: vendor.url, products: [] };
      entry.products.push(product.slug);
      urls.set(vendor.url, entry);
    }
  }
  return [...urls.values()];
}

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

// A 429 or 403 says nothing about whether a link works, only that the wall did
// not like this request. Change identity and back off before recording anything
// as unverified, and give up only once every identity has had a turn.
async function requestWithRetry(url) {
  for (let attempt = 0; ; attempt += 1) {
    const identity = IDENTITIES[attempt % IDENTITIES.length];
    let response;
    let error;
    try {
      response = await fetch(url, {
        redirect: 'manual',
        headers: {
          ...identity.headers,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      await response.arrayBuffer().catch(() => {});
    } catch (caught) {
      error = caught;
    }

    const walled = response && BOT_WALL_STATUSES.has(response.status);
    if (!walled || attempt >= MAX_ATTEMPTS - 1) {
      return { response, error };
    }
    await sleep(RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)]);
  }
}

async function follow(startUrl) {
  const chain = [];
  let current = startUrl;

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    const { response, error } = await requestWithRetry(current);
    if (!response) {
      return { chain, status: 0, finalUrl: current, error: error?.name === 'TimeoutError' ? 'timed out' : String(error?.message || error) };
    }

    chain.push({ url: current, status: response.status });

    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      current = new URL(location, current).toString();
      continue;
    }
    return { chain, status: response.status, finalUrl: current };
  }

  return { chain, status: 0, finalUrl: current, error: `more than ${MAX_HOPS} redirects` };
}

function classify(result) {
  const visited = result.chain.map((hop) => hop.url);
  const closedHop = [...visited, result.finalUrl].find((url) => CLOSED_PATTERNS.some((pattern) => pattern.test(url)));
  if (closedHop) {
    return { verdict: 'dead', reason: 'landed on a closed-merchant page' };
  }

  if (result.error) return { verdict: 'dead', reason: result.error };
  if (result.status === 404 || result.status === 410) {
    return { verdict: 'dead', reason: `landed on HTTP ${result.status}` };
  }

  const finalHost = (() => {
    try { return new URL(result.finalUrl).hostname.toLowerCase(); } catch { return ''; }
  })();

  // The chain never left the affiliate network: the click was recorded but no
  // merchant page opened, which is what a removed programme looks like.
  if (finalHost.endsWith('awin1.com')) {
    if (BOT_WALL_STATUSES.has(result.status)) {
      return { verdict: 'unverified', reason: `stopped at awin1.com with HTTP ${result.status} (bot wall)` };
    }
    return { verdict: 'dead', reason: `never left awin1.com (HTTP ${result.status})` };
  }

  if (BOT_WALL_STATUSES.has(result.status)) {
    return { verdict: 'unverified', reason: `merchant returned HTTP ${result.status} (bot wall)` };
  }
  if (result.status >= 400) {
    return { verdict: 'dead', reason: `landed on HTTP ${result.status}` };
  }
  return { verdict: 'ok', reason: `HTTP ${result.status} at ${finalHost}` };
}

async function check(entry) {
  const result = await follow(entry.url);
  const { verdict, reason } = classify(result);
  return { ...entry, ...result, verdict, reason };
}

function label(entry) {
  const source = entry.products?.length ? entry.products.join(', ') : entry.url;
  return source;
}

const links = adHoc.length
  ? adHoc.map((url) => ({ url, products: [`(ad-hoc) ${url}`] }))
  : await loadCatalogUrls();

if (!links.length) {
  console.error('No affiliate links found to check.');
  process.exit(1);
}

const results = [];
for (let index = 0; index < links.length; index += CONCURRENCY) {
  const batch = links.slice(index, index + CONCURRENCY);
  results.push(...(await Promise.all(batch.map(check))));
}

const dead = results.filter((result) => result.verdict === 'dead');
const unverified = results.filter((result) => result.verdict === 'unverified');

for (const result of results) {
  const mark = result.verdict === 'ok' ? 'OK  ' : result.verdict === 'dead' ? 'DEAD' : '??  ';
  console.log(`${mark} ${label(result)}\n     ${result.url}\n     ${result.reason}${result.chain.length > 1 ? ` (${result.chain.length} hops)` : ''}`);
}

console.log(`\nChecked ${results.length} affiliate link(s): ${results.length - dead.length - unverified.length} ok, ${dead.length} dead, ${unverified.length} unverified (bot wall).`);

if (unverified.length) {
  console.log('Unverified links were not followed to a merchant page by a script; open them in a browser before trusting them.');
}

if (dead.length) {
  console.error(`\nDead affiliate link(s) found. Fix the vendor URL or remove the product:`);
  for (const result of dead) console.error(`- ${label(result)}: ${result.reason} (${result.url})`);
  // Set the code instead of calling process.exit: exiting while the fetch
  // pool is still closing aborts the process with a libuv assertion, which
  // replaces the meaningful exit 1 with a crash.
  process.exitCode = 1;
}
