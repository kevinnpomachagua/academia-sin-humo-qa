# Mapa de skills

Las 17 skills del repositorio viven en [`.agents/skills/`](../.agents/skills/) (puentes en `.claude/skills/`). Convención: `generar-*` crea o amplía y exige plan aprobado antes de escribir; `verificar-*` revisa en solo lectura y solo escribe su reporte. La decisión final es mía.

| Skill | Para qué sirve | Entrada → salida | Pareja o reporte |
|---|---|---|---|
| `generar-estrategia-de-pruebas` | Redacta la estrategia: riesgo, matriz de flujos y alcance | Consigna, spec y evidencia → `docs/estrategia.md` | Sin reporte propio; la revisa `verificar-proyecto-final` |
| `generar-casos-de-prueba` | Diseña casos desde la spec con técnicas y trazabilidad | Spec → `docs/casos-de-prueba.md` | Pareja: `verificar-casos-de-prueba` |
| `verificar-casos-de-prueba` | Traductor a Gherkin y juez (rúbrica de 4 pilares, clase 09; reconstrucción) más trazabilidad | `docs/casos-de-prueba.md` → reporte | [`casos-de-prueba-report.md`](../reports/casos-de-prueba-report.md) (8/12; segunda pasada: 8/12) |
| `ejecutar-casos-con-evidencia` | Ejecuta y mide casos con los scripts de `tests/evidencia/` | Casos `CP-xx` → líneas `CPxx\|estado\|resumen`, capturas y JSON en `docs/evidencia/` | Sin reporte propio; alimenta `reportar-bug` |
| `reportar-bug` | Redacta hallazgos con evidencia y severidad | Fallo medido → `docs/reporte-de-bugs.md` | Sin reporte propio; la revisa `verificar-proyecto-final` |
| `generar-pom` | Crea o corrige Page Objects | Evidencia HTML y test → `pages/` | Pareja: `verificar-pom` |
| `verificar-pom` | Revisa un Page Object con la rúbrica POM | `pages/` y test → reporte | [`pom-agent-report.md`](../reports/pom-agent-report.md) |
| `generar-test-e2e` | Crea tests E2E con Page Objects y `test.fail` para bugs | Flujo y spec → `tests/e2e/` | Pareja: `verificar-test-e2e` |
| `verificar-test-e2e` | Rúbrica sobre el E2E y los Page Objects | `tests/e2e/inscripcion.spec.ts` y `pages/` → reporte | [`test-e2e-report.md`](../reports/test-e2e-report.md) |
| `generar-tests-api` | Crea tests de contrato de API desde la spec | Spec y alcance aprobado → `tests/api/` | Pareja: `verificar-tests-api` |
| `verificar-tests-api` | Rúbrica sobre los tests de API | `tests/api/` y `tests/support/api.ts` → reporte | [`tests-api-report.md`](../reports/tests-api-report.md) |
| `generar-test-integrado` | Construye el flujo API prepara, UI verifica, API limpia | Spec y helpers → `tests/integrado/` | Pareja: `verificar-test-integrado` |
| `verificar-test-integrado` | Rúbrica sobre el flujo integrado | `tests/integrado/` → reporte | [`test-integrado-report.md`](../reports/test-integrado-report.md) |
| `generar-workflow-ci` | Propone o revisa el workflow de GitHub Actions | `npm run test:ci` → `.github/workflows/playwright.yml` | [`workflow-ci-report.md`](../reports/workflow-ci-report.md) (revisión del workflow existente) |
| `verificar-estabilidad-suite` | Corre la suite del CI tres veces y busca anti-patrones | `npm run test:ci` y código → reporte | [`estabilidad-suite-report.md`](../reports/estabilidad-suite-report.md) |
| `verificar-proyecto-final` | Audita el repo contra la Definición de terminado | Repo y consigna → reporte con cumple, parcial o no cumple | [`proyecto-final-report.md`](../reports/proyecto-final-report.md) |
| `arquitectura-sincronizacion` | **Infraestructura, no de QA:** sincroniza las skills con Claude Code | `.agents/skills/` → puentes en `.claude/skills/` | Sin reporte |
