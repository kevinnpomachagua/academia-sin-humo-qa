import { test, expect, APIRequestContext, APIResponse, Locator, Page, TestInfo } from '@playwright/test';
import { leerCuentaDemo, iniciarSesionDemo } from './cuenta-demo';

// Ejecuta por API los casos de docs/casos-de-prueba.md y MIDE el resultado real contra la spec.
// Aqui no se afirma: cada caso imprime una linea `CPxx|estado|resumen` y el spec termina en verde
// aunque el producto incumpla la spec (los incumplimientos son hallazgos, no fallos del spec).
// Se lanza a demanda: npx playwright test tests/evidencia/ejecucion-casos.spec.ts --reporter=line

test.describe.configure({ mode: 'serial' });

let contador = 0;
const sufijo = () => `${Date.now()}${++contador}`;

interface Alta { name: string; email: string; password: string; age: number }
type Veredicto = { ok: boolean; resumen: string } | { noEjecutado: string };
type Estado = 'inscrito' | 'en-progreso' | 'completado' | 'certificado' | 'abandonado';

const emailNuevo = (prefijo = 'marcela.quispe') => `${prefijo}.${sufijo()}@yopmail.com`;
const altaValida = (cambios: Partial<Alta> = {}): Alta => ({
  name: 'Marcela Quispe Huamán', email: emailNuevo(), password: 'Lima#2026qa', age: 29, ...cambios,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cuerpo(res: APIResponse): Promise<any> {
  const t = await res.text();
  try { return JSON.parse(t); } catch { return t; }
}

async function adjuntar(ti: TestInfo, nombre: string, res: APIResponse, enviado?: unknown) {
  const body = await cuerpo(res);
  await ti.attach(nombre, {
    contentType: 'application/json',
    body: JSON.stringify({ request: { url: res.url(), body: enviado }, response: { status: res.status(), body } }, null, 2),
  });
  return body;
}

async function registrar(request: APIRequestContext, a: Alta, ti: TestInfo) {
  const res = await request.post('/api/register', { data: a });
  const body = await adjuntar(ti, `registro-${a.email}`, res, { ...a, password: '<omitida>' });
  return { status: res.status(), body };
}

async function sesion(request: APIRequestContext, ti: TestInfo): Promise<Alta> {
  const a = altaValida();
  const r = await registrar(request, a, ti);
  if (r.status !== 201) throw new Error(`precondicion: registro devolvio ${r.status}`);
  const res = await request.post('/api/login', { data: { email: a.email, password: a.password } });
  await adjuntar(ti, 'login', res, { email: a.email, password: '<omitida>' });
  if (res.status() !== 200) throw new Error(`precondicion: login devolvio ${res.status()}`);
  return a;
}

async function inscribir(request: APIRequestContext, courseId: string | undefined, ti: TestInfo) {
  const data = courseId === undefined ? {} : { courseId };
  const res = await request.post('/api/enroll', { data });
  const body = await adjuntar(ti, `enroll-${courseId ?? 'sin-courseId'}`, res, data);
  return { status: res.status(), body };
}

async function progreso(request: APIRequestContext, courseId: string, action: string, ti: TestInfo) {
  const data = { courseId, action };
  const res = await request.post('/api/progress', { data });
  const body = await adjuntar(ti, `progress-${courseId}-${action}`, res, data);
  return { status: res.status(), body, estado: String(body?.currentStatus ?? body?.status ?? body?.displayStatus ?? '?') };
}

interface Curso { id: string; prerequisiteId: string | null; maxStudents: number; enrolled: number }
async function catalogo(request: APIRequestContext): Promise<Curso[]> {
  return ((await (await request.get('/api/courses')).json()) as { courses: Curso[] }).courses;
}

// Deja el curso (y su cadena de prerequisitos) en estado Completado
async function completarCadena(request: APIRequestContext, cursos: Curso[], id: string, ti: TestInfo): Promise<void> {
  const curso = cursos.find((c) => c.id === id);
  if (!curso) throw new Error(`curso ${id} no esta en el catalogo`);
  if (curso.prerequisiteId) await completarCadena(request, cursos, curso.prerequisiteId, ti);
  const ins = await inscribir(request, id, ti);
  if (ins.status !== 200) throw new Error(`precondicion: inscribir ${id} devolvio ${ins.status}`);
  for (const accion of ['comenzar', 'completar']) {
    const p = await progreso(request, id, accion, ti);
    if (p.status !== 200) throw new Error(`precondicion: ${accion} ${id} devolvio ${p.status}`);
  }
}

// Deja un curso sin prerequisito en el estado de partida pedido
async function llevarA(request: APIRequestContext, id: string, estado: Estado, ti: TestInfo) {
  const ins = await inscribir(request, id, ti);
  if (ins.status !== 200) throw new Error(`precondicion: inscribir devolvio ${ins.status}`);
  const camino: Record<Estado, string[]> = {
    inscrito: [], 'en-progreso': ['comenzar'], completado: ['comenzar', 'completar'],
    certificado: ['comenzar', 'completar', 'certificar'], abandonado: ['abandonar'],
  };
  for (const accion of camino[estado]) {
    const p = await progreso(request, id, accion, ti);
    if (p.status !== 200) throw new Error(`precondicion: ${accion} devolvio ${p.status}`);
  }
}

// Registra una linea de resultado; nunca lanza
async function caso(id: string, fn: () => Promise<Veredicto>) {
  let linea: string;
  try {
    const v = await fn();
    linea = 'noEjecutado' in v ? `${id}|NO EJECUTADO|${v.noEjecutado}` : `${id}|${v.ok ? 'PASA' : 'FALLA'}|${v.resumen}`;
  } catch (e) {
    linea = `${id}|ERROR|${String((e as Error).message).split('\n')[0]}`;
  }
  console.log(linea);
}

const rechazado = (s: number) => s >= 400 && s < 500;

// Bloqueo de login: tras provocarlo se deja pasar el tiempo (35 s) antes de la siguiente prueba que lo provoque
let desbloqueoEn = 0;
const marcarBloqueo = () => { desbloqueoEn = Date.now() + 35_000; };
async function esperarSinBloqueo() {
  await expect.poll(() => Date.now() >= desbloqueoEn, { timeout: 45_000, intervals: [1_000] }).toBe(true);
}

// Recuadro rojo + etiqueta sobre el defecto y captura a docs/evidencia
async function capturaResaltada(page: Page, loc: Locator, etiqueta: string, nombre: string) {
  await loc.first().evaluate((el, texto) => {
    const r = el.getBoundingClientRect();
    const caja = document.createElement('div');
    caja.style.cssText = `position:fixed;left:${r.left - 4}px;top:${r.top - 4}px;width:${r.width + 8}px;height:${r.height + 8}px;border:3px solid #e11d48;border-radius:6px;z-index:99999;pointer-events:none`;
    const tag = document.createElement('div');
    tag.textContent = texto;
    tag.style.cssText = `position:fixed;left:${r.left}px;top:${r.bottom + 8}px;background:#e11d48;color:#fff;font:600 12px/1.2 sans-serif;padding:5px 8px;border-radius:4px;z-index:99999;pointer-events:none;max-width:260px`;
    document.body.append(caja, tag);
  }, etiqueta);
  await page.screenshot({ path: `docs/evidencia/${nombre}.png` });
}
// Mensaje de error de una respuesta (no se compara su texto, solo que exista)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mensajeDe = (body: any): string => String(body?.error ?? body?.message ?? (body?.errors ? JSON.stringify(body.errors) : '')).slice(0, 70);

// El servidor calcula "hoy" en UTC: las fechas de reserva se calculan en UTC
function fechaIso(diasDesdeHoy: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + diasDesdeHoy);
  return d.toISOString().slice(0, 10);
}

test.describe('Ejecucion de casos de prueba (medicion, no afirmacion)', () => {
  const base50 = 'Marcela Quispe Huamán de la Cruz y Mamani Flores Pinto';
  const limites: [string, Partial<Alta>, boolean][] = [
    ['CP-01', { name: 'M' }, false],
    ['CP-02', { name: 'Ro' }, true],
    ['CP-03', { name: base50.slice(0, 50) }, true],
    ['CP-04', { name: base50.slice(0, 51) }, false],
    ['CP-05', { password: 'Lm#26qa' }, false],
    ['CP-06', { password: 'Lma#26qa' }, true],
    ['CP-07', { password: 'Lima#2026qa'.padEnd(64, 'x') }, true],
    ['CP-08', { password: 'Lima#2026qa'.padEnd(65, 'x') }, false],
    ['CP-09', { age: 15 }, false],
    ['CP-10', { age: 16 }, true],
    ['CP-11', { age: 99 }, true],
    ['CP-12', { age: 100 }, false],
  ];
  for (const [id, cambios, acepta] of limites) {
    test(`${id} limite de registro`, async ({ request }, ti) => {
      await caso(id, async () => {
        const a = altaValida(cambios);
        const r = await registrar(request, a, ti);
        const ok = acepta ? r.status === 201 : rechazado(r.status);
        return { ok, resumen: `len(nombre)=${a.name.length}, len(pw)=${a.password.length}, edad=${a.age}; HTTP ${r.status}${r.body?.errors ? ' ' + JSON.stringify(r.body.errors) : ''}` };
      });
    });
  }

  const emails: [string, string, boolean][] = [
    ['CP-13', 'usuario@', false],
    ['CP-14', 'usuario', false],
    ['CP-15', 'lucia.mamani@yopmail', false],
    ['CP-16', '', true],
  ];
  for (const [id, email, acepta] of emails) {
    test(`${id} particion de email`, async ({ request }, ti) => {
      await caso(id, async () => {
        const a = altaValida({ email: email || emailNuevo('lucia.mamani') });
        const r = await registrar(request, a, ti);
        const ok = acepta ? r.status === 201 : rechazado(r.status);
        return { ok, resumen: `email=${a.email}; HTTP ${r.status}${r.body?.errors ? ' ' + JSON.stringify(r.body.errors) : ''}` };
      });
    });
  }

  test('CP-17 campos obligatorios vacios', async ({ request }, ti) => {
    await caso('CP-17', async () => {
      const res = await request.post('/api/register', { data: { name: '', email: '', password: '', age: '' } });
      const body = await adjuntar(ti, 'registro-vacio', res);
      const campos = Object.keys(body?.errors ?? {});
      return { ok: rechazado(res.status()) && campos.length === 4, resumen: `HTTP ${res.status()}; errores por campo: ${campos.join(',') || 'ninguno'}` };
    });
  });

  test('CP-18 campo obligatorio faltante (email)', async ({ request }, ti) => {
    await caso('CP-18', async () => {
      const a = altaValida();
      const res = await request.post('/api/register', { data: { name: a.name, password: a.password, age: a.age } });
      const body = await adjuntar(ti, 'registro-sin-email', res);
      const campos = Object.keys(body?.errors ?? {});
      return { ok: rechazado(res.status()) && campos.includes('email'), resumen: `HTTP ${res.status()}; errores: ${campos.join(',') || 'ninguno'}` };
    });
  });

  test('CP-19 email duplicado', async ({ request }, ti) => {
    await caso('CP-19', async () => {
      const a = altaValida({ name: 'Renzo Cáceres', email: emailNuevo('renzo.caceres') });
      const primero = await registrar(request, a, ti);
      const segundo = await registrar(request, { ...a, name: 'Renzo Cáceres Pinto' }, ti);
      return { ok: primero.status === 201 && rechazado(segundo.status), resumen: `1.er registro HTTP ${primero.status}; 2.o con el mismo email HTTP ${segundo.status}` };
    });
  });

  test('CP-21 login con contrasena incorrecta', async ({ request }, ti) => {
    await caso('CP-21', async () => {
      const a = altaValida({ email: emailNuevo('lucia.mamani') });
      await registrar(request, a, ti);
      const res = await request.post('/api/login', { data: { email: a.email, password: 'Cusco#2027xx' } });
      const body = await adjuntar(ti, 'login-incorrecto', res, { email: a.email, password: '<omitida>' });
      return { ok: rechazado(res.status()), resumen: `HTTP ${res.status()} ${JSON.stringify(body).slice(0, 80)}` };
    });
  });

  test('CP-22 login sin contrasena', async ({ request }, ti) => {
    await caso('CP-22', async () => {
      const res = await request.post('/api/login', { data: { email: emailNuevo('renzo.caceres') } });
      const body = await adjuntar(ti, 'login-sin-password', res);
      return { ok: rechazado(res.status()), resumen: `HTTP ${res.status()} ${JSON.stringify(body).slice(0, 80)}` };
    });
  });

  // Tabla de decision REQ-C02
  test('CP-27 C02 prerequisito Si x cupo Si', async ({ request }, ti) => {
    await caso('CP-27', async () => {
      await sesion(request, ti);
      const cursos = await catalogo(request);
      await completarCadena(request, cursos, 'fundamentos', ti);
      const r = await inscribir(request, 'playwright-cero', ti);
      return { ok: r.status === 200 && r.body?.status === 'inscrito', resumen: `HTTP ${r.status} status=${r.body?.status}` };
    });
  });

  test('CP-28 C02 prerequisito Si x cupo No', async ({ request }, ti) => {
    await caso('CP-28', async () => {
      await sesion(request, ti);
      const cursos = await catalogo(request);
      const lleno = cursos.find((c) => c.prerequisiteId && c.enrolled >= c.maxStudents);
      if (!lleno) return { noEjecutado: 'ningun curso con prerequisito tiene cupo 0 en GET /api/courses en este momento' };
      await completarCadena(request, cursos, lleno.prerequisiteId!, ti);
      const r = await inscribir(request, lleno.id, ti);
      return { ok: r.status === 200 && r.body?.status === 'lista-espera', resumen: `curso ${lleno.id} (${lleno.enrolled}/${lleno.maxStudents}); HTTP ${r.status} status=${r.body?.status}` };
    });
  });

  test('CP-29 C02 prerequisito No x cupo Si', async ({ request }, ti) => {
    await caso('CP-29', async () => {
      await sesion(request, ti);
      const r = await inscribir(request, 'playwright-cero', ti);
      const lista = await request.get('/api/progress');
      const inscrito = JSON.stringify(await adjuntar(ti, 'progress-lista', lista)).includes('playwright-cero');
      return { ok: r.status === 403 && !inscrito, resumen: `HTTP ${r.status} status=${r.body?.status ?? '-'}; GET /api/progress ${inscrito ? 'lista playwright-cero (queda inscrito)' : 'no lista playwright-cero'}` };
    });
  });

  test('CP-30 C02 prerequisito No x cupo No', async ({ request }, ti) => {
    await caso('CP-30', async () => {
      await sesion(request, ti);
      const cursos = await catalogo(request);
      const lleno = cursos.find((c) => c.prerequisiteId && c.enrolled >= c.maxStudents);
      if (!lleno) return { noEjecutado: 'ningun curso con prerequisito tiene cupo 0 en GET /api/courses en este momento' };
      const r = await inscribir(request, lleno.id, ti);
      return { ok: rechazado(r.status), resumen: `curso ${lleno.id} (${lleno.enrolled}/${lleno.maxStudents}); HTTP ${r.status} status=${r.body?.status ?? '-'}` };
    });
  });

  test('CP-31 C03 en progreso no cuenta como completado', async ({ request }, ti) => {
    await caso('CP-31', async () => {
      await sesion(request, ti);
      await llevarA(request, 'fundamentos', 'en-progreso', ti);
      const r = await inscribir(request, 'playwright-cero', ti);
      return { ok: r.status === 403, resumen: `fundamentos En progreso; enroll playwright-cero HTTP ${r.status}` };
    });
  });

  test('CP-32 C04 el cupo baja en 1 al inscribirse', async ({ request }, ti) => {
    await caso('CP-32', async () => {
      await sesion(request, ti);
      const libres = async () => { const c = (await catalogo(request)).find((x) => x.id === 'programacion-qa')!; return c.maxStudents - c.enrolled; };
      const antes = await libres();
      const r = await inscribir(request, 'programacion-qa', ti);
      const despues = await libres();
      return { ok: r.status === 200 && despues === antes - 1, resumen: `enroll HTTP ${r.status}; libres antes=${antes}, despues=${despues}` };
    });
  });

  test('CP-33 A03 400 sin courseId', async ({ request }, ti) => {
    await caso('CP-33', async () => {
      await sesion(request, ti);
      const r = await inscribir(request, undefined, ti);
      return { ok: r.status === 400, resumen: `HTTP ${r.status}` };
    });
  });

  test('CP-34 A03 404 curso inexistente', async ({ request }, ti) => {
    await caso('CP-34', async () => {
      await sesion(request, ti);
      const r = await inscribir(request, 'curso-que-no-existe', ti);
      return { ok: r.status === 404, resumen: `HTTP ${r.status}` };
    });
  });

  test('CP-35 A03 200 inscrito (curso sin prerequisito)', async ({ request }, ti) => {
    await caso('CP-35', async () => {
      await sesion(request, ti);
      const r = await inscribir(request, 'fundamentos', ti);
      return { ok: r.status === 200 && r.body?.status === 'inscrito', resumen: `HTTP ${r.status} status=${r.body?.status}` };
    });
  });

  // Transicion de estados REQ-P02
  const transiciones: [string, Estado, string, boolean][] = [
    ['CP-36', 'inscrito', 'comenzar', true],
    ['CP-37', 'en-progreso', 'completar', true],
    ['CP-38', 'completado', 'certificar', true],
    ['CP-39', 'inscrito', 'abandonar', true],
    ['CP-40', 'en-progreso', 'abandonar', true],
    ['CP-41', 'inscrito', 'completar', false],
    ['CP-42', 'abandonado', 'retomar', false],
    ['CP-43', 'completado', 'abandonar', false],
    ['CP-44', 'certificado', 'abandonar', false],
    ['CP-60', 'en-progreso', 'certificar', false],
    ['CP-61', 'inscrito', 'certificar', false],
    ['CP-62', 'completado', 'comenzar', false],
    ['CP-63', 'certificado', 'comenzar', false],
    ['CP-64', 'abandonado', 'completar', false],
  ];
  for (const [id, desde, accion, valida] of transiciones) {
    test(`${id} transicion ${desde} con ${accion}`, async ({ request }, ti) => {
      await caso(id, async () => {
        await sesion(request, ti);
        await llevarA(request, 'fundamentos', desde, ti);
        const r = await progreso(request, 'fundamentos', accion, ti);
        const msg = mensajeDe(r.body);
        const ok = valida ? r.status === 200 : rechazado(r.status) && msg !== '';
        return { ok, resumen: `accion "${accion}" desde ${desde}: HTTP ${r.status}, estado resultante=${r.estado}${valida ? '' : `, mensaje de error=${msg ? '"' + msg + '"' : 'ausente'}`}` };
      });
    });
  }

  test('CP-45 P04 certificar dos veces no duplica', async ({ request }, ti) => {
    await caso('CP-45', async () => {
      await sesion(request, ti);
      await llevarA(request, 'fundamentos', 'certificado', ti);
      const segunda = await progreso(request, 'fundamentos', 'certificar', ti);
      const msg = mensajeDe(segunda.body);
      return { ok: rechazado(segunda.status) && msg !== '' && (segunda.body?.certificates ?? 1) === 1, resumen: `2.o certificar HTTP ${segunda.status}, certificates=${segunda.body?.certificates}, mensaje de error=${msg ? '"' + msg + '"' : 'ausente'}` };
    });
  });

  test('CP-46 S01 /api/auth/me devuelve al usuario tras el login', async ({ request }, ti) => {
    await caso('CP-46', async () => {
      const a = await sesion(request, ti);
      const res = await request.get('/api/auth/me');
      const body = await adjuntar(ti, 'auth-me', res);
      return { ok: res.status() === 200 && body?.realUser != null && JSON.stringify(body).includes(a.email), resumen: `HTTP ${res.status()}, realUser=${JSON.stringify(body?.realUser)}` };
    });
  });

  for (const [id, ruta] of [['CP-47', '/cursos'], ['CP-48', '/mi-progreso']]) {
    test(`${id} S01 ${ruta} sin sesion pide iniciar sesion`, async ({ page }) => {
      await caso(id, async () => {
        await page.goto(ruta);
        const aviso = page.getByText(/necesitas iniciar sesi/i).first();
        const visible = await aviso.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true, () => false);
        const texto = visible ? (await page.getByText(/necesitas iniciar sesi/i).first().innerText().catch(() => '')) : '';
        return { ok: visible, resumen: visible ? `mensaje visible: "${texto}"` : 'no aparece mensaje pidiendo iniciar sesion' };
      });
    });
  }
  // ---- Ampliacion tras el veredicto del juez (CP-65 en adelante) ----
  for (const [id, estadoPrereq] of [['CP-65', 'inscrito'], ['CP-66', 'abandonado']] as const) {
    test(`${id} C03 prerequisito en estado ${estadoPrereq} no desbloquea`, async ({ request }, ti) => {
      await caso(id, async () => {
        await sesion(request, ti);
        await llevarA(request, 'fundamentos', estadoPrereq, ti);
        const r = await inscribir(request, 'playwright-cero', ti);
        return { ok: r.status === 403, resumen: `fundamentos ${estadoPrereq}; enroll playwright-cero HTTP ${r.status} status=${r.body?.status ?? '-'}` };
      });
    });
  }

  test('CP-67 C04 la lista de espera no reduce el cupo', async ({ request }, ti) => {
    await caso('CP-67', async () => {
      await sesion(request, ti);
      const cursos = await catalogo(request);
      const lleno = cursos.find((c) => c.prerequisiteId && c.enrolled >= c.maxStudents);
      if (!lleno) return { noEjecutado: 'ningun curso con cupo 0 en GET /api/courses en este momento' };
      await completarCadena(request, cursos, lleno.prerequisiteId!, ti);
      const antes = (await catalogo(request)).find((c) => c.id === lleno.id)!;
      const r = await inscribir(request, lleno.id, ti);
      const despues = (await catalogo(request)).find((c) => c.id === lleno.id)!;
      return { ok: r.body?.status === 'lista-espera' && despues.enrolled === antes.enrolled, resumen: `curso ${lleno.id}; status=${r.body?.status}; enrolled antes=${antes.enrolled}, despues=${despues.enrolled} (max ${antes.maxStudents})` };
    });
  });

  const emailsExtra: [string, string][] = [
    ['CP-68', '@dominio.com'],
    ['CP-69', 'a@.com'],
    ['CP-70', 'a@b.'],
    ['CP-71', 'a@@b.com'],
    ['CP-72', 'lucia mamani@yopmail.com'],
  ];
  for (const [id, email] of emailsExtra) {
    test(`${id} particion de email ${email}`, async ({ request }, ti) => {
      await caso(id, async () => {
        const a = altaValida({ email });
        const r = await registrar(request, a, ti);
        return { ok: rechazado(r.status), resumen: `email="${email}"; HTTP ${r.status}${r.body?.errors ? ' ' + JSON.stringify(r.body.errors) : ''}` };
      });
    });
  }

  for (const [id, campo] of [['CP-73', 'name'], ['CP-74', 'password'], ['CP-75', 'age']] as const) {
    test(`${id} R01 falta solo ${campo}`, async ({ request }, ti) => {
      await caso(id, async () => {
        const data: Record<string, unknown> = { ...altaValida() };
        delete data[campo];
        const res = await request.post('/api/register', { data });
        const body = await adjuntar(ti, `registro-sin-${campo}`, res);
        const campos = Object.keys(body?.errors ?? {});
        return { ok: rechazado(res.status()) && campos.includes(campo), resumen: `HTTP ${res.status()}; errores: ${campos.join(',') || 'ninguno'}` };
      });
    });
  }

  // L03 por API con cuenta real: la secuencia fallo-fallo-fallo-fallo-exito-fallo no debe bloquear
  test('CP-76 L03 4 fallos + 1 login exitoso + 1 fallo no bloquea', async ({ request }, ti) => {
    test.setTimeout(90_000);
    await esperarSinBloqueo();
    await caso('CP-76', async () => {
      const a = altaValida({ name: 'Lucía Mamani Flores', email: emailNuevo('lucia.mamani') });
      expectRegistro(await registrar(request, a, ti));
      const estados: number[] = [];
      const intentar = async (password: string) => {
        const res = await request.post('/api/login', { data: { email: a.email, password } });
        await adjuntar(ti, `login-${estados.length + 1}`, res, { email: a.email, password: '<omitida>' });
        estados.push(res.status());
        return res.status();
      };
      for (const pw of ['Cusco#1x', 'Cusco#2x', 'Cusco#3x', 'Cusco#4x']) await intentar(pw);
      const exito = await intentar(a.password);
      const ultimo = await intentar('Cusco#5x');
      marcarBloqueo();
      return { ok: exito === 200 && ultimo === 401, resumen: `HTTP en orden: ${estados.join(', ')} (esperado 401,401,401,401,200,401; un 429/423 indica bloqueo)` };
    });
  });
});

function expectRegistro(r: { status: number }) {
  if (r.status !== 201) throw new Error(`precondicion: registro devolvio ${r.status}`);
}

// ---- UI: bloqueo de login medido con espera real (REQ-L03) y reservas (REQ-D) ----
test.describe('Ejecucion UI (medicion)', () => {
  test.describe.configure({ mode: 'serial' });

  test('CP-24 / CP-77 / CP-78 L03 bloqueo: boton, timer y rehabilitacion', async ({ page }) => {
    test.setTimeout(150_000);
    await esperarSinBloqueo();
    let v24: Veredicto, v77: Veredicto, v78: Veredicto;
    try {
      await page.goto('/login');
      const boton = page.getByTestId('login-submit');
      const email = `sin.cuenta.${sufijo()}@yopmail.com`;
      let intentos = 0;
      while (!(await boton.isDisabled()) && intentos < 7) {
        intentos++;
        await page.getByTestId('login-email').fill(email);
        await page.getByTestId('login-password').fill(`Cusco#${intentos}x`);
        const resp = page.waitForResponse((r) => r.url().includes('/api/login') && r.request().method() === 'POST');
        await boton.click();
        await resp;
        if (intentos >= 4) await expect(boton).toBeDisabled({ timeout: 1_500 }).catch(() => undefined);
      }
      // Observador en la pagina: muestrea boton y timer cada 100 ms hasta que el boton se habilita
      const muestras = await page.evaluate(async () => {
        const boton = document.querySelector('[data-testid="login-submit"]') as HTMLButtonElement;
        const out: { t: number; dis: boolean; timer: number | null }[] = [];
        const t0 = performance.now();
        await new Promise<void>((resolve) => {
          const id = setInterval(() => {
            const el = document.querySelector('[data-testid="login-lockout"] strong');
            const m = el?.textContent?.match(/\d+/);
            out.push({ t: Math.round(performance.now() - t0), dis: boton.disabled, timer: m ? parseInt(m[0], 10) : null });
            if (!boton.disabled || performance.now() - t0 > 60_000) { clearInterval(id); resolve(); }
          }, 100);
        });
        return out;
      });
      marcarBloqueo();
      const primera = muestras[0];
      const ultima = muestras[muestras.length - 1];
      const vistos = muestras.filter((m) => m.timer !== null).map((m) => m.timer as number);
      const distintos = new Set(vistos).size;
      const decreciente = vistos.every((v, i) => i === 0 || v <= vistos[i - 1]);
      const habilitadoConTimerPositivo = muestras.filter((m) => !m.dis && m.timer !== null && m.timer > 0).length;
      const cero = muestras.find((m) => m.timer === 0 || (m.timer === null && m.t > 0 && vistos.length > 0));
      const msEnCero = cero ? ultima.t - cero.t : null;
      v24 = { ok: primera.dis && !ultima.dis && muestras.slice(0, -1).every((m) => m.dis), resumen: `bloqueo tras ${intentos} intentos; boton deshabilitado en ${muestras.length - 1} muestras seguidas durante ${ultima.t} ms y habilitado al final` };
      v77 = { ok: vistos.length > 0 && vistos[0] <= 30 && vistos[0] >= 28 && decreciente && distintos >= 25, resumen: `timer visible: primera lectura=${vistos[0]}, lecturas distintas=${distintos}, decreciente=${decreciente}` };
      v78 = { ok: habilitadoConTimerPositivo === 0 && msEnCero !== null && msEnCero <= 1000, resumen: `muestras con boton habilitado y timer>0: ${habilitadoConTimerPositivo}; tiempo entre timer=0 (o timer retirado) y boton habilitado: ${msEnCero} ms; duracion total del bloqueo observado: ${ultima.t} ms; ultimas muestras [ms, boton deshabilitado, timer]: ${JSON.stringify(muestras.slice(-3).map((m) => [m.t, m.dis, m.timer]))}` };
    } catch (e) {
      const m = `error de ejecucion: ${String((e as Error).message).split('\n')[0]}`;
      v24 = v77 = v78 = { noEjecutado: m };
    }
    for (const [id, v] of [['CP-24', v24], ['CP-77', v77], ['CP-78', v78]] as [string, Veredicto][]) {
      console.log('noEjecutado' in v ? `${id}|NO EJECUTADO|${v.noEjecutado}` : `${id}|${v.ok ? 'PASA' : 'FALLA'}|${v.resumen}`);
    }
  });

  const reservas: [string, string, number, number, boolean][] = [
    ['CP-50', 'inicio = hoy + 30', 30, 33, true],
    ['CP-51', 'inicio = hoy + 31', 31, 34, false],
    ['CP-93', 'inicio = hoy + 32', 32, 35, false],
    ['CP-79', 'inicio = hoy', 0, 3, true],
    ['CP-80', 'inicio = ayer', -1, 2, false],
    ['CP-81', 'fin = inicio + 1', 5, 6, true],
  ];
  for (const [id, nombre, ini, fin, acepta] of reservas) {
    test(`${id} reserva ${nombre}`, async ({ page }) => {
      await caso(id, async () => {
        await page.goto('/reserva');
        await page.getByTestId('reserva-start').fill(fechaIso(ini));
        await page.getByTestId('reserva-end').fill(fechaIso(fin));
        await page.getByTestId('reserva-submit').click();
        const confirmada = page.getByText(/reserva confirmada/i).first();
        const visible = await confirmada.waitFor({ state: 'visible', timeout: 4_000 }).then(() => true, () => false);
        const lineas = (await page.locator('main').innerText()).split('\n').filter((l) => /no puede|no es v|inv[aá]lid|debe ser posterior|error/i.test(l));
        const ok = visible === acepta;
        if (!ok && id === 'CP-79' && lineas.length) await capturaResaltada(page, page.getByText(lineas[0]), 'REQ-D02: hoy debia aceptarse', 'cp79-reserva-hoy');
        return { ok, resumen: `inicio=${fechaIso(ini)}, fin=${fechaIso(fin)}; "Reserva confirmada" ${visible ? 'visible' : 'no aparece'}${lineas.length ? `; mensaje: "${lineas[0]}"` : ''}` };
      });
    });
  }
});

// ---- Ampliacion II: cuenta demo del sitio, /perfil y cadenas de prerequisitos ----
const pdfDe = (bytes: number): Buffer => Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(bytes - 9, 0x20)]);
const MB2 = 2 * 1024 * 1024;

async function subirCv(page: Page, nombre: string, mimeType: string, buffer: Buffer) {
  await page.goto('/perfil');
  await page.getByTestId('cv-input').setInputFiles({ name: nombre, mimeType, buffer });
  const enviado = await page.getByTestId('cv-submit').click({ timeout: 3_000 }).then(() => true, () => false);
  const res = page.getByTestId('cv-result');
  const visible = await res.waitFor({ state: 'visible', timeout: 4_000 }).then(() => true, () => false);
  const texto = visible ? (await res.innerText()).trim().slice(0, 80) : '';
  return { enviado, visible, texto, aceptado: /subido correctamente/i.test(texto), res };
}
const describirCv = (r: { enviado: boolean; visible: boolean; texto: string }) =>
  !r.enviado ? 'boton "Subir CV" no clicable' : r.visible ? `mensaje: "${r.texto}"` : 'sin mensaje de resultado';

test.describe('Ejecucion Ampliacion II (medicion)', () => {
  test.describe.configure({ mode: 'serial' });

  // Cadenas de prerequisitos (misma logica que la tabla C02)
  const cadenas: [string, string, string, boolean][] = [
    ['CP-82', 'liderazgo-qa', 'diseno-casos', false],
    ['CP-83', 'liderazgo-qa', 'diseno-casos', true],
    ['CP-84', 'ci-cd-qa', 'playwright-cero', false],
    ['CP-85', 'ci-cd-qa', 'playwright-cero', true],
  ];
  for (const [id, destino, prereq, completado] of cadenas) {
    test(`${id} prerequisito ${prereq} ${completado ? 'completado' : 'pendiente'} -> ${destino}`, async ({ request }, ti) => {
      await caso(id, async () => {
        await sesion(request, ti);
        const cursos = await catalogo(request);
        const d = cursos.find((c) => c.id === destino);
        if (!d || d.prerequisiteId !== prereq) throw new Error(`el catalogo no coincide: ${destino} requiere ${d?.prerequisiteId}`);
        if (completado) await completarCadena(request, cursos, prereq, ti);
        const r = await inscribir(request, destino, ti);
        const cupo = `cupo ${d.enrolled}/${d.maxStudents}`;
        if (completado) {
          if (d.enrolled >= d.maxStudents) return { noEjecutado: `${destino} sin cupo en este momento (${cupo})` };
          return { ok: r.status === 200 && r.body?.status === 'inscrito', resumen: `${prereq} completado; ${cupo}; HTTP ${r.status} status=${r.body?.status}` };
        }
        return { ok: r.status === 403, resumen: `${prereq} sin completar; ${cupo}; HTTP ${r.status} status=${r.body?.status ?? '-'}` };
      });
    });
  }

  // /perfil (REQ-U01..U03). 2 MB se interpreta como 2 097 152 bytes: la spec no define el MB
  test('CP-57 U01/U02 PDF valido pequeno se acepta', async ({ page }) => {
    await caso('CP-57', async () => {
      const r = await subirCv(page, 'CV_Lucia_Mamani_Flores.pdf', 'application/pdf', pdfDe(1_200));
      return { ok: r.aceptado, resumen: `PDF de 1 200 bytes; ${describirCv(r)}` };
    });
  });

  test('CP-58 U02 imagen y texto se rechazan', async ({ page }) => {
    await caso('CP-58', async () => {
      const png = await subirCv(page, 'foto_renzo.png', 'image/png', Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(800, 1)]));
      const txt = await subirCv(page, 'notas.txt', 'text/plain', Buffer.from('Notas de la entrevista con Renzo Cáceres'));
      if (txt.aceptado) await capturaResaltada(page, txt.res, 'REQ-U02: un .txt no debia aceptarse', 'cp58-cv-txt');
      return { ok: !png.aceptado && !txt.aceptado, resumen: `.png: ${describirCv(png)}; .txt: ${describirCv(txt)}` };
    });
  });

  test('CP-59 U03 PDF de exactamente 2 097 152 bytes se acepta', async ({ page }) => {
    await caso('CP-59', async () => {
      const r = await subirCv(page, 'CV_Renzo_Caceres.pdf', 'application/pdf', pdfDe(MB2));
      return { ok: r.aceptado, resumen: `PDF de ${MB2} bytes; ${describirCv(r)}` };
    });
  });

  test('CP-88 U02 archivo .pdf cuyo contenido no es PDF', async ({ page }) => {
    await caso('CP-88', async () => {
      const r = await subirCv(page, 'CV_falso.pdf', 'application/pdf', Buffer.from('Esto es texto plano, no un PDF'));
      if (r.aceptado) await capturaResaltada(page, r.res, 'REQ-U02: contenido no PDF aceptado', 'cp88-cv-falso');
      return { ok: !r.aceptado, resumen: `.pdf con texto plano; ${describirCv(r)}` };
    });
  });

  test('CP-89 U03 PDF de 2 097 153 bytes se rechaza', async ({ page }) => {
    await caso('CP-89', async () => {
      const r = await subirCv(page, 'CV_Marcela_Quispe.pdf', 'application/pdf', pdfDe(MB2 + 1));
      if (r.aceptado) await capturaResaltada(page, r.res, 'REQ-U03: 2 MB + 1 byte aceptado', 'cp89-cv-2mb-mas-1');
      return { ok: !r.aceptado, resumen: `PDF de ${MB2 + 1} bytes; ${describirCv(r)}` };
    });
  });

  test('CP-90 U03 PDF de 2,5 MB se rechaza', async ({ page }) => {
    await caso('CP-90', async () => {
      const bytes = Math.round(2.5 * 1024 * 1024);
      const r = await subirCv(page, 'CV_Lucia_Mamani_2_5MB.pdf', 'application/pdf', pdfDe(bytes));
      if (r.aceptado) await capturaResaltada(page, r.res, 'REQ-U03: 2,5 MB aceptado', 'cp90-cv-2-5mb');
      return { ok: !r.aceptado, resumen: `PDF de ${bytes} bytes; ${describirCv(r)}` };
    });
  });

  test('CP-91 U02 archivo vacio (0 bytes)', async ({ page }) => {
    await caso('CP-91', async () => {
      const r = await subirCv(page, 'CV_vacio.pdf', 'application/pdf', Buffer.alloc(0));
      return { ok: !r.aceptado, resumen: `PDF de 0 bytes; ${describirCv(r)}` };
    });
  });

  test('CP-92 U02 extension en mayusculas CV.PDF se acepta', async ({ page }) => {
    await caso('CP-92', async () => {
      const r = await subirCv(page, 'CV.PDF', 'application/pdf', pdfDe(2_000));
      return { ok: r.aceptado, resumen: `CV.PDF de 2 000 bytes; ${describirCv(r)}` };
    });
  });

  // Cuenta de practica del sitio (credenciales leidas de /login en tiempo de ejecucion)
  test('CP-25 L04 bienvenida con el nombre del usuario', async ({ page }) => {
    await caso('CP-25', async () => {
      await iniciarSesionDemo(page);
      const saludo = (await page.getByTestId('login-welcome').innerText()).replace(/\s+/g, ' ');
      const usuario = (await page.getByTestId('user-name').innerText()).trim();
      const nombre = usuario.split(/[\s·]+/)[0];
      return { ok: saludo.includes(nombre), resumen: `saludo: "${saludo}"; usuario en la cabecera: "${usuario}"` };
    });
  });

  test('CP-26 C01 el catalogo muestra los seis datos de cada curso', async ({ page, request }) => {
    await caso('CP-26', async () => {
      await iniciarSesionDemo(page);
      await page.getByTestId('nav-cursos').click();
      await page.getByTestId('courses-title').waitFor();
      const tarjetas = page.locator('[data-testid^="course-"]:not([data-testid^="courses-"])');
      const n = await tarjetas.count();
      const api = (await catalogo(request)).length;
      const faltan: string[] = [];
      for (let i = 0; i < n; i++) {
        const t = tarjetas.nth(i);
        const texto = await t.innerText();
        const id = (await t.getAttribute('data-testid')) ?? `#${i}`;
        const titulo = (await t.locator('h2, h3').first().innerText().catch(() => '')).trim();
        const desc = await t.locator('p').count();
        const huecos = [
          !titulo && 'titulo', desc === 0 && 'descripcion', !/principiante|intermedio|avanzado/i.test(texto) && 'nivel',
          !/duraci[oó]n/i.test(texto) && 'duracion', !/prerequisito/i.test(texto) && 'prerequisito', !/cupos/i.test(texto) && 'cupos',
        ].filter(Boolean);
        if (huecos.length) faltan.push(`${id}: falta ${huecos.join(', ')}`);
      }
      return { ok: n > 0 && n === api && faltan.length === 0, resumen: `${n} tarjetas en la UI (la API lista ${api} cursos); ${faltan.length ? faltan.join(' | ') : 'todas muestran los seis datos'}` };
    });
  });

  test('CP-86 S01 con sesion /cursos y /mi-progreso son accesibles', async ({ page }) => {
    await caso('CP-86', async () => {
      await iniciarSesionDemo(page);
      await page.getByTestId('nav-cursos').click();
      const cursos = await page.getByTestId('courses-title').waitFor({ timeout: 8_000 }).then(() => true, () => false);
      await page.getByTestId('nav-mi-progreso').click();
      const progreso = await page.getByRole('heading', { name: /mi progreso/i }).waitFor({ timeout: 8_000 }).then(() => true, () => false);
      const bloqueo = await page.getByTestId('auth-required').count();
      return { ok: cursos && progreso && bloqueo === 0, resumen: `/cursos con contenido=${cursos}; /mi-progreso con contenido=${progreso}; avisos de "inicia sesion"=${bloqueo}` };
    });
  });

  test('CP-49 S02 cerrar sesion reinicia el progreso', async ({ page }) => {
    await caso('CP-49', async () => {
      await iniciarSesionDemo(page);
      await page.getByTestId('nav-cursos').click();
      await page.getByTestId('enroll-fundamentos').click();
      await page.getByTestId('nav-mi-progreso').click();
      const antes = await page.locator('main').innerText();
      const conCurso = /Fundamentos de Testing/.test(antes);
      await page.getByTestId('logout-button').click();
      await page.getByTestId('nav-login').click(); // navegacion interna, sin recargar la pagina
      await iniciarSesionDemo(page, false);
      await page.getByTestId('nav-mi-progreso').click();
      const despues = await page.locator('main').innerText();
      const vacio = /a[uú]n no tienes cursos/i.test(despues);
      return { ok: conCurso && vacio, resumen: `antes de cerrar sesion "Fundamentos de Testing" listado=${conCurso}; tras volver a entrar sin cursos=${vacio}` };
    });
  });

  // Debe ir al final: provoca el bloqueo de la cuenta demo (compartida) durante 30 s
  test('CP-87 L03 cuenta real: 4 fallos + login exitoso + 1 fallo no bloquea', async ({ page, request }, ti) => {
    test.setTimeout(120_000);
    await esperarSinBloqueo();
    await caso('CP-87', async () => {
      const c = await leerCuentaDemo(page);
      const estados: number[] = [];
      const intentar = async (password: string) => {
        const res = await request.post('/api/login', { data: { email: c.email, password } });
        await ti.attach(`login-demo-${estados.length + 1}`, { contentType: 'application/json', body: JSON.stringify({ request: { email: '<cuenta demo>', password: '<omitida>' }, response: { status: res.status() } }) });
        estados.push(res.status());
      };
      for (const pw of ['Cusco#1x', 'Cusco#2x', 'Cusco#3x', 'Cusco#4x']) await intentar(pw);
      await intentar(c.password);
      await intentar('Cusco#5x');
      marcarBloqueo();
      return { ok: estados.join() === '401,401,401,401,200,401', resumen: `HTTP en orden: ${estados.join(', ')} (esperado 401,401,401,401,200,401; 429 = bloqueo). Cuenta compartida: el bloqueo afecta unos 30 s a quien la use` };
    });
  });
});
