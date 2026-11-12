import { Locator, Page } from '@playwright/test';

// Page Object del catalogo de cursos (/cursos). Sin aserciones: los expect viven en el test.
// El catalogo es una ruta protegida y la sesion no sobrevive a una recarga (BUG-01),
// por eso se llega con abrirDesdeBienvenida() y no con goto().
export class CatalogoPage {
  readonly page: Page;
  readonly verCursosLink: Locator;
  readonly titulo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.verCursosLink = this.page.getByRole('main').getByRole('link', { name: 'Ver cursos' });
    this.titulo = this.page.getByRole('heading', { level: 1, name: 'Catálogo de cursos' });
  }

  // Desde la pantalla de bienvenida tras el login. (El enlace del encabezado, aria-label
  // "Catálogo de la Academia", lleva a /catalogo, otra pagina: no es el catalogo de inscripcion.)
  async abrirDesdeBienvenida(): Promise<void> {
    await this.verCursosLink.click();
  }

  // Tarjeta de un curso (el contenedor solo se expone por data-testid)
  tarjeta(courseId: string): Locator {
    return this.page.getByTestId(`course-${courseId}`);
  }

  botonInscribirse(courseId: string): Locator {
    return this.tarjeta(courseId).getByRole('button', { name: /Inscribirse|Ya inscrito/ });
  }

  // Badge de estado de inscripcion ("Inscrito"); sin rol accesible, por eso data-testid
  badgeEstado(courseId: string): Locator {
    return this.page.getByTestId(`enrollment-status-${courseId}`);
  }

  mensajeInscripcion(courseId: string): Locator {
    return this.page.getByTestId(`enroll-result-${courseId}`);
  }

  cupos(courseId: string): Locator {
    return this.page.getByTestId(`spots-${courseId}`);
  }

  async leerCupos(courseId: string): Promise<number> {
    const texto = (await this.cupos(courseId).innerText()).trim();
    const numero = texto.match(/\d+/)?.[0];
    return numero === undefined ? 0 : Number(numero); // "Sin cupos" => 0
  }

  async inscribirse(courseId: string): Promise<void> {
    await this.botonInscribirse(courseId).click();
  }
}
