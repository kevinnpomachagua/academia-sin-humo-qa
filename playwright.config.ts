import { defineConfig, devices } from '@playwright/test';

// En ejecucion con --headed la ventana se abre maximizada (en headless se mantiene el viewport por defecto)
const headed = process.argv.includes('--headed');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // sin reintentos: un test inestable debe verse, no esconderse con un segundo intento
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://playground.calidadsinhumo.com',
    trace: 'retain-on-failure',
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
