import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const HOST = '127.0.0.1';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    trace: 'retain-on-failure',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --hostname ${HOST} --port ${PORT}`,
    url: `http://${HOST}:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      AUTH_SECRET: 'playwright-secret',
      NEXTAUTH_SECRET: 'playwright-secret',
      NEXTAUTH_URL: `http://${HOST}:${PORT}`,
      NEXT_PUBLIC_API_URL: 'https://api.multilogin.io',
    },
  },
});
