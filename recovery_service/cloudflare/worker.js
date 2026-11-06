// ©️ Kevin W. Brown 2026
// Cloudflare module Worker. Bind D1 as DB; configure the secrets listed in README.
// Protocol-compatible with Canadian radio workbook APK 2.3.0. No external packages.
const utf = new TextEncoder();
const MAX_BODY = 8192;
const CODE_TTL = 600;
const COOLDOWN = 60;
const MAX_USERS = 500;
const DAILY_MAIL_LIMIT = 250;
const GENERIC_RESET = { ok: true, message: 'If this profile has a verified recovery email, a code was requested.' };
class RecoveryError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
function b64(raw) { return btoa(String.fromCharCode(...raw)); }
function un64(value, size = 32) {
  if (typeof value !== 'string' || value.length > 128 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new RecoveryError('Invalid recovery credentials.');
  let raw;
  try { raw = Uint8Array.from(atob(value), c => c.charCodeAt(0)); } catch { throw new RecoveryError('Invalid recovery credentials.'); }
  if (raw.length !== size) throw new RecoveryError('Invalid recovery credentials.');
  return raw;
}
function randomId() { return [...crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, '0')).join(''); }
function code8() {
  const a = new Uint32Array(1);
  do { crypto.getRandomValues(a); } while (a[0] >= 4200000000);
  return String(a[0] % 100000000).padStart(8, '0');
}
function equal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let difference = 0; for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
function validEmail(email) { return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' } });
}
function configuration(env) {
  const missing = [];
  if (!env.DB?.prepare) missing.push('DB binding');
  if (!env.BREVO_API_KEY?.trim()) missing.push('BREVO_API_KEY secret');
  try { un64(env.RECOVERY_MASTER_KEY?.trim()); } catch { missing.push('RECOVERY_MASTER_KEY secret'); }
  if (!validEmail(env.SENDER_EMAIL?.trim())) missing.push('SENDER_EMAIL');
  const allowed = new Set(String(env.ALLOWED_EMAILS || '').split(/[,;\n]/).map(x => x.trim().toLowerCase()).filter(Boolean));
  if (!allowed.size || [...allowed].some(x => !validEmail(x))) missing.push('ALLOWED_EMAILS');
  return { missing, allowed };
}
async function keys(env) {
  const raw = await crypto.subtle.importKey('raw', un64(env.RECOVERY_MASTER_KEY.trim()), 'HKDF', false, ['deriveKey']);
  const derivation = info => ({ name: 'HKDF', hash: 'SHA-256', salt: utf.encode('Maplewave recovery v1'), info: utf.encode(info) });
  const [aes, mac] = await Promise.all([
    crypto.subtle.deriveKey(derivation('encryption'), raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']),
    crypto.subtle.deriveKey(derivation('authentication'), raw, { name: 'HMAC', hash: 'SHA-256', length: 256 }, false, ['sign'])
  ]);
  return { aes, mac };
}
async function digest(mac, text) { return b64(new Uint8Array(await crypto.subtle.sign('HMAC', mac, utf.encode(text)))); }
async function seal(key, profileId, aes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: utf.encode('MWR1:' + profileId) }, aes, key);
  return { iv: b64(iv), cipher: b64(new Uint8Array(cipher)) };
}
async function reveal(row, aes) {
  const raw = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: un64(row.key_iv, 12), additionalData: utf.encode('MWR1:' + row.id) }, aes, un64(row.key_cipher, 48)));
  if (raw.length !== 32) throw new Error('Invalid stored key');
  return b64(raw);
}
async function limit(db, bucket, maximum, seconds, now) {
  const window = Math.floor(now / seconds);
  const row = await db.prepare(`INSERT INTO recovery_limits(bucket,count,expires) VALUES(?,1,?)
    ON CONFLICT(bucket) DO UPDATE SET count=count+1 WHERE count<? RETURNING count`)
    .bind(bucket + ':' + window, (window + 1) * seconds, maximum).first();
  if (!row) throw new RecoveryError('Too many requests. Please try again later.', 429);
}
async function mail(env, db, now, recipient, subject, text) {
  await limit(db, 'mail-day', DAILY_MAIL_LIMIT, 86400, now);
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 8000);
  let response;
  try {
    response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST', signal: controller.signal,
      headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': env.BREVO_API_KEY.trim() },
      body: JSON.stringify({ sender: { email: env.SENDER_EMAIL.trim(), name: String(env.SENDER_NAME || 'Kevin’s Radio Workbook').slice(0, 80) }, to: [{ email: recipient }], subject, textContent: text })
    });
  } catch { throw new RecoveryError('Could not reach Brevo. Try again later.', 503); }
  finally { clearTimeout(timer); }
  if (!response.ok) {
    // Never reflect provider response bodies, credentials or recipient details.
    await response.body?.cancel();
    if (response.status === 401) throw new RecoveryError('Brevo rejected the API key. Check BREVO_API_KEY in Cloudflare.', 503);
    if (response.status === 429) throw new RecoveryError('The email provider’s sending limit was reached. Try again later.', 429);
    throw new RecoveryError('Brevo did not accept the email (status ' + response.status + '). Check the verified sender and transactional email activation.', 503);
  }
  await response.body?.cancel();
}
async function challenge(env, row, purpose, recipient, mac, now, registration = null) {
  if (row.last_sent && now - row.last_sent < COOLDOWN) throw new RecoveryError('Please wait one minute before requesting another code.', 429);
  await limit(env.DB, 'mail-hour:' + await digest(mac, recipient.toLowerCase()), 5, 3600, now);
  const code = code8(), nonce = randomId(), hash = await digest(mac, row.id + ':' + purpose + ':' + nonce + ':' + code);
  let claimed;
  if (registration) {
    // Candidate address/key and their challenge must change together. A resend cannot
    // attach a previous email's code to a different pending registration.
    claimed = await env.DB.prepare(`INSERT INTO recovery_users
      (id,owner_hash,pending_email,pending_iv,pending_cipher,challenge_id,code_hash,code_purpose,code_expires,last_sent,created_at)
      SELECT ?,?,?,?,?,?,?,'verify',?,?,? WHERE EXISTS(SELECT 1 FROM recovery_users WHERE id=?) OR (SELECT COUNT(*) FROM recovery_users)<?
      ON CONFLICT(id) DO UPDATE SET pending_email=excluded.pending_email,pending_iv=excluded.pending_iv,
        pending_cipher=excluded.pending_cipher,challenge_id=excluded.challenge_id,code_hash=excluded.code_hash,
        code_purpose='verify',code_expires=excluded.code_expires,tries=0,last_sent=excluded.last_sent
      WHERE recovery_users.owner_hash=excluded.owner_hash AND (recovery_users.last_sent=0 OR recovery_users.last_sent<=?) RETURNING id`)
      .bind(row.id, registration.owner, recipient, registration.iv, registration.cipher, nonce, hash,
        now + CODE_TTL, now, now, row.id, MAX_USERS, now - COOLDOWN).first();
  } else {
    claimed = await env.DB.prepare(`UPDATE recovery_users SET challenge_id=?,code_hash=?,code_purpose=?,code_expires=?,tries=0,last_sent=?
      WHERE id=? AND (last_sent=0 OR last_sent<=?) RETURNING id`)
      .bind(nonce, hash, purpose, now + CODE_TTL, now, row.id, now - COOLDOWN).first();
  }
  if (!claimed) {
    const current = await env.DB.prepare('SELECT owner_hash,last_sent FROM recovery_users WHERE id=?').bind(row.id).first();
    if (registration && current && !equal(current.owner_hash, registration.owner)) throw new RecoveryError('Recovery registration could not be verified.', 403);
    if (!current) throw new RecoveryError('Registration could not be saved. Contact the service owner.', 409);
    throw new RecoveryError('Please wait one minute before requesting another code.', 429);
  }
  const label = purpose === 'verify' ? 'email verification' : 'password reset';
  try {
    await mail(env, env.DB, now, recipient, 'Canadian radio workbook: ' + label + ' code',
      'Your ' + label + ' code is: ' + code + '\n\nEnter it in the Canadian Amature Radio Unofficial Basic Certificate Study Guide And Reference app.\nIt expires in 10 minutes and can be used once.\n\nIf you did not request this code, ignore this message. Never share it. No password or study progress is included in this email.');
  } catch (e) {
    await env.DB.prepare('UPDATE recovery_users SET code_hash=NULL,code_expires=0 WHERE id=? AND challenge_id=?').bind(row.id, nonce).run();
    throw e;
  }
}
function invalidCode() { return new RecoveryError('Invalid or expired code. Request a new code.'); }
async function checkedCode(db, row, code, purpose, mac, now) {
  if (!row || typeof code !== 'string' || !/^[0-9]{8}$/.test(code) || row.code_purpose !== purpose || !row.code_hash || row.code_expires <= now || row.tries >= 5) throw invalidCode();
  const expected = await digest(mac, row.id + ':' + purpose + ':' + row.challenge_id + ':' + code);
  if (!equal(expected, row.code_hash)) {
    await db.prepare('UPDATE recovery_users SET tries=tries+1 WHERE id=? AND challenge_id=? AND tries<5').bind(row.id, row.challenge_id).run();
    throw invalidCode();
  }
}
async function readBody(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new RecoveryError('Use application/json.', 415);
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY) throw new RecoveryError('Request is too large.', 413);
  if (!request.body) throw new RecoveryError('Invalid JSON request.');
  const reader = request.body.getReader(), chunks = []; let total = 0;
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    total += value.length; if (total > MAX_BODY) { await reader.cancel(); throw new RecoveryError('Request is too large.', 413); } chunks.push(value);
  }
  const joined = new Uint8Array(total); let offset = 0; for (const c of chunks) { joined.set(c, offset); offset += c.length; }
  let data; try { data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(joined)); } catch { throw new RecoveryError('Invalid JSON request.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.id !== 'string' || !/^[a-f0-9]{32}$/.test(data.id)) throw new RecoveryError('Invalid profile identifier.');
  return data;
}
async function handle(request, env, ctx) {
  const url = new URL(request.url);
  if (url.protocol !== 'https:') return json({ error: 'HTTPS is required.' }, 400);
  if (request.method === 'GET' && url.pathname === '/') return setupPage();
  if (request.method === 'GET' && url.pathname === '/health') {
    const { missing } = configuration(env); if (missing.length) return json({ status: 'setup_required', missing }, 503);
    try {
      await env.DB.prepare('SELECT id FROM recovery_users LIMIT 1').first();
      await env.DB.prepare('SELECT bucket FROM recovery_limits LIMIT 1').first();
    } catch { return json({ status: 'setup_required', missing: ['Run schema.sql in the bound D1 database'] }, 503); }
    return json({ status: 'ok', service: 'Canadian radio email recovery', version: '1.0.0' });
  }
  if (!/^\/v1\/(enrol|verify|request-reset|reset)$/.test(url.pathname) || url.search) return json({ error: 'Not found.' }, 404);
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  const config = configuration(env);
  if (config.missing.length) throw new RecoveryError('Recovery service setup is incomplete. Open /health to see the missing settings.', 503);
  const data = await readBody(request), now = Math.floor(Date.now() / 1000), { aes, mac } = await keys(env);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  await limit(env.DB, 'ip:' + await digest(mac, ip), 30, 60, now);
  await limit(env.DB, 'profile:' + data.id, 30, 60, now);
  const action = url.pathname.slice(4);
  let row = await env.DB.prepare('SELECT * FROM recovery_users WHERE id=?').bind(data.id).first();
  if (action === 'enrol') {
    if (!validEmail(data.email) || data.email !== data.email.trim()) throw new RecoveryError('Enter a valid email address.');
    if (!config.allowed.has(data.email.toLowerCase())) throw new RecoveryError('This email address has not been enabled for recovery. Ask Kevin to add it to ALLOWED_EMAILS.', 403);
    un64(data.owner_token); const profileKey = un64(data.key), owner = await digest(mac, 'owner:' + data.owner_token);
    if (row && !equal(row.owner_hash, owner)) throw new RecoveryError('Recovery registration could not be verified.', 403);
    if (row?.last_sent && now - row.last_sent < COOLDOWN) throw new RecoveryError('Please wait one minute before requesting another code.', 429);
    await limit(env.DB, 'enrol-ip:' + await digest(mac, ip), 10, 3600, now);
    const encrypted = await seal(profileKey, data.id, aes); profileKey.fill(0);
    await challenge(env, row || { id: data.id, last_sent: 0 }, 'verify', data.email, mac, now, { owner, ...encrypted });
    return json({ ok: true });
  }
  if (action === 'verify') {
    un64(data.owner_token); const owner = await digest(mac, 'owner:' + data.owner_token);
    if (!row || !equal(row.owner_hash, owner)) throw new RecoveryError('Recovery registration could not be verified.', 403);
    await checkedCode(env.DB, row, data.code, 'verify', mac, now);
    // The comparison and consumption are conditional SQL: concurrent requests cannot both succeed.
    const consumed = await env.DB.prepare(`UPDATE recovery_users SET email=pending_email,key_iv=pending_iv,key_cipher=pending_cipher,
      verified=1,pending_email=NULL,pending_iv=NULL,pending_cipher=NULL,code_hash=NULL,code_expires=0
      WHERE id=? AND owner_hash=? AND challenge_id=? AND code_hash=? AND code_purpose='verify' AND code_expires>? AND tries<5 RETURNING id`)
      .bind(data.id, owner, row.challenge_id, row.code_hash, now).first();
    if (!consumed) throw invalidCode(); return json({ ok: true });
  }
  if (action === 'request-reset') {
    if (row?.verified && config.allowed.has(row.email.toLowerCase())) await challenge(env, row, 'reset', row.email, mac, now);
    return json(GENERIC_RESET);
  }
  if (!row?.verified || !config.allowed.has(row.email.toLowerCase())) throw invalidCode();
  await checkedCode(env.DB, row, data.code, 'reset', mac, now);
  const consumed = await env.DB.prepare(`UPDATE recovery_users SET code_hash=NULL,code_expires=0
    WHERE id=? AND verified=1 AND challenge_id=? AND code_hash=? AND code_purpose='reset' AND code_expires>? AND tries<5
    RETURNING id,key_iv,key_cipher,email`).bind(data.id, row.challenge_id, row.code_hash, now).first();
  if (!consumed) throw invalidCode();
  const key = await reveal(consumed, aes);
  // Notification cannot block a valid recovery; codes and notifications share the 250/day budget.
  ctx.waitUntil(mail(env, env.DB, now, consumed.email, 'Canadian radio workbook: recovery code used',
    'A one-time recovery code for your radio workbook profile was used.\nIf this was not you, contact Kevin. Your password is not included in this email.').catch(() => {}));
  return json({ key });
}
export default {
  async fetch(request, env, ctx) {
    try { return await handle(request, env, ctx); }
    catch (e) { return json({ error: e instanceof RecoveryError ? e.message : 'Recovery service unavailable. Check the D1 schema, binding and service settings.' }, e instanceof RecoveryError ? e.status : 503); }
    finally {
      // Bound cleanup work with an expiry index. No user records or keys are deleted.
      if (env.DB && crypto.getRandomValues(new Uint8Array(1))[0] < 8) {
        try {
          ctx.waitUntil(env.DB.prepare('DELETE FROM recovery_limits WHERE bucket IN (SELECT bucket FROM recovery_limits WHERE expires<=? LIMIT 100)')
            .bind(Math.floor(Date.now() / 1000)).run().catch(() => {}));
        } catch { /* Health/setup responses must also work before the DB binding is valid. */ }
      }
    }
  }
};
function setupPage() {
  const nonce = randomId();
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Radio workbook recovery setup</title>
<style>body{font:17px/1.6 system-ui;max-width:760px;margin:40px auto;padding:0 20px;background:#0b121f;color:#eef6fa}h1{line-height:1.2}a{color:#69ead2}button{font:inherit;padding:12px 18px;border:0;border-radius:10px;background:#69ead2;color:#082c25;cursor:pointer;margin:8px 10px 8px 0}input{box-sizing:border-box;width:100%;padding:12px;font:15px monospace;background:#152437;color:#fff;border:1px solid #426278;border-radius:8px}.note{padding:15px;border-left:3px solid #ffc179;background:#33281d}code{overflow-wrap:anywhere}small{color:#aec4d0}</style>
<h1>Canadian radio workbook recovery</h1><p>The Worker is deployed. <a href="/health">Check setup status</a> to confirm that D1 and the settings are ready.</p>
<h2>Generate your master key once</h2><p>Use this only when setting up a new, empty recovery database. The key is generated in this browser and is never sent by this page.</p>
<button id="generate">Generate private key</button><label for="key">New master key</label><input id="key" readonly autocomplete="off" spellcheck="false"><button id="copy">Copy key</button><p id="status" role="status"></p>
<p class="note">Save the generated value as the <code>RECOVERY_MASTER_KEY</code> secret in Cloudflare, and keep a private backup. Keep the same key for future deployments. Replacing it breaks access to existing recovery registrations.</p>
<h2>Required Cloudflare configuration</h2><ul><li>D1 binding: <code>DB</code>, initialized with schema.sql</li><li>Secret: <code>BREVO_API_KEY</code></li><li>Secret: <code>RECOVERY_MASTER_KEY</code></li><li>Text: <code>SENDER_EMAIL</code> — your verified Brevo sender</li><li>Text: <code>ALLOWED_EMAILS</code> — approved user email addresses, separated by commas</li></ul>
<p>Once <code>/health</code> reports <code>status: ok</code>, enter this site's origin in the Android app's Email recovery setup. Then sign in to each profile and verify its recovery email.</p><small>This page cannot read saved Cloudflare secrets or send emails. No API key or password should be pasted into this page.</small>
<script nonce="${nonce}">const key=document.getElementById('key'),status=document.getElementById('status');document.getElementById('generate').onclick=()=>{const data=crypto.getRandomValues(new Uint8Array(32));key.value=btoa(String.fromCharCode(...data));status.textContent='Generated locally. Copy to Cloudflare as a Secret.';};document.getElementById('copy').onclick=async()=>{if(!key.value)return;try{await navigator.clipboard.writeText(key.value);status.textContent='Copied. Paste into the Cloudflare secret setting.';}catch{key.select();status.textContent='Select and copy the key, then paste it into Cloudflare.';}};</script></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-content-type-options': 'nosniff', 'content-security-policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` } });
}
