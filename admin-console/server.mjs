import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, mkdir, rename, copyFile, readdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { fields, parseCSV, validateRecord, mergeRecords, exportCSV } from './core.mjs';
import { readCredentials, saveCredentials, validateGoogle, fetchGoogle, fetchEmail } from './providers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dataDir = process.env.NGG_ADMIN_DATA || path.join(process.env.LOCALAPPDATA || path.join(root, '.local'), 'NewGiftsAndGadgets', 'AdminPanel');
const stateFile = path.join(dataDir, 'state.json');
const csrf = randomBytes(32).toString('hex');
let state, queue = Promise.resolve(), checking = null;
let credentials = {}, syncing = null, credentialError = null;
function connectionStatus() { return { ga4: Boolean(credentials.google), email: Boolean(credentials.email), googleAccount: credentials.google?.client_email || null, emailList: credentials.email?.listId || null, error: credentialError }; }
async function syncProviders() {
  if (syncing) return syncing;
  syncing = (async () => {
    await Promise.all([['ga4', credentials.google, fetchGoogle], ['email', credentials.email, fetchEmail]].map(async ([key, config, fetcher]) => {
      if (!config) return;
      const attempted_at = new Date().toISOString();
      const previous = state.automatic?.[key];
      if (previous?.attempted_at && Date.now() - Date.parse(previous.attempted_at) < 60000) return;
      let data, error;
      try { data = await fetcher(config); } catch (e) { error = e.message; }
      await mutate(() => {
        state.automatic ||= {};
        state.automatic[key] = { ...state.automatic[key], attempted_at, error: error || null, ...(data ? { data, fetched_at: new Date().toISOString() } : {}) };
        if (key === 'email' && data) {
          state.emailSnapshots ||= [];
          state.emailSnapshots.push({ at: new Date().toISOString(), listId: data.listId, ...data.counts });
          state.emailSnapshots = state.emailSnapshots.slice(-18000);
        }
      });
    }));
  })().finally(() => { syncing = null; });
  return syncing;
}
const providers = [
  { name: 'Google Analytics', detail: 'Property 529707553 · consented traffic and events', url: 'https://analytics.google.com/analytics/web/#/p529707553/reports/intelligenthome', status: 'Manual reporting · events verified Aug 26' },
  { name: 'Google Search Console', detail: 'URL-prefix property · clicks, queries and indexing', url: 'https://search.google.com/search-console?resource_id=https%3A%2F%2Fnewgiftsandgadgets.com%2F', status: 'Manual reporting' },
  { name: 'EmailOctopus', detail: 'Confirmed subscriptions · double opt-in source of truth', url: 'https://emailoctopus.com/', status: 'Manual reporting · not Beehiiv' },
  { name: 'Awin', detail: 'NGG publisher 2913559 · sales, approval and payments', url: 'https://ui.awin.com/', status: 'Manual reporting' },
  { name: 'Bing Webmaster', detail: 'Search traffic and indexing', url: 'https://www.bing.com/webmasters/', status: 'Manual reporting' },
  { name: 'Pinterest', detail: 'Impressions, engagement and outbound clicks', url: 'https://analytics.pinterest.com/', status: 'Manual reporting' },
];
const tasks = [
  ['weekly', 'Capture the latest complete 7-day window', 'Use matching start/end dates in GA4, Search Console and Awin.'],
  ['email', 'Check confirmed signups in EmailOctopus', 'Submission attempts are not confirmed subscribers. Exclude owner tests when evaluating growth.'],
  ['indexing', 'Review Google validation results', 'Do not restart a validation that is already running.'],
  ['traverseon', 'Review Johann’s Traverseon reply', 'Verify code, approved assets, returns and payment exposure before the pilot.'],
  ['payout', 'Reconcile Awin approved and paid commission', 'Recorded commission is not cash received. Amazon remains suspended.'],
];

async function persist() {
  await mkdir(dataDir, { recursive: true });
  try { await copyFile(stateFile, `${stateFile}.bak`); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const temp = `${stateFile}.tmp`; await writeFile(temp, JSON.stringify(state, null, 2), { mode: 0o600 }); await rename(temp, stateFile);
}
async function initialize() {
  try { state = JSON.parse(await readFile(stateFile, 'utf8')); if (state.version !== 1 || !Array.isArray(state.records)) throw new Error('Unsupported console data file.'); }
  catch (e) {
    if (e.code !== 'ENOENT') throw e;
    const rows = parseCSV(await readFile(path.join(root, 'traffic-data', 'weekly-kpis.csv'), 'utf8'));
    const records = rows.map(r => validateRecord({ ...r, source: 'Existing Stage 3 baseline · provider reports', snapshot_date: '2026-08-26' }));
    state = { version: 1, records, health: null, taskDone: {}, journal: [], revisions: [] }; await persist();
  }
}
async function catalog() {
  const products = JSON.parse(await readFile(path.join(root, 'src/lib/data/products.json'), 'utf8'));
  const active = v => /^https:\/\//.test(v.url || '') && !/amazon\.|amzn\.to/i.test(v.url);
  const vendors = [...new Set(products.flatMap(p => p.vendors.filter(active).map(v => v.name)))];
  return { products: products.length, withRetailer: products.filter(p => p.vendors.some(active)).length, suspendedAmazon: products.filter(p => p.vendors.some(v => /amazon/i.test(v.name) && !v.url)).length, vendors };
}
async function runHealth() {
  if (checking) return checking;
  checking = (async () => {
    const checks = await Promise.all([
      ['Homepage', '/'], ['Sitemap', '/sitemap.xml'], ['Editorial RSS', '/rss.xml'],
      ['Gift finder', '/shop/all/'], ['Disclosure', '/affiliate-disclosure/'], ['Privacy', '/privacy/'],
      ['Checklist PDF', '/downloads/2026-gadget-buyers-checklist.pdf'],
    ].map(async ([label, route]) => {
      const url = `https://newgiftsandgadgets.com${route}`, start = Date.now();
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'NGG-Local-Admin-Health/1.0' } });
        const text = route.endsWith('.pdf') ? '' : await res.text();
        if (route.endsWith('.pdf')) await res.body?.cancel();
        return { label, url, status: res.status, ok: res.ok, ms: Date.now() - start, sitemapUrls: route === '/sitemap.xml' ? (text.match(/<loc>/g) || []).length : null, amazonResidue: /sergenet05-20|https:\/\/(?:www\.)?amazon\.com\/dp|m\.media-amazon\.com\/images/i.test(text) };
      } catch { return { label, url, ok: false, status: null, ms: Date.now() - start, error: 'Could not reach this endpoint within 15 seconds.' }; }
    }));
    const health = { checked_at: new Date().toISOString(), checks };
    await mutate(() => { state.health = health; });
    return health;
  })().finally(() => { checking = null; });
  return checking;
}
function mutate(fn) {
  const next = queue.then(async () => { const old = structuredClone(state); try { fn(); await persist(); } catch (e) { state = old; throw e; } });
  queue = next.catch(() => {}); return next;
}
function send(res, status, data, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'" });
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}
async function body(req) { let data = ''; for await (const chunk of req) { data += chunk; if (Buffer.byteLength(data) > 1024 * 1024) throw new Error('Upload is larger than 1 MB.'); } return JSON.parse(data || '{}'); }
await initialize();
try { credentials = await readCredentials(dataDir); } catch { credentialError = 'Saved credentials could not be decrypted by this Windows account. Reconnect the providers.'; }
const server = http.createServer(async (req, res) => {
  const origin = `http://127.0.0.1:${server.address().port}`;
  if (req.headers.host !== `127.0.0.1:${server.address().port}`) return send(res, 403, { error: 'Loopback host only.' });
  const url = new URL(req.url, origin);
  if (req.method === 'POST' && (req.headers.origin !== origin || req.headers['x-ngg-token'] !== csrf)) return send(res, 403, { error: 'This action must originate in the local console.' });
  try {
    if (req.method === 'GET' && url.pathname === '/api/ping') return send(res, 200, { app: 'ngg-local-admin', version: 1 });
    if (req.method === 'GET' && url.pathname === '/api/state') {
      const reports = (await readdir(path.join(root, 'traffic-data'))).filter(n => n.endsWith('.md')).sort().reverse();
      return send(res, 200, { ...state, revisions: undefined, csrf, fields, providers, tasks, catalog: await catalog(), reports, dataDir, connections: connectionStatus(), now: new Date().toISOString(), mode: 'local' });
    }
    if (req.method === 'GET' && url.pathname === '/api/report') {
      const name = url.searchParams.get('name'); const allowed = (await readdir(path.join(root, 'traffic-data'))).filter(n => n.endsWith('.md'));
      if (!allowed.includes(name)) return send(res, 404, { error: 'Report not found.' });
      return send(res, 200, { name, text: await readFile(path.join(root, 'traffic-data', name), 'utf8') });
    }
    if (req.method === 'GET' && url.pathname === '/api/export') {
      if (url.searchParams.get('format') === 'csv') { res.setHeader('Content-Disposition', 'attachment; filename="ngg-metrics.csv"'); return send(res, 200, exportCSV(state.records), 'text/csv; charset=utf-8'); }
      res.setHeader('Content-Disposition', 'attachment; filename="ngg-console-backup.json"'); return send(res, 200, state);
    }
    if (req.method === 'GET' && url.pathname === '/api/template') { res.setHeader('Content-Disposition', 'attachment; filename="ngg-metrics-template.csv"'); return send(res, 200, exportCSV([]), 'text/csv; charset=utf-8'); }
    if (req.method === 'POST') {
      const input = await body(req);
      if (url.pathname === '/api/connections') {
        if (syncing) { await syncing; }
        const next = { ...credentials };
        if (input.provider === 'google') next.google = validateGoogle(input.value);
        else if (input.provider === 'email') {
          if (!/^[\w-]{8,100}$/.test(input.listId || '') || typeof input.apiKey !== 'string' || !/^[\w-]{10,200}$/.test(input.apiKey)) throw new Error('Enter an EmailOctopus API key and list ID (not a form ID).');
          next.email = { apiKey: input.apiKey, listId: input.listId };
          const preview = await fetchEmail(next.email);
          if (input.expectedName !== preview.name) return send(res, 409, { error: `Confirm the exact list name before saving: ${preview.name}`, listName: preview.name });
        } else throw new Error('Unknown reporting provider.');
        await saveCredentials(dataDir, next); credentials = next; credentialError = null;
        await mutate(() => { state.automatic ||= {}; delete state.automatic[input.provider === 'google' ? 'ga4' : 'email']; });
        await syncProviders();
        return send(res, 200, { ok: true, connections: connectionStatus(), automatic: state.automatic });
      }
      if (url.pathname === '/api/sync') { await syncProviders(); return send(res, 200, { automatic: state.automatic || {} }); }
      if (url.pathname === '/api/record') {
        const record = validateRecord(input);
        await mutate(() => {
          if (input.id) {
            const index = state.records.findIndex(r => r.id === input.id); if (index < 0) throw new Error('Record not found.');
            const others = state.records.filter(r => r.id !== input.id); mergeRecords(others, [record]);
            state.revisions.push({ replaced_at: new Date().toISOString(), record: state.records[index] }); record.id = input.id; state.records[index] = record;
            state.records.sort((a, b) => a.period_end.localeCompare(b.period_end));
          } else state.records = mergeRecords(state.records, [record]);
        }); return send(res, 200, { ok: true, id: record.id });
      }
      if (url.pathname === '/api/import') {
        if (typeof input.csv !== 'string') throw new Error('Select a metrics CSV file.');
        const rows = parseCSV(input.csv); if (rows.length > 500) throw new Error('Import at most 500 reporting periods.');
        const records = rows.map(r => validateRecord({ ...r, source: r.source || input.source }));
        await mutate(() => { state.records = mergeRecords(state.records, records); }); return send(res, 200, { count: records.length });
      }
      if (url.pathname === '/api/task') { if (!tasks.some(([id]) => id === input.id) || typeof input.done !== 'boolean') throw new Error('Unknown checklist item.'); await mutate(() => { state.taskDone[input.id] = input.done ? new Date().toISOString() : null; }); return send(res, 200, { ok: true }); }
      if (url.pathname === '/api/note') { const note = String(input.text || '').trim(); if (!note || note.length > 8000) throw new Error('Enter a note of 1–8,000 characters.'); await mutate(() => { state.journal.unshift({ at: new Date().toISOString(), text: note }); }); return send(res, 200, { ok: true }); }
      if (url.pathname === '/api/check') return send(res, 200, await runHealth());
    }
    const assets = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'application/javascript; charset=utf-8'], '/style.css': ['style.css', 'text/css; charset=utf-8'], '/icon.svg': ['icon.svg', 'image/svg+xml'] };
    if (req.method === 'GET' && assets[url.pathname]) { const [name, type] = assets[url.pathname]; return send(res, 200, await readFile(path.join(here, 'web', name)), type); }
    send(res, 404, { error: 'Not found.' });
  } catch (e) { send(res, 400, { error: e.message }); }
});
server.listen(Number(process.env.NGG_ADMIN_PORT || 48731), '127.0.0.1', () => console.log(`NGG admin ready at http://127.0.0.1:${server.address().port}`));
server.on('error', e => { console.error(e.code === 'EADDRINUSE' ? 'The console port is already in use. Open the desktop shortcut.' : e.message); process.exit(1); });
setTimeout(() => syncProviders().catch(() => {}), 1000).unref();
setInterval(() => syncProviders().catch(() => {}), 30 * 60 * 1000).unref();
