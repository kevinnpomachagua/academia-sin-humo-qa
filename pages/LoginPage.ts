import { Locator, Page } from '@playwright/test';

// Page Object de /login. Sin aserciones: los expect viven en el test.
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly iniciarSesionButton: Locator;
  readonly saludo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = this.page.getByLabel('Email');
    this.passwordInput = this.page.getByLabel('Contraseña');
    this.iniciarSesionButton = this.page.getByRole('button', { name: 'Iniciar sesión' });
    this.saludo = this.page.getByRole('heading', { name: /^¡Hola,/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async iniciarSesion(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.iniciarSesionButton.click();
  }
}
