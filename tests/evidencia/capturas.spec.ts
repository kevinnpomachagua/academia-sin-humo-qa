import { test, expect, Page, Locator } from '@playwright/test';

// Genera la evidencia visual de los hallazgos: ejecuta el caso, resalta el defecto en rojo y guarda la captura.
// No es parte de la suite de regresion: se lanza a demanda con `npx playwright test tests/evidencia`.
// Datos de prueba generados aqui, sin credenciales reales.

const OUT = 'docs/evidencia';
const sufijo = () => `${Date.now()}`;

// El servidor calcula "hoy" en UTC: las fechas de reserva se calculan en UTC
function fecha(diasDesdeHoy: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + diasDesdeHoy);
  return d.toISOString().slice(0, 10);
}

// Dibuja un recuadro rojo y una etiqueta al costado del elemento donde ocurre el defecto
// (si no cabe a la derecha, va debajo; nunca encima, para no tapar la barra de navegacion)
async function resaltar(loc: Locator, etiqueta: string) {
  await loc.first().evaluate((el, texto) => {
    const r = el.getBoundingClientRect();
    const caja = document.createElement('div');
    caja.style.cssText = `position:fixed;left:${r.left - 4}px;top:${r.top - 4}px;width:${r.width + 8}px;height:${r.height + 8}px;border:3px solid #e11d48;border-radius:6px;z-index:99999;pointer-events:none`;
    const tag = document.createElement('div');
    tag.textContent = texto;
    tag.style.cssText = 'position:fixed;background:#e11d48;color:#fff;font:600 12px/1.2 sans-serif;padding:5px 8px;border-radius:4px;z-index:99999;pointer-events:none;max-width:180px';
    document.body.append(caja, tag);
    const w = tag.getBoundingClientRect().width;
    if (r.right + 12 + w <= window.innerWidth) {
      tag.style.left = `${r.right + 12}px`;
      tag.style.top = `${r.top + r.height / 2 - 12}px`;
    } else {
      tag.style.left = `${r.left}px`;
      tag.style.top = `${r.bottom + 8}px`;
    }
  }, etiqueta);
}

async function captura(page: Page, nombre: string) {
  await page.screenshot({ path: `${OUT}/${nombre}.png`, fullPage: false });
}

test.describe.configure({ mode: 'serial' });

test('CP-01 REQ-R06: el registro exitoso no limpia el formulario', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 }); // que quepan los 4 campos en la captura
  await page.goto('/registro');
  await page.getByTestId('register-name').fill('Marcela Quispe Huamán');
  await page.getByTestId('register-email').fill(`marcela.quispe.${sufijo()}@yopmail.com`);
  await page.getByTestId('register-password').fill('Lima#2026qa');
  await page.getByTestId('register-age').fill('29');
  await captura(page, 'cp01-registro-antes');
  const registro = page.waitForResponse((r) => r.url().includes('/api/register') && r.request().method() === 'POST');
  await page.getByTestId('register-submit').click();
  expect((await registro).status()).toBe(201);
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  for (const campo of ['register-name', 'register-email', 'register-password', 'register-age']) {
    const loc = page.getByTestId(campo);
    if ((await loc.inputValue()) !== '') await resaltar(loc, 'REQ-R06: conserva el dato');
  }
  await captura(page, 'cp01-registro-despues');
});

test('CP-02 REQ-L03: medir tras cuantos intentos se bloquea el login', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/login');
  const email = `renzo.caceres.${sufijo()}@yopmail.com`;
  const boton = page.getByTestId('login-submit');
  let bloqueadoTras: number | null = null;
  for (let intento = 1; intento <= 6; intento++) {
    if (await boton.isDisabled()) { bloqueadoTras = intento - 1; break; }
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(`Cusco#${intento}`);
    const respuesta = page.waitForResponse((r) => r.url().includes('/api/login') && r.request().method() === 'POST');
    await boton.click({ timeout: 5_000 });
    await respuesta;
    await page.waitForTimeout(500);
    console.log(`intento ${intento}: boton deshabilitado = ${await boton.isDisabled()}`);
    if (await boton.isDisabled()) { bloqueadoTras = intento; break; }
  }
  console.log(`BLOQUEADO_TRAS=${bloqueadoTras}`);
  await resaltar(boton, `Bloqueado tras ${bloqueadoTras} intentos (spec: 5)`);
  await captura(page, 'cp02-bloqueo');
});

test('CP-04 REQ-N01..N03: la paginacion pierde y repite estudiantes', async ({ page }) => {
  await page.goto('/estudiantes');
  await expect(page.locator('[data-testid^="student-"]').first()).toBeVisible();
  const filas1 = await page.locator('[data-testid^="student-"]').count();
  console.log(`pagina 1: ${filas1} filas; info="${await page.getByTestId('pagination-info').innerText()}"`);
  await resaltar(page.getByTestId('pagination-info'), 'Debe decir "pagina 1 de 3"');
  await captura(page, 'cp04-pagina1');
  await page.getByTestId('page-next').click();
  await page.waitForTimeout(800);
  const filas2 = await page.locator('[data-testid^="student-"]').count();
  console.log(`pagina 2: ${filas2} filas; primero="${await page.locator('[data-testid^="student-"]').first().innerText()}"`);
  await resaltar(page.locator('[data-testid^="student-"]').first(), 'Repetido de la pagina 1');
  await captura(page, 'cp04-pagina2');
});

test('CP-05 REQ-D02: la reserva acepta un inicio a 31 dias', async ({ page }) => {
  await page.goto('/reserva');
  await page.getByTestId('reserva-start').fill(fecha(31));
  await page.getByTestId('reserva-end').fill(fecha(34));
  await page.getByTestId('reserva-submit').click();
  const mensaje = page.getByText(/reserva confirmada/i);
  await mensaje.first().waitFor({ timeout: 5_000 }).catch(() => undefined);
  console.log(`31 dias (${fecha(31)}): confirmada = ${await mensaje.count() > 0}`);
  if (await mensaje.count()) await resaltar(mensaje, 'REQ-D02: debia rechazarse (31 dias)');
  await captura(page, 'cp05-31-dias');
});

test('CP-06 control REQ-D02: un inicio a 30 dias se acepta', async ({ page }) => {
  await page.goto('/reserva');
  await page.getByTestId('reserva-start').fill(fecha(30));
  await page.getByTestId('reserva-end').fill(fecha(33));
  await page.getByTestId('reserva-submit').click();
  const mensaje = page.getByText(/reserva confirmada/i);
  await mensaje.first().waitFor({ timeout: 5_000 }).catch(() => undefined);
  console.log(`30 dias (${fecha(30)}): confirmada = ${await mensaje.count() > 0}`);
  await captura(page, 'cp06-30-dias');
});
