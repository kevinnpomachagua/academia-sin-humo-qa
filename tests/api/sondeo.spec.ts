import { test, expect } from '@playwright/test';
import { nuevoUsuario, registrar, evidencia, usuarioConSesion, inscribir, progreso } from '../support/api';

// Bugs conocidos contra la especificacion (docs/reporte-de-bugs.md). Cada test afirma lo que EXIGE la spec y
// se declara con test.fail(true, 'BUG-XX...'): pasa mientras el producto siga incumpliendo la spec y se pone
// rojo cuando el bug se corrija (avisa de que hay que retirar la marca). Nunca se invierte la asercion.

test.describe('Sondeo de bugs contra la spec', () => {
  test('BUG-01 REQ-S01/S02 /api/auth/me debe devolver el usuario tras el login', async ({ request }, testInfo) => {
    test.fail(true, 'BUG-01: /api/auth/me devuelve realUser null tras un login exitoso (REQ-S01/S02)');
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

    test('BUG-04 REQ-R04 contrasena de 65 caracteres debe rechazarse', async ({ request }, testInfo) => {
      test.fail(true, 'BUG-04: el registro acepta una contrasena de 65 caracteres (REQ-R04 limita a 64)');
      const u = nuevoUsuario('aA1-'.padEnd(65, 'x'));
      expect(u.password).toHaveLength(65);
      const res = await registrar(request, u, testInfo);
      expect(res.status(), 'la spec limita la contrasena a 64').toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);
    });
  });

  test('BUG-05 REQ-P02/P03 un curso Abandonado no debe pasar a En progreso', async ({ request }, testInfo) => {
    test.fail(true, 'BUG-05: un curso Abandonado vuelve a En progreso (REQ-P02/P03)');
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

  test('BUG-06 REQ-P04 certificar dos veces no debe duplicar certificados', async ({ request }, testInfo) => {
    test.fail(true, 'BUG-06: certificar dos veces duplica el certificado (REQ-P04)');
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
