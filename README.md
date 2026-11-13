# QA Automation — Academia sin Humo

[![Playwright](https://github.com/kevinnpomachagua/academia-sin-humo-qa/actions/workflows/playwright.yml/badge.svg)](https://github.com/kevinnpomachagua/academia-sin-humo-qa/actions/workflows/playwright.yml)

Suite de pruebas automatizadas sobre [Academia sin Humo](https://playground.calidadsinhumo.com) (especificación en [`/documentacion`](https://playground.calidadsinhumo.com/documentacion)), construida con Playwright y TypeScript.

## Qué prueba y por qué

El riesgo principal que identifiqué es que las reglas de negocio de inscripción y progreso viven solo en la interfaz: la API acepta una inscripción sin el prerrequisito completado, deja volver a En progreso un curso Abandonado y genera certificados duplicados. Por eso automaticé el flujo de inscripción en las tres capas (UI, contrato de `POST /api/enroll` y un flujo integrado que contrasta ambas) y los defectos de integridad de progreso y sesión por API. El resto del producto (registro, login y bloqueo, paginación, reserva y subida de CV) lo recorrí con 93 casos diseñados desde la spec y dejé sus hallazgos documentados con evidencia, sin meterlos en la suite de regresión.

Detalle de la priorización (frecuencia × valor/riesgo) en [`docs/estrategia.md`](docs/estrategia.md) y casos en [`docs/casos-de-prueba.md`](docs/casos-de-prueba.md).

## Qué NO prueba

- **Registro, login y rate limiting, paginación, reserva y subida de CV como regresión automatizada.** Sus defectos están reportados con evidencia, pero no tocan el riesgo principal y varios exigen esperas de 30 s o archivos pesados que encarecen la suite.
- **Que el producto cumpla toda la spec.** Solo cubro los flujos elegidos; no puedo afirmar que no haya más defectos en las zonas descartadas.
- **Otros navegadores, rendimiento y seguridad.** El único proyecto de Playwright es Chromium.
- **Inscripción con sesión persistente tras recargar la página.** El servidor no reconoce la sesión (BUG-01), así que el E2E depende de la navegación dentro de la misma sesión.
- **El reflejo de una inscripción hecha por API en "Mi progreso" ni en el cupo**, en el flujo integrado.

**Un CI en verde no significa que el producto esté libre de defectos.** Significa que los flujos elegidos se comportan según la spec o que el defecto está declarado como esperado (ver la convención de bugs abajo).

## Arquitectura

- **Page Object Model:** [`pages/LoginPage.ts`](pages/LoginPage.ts) y [`pages/CatalogoPage.ts`](pages/CatalogoPage.ts). Locators semánticos (`getByRole`, `getByLabel`), `getByTestId` solo donde no hay rol accesible, sin aserciones dentro de los Page Objects y sin `waitForTimeout`.
- **Tests de UI:** [`tests/e2e/inscripcion.spec.ts`](tests/e2e/inscripcion.spec.ts) (inscripción a Fundamentos de Testing, 2 tests), [`smoke.spec.ts`](tests/e2e/smoke.spec.ts) (1) y [`ui-sondeo.spec.ts`](tests/e2e/ui-sondeo.spec.ts) (2, BUG-09 y BUG-10).
- **Tests de API:** [`tests/api/enroll.spec.ts`](tests/api/enroll.spec.ts) (6 tests: camino feliz, sin `courseId`, curso inexistente, body malformado, 403 por prerrequisito y cupo con `GET /api/courses` antes y después) y [`sondeo.spec.ts`](tests/api/sondeo.spec.ts) (5 tests: BUG-01, BUG-04 con sus dos controles de límite, BUG-05 y BUG-06).
- **Flujo integrado (opción A, REQ-C06):** [`tests/integrado/inscripcion-prerrequisito.spec.ts`](tests/integrado/inscripcion-prerrequisito.spec.ts). La API intenta inscribir a un curso con prerrequisito pendiente, la UI verifica que el catálogo lo mantiene bloqueado y la API limpia. El dato compartido es el usuario dinámico y su sesión: nace por API y lo consume la UI.
- **Soporte:** [`tests/support/`](tests/support/) (usuarios dinámicos, helpers de API que adjuntan request y response al reporte).
- **Scripts de evidencia:** [`tests/evidencia/`](tests/evidencia/) mide el producto y genera las capturas y JSON de `docs/evidencia/`. Quedan **fuera del CI** a propósito: no afirman nada, algunos usan esperas visuales y dependen de una cuenta de prueba compartida del sitio. Se lanzan a demanda.
- **CI en GitHub Actions:** [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml). Corre en cada push a `main`, en pull requests y a demanda; hace `npm ci`, typecheck, instala Chromium, ejecuta `npm run test:ci` (`tests/api`, `tests/e2e`, `tests/integrado`) y sube el artifact `playwright-report`. Sin secretos ni `.env`: el producto es público y cada test genera sus usuarios. Run verde de referencia: [actions/runs/43323701242](https://github.com/kevinnpomachagua/academia-sin-humo-qa/actions/runs/43323701242) (job "Typecheck y tests (Chromium)", con su artifact `playwright-report`).

```text
docs/            estrategia, casos de prueba, reporte de bugs y evidencia/ (capturas y JSON)
pages/           Page Objects
tests/
├── api/         contrato de /api/enroll y sondeo de bugs por API
├── e2e/         inscripción por UI, smoke y sondeo de UI
├── integrado/   API prepara, UI verifica, API limpia
├── support/     usuarios dinámicos y helpers de API
└── evidencia/   scripts que miden y generan evidencia (fuera del CI)
reports/         pom-agent-report.md (verificación del Page Object)
.agents/skills/  skills del proyecto (puentes para Claude Code en .claude/skills/)
.github/workflows/playwright.yml
```

`npx playwright test --list` lista 120 tests en 11 archivos; **18 en 6 archivos forman la suite del CI** y el resto (102) son los scripts de `tests/evidencia/`.

### Convención para los bugs conocidos

Un bug confirmado se declara con `test.fail(true, 'BUG-XX…')` y el test **afirma lo que exige la spec**, nunca lo que el producto hace. Mientras el producto incumple, el test falla como se espera y la suite pasa; cuando alguien corrija el defecto, el test deja de fallar y la suite se pone roja, avisando de que hay que retirar la marca. Nunca invierto la aserción para forzar verde. En la suite del CI hay 10 tests declarados así, que cubren 8 bugs distintos (BUG-01 a BUG-06, BUG-09 y BUG-10). Reintentos desactivados (`retries: 0`): un test inestable debe verse, no esconderse con un segundo intento.

## Hallazgos

16 discrepancias contra la spec, de las cuales 2 tienen severidad Alta, 8 Media y 6 Baja. Reporte completo, con pasos, respuesta real y evidencia: [`docs/reporte-de-bugs.md`](docs/reporte-de-bugs.md).

| ID | Título | REQ | Severidad | Capa |
|---|---|---|---|---|
| BUG-01 | La sesión no se reconoce tras el login | S01, S02 | Alta | API |
| BUG-02 | La API de inscripción ignora el prerrequisito | C06, A02, A03 | Alta | API |
| BUG-03 | El cupo no baja al inscribirse | C04 | Media | API |
| BUG-04 | La contraseña de 65 caracteres se acepta | R04 | Baja | API |
| BUG-05 | Un curso Abandonado vuelve a En progreso | P02, P03 | Media | API |
| BUG-06 | Certificar dos veces duplica el certificado | P04 | Media | API |
| BUG-07 | La paginación pierde estudiantes y repite uno | N01, N02, N03 | Media | UI |
| BUG-08 | La reserva acepta un inicio a 31 días | D02 | Baja | UI |
| BUG-09 | El registro exitoso no limpia el formulario | R06 | Baja | UI |
| BUG-10 | El login se bloquea tras 4 intentos fallidos, no 5 | L03 | Media | UI |
| BUG-11 | El email sin dominio o sin punto se acepta | R03 | Baja | API |
| BUG-12 | El botón de login se habilita unos 5 s antes de que el timer llegue a 0 | L03 | Baja | UI |
| BUG-13 | Completado y Certificado pasan a En progreso | P02, P03 | Media | API |
| BUG-14 | Cerrar sesión no reinicia el progreso | S02 | Media | UI |
| BUG-15 | El CV acepta cualquier archivo, de cualquier tipo y tamaño | U02, U03 | Media | UI |
| BUG-16 | La reserva acepta un fin igual o anterior al inicio | D03 | Baja | UI |

El hallazgo central es BUG-02: viola REQ-C06 ("la API debe aplicar las mismas reglas que la UI"). La API responde 200 al inscribir en `playwright-cero` sin haber completado `fundamentos`, mientras la UI mantiene el curso bloqueado.

**Casos de prueba:** 93 casos diseñados desde la spec con valores límite, partición, tabla de decisión, transición de estados, comportamiento temporal y autorización. Resultado: 57 PASA y 36 FALLA, y cada FALLA enlaza su BUG. Incluye una matriz de trazabilidad REQ → CP. Los resultados de los casos se midieron con scripts de `tests/evidencia/`; las capturas y respuestas JSON están en [`docs/evidencia/`](docs/evidencia/) (13 capturas y 8 respuestas de API).

**Paso por el juez:** evalué los casos con la rúbrica de la sesión 12 mediante un agente de Claude. No fue la skill propia del curso, así que es una autoevaluación asistida. Puntaje 9/12 ("requiere revisión"). Acepté la mayoría de sus observaciones (transiciones prohibidas, prerrequisito en Inscrito o Abandonado, límites de fecha, variantes de email, entre otras) y rechacé las que obligaban a inventar reglas que la spec no define. La tabla de qué acepté y qué rechacé, con los motivos, está en la sección "Paso por el juez" de [`docs/casos-de-prueba.md`](docs/casos-de-prueba.md#paso-por-el-juez). Tras los ajustes no volví a pasar el conjunto por el juez.

## Decisiones

- **La inscripción como flujo crítico:** es el flujo central del negocio y donde la API incumple la regla del prerrequisito. Elegí `Fundamentos de Testing` para el E2E porque no tiene prerrequisito y sirve de base para el resto de la cadena de cursos.
- **Opción A en el integrado (REQ-C06):** es la recomendada en la consigna y la que ya muestra un defecto real. Si el test falla porque el producto contradice la spec, el hallazgo va al reporte y el test no se modifica.
- **Sin reintentos:** `retries: 0` para que la inestabilidad se vea y no se oculte.
- **Priorizar por riesgo, no por cantidad:** lo descartado de la regresión está declarado arriba, con su motivo.

## Cómo correrlo

Requiere Node.js (el CI usa la versión 24).

```bash
npm ci
npx playwright install chromium
npm run typecheck      # tsc --noEmit
npm run test:ci        # la suite del CI: tests/api, tests/e2e y tests/integrado
npm test               # todo, incluye tests/evidencia (a demanda; lanza esperas reales y usa la cuenta de prueba del sitio)
npx playwright show-report
```

Para ver el navegador, `--headed` abre la ventana maximizada y la variable `SLOWMO` (milisegundos) ralentiza cada acción; solo tiene efecto con `--headed`:

```bash
SLOWMO=500 npx playwright test tests/e2e --headed       # bash
$env:SLOWMO=500; npx playwright test tests/e2e --headed # PowerShell
```

Los tests golpean el sitio público: cada uno registra un usuario nuevo con datos generados, sin credenciales en el repo.

## Herramientas de IA que construí

- **Skills `generar-pom` y `verificar-pom`:** crean o corrigen un Page Object a partir de evidencia HTML y lo verifican contra una rúbrica POM sin modificarlo. Viven en [`.agents/skills/`](.agents/skills/) con puentes en [`.claude/skills/`](.claude/skills/) para Claude Code. Con ellas generé los Page Objects de este proyecto; el resultado de la verificación está en [`reports/pom-agent-report.md`](reports/pom-agent-report.md): 12/12 en la rúbrica estática (locators semánticos 3/3, aserciones fuera 3/3, estructura POM 3/3, acciones limpias 3/3) y el test del flujo en verde con `--repeat-each=3` (6 passed). Es un puntaje autoevaluado, no una auditoría externa, y el informe deja la aceptación pendiente de mi decisión.
- **Juez con rúbrica (autoevaluación asistida):** descrito en Hallazgos. Lo ejecutó un agente de Claude con la rúbrica de la sesión 12; no es una herramienta empaquetada en este repositorio.
- **`@api-project-agent`:** no está empaquetado en este repositorio. Los tests de API están en [`tests/api/`](tests/api/) y usan la fixture `request` de Playwright.
