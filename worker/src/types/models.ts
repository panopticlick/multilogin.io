// Database Models - Match D1 schema

export interface User {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  image: string | null;
  email_verified: number | null; // SQLite uses INTEGER for boolean
  created_at: number;
  updated_at: number;
}

export interface Team {
  id: string;
  name: string;
  plan: 'free';
  owner_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: number;
}

export interface Profile {
  id: string;
  team_id: string;
  name: string;
  template_id: string;
  group_id: string | null;
  tags: string; // JSON array stored as string

  // Fingerprint
  user_agent: string;
  platform: string;
  vendor: string;
  screen_width: number;
  screen_height: number;
  color_depth: number;
  device_memory: number;
  hardware_concurrency: number;
  webgl_vendor: string | null;
  webgl_renderer: string | null;

  // Settings
  timezone: string;
  language: string;
  proxy: string | null;
  notes: string | null;

  // Locking
  locked_by: string | null;
  locked_at: number | null;

  // Metadata
  last_active: number | null;
  launch_count: number;
  created_at: number;
  updated_at: number;
}

export interface ProfileGroup {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: number;
  updated_at: number;
}

export interface APIKey {
  id: string;
  user_id: string;
  team_id: string;
  name: string;
  key_prefix: string;
  token_prefix: string;
  token_hash: string;
  permissions: string; // JSON array stored as string
  last_used: number | null;
  last_used_at: number | null;
  expires_at: number | null;
  created_at: number;
}

export interface AuditLog {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string; // JSON stored as string
  ip_address: string;
  user_agent: string;
  created_at: number;
}

export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  token: string;
  expires_at: number;
  created_at: number;
}

export interface Proxy {
  id: string;
  team_id: string;
  pool_id: string | null;
  name: string;
  type: 'datacenter' | 'residential' | 'mobile' | 'isp';
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  host: string;
  port: number;
  username: string | null;
  password: string | null;
  country: string | null;
  city: string | null;
  rotation_url: string | null;
  tags: string; // JSON array stored as string
  external_ip: string | null;
  status: 'active' | 'inactive' | 'error';
  last_check_status: 'success' | 'failed' | null;
  last_checked: number | null;
  last_checked_at: number | null;
  latency: number | null;
  response_time: number | null;
  created_at: number;
  updated_at: number;
}

export interface ProxyPool {
  id: string;
  team_id: string;
  name: string;
  rotation_mode: 'round_robin' | 'random' | 'sticky';
  created_at: number;
}
