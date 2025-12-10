import { describe, it, expect } from 'vitest';
import { diffSessions, planRetention, shouldAutoSnapshot } from '../../src/services/timemachine';

describe('diffSessions', () => {
  it('detects added, removed, and modified cookies', () => {
    const base = {
      cookies: [
        { domain: '.example.com', name: 'sid', value: 'abc', path: '/' },
        { domain: '.example.com', name: 'lang', value: 'en', path: '/' },
      ],
      localStorage: { theme: 'dark' },
      sessionStorage: { cart: '1' },
    };

    const target = {
      cookies: [
        { domain: '.example.com', name: 'sid', value: 'xyz', path: '/' },
        { domain: '.example.com', name: 'pref', value: 'beta', path: '/' },
      ],
      localStorage: { theme: 'light', beta: 'true' },
      sessionStorage: {},
    };

    const diff = diffSessions(base, target);

    expect(diff.added.cookies).toHaveLength(1);
    expect(diff.removed.cookies).toHaveLength(1);
    expect(diff.modified.cookies).toHaveLength(1);
    expect(diff.added.localStorage).toHaveProperty('beta', 'true');
    expect(diff.modified.localStorage[0]).toMatchObject({ key: 'theme', old: 'dark', new: 'light' });
    expect(diff.removed.sessionStorage).toContain('cart');
  });
});

describe('planRetention', () => {
  it('keeps newest versions within policy and removes stale ones', () => {
    const now = Date.now();
    const versions = [
      { id: 'v1', created_at: now - 5 * 24 * 60 * 60 * 1000 },
      { id: 'v2', created_at: now - 10 * 24 * 60 * 60 * 1000 },
      { id: 'v3', created_at: now - 15 * 24 * 60 * 60 * 1000 },
    ];

    const toDelete = planRetention(versions, { maxVersions: 2, maxDays: 7 }, now);
    expect(toDelete).toContain('v3');
    expect(toDelete).toContain('v2');
    expect(toDelete).not.toContain('v1');
  });
});

describe('shouldAutoSnapshot', () => {
  it('enforces minimum interval between auto snapshots', () => {
    const now = Date.now();
    expect(shouldAutoSnapshot(null, now, 1000)).toBe(true);
    expect(shouldAutoSnapshot(now - 500, now, 1000)).toBe(false);
    expect(shouldAutoSnapshot(now - 1500, now, 1000)).toBe(true);
  });
});
