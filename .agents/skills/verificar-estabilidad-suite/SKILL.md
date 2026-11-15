---
name: verificar-estabilidad-suite
description: Comprueba en solo lectura sobre el código que la suite del CI de Academia sin Humo es estable (npm run test:ci tres veces seguidas con el mismo resultado) y busca anti-patrones como waitForTimeout, skip, fixme, retries, networkidle o aserciones debilitadas, guardando un reporte en reports/.
---

# Skill: verificar la estabilidad de la suite

## Entradas
- Suite del CI: `npm run test:ci` (`tests/api`, `tests/e2e`, `tests/integrado`).
- Carpetas a revisar: `tests/api`, `tests/e2e`, `tests/integrado`, `pages`, `tests/support` y `playwright.config.ts`.
- Reporte anterior de `reports/`, si existe.

## Reglas
- Solo lectura sobre el código. El único archivo que escribe es `reports/estabilidad-suite-report.md`.
- **Nunca recomiendes reintentos, `skip`, `fixme` ni borrar tests para forzar verde.** Un fallo de producto se declara con `test.fail(true, 'BUG-XX...')` y se reporta en `docs/reporte-de-bugs.md`; un fallo del test se corrige en el test; un bloqueo de entorno se reporta sin cambiar código.
- No suavices un hallazgo ni inventes un resultado. Cita `archivo:línea` o el comando.
- No uses la palabra `ACEPTADO`: es exclusiva de la decisión de quien usa la skill.

## Verificación ejecutable
1. Ejecuta `npm run test:ci` **tres veces seguidas**, sin cambiar nada entre pasadas.
2. Por pasada registra exit code, pasados, fallidos, flaky, omitidos y duración. Compara las tres: mismo recuento y mismos tests en verde.
3. Aclara que un test con `test.fail` figura como pasado mientras el producto incumple, y que si el producto se corrige ese test pasa a rojo a propósito.
4. Ante un fallo clasifícalo: `DEFECTO_DEL_TEST`, `DISCREPANCIA_CONTRATO_PRODUCTO`, `AMBIGÜEDAD_DEL_CONTRATO`, `BLOQUEO_DE_ENTORNO` (sitio caído, límite de peticiones) o `ENTRADA_FALTANTE`.

## Búsqueda de anti-patrones (con grep en las carpetas listadas)
`waitForTimeout`, `networkidle`, `.skip`, `test.fixme`, `.only`, `retries` (debe ser 0 en `playwright.config.ts`), aserciones débiles (`toBeTruthy` sobre un resultado de negocio, `expect(true)`), aserciones invertidas (se espera el comportamiento defectuoso del producto en vez de la spec) y `test.fail` sin cita de BUG. Reporta cada coincidencia con `archivo:línea` o "sin resultados".

## Reporte (`reports/estabilidad-suite-report.md`)
1. `# Reporte de estabilidad de la suite` y `## Resultado` con bloque `ESTABILIDAD CONFIRMADA` o `ESTABILIDAD CON HALLAZGOS`.
2. `## Evidencia ejecutable`: tabla de las tres pasadas.
3. `## Anti-patrones`: tabla patrón, comando, resultado.
4. `## Hallazgos` sin corregir, con clasificación y recomendación (nunca reintentos ni `skip`), `## Alcance` y `## Estado` (decisión humana pendiente).
5. Nota: "Estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original".
