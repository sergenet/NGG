import { createSign } from 'node:crypto';
import { spawn } from 'node:child_process';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROPERTY = '529707553';
const here = path.dirname(fileURLToPath(import.meta.url));
export async function protect(action, value) {
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.join(here, 'protect.ps1')], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = ''; const timer = setTimeout(() => { child.kill(); reject(new Error('Credential protection timed out.')); }, 15000);
    child.stdout.on('data', b => { out += b; }); child.stderr.resume(); child.stdin.on('error', () => {});
    child.on('error', () => { clearTimeout(timer); reject(new Error('Windows credential protection is unavailable.')); });
    child.on('close', code => { clearTimeout(timer); code === 0 ? resolve(out) : reject(new Error('Windows credential protection failed.')); });
    child.stdin.end(JSON.stringify({ action, value }));
  });
}
export async function readCredentials(dir) {
  try { return JSON.parse(await protect('decrypt', await readFile(path.join(dir, 'credentials.dpapi'), 'utf8'))); }
  catch (e) { if (e.code === 'ENOENT') return {}; throw e; }
}
export async function saveCredentials(dir, value) {
  await mkdir(dir, { recursive: true });
  const target = path.join(dir, 'credentials.dpapi');
  await writeFile(`${target}.tmp`, await protect('encrypt', JSON.stringify(value)), { mode: 0o600 });
  await rename(`${target}.tmp`, target);
}
export function validateGoogle(value) {
  if (!value || value.type !== 'service_account' || !/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(value.client_email || '') || !String(value.private_key || '').includes('BEGIN PRIVATE KEY')) throw new Error('Choose a Google service-account JSON key. Never upload unrelated account credentials.');
  return { type: 'service_account', client_email: value.client_email, private_key: value.private_key };
}
async function jsonFetch(fetcher, url, options, provider) {
  let res;
  try { res = await fetcher(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(20000) }); }
  catch { throw new Error(`${provider}: connection failed or timed out. Last successful data is preserved.`); }
  if (!res.ok) {
    // Never surface response bodies or request URLs: they may contain credentials.
    const hint = res.status === 403 ? 'Check API enablement and read permission for the correct property.' : res.status === 401 ? 'Authorization expired or the key is invalid.' : res.status === 429 ? 'Rate limit reached; automatic refresh will retry later.' : 'Check connection settings and provider availability.';
    throw new Error(`${provider}: HTTP ${res.status}. ${hint}`);
  }
  try { return await res.json(); } catch { throw new Error(`${provider}: invalid response.`); }
}
async function googleToken(credentials, fetcher) {
  const now = Math.floor(Date.now() / 1000);
  const enc = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const payload = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const signed = createSign('RSA-SHA256').update(payload).sign(credentials.private_key, 'base64url');
  const token = await jsonFetch(fetcher, 'https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${payload}.${signed}` }) }, 'Google authorization');
  if (!token.access_token) throw new Error('Google did not return authorization.');
  return token.access_token;
}
export function reportRows(report) {
  const dimensions = (report.dimensionHeaders || []).map(x => x.name), metrics = (report.metricHeaders || []).map(x => x.name);
  return (report.rows || []).map(row => Object.fromEntries([...dimensions.map((key, i) => [key, row.dimensionValues[i].value]), ...metrics.map((key, i) => [key, Number(row.metricValues[i].value)])]));
}
export async function fetchGoogle(credentials, fetcher = fetch) {
  const token = await googleToken(credentials, fetcher);
  const dateRanges = [{ startDate: '28daysAgo', endDate: 'yesterday' }];
  const metric = names => names.map(name => ({ name }));
  const requests = [
    { dateRanges, metrics: metric(['sessions', 'engagedSessions', 'activeUsers', 'screenPageViews']) },
    { dateRanges, dimensions: [{ name: 'date' }], metrics: metric(['sessions']), orderBys: [{ dimension: { dimensionName: 'date' } }] },
    { dateRanges, dimensions: [{ name: 'pagePath' }], metrics: metric(['screenPageViews']), orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: '10' },
    { dateRanges, dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: metric(['sessions']), orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: '20' },
    { dateRanges, dimensions: [{ name: 'eventName' }], metrics: metric(['eventCount']), dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: ['affiliate_click', 'file_download', 'newsletter_signup_attempt'] } } } },
  ];
  const response = await jsonFetch(fetcher, `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:batchRunReports`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ requests }) }, 'GA4');
  if (response.reports?.length !== 5) throw new Error('GA4 returned an incomplete report.');
  const [totals, daily, pages, channels, events] = response.reports.map(reportRows);
  return { property: PROPERTY, window: 'Last 28 complete days (through yesterday)', timeZone: response.reports[0].metadata?.timeZone || 'Property timezone', totals: totals[0] || { sessions: 0, engagedSessions: 0, activeUsers: 0, screenPageViews: 0 }, daily, pages, channels, events: Object.fromEntries(events.map(r => [r.eventName, r.eventCount])), thresholded: response.reports.some(r => r.metadata?.subjectToThresholding), sampled: response.reports.some(r => r.metadata?.samplingMetadatas?.length) };
}
export async function fetchEmail(credentials, fetcher = fetch) {
  if (!/^[\w-]+$/.test(credentials.listId || '') || !credentials.apiKey) throw new Error('Select the NewGiftsAndGadgets list and supply its API key.');
  const result = await jsonFetch(fetcher, `https://emailoctopus.com/api/1.6/lists/${encodeURIComponent(credentials.listId)}?${new URLSearchParams({ api_key: credentials.apiKey })}`, {}, 'EmailOctopus');
  if (!result.counts || !['subscribed', 'pending', 'unsubscribed'].every(k => Number.isInteger(result.counts[k]) && result.counts[k] >= 0)) throw new Error('EmailOctopus did not return valid subscription totals.');
  return { listId: result.id, name: result.name, counts: result.counts };
}
