---
name: generar-test-integrado
description: Construye un flujo integrado UI + API en Academia sin Humo (la API prepara, la UI verifica lo visible, la API limpia) reutilizando los Page Objects y los helpers existentes, con el dato compartido nacido en la ejecución.
---

# Skill: generar un flujo integrado UI + API

## Entradas
- Objetivo del escenario y REQ de la spec que lo respalda.
- Archivo objetivo (`tests/integrado/<nombre>.spec.ts`) y comando (por defecto `npx playwright test tests/integrado`).
- Dato dinámico compartido, nombrado en el plan.
- Reporte anterior de `reports/`, si existe.

## Gate humano
1. Inventario sin modificar: `playwright.config.ts`, `pages/`, `tests/support/` (`api.ts`, `usuario.ts`), `tests/api/`, `docs/estrategia.md`.
2. Presenta `PLAN_PENDIENTE`: escenario paso a paso, dato compartido y en qué línea nacerá, endpoints usados con su cita de la spec, Page Objects y helpers que reutiliza, qué NO demuestra y el residuo que dejará en el servidor.
3. No escribas nada hasta recibir `PLAN APROBADO`. Al terminar entrega al verificador; la aceptación final es de quien usa la skill.

## Reglas de construcción
1. **Cuatro partes visibles y comentadas**, en orden: preparación por API, dato compartido, verificación por UI, limpieza por API.
2. **El dato compartido nace en la ejecución** (usuario con `generarUsuario()`, ids devueltos por la API). Nunca literal: ni emails, ids, cookies, tokens ni fechas.
3. **Reutiliza.** Page Objects de `pages/` sin crear una capa de UI paralela ni duplicar locators; helpers de `tests/support/`. Los helpers aceptan un `APIRequestContext`: para compartir sesión con el navegador pásales `page.request`, no la fixture `request` (ver comentario en `tests/support/usuario.ts`).
4. **La spec es la fuente de verdad.** El status esperado sale de la spec. Si el producto la contradice, declara `test.fail(true, 'BUG-XX: ...')`, mantén la aserción de la spec y no la inviertas. Una aserción blanda (`expect.soft`) solo se justifica para que la UI se verifique igual; anótalo.
5. **La UI se verifica después de la acción de API y sobre estado refrescado** (recarga o nueva navegación) cuando el objetivo sea probar que la UI refleja el servidor. Comprueba comportamiento visible con locators semánticos del Page Object.
6. **Limpieza solo si la spec la respalda.** No inventes `DELETE` ni endpoints. Limpia lo que puedas justificar (acciones de progreso válidas, cierre de sesión) y declara el resto como residuo conocido (por ejemplo, el usuario creado).
7. Sin `waitForTimeout`, sin `skip`, sin secretos. Cada test deja constancia de qué NO demuestra.
8. Máximo 3 intentos tras `PLAN APROBADO`; corrige solo defectos del test demostrados por el verificador.

## Clasificación de fallos
`DEFECTO_DEL_TEST` (se corrige) · `DISCREPANCIA_CONTRATO_PRODUCTO` (se declara con `test.fail` y va a `docs/reporte-de-bugs.md`) · `AMBIGÜEDAD_DEL_CONTRATO` (se escala) · `BLOQUEO_DE_ENTORNO` (no se cambia código) · `ENTRADA_FALTANTE` (se escala).

## Salida
- Archivos creados o modificados.
- Dato compartido y línea donde nace y donde se consume.
- Page Objects y helpers reutilizados; decisiones con su REQ.
- Residuo que queda en el servidor y alcance no demostrado.
- Entrega al verificador (`verificar-test-integrado`); no declares éxito.
