---
name: verificar-tests-api
description: Revisa los tests de API de Academia sin Humo contra la spec con una rúbrica puntuada, ejecuta el comando objetivo y guarda un reporte en reports/ sin modificar ningún archivo del código.
---

# Skill: verificar tests de API

## Entradas
- Archivos objetivo (`tests/api/*.spec.ts` y `tests/support/api.ts`).
- Fuente: spec (`/documentacion`), `docs/estrategia.md`, `docs/reporte-de-bugs.md`.
- Comando objetivo exacto (por defecto `npx playwright test tests/api`).
- Número de intento y, si existe, reporte anterior.

## Reglas
- Solo lectura sobre tests, soporte, configuración, spec y aplicación. El único archivo que escribe es el reporte en `reports/`.
- No suavices un hallazgo ni inventes un resultado. Cita `archivo:línea` en cada evidencia.
- No uses la palabra `ACEPTADO`: es exclusiva de la decisión de quien usa la skill.
- Si una afirmación no se puede comprobar con lo que hay en el repo, escribe "no verificado" y di qué falta.

## Rúbrica estática (0 a 3 por criterio, total 12)
1. **Fidelidad a la spec.** Status, rutas, acciones y schema salen de la spec o de evidencia documentada; los casos sin definición en la spec están marcados como tales (rangos, robustez). Las deducciones declaradas bajan el puntaje si afectan una precondición.
2. **Integración con el proyecto.** Usa `baseURL` y rutas relativas, helpers de `tests/support/api.ts`, `retries: 0`, ruta incluida en `npm run test:ci`; sin `waitForTimeout`.
3. **Calidad de las comprobaciones.** Cada test afirma lo que exige la spec; aserciones con mensaje en precondiciones; ninguna aserción invertida; todo `test.fail(true, 'BUG-XX...')` cita un bug de `docs/reporte-de-bugs.md`; el alcance (qué no demuestra) está declarado.
4. **Seguridad y datos.** Sin credenciales, tokens ni cookies literales; usuario nuevo por test; contraseña omitida en la evidencia adjunta; sin `skip` ni `only`.

Solo `12/12` es `CALIDAD COMPLETA`. Un criterio con 0 por un defecto grave (aserción invertida, secreto real) invalida el resultado aunque el total sea alto.

## Verificación ejecutable
1. Ejecuta exactamente el comando objetivo.
2. Registra comando, exit code, pasados, fallidos y duración real. Aclara que un test con `test.fail` figura como pasado cuando el producto sigue incumpliendo.
3. Ante un fallo clasifícalo: `DEFECTO_DEL_TEST`, `DISCREPANCIA_CONTRATO_PRODUCTO`, `AMBIGÜEDAD_DEL_CONTRATO`, `BLOQUEO_DE_ENTORNO` o `ENTRADA_FALTANTE`.

## Reporte (`reports/tests-api-report.md`)
1. `# Reporte de verificación del proyecto API` y `## Resultado` con bloque destacado `VERIFICACIÓN SUPERADA` o `VERIFICACIÓN CON HALLAZGOS`.
2. Tabla breve de entradas (archivos, comando, fuente).
3. `## Rúbrica` con puntaje y evidencia por criterio y total.
4. `## Evidencia ejecutable` con comando, exit code, pasados, fallidos y duración.
5. `## Hallazgos`: lo que no cumple, sin corregirlo, con clasificación y recomendación.
6. `## Alcance`: qué demuestra y qué no.
7. `## Estado`: decisión humana pendiente.
8. Nota: "Estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original".
