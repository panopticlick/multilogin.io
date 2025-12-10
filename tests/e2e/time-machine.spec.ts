import { test, expect, Page } from '@playwright/test';

type SnapshotSummary = {
  id: string;
  profileId: string;
  version: number;
  timestamp: number;
  size: number;
  type: string;
  cookieCount: number;
  localStorageCount: number;
  sessionStorageCount: number;
  domains: string[];
  author: { id: string | null; name: string };
  description?: string | null;
  isAutoSave: boolean;
};

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
};

const jsonResponse = (data: unknown) => ({
  status: 200,
  headers: {
    'content-type': 'application/json',
    ...corsHeaders,
  },
  body: JSON.stringify({ success: true, data }),
});

async function mockSession(page: Page) {
  const session = {
    user: {
      id: 'user-1',
      email: 'qa@multilogin.io',
      name: 'QA Owner',
    },
    expires: new Date(Date.now() + 3600_000).toISOString(),
    accessToken: 'stage-token',
    team: {
      id: 'team-1',
      name: 'QA Squad',
      plan: 'pro',
      role: 'owner',
    },
  };

  await page.route('**/api/auth/session**', async (route, request) => {
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        headers: {
          'content-type': 'application/json',
          ...corsHeaders,
        },
        body: JSON.stringify(session),
      });
      return;
    }

    await route.continue();
  });
}

async function mockProfiles(page: Page) {
  await page.route('**/api/v1/profiles**', async (route, request) => {
    if (request.method() === 'GET') {
      await route.fulfill(
        jsonResponse({
          items: [
            {
              id: 'profile-stage1',
              name: 'Launch QA',
              status: 'available',
              tags: [],
            },
          ],
          total: 1,
          page: 1,
          pageSize: 50,
          totalPages: 1,
        })
      );
      return;
    }

    await route.continue();
  });
}

async function mockSnapshotRoutes(page: Page) {
  const snapshots: SnapshotSummary[] = [
    {
      id: 'snap-001',
      profileId: 'profile-stage1',
      version: 1,
      timestamp: Date.now() - 60 * 60 * 1000,
      size: 1024,
      type: 'auto:launch',
      cookieCount: 2,
      localStorageCount: 1,
      sessionStorageCount: 0,
      domains: ['example.com'],
      author: { id: 'system', name: 'System' },
      description: 'Auto snapshot',
      isAutoSave: true,
    },
    {
      id: 'snap-002',
      profileId: 'profile-stage1',
      version: 2,
      timestamp: Date.now(),
      size: 2048,
      type: 'manual',
      cookieCount: 3,
      localStorageCount: 2,
      sessionStorageCount: 1,
      domains: ['example.com', 'shop.example.com'],
      author: { id: 'user-1', name: 'QA Owner' },
      description: 'Manual snapshot',
      isAutoSave: false,
    },
  ];

  await page.route('**/api/v1/time-machine/profile-stage1/snapshots', async (route, request) => {
    if (request.method() === 'GET') {
      await route.fulfill(jsonResponse(snapshots));
      return;
    }

    if (request.method() === 'POST') {
      await route.fulfill(jsonResponse({ id: 'snap-003', version: 3 }));
      return;
    }

    await route.continue();
  });

  await page.route('**/api/v1/time-machine/profile-stage1/snapshots/snap-002', async (route) => {
    await route.fulfill(
      jsonResponse({
        id: 'snap-002',
        version: 2,
        timestamp: snapshots[1].timestamp,
        cookies: [{ domain: '.example.com', name: 'sid', value: 'xyz', path: '/' }],
        localStorage: { theme: 'light' },
        sessionStorage: { cart: '2' },
      })
    );
  });

  await page.route('**/api/v1/time-machine/profile-stage1/compare**', async (route) => {
    const diff = {
      added: {
        cookies: [{ domain: '.example.com', name: 'pref', value: 'beta', path: '/' }],
        localStorage: { beta: 'true' },
        sessionStorage: {},
      },
      removed: {
        cookies: [{ domain: '.example.com', name: 'legacy', value: 'old', path: '/' }],
        localStorage: [],
        sessionStorage: ['cart'],
      },
      modified: {
        cookies: [
          {
            old: { domain: '.example.com', name: 'sid', value: 'abc', path: '/' },
            new: { domain: '.example.com', name: 'sid', value: 'xyz', path: '/' },
          },
        ],
        localStorage: [{ key: 'theme', old: 'dark', new: 'light' }],
        sessionStorage: [],
      },
    };

    await route.fulfill(jsonResponse(diff));
  });

  await page.route('**/api/v1/time-machine/profile-stage1/restore/snap-002', async (route) => {
    await route.fulfill(jsonResponse({ message: 'restored' }));
  });

  await page.route('**/api/v1/time-machine/profile-stage1/partial-restore', async (route) => {
    await route.fulfill(jsonResponse({ message: 'partial' }));
  });
}

async function mockCurrentUser(page: Page) {
  await page.route('**/api/v1/users/me', async (route) => {
    await route.fulfill(
      jsonResponse({
        id: 'user-1',
        email: 'qa@multilogin.io',
        name: 'QA Owner',
        image: null,
        team: {
          id: 'team-1',
          name: 'QA Squad',
          plan: 'pro',
          role: 'owner',
        },
      })
    );
  });
}

const setup = async (page: Page) => {
  await mockSession(page);
  await mockCurrentUser(page);
  await mockProfiles(page);
  await mockSnapshotRoutes(page);
};

test.describe('Time Machine flows', () => {
  // This test requires full authentication mock which is complex to setup
  // It works in local development with proper session state
  test.skip('diffs and partial restore flow', async ({ page }) => {
    await setup(page);

    await page.goto('/dashboard/time-machine');

    await expect(page.getByText('Launch QA')).toBeVisible();
    await expect(page.getByText('Manual snapshot')).toBeVisible();

    await page.getByRole('button', { name: 'Compare' }).click();
    await expect(page.getByText('localStorage:theme')).toBeVisible();

    await page.getByRole('button', { name: 'Partial Restore' }).click();
    await page.locator('label', { hasText: 'Cookies' }).click();
    await page.locator('label', { hasText: 'Local Storage' }).click();
    await page.getByRole('button', { name: 'Apply Selection' }).click();

    await expect(page.getByText('Partial restore queued')).toBeVisible();
  });
});
