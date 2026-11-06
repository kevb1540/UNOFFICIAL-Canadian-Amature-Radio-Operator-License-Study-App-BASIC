// ©️ Kevin W. Brown 2026
// Real SQLite behind the small D1 API surface; Brevo HTTP is intercepted locally.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { randomBytes } = require('node:crypto');
const workerText = fs.readFileSync(path.join(__dirname, '../recovery_service/cloudflare/worker.js'), 'utf8');
const schema = fs.readFileSync(path.join(__dirname, '../recovery_service/cloudflare/schema.sql'), 'utf8');
const workerPromise = import('data:text/javascript;base64,' + Buffer.from(workerText).toString('base64')).then(m => m.default);
const token = () => randomBytes(32).toString('base64');
const id = n => n.toString(16).padStart(32, '0');
const registration = (n = 1, email = 'kevin@example.org') => ({ id: id(n), email, owner_token: token(), key: token() });
function d1(db) {
  return { prepare(sql) {
    return { bind(...values) {
      return {
        async first() { return db.prepare(sql).all(...values)[0] || null; },
        async all() { return { results: db.prepare(sql).all(...values), success: true }; },
        async run() { const result = db.prepare(sql).run(...values); return { success: true, meta: { changes: result.changes } }; }
      };
    }, async first() { return db.prepare(sql).all()[0] || null; } };
  } };
}
async function fixture(t, initialize = true) {
  const worker = await workerPromise, db = new DatabaseSync(':memory:');
  if (initialize) db.exec(schema);
  let clock = Date.UTC(2026, 9, 16, 12), providerStatus = 201, providerThrows = false;
  const originalFetch = globalThis.fetch, originalNow = Date.now, emails = [], calls = [];
  Date.now = () => clock;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(options.headers['api-key'], 'private-brevo-key');
    assert.equal(options.method, 'POST');
    const message = JSON.parse(options.body); calls.push(message);
    if (providerThrows) throw Error('fake credential value should never escape');
    if (providerStatus === 201) emails.push(message);
    return new Response(JSON.stringify({ messageId: 'test-only', private: 'provider-internal' }), { status: providerStatus });
  };
  t.after(() => { globalThis.fetch = originalFetch; Date.now = originalNow; db.close(); });
  const env = { DB: d1(db), BREVO_API_KEY: 'private-brevo-key', RECOVERY_MASTER_KEY: token(), SENDER_EMAIL: 'sender@example.org', ALLOWED_EMAILS: 'kevin@example.org,casey@example.org' };
  async function raw(url, options = {}, override = {}) {
    const pending = [], response = await worker.fetch(new Request(url, options), { ...env, ...override }, { waitUntil(p) { pending.push(p); } });
    await Promise.all(pending);
    return response;
  }
  async function send(action, data, options = {}) {
    const response = await raw('https://radio.example.org/v1/' + action, {
      method: 'POST', headers: { 'content-type': 'application/json', 'CF-Connecting-IP': options.ip || '192.0.2.1' }, body: JSON.stringify(data)
    }, options.env || {});
    return { status: response.status, data: await response.json(), headers: response.headers };
  }
  const code = () => emails.at(-1).textContent.match(/code is: ([0-9]{8})/)[1];
  async function verified(u = registration()) {
    assert.equal((await send('enrol', u)).status, 200);
    const firstCode = code();
    assert.equal((await send('verify', { id: u.id, owner_token: u.owner_token, code: firstCode })).status, 200);
    return u;
  }
  return { db, env, emails, calls, raw, send, code, verified, advance: seconds => { clock += seconds * 1000; },
    setStatus: s => { providerStatus = s; }, setFailure: s => { providerThrows = s; } };
}
test('health reports missing bindings/settings and both required database tables', async t => {
  const f = await fixture(t, false);
  const missing = await f.raw('https://radio.example.org/health', {}, { DB: undefined, RECOVERY_MASTER_KEY: '' });
  assert.equal(missing.status, 503); assert.deepEqual((await missing.json()).missing, ['DB binding', 'RECOVERY_MASTER_KEY secret']);
  assert.equal((await f.raw('https://radio.example.org/health')).status, 503);
  f.db.exec(schema); f.db.exec('DROP TABLE recovery_limits');
  assert.equal((await f.raw('https://radio.example.org/health')).status, 503);
  f.db.exec(schema);
  const ready = await f.raw('https://radio.example.org/health');
  assert.equal(ready.status, 200); assert.equal((await ready.json()).status, 'ok'); assert.equal(f.calls.length, 0);
});
test('registration verifies once, stores only protected keys/codes, and resets to the original key', async t => {
  const f = await fixture(t), u = registration();
  assert.equal((await f.send('enrol', u)).status, 200); const verify = f.code();
  let row = f.db.prepare('SELECT * FROM recovery_users WHERE id=?').get(u.id);
  assert.equal(row.verified, 0); assert.equal(row.key_cipher, null);
  for (const secret of [u.key, u.owner_token, verify, f.env.RECOVERY_MASTER_KEY, f.env.BREVO_API_KEY]) assert.ok(!JSON.stringify(row).includes(secret));
  assert.equal((await f.send('request-reset', { id: u.id })).status, 200); assert.equal(f.emails.length, 1);
  assert.equal((await f.send('verify', { id: u.id, owner_token: u.owner_token, code: verify })).status, 200);
  assert.equal((await f.send('verify', { id: u.id, owner_token: u.owner_token, code: verify })).status, 400);
  f.advance(60); assert.equal((await f.send('request-reset', { id: u.id })).status, 200); const reset = f.code();
  assert.equal((await f.send('verify', { id: u.id, owner_token: u.owner_token, code: reset })).status, 400);
  const result = await f.send('reset', { id: u.id, code: reset });
  assert.equal(result.status, 200); assert.equal(result.data.key, u.key); assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.equal((await f.send('reset', { id: u.id, code: reset })).status, 400);
  assert.equal(f.emails.length, 3); assert.match(f.emails.at(-1).subject, /used/);
});
test('wrong ownership cannot replace or verify an existing registration', async t => {
  const f = await fixture(t), u = await f.verified(); f.advance(60);
  const before = f.db.prepare('SELECT * FROM recovery_users WHERE id=?').get(u.id);
  assert.equal((await f.send('enrol', { ...u, owner_token: token(), key: token() })).status, 403);
  assert.equal((await f.send('verify', { id: u.id, owner_token: token(), code: '12345678' })).status, 403);
  assert.deepEqual(f.db.prepare('SELECT * FROM recovery_users WHERE id=?').get(u.id), before);
});
test('five wrong guesses lock a challenge and expiry rejects the correct code', async t => {
  const f = await fixture(t), u = await f.verified(); f.advance(60);
  await f.send('request-reset', { id: u.id }); const code = f.code(), wrong = code === '00000000' ? '11111111' : '00000000';
  for (let i = 0; i < 5; i++) assert.equal((await f.send('reset', { id: u.id, code: wrong })).status, 400);
  assert.equal((await f.send('reset', { id: u.id, code })).status, 400);
  f.advance(60); await f.send('request-reset', { id: u.id }); const next = f.code(); f.advance(600);
  assert.equal((await f.send('reset', { id: u.id, code: next })).status, 400);
});
test('resends enforce one minute cooldown and invalidate the previous challenge', async t => {
  const f = await fixture(t), u = await f.verified();
  assert.equal((await f.send('request-reset', { id: u.id })).status, 429);
  f.advance(60); await f.send('request-reset', { id: u.id }); const old = f.code();
  f.advance(60); await f.send('request-reset', { id: u.id }); const current = f.code();
  assert.notEqual(old, current);
  assert.equal((await f.send('reset', { id: u.id, code: old })).status, 400);
  assert.equal((await f.send('reset', { id: u.id, code: current })).data.key, u.key);
});
test('two concurrent uses of a reset code yield exactly one recovery key', async t => {
  const f = await fixture(t), u = await f.verified(); f.advance(60); await f.send('request-reset', { id: u.id });
  const data = { id: u.id, code: f.code() }, results = await Promise.all([f.send('reset', data), f.send('reset', data)]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 400]);
  assert.equal(results.filter(r => r.data.key === u.key).length, 1);
});
test('concurrent re-enrolments keep the winning address/key tied to its email code', async t => {
  const f = await fixture(t), u = await f.verified(); f.advance(60); const beforeCount = f.emails.length;
  const a = { ...u, key: token() }, b = { ...u, email: 'casey@example.org', key: token() };
  const results = await Promise.all([f.send('enrol', a), f.send('enrol', b)]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 429]); assert.equal(f.emails.length, beforeCount + 1);
  const winner = f.emails.at(-1).to[0].email === a.email ? a : b;
  assert.equal(f.db.prepare('SELECT pending_email FROM recovery_users WHERE id=?').get(u.id).pending_email, winner.email);
  assert.equal((await f.send('verify', { id: u.id, owner_token: u.owner_token, code: f.code() })).status, 200);
  f.advance(60); await f.send('request-reset', { id: u.id });
  assert.equal((await f.send('reset', { id: u.id, code: f.code() })).data.key, winner.key);
});
test('a pending replacement leaves the last verified recovery key usable until verification', async t => {
  const f = await fixture(t), u = await f.verified(); f.advance(60);
  await f.send('enrol', { ...u, email: 'casey@example.org', key: token() }); const abandoned = f.code();
  assert.equal(f.db.prepare('SELECT email FROM recovery_users WHERE id=?').get(u.id).email, u.email);
  f.advance(60); await f.send('request-reset', { id: u.id }); const reset = f.code();
  assert.equal(f.emails.at(-1).to[0].email, u.email);
  assert.equal((await f.send('verify', { id: u.id, owner_token: u.owner_token, code: abandoned })).status, 400);
  assert.equal((await f.send('reset', { id: u.id, code: reset })).data.key, u.key);
});
test('allowlist blocks unapproved addresses and disables recovery for removed addresses', async t => {
  const f = await fixture(t);
  assert.equal((await f.send('enrol', registration(2, 'outsider@example.org'))).status, 403); assert.equal(f.emails.length, 0);
  const u = await f.verified(registration(1, 'Kevin@Example.org')); f.advance(60);
  const generic = (await f.send('request-reset', { id: id(9) })).data;
  f.env.ALLOWED_EMAILS = 'casey@example.org';
  assert.deepEqual((await f.send('request-reset', { id: u.id })).data, generic);
  assert.equal((await f.send('reset', { id: u.id, code: '12345678' })).status, 400); assert.equal(f.emails.length, 1);
});
test('Brevo errors never expose provider details and invalidate the unsent code', async t => {
  const f = await fixture(t), u = registration(); f.setStatus(401);
  const failed = await f.send('enrol', u);
  assert.equal(failed.status, 503); assert.match(failed.data.error, /API key/);
  assert.ok(!JSON.stringify(failed.data).includes('provider-internal')); assert.ok(!JSON.stringify(failed.data).includes(f.env.BREVO_API_KEY));
  assert.equal(f.db.prepare('SELECT code_hash FROM recovery_users WHERE id=?').get(u.id).code_hash, null);
  f.advance(60); f.setStatus(429); assert.equal((await f.send('enrol', u)).status, 429);
  f.advance(60); f.setFailure(true); const unreachable = await f.send('enrol', u);
  assert.equal(unreachable.status, 503); assert.match(unreachable.data.error, /reach Brevo/); assert.ok(!JSON.stringify(unreachable).includes('fake credential'));
});
test('email hourly limit persists in D1 across new binding objects', async t => {
  const f = await fixture(t), u = registration();
  for (let i = 0; i < 5; i++) { assert.equal((await f.send('enrol', u)).status, 200); f.advance(60); }
  f.env.DB = d1(f.db);
  assert.equal((await f.send('enrol', u)).status, 429); assert.equal(f.emails.length, 5);
  f.advance(3600); assert.equal((await f.send('enrol', u)).status, 200);
});
test('daily cap is atomic and includes recovery notifications', async t => {
  const f = await fixture(t), u = await f.verified(); f.advance(60);
  const now = Math.floor(Date.now() / 1000), day = Math.floor(now / 86400);
  f.db.prepare('UPDATE recovery_limits SET count=249 WHERE bucket=?').run('mail-day:' + day);
  assert.equal((await f.send('request-reset', { id: u.id })).status, 200); const code = f.code();
  const calls = f.calls.length;
  assert.equal((await f.send('reset', { id: u.id, code })).status, 200);
  assert.equal(f.calls.length, calls); // A saturated notification budget cannot block recovery.
  f.advance(60); assert.equal((await f.send('request-reset', { id: u.id })).status, 429);
  assert.equal(f.db.prepare('SELECT count FROM recovery_limits WHERE bucket=?').get('mail-day:' + day).count, 250);
});
test('IP and profile request limits are stored and independently enforced', async t => {
  const f = await fixture(t);
  for (let i = 1; i <= 30; i++) assert.equal((await f.send('request-reset', { id: id(i) })).status, 200);
  assert.equal((await f.send('request-reset', { id: id(31) })).status, 429);
  f.advance(60);
  for (let i = 1; i <= 30; i++) assert.equal((await f.send('request-reset', { id: id(50) }, { ip: '192.0.2.' + i })).status, 200);
  assert.equal((await f.send('request-reset', { id: id(50) }, { ip: '192.0.2.100' })).status, 429);
});
test('registration count is bounded without deleting existing users', async t => {
  const f = await fixture(t), insert = f.db.prepare('INSERT INTO recovery_users(id,owner_hash,created_at) VALUES(?,?,?)');
  for (let i = 100; i < 600; i++) insert.run(id(i), 'test-owner', 1);
  assert.equal((await f.send('enrol', registration())).status, 409); assert.equal(f.emails.length, 0);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM recovery_users').get().n, 500);
});
test('HTTPS, route, content type, JSON, key size and streamed body limits are enforced', async t => {
  const f = await fixture(t);
  assert.equal((await f.raw('http://radio.example.org/health')).status, 400);
  assert.equal((await f.raw('https://radio.example.org/unknown')).status, 404);
  assert.equal((await f.raw('https://radio.example.org/v1/reset')).status, 405);
  assert.equal((await f.raw('https://radio.example.org/v1/reset?x=1', { method: 'POST' })).status, 404);
  assert.equal((await f.raw('https://radio.example.org/v1/reset', { method: 'POST', body: '{}' })).status, 415);
  for (const [body, expected] of [['{', 400], ['[]', 400], [JSON.stringify({ id: 'bad' }), 400], [JSON.stringify({ id: id(1), padding: 'x'.repeat(8300) }), 413]]) {
    assert.equal((await f.raw('https://radio.example.org/v1/reset', { method: 'POST', headers: { 'content-type': 'application/json' }, body })).status, expected);
  }
  assert.equal((await f.send('enrol', { ...registration(), key: 'abcd' })).status, 400);
  assert.equal((await f.send('enrol', { ...registration(), owner_token: 'abcd' })).status, 400);
});
test('public setup page has no saved credentials, no external scripts and a local key generator', async t => {
  const f = await fixture(t), response = await f.raw('https://radio.example.org/'), html = await response.text();
  assert.equal(response.status, 200); assert.match(html, /crypto.getRandomValues\(new Uint8Array\(32\)\)/);
  assert.match(response.headers.get('content-security-policy'), /connect-src 'none'/);
  assert.ok(!html.includes(f.env.RECOVERY_MASTER_KEY)); assert.ok(!html.includes(f.env.BREVO_API_KEY));
  assert.ok(!/<script[^>]*src=/i.test(html)); assert.equal(f.calls.length, 0);
});
test('existing APK profile module completes verification and recovery without losing study work', async t => {
  const f = await fixture(t), C = require('../app/src/main/assets/core.js'), P = require('../app/src/main/assets/profiles.js');
  const bank = JSON.parse(fs.readFileSync(path.join(__dirname, '../app/src/main/assets/questions.json'), 'utf8'));
  const byId = Object.fromEntries(bank.map(q => [q.id, q])); let vault = '';
  const store = await new P.Store({ read: () => vault, write: text => { vault = text; return true; }, readLegacy: () => '', clearLegacy() {}, fresh: C.fresh, validate: d => C.validate(d, byId) }).init();
  const profile = await store.create({ name: 'Kevin', email: 'kevin@example.org', password: 'Original radio passphrase', avatar: '' });
  const progress = C.fresh(); progress.completed = ['electricity']; progress.personalNotes = [C.personalNote('Remember the antenna', 'Check the feed line.')];
  progress.active = C.session(bank.slice(0, 10), 'quick', 'Unfinished radio quiz'); progress.active.answers[0] = 2; await store.save(progress);
  P.request = async (url, action, data) => {
    assert.equal(url, 'https://radio.example.org'); assert.equal('password' in data, false); assert.equal('progress' in data, false);
    const response = await f.send(action, data); if (response.status !== 200) throw Error(response.data.error); return response.data;
  };
  t.after(() => { delete P.request; });
  await store.enrol('https://radio.example.org'); await store.verifyEmail(f.code()); await store.lock(); f.advance(60);
  await store.requestReset(profile); await store.resetPassword(profile, f.code(), 'Replacement radio passphrase');
  assert.equal(store.session, null); await assert.rejects(store.login(profile, 'Original radio passphrase'), /Incorrect/);
  assert.deepEqual(await store.login(profile, 'Replacement radio passphrase'), progress);
  assert.ok(!vault.includes('Remember the antenna')); assert.ok(!vault.includes('Replacement radio passphrase'));
});
