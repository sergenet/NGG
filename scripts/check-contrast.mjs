#!/usr/bin/env node
/**
 * check-contrast.mjs — measure real rendered text contrast across page types.
 *
 * Why this exists: colour is decided by the cascade, not by reading class names.
 * `text-slate-400` on a cream card and the same class on a slate-900 panel are
 * different contrast ratios, and a `dark:` variant that never fires changes
 * nothing. This walks the built export, resolves every text node's computed
 * colour and the background actually behind it, and reports WCAG AA failures.
 *
 * Usage:
 *   node scripts/check-contrast.mjs http://localhost:4321
 *   node scripts/check-contrast.mjs https://newgiftsandgadgets.com
 *
 * Exits 1 if anything fails. Decorative nodes (aria-hidden, no text) are skipped.
 */
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const base = (process.argv[2] || 'http://localhost:4321').replace(/\/$/, '');

const PAGES = [
  '/',
  '/shop/all/',
  '/shop/kitchen/',
  '/shop/new-arrivals/',
  '/brands/',
  '/contact/',
  '/gift-guides/',
  '/gift-guides/fathers-day-gadget-gifts/',
  '/home-office/essential-desk-upgrades/',
  '/gifts/video-call-gifts/',
  '/cold-plunge/',
  '/shop/outdoor-adventure/',
  '/outdoor-adventure/flashlights-and-headlamps-lumens-are-not-beam-distance/',
  '/home-office/desk-geometry-measure-before-you-buy-the-arm-or-the-desk/',
  '/product/plunge-chill-recovery-tub-system/',
  '/product/vivo-dual-monitor-desk-mount/',
];

const browserPath = CANDIDATES.find((p) => existsSync(p));
if (!browserPath) {
  console.error('No Chrome or Edge found. Set CHROME_PATH to a browser binary.');
  process.exit(1);
}

/** Runs in the page. Kept as a string so it survives serialisation cleanly. */
const audit = () => {
  const cv = document.createElement('canvas');
  cv.width = 1;
  cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const cache = new Map();

  const parse = (str) => {
    if (cache.has(str)) return cache.get(str);
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = str;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    const out = [d[0], d[1], d[2], d[3] / 255];
    cache.set(str, out);
    return out;
  };
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const over = (fg, bg) => [0, 1, 2].map((i) => Math.round(fg[i] * fg[3] + bg[i] * (1 - fg[3])));
  const ratio = (a, b) => {
    const L1 = lum(a);
    const L2 = lum(b);
    const hi = Math.max(L1, L2);
    const lo = Math.min(L1, L2);
    return (hi + 0.05) / (lo + 0.05);
  };

  const bgOf = (el) => {
    let n = el;
    const layers = [];
    while (n) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) layers.push(c);
      n = n.parentElement;
    }
    let acc = [251, 250, 246];
    for (let i = layers.length - 1; i >= 0; i--) acc = over(layers[i], acc);
    return acc;
  };

  const selectorOf = (el) => {
    const cls = (el.className || '').toString().trim().split(/\s+/).filter(Boolean);
    return el.tagName.toLowerCase() + (cls.length ? '.' + cls.slice(0, 4).join('.') : '');
  };

  const fails = [];
  let checked = 0;

  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('[aria-hidden="true"]')) continue;
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (own.length < 2) continue;

    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.5) continue;
    if (cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)') continue;
    // Gradient-filled text (bg-clip-text) and gradient-background CTAs need
    // pixel sampling, not background-color maths. Skipping only when the text
    // sits inside a gradient link/button keeps gradient *sections* (the hero)
    // in scope, which is where real failures live.
    if (cs.backgroundImage && cs.backgroundImage !== 'none') continue;
    let grad = el.parentElement;
    let inGradientControl = false;
    while (grad && grad !== document.body) {
      const g = getComputedStyle(grad);
      if (/^(A|BUTTON)$/.test(grad.tagName) && g.backgroundImage && g.backgroundImage !== 'none') {
        inGradientControl = true;
        break;
      }
      grad = grad.parentElement;
    }
    if (inGradientControl) continue;

    const fg = parse(cs.color);
    if (fg[3] === 0) continue;
    const bg = bgOf(el);
    checked += 1;

    const r = ratio(over(fg, bg), bg);
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
    const need = large ? 3 : 4.5;

    if (r < need) {
      fails.push({
        text: own.slice(0, 46),
        ratio: Math.round(r * 100) / 100,
        need,
        size: Math.round(size),
        sel: selectorOf(el),
      });
    }
  }

  return { checked, fails };
};

const browser = await puppeteer.launch({ executablePath: browserPath, headless: true, args: ['--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
// Respect the OS preference the site is most often broken by.
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);

let total = 0;
let checkedTotal = 0;

for (const path of PAGES) {
  try {
    const res = await page.goto(base + path, { waitUntil: 'networkidle2', timeout: 45000 });
    if (!res || res.status() >= 400) {
      console.log(`SKIP ${path} (status ${res ? res.status() : 'none'})`);
      continue;
    }
    const { checked, fails } = await page.evaluate(audit);
    checkedTotal += checked;
    total += fails.length;
    if (fails.length === 0) {
      console.log(`ok   ${String(checked).padStart(3)} nodes  ${path}`);
    } else {
      console.log(`FAIL ${String(fails.length).padStart(3)} of ${checked}  ${path}`);
      const limit = Number(process.env.MAX_PRINT || 8);
      for (const f of fails.slice(0, limit)) {
        console.log(`       ${f.ratio}:1 (need ${f.need}) ${f.size}px  "${f.text}"  ${f.sel}`);
      }
      if (fails.length > limit) console.log(`       ... ${fails.length - limit} more`);
    }
  } catch (e) {
    console.log(`SKIP ${path} (${e.message.split('\n')[0]})`);
  }
}

await browser.close();
console.log(`\n${checkedTotal} text nodes measured, ${total} failing.`);
process.exit(total === 0 ? 0 : 1);
