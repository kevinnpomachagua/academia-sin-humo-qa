import { test, expect } from '@playwright/test';

// Demostración visible del login con la cuenta de prueba del sitio.
// Las credenciales se leen del recuadro público de /login en tiempo de ejecución: no se guardan en el repo.
// Uso: SLOWMO=700 npx playwright test tests/evidencia/ver-login.spec.ts --headed

test('login exitoso con la cuenta de prueba del sitio (REQ-L04)', async ({ page }) => {
  await page.goto('/login');
  const recuadro = await page.getByTestId('demo-credentials').innerText();
  const email = recuadro.match(/Email:\s*(\S+)/)?.[1];
  const password = recuadro.match(/Password:\s*(\S+)/)?.[1];
  expect(email, 'el recuadro debe mostrar el email de la cuenta de prueba').toBeTruthy();
  expect(password, 'el recuadro debe mostrar la contraseña de la cuenta de prueba').toBeTruthy();

  await page.getByTestId('login-email').fill(email!);
  await page.getByTestId('login-password').fill(password!);
  await page.getByTestId('login-submit').click();

  await expect(page.getByText(/bienvenid|hola/i).first()).toBeVisible();
  await page.screenshot({ path: 'docs/evidencia/cp25-login-exitoso.png' });
});
