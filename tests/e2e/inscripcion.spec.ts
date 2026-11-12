import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { CatalogoPage } from '../../pages/CatalogoPage';
import { generarUsuario, registrarPorApi } from '../support/usuario';

// Flujo critico (docs/estrategia.md): inscripcion a "Fundamentos de Testing" desde el catalogo.
// Precondicion por API (usuario nuevo), accion por UI. La sesion no sobrevive a una recarga (BUG-01):
// se navega siempre dentro de la app con "Ver cursos", sin page.goto a rutas protegidas.

const CURSO = 'fundamentos';

test.describe('Inscripción a Fundamentos de Testing (UI)', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange (comun): usuario nuevo por API, login por UI y llegada al catalogo
    const usuario = generarUsuario();
    await registrarPorApi(page.request, usuario);
    const login = new LoginPage(page);
    await login.goto();
    await login.iniciarSesion(usuario.email, usuario.password);
    await expect(login.saludo).toBeVisible();
    await new CatalogoPage(page).abrirDesdeBienvenida();
  });

  test('REQ-C05: al inscribirse, el curso queda con estado "Inscrito" y el botón se deshabilita', async ({ page }) => {
    // Arrange
    const catalogo = new CatalogoPage(page);
    await expect(catalogo.titulo).toBeVisible();
    await expect(catalogo.botonInscribirse(CURSO)).toHaveText('Inscribirse');

    // Act
    await catalogo.inscribirse(CURSO);

    // Assert
    await expect(catalogo.badgeEstado(CURSO)).toHaveText('Inscrito');
    await expect(catalogo.mensajeInscripcion(CURSO)).toContainText('Inscripción exitosa');
    await expect(catalogo.botonInscribirse(CURSO)).toBeDisabled();
  });

  test('REQ-C04: al inscribirse, el cupo disponible baja en 1', async ({ page }) => {
    test.fail(true, 'BUG-03: tras inscribirse con éxito el cupo del catálogo no baja (REQ-C04 exige descontar 1)');
    // Arrange
    const catalogo = new CatalogoPage(page);
    const cuposAntes = await catalogo.leerCupos(CURSO);
    expect(cuposAntes, 'precondicion: el curso debe tener cupos').toBeGreaterThan(0);

    // Act
    await catalogo.inscribirse(CURSO);
    await expect(catalogo.badgeEstado(CURSO)).toHaveText('Inscrito');

    // Assert (lo que exige la spec)
    await expect(catalogo.cupos(CURSO)).toHaveText(new RegExp(String.raw`^${cuposAntes - 1}\b`));
  });
});
