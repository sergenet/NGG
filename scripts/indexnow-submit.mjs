// Tells IndexNow-participating search engines (Bing, Yandex, Seznam, Naver)
// that the URLs in the sitemap exist and have changed.
//
// What this is for: Google decides its own crawl pace and ignores IndexNow
// entirely, so this does nothing for Google indexing. What it does is remove the
// "wait to be discovered" delay everywhere else, which is the fastest legitimate
// submission channel available without an account, an API key or a paid service.
//
// The key file must already be live on the host: the engines fetch it to prove
// this script speaks for the domain. deploy-zip.py uploads it with the build and
// runs this afterwards.
//
// Usage:
//   node scripts/indexnow-submit.mjs --dry-run
//   node scripts/indexnow-submit.mjs               # submit the live sitemap
//   node scripts/indexnow-submit.mjs --local       # use out/sitemap.xml (testing)
//
// Exit codes: 0 = accepted, 1 = key not live or submission rejected.

import { readFileSync, readdirSync } from 'node:fs';
import { basename } from 'node:path';

const HOST = 'newgiftsandgadgets.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH = 100;

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const LOCAL = args.includes('--local');

const keyFile = readdirSync('public').find((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (!keyFile) {
  console.error('No IndexNow key file in public/. Expected a 32-character hex .txt file.');
  process.exit(1);
}
const key = basename(keyFile, '.txt');
const keyLocation = `https://${HOST}/${keyFile}`;

const sitemapPath = LOCAL ? 'out/sitemap.xml' : 'public/sitemap.xml';
const sitemap = readFileSync(sitemapPath, 'utf8');
const urls = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
if (!urls.length) {
  console.error(`No URLs found in ${sitemapPath}.`);
  process.exit(1);
}

console.log(`IndexNow: ${urls.length} URLs from ${sitemapPath}, key ${key}.`);

if (!LOCAL && !DRY) {
  const check = await fetch(keyLocation, { signal: AbortSignal.timeout(15000) }).catch(() => null);
  const body = check ? (await check.text()).trim() : '';
  if (!check || check.status !== 200 || body !== key) {
    console.error(`Key file is not live at ${keyLocation} (status ${check?.status ?? 'no response'}). Deploy first.`);
    process.exit(1);
  }
}

if (DRY) {
  console.log(`Dry run. Would POST ${Math.ceil(urls.length / BATCH)} batch(es) to ${ENDPOINT}:`);
  console.log(JSON.stringify({ host: HOST, key, keyLocation, urlList: urls.slice(0, 3) }, null, 2));
  process.exit(0);
}

let failed = 0;
for (let index = 0; index < urls.length; index += BATCH) {
  const urlList = urls.slice(index, index + BATCH);
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key, keyLocation, urlList }),
      signal: AbortSignal.timeout(30000),
    });
    // 200 = accepted, 202 = accepted but key still being validated.
    const ok = response.status === 200 || response.status === 202;
    console.log(`  batch ${index / BATCH + 1}: HTTP ${response.status}${ok ? '' : ' (rejected)'}`);
    if (!ok) failed += 1;
  } catch (error) {
    console.log(`  batch ${index / BATCH + 1}: ${error.message}`);
    failed += 1;
  }
}

if (failed) {
  console.error(`IndexNow: ${failed} batch(es) failed. The build is live either way; sitemap discovery still applies.`);
  process.exit(1);
}
console.log(`IndexNow: submitted ${urls.length} URLs.`);
