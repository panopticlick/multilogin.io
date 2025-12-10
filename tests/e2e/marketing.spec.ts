import { test, expect } from '@playwright/test';

test.describe('Marketing Pages', () => {
  test('homepage loads and displays key elements', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Multilogin/);

    // Check hero section - look for main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check CTA buttons - at least one should be visible
    const hasStartButton = await page.getByRole('link', { name: /Start|Get Started|Sign Up/i }).first().isVisible().catch(() => false);
    const hasLoginButton = await page.getByRole('link', { name: /Login|Sign In/i }).first().isVisible().catch(() => false);
    expect(hasStartButton || hasLoginButton).toBeTruthy();
  });

  test('pricing page shows free plan', async ({ page }) => {
    await page.goto('/pricing');

    // Check for free plan indicators (flexible matching)
    const hasFreeText = await page.getByText(/Free|$0|free forever/i).first().isVisible().catch(() => false);
    expect(hasFreeText).toBeTruthy();
  });

  test('features page loads', async ({ page }) => {
    await page.goto('/features');

    await expect(page).toHaveTitle(/Features/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('docs page loads', async ({ page }) => {
    await page.goto('/docs');

    // Check page loaded
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');

    await expect(page).toHaveTitle(/About/);
    // Check for mission or about content
    const hasAboutContent = await page.getByText(/Mission|About|Team/i).first().isVisible().catch(() => false);
    expect(hasAboutContent).toBeTruthy();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');

    await expect(page).toHaveTitle(/Contact/);
    // Check for contact form or info
    const hasContactContent = await page.getByText(/Contact|Get in Touch|Email/i).first().isVisible().catch(() => false);
    expect(hasContactContent).toBeTruthy();
  });

  test('changelog page loads', async ({ page }) => {
    await page.goto('/changelog');

    await expect(page).toHaveTitle(/Changelog/);
    // Check for changelog content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('API docs page loads', async ({ page }) => {
    await page.goto('/docs/api');

    // Check page loaded with API content
    await expect(page).toHaveTitle(/API/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('header navigation works', async ({ page }) => {
    await page.goto('/');

    // Navigate to features
    await page.getByRole('link', { name: 'Features' }).first().click();
    await expect(page).toHaveURL('/features');

    // Navigate to pricing
    await page.getByRole('link', { name: 'Pricing' }).first().click();
    await expect(page).toHaveURL('/pricing');

    // Navigate to docs
    await page.getByRole('link', { name: 'Docs' }).first().click();
    await expect(page).toHaveURL('/docs');
  });

  test('footer links work', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer links exist
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
  });
});

test.describe('SEO', () => {
  test('homepage has proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription?.length).toBeGreaterThan(50);

    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();

    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDescription).toBeTruthy();
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });
});
