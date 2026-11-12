import { test, APIRequestContext, APIResponse } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

// Genera la evidencia de los bugs de API: guarda request y response reales en docs/evidencia/api/*.json.
// No afirma nada (mide); se lanza a demanda: npx playwright test tests/evidencia/evidencia-api.spec.ts
// Contraseñas enmascaradas y sin cabeceras (cookies) en todo lo que se guarda.

const OUT = 'docs/evidencia/api';
let n = 0;
const sufijo = () => `${Date.now()}${++n}`;
const pwd = () => `Lima#${sufijo()}qa`;

interface Paso {
  paso: string;
  request: { method: string; url: string; body?: unknown };
  response: { status: number; body: unknown };
}

interface Curso { id: string; maxStudents: number; enrolled: number }

function enmascarar(body: unknown): unknown {
  if (body && typeof body === 'object') {
    const c = { ...(body as Record<string, unknown>) };
    if ('password' in c) c.password = `<omitida, ${String(c.password).length} caracteres>`;
    return c;
  }
  return body;
}

async function llamar(
  pasos: Paso[], req: APIRequestContext, paso: string, method: 'GET' | 'POST', url: string, body?: unknown,
): Promise<unknown> {
  const res: APIResponse = method === 'GET' ? await req.get(url) : await req.post(url, { data: body });
  const texto = await res.text();
  let cuerpo: unknown = texto;
  try { cuerpo = JSON.parse(texto); } catch { /* texto plano */ }
  pasos.push({ paso, request: { method, url, body: enmascarar(body) }, response: { status: res.status(), body: cuerpo } });
  return cuerpo;
}

function guardar(nombre: string, bug: string, req: string, pasos: Paso[]) {
  mkdirSync(OUT, { recursive: true });
  const doc = { bug, req, producto: 'https://playground.calidadsinhumo.com', pasos };
  writeFileSync(`${OUT}/${nombre}.json`, JSON.stringify(doc, null, 2) + '\n', 'utf-8');
}

async function conSesion(req: APIRequestContext, pasos: Paso[]) {
  const u = { name: 'Lucía Mamani Flores', email: `lucia.mamani.${sufijo()}@yopmail.com`, password: pwd(), age: 31 };
  await llamar(pasos, req, 'registrar usuario', 'POST', '/api/register', u);
  await llamar(pasos, req, 'iniciar sesión', 'POST', '/api/login', { email: u.email, password: u.password });
}

// El catálogo completo es largo: se conserva solo el curso afectado
function soloCurso(cuerpo: unknown, id: string) {
  const c = (cuerpo as { courses?: Curso[] })?.courses?.find((x) => x.id === id);
  return c ? { curso: { ...c, libres: c.maxStudents - c.enrolled } } : cuerpo;
}

test('BUG-01 /api/auth/me tras el login', async ({ request }) => {
  const p: Paso[] = [];
  await conSesion(request, p);
  await llamar(p, request, 'consultar la sesión (esperado: el usuario autenticado)', 'GET', '/api/auth/me');
  guardar('bug-01-auth-me', 'BUG-01', 'REQ-S01/S02', p);
});

test('BUG-02 enroll ignora el prerrequisito', async ({ request }) => {
  const p: Paso[] = [];
  await conSesion(request, p);
  await llamar(p, request, 'inscribir sin haber completado "fundamentos" (esperado: 403)', 'POST', '/api/enroll', { courseId: 'playwright-cero' });
  guardar('bug-02-enroll-prerrequisito', 'BUG-02', 'REQ-C06/A03', p);
});

test('BUG-03 el cupo no baja', async ({ request }) => {
  const p: Paso[] = [];
  await conSesion(request, p);
  const antes = await llamar(p, request, 'catálogo ANTES de inscribirse', 'GET', '/api/courses');
  p[p.length - 1].response.body = soloCurso(antes, 'programacion-qa');
  await llamar(p, request, 'inscribir en "programacion-qa" (esperado: 200 inscrito)', 'POST', '/api/enroll', { courseId: 'programacion-qa' });
  const despues = await llamar(p, request, 'catálogo DESPUÉS de inscribirse (esperado: un cupo menos)', 'GET', '/api/courses');
  p[p.length - 1].response.body = soloCurso(despues, 'programacion-qa');
  guardar('bug-03-cupo', 'BUG-03', 'REQ-C04', p);
});

test('BUG-04 contraseña de 65 caracteres', async ({ request }) => {
  const p: Paso[] = [];
  const largo = 'Lima#2026qa'.padEnd(65, 'x');
  await llamar(p, request, 'registrar con contraseña de 65 caracteres (esperado: rechazo 4xx)', 'POST', '/api/register',
    { name: 'Lucía Mamani Flores', email: `lucia.mamani.${sufijo()}@yopmail.com`, password: largo, age: 31 });
  guardar('bug-04-password-65', 'BUG-04', 'REQ-R04', p);
});

test('BUG-05 Abandonado vuelve a En progreso', async ({ request }) => {
  const p: Paso[] = [];
  await conSesion(request, p);
  await llamar(p, request, 'inscribir "fundamentos"', 'POST', '/api/enroll', { courseId: 'fundamentos' });
  await llamar(p, request, 'abandonar', 'POST', '/api/progress', { courseId: 'fundamentos', action: 'abandonar' });
  await llamar(p, request, 'retomar un curso abandonado (esperado: rechazo 4xx)', 'POST', '/api/progress', { courseId: 'fundamentos', action: 'retomar' });
  guardar('bug-05-abandonado-retomar', 'BUG-05', 'REQ-P02/P03', p);
});

test('BUG-06 certificado duplicado', async ({ request }) => {
  const p: Paso[] = [];
  await conSesion(request, p);
  await llamar(p, request, 'inscribir "fundamentos"', 'POST', '/api/enroll', { courseId: 'fundamentos' });
  for (const a of ['comenzar', 'completar', 'certificar']) {
    await llamar(p, request, a, 'POST', '/api/progress', { courseId: 'fundamentos', action: a });
  }
  await llamar(p, request, 'certificar por segunda vez (esperado: el total sigue en 1)', 'POST', '/api/progress', { courseId: 'fundamentos', action: 'certificar' });
  guardar('bug-06-certificado-duplicado', 'BUG-06', 'REQ-P04', p);
});

test('BUG-11 email sin dominio o sin punto', async ({ request }) => {
  const p: Paso[] = [];
  const base = { name: 'Lucía Mamani Flores', password: pwd(), age: 31 };
  await llamar(p, request, 'registrar con email "usuario@" (esperado: rechazo)', 'POST', '/api/register', { ...base, email: 'usuario@' });
  await llamar(p, request, 'registrar con email sin punto en el dominio (esperado: rechazo)', 'POST', '/api/register', { ...base, email: `lucia.mamani.${sufijo()}@yopmail` });
  await llamar(p, request, 'control: el email "usuario" sí se rechaza', 'POST', '/api/register', { ...base, email: 'usuario' });
  guardar('bug-11-email-invalido', 'BUG-11', 'REQ-R03', p);
});

test('BUG-13 Completado y Certificado vuelven a En progreso', async ({ request }) => {
  const p: Paso[] = [];
  await conSesion(request, p);
  await llamar(p, request, 'inscribir "fundamentos"', 'POST', '/api/enroll', { courseId: 'fundamentos' });
  for (const a of ['comenzar', 'completar']) {
    await llamar(p, request, a, 'POST', '/api/progress', { courseId: 'fundamentos', action: a });
  }
  await llamar(p, request, 'comenzar desde Completado (esperado: rechazo 4xx)', 'POST', '/api/progress', { courseId: 'fundamentos', action: 'comenzar' });
  // Segundo flujo con otro usuario: el primero ya dejó su curso en En progreso
  await conSesion(request, p);
  await llamar(p, request, 'inscribir "fundamentos" (segundo usuario)', 'POST', '/api/enroll', { courseId: 'fundamentos' });
  for (const a of ['comenzar', 'completar', 'certificar']) {
    await llamar(p, request, `${a} (segundo usuario)`, 'POST', '/api/progress', { courseId: 'fundamentos', action: a });
  }
  await llamar(p, request, 'comenzar desde Certificado (esperado: rechazo 4xx)', 'POST', '/api/progress', { courseId: 'fundamentos', action: 'comenzar' });
  guardar('bug-13-transiciones-invalidas', 'BUG-13', 'REQ-P02/P03', p);
});
