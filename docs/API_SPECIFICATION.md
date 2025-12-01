# API Specification - OpenAPI Style

## Overview

Base URL: `https://api.multilogin.io`

All API endpoints (except `/health` and `/auth/*`) require authentication via Bearer token.

---

## Authentication

### Headers

```http
Authorization: Bearer mk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
X-Client-ID: {client_identifier}  # Required for launch/sync operations
```

### API Key Format

- Prefix: `mk_live_` (production) or `mk_test_` (development)
- Length: 64 characters total
- Example: `mk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - Resource locked or duplicate |
| 429 | Rate Limited |
| 500 | Internal Server Error |

---

## Endpoints

### Health Check

#### `GET /health`

Check API health status. No authentication required.

**Response**

```json
{
  "status": "healthy",
  "timestamp": 1701234567890,
  "version": "1.0.0"
}
```

---

## Profiles

### List Profiles

#### `GET /api/profiles`

List all profiles for the authenticated team.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `groupId` | string | - | Filter by group ID |
| `search` | string | - | Search by name (case-insensitive) |
| `tags` | string | - | Filter by tags (comma-separated) |
| `status` | string | `all` | Filter by status: `all`, `available`, `in_use` |
| `limit` | integer | 50 | Max results (1-100) |
| `offset` | integer | 0 | Pagination offset |
| `orderBy` | string | `last_active` | Sort field: `name`, `last_active`, `created_at` |
| `order` | string | `desc` | Sort order: `asc`, `desc` |

**Response**

```json
{
  "profiles": [
    {
      "id": "prof_abc123",
      "name": "Amazon Store #1",
      "group_id": "grp_xyz789",
      "tags": ["amazon", "usa"],
      "template_id": "windows_chrome_desktop",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "platform": "Win32",
      "vendor": "Google Inc.",
      "screen_width": 1920,
      "screen_height": 1080,
      "color_depth": 24,
      "device_memory": 8,
      "hardware_concurrency": 8,
      "webgl_vendor": "Google Inc. (NVIDIA)",
      "webgl_renderer": "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660...)",
      "timezone": "America/New_York",
      "language": "en-US",
      "proxy_id": "prx_def456",
      "proxy": "",
      "locked_by": null,
      "locked_at": null,
      "created_at": 1700000000000,
      "last_active": 1701234567890,
      "launch_count": 42,
      "notes": "Main seller account"
    }
  ],
  "total": 156,
  "limit": 50,
  "offset": 0
}
```

---

### Get Profile

#### `GET /api/profiles/:id`

Get a single profile by ID.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Profile ID |

**Response**

```json
{
  "id": "prof_abc123",
  "name": "Amazon Store #1",
  // ... all profile fields
}
```

**Errors**

| Code | Description |
|------|-------------|
| 404 | Profile not found |

---

### Create Profile

#### `POST /api/profiles`

Create a new browser profile.

**Request Body**

```json
{
  "name": "Amazon Store #2",
  "templateId": "windows_chrome_desktop",
  "groupId": "grp_xyz789",
  "tags": ["amazon", "usa", "new"],
  "timezone": "America/Los_Angeles",
  "language": "en-US",
  "proxyId": "prx_def456",
  "notes": "Secondary seller account"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Profile name (1-100 chars) |
| `templateId` | string | Yes | Fingerprint template ID |
| `groupId` | string | No | Group to assign profile to |
| `tags` | string[] | No | Tags for organization |
| `timezone` | string | No | IANA timezone (default from template) |
| `language` | string | No | Language code (default from template) |
| `proxyId` | string | No | Proxy pool or proxy ID |
| `proxy` | string | No | Direct proxy string |
| `notes` | string | No | Notes (max 1000 chars) |

**Response** (201 Created)

```json
{
  "id": "prof_new123",
  "name": "Amazon Store #2",
  // ... all profile fields with generated fingerprint
}
```

**Errors**

| Code | Description |
|------|-------------|
| 400 | Invalid input (see details) |
| 403 | Profile limit reached |

---

### Update Profile

#### `PUT /api/profiles/:id`

Update an existing profile.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Profile ID |

**Request Body**

```json
{
  "name": "Updated Name",
  "groupId": "grp_new789",
  "tags": ["updated", "tags"],
  "timezone": "America/Chicago",
  "language": "en-US",
  "proxyId": null,
  "proxy": "socks5://user:pass@1.2.3.4:1080",
  "notes": "Updated notes"
}
```

All fields are optional. Only provided fields will be updated.

**Response**

```json
{
  "id": "prof_abc123",
  // ... updated profile fields
}
```

**Errors**

| Code | Description |
|------|-------------|
| 404 | Profile not found |
| 409 | Profile is currently locked |

---

### Delete Profile

#### `DELETE /api/profiles/:id`

Delete a profile and its session data.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Profile ID |

**Response**

```json
{
  "success": true,
  "deleted": {
    "profile": true,
    "sessionData": true
  }
}
```

**Errors**

| Code | Description |
|------|-------------|
| 404 | Profile not found |
| 409 | Profile is currently locked |

---

### Launch Profile

#### `POST /api/profiles/:id/launch`

Get profile configuration and session data for launching a browser. Acquires a lock on the profile.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Profile ID |

**Headers**

```http
X-Client-ID: {unique_client_identifier}
```

**Response**

```json
{
  "profile": {
    "id": "prof_abc123",
    // ... all profile fields
  },
  "sessionData": {
    "cookies": [
      {
        "name": "session_id",
        "value": "abc123",
        "domain": ".facebook.com",
        "path": "/",
        "expires": 1735689600000,
        "httpOnly": true,
        "secure": true,
        "sameSite": "Lax"
      }
    ],
    "localStorage": {
      "https://www.facebook.com": {
        "key1": "value1"
      }
    }
  },
  "lockAcquired": true,
  "lockExpiresAt": 1701234867890
}
```

**Errors**

| Code | Description |
|------|-------------|
| 400 | Missing X-Client-ID header |
| 404 | Profile not found |
| 409 | Profile is in use by another session |

---

### Heartbeat

#### `POST /api/profiles/:id/heartbeat`

Keep the profile lock alive. Should be called every 15 seconds while browser is running.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Profile ID |

**Headers**

```http
X-Client-ID: {unique_client_identifier}
```

**Response**

```json
{
  "success": true,
  "lockExpiresAt": 1701234867890
}
```

**Errors**

| Code | Description |
|------|-------------|
| 409 | Lock not found or expired (browser should stop) |

---

### Release Lock

#### `POST /api/profiles/:id/release`

Release the profile lock. Call when browser is closed.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Profile ID |

**Headers**

```http
X-Client-ID: {unique_client_identifier}
```

**Response**

```json
{
  "success": true
}
```

---

### Bulk Actions

#### `POST /api/profiles/bulk`

Perform bulk operations on multiple profiles.

**Request Body**

```json
{
  "action": "move_to_group",
  "profileIds": ["prof_1", "prof_2", "prof_3"],
  "params": {
    "groupId": "grp_new789"
  }
}
```

**Supported Actions**

| Action | Params | Description |
|--------|--------|-------------|
| `move_to_group` | `groupId` | Move profiles to a group |
| `add_tags` | `tags[]` | Add tags to profiles |
| `remove_tags` | `tags[]` | Remove tags from profiles |
| `set_proxy` | `proxyId` or `proxy` | Set proxy for profiles |
| `delete` | - | Delete profiles |

**Response**

```json
{
  "success": true,
  "affected": 3,
  "failed": []
}
```

---

## Sync

### Sync Session Data

#### `POST /api/sync/:profileId`

Upload session data (cookies, localStorage) for a profile.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `profileId` | string | Profile ID |

**Headers**

```http
X-Client-ID: {unique_client_identifier}
```

**Request Body**

```json
{
  "cookies": [
    {
      "name": "session_id",
      "value": "new_value",
      "domain": ".facebook.com",
      "path": "/",
      "expires": 1735689600000,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    }
  ],
  "localStorage": {
    "https://www.facebook.com": {
      "key1": "updated_value"
    }
  },
  "clientHash": "a1b2c3d4e5f6..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cookies` | array | Yes | Array of cookie objects |
| `localStorage` | object | Yes | Origin-keyed localStorage data |
| `clientHash` | string | No | MD5 hash of previous sync (for smart sync) |

**Response**

```json
{
  "synced": true,
  "skipped": false,
  "hash": "f7g8h9i0j1k2..."
}
```

If `clientHash` matches the uploaded data hash, sync is skipped:

```json
{
  "synced": false,
  "skipped": true,
  "hash": "a1b2c3d4e5f6..."
}
```

---

## Groups

### List Groups

#### `GET /api/groups`

List all groups for the authenticated team.

**Response**

```json
{
  "groups": [
    {
      "id": "grp_abc123",
      "name": "Amazon Stores",
      "description": "All Amazon seller accounts",
      "color": "#f59e0b",
      "icon": "shopping-cart",
      "profileCount": 25,
      "created_at": 1700000000000
    }
  ]
}
```

---

### Create Group

#### `POST /api/groups`

Create a new group.

**Request Body**

```json
{
  "name": "Facebook Accounts",
  "description": "FB advertising accounts",
  "color": "#3b82f6",
  "icon": "users"
}
```

**Response** (201 Created)

```json
{
  "id": "grp_new123",
  "name": "Facebook Accounts",
  // ... all group fields
}
```

---

### Update Group

#### `PUT /api/groups/:id`

Update an existing group.

**Request Body**

```json
{
  "name": "Updated Name",
  "color": "#ef4444"
}
```

**Response**

```json
{
  "id": "grp_abc123",
  // ... updated group fields
}
```

---

### Delete Group

#### `DELETE /api/groups/:id`

Delete a group. Profiles in the group will have their `group_id` set to null.

**Response**

```json
{
  "success": true,
  "profilesAffected": 25
}
```

---

## Proxies

### List Proxy Pools

#### `GET /api/proxies/pools`

List all proxy pools for the authenticated team.

**Response**

```json
{
  "pools": [
    {
      "id": "pool_abc123",
      "name": "USA Residential",
      "type": "rotating",
      "assignment_strategy": "round-robin",
      "proxyCount": 50,
      "healthyCount": 48,
      "created_at": 1700000000000
    }
  ]
}
```

---

### List Proxies

#### `GET /api/proxies`

List all proxies for the authenticated team.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `poolId` | string | - | Filter by pool ID |
| `status` | string | `all` | Filter: `all`, `healthy`, `degraded`, `offline` |

**Response**

```json
{
  "proxies": [
    {
      "id": "prx_abc123",
      "pool_id": "pool_xyz789",
      "name": "US Proxy #1",
      "protocol": "socks5",
      "host": "us1.smartproxy.com",
      "port": 10000,
      "username": "user123",
      "status": "healthy",
      "latency_ms": 45,
      "last_check": 1701234567890,
      "country_code": "US",
      "city": "New York",
      "profiles_using": ["prof_1", "prof_2"]
    }
  ],
  "total": 50
}
```

---

### Create Proxy Pool

#### `POST /api/proxies/pools`

Create a new proxy pool.

**Request Body**

```json
{
  "name": "EU Datacenter",
  "type": "static",
  "assignment_strategy": "least-used"
}
```

**Response** (201 Created)

```json
{
  "id": "pool_new123",
  // ... pool fields
}
```

---

### Add Proxies to Pool

#### `POST /api/proxies`

Add proxies to a pool (or as standalone).

**Request Body**

```json
{
  "poolId": "pool_abc123",
  "proxies": [
    {
      "protocol": "socks5",
      "host": "1.2.3.4",
      "port": 1080,
      "username": "user",
      "password": "pass"
    },
    {
      "protocol": "http",
      "host": "5.6.7.8",
      "port": 8080
    }
  ]
}
```

**Response** (201 Created)

```json
{
  "created": 2,
  "proxies": [
    { "id": "prx_new1", /* ... */ },
    { "id": "prx_new2", /* ... */ }
  ]
}
```

---

### Bulk Import Proxies

#### `POST /api/proxies/import`

Import proxies from a text list.

**Request Body**

```json
{
  "poolId": "pool_abc123",
  "format": "host:port:user:pass",
  "protocol": "socks5",
  "data": "1.2.3.4:1080:user1:pass1\n5.6.7.8:1080:user2:pass2\n9.10.11.12:1080:user3:pass3"
}
```

**Supported Formats**

- `host:port`
- `host:port:user:pass`
- `protocol://host:port`
- `protocol://user:pass@host:port`

**Response**

```json
{
  "imported": 3,
  "failed": 0,
  "errors": []
}
```

---

### Check Proxy Health

#### `POST /api/proxies/:id/check`

Manually trigger a health check for a proxy.

**Response**

```json
{
  "id": "prx_abc123",
  "status": "healthy",
  "latency_ms": 52,
  "external_ip": "1.2.3.4",
  "country_code": "US",
  "city": "New York",
  "isp": "Smartproxy LLC"
}
```

---

### Delete Proxy

#### `DELETE /api/proxies/:id`

Delete a proxy.

**Response**

```json
{
  "success": true
}
```

---

## Templates

### List Fingerprint Templates

#### `GET /api/templates`

List all available fingerprint templates.

**Response**

```json
{
  "templates": [
    {
      "id": "windows_chrome_desktop",
      "name": "Windows Chrome Desktop",
      "os": "Windows",
      "browser": "Chrome",
      "description": "Standard Windows Chrome profile",
      "popularity": 0.45
    },
    {
      "id": "mac_chrome_desktop",
      "name": "macOS Chrome Desktop",
      "os": "macOS",
      "browser": "Chrome",
      "description": "Standard Mac Chrome profile",
      "popularity": 0.30
    },
    {
      "id": "mac_safari_desktop",
      "name": "macOS Safari Desktop",
      "os": "macOS",
      "browser": "Safari",
      "description": "Standard Mac Safari profile",
      "popularity": 0.15
    }
  ]
}
```

---

### Get Template Details

#### `GET /api/templates/:id`

Get full template configuration.

**Response**

```json
{
  "id": "windows_chrome_desktop",
  "name": "Windows Chrome Desktop",
  "os": "Windows",
  "browser": "Chrome",
  "config": {
    "userAgents": [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
    ],
    "platform": "Win32",
    "vendor": "Google Inc.",
    "screens": [
      { "width": 1920, "height": 1080 },
      { "width": 1366, "height": 768 }
    ],
    "colorDepth": 24,
    "deviceMemory": [4, 8, 16],
    "hardwareConcurrency": [4, 8, 12],
    "webglVendor": "Google Inc. (NVIDIA)",
    "webglRenderer": [
      "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660..."
    ],
    "languages": ["en-US", "en"],
    "timezones": ["America/New_York", "America/Chicago"]
  }
}
```

---

## Team

### Get Team

#### `GET /api/team`

Get current team information.

**Response**

```json
{
  "id": "team_abc123",
  "name": "Acme Corp",
  "plan_type": "team",
  "subscription_status": "active",
  "limits": {
    "profiles": 200,
    "members": 5,
    "storage_mb": 10240
  },
  "usage": {
    "profiles": 156,
    "members": 3,
    "storage_mb": 2048
  },
  "created_at": 1700000000000
}
```

---

### List Team Members

#### `GET /api/team/members`

List all team members.

**Response**

```json
{
  "members": [
    {
      "user_id": "usr_abc123",
      "email": "owner@company.com",
      "name": "John Owner",
      "avatar_url": "https://...",
      "role": "owner",
      "permissions": ["*"],
      "joined_at": 1700000000000,
      "last_active": 1701234567890
    },
    {
      "user_id": "usr_def456",
      "email": "member@company.com",
      "name": "Jane Member",
      "avatar_url": null,
      "role": "member",
      "permissions": ["profiles:read", "profiles:launch"],
      "group_access": ["grp_abc123"],
      "joined_at": 1700100000000,
      "last_active": 1701234000000
    }
  ]
}
```

---

### Invite Member

#### `POST /api/team/invite`

Send a team invitation.

**Request Body**

```json
{
  "email": "newmember@company.com",
  "role": "member",
  "permissions": ["profiles:read", "profiles:launch", "profiles:edit"],
  "groupAccess": ["grp_abc123", "grp_def456"]
}
```

**Response** (201 Created)

```json
{
  "id": "inv_abc123",
  "email": "newmember@company.com",
  "status": "pending",
  "expires_at": 1701839367890
}
```

---

### Update Member

#### `PUT /api/team/members/:userId`

Update a team member's role or permissions.

**Request Body**

```json
{
  "role": "admin",
  "permissions": ["*"],
  "groupAccess": null
}
```

**Response**

```json
{
  "user_id": "usr_def456",
  // ... updated member fields
}
```

---

### Remove Member

#### `DELETE /api/team/members/:userId`

Remove a member from the team.

**Response**

```json
{
  "success": true
}
```

---

### Get Audit Log

#### `GET /api/team/activity`

Get team activity/audit log.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Max results |
| `before` | integer | - | Get entries before this timestamp |
| `action` | string | - | Filter by action type |
| `userId` | string | - | Filter by user |

**Response**

```json
{
  "entries": [
    {
      "id": "aud_abc123",
      "timestamp": 1701234567890,
      "user": {
        "id": "usr_abc123",
        "name": "John Owner",
        "email": "owner@company.com"
      },
      "action": "profile.launch",
      "target": {
        "type": "profile",
        "id": "prof_xyz789",
        "name": "Amazon Store #1"
      },
      "details": {
        "proxy_used": "prx_def456",
        "client_id": "abc123..."
      },
      "ip_address": "1.2.3.4"
    }
  ],
  "hasMore": true,
  "nextCursor": 1701234500000
}
```

---

## Billing

### Get Subscription

#### `GET /api/billing/subscription`

Get current subscription details.

**Response**

```json
{
  "plan": "team",
  "status": "active",
  "current_period_start": 1701234567890,
  "current_period_end": 1703826567890,
  "cancel_at_period_end": false,
  "payment_method": {
    "type": "card",
    "brand": "visa",
    "last4": "4242"
  }
}
```

---

### Create Checkout Session

#### `POST /api/billing/checkout`

Create a Stripe checkout session for plan upgrade.

**Request Body**

```json
{
  "plan": "pro",
  "successUrl": "https://multilogin.io/dashboard/billing?success=true",
  "cancelUrl": "https://multilogin.io/dashboard/billing?canceled=true"
}
```

**Response**

```json
{
  "sessionId": "cs_test_a1b2c3...",
  "url": "https://checkout.stripe.com/..."
}
```

---

### Create Portal Session

#### `POST /api/billing/portal`

Create a Stripe customer portal session for managing subscription.

**Request Body**

```json
{
  "returnUrl": "https://multilogin.io/dashboard/billing"
}
```

**Response**

```json
{
  "url": "https://billing.stripe.com/..."
}
```

---

### Get Usage

#### `GET /api/billing/usage`

Get current billing period usage.

**Response**

```json
{
  "period": {
    "start": 1701234567890,
    "end": 1703826567890
  },
  "usage": {
    "profiles_created": 12,
    "profiles_deleted": 2,
    "launches": 456,
    "syncs": 12345,
    "api_calls": 67890,
    "storage_bytes": 2147483648
  },
  "limits": {
    "profiles": 200,
    "storage_bytes": 10737418240
  }
}
```

---

## Rate Limits

| Plan | Rate Limit | Burst |
|------|------------|-------|
| Free | 30 req/min | 10 |
| Pro | 100 req/min | 30 |
| Team | 300 req/min | 100 |
| Enterprise | Custom | Custom |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701234600
```

---

## Webhooks (Incoming)

### Stripe Webhook

#### `POST /webhooks/stripe`

Handle Stripe events for billing.

**Headers**

```http
Stripe-Signature: t=1701234567,v1=abc123...
```

**Handled Events**

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { MultiloginClient } from '@multilogin/sdk';

const client = new MultiloginClient({
  apiKey: 'mk_live_xxx...'
});

// List profiles
const { profiles, total } = await client.profiles.list({
  limit: 50,
  orderBy: 'last_active'
});

// Launch a profile
const { profile, sessionData } = await client.profiles.launch('prof_abc123');

// Sync session data
await client.sync('prof_abc123', {
  cookies: [...],
  localStorage: {...}
});
```

### cURL

```bash
# List profiles
curl -X GET "https://api.multilogin.io/api/profiles?limit=10" \
  -H "Authorization: Bearer mk_live_xxx..."

# Create profile
curl -X POST "https://api.multilogin.io/api/profiles" \
  -H "Authorization: Bearer mk_live_xxx..." \
  -H "Content-Type: application/json" \
  -d '{"name":"New Profile","templateId":"windows_chrome_desktop"}'

# Launch profile
curl -X POST "https://api.multilogin.io/api/profiles/prof_abc123/launch" \
  -H "Authorization: Bearer mk_live_xxx..." \
  -H "X-Client-ID: my-client-001"
```

---

## Changelog

### v1.0.0 (Initial Release)

- Core profile management
- Sync API
- Team management
- Proxy pools
- Fingerprint templates
