# Reporte de verificación del flujo integrado

## Resultado

> **VERIFICACIÓN CON HALLAZGOS** (8/12 estática, exit code 0)

| Intento | Archivos revisados | Comando | Fuente |
|---|---|---|---|
| 1 | `tests/integrado/inscripcion-prerrequisito.spec.ts`, `tests/support/usuario.ts`, `pages/LoginPage.ts`, `pages/CatalogoPage.ts` | `npx playwright test tests/integrado` | Spec (REQ-C03, REQ-C06, REQ-A03), `docs/estrategia.md` |

> **Nota:** estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original. La rúbrica es una autoevaluación asistida, no una auditoría externa. No se modificó ningún archivo de código para escribir este reporte.

## Dato compartido

- **Qué es:** el usuario dinámico (email único) y su sesión.
- **Dónde nace:** `generarUsuario()` (`tests/integrado/inscripcion-prerrequisito.spec.ts:37`, definido en `tests/support/usuario.ts:13-24`) y `registrarPorApi(page.request, usuario)` (`:38`, `POST /api/register`).
- **Dónde se consume:** la UI inicia sesión con ese email en `:41` (`login.iniciarSesion(usuario.email, usuario.password)`) y la inscripción por API viaja por la misma sesión del navegador (`page.request`, `:48`).
- Ningún valor del dato está literal en el archivo. El único literal es el `courseId` del catálogo (`CURSO_BLOQUEADO`, `:20`).

## Rúbrica estática (skill `verificar-test-integrado`)

### 1. Fidelidad a la spec — 2/3
- El 403 esperado cita REQ-C06/A03 (`:35, :52`) y la UI cita REQ-C03 (`:13`). El `abandonar` de la limpieza es una acción de progreso que `tests/api/sondeo.spec.ts:66` declara confirmada en payloads.
- Hallazgo: `POST /api/logout` (`:31`) no aparece en `docs/` ni en `tests/api/`; solo se usa aquí, y su respuesta no se comprueba. No pude verificar en el repo que la spec lo defina.

### 2. Integración real — 2/3
- El dato nace en la capa API y lo consume la UI (ver arriba), y el comentario de cabecera lo declara (`:8-10`).
- Hallazgo: las aserciones de UI posteriores a la acción de API (`:55-56`) repiten la comprobación previa (`:45`) sobre la misma página sin recargarla ni volver a navegar. Si la API cambiara el estado, la UI ya renderizada no lo mostraría, así que esa verificación no detecta el efecto de la acción de API. Hoy es coherente con lo declarado (el test no pretende probar el reflejo), pero es una integración débil.

### 3. Reutilización y convenciones — 2/3
- Reutiliza `LoginPage` y `CatalogoPage` (`:2-3`) con locators semánticos del Page Object, usa `baseURL` y rutas relativas; sin `waitForTimeout`.
- Hallazgo: no reutiliza los helpers de `tests/support/api.ts` (`inscribir`, `progreso`, `evidencia`): llama a `page.request.post` directo en `:28, :48`. `inscribir` acepta un `APIRequestContext`, así que podría recibir `page.request` y adjuntar evidencia.
- Hallazgo: hay dos generadores de usuarios (`generarUsuario` en `usuario.ts` y `nuevoUsuario` en `api.ts:14`) con dominios de email distintos.

### 4. Alcance, limpieza y seguridad — 2/3
- Declara qué demuestra y qué NO (`:12-15`); sin secretos (contraseña generada, `usuario.ts:21`); aserción de la spec sin invertir y `test.fail` con BUG-02 existente (`:35`).
- Hallazgo: la limpieza no deshace el estado, solo lo mueve: `abandonar` deja el curso en "Abandonado" (`:27-29`) y el usuario creado queda registrado (no hay endpoint de borrado documentado). El residuo no está declarado en el archivo.
- Hallazgo: `test.fail` cubre todo el test; si falla una aserción de UI (`:45, :55-56`) o el login, el resultado también sería "fallo esperado" y se leería como BUG-02. La aserción blanda (`:52`) se justifica en el comentario, pero no impide el enmascaramiento.

Total: 8/12.

## Evidencia ejecutable

```text
Comando: npx playwright test tests/integrado
Exit code: 0
Pasados: 1 (fallo esperado con test.fail, BUG-02)
Fallidos: 0
Duración: 4.5 s
```

El test aparece como fallido internamente (`x`) y cuenta como pasado porque el producto sigue respondiendo 200 en lugar de 403. En la pasada de `npm run test:ci` volvió a pasar.

## Hallazgos y clasificación

| # | Hallazgo | Clasificación | Recomendación |
|---|---|---|---|
| 1 | La UI posterior a la API no se refresca; verificación débil | `DEFECTO_DEL_TEST` | Recargar o volver a abrir el catálogo antes de las aserciones de `:55-56` |
| 2 | `/api/logout` sin respaldo en `docs/` ni en `tests/api/` | `AMBIGÜEDAD_DEL_CONTRATO` | Citar la spec o comprobar su status |
| 3 | No reutiliza los helpers de `tests/support/api.ts`; dos generadores de usuario | `DEFECTO_DEL_TEST` (menor) | Pasar `page.request` a `inscribir` y unificar los generadores |
| 4 | Residuo no declarado (usuario y curso Abandonado) | `DEFECTO_DEL_TEST` (documentación) | Declararlo en la cabecera del test |
| 5 | `test.fail` puede enmascarar otros fallos | `DEFECTO_DEL_TEST` (riesgo) | Aislar la precondición de UI en un test de control en verde |

No se corrigió nada en el código; esto es solo el reporte.

## Alcance de esta verificación
- Demuestra que la API acepta (200) una inscripción que la spec exige rechazar (BUG-02), que el catálogo muestra el curso como bloqueado en el estado inicial y que el flujo corre de punta a punta con un usuario nuevo.
- No demuestra el reflejo de la inscripción por API en la UI, "Mi progreso", el cupo, otros prerrequisitos, otros navegadores ni la sesión tras recargar (BUG-01).

## Residuo en el servidor
- Un usuario registrado por ejecución (sin forma de borrarlo documentada) y, si la API inscribió, el curso `playwright-cero` en estado Abandonado para ese usuario. No afecta a la siguiente ejecución porque cada una crea un usuario nuevo.

## Estado del workflow
Pendiente de decisión humana (la palabra ACEPTADO es exclusiva de esa decisión).
