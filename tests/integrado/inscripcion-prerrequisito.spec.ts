import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { CatalogoPage } from '../../pages/CatalogoPage';
import { generarUsuario, registrarPorApi } from '../support/usuario';

// FLUJO INTEGRADO · Opcion A (REQ-C06): la API prepara -> la UI verifica lo visible -> la API limpia.
//
// Dato dinamico compartido: el usuario nuevo (email unico generado en el test) y su sesion. Nace en la capa
// API (registro) y la consume la UI (login); la inscripcion posterior viaja por la MISMA sesion del navegador
// (page.request comparte cookies con la pagina), por lo que API y UI hablan del mismo estudiante.
//
// Que demuestra la API: si POST /api/enroll aplica la regla de prerrequisito que la spec exige (403, REQ-C06/A03).
// Que demuestra la UI: que el catalogo presenta el curso como bloqueado y sin opcion de inscribirse (REQ-C03).
// Que NO demuestra el conjunto: que la inscripcion por API se refleje (o no) en "Mi progreso" ni en el cupo; no
// cubre otros prerrequisitos de la cadena, otros navegadores, concurrencia ni la sesion tras recargar (BUG-01).
//
// Hallazgo: la API responde 200 "inscrito" (BUG-02). La asercion NO se invierte: el test se declara con
// test.fail y el 403 exigido por la spec se mantiene como asercion blanda para que la UI se verifique igual.

const CURSO_BLOQUEADO = 'playwright-cero'; // prerrequisito: "fundamentos", que el usuario no ha completado

test.describe('Integrado · inscripcion con prerrequisito pendiente (REQ-C06)', () => {
  let inscrito = false;

  test.afterEach(async ({ page }) => {
    // API limpia: si el curso quedo inscrito, el estudiante lo abandona (transicion valida) y se cierra la sesion.
    if (inscrito) {
      const limpieza = await page.request.post('/api/progress', { data: { courseId: CURSO_BLOQUEADO, action: 'abandonar' } });
      expect(limpieza.status(), 'limpieza: abandonar el curso inscrito por API').toBe(200);
    }
    await page.request.post('/api/logout');
  });

  test('la API rechaza (403) inscribir a un curso con prerrequisito pendiente y el catalogo lo mantiene bloqueado', async ({ page }) => {
    test.fail(true, 'BUG-02: la API inscribe (200) aunque el prerrequisito este pendiente; la spec exige 403 (REQ-C06/A03)');
    // Arrange: usuario dinamico creado por API y sesion iniciada por UI
    const usuario = generarUsuario();
    await registrarPorApi(page.request, usuario);
    const login = new LoginPage(page);
    await login.goto();
    await login.iniciarSesion(usuario.email, usuario.password);
    await expect(login.saludo).toBeVisible();
    const catalogo = new CatalogoPage(page);
    await catalogo.abrirDesdeBienvenida();
    await expect(catalogo.avisoBloqueo(CURSO_BLOQUEADO), 'precondicion: la UI muestra el curso bloqueado').toBeVisible();

    // Act (API): intentar inscribirse al curso bloqueado saltandose la UI
    const res = await page.request.post('/api/enroll', { data: { courseId: CURSO_BLOQUEADO } });
    inscrito = res.status() === 200;

    // Assert (API): la spec exige 403; blanda para no ocultar la verificacion de UI
    expect.soft(res.status(), 'REQ-C06/A03: la API debe rechazar con 403').toBe(403);

    // Assert (UI): el catalogo sigue ofreciendo el curso como bloqueado, sin boton de inscripcion
    await expect(catalogo.avisoBloqueo(CURSO_BLOQUEADO)).toBeVisible();
    await expect(catalogo.badgeEstado(CURSO_BLOQUEADO)).toHaveCount(0);
  });
});
