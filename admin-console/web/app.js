'use strict';
const $ = id => document.getElementById(id);
let state, selected, loading = false;
const number = value => value === null || value === undefined ? '—' : Number(value).toLocaleString();
const money = value => value === null || value === undefined ? '—' : Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const stamp = value => value ? new Date(value).toLocaleString() : 'Never';
function el(tag, text, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
function clear(id) { const node = $(id); node.replaceChildren(); return node; }
function link(text, href) { const node = el('a', text); node.href = href; node.target = '_blank'; node.rel = 'noopener noreferrer'; return node; }
function notice(text, error = false) { $('notice').className = `notice${error ? ' error' : ''}`; $('notice').textContent = text; }
async function api(route, input) {
  const res = await fetch(`/api/${route}`, input === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-ngg-token': state.csrf }, body: JSON.stringify(input) });
  const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Request failed.'); return data;
}
async function action(button, fn) { button.disabled = true; try { await fn(); } catch (e) { notice(e.message, true); } finally { button.disabled = false; } }
function card(parent, label, value, meta) { const node = el('div', undefined, 'kpi'); node.append(el('div', label, 'label'), el('div', value, 'value'), el('div', meta, 'meta')); parent.append(node); }
function table(parent, headers, rows) { const wrap = el('div', undefined, 'tablewrap'), t = el('table'), head = el('thead'), hr = el('tr'), body = el('tbody'); headers.forEach(h => hr.append(el('th', h))); head.append(hr); rows.forEach(row => { const tr = el('tr'); row.forEach(cell => tr.append(el('td', String(cell)))); body.append(tr); }); t.append(head, body); wrap.append(t); parent.append(wrap); }
function navigate() {
  let view = location.hash.slice(1) || 'overview'; if (!['overview', 'records', 'health', 'sources', 'work', 'connections'].includes(view)) view = 'overview';
  document.querySelectorAll('.view').forEach(n => { n.hidden = n.id !== view; });
  document.querySelectorAll('nav a').forEach(n => { n.classList.toggle('active', n.dataset.view === view); });
  $('automatic-panel').hidden = view !== 'overview';
  $('page-title').textContent = ({ overview: 'The business, at a glance.', records: 'Metrics with a paper trail.', health: 'Keep the essentials working.', sources: 'Know where the facts come from.', work: 'Make the next move count.', connections: 'Connect once. Track automatically.' })[view];
}
function renderAutomatic() {
  const statuses = clear('automatic-status'), cards = clear('automatic-kpis');
  const ga = state.automatic?.ga4, email = state.automatic?.email;
  for (const [key, name, value] of [['ga4', 'Google Analytics', ga], ['email', 'EmailOctopus', email]]) {
    const connected = state.connections[key];
    const stale = value?.fetched_at && Date.now() - Date.parse(value.fetched_at) > 65 * 60000;
    const text = !connected ? `${name}: authorization needed. Connect the account to start automatic totals.` : value?.error ? `${name}: ${value.error} Last successful update: ${stamp(value.fetched_at)}.` : value?.fetched_at ? `${name}: ${stale ? 'STALE — ' : ''}last synced ${stamp(value.fetched_at)}.` : `${name}: configured; first synchronization pending.`;
    statuses.append(el('p', text, !connected || value?.error || stale ? 'alert' : 'muted'));
  }
  if (state.connections.error) statuses.append(el('p', state.connections.error, 'alert'));
  const g = ga?.data, e = email?.data;
  card(cards, 'Sessions', number(g?.totals.sessions), 'GA4 · last 28 complete days');
  card(cards, 'Engaged sessions', number(g?.totals.engagedSessions), 'GA4 · last 28 complete days');
  card(cards, 'Active users', number(g?.totals.activeUsers), 'GA4 · last 28 complete days');
  card(cards, 'Confirmed subscribers', number(e?.counts.subscribed), e ? `${e.name} · current snapshot` : 'EmailOctopus · not connected');
  card(cards, 'Pending confirmation', number(e?.counts.pending), 'EmailOctopus · current snapshot');
  card(cards, 'Unsubscribed', number(e?.counts.unsubscribed), 'EmailOctopus · current status total');
  card(cards, 'Retailer click events', g ? number(g.events.affiliate_click || 0) : '—', 'GA4 · last 28 complete days');
  card(cards, 'Checklist downloads', g ? number(g.events.file_download || 0) : '—', 'GA4 · last 28 complete days');
  if (g) statuses.append(el('p', `Traffic window: ${g.window}, ${g.timeZone}. GA4 excludes unconsented/untracked activity. ${g.thresholded ? 'Google applied or may apply privacy thresholding. ' : ''}${g.sampled ? 'Google reports sampling. ' : ''}Signup attempts: ${number(g.events.newsletter_signup_attempt || 0)}; these are not confirmed subscriptions.`, 'footnote'));
  const pages = clear('top-pages'), channels = clear('channels');
  if (g) { table(pages, ['Page', 'Views'], g.pages.map(r => [r.pagePath, number(r.screenPageViews)])); table(channels, ['Channel', 'Sessions'], g.channels.map(r => [r.sessionDefaultChannelGroup, number(r.sessions)])); }
  else { pages.textContent = 'Waiting for GA4 authorization.'; channels.textContent = 'Waiting for GA4 authorization.'; }
  const daily = clear('daily-traffic'); if (g) table(daily, ['Date · property timezone', 'Sessions'], g.daily.map(r => [r.date, number(r.sessions)]));
  const history = clear('subscriber-history');
  history.append(el('p', 'Subscriber observations start when connected. Net changes are not gross new signups: unsubscribes, imports and owner tests can affect totals.', 'footnote'));
  table(history, ['Observed at', 'Confirmed', 'Pending', 'Unsubscribed'], (state.emailSnapshots || []).filter(r => r.listId === e?.listId).slice(-30).reverse().map(r => [stamp(r.at), number(r.subscribed), number(r.pending), number(r.unsubscribed)]));
}
function renderRecord() {
  const record = state.records.find(r => r.id === selected) || state.records.at(-1); if (!record) return;
  selected = record.id; $('period-select').value = selected;
  const age = Math.floor((Date.now() - Date.parse(record.period_end)) / 86400000);
  $('freshness').textContent = `Saved historical record · ended ${age} days ago`; $('freshness').className = 'badge warn';
  const cards = clear('kpis');
  card(cards, 'Recorded sessions', number(record.ga_sessions), record.ga_sessions === null ? 'Not measured in this record' : 'Historical matching window');
  card(cards, 'Google search clicks', number(record.search_clicks), `${number(record.search_impressions)} impressions`);
  card(cards, 'Subscriber snapshot', number(record.email_current_subscribers), `Snapshot date: ${record.snapshot_date || 'Not recorded'}`);
  card(cards, 'Recorded commission', money(record.affiliate_commission_usd), `${number(record.affiliate_transactions)} transactions · not necessarily paid`);
  const alerts = clear('alerts');
  if (!state.connections.ga4 || !state.connections.email) alerts.append(el('p', 'Finish Connections to enable automatic traffic and signup totals.', 'alert'));
  alerts.append(el('p', 'Amazon remains suspended. Do not restore monetized Amazon links without a new accepted account.', 'alert'));
  alerts.append(el('p', 'The initial subscriber baseline contains an owner test. Do not count it as acquired audience.', 'alert'));
  if (!state.health) alerts.append(el('p', 'Run the site-health check to verify the key public endpoints.', 'alert'));
  const signals = clear('signals');
  [['Google search clicks', record.search_clicks], ['Retailer click events', record.ga_affiliate_clicks], ['Awin transactions', record.affiliate_transactions]].forEach(([label, value]) => { const n = el('div', undefined, 'signal'); n.append(el('span', label), el('strong', number(value))); signals.append(n); });
  const catalog = clear('catalog'); card(catalog, 'Catalog products', number(state.catalog.products), 'Current local source catalog'); card(catalog, 'With active retailer', number(state.catalog.withRetailer), state.catalog.vendors.join(', ')); card(catalog, 'Amazon unavailable', number(state.catalog.suspendedAmazon), 'Excluded from active retailer links');
  $('period-source').textContent = `Source: ${record.source}`; $('period-notes').textContent = record.notes || 'No notes recorded.';
}
function renderHealth() {
  const health = state.health, parent = clear('health-results'); $('checked-at').textContent = `Last checked: ${stamp(health?.checked_at)}`;
  for (const check of health?.checks || []) { const row = el('div', undefined, 'healthrow'); row.append(link(check.label, check.url), el('strong', check.ok ? `HTTP ${check.status}` : check.status ? `HTTP ${check.status}` : 'Failed', check.ok ? 'good' : 'bad'), el('span', `${check.ms} ms${check.sitemapUrls !== null && check.sitemapUrls !== undefined ? ` · ${check.sitemapUrls} sitemap URLs` : ''}${check.amazonResidue ? ' · Old Amazon reference detected' : ''}`)); if (check.error) row.append(el('p', check.error)); parent.append(row); }
}
function render() {
  const periods = clear('period-select'); [...state.records].reverse().forEach(r => { const option = el('option', `${r.period_start} → ${r.period_end}`); option.value = r.id; periods.append(option); });
  renderRecord(); renderAutomatic(); renderHealth();
  const history = clear('history'); [...state.records].reverse().forEach(r => { const tr = el('tr'); [`${r.period_start} → ${r.period_end}`, number(r.ga_sessions), number(r.search_clicks), number(r.email_current_subscribers), number(r.affiliate_transactions), money(r.affiliate_commission_usd)].forEach(v => tr.append(el('td', v))); const td = el('td'), button = el('button', 'Edit', 'subtle'); button.addEventListener('click', () => openRecord(r)); td.append(button); tr.append(td); history.append(tr); });
  const providers = clear('providers'); state.providers.forEach((p, i) => { const n = el('article', undefined, 'panel'); const status = i === 0 ? (state.connections.ga4 ? 'Automatic connection configured — see sync status' : 'Automatic connection needs authorization') : i === 2 ? (state.connections.email ? 'Automatic connection configured — see sync status' : 'Automatic connection needs authorization') : p.status; n.append(el('h2', p.name), el('p', p.detail), el('p', status, 'badge'), link('Open provider ↗', p.url)); providers.append(n); });
  const reportSelect = $('report-select'), report = reportSelect.value; reportSelect.replaceChildren(el('option', 'Choose a report…')); reportSelect.firstChild.value = ''; state.reports.forEach(name => { const option = el('option', name); option.value = name; reportSelect.append(option); }); reportSelect.value = report;
  $('data-location').textContent = state.dataDir;
  const tasks = clear('tasks'); state.tasks.forEach(([id, title, description]) => { const label = el('label', undefined, 'task'), input = document.createElement('input'); input.type = 'checkbox'; input.checked = Boolean(state.taskDone[id]); input.addEventListener('change', () => action(input, async () => { await api('task', { id, done: input.checked }); await refresh(); })); const text = el('span'); text.append(el('strong', title), el('p', description)); label.append(input, text); tasks.append(label); });
  const journal = clear('journal'); state.journal.forEach(note => { const n = el('div', undefined, 'journal'); n.append(el('small', stamp(note.at)), el('p', note.text, 'preline')); journal.append(n); });
  navigate();
}
async function refresh() { if (loading) return; loading = true; try { state = await api('state'); $('loading').hidden = true; render(); } finally { loading = false; } }
function openRecord(record) { const form = $('record-form'); form.reset(); $('form-error').textContent = ''; $('form-title').textContent = record ? 'Edit reporting period' : 'Add reporting period'; const container = clear('metric-fields'); let lastGroup; state.fields.forEach(([key, label, group]) => { if (group !== lastGroup) { container.append(el('h3', group)); lastGroup = group; } const wrapper = el('label', label), input = el('input'); input.name = key; input.type = 'number'; input.min = '0'; input.step = key.endsWith('_usd') ? '0.01' : '1'; wrapper.append(input); container.append(wrapper); }); if (record) Object.entries(record).forEach(([key, value]) => { if (form.elements.namedItem(key)) form.elements.namedItem(key).value = value ?? ''; }); $('record-dialog').showModal(); }
window.addEventListener('hashchange', navigate);
$('period-select').addEventListener('change', e => { selected = e.target.value; renderRecord(); });
$('refresh').addEventListener('click', e => action(e.currentTarget, refresh));
$('sync-now').addEventListener('click', e => action(e.currentTarget, async () => { notice('Synchronizing authorized providers…'); await api('sync', {}); await refresh(); notice('Synchronization finished. Review each provider’s status above.'); }));
$('add-top').addEventListener('click', () => { if (state) openRecord(); });
['close-dialog', 'cancel-dialog'].forEach(id => $(id).addEventListener('click', () => $('record-dialog').close()));
$('record-form').addEventListener('submit', async e => { e.preventDefault(); $('save-record').disabled = true; try { await api('record', Object.fromEntries(new FormData(e.target))); $('record-dialog').close(); await refresh(); notice('Reporting record saved.'); } catch (error) { $('form-error').textContent = error.message; } finally { $('save-record').disabled = false; } });
$('import-form').addEventListener('submit', e => { e.preventDefault(); action(e.submitter, async () => { const file = $('csv-file').files[0]; if (file.size > 1024 * 1024) throw new Error('CSV must be at most 1 MB.'); const result = await api('import', { csv: await file.text(), source: new FormData(e.target).get('source') }); await refresh(); notice(`Imported ${result.count} records.`); }); });
$('note-form').addEventListener('submit', e => { e.preventDefault(); action(e.submitter, async () => { await api('note', Object.fromEntries(new FormData(e.target))); e.target.reset(); await refresh(); notice('Note saved.'); }); });
async function health() { await api('check', {}); await refresh(); }
$('check-site').addEventListener('click', e => action(e.currentTarget, health));
setInterval(() => { if ($('auto-check').checked && !document.hidden) health().catch(e => notice(e.message, true)); }, 300000);
setInterval(() => { if (!document.hidden && !$('record-dialog').open) refresh().catch(e => notice(e.message, true)); }, 60000);
$('report-select').addEventListener('change', async e => { const name = e.target.value; if (!name) { $('report-text').textContent = 'No report selected.'; return; } try { const r = await api(`report?name=${encodeURIComponent(name)}`); $('report-text').textContent = r.text; } catch (error) { notice(error.message, true); } });
$('google-form').addEventListener('submit', e => { e.preventDefault(); action(e.submitter, async () => { const file = $('google-key').files[0]; if (file.size > 50000) throw new Error('Key file is unexpectedly large.'); let value; try { value = JSON.parse(await file.text()); } catch { throw new Error('Select a valid service-account JSON file.'); } await api('connections', { provider: 'google', value }); e.target.reset(); await refresh(); notice('Google credentials saved securely. Review the automatic sync result.'); location.hash = 'overview'; }); });
$('email-form').addEventListener('submit', e => { e.preventDefault(); action(e.submitter, async () => { await api('connections', { provider: 'email', ...Object.fromEntries(new FormData(e.target)) }); e.target.reset(); await refresh(); notice('EmailOctopus connection saved and checked.'); location.hash = 'overview'; }); });
document.querySelector('.privacy p').textContent = 'Credentials encrypted locally. Not published to your website.';
document.querySelector('#sources .banner').replaceChildren(el('strong', 'GA4 and EmailOctopus support automatic reporting.'), el('p', 'Connect them once in Connections. Other providers remain manual until their APIs are integrated. Signing into another browser tab alone does not authorize API access.'));
document.querySelector('footer span').textContent = 'Local data • USD revenue • Automatic GA4 & EmailOctopus after authorization';
refresh().catch(e => { $('loading').textContent = 'Could not load the local panel.'; notice(e.message, true); });
