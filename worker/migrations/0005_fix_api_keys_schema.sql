-- Migration: Fix API Keys Schema
-- This migration fixes column name mismatches between schema and middleware

-- SQLite doesn't support RENAME COLUMN in older versions, so we need to recreate the table
-- First, create a new table with the correct column names

CREATE TABLE IF NOT EXISTS api_keys_new (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  token_prefix TEXT NOT NULL,
  permissions TEXT DEFAULT '[]',
  created_by TEXT NOT NULL,
  last_used INTEGER,
  expires_at INTEGER,
  created_at INTEGER NOT NULL,

  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Copy existing data if any (mapping old column names to new)
INSERT INTO api_keys_new (id, team_id, user_id, name, token_hash, token_prefix, permissions, created_by, last_used, expires_at, created_at)
SELECT
  id,
  team_id,
  created_by as user_id,
  name,
  key_hash as token_hash,
  key_prefix as token_prefix,
  permissions,
  created_by,
  last_used_at as last_used,
  expires_at,
  created_at
FROM api_keys;

-- Drop old table
DROP TABLE IF EXISTS api_keys;

-- Rename new table
ALTER TABLE api_keys_new RENAME TO api_keys;

-- Recreate indexes with correct column names
CREATE INDEX idx_api_keys_team ON api_keys(team_id);
CREATE INDEX idx_api_keys_token ON api_keys(token_prefix, token_hash);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
