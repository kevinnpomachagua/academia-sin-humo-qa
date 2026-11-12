import { test } from '@playwright/test';

// Ejecuta CP-52 (REQ-D03) y CP-53 (REQ-D01) de docs/casos-de-prueba.md y MIDE el resultado real.
// Como en ejecucion-casos.spec.ts, aqui no se afirma: cada intento imprime `CPxx|estado|resumen`.
// Se lanza a demanda: npx playwright test tests/evidencia/ejecucion-reserva-d01-d03.spec.ts --reporter=line

// El servidor calcula "hoy" en UTC: las fechas se calculan en UTC
function fechaIso(diasDesdeHoy: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + diasDesdeHoy);
  return d.toISOString().slice(0, 10);
}

// [id, descripcion, inicio (dias o null=vacio), fin (dias o null=vacio)]
const intentos: [string, string, number | null, number | null][] = [
  ['CP-52a', 'fin = inicio', 5, 5],
  ['CP-52b', 'fin = inicio - 1 dia', 5, 4],
  ['CP-53a', 'inicio vacio', null, 8],
  ['CP-53b', 'fin vacio', 5, null],
];

test.describe.configure({ mode: 'serial' });

for (const [id, nombre, ini, fin] of intentos) {
  test(`${id} reserva con ${nombre}`, async ({ page }) => {
    await page.goto('/reserva');
    await page.getByTestId('reserva-start').fill(ini === null ? '' : fechaIso(ini));
    await page.getByTestId('reserva-end').fill(fin === null ? '' : fechaIso(fin));
    await page.getByTestId('reserva-submit').click();
    const confirmada = page.getByText(/reserva confirmada/i).first();
    const visible = await confirmada.waitFor({ state: 'visible', timeout: 4_000 }).then(() => true, () => false);
    const lineas = (await page.locator('main').innerText()).split('\n')
      .filter((l) => /no puede|no es v|inv[aá]lid|debe ser|obligatori|requerid|error/i.test(l));
    if (visible && id === 'CP-52a') await page.screenshot({ path: 'docs/evidencia/cp52-fin-igual-inicio.png', fullPage: false });
    // La spec exige rechazo en los cuatro intentos: PASA si NO aparece "Reserva confirmada"
    console.log(`${id}|${visible ? 'FALLA' : 'PASA'}|inicio=${ini === null ? '(vacio)' : fechaIso(ini)}, fin=${fin === null ? '(vacio)' : fechaIso(fin)}; "Reserva confirmada" ${visible ? 'visible' : 'no aparece'}${lineas.length ? `; mensaje: "${lineas[0]}"` : ''}`);
  });
}
