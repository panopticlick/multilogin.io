# Multilogin.io Desktop Client

The official desktop client for launching and managing browser profiles with Multilogin.io.

## Features

- Launch isolated browser profiles with unique fingerprints
- Cloud sync of cookies and session data
- Proxy support (HTTP/HTTPS/SOCKS5) with authentication
- Anti-detection using Puppeteer Stealth
- Automatic session backup and restore
- CLI and programmatic API

## Installation

### From npm

```bash
npm install -g @multilogin/client
```

### From binary

Download the latest release for your platform:
- Windows: `multilogin-win.exe`
- macOS: `multilogin-macos`
- Linux: `multilogin-linux`

## CLI Usage

### Authentication

```bash
# Login with your API key
multilogin login

# Or provide key directly
multilogin login --key mk_live_xxxxx
```

### List Profiles

```bash
# List all profiles
multilogin list

# Search profiles
multilogin list --search "Amazon"

# Filter by group
multilogin list --group grp_xxxxx
```

### Launch Profile

```bash
# Launch a profile
multilogin launch prof_xxxxx

# The browser will stay open until you press Ctrl+C
# Session data is synced automatically
```

### Stop Profile

```bash
# Stop a specific profile
multilogin stop prof_xxxxx

# Stop all running profiles
multilogin stop
```

### Other Commands

```bash
# View running profiles
multilogin status

# List groups
multilogin groups

# View/update config
multilogin config --show
multilogin config --api-url https://api.multilogin.io
```

## Programmatic Usage

```typescript
import { initialize, api, launchBrowser, stopBrowser } from '@multilogin/client';

// Initialize with API key
initialize('mk_live_xxxxx');

// List profiles
const { profiles } = await api.listProfiles();
console.log(profiles);

// Launch a profile
const instance = await launchBrowser('prof_xxxxx');

// The browser is now running
// Session data is synced automatically

// Stop and sync when done
await stopBrowser('prof_xxxxx');
```

## Configuration

Configuration is stored in:
- Windows: `%APPDATA%/multilogin/config.json`
- macOS: `~/Library/Application Support/multilogin/config.json`
- Linux: `~/.config/multilogin/config.json`

Profiles data is stored in:
- Windows: `%LOCALAPPDATA%/Multilogin/Profiles/`
- macOS: `~/Library/Application Support/Multilogin/Profiles/`
- Linux: `~/.multilogin/profiles/`

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Build binaries
npm run pkg:all
```

## License

MIT
