'use strict';
const express = require('express'), helmet = require('helmet'), rateLimit = require('express-rate-limit'),
  mysql = require('mysql2/promise'), crypto = require('crypto'), fs = require('fs'), path = require('path');

const app = express(), PORT = process.env.PORT || 3000, BASE = '/control-room';
const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'ADMIN_DASHBOARD_PASSWORD', 'ANALYTICS_HASH_SECRET'];
const missing = required.filter(k => !process.env[k]);
const pool = missing.length ? null : mysql.createPool({
  host: process.env.DB_HOST, database: process.env.DB_NAME, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, waitForConnections: true, connectionLimit: 4, charset: 'utf8mb4',
});

/* ------------------------------------------------------------ password file --
 * The admin password lives in data/admin-password.json as a scrypt hash, so it can
 * be changed from the dashboard without touching .htaccess or restarting Passenger.
 * ADMIN_DASHBOARD_PASSWORD stays as the bootstrap credential and is only consulted
 * while no hash file exists.
 */
const DATA_DIR = path.join(__dirname, 'data');
const PASSWORD_FILE = process.env.ADMIN_PASSWORD_FILE || path.join(DATA_DIR, 'admin-password.json');
const SESSION_COOKIE = 'ngg_cr_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MIN_PASSWORD = 10;

function readPasswordRecord() {
  try {
    const raw = JSON.parse(fs.readFileSync(PASSWORD_FILE, 'utf8'));
    if (raw && typeof raw.salt === 'string' && typeof raw.hash === 'string') return raw;
  } catch { /* missing or unreadable file means "not set yet" */ }
  return null;
}

function writePasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  const record = { version: 1, salt, hash, updatedAt: new Date().toISOString() };
  fs.writeFileSync(PASSWORD_FILE, JSON.stringify(record, null, 2), { mode: 0o600 });
  return record;
}

function passwordMatches(candidate, record) {
  const expected = record
    ? Buffer.from(record.hash, 'hex')
    : Buffer.from(process.env.ADMIN_DASHBOARD_PASSWORD || '');
  const supplied = record
    ? crypto.scryptSync(String(candidate), record.salt, 64)
    : Buffer.from(String(candidate));
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

/* ---------------------------------------------------------------- sessions -- */
const secret = () => process.env.ANALYTICS_HASH_SECRET || '';
const fingerprint = () => {
  const record = readPasswordRecord();
  return record ? record.hash.slice(0, 16) : 'bootstrap';
};
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('hex');

function issueSession(res) {
  const expires = Date.now() + SESSION_TTL_MS;
  const value = `${expires}.${sign(`session|${expires}|${fingerprint()}`)}`;
  res.cookie(SESSION_COOKIE, value, {
    httpOnly: true, secure: true, sameSite: 'strict', path: BASE, maxAge: SESSION_TTL_MS,
  });
}

function sessionValid(req) {
  const raw = req.headers.cookie || '';
  const match = raw.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!match) return false;
  const [expires, signature] = decodeURIComponent(match[1]).split('.');
  const expiry = Number(expires);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  const expected = Buffer.from(sign(`session|${expires}|${fingerprint()}`));
  const supplied = Buffer.from(String(signature || ''));
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

function basicMatches(req) {
  const header = String(req.headers.authorization || '').match(/^Basic\s+(.+)$/i);
  if (!header) return false;
  let password = '';
  try { password = Buffer.from(header[1], 'base64').toString().split(':').slice(1).join(':'); } catch { return false; }
  return passwordMatches(password, null);
}

function sameOrigin(req) {
  const origin = req.get('origin');
  if (!origin) return true; // same-origin form posts and curl omit it
  return origin === 'https://newgiftsandgadgets.com' || origin === 'http://127.0.0.1' || origin === 'http://localhost';
}

function requireSession(req, res, next) {
  if (!process.env.ADMIN_DASHBOARD_PASSWORD && !readPasswordRecord()) {
    return res.status(503).send('Dashboard access is not configured.');
  }
  if (sessionValid(req)) return next();
  // Transitional: a browser that already stored the old Basic credential is let in
  // once and converted to a session, so the first visit after this change needs no
  // password at all. Disabled as soon as a password hash exists.
  if (!readPasswordRecord() && basicMatches(req)) {
    issueSession(res);
    return next();
  }
  if (req.path.startsWith(`${BASE}/api/`) || req.path.startsWith('/api/')) return res.status(401).json({ error: 'Not signed in.' });
  return res.redirect(302, `${BASE}/login`);
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], frameAncestors: ["'none'"],
    },
  },
}));
app.use(express.json({ limit: '8kb' }));

const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, skipSuccessfulRequests: true, standardHeaders: true, legacyHeaders: false });
const eventLimit = rateLimit({ windowMs: 60 * 1000, limit: 90, standardHeaders: true, legacyHeaders: false });
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true, standardHeaders: true, legacyHeaders: false });

async function db(fn) {
  if (!pool) throw Error(`Missing configuration: ${missing.join(', ')}`);
  return fn(pool);
}

async function init() {
  await db(async p => {
    await p.execute('CREATE TABLE IF NOT EXISTS site_metrics_daily(metric_date DATE NOT NULL,metric_key VARCHAR(48) NOT NULL,metric_count BIGINT UNSIGNED NOT NULL DEFAULT 0,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY(metric_date,metric_key))');
    await p.execute('CREATE TABLE IF NOT EXISTS site_visitors_daily(visitor_hash CHAR(64) NOT NULL,visit_date DATE NOT NULL,PRIMARY KEY(visitor_hash,visit_date))');
    await p.execute('CREATE TABLE IF NOT EXISTS traffic_dimensions_daily(metric_date DATE NOT NULL,dimension_type VARCHAR(24) NOT NULL,dimension_value VARCHAR(180) NOT NULL,metric_count BIGINT UNSIGNED NOT NULL DEFAULT 0,PRIMARY KEY(metric_date,dimension_type,dimension_value))');
    await p.execute('CREATE TABLE IF NOT EXISTS provider_snapshots(provider VARCHAR(32) NOT NULL,captured_at DATETIME NOT NULL,metric_key VARCHAR(48) NOT NULL,metric_value DECIMAL(18,2) NOT NULL,PRIMARY KEY(provider,captured_at,metric_key))');
    await p.execute('DELETE FROM site_visitors_daily WHERE visit_date < CURRENT_DATE - INTERVAL 90 DAY');
  });
}

const emailOctopus = { lastSuccess: 0, lastAttempt: 0, pending: null, error: null };

function countMap(raw) {
  if (Array.isArray(raw) && raw.length === 1 && raw[0] && typeof raw[0] === 'object' && ('subscribed' in raw[0])) return countMap(raw[0]);
  if (Array.isArray(raw)) return Object.fromEntries(raw.map(x => [String(x.status || x.type || x.name || '').toLowerCase(), Number(x.count ?? x.total ?? x.value ?? 0)]));
  if (raw && typeof raw === 'object') return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), Number(typeof v === 'object' ? (v.count ?? v.total ?? v.value ?? 0) : v)]));
  return {};
}

async function refreshEmailOctopus(force = false) {
  const key = process.env.EMAILOCTOPUS_API_KEY, listId = process.env.EMAILOCTOPUS_LIST_ID;
  if (!key || !listId) return { configured: false };
  const now = Date.now();
  if (!force && now - emailOctopus.lastSuccess < 5 * 60 * 1000) return { configured: true, fresh: true };
  if (emailOctopus.pending) return emailOctopus.pending;
  if (!force && emailOctopus.error && now - emailOctopus.lastAttempt < 60 * 1000) return { configured: true, error: emailOctopus.error };
  emailOctopus.lastAttempt = now;
  emailOctopus.pending = (async () => {
    try {
      const response = await fetch(`https://api.emailoctopus.com/lists/${encodeURIComponent(listId)}`, {
        headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' }, signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw Error(`EmailOctopus HTTP ${response.status}`);
      const list = await response.json(), counts = countMap(list.counts);
      const metrics = { subscribed: counts.subscribed, pending: counts.pending, unsubscribed: counts.unsubscribed };
      if (!Number.isFinite(metrics.subscribed)) throw Error('EmailOctopus response did not include a subscribed count');
      const captured = new Date();
      await db(async p => {
        for (const [metric, value] of Object.entries(metrics)) {
          if (Number.isFinite(value)) await p.execute('INSERT INTO provider_snapshots(provider,captured_at,metric_key,metric_value) VALUES(?,?,?,?)', ['emailoctopus', captured, metric, value]);
        }
      });
      emailOctopus.lastSuccess = Date.now(); emailOctopus.error = null;
      return { configured: true, fresh: true };
    } catch (e) {
      emailOctopus.error = e.message;
      return { configured: true, error: e.message };
    } finally { emailOctopus.pending = null; }
  })();
  return emailOctopus.pending;
}

const safePath = v => { const s = String(v || '/').split('?')[0].slice(0, 180); return /^\/[a-zA-Z0-9_./-]*$/.test(s) ? s : '/unknown'; };
function source(v) {
  try {
    const h = new URL(String(v || '')).hostname.replace(/^www\./, '');
    if (!h) return 'direct';
    if (h.endsWith('google.com')) return 'google';
    if (h.endsWith('bing.com')) return 'bing';
    if (h.endsWith('pinterest.com')) return 'pinterest';
    if (h.endsWith('facebook.com')) return 'facebook';
    if (h.endsWith('instagram.com')) return 'instagram';
    if (h.endsWith('newgiftsandgadgets.com')) return 'internal';
    return 'other-referral';
  } catch { return 'direct'; }
}

/* ------------------------------------------------------------- public routes -- */
app.get(`${BASE}/healthz`, async (req, res) => {
  try { await db(p => p.query('SELECT 1')); res.json({ status: 'ready' }); }
  catch { res.status(503).json({ status: 'not-ready' }); }
});

app.post(`${BASE}/event`, eventLimit, async (req, res) => {
  try {
    if (req.get('origin') !== 'https://newgiftsandgadgets.com') return res.sendStatus(403);
    const type = String(req.body?.type || '');
    if (!['page_view', 'retailer_click', 'checklist_download', 'newsletter_attempt'].includes(type)) return res.sendStatus(400);
    if (String(req.get('sec-gpc')) === '1' || String(req.get('dnt')) === '1') return res.sendStatus(204);
    const page = safePath(req.body?.path), ref = source(req.body?.referrer);
    const visitor = crypto.createHmac('sha256', process.env.ANALYTICS_HASH_SECRET).update(`${new Date().toISOString().slice(0, 10)}|${req.ip}|${String(req.get('user-agent')).slice(0, 160)}`).digest('hex');
    await db(async p => {
      const c = await p.getConnection();
      try {
        await c.beginTransaction();
        await c.execute('INSERT INTO site_metrics_daily VALUES(CURRENT_DATE,?,1,NOW()) ON DUPLICATE KEY UPDATE metric_count=metric_count+1', [type]);
        if (type === 'page_view') {
          const [r] = await c.execute('INSERT IGNORE INTO site_visitors_daily VALUES(?,CURRENT_DATE)', [visitor]);
          if (r.affectedRows) await c.execute("INSERT INTO site_metrics_daily VALUES(CURRENT_DATE,'unique_visitors',1,NOW()) ON DUPLICATE KEY UPDATE metric_count=metric_count+1");
          for (const [t, v] of [['landing_page', page], ['source', ref]]) {
            if (v !== 'internal') await c.execute('INSERT INTO traffic_dimensions_daily VALUES(CURRENT_DATE,?,?,1) ON DUPLICATE KEY UPDATE metric_count=metric_count+1', [t, v]);
          }
        }
        await c.commit();
      } catch (e) { await c.rollback(); throw e; } finally { c.release(); }
    });
    res.sendStatus(204);
  } catch { res.sendStatus(503); }
});

/* ------------------------------------------------------------------- login -- */
app.get(`${BASE}/login`, (req, res) => {
  if (sessionValid(req)) return res.redirect(302, `${BASE}/`);
  res.set('Cache-Control', 'no-store').sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post(`${BASE}/api/login`, loginLimit, (req, res) => {
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Cross-origin request rejected.' });
  const password = String(req.body?.password || '');
  if (!password) return res.status(400).json({ error: 'Enter your password.' });
  if (!passwordMatches(password, readPasswordRecord())) return res.status(401).json({ error: 'That password is not correct.' });
  issueSession(res);
  res.status(204).end();
});

app.post(`${BASE}/api/logout`, authLimit, (req, res) => {
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Cross-origin request rejected.' });
  res.clearCookie(SESSION_COOKIE, { path: BASE });
  res.status(204).end();
});

app.post(`${BASE}/api/password`, authLimit, requireSession, (req, res) => {
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Cross-origin request rejected.' });
  const next = String(req.body?.newPassword || '');
  if (next.length < MIN_PASSWORD) return res.status(400).json({ error: `Use at least ${MIN_PASSWORD} characters.` });
  if (next === process.env.ADMIN_DASHBOARD_PASSWORD) return res.status(400).json({ error: 'Choose a password different from the bootstrap one.' });
  try {
    writePasswordRecord(next);
    issueSession(res); // the fingerprint changed, so re-issue rather than log the user out
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: `Could not save the password: ${e.code || e.message}` });
  }
});

app.get(`${BASE}/api/session`, (req, res) => {
  const record = readPasswordRecord();
  res.set('Cache-Control', 'no-store').json({ authenticated: sessionValid(req), passwordSet: Boolean(record), minLength: MIN_PASSWORD });
});

/* ------------------------------------------------------------------ private -- */
app.get(`${BASE}/api/summary`, authLimit, requireSession, async (req, res) => {
  try {
    const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
    const provider = await refreshEmailOctopus();
    const [metrics] = await db(p => p.execute("SELECT DATE_FORMAT(metric_date,'%Y-%m-%d') date,metric_key,metric_count FROM site_metrics_daily WHERE metric_date>=CURRENT_DATE-INTERVAL ? DAY ORDER BY metric_date", [days - 1]));
    const [dims] = await db(p => p.execute('SELECT dimension_type,dimension_value,SUM(metric_count) metric_count FROM traffic_dimensions_daily WHERE metric_date>=CURRENT_DATE-INTERVAL ? DAY GROUP BY dimension_type,dimension_value ORDER BY metric_count DESC', [days - 1]));
    const [snap] = await db(p => p.execute("SELECT p.provider,DATE_FORMAT(p.captured_at,'%Y-%m-%dT%H:%i:%sZ') captured_at,p.metric_key,p.metric_value FROM provider_snapshots p WHERE p.captured_at=(SELECT MAX(s.captured_at) FROM provider_snapshots s WHERE s.provider=p.provider)"));
    res.set('Cache-Control', 'no-store').json({ generatedAt: new Date().toISOString(), days, metrics, dims, snapshots: snap, providers: { emailoctopus: provider } });
  } catch { res.status(503).json({ error: 'Reporting database unavailable.' }); }
});

app.use(`${BASE}/assets`, requireSession, express.static(path.join(__dirname, 'public'), { index: false, maxAge: '1h' }));
app.get([BASE, `${BASE}/`], authLimit, requireSession, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((req, res) => res.sendStatus(404));

if (require.main === module) {
  init().then(() => app.listen(PORT, () => console.log('NGG control room ready')))
    .catch(e => { console.error(e.message); process.exit(1); });
} else if (process.env.NODE_ENV === 'production') {
  init().catch(e => console.error(`NGG database initialization failed: ${e.message}`));
}

module.exports = app;
module.exports.app = app;
module.exports.init = init;
