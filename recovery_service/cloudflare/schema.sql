-- ©️ Kevin W. Brown 2026
-- Safe to rerun: existing recovery registrations are kept.
CREATE TABLE IF NOT EXISTS recovery_users (
    id TEXT PRIMARY KEY,
    owner_hash TEXT NOT NULL,
    email TEXT,
    key_iv TEXT,
    key_cipher TEXT,
    verified INTEGER NOT NULL DEFAULT 0 CHECK (verified IN (0, 1)),
    pending_email TEXT,
    pending_iv TEXT,
    pending_cipher TEXT,
    challenge_id TEXT,
    code_hash TEXT,
    code_purpose TEXT CHECK (code_purpose IN ('verify', 'reset')),
    code_expires INTEGER NOT NULL DEFAULT 0,
    tries INTEGER NOT NULL DEFAULT 0,
    last_sent INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS recovery_limits (
    bucket TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS recovery_limits_expiry ON recovery_limits(expires);
