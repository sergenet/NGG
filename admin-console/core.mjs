import { randomUUID } from 'node:crypto';

export const fields = [
  ['ga_sessions', 'Sessions', 'Traffic'], ['ga_engaged_sessions', 'Engaged sessions', 'Traffic'],
  ['ga_affiliate_clicks', 'Retailer click events', 'Traffic'], ['ga_file_downloads', 'Checklist download events', 'Traffic'],
  ['ga_newsletter_attempts', 'Signup attempts (not confirmations)', 'Traffic'],
  ['search_impressions', 'Google impressions', 'Search'], ['search_clicks', 'Google clicks', 'Search'],
  ['indexed_pages_snapshot', 'Indexed pages (snapshot)', 'Search'], ['bing_impressions', 'Bing impressions', 'Search'], ['bing_clicks', 'Bing clicks', 'Search'],
  ['email_current_subscribers', 'Confirmed subscribers (snapshot)', 'Email'], ['email_new_subscribers', 'New confirmed subscribers', 'Email'],
  ['email_unsubscribes', 'Unsubscribes in period', 'Email'], ['email_campaign_sends', 'Emails sent', 'Email'],
  ['pinterest_impressions', 'Pinterest impressions', 'Social'], ['pinterest_engagements', 'Pinterest engagements', 'Social'], ['pinterest_outbound_clicks', 'Pinterest outbound clicks', 'Social'],
  ['affiliate_network_clicks', 'Awin clicks', 'Revenue'], ['affiliate_transactions', 'Awin transactions', 'Revenue'],
  ['affiliate_sale_amount_usd', 'Awin sale amount (USD)', 'Revenue'], ['affiliate_commission_usd', 'Awin recorded commission (USD)', 'Revenue'],
  ['affiliate_paid_usd', 'Actually paid commission (USD)', 'Revenue'],
];

export function parseCSV(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(cell); cell = ''; }
    else if (c === '\n' && !quoted) { row.push(cell.replace(/\r$/, '')); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (quoted) throw new Error('Unclosed quote in CSV.');
  if (cell || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
  if (!rows.length) throw new Error('CSV is empty.');
  const headers = rows.shift().map(s => s.replace(/^\uFEFF/, '').trim());
  if (!headers.includes('period_start') || !headers.includes('period_end')) throw new Error('Use the console CSV template with period_start and period_end columns.');
  if (new Set(headers).size !== headers.length) throw new Error('Duplicate CSV column names.');
  return rows.map((values, index) => {
    if (values.length !== headers.length) throw new Error(`CSV row ${index + 2} has an incorrect column count.`);
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

function date(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw new Error(`${label}: enter a valid date.`);
  return value;
}

export function validateRecord(input, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const r = { id: randomUUID(), period_start: date(input.period_start, 'Start'), period_end: date(input.period_end, 'End'), snapshot_date: input.snapshot_date ? date(input.snapshot_date, 'Snapshot date') : null };
  if (r.period_start > r.period_end || r.period_end > today || (r.snapshot_date && r.snapshot_date > today)) throw new Error('Dates must be ordered and cannot be in the future.');
  for (const [key, label] of fields) {
    const raw = input[key];
    if (raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '')) { r[key] = null; continue; }
    if (!['number', 'string'].includes(typeof raw)) throw new Error(`${label}: invalid number.`);
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > 1e12 || (!key.endsWith('_usd') && !Number.isInteger(value))) throw new Error(`${label}: use a non-negative ${key.endsWith('_usd') ? 'number' : 'whole number'}.`);
    r[key] = value;
  }
  if (!fields.some(([k]) => r[k] !== null)) throw new Error('Enter at least one measured value. Leave unavailable values blank.');
  if (r.ga_sessions !== null && r.ga_engaged_sessions !== null && r.ga_engaged_sessions > r.ga_sessions) throw new Error('Engaged sessions cannot exceed sessions for the same period.');
  r.source = String(input.source || '').trim().slice(0, 300);
  if (!r.source) throw new Error('Name the report or source used for these values.');
  r.notes = String(input.notes || '').slice(0, 8000);
  r.recorded_at = now.toISOString();
  return r;
}

export function exportCSV(records) {
  const keys = ['period_start', 'period_end', 'snapshot_date', ...fields.map(([k]) => k), 'source', 'notes'];
  const cell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [keys.join(','), ...records.map(r => keys.map(k => cell(r[k])).join(','))].join('\r\n');
}

export function mergeRecords(existing, incoming) {
  // A reporting period is unique. Revisions remain in the audit trail, not silently merged.
  const keys = new Set(existing.map(r => `${r.period_start}/${r.period_end}`));
  for (const r of incoming) { const key = `${r.period_start}/${r.period_end}`; if (keys.has(key)) throw new Error(`Period ${key} already exists. Edit that record instead of importing a duplicate.`); keys.add(key); }
  return [...existing, ...incoming].sort((a, b) => a.period_end.localeCompare(b.period_end));
}
