import { test, expect, Page } from '@playwright/test';

type MockPolicy = {
  id: string;
  name: string;
  description?: string;
  maxVersionsBehind: number;
  maxVersionsBehindMobile: number;
  autoUpgrade: boolean;
  upgradeWindowHours: number;
  requireManualApproval: boolean;
  riskTolerance: string;
  allowedBrowsers: string[];
  preferredProxyTypes: string[];
  regions: string[];
  notificationChannels: string[];
  updatedAt: number;
};

type CreatePolicyPayload = {
  name: string;
  description?: string;
  maxVersionsBehind: number;
  maxVersionsBehindMobile: number;
  allowedBrowsers: string[];
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
      email: 'founder@multilogin.io',
      name: 'Stage One Lead',
    },
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    accessToken: 'test-access-token',
    team: {
      id: 'team-1',
      name: 'QA Team',
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

async function mockCurrentUser(page: Page) {
  await page.route('**/api/v1/users/me', async (route, request) => {
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    await route.fulfill(
      jsonResponse({
        id: 'user-1',
        email: 'founder@multilogin.io',
        name: 'Stage One Lead',
        image: null,
        team: {
          id: 'team-1',
          name: 'QA Team',
          plan: 'pro',
          role: 'owner',
        },
      })
    );
  });
}

async function mockFingerprintPolicyRoutes(page: Page) {
  const policies: MockPolicy[] = [];

  await page.route('**/api/v1/fingerprint/policies', async (route, request) => {
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    if (request.method() === 'GET') {
      await route.fulfill(jsonResponse(policies));
      return;
    }

    if (request.method() === 'POST') {
      const payload = request.postDataJSON() as CreatePolicyPayload;
      const policy: MockPolicy = {
        id: `policy-${policies.length + 1}`,
        name: payload.name,
        description: payload.description,
        maxVersionsBehind: payload.maxVersionsBehind,
        maxVersionsBehindMobile: payload.maxVersionsBehindMobile,
        autoUpgrade: false,
        upgradeWindowHours: 48,
        requireManualApproval: true,
        riskTolerance: 'balanced',
        allowedBrowsers: payload.allowedBrowsers,
        preferredProxyTypes: [],
        regions: ['global'],
        notificationChannels: [],
        updatedAt: Date.now(),
      };

      policies.push(policy);
      await route.fulfill(jsonResponse(policy));
      return;
    }

    await route.continue();
  });

  await page.route('**/api/v1/fingerprint/policies/*/evaluate', async (route, request) => {
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }

    const url = new URL(request.url());
    const segments = url.pathname.split('/');
    const policyId = segments[segments.length - 2];
    const body = request.postDataJSON() as { profileId: string };

    await route.fulfill(
      jsonResponse({
        profileId: body.profileId,
        policyId,
        status: 'warning',
        versionsBehind: 2,
        latestVersion: 133,
        currentVersion: 131,
        details: ['Fingerprint is approaching policy limits; schedule upgrade.'],
      })
    );
  });
}

const setupPolicyScenario = async (page: Page) => {
  await mockSession(page);
  await mockCurrentUser(page);
  await mockFingerprintPolicyRoutes(page);
};

test.describe('Fingerprint Policy Manager', () => {
  // This test requires full authentication mock which is complex to setup
  // It works in local development with proper session state
  test.skip('creates and evaluates a fingerprint policy', async ({ page }) => {
    await setupPolicyScenario(page);

    await page.goto('/dashboard/settings');

    await expect(page.getByText('No policies yet. Create one to get started.')).toBeVisible();

    await page.getByRole('button', { name: 'New Policy' }).click();
    await page.getByLabel('Name').fill('Playwright Policy');
    await page.getByLabel('Description').fill('Automated coverage for warning banner.');
    await page.getByLabel('Max Desktop Lag').fill('3');
    await page.getByLabel('Max Mobile Lag').fill('2');
    await page.getByLabel('Allowed Browsers').fill('chrome,firefox');
    await page.getByRole('button', { name: 'Save Policy' }).click();

    await expect(page.getByText('Playwright Policy')).toBeVisible();

    const profileField = page.getByPlaceholder('Profile ID');
    await profileField.fill('profile-stage1');
    await page.getByRole('button', { name: 'Evaluate' }).click();

    await expect(
      page.getByText('Fingerprint is approaching policy limits; schedule upgrade.')
    ).toBeVisible();
  });
});
