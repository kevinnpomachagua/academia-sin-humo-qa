import { expect, APIRequestContext, APIResponse, TestInfo } from '@playwright/test';

// Utilidades compartidas por los tests de API (contrato y bugs conocidos). Sin datos fijos: cada llamada
// genera un usuario nuevo, y cada intercambio se adjunta como evidencia al reporte de Playwright.

let contador = 0;
export const sufijo = () => `${Date.now()}${++contador}`;

// Contrasena de prueba generada en el test (valida: 8-64 caracteres)
export const passwordValida = () => `Pw-${sufijo()}-aA1`;

export interface Credenciales { name: string; email: string; password: string; age: number }

export function nuevoUsuario(password = passwordValida()): Credenciales {
  return { name: 'Sondeo QA', email: `sondeo.${sufijo()}@example.com`, password, age: 30 };
}

export async function leer(res: APIResponse): Promise<unknown> {
  const texto = await res.text();
  try { return JSON.parse(texto); } catch { return texto; }
}

// Adjunta request/response completos como evidencia
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function evidencia(testInfo: TestInfo, nombre: string, res: APIResponse, cuerpoEnviado?: unknown): Promise<any> {
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

export async function registrar(request: APIRequestContext, u: Credenciales, testInfo: TestInfo) {
  const res = await request.post('/api/register', { data: u });
  await evidencia(testInfo, `registro-${u.email}`, res, { ...u, password: '<omitida>' });
  return res;
}

export async function login(request: APIRequestContext, u: Credenciales, testInfo: TestInfo) {
  const res = await request.post('/api/login', { data: { email: u.email, password: u.password } });
  await evidencia(testInfo, 'login', res, { email: u.email, password: '<omitida>' });
  return res;
}

// Precondicion: usuario registrado y con sesion iniciada en este contexto
export async function usuarioConSesion(request: APIRequestContext, testInfo: TestInfo) {
  const u = nuevoUsuario();
  expect((await registrar(request, u, testInfo)).status(), 'precondicion: registro').toBe(201);
  expect((await login(request, u, testInfo)).status(), 'precondicion: login').toBe(200);
  return u;
}

export async function inscribir(request: APIRequestContext, courseId: string, testInfo: TestInfo) {
  const data = { courseId };
  const res = await request.post('/api/enroll', { data });
  await evidencia(testInfo, `enroll-${courseId}`, res, data);
  return res;
}

export async function progreso(request: APIRequestContext, courseId: string, action: string, testInfo: TestInfo) {
  const data = { courseId, action };
  const res = await request.post('/api/progress', { data });
  const body = await evidencia(testInfo, `progress-${action}`, res, data);
  return { res, body };
}

export async function cupo(request: APIRequestContext, courseId: string) {
  const res = await request.get('/api/courses');
  const body = (await res.json()) as { courses: { id: string; maxStudents: number; enrolled: number }[] };
  const curso = body.courses.find((x) => x.id === courseId);
  if (!curso) throw new Error(`Curso "${courseId}" no esta en el catalogo`);
  return { libres: curso.maxStudents - curso.enrolled, curso };
}
