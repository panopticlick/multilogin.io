-- Migration: Fingerprint Policy Center & Browser Version Registry
-- Version: 0003

-- Registry of browser versions fetched from external feeds
CREATE TABLE IF NOT EXISTS browser_versions (
  id TEXT PRIMARY KEY,
  browser TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'stable',
  platform TEXT NOT NULL DEFAULT 'desktop',
  region TEXT DEFAULT 'global',
  version INTEGER NOT NULL,
  major_version INTEGER,
  release_date INTEGER,
  notes TEXT,
  metadata TEXT DEFAULT '{}',
  updated_at INTEGER NOT NULL,
  UNIQUE (browser, channel, platform, region)
);

CREATE INDEX idx_browser_versions_browser ON browser_versions(browser);
CREATE INDEX idx_browser_versions_updated ON browser_versions(updated_at DESC);

-- Team fingerprint policies
CREATE TABLE IF NOT EXISTS fingerprint_policies (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  max_versions_behind INTEGER NOT NULL DEFAULT 2,
  max_versions_behind_mobile INTEGER DEFAULT 1,
  auto_upgrade INTEGER NOT NULL DEFAULT 0,
  upgrade_window_hours INTEGER NOT NULL DEFAULT 48,
  require_manual_approval INTEGER NOT NULL DEFAULT 0,
  risk_tolerance TEXT NOT NULL DEFAULT 'balanced',
  allowed_browsers TEXT NOT NULL DEFAULT '[]',
  preferred_proxy_types TEXT NOT NULL DEFAULT '[]',
  regions TEXT NOT NULL DEFAULT '[]',
  notification_channels TEXT NOT NULL DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE (team_id, name)
);

CREATE INDEX idx_fingerprint_policies_team ON fingerprint_policies(team_id);

-- Profiles reference a policy (optional)
ALTER TABLE profiles ADD COLUMN fingerprint_policy_id TEXT;
CREATE INDEX idx_profiles_policy ON profiles(fingerprint_policy_id);
