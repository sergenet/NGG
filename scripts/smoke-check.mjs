#!/usr/bin/env node
/**
 * Site smoke check.
 *
 * An FTP release can report success while the site is broken: a bad .htaccess
 * directive 500s every page, a missing file leaves a 404 behind a schema
 * reference, a CSP change silently blocks a third-party widget, and a stale
 * deploy leaves the sitemap disagreeing with the build. These checks cover the
 * failures this project actually shipped.
 *
 * Usage:
 *   node scripts/smoke-check.mjs           # live pass, fast
 *   node scripts/smoke-check.mjs --full    # also fetch every sitemap page body
 *   node scripts/smoke-check.mjs --local   # serve out/ and check the build only
 *
 * --local is the pre-commit gate: it catches a build that lost a page, a broken
 * canonical or a sitemap/content mismatch before it is ever uploaded. Checks
 * that depend on the web server (.htaccess redirects, security and caching
 * headers) or on the PHP control room are skipped in that mode.
 *
 * Exits 0 when everything passes, 1 otherwise.
 */
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const LOCAL = process.argv.includes('--local');
const WANT_FULL = process.argv.includes('--full');
const CONCURRENCY = 8;
const PORT = Number(process.env.SMOKE_PORT ?? 8137);
const OUT_DIR = fileURLToPath(new URL('../out/', import.meta.url));
const SITE = 'https://newgiftsandgadgets.com';

/** Sitemap entries are absolute; the checks run against whatever origin is in play. */
const pathOf = (url) => (url.startsWith(SITE) ? url.slice(SITE.length) || '/' : url);

const failures = [];
const passed = [];
let origin = process.env.SMOKE_ORIGIN ?? 'https://newgiftsandgadgets.com';

function check(ok, message) {
  if (ok) passed.push(message);
  else failures.push(message);
}

async function request(path, { method = 'GET' } = {}) {
  // One retry: the local static server can refuse a connection while it is
  // still warming up, and a transient socket error should not fail the gate.
  for (let attempt = 1; ; attempt += 1) {
    try {
      const res = await fetch(origin + path, { method, redirect: 'manual' });
      const body = method === 'GET' && res.status === 200 ? await res.text() : '';
      return { status: res.status, location: res.headers.get('location'), headers: res.headers, body };
    } catch (err) {
      if (attempt === 2) {
        const code = err?.cause?.code ?? err?.message ?? 'unknown error';
        throw new Error(`${method} ${path} could not be fetched (${code})`);
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
}

async function pool(items, worker) {
  let cursor = 0;
  const run = async () => {
    while (cursor < items.length) await worker(items[cursor++]);
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, run));
}

const canonicalOf = (html) => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null;

async function startLocalServer() {
  if (!existsSync(OUT_DIR)) {
    throw new Error('out/ does not exist — run npm run build first');
  }
  const child = spawn('python', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: OUT_DIR,
    stdio: 'ignore',
  });
  let exited = null;
  child.on('error', (err) => { exited = err; });
  child.on('exit', (code) => { exited = exited ?? new Error(`static server exited with ${code}`); });

  const localOrigin = `http://127.0.0.1:${PORT}`;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (exited) throw exited;
    try {
      const res = await fetch(`${localOrigin}/`, { method: 'HEAD' });
      if (res.status === 200) return { child, origin: localOrigin };
    } catch {
      // Server not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  child.kill();
  throw new Error(`static server did not answer on ${localOrigin} — is port ${PORT} free?`);
}

async function runChecks() {
  // 1. Every page a visitor is expected to reach answers 200.
  const REQUIRED = [
    '/', '/shop/all/', '/gift-guides/', '/brands/', '/about/', '/contact/', '/admin/',
    '/sitemap.xml', '/rss.xml', '/robots.txt', '/ads.txt', '/assets/images/ngg-logo.png',
  ];
  await pool(REQUIRED, async (path) => {
    const { status, body } = await request(path);
    check(status === 200, `${path} answered ${status}, expected 200`);
    // A missing index.html still answers 200 in --local, because the static
    // server falls back to a directory listing. That is not a page.
    check(!body.includes('Directory listing for'), `${path} served a directory listing, not a page`);
  });

  // 2. Unknown paths must 404 rather than render the app with a 200.
  {
    const { status } = await request('/this-page-does-not-exist-smoke-check/');
    check(status === 404, `/this-page-does-not-exist-smoke-check/ answered ${status}, expected 404`);
  }

  // 3. Legacy roots and slashless URLs redirect, never 403 or 200. Needs Apache.
  if (!LOCAL) {
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
      const ok = status === 301 && pathOf(location ?? '').endsWith(to);
      check(ok, `${from} answered ${status} -> ${location}, expected 301 -> ${to}`);
    });
  }

  // 4. Every sitemap URL must resolve, and the release must match the build.
  let sitemapLocs = [];
  {
    const { status, body } = await request('/sitemap.xml');
    check(status === 200, `/sitemap.xml answered ${status}`);
    sitemapLocs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    check(sitemapLocs.length > 0, 'sitemap.xml contains no <loc> entries');

    if (!LOCAL) {
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
    }

    const broken = [];
    await pool(sitemapLocs, async (loc) => {
      const { status } = await request(pathOf(loc), { method: 'HEAD' });
      if (status !== 200) broken.push(`${loc} -> ${status}`);
    });
    check(broken.length === 0, `sitemap URLs not returning 200: ${broken.slice(0, 5).join(', ')}`);
  }

  // 5. Canonicals must point at the URL being served, or Google consolidates wrongly.
  {
    const sample = WANT_FULL ? sitemapLocs : sitemapLocs.filter((_, i) => i % 9 === 0);
    const wrong = [];
    await pool(sample, async (loc) => {
      const { body } = await request(pathOf(loc));
      const canonical = canonicalOf(body);
      if (canonical !== loc) wrong.push(`${loc} claims ${canonical}`);
    });
    check(wrong.length === 0, `canonical mismatch: ${wrong.slice(0, 3).join('; ')}`);
    passed.push(`checked canonicals on ${sample.length} of ${sitemapLocs.length} pages`);
  }

  // 6. Security and caching headers that took real incidents to get right.
  if (!LOCAL) {
    const home = await request('/');
    const csp = home.headers.get('content-security-policy') ?? '';
    check(csp.includes('https://www.recaptcha.net'), 'CSP is missing https://www.recaptcha.net (newsletter reCAPTCHA)');
    check([...home.headers.keys()].includes('strict-transport-security'), 'HSTS header missing');

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

  // 9. The control room must refuse anonymous data requests. PHP, so live only.
  if (!LOCAL) {
    const session = await request('/control-room/api.php?action=session');
    check(session.status === 200 && session.body.includes('"authenticated":false'), 'control room session endpoint did not report an anonymous visitor');
    const summary = await request('/control-room/api.php?action=summary&days=1');
    check(summary.status === 401, `control room summary answered ${summary.status} without a session, expected 401`);
  }
}

let server = null;
try {
  if (LOCAL) {
    server = await startLocalServer();
    origin = server.origin;
  }
  await runChecks();
} catch (err) {
  failures.push(`could not run the checks: ${err instanceof Error ? err.message : String(err)}`);
} finally {
  if (server) {
    // Kill the static server and wait for it to close: exiting while libuv is
    // still tearing the child down trips an assertion on Windows.
    await new Promise((resolve) => {
      server.child.once('exit', resolve);
      server.child.kill();
      setTimeout(resolve, 2000);
    });
  }
}

const scope = LOCAL ? 'local build' : origin;
if (failures.length) {
  console.error(`\nSmoke check FAILED: ${failures.length} of ${failures.length + passed.length} checks (${scope})\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Smoke check passed: ${passed.length} checks (${scope})`);
}
