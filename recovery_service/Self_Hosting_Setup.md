# Email recovery for Kevin’s Canadian radio workbook

Version 2.3.0 · ©️ Kevin W. Brown 2026

The APK’s local profiles, passwords, avatars, study content and encrypted user
backups work without a server. **Automatic recovery emails need a running HTTPS
recovery service and an SMTP account. No live mail service is preconfigured in
the delivered APK.** You can create users now and enable recovery after setup.

The service code is in `recovery_service/server.py`. It sends an eight-digit,
one-time code so a user can set a new password. It never emails or receives the
user’s existing password. Codes expire after 10 minutes and stop working after
use or five incorrect guesses.

## What you need

- A computer/server that stays on when recovery is needed. This can be your
  own Linux computer; a paid application subscription is not required.
- An HTTPS domain reachable from the phone, with a certificate trusted by
  Android. Public DNS and a reverse proxy such as Caddy are one option.
- SMTP credentials from an email account/provider that permits application
  email. Its own limits, app-password requirements and charges still apply.
- Python 3.10 or later and the `cryptography` dependency.

Keep SMTP credentials and the service encryption key on the server. Do not put
them in JavaScript, the APK, a shared source ZIP or a public repository.

## 1. Prepare the service directory

Extract the source ZIP on the server. Open a terminal in the extracted project
folder, then run:

```bash
python3 -m venv .recovery-venv
.recovery-venv/bin/python -m pip install -r recovery_service/requirements.txt
cp recovery_service/recovery.env.example recovery.env
chmod 600 recovery.env
```

Generate the server’s encryption key on that machine:

```bash
.recovery-venv/bin/python -c 'import base64,secrets; print(base64.b64encode(secrets.token_bytes(32)).decode())'
```

Edit `recovery.env` with your editor. Replace the placeholders with your actual
settings. For a first foreground run, use a database path you can write, such
as `/home/kevin/radio-recovery/recovery.sqlite3` (adjust it for your account).
The service creates the database’s parent directory if needed.

```bash
RECOVERY_MASTER_KEY=PASTE_THE_GENERATED_BASE64_KEY
RECOVERY_DATABASE=/home/kevin/radio-recovery/recovery.sqlite3
RECOVERY_BIND=127.0.0.1
RECOVERY_PORT=8787
SMTP_HOST=YOUR_SMTP_HOST
SMTP_PORT=587
SMTP_SECURITY=starttls
SMTP_USER=YOUR_SMTP_USERNAME
SMTP_PASSWORD='YOUR_SMTP_APP_PASSWORD'
SMTP_FROM='Radio Workbook <YOUR_SENDER_EMAIL>'
```

Use `SMTP_SECURITY=ssl` and the provider’s port (commonly 465) if it requires
implicit TLS. The service supports TLS-protected SMTP only; it checks the
server certificate. Use the exact SMTP host, port, sender and authentication
requirements from your email provider. If a secret contains a single quote,
use correct shell quoting when editing this environment file.

Load the environment and start the service in the foreground:

```bash
set -a
. ./recovery.env
set +a
.recovery-venv/bin/python recovery_service/server.py
```

In a second terminal, verify the local health endpoint:

```bash
curl http://127.0.0.1:8787/health
```

Expected response: `{"status":"ok"}`. This confirms the HTTP process is running;
it does not test SMTP delivery. Complete email verification in the app to test
actual delivery. Missing required environment settings prevent normal startup.

## 2. Put HTTPS in front of it

Install and configure your chosen HTTPS reverse proxy. If Caddy is already
installed, a minimal Caddyfile is:

```caddyfile
recovery.YOUR_DOMAIN {
    reverse_proxy 127.0.0.1:8787
}
```

Replace the domain, point its DNS at the server, and make ports 80 and 443
reachable for Caddy’s public-certificate setup. Start or reload Caddy according
to your installation. Keep port 8787 bound to loopback; expose the HTTPS proxy
to the phone. If the proxy is on another machine, protect that hop too.

Check `https://recovery.YOUR_DOMAIN/health` from the phone’s browser. The APK
accepts only HTTPS origins, refuses redirects, and uses Android’s certificate
checks. An untrusted/self-signed certificate will not work automatically.

Caddy documentation: https://caddyserver.com/docs/quick-starts/reverse-proxy

For continuous use, run the Python service under a process supervisor such as
systemd, with the same environment and a persistent database directory. Use a
dedicated unprivileged account. The service’s request and mail limits are for a
small personal deployment; a larger public deployment needs operational load
and abuse review. When behind a local proxy, the basic IP limit is shared by
requests from that proxy.

## 3. Connect the Android app

1. On the login page, choose **Email recovery setup**.
2. Enter `https://recovery.YOUR_DOMAIN` and save it. Enter the origin only,
   without `/v1`, query parameters or a path.
3. Select a user and sign in with that user’s password.
4. Open **Profile → Profile settings**, or **Backup & settings → Profile settings**.
5. Check the recovery-service address and choose **Email verification code**.
6. Enter the eight-digit code sent to the profile’s email address and verify it.
7. The profile now shows **Email verified**.

Each profile must verify its own email. Merely typing an address when creating
a user does not enable recovery. If a message is missing, check spam, the sender
configuration, SMTP authentication and provider limits. Wait one minute before
requesting another code; at most five messages per email address are allowed
per hour.

## 4. Reset a forgotten password

1. Choose **Lost password** on the login page, then select the user. You can
   also select a user first and choose **Lost password** on their password page.
2. Choose **Email reset code**.
3. Enter the code and the new password twice.
4. Sign in normally with the new password. Saved study work remains intact.

A reset unlocks the profile already on that device. The service does not hold
or sync scores, notes, avatars or completed lessons; it cannot restore deleted
phone data. Export encrypted user backups for device loss or transfers.

## What the service stores

Enabling recovery sends an opaque profile ID, the registered email, a random
registration secret and a random profile recovery key over HTTPS. The service
stores the email, a hash of the registration secret, and an AES-GCM-encrypted
recovery key. The master key stays in the server environment. Reset codes are
stored as keyed hashes with expiry and attempt limits. User passwords and study
progress are never sent to the service.

After a valid email code, the service returns the recovery key to the app. The
app uses it to keep the same encrypted progress while replacing its local
password protection. Only enable a service you trust: its operator controls
recovery keys. Back up the service database and its master key separately and
securely; losing either can prevent recovery.

An exported user backup remains protected by the password used at export time.
Changing a password later does not rewrite old backup files. Importing a named
copy gives it a new identity and requires email recovery to be enabled again.

## Validation and current limits

The service was tested locally with a test mailbox, including expiry, replay,
wrong codes, rate limits, delivery failures and a full app reset flow. No real
SMTP account, public hosting or Android phone was available for this release.
Actual delivery, camera capture, file pickers and installation must be checked
on your device with your configured service. The APK reports missing recovery
setup instead of pretending an email was sent.
