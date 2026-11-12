import { test, expect } from '@playwright/test';

// Sondas de UI para los dos REQ pendientes de reproducir. Cada test afirma lo que EXIGE la spec:
// si el bug existe, el test FALLA (eso es lo esperado al reproducirlo).
// Selectores: data-testid publicados por el producto. Datos generados en el test, sin secretos.

const sufijo = () => `${Date.now()}`;

test.describe('Sondeo UI contra la spec', () => {
  test('BUG-09 REQ-R06 el formulario de registro debe limpiarse tras un alta exitosa', async ({ page }) => {
    test.fail(true, 'BUG-09: el formulario de registro conserva los datos tras un alta exitosa (REQ-R06)');
    // Arrange
    await page.goto('/registro');
    await page.getByTestId('register-name').fill('Sondeo QA');
    await page.getByTestId('register-email').fill(`sondeo.ui.${sufijo()}@example.com`);
    await page.getByTestId('register-password').fill(`Pw-${sufijo()}-aA1`);
    await page.getByTestId('register-age').fill('30');

    // Act
    const registro = page.waitForResponse((r) => r.url().includes('/api/register') && r.request().method() === 'POST');
    await page.getByTestId('register-submit').click();
    expect((await registro).status(), 'precondicion: el alta debe ser exitosa').toBe(201);

    // Assert: ningun campo conserva datos (soft: reporta los cuatro, no solo el primero)
    for (const campo of ['register-name', 'register-email', 'register-password', 'register-age']) {
      await expect.soft(page.getByTestId(campo), `${campo} debe quedar vacio`).toHaveValue('');
    }
  });

  test('BUG-10 REQ-L03 el 5.o intento fallido debe bloquear la cuenta', async ({ page }) => {
    test.fail(true, 'BUG-10: el bloqueo por intentos fallidos ocurre tras el 4.o intento, no el 5.o (REQ-L03)');
    test.setTimeout(60_000);
    // Arrange: cuenta inexistente, contrasena incorrecta (no se usa ninguna credencial real)
    await page.goto('/login');
    const email = `sin.cuenta.${sufijo()}@example.com`;
    const boton = page.getByTestId('login-submit');
    let bloqueadoTras: number | null = null;

    // Act: intentos fallidos consecutivos; se mide tras cuantos queda deshabilitado el boton
    for (let intento = 1; intento <= 6; intento++) {
      if (await boton.isDisabled()) { bloqueadoTras = intento - 1; break; }
      await page.getByTestId('login-email').fill(email);
      await page.getByTestId('login-password').fill(`incorrecta-${intento}`);
      const respuesta = page.waitForResponse((r) => r.url().includes('/api/login') && r.request().method() === 'POST');
      await boton.click({ timeout: 5_000 });
      await respuesta;
      // Sondeo con tope de 1 s (no es una espera fija): si el boton no se deshabilita, sigue con el siguiente intento
      const bloqueado = await expect.poll(() => boton.isDisabled(), { timeout: 1_000 }).toBe(true).then(() => true, () => false);
      if (bloqueado) { bloqueadoTras = intento; break; }
    }
    test.info().annotations.push({ type: 'bloqueado-tras', description: String(bloqueadoTras) });

    // Assert: la spec exige el bloqueo tras exactamente 5 intentos fallidos
    expect(bloqueadoTras, `la cuenta se bloqueo tras ${bloqueadoTras} intentos (la spec exige 5)`).toBe(5);
  });
});
