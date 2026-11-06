# Cloudflare + Brevo email recovery setup

For Canadian Amature Radio Unofficial Basic Certificate Study Guide And Reference, APK 2.3.0 (230).  
©️ Kevin W. Brown 2026 · Hosting addition: 16 October 2026

Kevin, these steps connect your Cloudflare and Brevo accounts to the APK you
already have. Cloudflare runs the service and database; Brevo sends the emails.
Your computer can be switched off afterward. No APK update is needed.

**The files are ready to deploy. A live service and real email delivery have
not been configured or tested in your accounts.** Keep both accounts on their
Free plans to stay within the free allowances.

Download these two files supplied with this guide:

- `Radio_Recovery_Worker.js` — paste its entire contents into the Worker editor.
- `Radio_Recovery_Schema.sql` — paste its entire contents into the D1 console.

The same files are `recovery_service/cloudflare/worker.js` and `schema.sql` in
the updated source ZIP. Open them in a plain text editor to copy their contents;
do not paste a download link or Markdown code fences into Cloudflare.

## 1. Prepare Brevo

1. Sign in at [Brevo](https://app.brevo.com/).
2. Open your account dropdown → **Settings → Senders, Domains, IPs → Senders**.
3. Choose **Add a sender**. Use `Kevin’s Radio Workbook` as the From name and an
   email address you control as the From email.
4. Save. If Brevo emails you a verification code, enter it in Brevo. This is
   separate from the app's eight-digit recovery codes.
5. Complete any account review or transactional-email activation Brevo requests.

Use that verified address for `SENDER_EMAIL` below. It can differ from the
email on your app profile. If you already own a domain, authenticate it in
Brevo for better delivery. Brevo also documents individual sender verification;
a free mailbox's domain cannot be authenticated by you. A custom domain may
have a separate cost.

Next open **Settings → SMTP & API → API Keys & MCP**:

1. Choose **Generate a new API key** and complete the identity check if prompted.
2. Name it `Radio recovery` and choose an expiration setting you can maintain.
3. Generate it and keep a private copy. Use a normal **API key**, not an SMTP
   key or MCP server key. Do not activate the MCP conversion option.
4. Paste it directly into a Cloudflare **Secret** in step 5.

Do not send the key in chat, put it in code or include it in screenshots. Brevo
says a key may also be deactivated after 90 days without a successful API call,
even with no expiration selected. Watch its notices and periodically test a
recovery email, or reactivate the key if necessary.

## 2. Create the Cloudflare database

1. Sign in at [Cloudflare](https://dash.cloudflare.com/).
2. Open **Storage & databases → D1 SQL database**. Some layouts show **D1**
   directly in the sidebar.
3. Choose **Create Database**, name it `radio-recovery`, and create it.
4. Open the database's **Console**.
5. Open `Radio_Recovery_Schema.sql`, copy everything, paste it into the console,
   then choose **Execute**.
6. Under **Tables**, confirm `recovery_users` and `recovery_limits` exist.

The supplied SQL creates tables and an index without deleting data. You can
run it again without erasing recovery registrations.

## 3. Create the Worker

1. Open **Workers & Pages → Create application**.
2. Choose **Start with Hello World! → Get started**. Some layouts label this
   **Create Worker** instead.
3. Name it `radio-recovery`, or another available name, then **Deploy**.
4. Choose **Edit code**. Replace all the starter code in `worker.js` with the
   complete contents of `Radio_Recovery_Worker.js`.
5. Choose **Deploy**, or **Save and deploy** if that is the button label.
6. Note the production **workers.dev** address Cloudflare gives you. It will
   resemble `https://radio-recovery.YOUR-SUBDOMAIN.workers.dev`.

Use your actual address; that example is a placeholder. You do not need a
custom website domain for workers.dev. The endpoint must be reachable by the
Android app; a Cloudflare Access login screen would block recovery requests.

## 4. Attach the database

Return to your Worker's overview:

1. Open **Bindings → Add binding**.
2. Choose **D1 database → Add binding**.
3. Enter **`DB`** in **Variable name**, with uppercase D and B exactly.
4. Select your `radio-recovery` database.
5. Choose **Add binding**, then deploy if prompted.

The database can be called `radio-recovery`; its binding must be called `DB`.

## 5. Add secrets and settings

Open your Worker's public HTTPS address in a browser. You should see
**Canadian radio workbook recovery**, rather than Hello World.

Choose **Generate private key** once, then **Copy key**. The page creates a
random 32-byte master key locally in your browser; it does not send or save it.
Keep a private backup and use that value below.

Use this generator for a **new, empty recovery database only**. Keep the same
master key when redeploying code. Replacing it makes existing recovery
registrations unusable. Do not substitute a user-chosen password.

In Cloudflare open your Worker → **Settings → Variables and Secrets → Add**.
Add each row separately, selecting the indicated type and exact name:

| Type | Name | Value |
| --- | --- | --- |
| **Secret** | `BREVO_API_KEY` | Your normal Brevo API key |
| **Secret** | `RECOVERY_MASTER_KEY` | The generated private master key |
| **Text** | `SENDER_EMAIL` | Your verified Brevo sender address |
| **Text** | `ALLOWED_EMAILS` | Your profile email; add other approved profile emails separated by commas |
| Text, optional | `SENDER_NAME` | `Kevin’s Radio Workbook` |

For example, `ALLOWED_EMAILS` could contain
`kevin@example.com,another-user@example.com`, with your real addresses instead.
Matching ignores capitalization. This limits who can register for recovery.
Add another user's email here before they enable recovery in their profile.

Deploy the settings. Keep secret values out of Text variables, code and the
app's service-address field.

## 6. Check the service and connect the app

Open your Worker address with **`/health`** added, for example:

```text
https://radio-recovery.YOUR-SUBDOMAIN.workers.dev/health
```

When settings and tables are ready it returns:

```json
{"status":"ok","service":"Canadian radio email recovery","version":"1.0.0"}
```

If it returns `setup_required`, fix the entries under `missing`.
**This checks configuration and tables, not email delivery.** A wrong API key
or an unverified sender may still need fixing after this check.

In Android app version 2.3.8 and newer, the recovery origin is already built in:
**https://radio-recovery.kevb1540.workers.dev**. Users do not enter a service address.

1. Select your user and sign in with its current password.
2. Open **Profile → Profile settings**, also available under **Backup & settings**.
3. Choose **Email verification code**.
4. Enter the **eight-digit** code from the email and verify it.
5. Confirm the app says **Email verified**.

Each profile must verify its own email. Entering an email when creating a user
does not enable recovery by itself.

## 7. Test recovery

1. Sign out and wait at least one minute after the previous code request.
2. Choose **Lost password**, select the user, then **Email reset code**.
3. Check that user's inbox and spam folder. Enter the newest eight-digit code
   and choose a new password, entering it twice.
4. Sign in with the new password. Check that your notes, completed lessons and
   unfinished tests are still there.

The email carries a one-time reset code. The existing password is never sent
to the service or emailed. Codes last ten minutes, work once and stop working
after five wrong guesses. After a resend, only the newest code works.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Hello World | Replace the starter code and deploy to production. |
| Missing DB or schema | Bind your D1 database as `DB`; execute the SQL in that database. |
| Missing setting at `/health` | Check its exact name, type and value, then deploy settings. The master key is the generated base64 value. |
| Email address not enabled | Add the profile's actual email to `ALLOWED_EMAILS` and deploy. |
| Brevo rejects the API key | Use an active normal API key. Replace `BREVO_API_KEY` as a Secret, keeping `RECOVERY_MASTER_KEY` unchanged. |
| Brevo status 400 or 403 | Check the verified sender, transactional activation and Brevo's API security notices/logs. Unknown-IP blocking may need a provider-supported setup for Cloudflare's variable serverless outbound IPs. |
| Accepted request, no email | Check spam and Brevo's Transactional email logs. Provider acceptance does not guarantee inbox delivery. Unknown/unverified profiles receive no reset email. |
| Wait / too many requests | Wait for the cooldown or hourly/daily budget before retrying. |
| Invalid code | Use the newest code within ten minutes. After five wrong attempts, request a new code when the cooldown permits. |
| Recovery key does not match | Keep your phone data. Check that this profile was verified against this service. Preserve the master key and database while investigating. |

## Limits and backups

As checked on 16 October 2026, Workers Free includes 100,000 requests/day and
10 ms CPU per invocation; network wait time is separate. D1 Free includes
5 million rows read/day, 100,000 rows written/day and 5 GB total storage.
Brevo Free advertises 300 emails/day. Account allowances include other uses
of the same services and may change. This code does not buy upgrades.

The Worker adds smaller limits: 250 outgoing email attempts per UTC day,
including code emails and recovery-used notifications; five code emails per
recipient per UTC hour; a one-minute profile cooldown; request limits; and
500 registered profiles maximum. Failed attempts can consume the service's
budget. Other Brevo sending can still consume your account's allowance.

D1 stores recovery emails, opaque profile IDs, HMAC-protected registration
secrets/codes, and AES-256-GCM-encrypted random profile keys. It does not store
passwords, notes, avatars, scores or completed lessons. The master key and API
key stay in Cloudflare Secrets. The service operator controls recovery keys;
use an account and service you trust.

Back up the D1 database using Cloudflare's export/backup facilities and keep a
separate private copy of `RECOVERY_MASTER_KEY`. Preserve both across updates.
The Python/SMTP alternative's database and master key are not interchangeable
with this Worker's data. To switch services, sign in normally and verify
recovery again for each profile.

Recovery resets a profile already on the device; it does not restore deleted
phone data or synchronize progress. Keep encrypted **Export User** backups.
An older export still needs its original export-time password after a reset.

## Validation and source

The Worker passed **17 local automated checks** with real SQLite and intercepted
Brevo HTTP requests: concurrent single use and registration, expiry, wrong
codes, ownership, limits, provider failures and recovery through the unchanged
APK profile module. The separate browser check validates local master-key
generation and layout. These checks did not deploy to Cloudflare or send real
emails. The first profile verification above tests your actual configuration.

The source retains the optional Python service at `recovery_service/server.py`
and its instructions at `recovery_service/Self_Hosting_Setup.md`. These Cloudflare
steps do not need Python, a terminal or a home server.

Official documentation:

- [D1 creation, bindings and Console](https://developers.cloudflare.com/d1/get-started/)
- [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Brevo sender verification](https://help.brevo.com/hc/en-us/articles/208836149-Create-a-new-sender-From-name-and-From-email)
- [Brevo API keys and expiry](https://help.brevo.com/hc/en-us/articles/209467485-Create-and-manage-your-API-keys)
- [Brevo transactional API](https://developers.brevo.com/docs/send-a-transactional-email)
- [Brevo plans](https://www.brevo.com/pricing/)
