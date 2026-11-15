---
name: verificar-test-e2e
description: Revisa en solo lectura los tests E2E de Academia sin Humo (tests/e2e/inscripcion.spec.ts y pages/) con una rúbrica puntuada, ejecuta el comando objetivo y guarda un reporte en reports/ sin modificar ningún archivo del código.
---

# Skill: verificar tests E2E

## Entradas
- Archivos objetivo: `tests/e2e/inscripcion.spec.ts`, `pages/LoginPage.ts`, `pages/CatalogoPage.ts` y `tests/support/usuario.ts`.
- Fuente: spec (`/documentacion`), `docs/estrategia.md`, `docs/reporte-de-bugs.md`.
- Comando objetivo (por defecto `npx playwright test tests/e2e/inscripcion.spec.ts --repeat-each=3`).
- Número de intento y, si existe, reporte anterior.

## Reglas
- Solo lectura sobre tests, Page Objects, soporte, configuración y aplicación. El único archivo que escribe es el reporte en `reports/`.
- No suavices un hallazgo ni inventes un resultado. Cita `archivo:línea` en cada evidencia.
- No uses la palabra `ACEPTADO`: es exclusiva de la decisión de quien usa la skill.
- Si algo no se puede comprobar con lo que hay en el repo, escribe "no verificado" y di qué falta.

## Rúbrica estática (0 a 3 por criterio, total 18)
1. **Locators.** Semánticos (`getByRole`, `getByLabel`); `getByTestId` solo sin rol accesible y comentado; sin CSS ni XPath frágiles.
2. **Aserciones.** Visibles y con auto-espera; los `expect` viven en el test, no en `pages/`; cada test afirma lo que exige el REQ citado.
3. **Sin esperas fijas.** Cero `waitForTimeout`, `networkidle` y esperas por tiempo (búsqueda con grep, resultado citado).
4. **Datos dinámicos.** Usuario nuevo por test desde `tests/support/usuario.ts`; sin emails, contraseñas, cookies ni tokens literales.
5. **`test.fail` correcto.** Cada uno cita un BUG de `docs/reporte-de-bugs.md`, es la primera línea, y la aserción sigue exigiendo la spec (no invertida); sin `skip`, `fixme` ni `only`.
6. **Reproducibilidad.** Se corre tres veces seguidas con el mismo resultado; no depende de la sesión tras recarga (BUG-01); `retries: 0` en la configuración.

Solo `18/18` es `CALIDAD COMPLETA`. Un criterio con 0 por un defecto grave (aserción invertida, secreto real) invalida el resultado aunque el total sea alto.

## Verificación ejecutable
1. Ejecuta exactamente el comando objetivo.
2. Registra comando, exit code, pasados, fallidos y duración. Aclara que un test con `test.fail` figura como pasado mientras el producto incumple.
3. Ante un fallo clasifícalo: `DEFECTO_DEL_TEST`, `DISCREPANCIA_CONTRATO_PRODUCTO`, `AMBIGÜEDAD_DEL_CONTRATO`, `BLOQUEO_DE_ENTORNO` o `ENTRADA_FALTANTE`.

## Reporte (`reports/test-e2e-report.md`)
1. `# Reporte de verificación del test E2E` y `## Resultado` con bloque `VERIFICACIÓN SUPERADA` o `VERIFICACIÓN CON HALLAZGOS`.
2. Tabla breve de entradas, `## Rúbrica` con puntaje y evidencia `archivo:línea`, `## Evidencia ejecutable`.
3. `## Hallazgos` (sin corregir, con clasificación y recomendación), `## Alcance` y `## Estado` (decisión humana pendiente).
4. Nota: "Estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original".
