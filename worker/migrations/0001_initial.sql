-- Multilogin.io Database Schema
-- Initial migration

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  image TEXT,
  email_verified INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_users_email ON users(email);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  owner_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  current_period_end INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE INDEX idx_teams_owner ON teams(owner_id);
CREATE INDEX idx_teams_stripe_customer ON teams(stripe_customer_id);

-- Team members table (join table for users <-> teams)
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  permissions TEXT,
  joined_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id)
);

CREATE INDEX idx_team_invitations_team ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);

-- Profile groups table
CREATE TABLE IF NOT EXISTS profile_groups (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE (team_id, name)
);

CREATE INDEX idx_profile_groups_team ON profile_groups(team_id);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  template_id TEXT NOT NULL,
  group_id TEXT,

  -- Fingerprint data
  user_agent TEXT NOT NULL,
  platform TEXT NOT NULL,
  vendor TEXT NOT NULL,
  screen_width INTEGER NOT NULL,
  screen_height INTEGER NOT NULL,
  color_depth INTEGER NOT NULL,
  device_memory INTEGER NOT NULL,
  hardware_concurrency INTEGER NOT NULL,
  webgl_vendor TEXT NOT NULL,
  webgl_renderer TEXT NOT NULL,
  timezone TEXT NOT NULL,
  language TEXT NOT NULL,

  -- Additional settings
  proxy TEXT,
  tags TEXT DEFAULT '[]',
  notes TEXT,

  -- Usage tracking
  launch_count INTEGER DEFAULT 0,
  last_active INTEGER,
  locked_by TEXT,
  locked_at INTEGER,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES profile_groups(id) ON DELETE SET NULL
);

CREATE INDEX idx_profiles_team ON profiles(team_id);
CREATE INDEX idx_profiles_group ON profiles(group_id);
CREATE INDEX idx_profiles_locked ON profiles(locked_by);
CREATE INDEX idx_profiles_last_active ON profiles(last_active);
CREATE INDEX idx_profiles_name ON profiles(name);

-- Proxies table
CREATE TABLE IF NOT EXISTS proxies (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT,
  password TEXT,
  country TEXT,
  city TEXT,
  rotation_url TEXT,
  tags TEXT DEFAULT '[]',

  -- Status tracking
  last_check_status TEXT,
  last_checked_at INTEGER,
  latency INTEGER,
  external_ip TEXT,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE INDEX idx_proxies_team ON proxies(team_id);
CREATE INDEX idx_proxies_type ON proxies(type);
CREATE INDEX idx_proxies_country ON proxies(country);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  permissions TEXT DEFAULT '[]',
  created_by TEXT NOT NULL,
  last_used_at INTEGER,
  expires_at INTEGER,
  created_at INTEGER NOT NULL,

  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_api_keys_team ON api_keys(team_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details TEXT DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL,

  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_team ON audit_logs(team_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Sessions table (for OAuth providers)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);

-- Accounts table (for OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (provider, provider_account_id)
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
