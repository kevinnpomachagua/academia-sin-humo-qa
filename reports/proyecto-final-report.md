# Reporte de verificación del proyecto final

## Resultado

> **AUDITORÍA SUPERADA — ACEPTADO** (15 de 15 ítems cumple, 0 parciales, 0 no cumple, de 15 ítems de la Definición de terminado)

| Intento | Alcance | Fuente de los criterios | Modo |
|---|---|---|---|
| 1 | Repo completo (`README.md`, `docs/`, `pages/`, `tests/`, `.github/workflows/`, `reports/`, `.agents/skills/`) | Secciones "Definición de terminado" y "Cinco reglas que no se negocian" de `S16_Proyecto-Final-Consigna.md.txt` | Solo lectura (sin modificar código) |

> **Nota:** estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original. Es una autoevaluación asistida, no una auditoría externa; los ítems que dependen de mi revisión personal quedan marcados como pendientes.

## Checklist

### Criterio

| Ítem | Estado | Evidencia |
|---|---|---|
| `docs/estrategia.md` con riesgo principal, matriz y alcance | Cumple | `docs/estrategia.md:7` (Riesgo principal), `:23` (Flujos evaluados, con Frecuencia, Valor/Riesgo, ¿Automatizo?, Capa y Por qué) y `:41` (Alcance elegido). Respaldo: skill `generar-estrategia-de-pruebas` |
| Está escrito qué NO demuestra la suite | Cumple | `docs/estrategia.md:50` ("Lo que NO voy a poder demostrar"), `README.md:13` (Qué NO prueba) |
| Casos con al menos dos técnicas y cada caso cita su REQ | Cumple | `docs/casos-de-prueba.md:17-25`: 6 técnicas (valores límite 26, partición 27, tabla de decisión 16, transición de estados 15, temporal 6, autorización 5). `grep -c "^### CP-"` = 95; cada caso lleva `REQ que valida` |
| El juez evaluó los casos y quedó registrado qué se aceptó y rechazó | Cumple | `docs/casos-de-prueba.md:1234` (Paso por el juez, 9/12) y `:1258` (tabla de aceptado y rechazado); `reports/casos-de-prueba-report.md` (8/12) y segunda ronda (`docs/casos-de-prueba.md:1282`, 95 casos) |

### Código

| Ítem | Estado | Evidencia |
|---|---|---|
| Un flujo E2E completo con Page Object y locators semánticos | Cumple | `tests/e2e/inscripcion.spec.ts`, `pages/`; `reports/test-e2e-report.md` (16/18, 6 de 6 en tres repeticiones). Respaldo del proceso: `generar-test-e2e` y `generar-pom` |
| Al menos cuatro tests de API con status respaldado por la spec | Cumple | `tests/api/enroll.spec.ts` (6 tests: camino feliz, sin `courseId`, curso inexistente, body malformado, 403 por prerrequisito, cupo); `reports/tests-api-report.md` (8/12, con hallazgos) |
| Flujo integrado con el dato dinámico compartido identificado | Cumple | `tests/integrado/inscripcion-prerrequisito.spec.ts:8-10` (usuario y sesión), `:12-14` (qué demuestra cada capa y qué no); `reports/test-integrado-report.md` (8/12) |
| Sin `waitForTimeout`, `skip` ni aserciones debilitadas | Cumple | `grep -rnE "waitForTimeout|networkidle|\.skip|fixme|\.only"` en `tests/api`, `tests/e2e`, `tests/integrado`, `pages`, `tests/support`: sin resultados. 10 tests con `test.fail` que conservan la aserción de la spec. Observación en hallazgo 5 |
| La suite corre tres veces seguidas con el mismo resultado | Cumple | `reports/estabilidad-suite-report.md`: 3 pasadas de `npm run test:ci`, 18 passed, exit code 0 (24.7 s, 23.8 s, 23.7 s) |

### Automatización

| Ítem | Estado | Evidencia |
|---|---|---|
| El workflow existe, fue revisado línea por línea y produjo un run mío | Cumple | Existe: `.github/workflows/playwright.yml:1-53`. Revisado línea por línea por el autor (2026-11-14). Runs verificados: run n.º 3 (`43453247198`, commit `a805806`) y run n.º 4 (`43658160740`, commit `6e0ca89`), ambos en `success` |
| El artifact `playwright-report` se descargó y se revisó | Cumple | Descargado y revisado en local por el autor (run n.º 3, `43453247198`): 18 tests esperados, 0 fallos, 0 flaky, 0 skipped, solo Chromium, 26,3 s |
| No hay secretos versionados | Cumple | `git ls-files` sin `.env`, secretos ni tokens; el workflow sin `secrets.*` (`playwright.yml:3-4`); `grep` de `ash_session`, `set-cookie` y contraseñas en `docs/evidencia/api` y `docs/*.md` sin resultados. Las contraseñas literales de `tests/evidencia/ejecucion-casos.spec.ts` son datos de cuentas nuevas de prueba, no credenciales reales; la cuenta demo se lee del sitio en tiempo de ejecución (`tests/evidencia/cuenta-demo.ts`) |

### Entrega

| Ítem | Estado | Evidencia |
|---|---|---|
| `docs/reporte-de-bugs.md` con al menos un hallazgo real y evidencia | Cumple | 16 bugs (`grep -c "^### BUG-"`), 16 con severidad (2 Alta, 8 Media, 6 Baja) y campo de evidencia (17 coincidencias de `**Evidencia`); BUG-02 (REQ-C06) con test que falla. Skill de apoyo: `reportar-bug` |
| El README cuenta qué se probó, qué no y qué se encontró | Cumple | `README.md:7`, `:13` y `:53` |
| El historial de commits muestra el trabajo | Cumple | `git log --oneline | wc -l` = 36 commits incrementales con prefijos `[ADD]` (19) y `[MOD]` (17). Run n.º 4 del CI (`43658160740`, commit `6e0ca89`) en `success` |

Ítems de la consigna que respaldan las skills sin reporte propio: `generar-estrategia-de-pruebas` (estrategia y alcance declarado), `generar-test-e2e` (E2E con Page Object) y `ejecutar-casos-con-evidencia` (casos medidos con `tests/evidencia/`, capturas y JSON en `docs/evidencia/`, 13 capturas y 8 respuestas de API).

## Coherencia de cifras

| Cifra | Comando o fuente | Real | README | Estrategia | Reporte de bugs | Casos |
|---|---|---|---|---|---|---|
| Tests listados | `npx playwright test --list` | 122 en 11 archivos | 122 (`:48`) | no la cita | no la cita | no la cita |
| Tests del CI | `npm run test:ci` | 18 en 6 archivos | 18 | no la cita | no la cita | no la cita |
| Tests con `test.fail` en el CI | grep + lectura | 10 (12 llamadas; 2 son controles de BUG-04) | 10 | no la cita | no la cita | no la cita |
| Bugs | `grep -c "^### BUG-"` | 16 | 16 | 16 | 16 | 16 |
| Severidad | campos de severidad | 2 Alta, 8 Media, 6 Baja | 2, 8, 6 | no la cita | 2, 8, 6 | no la cita |
| Casos | `grep -c "^### CP-"` | 95 | 95 | no la cita | no la cita | 95 |
| PASA y FALLA | `docs/casos-de-prueba.md:15` | 58 y 37 | 58 y 37 | no la cita | no la cita | 58 y 37 |
| Capturas y JSON de API | `ls docs/evidencia` | 13 y 8 | 13 y 8 | no la cita | no la cita | no la cita |

Sin diferencias entre documentos. Dato menor: `grep -c "REQ que valida"` da 94 porque una línea corresponde a la plantilla del encabezado (`docs/casos-de-prueba.md:76` es el primer caso).

## Cinco reglas

| Regla | Estado | Evidencia |
|---|---|---|
| 1. La spec manda | Cumple | Los `test.fail` citan el BUG y mantienen la aserción de la spec (por ejemplo `tests/api/enroll.spec.ts:62-67`, 403 esperado) |
| 2. Un test que falla puede ser la mejor entrega | Cumple | BUG-02 en el integrado (`inscripcion-prerrequisito.spec.ts:35`) y en el reporte de bugs |
| 3. La IA propone, la persona valida | Parcial | Todos los reportes dejan la decisión pendiente y la tabla del juez muestra aceptados y rechazados; la validación real es mía y no es verificable desde el repo |
| 4. Alcance declarado | Cumple | `README.md:13-21`, `docs/estrategia.md:50-55`, `playwright.yml:39-43` |
| 5. Sin secretos en el repo | Cumple | Ver ítem de secretos |

## Hallazgos

| # | Hallazgo | Clasificación | Recomendación |
|---|---|---|---|
| 1 | El README enlaza el run `43323701242` y esta auditoría usó `43326559658` (commit posterior, también `success`, con artifact vigente) | Observación | Decidir qué run queda como referencia y que el README y el artifact revisado coincidan |
| 2 | No hay constancia en el repo de la revisión línea por línea del workflow ni de la descarga del artifact del run elegido | `ENTRADA_FALTANTE` | Confirmarlo y dejarlo escrito si se quiere defender en la entrevista |
| 3 | Cambios sin commitear (skills, reportes, README) | Observación | Commit en pasos separados al decidir |
| 4 | `docs/casos-de-prueba.md` y `reports/casos-de-prueba-report.md`: alineación de la segunda ronda del juez y CP-24 corregido a FALLA | Resuelto | Se documentó la segunda ronda (95 casos), se aceptó CP-24 a FALLA (BUG-12) y se resolvieron las observaciones con decisión registrada |
| 5 | `tests/e2e/ui-sondeo.spec.ts:48` captura el resultado de un `expect.poll` con tope de 1 s para medir el bloqueo; es una medición acotada y no una aserción debilitada (la aserción final está en `:54`), pero conviene que se lea como tal | Observación | Mantener el comentario de `:47` |
| 6 | Hallazgos abiertos de los reportes de API, integrado, CI y casos siguen sin resolver | Varios | Ver cada reporte |

No se modificó ningún archivo del código.

## Pendiente de mi parte
- [x] **Completado (2026-11-14):** revisé línea por línea el workflow y descargué y revisé el artifact `playwright-report` del run n.º 3 (`43453247198`).
- [x] **Completado (2026-11-14):** evalué las observaciones de cada reporte y registré las decisiones técnicas (segunda ronda de casos de prueba resuelta).
- [x] **Completado (2026-11-14):** aceptación final de la entrega (gate humano exclusivo).

## Estado
**ACEPTADO** (Validación humana completada el 2026-11-14; 15 de 15 ítems de la Definición de terminado cumplidos).

> Actualización posterior (2026-11-14): CP-24 se corrigió a FALLA (BUG-12) por decisión mía; los casos pasan a 56 PASA / 37 FALLA; las cifras de este reporte corresponden a la versión evaluada.

Actualización posterior (2026-11-14): descargué el artifact `playwright-report` del run n.º 3 (`43453247198`, commit `a805806`) y se verificó su contenido: 18 tests, los 18 esperados, 0 inesperados, 0 flaky y 0 omitidos, solo Chromium, 26,3 s. El README cita ahora ese run como referencia. Las referencias de este reporte a los runs `43323701242` y `43326559658` corresponden a la verificación de la fecha en que se hizo; ambos están en `success`.

**Mis confirmaciones (2026-11-14):** informé que revisé el workflow línea por línea, así que el ítem "El workflow existe, fue revisado línea por línea y produjo un run mío" pasa a cumple (confirmación mía, no verificable desde el repo). El ítem "El artifact `playwright-report` se descargó y se revisó" pasa a cumple con el run n.º 3 (`43453247198`): descargué el artifact y se verificó su contenido (18 de 18 esperados). Con esto la auditoría quedó en 14 ítems cumple y 1 parcial: "El historial de commits muestra el trabajo". Ese último ítem se cerró al subir los commits el 2026-11-14: el historial tiene 36 commits incrementales, con prefijos `[ADD]` (19) y `[MOD]` (17), y el run n.º 4 del CI (`43658160740`, commit `6e0ca89`) terminó en `success`. La auditoría queda en 15 de 15 ítems cumple.
