# QA Automation — Academia sin Humo

[![Playwright](https://github.com/kevinnpomachagua/academia-sin-humo-qa/actions/workflows/playwright.yml/badge.svg)](https://github.com/kevinnpomachagua/academia-sin-humo-qa/actions/workflows/playwright.yml)

Suite de pruebas automatizadas sobre [Academia sin Humo](https://playground.calidadsinhumo.com) (especificación en [`/documentacion`](https://playground.calidadsinhumo.com/documentacion)), construida con Playwright y TypeScript.

## Qué prueba y por qué

El riesgo principal que identifiqué es que las reglas de negocio de inscripción y progreso viven solo en la interfaz: la API acepta una inscripción sin el prerrequisito completado, deja volver a En progreso un curso Abandonado y genera certificados duplicados. Por eso automaticé el flujo de inscripción en las tres capas (UI, contrato de `POST /api/enroll` y un flujo integrado que contrasta ambas) y los defectos de integridad de progreso y sesión por API. El resto del producto (registro, login y bloqueo, paginación, reserva y subida de CV) lo recorrí con 95 casos diseñados desde la spec y dejé sus hallazgos documentados con evidencia, sin meterlos en la suite de regresión.

Detalle de la priorización (frecuencia × valor/riesgo) en [`docs/estrategia.md`](docs/estrategia.md) y casos en [`docs/casos-de-prueba.md`](docs/casos-de-prueba.md).

## Qué NO prueba

- **Registro, login y rate limiting, paginación, reserva y subida de CV como regresión automatizada.** Sus defectos están reportados con evidencia, pero no tocan el riesgo principal y varios exigen esperas de 30 s o archivos pesados que encarecen la suite.
- **Que el producto cumpla toda la spec.** Solo cubro los flujos elegidos; no puedo afirmar que no haya más defectos en las zonas descartadas.
- **Otros navegadores, rendimiento y seguridad.** El único proyecto de Playwright es Chromium.
- **Inscripción con sesión persistente tras recargar la página.** El servidor no reconoce la sesión (BUG-01), así que el E2E depende de la navegación dentro de la misma sesión.
- **El reflejo de una inscripción hecha por API en "Mi progreso" ni en el cupo**, en el flujo integrado.
- **Independencia del entorno.** Toda la suite, también la del CI, corre contra un sitio público de terceros que no controlo: una caída del sitio o un límite de peticiones pondría la suite en rojo sin que haya un defecto en mi código (se clasifica como `BLOQUEO_DE_ENTORNO`, no como bug del producto ni del test).

**Un CI en verde no significa que el producto esté libre de defectos.** Significa que los flujos elegidos se comportan según la spec o que el defecto está declarado como esperado (ver la convención de bugs abajo).

## Arquitectura

- **Page Object Model:** [`pages/LoginPage.ts`](pages/LoginPage.ts) y [`pages/CatalogoPage.ts`](pages/CatalogoPage.ts). Locators semánticos (`getByRole`, `getByLabel`), `getByTestId` solo donde no hay rol accesible, sin aserciones dentro de los Page Objects y sin `waitForTimeout`.
- **Tests de UI:** [`tests/e2e/inscripcion.spec.ts`](tests/e2e/inscripcion.spec.ts) (inscripción a Fundamentos de Testing, 2 tests), [`smoke.spec.ts`](tests/e2e/smoke.spec.ts) (1) y [`ui-sondeo.spec.ts`](tests/e2e/ui-sondeo.spec.ts) (2, BUG-09 y BUG-10).
- **Tests de API:** [`tests/api/enroll.spec.ts`](tests/api/enroll.spec.ts) (6 tests: camino feliz, sin `courseId`, curso inexistente, body malformado, 403 por prerrequisito y cupo con `GET /api/courses` antes y después) y [`sondeo.spec.ts`](tests/api/sondeo.spec.ts) (6 tests: BUG-01, BUG-04 con sus dos controles de límite, BUG-05 y BUG-06).
- **Flujo integrado (opción A, REQ-C06):** [`tests/integrado/inscripcion-prerrequisito.spec.ts`](tests/integrado/inscripcion-prerrequisito.spec.ts). La API intenta inscribir a un curso con prerrequisito pendiente, la UI verifica que el catálogo lo mantiene bloqueado y la API limpia. El dato compartido es el usuario dinámico y su sesión: nace por API y lo consume la UI.
- **Soporte:** [`tests/support/`](tests/support/) (usuarios dinámicos, helpers de API que adjuntan request y response al reporte).
- **Scripts de evidencia:** [`tests/evidencia/`](tests/evidencia/) mide el producto y genera las capturas y JSON de `docs/evidencia/`. Quedan **fuera del CI** a propósito: no afirman nada, algunos usan esperas visuales y dependen de una cuenta de prueba compartida del sitio. Se lanzan a demanda.
- **CI en GitHub Actions:** [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml). Corre en cada push a `main`, en pull requests y a demanda; hace `npm ci`, typecheck, instala Chromium, ejecuta `npm run test:ci` (`tests/api`, `tests/e2e`, `tests/integrado`) y sube el artifact `playwright-report`. Sin secretos ni `.env`: el producto es público y cada test genera sus usuarios. Run verde de referencia: [actions/runs/43453247198](https://github.com/kevinnpomachagua/academia-sin-humo-qa/actions/runs/43453247198) (run n.º 3, commit `a805806`, job "Typecheck y tests (Chromium)", con su artifact `playwright-report`). Descargué y revisé ese artifact: 18 tests, los 18 esperados, 0 inesperados, 0 flaky y 0 omitidos, solo Chromium, en 26,3 s. Revisé el workflow línea por línea: se dispara en `push` a `main`, en `pull_request` y a demanda; usa permisos mínimos (`contents: read`); ejecuta checkout, Node 24, `npm ci`, typecheck, instalación de Chromium, `npm run test:ci` y la subida del artifact `playwright-report`; no hay secretos, `skip` ni tests borrados, y lo que queda fuera del CI está declarado en el propio archivo (revisado el 2026-11-14). El run muestra dos anotaciones conocidas que no impiden el verde: las acciones `checkout`, `setup-node` y `upload-artifact` (v4) están escritas para Node 20 y GitHub las ejecuta forzadas en Node 24, y la etiqueta `ubuntu-latest` migra a Ubuntu 26. Los tests de BUG-09, BUG-10 y del flujo de REQ-C06 aparecen en verde porque están declarados con `test.fail`.

```text
docs/            estrategia, especificacion-req.md (copia fechada de la spec), casos de prueba, reporte de bugs y evidencia/ (capturas y JSON)
pages/           Page Objects
tests/
├── api/         contrato de /api/enroll y sondeo de bugs por API
├── e2e/         inscripción por UI, smoke y sondeo de UI
├── integrado/   API prepara, UI verifica, API limpia
├── support/     usuarios dinámicos y helpers de API
└── evidencia/   scripts que miden y generan evidencia (fuera del CI)
reports/         pom-agent-report.md, tests-api-report.md, test-integrado-report.md, workflow-ci-report.md, casos-de-prueba-report.md, test-e2e-report.md, estabilidad-suite-report.md, proyecto-final-report.md (verificaciones)
.agents/skills/  skills del proyecto (puentes para Claude Code en .claude/skills/)
.github/workflows/playwright.yml
```

`npx playwright test --list` lista 122 tests en 11 archivos; **18 en 6 archivos forman la suite del CI** y el resto (104) son los scripts de `tests/evidencia/`.

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

**Casos de prueba:** 95 casos diseñados desde la spec con valores límite, partición, tabla de decisión, transición de estados, comportamiento temporal y autorización. Resultado: 58 PASA y 37 FALLA, y cada FALLA enlaza su BUG. Incluye una matriz de trazabilidad REQ → CP. Los resultados de los casos se midieron con scripts de `tests/evidencia/`; las capturas y respuestas JSON están en [`docs/evidencia/`](docs/evidencia/) (13 capturas y 8 respuestas de API).

**Paso por el juez:** evalué los casos con la rúbrica de la sesión 12 mediante un agente de Claude. No fue la skill propia del curso, así que es una autoevaluación asistida. Puntaje 9/12 ("requiere revisión"). Esa evaluación fue previa y manual. Acepté la mayoría de sus observaciones (transiciones prohibidas, prerrequisito en Inscrito o Abandonado, límites de fecha, variantes de email, entre otras) y rechacé las que obligaban a inventar reglas que la spec no define. La tabla de qué acepté y qué rechacé, con los motivos, está en la sección "Paso por el juez" de [`docs/casos-de-prueba.md`](docs/casos-de-prueba.md#paso-por-el-juez). Después empaqueté el juez como skill, siguiendo la estructura enseñada en la clase 09 (un traductor a Gherkin y un juez con rúbrica de 4 pilares), y lo apliqué a los 93 casos ya ajustados: [`reports/casos-de-prueba-report.md`](reports/casos-de-prueba-report.md) (8/12, "revisar"; una segunda pasada sobre el conjunto ampliado de 95 casos dio otra vez 8/12, "revisar", sin subir ningún pilar; la primera observación, que CP-24 debía ser FALLA, se aceptó y CP-24 se corrigió a FALLA (BUG-12)). Es una reconstrucción a partir de las notas de la clase: el juez original que construí en ella no está en este repo. Es otra IA leyendo el trabajo, no una validación humana, y salvo esa corrección no modificó los casos. Sus demás observaciones se evaluaron y resolvieron el 2026-11-14 con la asistencia de Claude como herramienta de apoyo, validando y decidiendo cada ajuste bajo mi propio criterio técnico (sección "Segunda ronda" de [`docs/casos-de-prueba.md`](docs/casos-de-prueba.md#paso-por-el-juez)): se añadieron CP-94 y CP-95 (de 93 a 95 casos) y se declararon los límites de la cobertura; las cifras del reporte del juez corresponden a la versión de 93 casos.

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

## Cómo se trabajó

Orden real del trabajo, cada paso con su evidencia en el repo:

1. **Spec como fuente de verdad:** los resultados esperados salen de [`/documentacion`](https://playground.calidadsinhumo.com/documentacion) (REQ-xx), no de lo que responde el producto.
2. **Estrategia:** riesgo principal, flujos priorizados y alcance en [`docs/estrategia.md`](docs/estrategia.md).
3. **Casos de prueba:** 95 casos con técnicas de diseño en [`docs/casos-de-prueba.md`](docs/casos-de-prueba.md).
4. **Bugs:** 16 discrepancias con evidencia en [`docs/reporte-de-bugs.md`](docs/reporte-de-bugs.md) y [`docs/evidencia/`](docs/evidencia/).
5. **Page Object:** [`pages/`](pages/), con las skills `generar-pom` y `verificar-pom` ([`reports/pom-agent-report.md`](reports/pom-agent-report.md)).
6. **Contrato de API:** [`tests/api/`](tests/api/) y [`tests/support/api.ts`](tests/support/api.ts).
7. **Flujo integrado:** [`tests/integrado/inscripcion-prerrequisito.spec.ts`](tests/integrado/inscripcion-prerrequisito.spec.ts).
8. **CI:** [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml).
9. **README:** este documento, con las verificaciones de [`reports/`](reports/) al final.

## Herramientas de IA que construí

- **Skills `generar-pom` y `verificar-pom`:** crean o corrigen un Page Object a partir de evidencia HTML y lo verifican contra una rúbrica POM sin modificarlo. Viven en [`.agents/skills/`](.agents/skills/) con puentes en [`.claude/skills/`](.claude/skills/) para Claude Code. Con ellas generé los Page Objects de este proyecto; el resultado de la verificación está en [`reports/pom-agent-report.md`](reports/pom-agent-report.md): 12/12 en la rúbrica estática (locators semánticos 3/3, aserciones fuera 3/3, estructura POM 3/3, acciones limpias 3/3) y el test del flujo en verde con `--repeat-each=3` (6 passed). Es un puntaje autoevaluado, no una auditoría externa, y el informe deja la aceptación pendiente de mi decisión.
- **Skills de API, integración y CI:** además de las skills del Page Object, en [`.agents/skills/`](.agents/skills/) hay cinco más, con puentes en `.claude/skills/`:
  - `generar-tests-api`: crea o amplía tests de contrato de API con la spec como fuente y plan aprobado antes de escribir.
  - `verificar-tests-api`: rúbrica puntuada sobre `tests/api/` y `tests/support/api.ts`, solo lectura. Reporte: [`reports/tests-api-report.md`](reports/tests-api-report.md) (8/12, con hallazgos).
  - `generar-test-integrado`: construye el flujo "la API prepara, la UI verifica, la API limpia" reutilizando Page Objects y helpers.
  - `verificar-test-integrado`: rúbrica puntuada sobre `tests/integrado/`, solo lectura. Reporte: [`reports/test-integrado-report.md`](reports/test-integrado-report.md) (8/12, con hallazgos).
  - `generar-workflow-ci`: propone o revisa el workflow de GitHub Actions. Reporte de la revisión del workflow existente: [`reports/workflow-ci-report.md`](reports/workflow-ci-report.md) (11/12).

  **Se construyeron después de escribir los tests** y se aplicaron como verificación, no como generadores del código original. Los puntajes son autoevaluados y los reportes listan lo que no cumple sin haberlo corregido en el código.
- **Skill `verificar-casos-de-prueba` (traductor y juez con rúbrica):** sigue la estructura enseñada en la clase 09 (un traductor a Gherkin y un juez con rúbrica de 4 pilares: cobertura, claridad, casos límite, Gherkin), es una reconstrucción a partir de las notas de la clase y el juez original que construí en ella no está en este repo. Es de solo lectura; evalúa `docs/casos-de-prueba.md` y añade la trazabilidad al REQ que pide la consigna como criterio propio del proyecto, y deja la decisión sobre cada observación en mis manos. Vive en [`.agents/skills/verificar-casos-de-prueba/`](.agents/skills/verificar-casos-de-prueba/SKILL.md) con puente en `.claude/skills/`. Reporte: [`reports/casos-de-prueba-report.md`](reports/casos-de-prueba-report.md) (8/12 en la primera pasada y 8/12 en la segunda, sobre los 95 casos). Sigue siendo una IA evaluando trabajo asistido por IA, no una validación humana; la evaluación inicial (9/12, rúbrica de la clase 09) fue previa y manual, sin skill.
- **Skill `generar-casos-de-prueba`:** diseña o amplía `docs/casos-de-prueba.md` desde la spec, con el formato, las técnicas por zona, la numeración y la trazabilidad al REQ, sin inventar resultados. Es la pareja de `verificar-casos-de-prueba`.
- **Skill `reportar-bug`:** redacta o actualiza un hallazgo en [`docs/reporte-de-bugs.md`](docs/reporte-de-bugs.md) con el formato de la consigna, evidencia reproducible y severidad justificada, y lo vincula con su caso y su test. No tiene reporte propio; la auditoría final revisa el resultado.
- **Skills de E2E, estabilidad y cierre del proyecto:** otras seis skills en `.agents/skills/`, también con puente en `.claude/skills/`, que se construyeron después de los tests igual que las anteriores:
  - `generar-test-e2e` y `verificar-test-e2e`: crean y revisan el E2E de `tests/e2e/` con los Page Objects de `pages/`. Reporte: [`reports/test-e2e-report.md`](reports/test-e2e-report.md) (16/18, con hallazgos).
  - `verificar-estabilidad-suite`: corre `npm run test:ci` tres veces seguidas y busca anti-patrones, sin recomendar reintentos ni `skip`. Reporte: [`reports/estabilidad-suite-report.md`](reports/estabilidad-suite-report.md) (3 pasadas de 18 passed).
  - `verificar-proyecto-final`: audita el repo contra la Definición de terminado de la consigna, con evidencia por ítem. Reporte: [`reports/proyecto-final-report.md`](reports/proyecto-final-report.md) (los ítems que dependen de mi revisión quedan como pendientes de confirmación).
  - `generar-estrategia-de-pruebas` y `ejecutar-casos-con-evidencia`: describen el proceso ya seguido para `docs/estrategia.md` y para los scripts de `tests/evidencia/`; no tienen reporte propio.

  Los puntajes de estos reportes también son autoevaluados y no sustituyen una revisión externa.
- **Sin agente `@api-project-agent` empaquetado:** existen las skills de API descritas arriba, pero no hay un agente ni un workflow que las orqueste en este repositorio. Los tests de API usan la fixture `request` de Playwright.

## Mapa de skills

Las 17 skills del repositorio viven en [`.agents/skills/`](.agents/skills/) (puentes en `.claude/skills/`). Convención: `generar-*` crea o amplía y exige plan aprobado antes de escribir; `verificar-*` revisa en solo lectura y solo escribe su reporte. La decisión final es mía.

| Skill | Para qué sirve | Entrada → salida | Pareja o reporte |
|---|---|---|---|
| `generar-estrategia-de-pruebas` | Redacta la estrategia: riesgo, matriz de flujos y alcance | Consigna, spec y evidencia → `docs/estrategia.md` | Sin reporte propio; la revisa `verificar-proyecto-final` |
| `generar-casos-de-prueba` | Diseña casos desde la spec con técnicas y trazabilidad | Spec → `docs/casos-de-prueba.md` | Pareja: `verificar-casos-de-prueba` |
| `verificar-casos-de-prueba` | Traductor a Gherkin y juez (rúbrica de 4 pilares, clase 09; reconstrucción) más trazabilidad | `docs/casos-de-prueba.md` → reporte | [`casos-de-prueba-report.md`](reports/casos-de-prueba-report.md) (8/12; segunda pasada: 8/12) |
| `ejecutar-casos-con-evidencia` | Ejecuta y mide casos con los scripts de `tests/evidencia/` | Casos `CP-xx` → líneas `CPxx\|estado\|resumen`, capturas y JSON en `docs/evidencia/` | Sin reporte propio; alimenta `reportar-bug` |
| `reportar-bug` | Redacta hallazgos con evidencia y severidad | Fallo medido → `docs/reporte-de-bugs.md` | Sin reporte propio; la revisa `verificar-proyecto-final` |
| `generar-pom` | Crea o corrige Page Objects | Evidencia HTML y test → `pages/` | Pareja: `verificar-pom` |
| `verificar-pom` | Revisa un Page Object con la rúbrica POM | `pages/` y test → reporte | [`pom-agent-report.md`](reports/pom-agent-report.md) |
| `generar-test-e2e` | Crea tests E2E con Page Objects y `test.fail` para bugs | Flujo y spec → `tests/e2e/` | Pareja: `verificar-test-e2e` |
| `verificar-test-e2e` | Rúbrica sobre el E2E y los Page Objects | `tests/e2e/inscripcion.spec.ts` y `pages/` → reporte | [`test-e2e-report.md`](reports/test-e2e-report.md) |
| `generar-tests-api` | Crea tests de contrato de API desde la spec | Spec y alcance aprobado → `tests/api/` | Pareja: `verificar-tests-api` |
| `verificar-tests-api` | Rúbrica sobre los tests de API | `tests/api/` y `tests/support/api.ts` → reporte | [`tests-api-report.md`](reports/tests-api-report.md) |
| `generar-test-integrado` | Construye el flujo API prepara, UI verifica, API limpia | Spec y helpers → `tests/integrado/` | Pareja: `verificar-test-integrado` |
| `verificar-test-integrado` | Rúbrica sobre el flujo integrado | `tests/integrado/` → reporte | [`test-integrado-report.md`](reports/test-integrado-report.md) |
| `generar-workflow-ci` | Propone o revisa el workflow de GitHub Actions | `npm run test:ci` → `.github/workflows/playwright.yml` | [`workflow-ci-report.md`](reports/workflow-ci-report.md) (revisión del workflow existente) |
| `verificar-estabilidad-suite` | Corre la suite del CI tres veces y busca anti-patrones | `npm run test:ci` y código → reporte | [`estabilidad-suite-report.md`](reports/estabilidad-suite-report.md) |
| `verificar-proyecto-final` | Audita el repo contra la Definición de terminado | Repo y consigna → reporte con cumple, parcial o no cumple | [`proyecto-final-report.md`](reports/proyecto-final-report.md) |
| `arquitectura-sincronizacion` | **Infraestructura, no de QA:** sincroniza las skills con Claude Code | `.agents/skills/` → puentes en `.claude/skills/` | Sin reporte |
