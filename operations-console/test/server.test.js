'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'),
  os = require('node:os'), path = require('node:path');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ngg-cr-'));
process.env.ADMIN_DASHBOARD_PASSWORD = 'test-only-bootstrap';
process.env.ANALYTICS_HASH_SECRET = 'a'.repeat(32);
process.env.ADMIN_PASSWORD_FILE = path.join(tempDir, 'admin-password.json');

const { app } = require('../server');

function serve() {
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/control-room`;
  return { server, base };
}

const cookieFrom = (response) => (response.headers.get('set-cookie') || '').split(';')[0];

test.afterEach(() => {
  try { fs.rmSync(process.env.ADMIN_PASSWORD_FILE, { force: true }); } catch { /* ignore */ }
});
test.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

test('unknown routes fail closed', async () => {
  const { server, base } = serve();
  try {
    assert.equal((await fetch(`${base}/../../unknown`)).status, 404);
  } finally { server.close(); }
});

test('the dashboard sends unauthenticated visitors to the login page', async () => {
  const { server, base } = serve();
  try {
    const page = await fetch(base, { redirect: 'manual' });
    assert.equal(page.status, 302);
    assert.equal(page.headers.get('location'), '/control-room/login');
    assert.equal((await fetch(`${base}/api/summary`)).status, 401);
  } finally { server.close(); }
});

test('the login page itself is public', async () => {
  const { server, base } = serve();
  try {
    const page = await fetch(`${base}/login`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Sign in/i);
  } finally { server.close(); }
});

test('bootstrap password signs in and the session unlocks the dashboard', async () => {
  const { server, base } = serve();
  try {
    const bad = await fetch(`${base}/api/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-password' }),
    });
    assert.equal(bad.status, 401);

    const good = await fetch(`${base}/api/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'test-only-bootstrap' }),
    });
    assert.equal(good.status, 204);
    const cookie = cookieFrom(good);
    assert.match(cookie, /^ngg_cr_session=/);

    const dashboard = await fetch(base, { headers: { cookie }, redirect: 'manual' });
    assert.equal(dashboard.status, 200);
  } finally { server.close(); }
});

test('a changed password replaces the bootstrap one', async () => {
  const { server, base } = serve();
  try {
    const login = await fetch(`${base}/api/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'test-only-bootstrap' }),
    });
    const cookie = cookieFrom(login);

    const tooShort = await fetch(`${base}/api/password`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ newPassword: 'short' }),
    });
    assert.equal(tooShort.status, 400);

    const saved = await fetch(`${base}/api/password`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ newPassword: 'a-much-better-passphrase' }),
    });
    assert.equal(saved.status, 204);
    assert.ok(fs.existsSync(process.env.ADMIN_PASSWORD_FILE), 'password hash written');

    const oldOne = await fetch(`${base}/api/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'test-only-bootstrap' }),
    });
    assert.equal(oldOne.status, 401, 'bootstrap password no longer accepted');

    const newOne = await fetch(`${base}/api/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'a-much-better-passphrase' }),
    });
    assert.equal(newOne.status, 204);
  } finally { server.close(); }
});

test('logging out clears the session', async () => {
  const { server, base } = serve();
  try {
    const login = await fetch(`${base}/api/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'test-only-bootstrap' }),
    });
    const cookie = cookieFrom(login);
    assert.equal((await fetch(base, { headers: { cookie }, redirect: 'manual' })).status, 200);

    const out = await fetch(`${base}/api/logout`, { method: 'POST', headers: { cookie } });
    assert.equal(out.status, 204);
    const cleared = out.headers.get('set-cookie') || '';
    assert.match(cleared, /ngg_cr_session=;/);
    assert.equal((await fetch(base, { redirect: 'manual' })).status, 302);
  } finally { server.close(); }
});

test('cross-origin writes are rejected', async () => {
  const { server, base } = serve();
  try {
    const response = await fetch(`${base}/api/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
      body: JSON.stringify({ password: 'test-only-bootstrap' }),
    });
    assert.equal(response.status, 403);
  } finally { server.close(); }
});

test('event collection requires production origin', async () => {
  const { server, base } = serve();
  try {
    const r = await fetch(`${base}/event`, {
      method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
      body: JSON.stringify({ type: 'page_view', path: '/' }),
    });
    assert.equal(r.status, 403);
  } finally { server.close(); }
});
