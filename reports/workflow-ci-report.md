# Reporte de revisión del workflow de CI

## Resultado

> **VERIFICACIÓN SUPERADA CON OBSERVACIONES** (11/12 estática, comando local con exit code 0)

| Intento | Archivo revisado | Comando | Modo |
|---|---|---|---|
| 1 | `.github/workflows/playwright.yml` | `npm run test:ci` (`playwright test tests/api tests/e2e tests/integrado`) | `REVISAR` (sin modificar el workflow) |

> **Nota:** estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original. El workflow ya existía; esta revisión lo contrasta con la skill `generar-workflow-ci` y es una autoevaluación asistida, no una auditoría externa.

## Rúbrica (skill `generar-workflow-ci`)

### 1. Reproducibilidad — 3/3
- `npm run test:ci` existe en `package.json` y el workflow lo ejecuta en `playwright.yml:44-45`; `npm ci` (`:29-30`) con `package-lock.json` presente; la rama `main` coincide con `git branch --show-current`.
- Typecheck antes de los tests (`:32-33`); `npx tsc --noEmit` devuelve 0 en local.
- Instalación solo de Chromium (`:35-37`), el único proyecto de `playwright.config.ts`; `forbidOnly` activo en CI y `retries: 0` en esa configuración.

### 2. Seguridad — 3/3
- `permissions: contents: read` (`:11-12`), `timeout-minutes: 15` (`:18`).
- Sin `secrets.*`, `.env` ni credenciales en el YAML; el comentario de cabecera lo declara (`:3-4`). Las acciones son oficiales de `actions/*`.

### 3. Honestidad del alcance — 3/3
- Sin `skip`, `only` ni reintentos en `tests/api`, `tests/integrado` ni `tests/support` (grep sin resultados).
- Alcance parcial declarado en el YAML (`:39-43`: corre `tests/api`, `tests/e2e`, `tests/integrado`; excluye `tests/evidencia/` con su motivo) y en el README (sección Arquitectura).
- Los bugs se declaran en los tests con `test.fail`, no en el YAML (`:42-43`).

### 4. Evidencia y robustez — 2/3
- Artifact `playwright-report` con `if: ${{ !cancelled() }}` y retención de 14 días (`:47-53`); `playwright.config.ts` genera `playwright-report/` con el reporter `html`.
- Observación: falta `if-no-files-found: error`; por defecto una ausencia del reporte solo avisa y no rompe el job.
- Observación: el run de referencia del README (enlace `actions/runs/43323701242`) no pude verificarlo desde aquí (`gh` sin sesión iniciada). El comando equivalente en local sí es verificable (abajo).
- Observación: acciones fijadas por etiqueta mayor (`@v4`), no por SHA; y todo el CI depende del sitio público, de modo que una caída o un límite de peticiones del sitio ponen el job en rojo sin que haya un defecto del código (`BLOQUEO_DE_ENTORNO`).

Total: 11/12.

## Evidencia ejecutable

```text
Comando: npx playwright test tests/api tests/e2e tests/integrado   (equivale a npm run test:ci)
Exit code: 0
Pasados: 18 (8 verdes + 10 fallos esperados con test.fail)
Fallidos: 0
Duración: 23.9 s
Total listado: 18 tests en 6 archivos
```

El README informa 18 passed en 29.2 s para el run de CI; el recuento coincide con el local. Los 10 `test.fail` de la suite del CI cubren BUG-01 a BUG-06, BUG-09 y BUG-10.

## Hallazgos

| # | Hallazgo | Clasificación | Recomendación |
|---|---|---|---|
| 1 | Falta `if-no-files-found: error` en el artifact | `DEFECTO_DEL_TEST` (configuración, menor) | Añadirlo en una próxima edición del workflow |
| 2 | Run de referencia del README no verificable desde este entorno | `ENTRADA_FALTANTE` | Revisar el enlace en GitHub antes de la entrega |
| 3 | Dependencia del sitio público sin aislamiento | `BLOQUEO_DE_ENTORNO` (riesgo) | Declararlo como riesgo conocido; no hay mitigación en el repo |

No se modificó el workflow ni el código.

## Alcance de esta verificación
- Demuestra que el workflow cumple los criterios de la skill sobre el YAML y que el comando que ejecuta es reproducible en local.
- No demuestra que el workflow corra en GitHub Actions: no observé una ejecución real. Tampoco valida la sintaxis YAML con un linter de Actions.

## Estado del workflow
Pendiente de decisión humana (la palabra ACEPTADO es exclusiva de esa decisión).

Actualización posterior (2026-11-14): descargué el artifact `playwright-report` del run n.º 3 (`43453247198`, commit `a805806`) y se verificó su contenido: 18 tests, los 18 esperados, 0 inesperados, 0 flaky y 0 omitidos, solo Chromium, 26,3 s. El README cita ahora ese run como referencia. Las referencias de este reporte a los runs `43323701242` y `43326559658` corresponden a la verificación de la fecha en que se hizo; ambos están en `success`.
