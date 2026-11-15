# Reporte de estabilidad de la suite

## Resultado

> **ESTABILIDAD CONFIRMADA** (3 de 3 pasadas de `npm run test:ci` con 18 passed y exit code 0; sin anti-patrones en el código)

| Intento | Carpetas revisadas | Comando | Modo |
|---|---|---|---|
| 1 | `tests/api`, `tests/e2e`, `tests/integrado`, `pages`, `tests/support`, `playwright.config.ts` | `npm run test:ci` x3 (`playwright test tests/api tests/e2e tests/integrado`) | Solo lectura (sin modificar código) |

> **Nota:** estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original. Es una autoevaluación asistida, no una auditoría externa.

## Evidencia ejecutable

Tres pasadas seguidas, sin cambiar nada entre ellas, con `--reporter=line` (el 14 de noviembre de 2026, contra el sitio público):

| Pasada | Exit code | Pasados | Fallidos | Flaky | Omitidos | Duración |
|---|---|---|---|---|---|---|
| 1 | 0 | 18 | 0 | 0 | 0 | 24.7 s |
| 2 | 0 | 18 | 0 | 0 | 0 | 23.8 s |
| 3 | 0 | 18 | 0 | 0 | 0 | 23.7 s |

- Mismo recuento y los mismos 18 tests (`[1/18]` a `[18/18]` en cada pasada); el reporter no mostró líneas de flaky, omitidos ni fallidos.
- De los 18 pasados, 8 son verdes y 10 son fallos esperados con `test.fail`: 10 declaraciones en `tests/api/enroll.spec.ts:62` y `:71`, `tests/api/sondeo.spec.ts:10`, `:39`, `:49` y `:63`, `tests/e2e/inscripcion.spec.ts:40`, `tests/e2e/ui-sondeo.spec.ts:11` y `:31`, `tests/integrado/inscripcion-prerrequisito.spec.ts:35`. Cubren BUG-01 a BUG-06, BUG-09 y BUG-10. Si el producto corrige alguno, ese test se pondrá rojo a propósito.
- `npx playwright test --list` informa 120 tests en 11 archivos: 18 del CI y 102 de `tests/evidencia/` (fuera del CI).

## Anti-patrones

Comando: `grep -rnE "<patrón>" tests/api tests/e2e tests/integrado pages tests/support playwright.config.ts`.

| Patrón | Resultado |
|---|---|
| `waitForTimeout`, `networkidle` | Sin resultados |
| `.skip`, `test.fixme`, `.only` | Sin resultados |
| `retries` | Solo `playwright.config.ts:10`: `retries: 0` |
| Aserciones débiles (`toBeTruthy`, `expect(true)`) | Sin resultados |
| `test.fail` sin cita de BUG | Ninguno: las 10 declaraciones de arriba citan un `BUG-XX` |
| Aserciones invertidas | No se detectaron. Revisión manual de los 10 `test.fail`: cada test conserva la aserción que exige la spec (ejemplo: 403 en `enroll.spec.ts`, cupo menos 1 en `inscripcion.spec.ts:51`) |

## Hallazgos

| # | Hallazgo | Clasificación | Recomendación |
|---|---|---|---|
| 1 | Toda la suite depende del sitio público: una caída o un límite de peticiones lo pondría en rojo sin defecto del código | `BLOQUEO_DE_ENTORNO` (riesgo) | Declararlo como riesgo conocido; no reintentar ni omitir tests |
| 2 | Un `test.fail` cubre todo el cuerpo del test, así que un fallo anterior a la aserción de interés también contaría como "esperado" | `DEFECTO_DEL_TEST` (menor) | Revisar el trace cuando un `test.fail` cambie de comportamiento; mantener la aserción de la spec |
| 3 | El recuento de pasados incluye 10 fallos esperados: "18 passed" no equivale a "18 comprobaciones de la spec cumplidas" | Observación | Mantenerlo explicado en el README (ya lo está) |

No se modificó ningún archivo del código. No hay ninguna recomendación de reintentos, `skip` ni borrado de tests.

## Alcance de esta verificación
- Demuestra que, en este entorno y en tres corridas consecutivas, la suite del CI da el mismo resultado y que el código no contiene los anti-patrones buscados.
- No demuestra estabilidad bajo carga, en otros navegadores, a otras horas ni con el sitio degradado. Tres pasadas son una muestra pequeña; no sustituyen un historial de runs de CI.

## Estado
Pendiente de decisión humana (la palabra ACEPTADO es exclusiva de esa decisión).
