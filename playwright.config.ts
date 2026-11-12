import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://playground.calidadsinhumo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Solo los navegadores que se instalan en CI (ver .github/workflows)
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
