import { test, expect, Page } from '@playwright/test';

// Mock session helper
async function mockUnauthenticated(page: Page) {
  await page.route('**/api/auth/session**', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
  });
}

test.describe('Authentication Pages', () => {
  test('login page loads', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/login');

    // Page should have loaded successfully
    await expect(page.getByRole('button', { name: /Sign in|Login/i })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/register');

    // Check for registration form elements
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    // Check for either a register button or create account button
    const hasRegisterButton = await page.getByRole('button', { name: /Create|Register|Sign up/i }).isVisible().catch(() => false);
    expect(hasRegisterButton).toBeTruthy();
  });

  test('forgot password page loads', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/forgot-password');

    // Check for forgot password form elements
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    // Check for reset/send button
    const hasResetButton = await page.getByRole('button', { name: /Reset|Send|Submit/i }).isVisible().catch(() => false);
    expect(hasResetButton).toBeTruthy();
  });

  test('login page has OAuth buttons', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/login');

    // Check for OAuth provider buttons
    const googleButton = page.getByRole('button', { name: /Google/i });
    const githubButton = page.getByRole('button', { name: /GitHub/i });

    // At least one OAuth provider should be available
    const hasOAuth = await googleButton.isVisible() || await githubButton.isVisible();
    expect(hasOAuth).toBeTruthy();
  });

  test('login form shows validation errors', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: /Sign in|Login/i }).click();

    // Should show validation message (either browser validation or custom)
    const emailInput = page.getByLabel(/Email/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('link from login to register works', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/login');

    // Find and click register link
    const registerLink = page.getByRole('link', { name: /Create|Register|Sign up/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
  });

  test('link from login to forgot password works', async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto('/login');

    // Find and click forgot password link
    const forgotLink = page.getByRole('link', { name: /Forgot|Reset/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await expect(page).toHaveURL(/forgot-password/);
    }
  });
});

test.describe('Protected Routes', () => {
  test('dashboard redirects to login when unauthenticated', async ({ page }) => {
    await mockUnauthenticated(page);

    // Try to access dashboard
    await page.goto('/dashboard');

    // Should redirect to login or show login prompt
    await expect(page).toHaveURL(/login|auth/);
  });

  test('profiles page redirects to login when unauthenticated', async ({ page }) => {
    await mockUnauthenticated(page);

    await page.goto('/dashboard/profiles');

    await expect(page).toHaveURL(/login|auth/);
  });

  test('settings page redirects to login when unauthenticated', async ({ page }) => {
    await mockUnauthenticated(page);

    await page.goto('/dashboard/settings');

    await expect(page).toHaveURL(/login|auth/);
  });
});
