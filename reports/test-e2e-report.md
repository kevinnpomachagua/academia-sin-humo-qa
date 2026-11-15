# Reporte de verificación del test E2E

## Resultado

> **VERIFICACIÓN CON HALLAZGOS** (16/18 estática, comando local con exit code 0)

| Intento | Archivos revisados | Comando | Modo |
|---|---|---|---|
| 1 | `tests/e2e/inscripcion.spec.ts`, `pages/LoginPage.ts`, `pages/CatalogoPage.ts`, `tests/support/usuario.ts` | `npx playwright test tests/e2e/inscripcion.spec.ts --repeat-each=3` | Solo lectura (sin modificar código) |

> **Nota:** estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original. El test E2E ya existía; esta revisión lo contrasta con la skill `verificar-test-e2e` y es una autoevaluación asistida, no una auditoría externa.

## Rúbrica (skill `verificar-test-e2e`)

### 1. Locators — 2/3
- Roles y etiquetas donde existen: `getByRole` en `pages/CatalogoPage.ts:13`, `:14` y `:29`; `getByLabel` y `getByRole` en `pages/LoginPage.ts:13-16`. Sin CSS ni XPath en `pages/`.
- `getByTestId` en `pages/CatalogoPage.ts:25`, `:34`, `:38` y `:47`. El comentario de `:33` explica el de `:34` y el de `:23` el de `:25`, pero `:38` (`enroll-result-`) y `:47` (`spots-`) no dicen por qué no hay rol accesible.
- Observación: `getByLabel('Email')` (`LoginPage.ts:13`) coincide por subcadena; hoy no hay ambigüedad en `/login`, pero no está fijada con `exact: true`.

### 2. Aserciones — 2/3
- Visibles y con auto-espera (`toBeVisible`, `toHaveText`, `toBeDisabled`, `toContainText`) en `inscripcion.spec.ts:20`, `:27-28`, `:34-36`, `:48` y `:51`; los `expect` viven en el test y `pages/` no tiene ninguno.
- Cada test cita su REQ en el título (`:24` REQ-C05, `:39` REQ-C04) y afirma lo que pide ese REQ.
- Observación: el texto `'Inscripción exitosa'` (`:35`) sale de la respuesta real del producto (`docs/reporte-de-bugs.md:57`), no de una cita de la spec. No verificado contra `/documentacion` en esta revisión.

### 3. Sin esperas fijas — 3/3
- `grep -rnE "waitForTimeout|networkidle" tests/e2e pages tests/support` sin resultados. Solo hay auto-espera de Playwright.

### 4. Datos dinámicos — 3/3
- Usuario nuevo por test: `generarUsuario()` y `registrarPorApi(page.request, usuario)` (`inscripcion.spec.ts:15-16`). Email y contraseña se construyen con `Date.now()`, contador y azar (`tests/support/usuario.ts:17-21`). Sin credenciales, cookies ni tokens literales. El único literal es el `courseId` `'fundamentos'` como constante con nombre (`:10`).

### 5. `test.fail` correcto — 3/3
- Un solo `test.fail`, primera línea del test: `inscripcion.spec.ts:40`, cita BUG-03 (existe en `docs/reporte-de-bugs.md`). La aserción exige lo que dice la spec (cupo baja en 1, `:51`), no está invertida.
- Sin `skip`, `fixme` ni `only` en `tests/e2e` (grep sin resultados).

### 6. Reproducibilidad — 3/3
- Tres repeticiones con el mismo resultado (abajo). `retries: 0` en `playwright.config.ts:10`. No depende de la sesión tras una recarga (BUG-01): se llega al catálogo con el enlace "Ver cursos" (`CatalogoPage.ts:19-21`), sin `page.goto` a rutas protegidas.

Total: 16/18. No es `CALIDAD COMPLETA`.

## Evidencia ejecutable

```text
Comando: npx playwright test tests/e2e/inscripcion.spec.ts --repeat-each=3 --reporter=line
Exit code: 0
Pasados: 6 (3 repeticiones x 2 tests; 3 verdes y 3 fallos esperados con test.fail)
Fallidos: 0
Duración: 10.6 s
```

Un test con `test.fail` figura como pasado mientras el producto sigue incumpliendo. Si BUG-03 se corrige, el test de REQ-C04 se pondrá rojo a propósito.

## Hallazgos

| # | Hallazgo | Clasificación | Recomendación |
|---|---|---|---|
| 1 | `test.fail` en `:40` cubre todo el cuerpo del test: cualquier fallo anterior a la aserción final (por ejemplo `:44` o `:48`) también se tomaría como "fallo esperado" y no se vería | `DEFECTO_DEL_TEST` (menor) | Dejar constancia en el comentario del test de que el defecto esperado es solo la aserción de `:51`; revisar el trace si el test cambia de comportamiento |
| 2 | Los `getByTestId` de `CatalogoPage.ts:38` y `:47` no explican por qué faltan roles accesibles | `DEFECTO_DEL_TEST` (menor) | Añadir el comentario, como en `:33` |
| 3 | `getByLabel('Email')` sin `exact` | `DEFECTO_DEL_TEST` (menor) | Valorar `exact: true` |
| 4 | El texto `'Inscripción exitosa'` no está contrastado con la spec | `ENTRADA_FALTANTE` | Confirmar la cita en `/documentacion` o declararlo como observado |
| 5 | Cada ejecución inscribe un usuario nuevo en `fundamentos` sin limpieza. Mientras BUG-03 siga abierto el cupo no baja, pero al corregirse los cupos finitos podrían agotarse | `BLOQUEO_DE_ENTORNO` (riesgo) | Declararlo como riesgo conocido; no hay mitigación en el repo |

No se modificó ningún archivo del código.

## Alcance de esta verificación
- Demuestra que el E2E de inscripción cumple los criterios de la skill sobre el código y que su comando es reproducible en local (6 de 6 en tres repeticiones).
- No demuestra otros navegadores (solo Chromium), la sesión tras recargar, ni el flujo de inscripción en cursos con prerrequisito. No revisa `smoke.spec.ts` ni `ui-sondeo.spec.ts`.

## Estado
Pendiente de decisión humana (la palabra ACEPTADO es exclusiva de esa decisión).
