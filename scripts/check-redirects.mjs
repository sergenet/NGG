#!/usr/bin/env node
/**
 * check-redirects.mjs — verifies the legacy /product/ redirects in .htaccess.
 *
 * Offline (default): every rule targets a page that exists in out/.
 * --live: every legacy URL (with and without the trailing slash) answers 301 to
 * its target, and every target answers 200. Run after deploying.
 */
import { readFileSync, existsSync } from 'node:fs';

const LIVE = process.argv.includes('--live');
const ORIGIN = 'https://newgiftsandgadgets.com';
const HTACCESS = existsSync('out/.htaccess') ? 'out/.htaccess' : 'public/.htaccess';

const rules = readFileSync(HTACCESS, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.match(/^RedirectMatch 301 \^\/product\/([a-z0-9-]+)\/\?\$ (\S+)$/))
  .filter(Boolean)
  .map((m) => ({ slug: m[1], to: m[2] }));

if (rules.length === 0) {
  console.error(`No legacy product redirects found in ${HTACCESS}`);
  process.exit(1);
}

const failures = [];
const targets = new Set(rules.map((r) => r.to));

for (const { slug, to } of rules) {
  if (!to.endsWith('/')) failures.push(`${slug}: target ${to} has no trailing slash`);
  if (!existsSync(`out${to}index.html`)) failures.push(`${slug}: target ${to} is not in the build`);
}

if (!LIVE) {
  console.log(`${rules.length} legacy product rules, ${targets.size} distinct targets, all present in out/`);
} else {
  for (const path of targets) {
    const res = await fetch(ORIGIN + path, { redirect: 'manual' });
    if (res.status !== 200) failures.push(`target ${path} answered ${res.status}`);
  }
  for (const { slug, to } of rules) {
    for (const variant of [`/product/${slug}`, `/product/${slug}/`]) {
      const res = await fetch(ORIGIN + variant, { redirect: 'manual' });
      const location = res.headers.get('location') ?? '';
      const landed = location.startsWith('http') ? new URL(location).pathname : location;
      if (res.status !== 301) failures.push(`${variant} answered ${res.status}, expected 301`);
      else if (landed !== to) failures.push(`${variant} -> ${landed}, expected ${to}`);
    }
  }
  console.log(`${rules.length} rules, ${targets.size} targets, ${rules.length * 2} URL variants checked against ${ORIGIN}`);
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}
console.log('OK');
