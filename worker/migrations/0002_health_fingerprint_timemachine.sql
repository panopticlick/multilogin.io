-- Migration: Health Monitoring, Fingerprint Aging, Scripts Marketplace, Time Machine
-- Version: 0002

-- Add health monitoring fields to profiles
ALTER TABLE profiles ADD COLUMN health_status TEXT DEFAULT 'unknown';
ALTER TABLE profiles ADD COLUMN health_score INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN health_checked_at INTEGER;
ALTER TABLE profiles ADD COLUMN health_details TEXT;

-- Add fingerprint aging fields to profiles
ALTER TABLE profiles ADD COLUMN fingerprint_outdated INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN fingerprint_version INTEGER;
ALTER TABLE profiles ADD COLUMN fingerprint_updated_at INTEGER;

-- Scripts/Marketplace table
CREATE TABLE IF NOT EXISTS scripts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  category TEXT NOT NULL DEFAULT 'other',
  tags TEXT DEFAULT '[]',

  -- Script content
  inputs TEXT DEFAULT '[]',
  outputs TEXT DEFAULT '[]',
  actions TEXT NOT NULL DEFAULT '[]',

  -- Marketplace info
  price REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  published INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,

  -- Author info
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,

  -- Stats
  downloads INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  reviews INTEGER DEFAULT 0,

  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX idx_scripts_category ON scripts(category);
CREATE INDEX idx_scripts_author ON scripts(author_id);
CREATE INDEX idx_scripts_published ON scripts(published);
CREATE INDEX idx_scripts_featured ON scripts(featured);
CREATE INDEX idx_scripts_downloads ON scripts(downloads DESC);

-- User installed scripts table
CREATE TABLE IF NOT EXISTS user_scripts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  script_id TEXT NOT NULL,
  installed_at INTEGER NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  UNIQUE (user_id, script_id)
);

CREATE INDEX idx_user_scripts_user ON user_scripts(user_id);
CREATE INDEX idx_user_scripts_script ON user_scripts(script_id);

-- Script reviews table
CREATE TABLE IF NOT EXISTS script_reviews (
  id TEXT PRIMARY KEY,
  script_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (script_id, user_id)
);

CREATE INDEX idx_script_reviews_script ON script_reviews(script_id);

-- Time Machine versions index table (metadata in D1, data in R2)
CREATE TABLE IF NOT EXISTS profile_versions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,

  -- Version metadata
  type TEXT NOT NULL DEFAULT 'auto',
  description TEXT,
  size INTEGER NOT NULL DEFAULT 0,
  checksum TEXT,

  -- What's stored
  has_cookies INTEGER DEFAULT 0,
  has_local_storage INTEGER DEFAULT 0,
  has_session_storage INTEGER DEFAULT 0,
  cookie_count INTEGER DEFAULT 0,

  created_at INTEGER NOT NULL,
  created_by TEXT,

  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE (profile_id, version_number)
);

CREATE INDEX idx_profile_versions_profile ON profile_versions(profile_id);
CREATE INDEX idx_profile_versions_team ON profile_versions(team_id);
CREATE INDEX idx_profile_versions_created ON profile_versions(created_at DESC);

-- Notifications table (for health alerts, fingerprint aging alerts, etc.)
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  user_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT DEFAULT '{}',
  read_at INTEGER,
  created_at INTEGER NOT NULL,

  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_team ON notifications(team_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(team_id, read_at) WHERE read_at IS NULL;

-- Health check history table (for tracking trends)
CREATE TABLE IF NOT EXISTS health_check_history (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  team_id TEXT NOT NULL,

  status TEXT NOT NULL,
  score INTEGER NOT NULL,

  -- Check results
  proxy_status TEXT,
  proxy_latency INTEGER,
  ip_address TEXT,
  ip_fraud_score REAL,
  cookie_valid_count INTEGER,
  cookie_expired_count INTEGER,

  checked_at INTEGER NOT NULL,

  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE INDEX idx_health_history_profile ON health_check_history(profile_id);
CREATE INDEX idx_health_history_team ON health_check_history(team_id);
CREATE INDEX idx_health_history_checked ON health_check_history(checked_at DESC);

-- Scheduled tasks table (for tracking cron job runs)
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',

  started_at INTEGER,
  completed_at INTEGER,

  items_processed INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,

  error TEXT,
  details TEXT DEFAULT '{}',

  created_at INTEGER NOT NULL
);

CREATE INDEX idx_scheduled_tasks_type ON scheduled_tasks(task_type);
CREATE INDEX idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX idx_scheduled_tasks_created ON scheduled_tasks(created_at DESC);
