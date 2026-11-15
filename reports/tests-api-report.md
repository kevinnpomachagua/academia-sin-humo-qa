# Reporte de verificación del proyecto API

## Resultado

> **VERIFICACIÓN CON HALLAZGOS** (8/12 estática, exit code 0)

| Intento | Archivos revisados | Comando | Fuente |
|---|---|---|---|
| 1 | `tests/api/enroll.spec.ts`, `tests/api/sondeo.spec.ts`, `tests/support/api.ts` | `npx playwright test tests/api` | Spec (`/documentacion`), `docs/estrategia.md`, `docs/reporte-de-bugs.md` |

> **Nota:** estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original. La rúbrica es una autoevaluación asistida, no una auditoría externa. No se modificó ningún archivo de código para escribir este reporte.

## Rúbrica estática (skill `verificar-tests-api`)

### 1. Fidelidad a la spec — 2/3
- Los status esperados llevan su REQ en el título: 200/400/404 en `tests/api/enroll.spec.ts:17,28,37` y 403 en `:61` (REQ-C06/A03).
- El caso sin definición en la spec (body malformado) está declarado como robustez y usa un rango, no un status exacto: `enroll.spec.ts:45-58`.
- Hallazgo: las acciones `comenzar` y `completar` de BUG-06 son una deducción declarada, no una fuente verificada: `sondeo.spec.ts:65-66` ("se deducen de los botones de la UI").
- Hallazgo: BUG-04 y el control de 7 caracteres comprueban `>= 400` y `< 500` (`sondeo.spec.ts:34-35, 43-44`), no el status exacto, porque la spec no lo fija en lo que consta en el repo.

### 2. Integración con el proyecto — 2/3
- Rutas relativas con `baseURL` de `playwright.config.ts`; helpers compartidos `usuarioConSesion`, `inscribir`, `progreso`, `cupo` en `tests/support/api.ts:50-77`.
- `retries: 0` en `playwright.config.ts`; la carpeta está incluida en `npm run test:ci` (`package.json`). Sin `waitForTimeout`, `skip` ni `only` en `tests/api`, `tests/support` ni `pages` (búsqueda con grep).
- Hallazgo: `enroll.spec.ts:8-9` usa constantes con nombre para los cursos, pero `sondeo.spec.ts:52,56,68,73,77` repite el literal `'fundamentos'`.
- Hallazgo menor: `tests/support/api.ts:24` mantiene un `eslint-disable` y el proyecto no tiene ESLint instalado.

### 3. Calidad de las comprobaciones — 2/3
- Cada test afirma lo que exige la spec y ninguno invierte la aserción. Los 6 `test.fail(true, 'BUG-XX...')` de `tests/api` citan un bug existente: BUG-02 (`enroll.spec.ts:62`), BUG-03 (`:71`), BUG-01 (`sondeo.spec.ts:10`), BUG-04 (`:39`), BUG-05 (`:49`), BUG-06 (`:63`).
- Las precondiciones llevan mensaje (`'precondicion: ...'`, p. ej. `sondeo.spec.ts:52,54,71,74`), y el alcance está declarado en los comentarios de cabecera.
- Hallazgo: un `test.fail` no distingue qué aserción falló. En BUG-06, BUG-05 y BUG-03 una precondición rota (por ejemplo, un nombre de acción incorrecto en `sondeo.spec.ts:70-71`) también daría "fallo esperado" y se leería como bug confirmado. Mitigación existente: BUG-06 tiene el mensaje "revisar el nombre si falla", pero no hay un control que lo detecte en el verde.
- Hallazgo: `cupo()` (`tests/support/api.ts:72-73`) hace `res.json()` sin comprobar el status del `GET /api/courses`.

### 4. Seguridad y datos — 2/3
- Sin credenciales literales: usuario y contraseña se generan por test (`api.ts:10,14-16`); la contraseña se omite en la evidencia adjunta (`api.ts:39,45`). Sin `skip` ni `only`.
- Hallazgo: `evidencia()` adjunta `res.headers()` completos (`api.ts:31`); tras el login esas cabeceras pueden incluir `set-cookie` de la sesión del usuario desechable y quedan en el reporte HTML y en el artifact del CI. No lo comprobé empíricamente (los tests pasados no conservan adjuntos en el último run); es un riesgo de exposición baja (sesión de un usuario desechable en un sitio de práctica), pero conviene filtrar esa cabecera.

Total: 8/12.

## Evidencia ejecutable

```text
Comando: npx playwright test tests/api
Exit code: 0
Pasados: 12 (6 verdes + 6 fallos esperados con test.fail)
Fallidos: 0
Duración: 4.6 s
```

Los 6 fallos esperados son BUG-01, BUG-02, BUG-03, BUG-04, BUG-05 y BUG-06. En la pasada completa de `npm run test:ci` los 12 tests de API volvieron a pasar.

## Hallazgos y clasificación

| # | Hallazgo | Clasificación | Recomendación |
|---|---|---|---|
| 1 | Acciones `comenzar` y `completar` deducidas (BUG-06) | `AMBIGÜEDAD_DEL_CONTRATO` | Confirmar el nombre de la acción en la spec o en un payload real y citar la fuente |
| 2 | `test.fail` puede enmascarar una precondición rota | `DEFECTO_DEL_TEST` (riesgo) | Separar precondiciones en un test de control en verde o verificar el mensaje del fallo |
| 3 | Status por rango en BUG-04 y robustez de `/api/enroll` | `AMBIGÜEDAD_DEL_CONTRATO` | Dejar el rango mientras la spec no fije el código; documentarlo |
| 4 | Cabeceras completas en la evidencia adjunta | `DEFECTO_DEL_TEST` (seguridad, baja) | Quitar `set-cookie` y `authorization` antes de adjuntar |
| 5 | `'fundamentos'` literal repetido en `sondeo.spec.ts` | `DEFECTO_DEL_TEST` (menor) | Usar una constante, como en `enroll.spec.ts` |
| 6 | `cupo()` sin comprobar el status | `DEFECTO_DEL_TEST` (menor) | Aserción de precondición sobre `GET /api/courses` |

No se corrigió nada en el código; esto es solo el reporte.

## Alcance de esta verificación
- Demuestra que los tests de contrato de `POST /api/enroll` y el sondeo de BUG-01, 04, 05 y 06 existen, afirman lo que exige la spec y están declarados con la convención del proyecto.
- No demuestra que los status esperados coincidan con la spec en vivo (la spec se leyó a través de los REQ citados en el repo, no se volvió a abrir el sitio), ni cubre BUG-11 y BUG-13 por API (solo están como evidencia en `tests/evidencia/`), ni otros navegadores.

## Estado del workflow
Pendiente de decisión humana (la palabra ACEPTADO es exclusiva de esa decisión).
