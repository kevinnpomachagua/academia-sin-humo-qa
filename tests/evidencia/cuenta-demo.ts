import { Page } from '@playwright/test';

// Cuenta de practica que el propio sitio publica en /login (recuadro data-testid="demo-credentials").
// Las credenciales se leen en tiempo de ejecucion y NUNCA se escriben en archivos, logs ni evidencia.
// La cuenta es compartida: su estado puede haber sido modificado por otras personas.

export interface CuentaDemo { email: string; password: string }

// Abre /login (salvo ir=false) y extrae email y password del recuadro
export async function leerCuentaDemo(page: Page, ir = true): Promise<CuentaDemo> {
  if (ir) await page.goto('/login');
  const caja = page.getByTestId('demo-credentials');
  await caja.waitFor({ state: 'visible' });
  const texto = await caja.innerText();
  const email = texto.match(/Email:\s*(\S+)/i)?.[1];
  const password = texto.match(/Password:\s*(\S+)/i)?.[1];
  if (!email || !password) throw new Error('No se pudo leer la cuenta de prueba del recuadro de /login');
  return { email, password };
}

// Inicia sesion con la cuenta demo desde la pagina actual de /login y espera el saludo
export async function iniciarSesionDemo(page: Page, ir = true): Promise<void> {
  const c = await leerCuentaDemo(page, ir);
  await page.getByTestId('login-email').fill(c.email);
  await page.getByTestId('login-password').fill(c.password);
  await page.getByTestId('login-submit').click();
  await page.getByTestId('login-welcome').waitFor({ state: 'visible', timeout: 10_000 });
}
