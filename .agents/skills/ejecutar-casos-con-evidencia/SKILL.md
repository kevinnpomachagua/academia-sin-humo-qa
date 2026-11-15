---
name: ejecutar-casos-con-evidencia
description: Describe y guía cómo se ejecutan y miden los casos de docs/casos-de-prueba.md con los scripts de tests/evidencia/ (miden, no afirman), cómo se obtienen las capturas con el defecto resaltado en docs/evidencia/ y qué se documenta en cada caso.
---

# Skill: ejecutar casos con evidencia

## Cuándo usarla
Para medir un caso contra la spec y dejar evidencia antes de reportar un bug. Los scripts viven en `tests/evidencia/` y quedan fuera del CI (`npm run test:ci` no los incluye): se lanzan a demanda.

## Entradas
- Caso (`CP-xx`) de `docs/casos-de-prueba.md` y su REQ en la spec.
- Scripts: `tests/evidencia/ejecucion-casos.spec.ts` (casos por API y por UI), `ejecucion-reserva-d01-d03.spec.ts` (reserva), `capturas.spec.ts` (capturas), `evidencia-api.spec.ts` (JSON de `docs/evidencia/api/`) y `cuenta-demo.ts`.

## Gate humano
1. Presenta `PLAN_PENDIENTE`: casos a ejecutar, comando, qué archivos de `docs/evidencia/` se regenerarán y qué casos usan la cuenta compartida o esperas largas.
2. No ejecutes ni escribas nada hasta recibir `PLAN APROBADO`. Los resultados los interpreta quien usa la skill.

## Cómo se ejecuta
- Comando por archivo, a demanda: `npx playwright test tests/evidencia/ejecucion-casos.spec.ts --reporter=line`.
- Cada caso imprime una línea `CPxx|estado|resumen`, con estado `PASA`, `FALLA`, `NO EJECUTADO` o `ERROR`. El script **mide y no afirma**: termina en verde aunque el producto incumpla la spec, porque el incumplimiento es un hallazgo y no un fallo del script.
- Los casos con login bloqueado deben ir al final y respetar el desbloqueo (`expect.poll`); no uses `waitForTimeout`.

## Reglas
1. **La spec manda.** El estado `PASA` o `FALLA` sale de comparar con el REQ, no con lo que el producto hizo antes.
2. **Sin cuentas a mano ni credenciales escritas.** Usuarios dinámicos por llamada; la cuenta demo se lee en tiempo de ejecución del recuadro de `/login` (`cuenta-demo.ts`) y nunca se guarda en archivos, logs ni evidencia (contraseña `<omitida>`).
3. **Sin `waitForTimeout`.** Se espera por condición (`waitForResponse`, `expect.poll`, doble `requestAnimationFrame`).
4. **Capturas.** `capturas.spec.ts` resalta el defecto con un recuadro rojo y una etiqueta, y guarda en `docs/evidencia/<cpNN-descripcion>.png`.
5. **Fuera del CI.** No muevas estos scripts a `tests/api`, `tests/e2e` ni `tests/integrado`.
6. No cambies el resultado esperado para que un caso pase.

## Qué documentar en el caso
Resultado obtenido real, estado (`PASA` | `FALLA → posible bug`), enlace al BUG-XX si falla, ruta de la captura o JSON de evidencia, fecha y comando usado. Si el caso no se pudo ejecutar, di por qué.

## Salida
Líneas `CPxx|estado|resumen` obtenidas, archivos de `docs/evidencia/` nuevos o cambiados y casos pendientes de actualizar. Para pasar un fallo al reporte, usa `reportar-bug`.
