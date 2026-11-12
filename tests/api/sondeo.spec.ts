import { test, expect, APIRequestContext, APIResponse, TestInfo } from '@playwright/test';

// Sondas que reproducen presuntos bugs contra la especificacion. Cada test afirma lo que
// EXIGE la spec: si el bug existe, el test FALLA (eso es lo esperado al reproducirlo).
// Datos en memoria; usuario unico por ejecucion.

let contador = 0;
const sufijo = () => `${Date.now()}${++contador}`;

// Contrasena de prueba generada en el test (valida: 8-64 caracteres)
const passwordValida = () => `Pw-${sufijo()}-aA1`;

interface Credenciales { name: string; email: string; password: string; age: number }

function nuevoUsuario(password = passwordValida()): Credenciales {
  return { name: 'Sondeo QA', email: `sondeo.${sufijo()}@example.com`, password, age: 30 };
}

async function leer(res: APIResponse): Promise<unknown> {
  const texto = await res.text();
  try { return JSON.parse(texto); } catch { return texto; }
}

// Adjunta request/response completos como evidencia
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function evidencia(testInfo: TestInfo, nombre: string, res: APIResponse, cuerpoEnviado?: unknown): Promise<any> {
  const cuerpo = await leer(res);
  await testInfo.attach(nombre, {
    contentType: 'application/json',
    body: JSON.stringify({
      request: { url: res.url(), body: cuerpoEnviado },
      response: { status: res.status(), headers: res.headers(), body: cuerpo },
    }, null, 2),
  });
  return cuerpo;
}

async function registrar(request: APIRequestContext, u: Credenciales, testInfo: TestInfo) {
  const res = await request.post('/api/register', { data: u });
  await evidencia(testInfo, `registro-${u.email}`, res, { ...u, password: '<omitida>' });
  return res;
}

async function login(request: APIRequestContext, u: Credenciales, testInfo: TestInfo) {
  const res = await request.post('/api/login', { data: { email: u.email, password: u.password } });
  await evidencia(testInfo, 'login', res, { email: u.email, password: '<omitida>' });
  return res;
}

// Precondicion: usuario registrado y con sesion iniciada en este contexto
async function usuarioConSesion(request: APIRequestContext, testInfo: TestInfo) {
  const u = nuevoUsuario();
  expect((await registrar(request, u, testInfo)).status(), 'precondicion: registro').toBe(201);
  expect((await login(request, u, testInfo)).status(), 'precondicion: login').toBe(200);
  return u;
}

async function inscribir(request: APIRequestContext, courseId: string, testInfo: TestInfo) {
  const data = { courseId };
  const res = await request.post('/api/enroll', { data });
  await evidencia(testInfo, `enroll-${courseId}`, res, data);
  return res;
}

async function progreso(request: APIRequestContext, courseId: string, action: string, testInfo: TestInfo) {
  const data = { courseId, action };
  const res = await request.post('/api/progress', { data });
  const body = await evidencia(testInfo, `progress-${action}`, res, data);
  return { res, body };
}

async function cupo(request: APIRequestContext, courseId: string) {
  const res = await request.get('/api/courses');
  const body = (await res.json()) as { courses: { id: string; maxStudents: number; enrolled: number }[] };
  const curso = body.courses.find((x) => x.id === courseId);
  if (!curso) throw new Error(`Curso "${courseId}" no esta en el catalogo`);
  return { libres: curso.maxStudents - curso.enrolled, curso };
}

test.describe('Sondeo de bugs contra la spec', () => {
  test('BUG? REQ-S01/S02 /api/auth/me debe devolver el usuario tras el login', async ({ request }, testInfo) => {
    // Arrange
    const u = await usuarioConSesion(request, testInfo);
    // Act
    const me = await request.get('/api/auth/me');
    const body = await evidencia(testInfo, 'auth-me', me);
    // Assert
    expect(me.status()).toBe(200);
    expect(body.realUser, 'realUser no debe ser null con una sesion valida').not.toBeNull();
    expect(JSON.stringify(body)).toContain(u.email);
  });

  test('BUG? REQ-C06/A03 enroll con prerrequisito pendiente debe responder 403', async ({ request }, testInfo) => {
    // Arrange: usuario nuevo, sin "fundamentos" completado
    await usuarioConSesion(request, testInfo);
    // Act: playwright-cero tiene como prerrequisito a fundamentos
    const res = await inscribir(request, 'playwright-cero', testInfo);
    // Assert
    expect(res.status()).toBe(403);
  });

  test('BUG? REQ-C04 el cupo debe bajar en 1 tras inscribirse', async ({ request }, testInfo) => {
    // Arrange
    await usuarioConSesion(request, testInfo);
    const antes = await cupo(request, 'programacion-qa'); // sin prerrequisito
    // Act
    const res = await inscribir(request, 'programacion-qa', testInfo);
    expect(res.status(), 'precondicion: inscripcion exitosa').toBe(200);
    const despues = await cupo(request, 'programacion-qa');
    await testInfo.attach('catalogo-antes-despues', {
      contentType: 'application/json',
      body: JSON.stringify({ antes: antes.curso, despues: despues.curso }, null, 2),
    });
    // Assert
    expect(despues.libres).toBe(antes.libres - 1);
  });

  test.describe('REQ-R04 longitud de contrasena (8-64)', () => {
    test('control: 64 caracteres se acepta', async ({ request }, testInfo) => {
      const u = nuevoUsuario('aA1-'.padEnd(64, 'x'));
      expect(u.password).toHaveLength(64);
      const res = await registrar(request, u, testInfo);
      expect(res.status()).toBe(201);
    });

    test('control: 7 caracteres se rechaza', async ({ request }, testInfo) => {
      const u = nuevoUsuario('aA1-xyz');
      expect(u.password).toHaveLength(7);
      const res = await registrar(request, u, testInfo);
      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);
    });

    test('BUG? REQ-R04 contrasena de 65 caracteres debe rechazarse', async ({ request }, testInfo) => {
      const u = nuevoUsuario('aA1-'.padEnd(65, 'x'));
      expect(u.password).toHaveLength(65);
      const res = await registrar(request, u, testInfo);
      expect(res.status(), 'la spec limita la contrasena a 64').toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);
    });
  });

  test('BUG? REQ-P02/P03 un curso Abandonado no debe pasar a En progreso', async ({ request }, testInfo) => {
    // Arrange
    await usuarioConSesion(request, testInfo);
    expect((await inscribir(request, 'fundamentos', testInfo)).status(), 'precondicion: inscripcion').toBe(200);
    const abandono = await progreso(request, 'fundamentos', 'abandonar', testInfo);
    expect(abandono.res.status(), 'precondicion: abandonar').toBe(200);
    // Act
    const retomar = await progreso(request, 'fundamentos', 'retomar', testInfo);
    // Assert: transicion prohibida
    expect(retomar.res.status()).toBeGreaterThanOrEqual(400);
    expect(retomar.body?.currentStatus).not.toBe('en-progreso');
  });

  test('BUG? REQ-P04 certificar dos veces no debe duplicar certificados', async ({ request }, testInfo) => {
    // Arrange: inscrito -> en progreso -> completado -> certificado
    // NOTA: las acciones "comenzar" y "completar" se deducen de los botones de la UI (docs de
    // los repos de referencia); "certificar", "abandonar" y "retomar" estan confirmadas en payloads.
    await usuarioConSesion(request, testInfo);
    expect((await inscribir(request, 'fundamentos', testInfo)).status(), 'precondicion: inscripcion').toBe(200);
    for (const accion of ['comenzar', 'completar']) {
      const paso = await progreso(request, 'fundamentos', accion, testInfo);
      expect(paso.res.status(), `precondicion: accion "${accion}" (revisar el nombre si falla)`).toBe(200);
    }
    const primera = await progreso(request, 'fundamentos', 'certificar', testInfo);
    expect(primera.res.status(), 'precondicion: primera certificacion').toBe(200);
    expect(primera.body?.certificates).toBe(1);
    // Act
    const segunda = await progreso(request, 'fundamentos', 'certificar', testInfo);
    // Assert
    expect(segunda.body?.certificates, 'no debe haber certificados duplicados').toBe(1);
  });
});
