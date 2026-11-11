#!/usr/bin/env node
/**
 * Browser check for the newsletter form.
 *
 * This needs a real browser because nothing about the form exists in the HTML:
 * EmailOctopus' script injects the fields, and it silently refuses to submit
 * while its consent box is unticked — the Subscribe button just looks dead, with
 * no message and no request. HTTP checks cannot see that, so this drives a
 * browser through the same steps a visitor takes.
 *
 * Usage:
 *   node scripts/check-newsletter.mjs            # live site, no side effects
 *   node scripts/check-newsletter.mjs --submit   # also complete a real signup
 *
 * --submit creates a genuine pending subscriber in the EmailOctopus list, so it
 * is opt-in and needs NEWS_EMAIL to identify the address.
 *
 * Chrome is used from the normal install (puppeteer-core downloads nothing).
 * Point CHROME_PATH at a browser if it lives somewhere unusual.
 *
 * Exits 0 when every check passes, 1 otherwise.
 */
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const ORIGIN = process.env.NEWS_ORIGIN ?? 'https://newgiftsandgadgets.com';
const DO_SUBMIT = process.argv.includes('--submit');
const EMAIL = process.env.NEWS_EMAIL ?? 'contact+smoke-test@newgiftsandgadgets.com';

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

const browserPath = CANDIDATES.find((p) => existsSync(p));
if (!browserPath) {
  console.error('No Chrome or Edge found. Set CHROME_PATH to a browser binary.');
  process.exit(1);
}

const failures = [];
const passed = [];
const check = (ok, message) => (ok ? passed.push(message) : failures.push(message));

const browser = await puppeteer.launch({
  executablePath: browserPath,
  headless: true,
  args: ['--disable-dev-shm-usage'],
});

const posts = [];
let page;
try {
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on('request', (req) => {
    if (req.url().includes('eomail5.com') && req.method() !== 'GET') posts.push(req.url());
  });

  await page.goto(ORIGIN + '/', { waitUntil: 'networkidle2', timeout: 45000 });

  // The embed is a third-party script; give it time to inject the fields.
  await page.waitForSelector('input[name="consent"]', { timeout: 20000 });
  await page.waitForSelector('#field_0, input[type="email"]', { timeout: 20000 });

  // Fill a valid address first, so that "the form is invalid" can only be the
  // consent box holding the submit back — not an empty email field.
  await page.type('#field_0, input[type="email"]', EMAIL);

  const state = await page.evaluate(() => {
    const box = document.querySelector('input[name="consent"]');
    const form = box?.form ?? box?.closest('form');
    const email = document.querySelector('#field_0, input[type="email"]');
    const submit = form?.querySelector('button[type="submit"], input[type="submit"]');
    return {
      found: Boolean(box && form && email && submit),
      required: Boolean(box?.required),
      valueMissing: Boolean(box?.validity?.valueMissing),
      emailValid: Boolean(email?.validity?.valid),
      formValid: Boolean(form?.checkValidity()),
    };
  });

  check(state.found, 'newsletter form injected with email, consent and submit controls');
  check(state.emailValid, 'a valid address satisfies the email field');
  check(state.required, 'consent checkbox is required, so the browser can block a submit');
  check(state.valueMissing, 'unticked consent reports as missing (visitor is told what is wrong)');
  check(!state.formValid, 'the form is invalid only because consent is unticked');

  // Unticked: a click must not reach EmailOctopus, and must not navigate.
  const before = page.url();
  await page.evaluate(() => {
    const box = document.querySelector('input[name="consent"]');
    const form = box?.form ?? box?.closest('form');
    const submit = form.querySelector('button[type="submit"], input[type="submit"]');
    submit.click();
  });
  await new Promise((r) => setTimeout(r, 2000));
  check(posts.length === 0, `no signup request was sent without consent (sent: ${posts.length})`);
  check(page.url() === before, 'the page did not navigate on a blocked submit');

  // Ticked: the browser must now let the submit through.
  const accepted = await page.evaluate(() => {
    const box = document.querySelector('input[name="consent"]');
    if (!box.checked) box.click();
    const form = box.form ?? box.closest('form');
    return { checked: box.checked, formValid: form.checkValidity() };
  });
  check(accepted.checked, 'consent checkbox can be ticked');
  check(accepted.formValid, 'form becomes valid once consent is ticked');

  if (DO_SUBMIT) {
    await page.evaluate(() => {
      const box = document.querySelector('input[name="consent"]');
      const form = box.form ?? box.closest('form');
      form.querySelector('button[type="submit"], input[type="submit"]').click();
    });
    let sent = false;
    for (let i = 0; i < 20 && !sent; i += 1) {
      await new Promise((r) => setTimeout(r, 500));
      sent = posts.length > 0;
    }
    check(sent, 'a ticked form sent the signup request to EmailOctopus');
    const text = await page.evaluate(() => document.body.innerText);
    check(/check your email|confirm your subscription|thank/i.test(text), 'page showed a confirmation message after submitting');
    passed.push(`submitted a real signup for ${EMAIL} — remove it in EmailOctopus`);
  } else {
    passed.push('skipped the live signup (pass --submit to complete one)');
  }
} catch (err) {
  failures.push(`could not run the checks: ${err instanceof Error ? err.message : String(err)}`);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\nNewsletter check FAILED: ${failures.length} of ${failures.length + passed.length} (${ORIGIN})\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Newsletter check passed: ${passed.length} checks (${ORIGIN})`);
}
