---
name: generar-tests-api
description: Crea o amplía tests de contrato de API con Playwright y TypeScript en Academia sin Humo, tomando status, rutas y reglas solo de la spec y modificando únicamente el alcance aprobado.
---

# Skill: generar o ampliar tests de API

## Entradas
- Objetivo (endpoint o regla de la spec) y archivo objetivo (normalmente `tests/api/<nombre>.spec.ts`).
- Fuente autorizada: la spec en `https://playground.calidadsinhumo.com/documentacion` (REQ-xx), `docs/estrategia.md` y la evidencia de `docs/evidencia/api/`.
- Alcance aprobado y comando objetivo (por defecto `npx playwright test tests/api`).
- Reporte anterior de `reports/`, si existe.

## Gate humano
1. Inventario sin modificar nada: lee `package.json`, `playwright.config.ts` (`baseURL`, `retries: 0`), `tests/api/`, `tests/support/api.ts` y `docs/reporte-de-bugs.md`.
2. Presenta `PLAN_PENDIENTE`: archivos a crear o tocar, REQ que cubre cada test, status esperado y su cita en la spec, qué NO demuestra, riesgos.
3. No escribas nada hasta recibir `PLAN APROBADO`. Al terminar entrega al verificador; la aceptación final es de quien usa la skill.

## Reglas de construcción
1. **La spec es la fuente de verdad.** El status esperado sale de la spec (200, 400, 403, 404...), nunca de lo que respondió la API. Si la spec no define el caso, usa un rango (`>= 400` y `< 500`) y dilo en el comentario.
2. **Continuar, no reemplazar.** Reutiliza `tests/support/api.ts` (`usuarioConSesion`, `inscribir`, `progreso`, `cupo`, `evidencia`) y la `baseURL` de `playwright.config.ts`; rutas relativas (`/api/enroll`).
3. **Datos dinámicos.** Cada test crea su usuario con `nuevoUsuario()`. Prohibido escribir emails, contraseñas, cookies o tokens literales. Los `courseId` son constantes con nombre y un comentario que cite la spec.
4. **Discrepancia contrato-producto.** Si el producto contradice la spec, declara `test.fail(true, 'BUG-XX: ...')` como primera línea del test y mantén la aserción de lo que exige la spec. Nunca inviertas la aserción ni uses `skip`.
5. **Estructura.** Arrange / Act / Assert con comentarios; aserciones con mensaje cuando sean precondiciones (`'precondicion: ...'`).
6. **Sin esperas fijas.** Prohibido `waitForTimeout`. En API no hacen falta.
7. **Evidencia sin secretos.** Adjunta request y response con `evidencia(...)` y omite la contraseña (`'<omitida>'`).
8. Si falta una pieza de la fuente (nombre de una acción, status, schema) o dos fuentes se contradicen, detente y escala; no la deduzcas. Si algo es una deducción, déjalo anotado en el test.
9. Tras un fallo, corrige solo defectos del test que el verificador haya demostrado (máximo 3 intentos tras `PLAN APROBADO`).

## Clasificación de fallos (antes de tocar nada)
- `DEFECTO_DEL_TEST`: selector, dato o precondición mal armada. Se corrige en el test.
- `DISCREPANCIA_CONTRATO_PRODUCTO`: el producto incumple la spec. Va a `docs/reporte-de-bugs.md` y se declara con `test.fail`; el test no se adapta.
- `AMBIGÜEDAD_DEL_CONTRATO`: la spec no decide. Se escala a quien usa la skill.
- `BLOQUEO_DE_ENTORNO`: sitio caído, rate limit, red. No se cambia código.
- `ENTRADA_FALTANTE`: falta fuente, comando o alcance. Se escala.

## Salida
- Archivos creados o modificados y comando para ejecutarlos.
- Decisiones tomadas desde la spec, con su REQ.
- Supuestos evitados y ambigüedades escaladas.
- Entrega al verificador (`verificar-tests-api`); no declares éxito.
