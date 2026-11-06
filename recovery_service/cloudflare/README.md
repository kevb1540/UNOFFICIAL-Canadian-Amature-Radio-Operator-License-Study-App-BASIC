# Cloudflare recovery service

©️ Kevin W. Brown 2026

ES module Worker, persistent D1 database and Brevo transactional email,
compatible with Android APK 2.3.0. No external code packages or always-on
personal computer required. Use [the dashboard guide](../../Email_Recovery_Setup.md).
Its standalone downloads `Radio_Recovery_Worker.js` and `Radio_Recovery_Schema.sql`
are copies of this directory's `worker.js` and `schema.sql`.

| Name | Type | Value |
| --- | --- | --- |
| `DB` | D1 binding | Database initialized with `schema.sql` |
| `BREVO_API_KEY` | Secret | Active normal Brevo API key |
| `RECOVERY_MASTER_KEY` | Secret | Base64 of 32 cryptographically random bytes |
| `SENDER_EMAIL` | Text | Verified Brevo sender |
| `ALLOWED_EMAILS` | Text | Approved recovery emails, comma/semicolon/newline separated |
| `SENDER_NAME` | Text, optional | Sender name |

The HTTPS root generates a master key in the visitor's browser only. Use it
once for a new empty database. `/health` checks settings and tables; email
verification in the app tests delivery. Keep the master key across code updates.

## Optional CLI route

From this directory, with a supported Node.js runtime and your Cloudflare login:

```bash
npx wrangler@latest login
npx wrangler@latest d1 create radio-recovery
```

Copy the resulting database ID to `database_id` in `wrangler.jsonc`. Replace
the example `SENDER_EMAIL` and `ALLOWED_EMAILS` values with real addresses.
Initialize the remote database, enter secrets at the private prompts and deploy:

```bash
npx wrangler@latest d1 execute radio-recovery --remote --file=./schema.sql
npx wrangler@latest secret put BREVO_API_KEY
npx wrangler@latest secret put RECOVERY_MASTER_KEY
npx wrangler@latest deploy
```

Generate the master key locally before entering it, or deploy once and use the
root page's generator. A local Node.js generator is:

```bash
node -e 'console.log(require("node:crypto").randomBytes(32).toString("base64"))'
```

Keep that value private. Do not put secrets in command arguments, source or
`wrangler.jsonc`. Future CLI deployments use that file's Text settings; keep
them aligned with dashboard edits. No actual credentials are supplied here.

## Verification

From the project root using Node.js 24 or newer for built-in SQLite:

```bash
node --test tests/cloudflare_recovery.test.cjs
```

These tests use the exact SQL with SQLite and intercept only outbound Brevo
HTTP. They include the app profile module's encrypt/verify/reset/login flow.
They do not deploy or deliver external email. The separate
`tests/cloudflare_setup_ui.test.cjs` checks key generation and layout in
Playwright; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for a custom Chromium.

The APK uses HTTPS JSON POSTs to `/v1/enrol`, `/v1/verify`, `/v1/request-reset`
and `/v1/reset`. No CORS access is enabled; Android uses its native HTTPS bridge.
Conditional SQL prevents parallel replay and ties each pending replacement
address/key to its own verification code.
