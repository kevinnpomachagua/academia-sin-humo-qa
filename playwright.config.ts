import { defineConfig, devices } from '@playwright/test';

// En ejecucion con --headed la ventana se abre maximizada (en headless se mantiene el viewport por defecto)
const headed = process.argv.includes('--headed');

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
    {
      name: 'chromium',
      use: headed
        ? { ...devices['Desktop Chrome'], viewport: null, launchOptions: { args: ['--start-maximized'], slowMo: Number(process.env.SLOWMO ?? 0) } }
        : { ...devices['Desktop Chrome'] },
    },
  ],
});
