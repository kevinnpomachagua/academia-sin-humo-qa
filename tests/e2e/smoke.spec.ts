import { test, expect } from '@playwright/test';

// Humo de instalación: confirma que el entorno llega al producto bajo prueba.
test('la página de login responde y es visible', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('body')).toBeVisible();
});
