---
name: verificar-test-integrado
description: Revisa un flujo integrado UI + API de Academia sin Humo contra la spec con una rúbrica puntuada, ejecuta el comando objetivo y guarda un reporte en reports/ sin modificar ningún archivo del código.
---

# Skill: verificar un flujo integrado UI + API

## Entradas
- Archivo objetivo (`tests/integrado/*.spec.ts`), Page Objects (`pages/`) y soporte (`tests/support/`).
- Fuente: spec (`/documentacion`), `docs/estrategia.md`, `docs/reporte-de-bugs.md`.
- Dato compartido declarado en el plan, comando objetivo (por defecto `npx playwright test tests/integrado`), número de intento.

## Reglas
- Solo lectura sobre tests, soporte, páginas, configuración y aplicación. El único archivo que escribe es el reporte en `reports/`.
- No suavices un hallazgo ni inventes un resultado. Cita `archivo:línea`.
- No uses la palabra `ACEPTADO`: es exclusiva de la decisión de quien usa la skill.
- Lo que no se pueda comprobar en el repo se marca "no verificado".

## Rúbrica estática (0 a 3 por criterio, total 12)
1. **Fidelidad a la spec.** Endpoints, status, acciones y pantallas salen de la spec o de evidencia del repo; las deducciones están declaradas.
2. **Integración real.** Existe un dato dinámico que nace en la preparación por API y se consume en la verificación por UI. Si el dato es literal, es 0/3. Además, la aserción de UI debe poder detectar el efecto de la acción de API (estado refrescado), no repetir una comprobación previa sin cambios.
3. **Reutilización y convenciones.** Usa los Page Objects y los helpers de `tests/support/`, la `baseURL`, locators semánticos, sin `waitForTimeout` y con `retries: 0`; sin generadores de datos duplicados.
4. **Alcance, limpieza y seguridad.** Declara qué NO demuestra; limpieza ejecutada y su residuo declarado; sin secretos; ninguna aserción invertida; `test.fail` con un `BUG-XX` existente en `docs/reporte-de-bugs.md`.

Solo `12/12` es `CALIDAD COMPLETA`. Señala también si un `test.fail` puede ocultar un fallo distinto al bug declarado.

## Verificación ejecutable
1. Ejecuta exactamente el comando objetivo.
2. Registra comando, exit code, pasados, fallidos y duración real; aclara que un `test.fail` figura como pasado mientras el producto incumple.
3. Clasifica cualquier fallo: `DEFECTO_DEL_TEST`, `DISCREPANCIA_CONTRATO_PRODUCTO`, `AMBIGÜEDAD_DEL_CONTRATO`, `BLOQUEO_DE_ENTORNO` o `ENTRADA_FALTANTE`.
4. Comprueba la limpieza y declara el residuo (qué queda, dónde, si afecta a la próxima ejecución).

## Reporte (`reports/test-integrado-report.md`)
1. `# Reporte de verificación del flujo integrado` y `## Resultado` con bloque `VERIFICACIÓN SUPERADA` o `VERIFICACIÓN CON HALLAZGOS`.
2. Tabla breve de entradas.
3. `## Dato compartido`: qué es, dónde nace y dónde se consume.
4. `## Rúbrica` con puntaje y evidencia por criterio y total.
5. `## Evidencia ejecutable`, `## Hallazgos` (sin corregir), `## Alcance` (qué demuestra y qué no), `## Residuo en el servidor`.
6. `## Estado`: decisión humana pendiente.
7. Nota: "Estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original".
