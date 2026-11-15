---
name: generar-test-e2e
description: Crea o amplía un test E2E de tests/e2e/ en Academia sin Humo apoyándose en los Page Objects de pages/, con locators semánticos, aserciones visibles, sin esperas fijas, datos dinámicos y bugs conocidos declarados con test.fail sin invertir aserciones.
---

# Skill: generar o ampliar un test E2E

## Entradas
- Flujo objetivo (el elegido en `docs/estrategia.md`), REQ que cubre y archivo (`tests/e2e/<nombre>.spec.ts`).
- Fuente de verdad: la spec `https://playground.calidadsinhumo.com/documentacion`, no lo que muestra la pantalla.
- Referencia de estilo: `tests/e2e/inscripcion.spec.ts`, `pages/LoginPage.ts`, `pages/CatalogoPage.ts`, `tests/support/usuario.ts`.
- Comando objetivo (por defecto `npx playwright test tests/e2e`).

## Gate humano
1. Inventario sin modificar nada: lee `playwright.config.ts`, `pages/`, `tests/e2e/`, `tests/support/` y `docs/reporte-de-bugs.md`.
2. Presenta `PLAN_PENDIENTE`: archivos a crear o tocar, REQ de cada test, resultado visible esperado según la spec, qué NO demuestra y riesgos.
3. No escribas nada hasta recibir `PLAN APROBADO`. Si falta un Page Object o un locator, usa `generar-pom` con evidencia HTML. Entrega a `verificar-test-e2e`; la aceptación es de quien usa la skill.

## Reglas de construcción
1. **Page Object primero.** Toda interacción con la página pasa por una clase de `pages/` (constructor con `Page`, locators `readonly`, acciones `async`). Sin aserciones dentro del Page Object; los `expect` viven en el test.
2. **Locators semánticos.** `getByRole`, `getByLabel`, `getByText`; `getByTestId` solo si no hay rol accesible, con un comentario que lo diga. Nada de CSS ni XPath frágiles.
3. **Aserciones visibles y con auto-espera** (`toBeVisible`, `toHaveText`, `toBeDisabled`). Prohibido `waitForTimeout`, `networkidle` y esperas por tiempo.
4. **Datos dinámicos.** Usuario nuevo por test con `generarUsuario()` y `registrarPorApi(page.request, usuario)` de `tests/support/usuario.ts`. Prohibido escribir emails, contraseñas, cookies o tokens literales.
5. **Sesión.** No sobrevive a una recarga (BUG-01): se navega dentro de la app con enlaces, sin `page.goto` a rutas protegidas.
6. **Bug conocido.** Si el producto contradice la spec, primera línea del test: `test.fail(true, 'BUG-XX: ...')` citando un bug de `docs/reporte-de-bugs.md`, y la aserción sigue exigiendo lo que dice la spec. Nunca inviertas la aserción, ni uses `skip`, `fixme` o reintentos.
7. **Estructura.** Un `test.describe` por flujo, título con el REQ, comentarios Arrange / Act / Assert, aserciones con mensaje en las precondiciones.
8. Si falta una pieza de la fuente o dos fuentes se contradicen, detente y escala; no la deduzcas.

## Clasificación de fallos (antes de tocar nada)
`DEFECTO_DEL_TEST` se corrige en el test; `DISCREPANCIA_CONTRATO_PRODUCTO` va al reporte de bugs y se declara con `test.fail`; `AMBIGÜEDAD_DEL_CONTRATO` y `ENTRADA_FALTANTE` se escalan; `BLOQUEO_DE_ENTORNO` no cambia código. Máximo 3 intentos de corrección tras `PLAN APROBADO`.

## Salida
- Archivos creados o modificados, comando para ejecutarlos y la corrida tres veces seguidas (`--repeat-each=3`).
- REQ cubierto por cada test y qué NO demuestra el conjunto.
- Entrega a `verificar-test-e2e`; no declares éxito.
