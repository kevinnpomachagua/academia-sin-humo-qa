import { test, expect } from '@playwright/test';
import { usuarioConSesion, inscribir, evidencia, cupo } from '../support/api';

// Contrato de POST /api/enroll (REQ-A01 a A03, REQ-C04, REQ-C06). Los status esperados salen de la
// spec (/documentacion), no de lo que devolvio la API. Si el producto la contradice, el test se declara
// con test.fail(true, 'BUG-XX...') y NO se cambia la asercion (discrepancia contrato-producto).

const CURSO_SIN_PRERREQUISITO = 'fundamentos';
const CURSO_CON_PRERREQUISITO = 'playwright-cero'; // requiere "fundamentos" completado

test.describe('POST /api/enroll · contrato', () => {
  test.beforeEach(async ({ request }, testInfo) => {
    // Arrange (comun): usuario nuevo con sesion, sin cursos completados
    await usuarioConSesion(request, testInfo);
  });

  test('REQ-A03 camino feliz: inscribirse a un curso sin prerrequisito responde 200 "inscrito"', async ({ request }, testInfo) => {
    // Act
    const res = await inscribir(request, CURSO_SIN_PRERREQUISITO, testInfo);
    const body = await res.json();

    // Assert
    expect(res.status()).toBe(200);
    expect(body.status).toBe('inscrito');
    expect(typeof body.message).toBe('string');
  });

  test('REQ-A03 contrato: un body sin courseId responde 400', async ({ request }, testInfo) => {
    // Act
    const res = await request.post('/api/enroll', { data: {} });
    await evidencia(testInfo, 'enroll-sin-courseId', res, {});

    // Assert
    expect(res.status()).toBe(400);
  });

  test('REQ-A03 contrato: un courseId que no existe responde 404', async ({ request }, testInfo) => {
    // Act
    const res = await inscribir(request, `curso-inexistente-${Date.now()}`, testInfo);

    // Assert
    expect(res.status()).toBe(404);
  });

  test('robustez: un body malformado se rechaza con 4xx y no provoca un error de servidor', async ({ request }, testInfo) => {
    // Act: texto que no es JSON valido
    const res = await request.post('/api/enroll', {
      data: '{"courseId": ',
      headers: { 'Content-Type': 'application/json' },
    });
    await testInfo.attach('enroll-body-malformado', {
      contentType: 'application/json',
      body: JSON.stringify({ request: { body: '{"courseId": ' }, response: { status: res.status(), body: await res.text() } }, null, 2),
    });

    // Assert: la spec no define este caso; un 5xx seria un defecto de robustez, un 4xx es lo razonable
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test('REQ-C06/A03 un curso con prerrequisito pendiente se rechaza con 403', async ({ request }, testInfo) => {
    test.fail(true, 'BUG-02: la API inscribe (200) aunque el prerrequisito este pendiente; la spec exige 403 (REQ-C06/A03)');
    // Act
    const res = await inscribir(request, CURSO_CON_PRERREQUISITO, testInfo);

    // Assert
    expect(res.status()).toBe(403);
  });

  test('REQ-C04 el cupo del catalogo baja en 1 tras inscribirse (GET /api/courses antes y despues)', async ({ request }, testInfo) => {
    test.fail(true, 'BUG-03: tras una inscripcion exitosa el cupo del catalogo no baja (REQ-C04 exige descontar 1)');
    // Arrange
    const antes = await cupo(request, CURSO_SIN_PRERREQUISITO);
    expect(antes.libres, 'precondicion: el curso tiene cupos').toBeGreaterThan(0);

    // Act
    const res = await inscribir(request, CURSO_SIN_PRERREQUISITO, testInfo);
    expect(res.status(), 'precondicion: inscripcion exitosa').toBe(200);
    const despues = await cupo(request, CURSO_SIN_PRERREQUISITO);
    await testInfo.attach('catalogo-antes-despues', {
      contentType: 'application/json',
      body: JSON.stringify({ antes: antes.curso, despues: despues.curso }, null, 2),
    });

    // Assert (lo que exige la spec)
    expect(despues.libres).toBe(antes.libres - 1);
  });
});
