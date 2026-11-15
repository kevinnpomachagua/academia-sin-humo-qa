---
name: generar-workflow-ci
description: Propone, crea o revisa .github/workflows/playwright.yml de Academia sin Humo con GitHub Actions a partir de la evidencia del repo (npm run test:ci), sin secretos, sin skip y con el alcance parcial declarado.
---

# Skill: generar o revisar el workflow de CI

## Entradas
- Raíz del repo, rama principal, comando de CI (`npm run test:ci`), navegador (el único proyecto de `playwright.config.ts`), ruta del reporte (`playwright-report/`).
- Modo: `GENERAR` (no existe workflow) o `REVISAR` (existe `.github/workflows/playwright.yml`).

## Gate humano
1. Inventario sin modificar: `package.json` (scripts), `package-lock.json`, `playwright.config.ts` (reporter, `forbidOnly`, `retries`), `git branch --show-current`, y si ya existe el workflow.
2. Ejecuta localmente el comando de CI y registra el resultado.
3. Presenta `PLAN_PENDIENTE` con hechos verificados, YAML propuesto (o diferencias, en `REVISAR`), supuestos y riesgos. No escribas hasta recibir `PLAN APROBADO`.
4. En `REVISAR` esta skill no modifica el workflow: solo reporta (`reports/workflow-ci-report.md`).
5. Sin commit, push ni pull request sin autorización. No afirmes que el workflow funciona sin observar una ejecución real en GitHub.

## Reglas del workflow
- Disparadores: `push` a la rama verificada, `pull_request` y `workflow_dispatch`.
- `permissions: contents: read` (mínimos) y `timeout-minutes` explícito.
- Pasos: checkout, `setup-node` con `cache: npm`, `npm ci` (si falta lockfile, escala; no cambies a `npm install`), `npx tsc --noEmit`, `npx playwright install --with-deps chromium`, `npm run test:ci`.
- **Sin secretos.** El producto es público y los usuarios se generan en cada test; no agregues `secrets.*`, `.env` ni credenciales.
- **Sin `skip`, `only`, retries ni aserciones debilitadas** para fabricar verde. Los bugs se declaran en el test con `test.fail(true, 'BUG-XX...')`, no en el YAML.
- **Alcance parcial declarado** en un comentario del YAML y en el README: qué rutas corre el CI (`tests/api`, `tests/e2e`, `tests/integrado`) y cuáles quedan fuera (`tests/evidencia/`) con su motivo.
- **Artifact del reporte** con `if: ${{ !cancelled() }}`, ruta `playwright-report/`, retención explícita y `if-no-files-found: error` para que su ausencia no pase inadvertida.
- Sin deploy, Docker, matrices ni sharding.

## Rúbrica de revisión (0 a 3 por criterio, total 12)
1. **Reproducibilidad:** el comando del CI existe en `package.json`, usa lockfile y coincide con lo ejecutado en local.
2. **Seguridad:** permisos mínimos, sin secretos, sin pasos que ejecuten código no declarado.
3. **Honestidad del alcance:** nada saltado ni debilitado; el alcance parcial está declarado en el YAML y en el README.
4. **Evidencia y robustez:** artifact del reporte, timeout, disparadores correctos; run de referencia verificable.

## Salida
- `CANDIDATO`: plan o YAML válido y comando local en verde; espera decisión de quien usa la skill.
- `ESCALADO`: falta información o el comando local no es reproducible.
- `REVISAR`: reporte con puntajes, evidencia `archivo:línea` y hallazgos sin corregir.
