---
name: generar-casos-de-prueba
description: Diseña o amplía los casos de docs/casos-de-prueba.md desde la especificación, con el formato, las técnicas por zona, la numeración y la trazabilidad del proyecto, sin inventar resultados.
---

# Skill: diseñar casos de prueba del proyecto

## Cuándo usarla
Al añadir, corregir o reordenar casos en `docs/casos-de-prueba.md`. Para evaluar el conjunto usa después `verificar-casos-de-prueba`.

## Entradas
- Especificación: https://playground.calidadsinhumo.com/documentacion (fuente de verdad, REQ numerados).
- `docs/casos-de-prueba.md` (formato y numeración vigentes) y `docs/reporte-de-bugs.md`.
- La zona o el REQ que se quiere cubrir.

## Reglas de diseño
1. **Desde la spec, no desde la pantalla.** Cada caso valida uno o más REQ y el resultado esperado sale del texto literal de la spec. Solo `/api/enroll` figura en la spec; los demás endpoints se observaron con DevTools y la nota de la cabecera del documento lo declara.
2. **Técnica según la zona:**
   - REQ-R02, R04, R05 (rangos): valores límite, el límite y el límite ± 1 (1/2/50/51, 7/8/64/65, 15/16/99/100).
   - REQ-C02 (prerrequisito × cupo): tabla de decisión con las 4 combinaciones, cada una con su resultado esperado.
   - REQ-P02 (estados): transición de estados, válidas y al menos una prohibida.
   - REQ-L03 (bloqueo): comportamiento temporal (5 intentos, bloqueo, timer, rehabilitación en cero).
   - REQ-S01, S02 (sesión): autorización y estado.
   - Zonas sin técnica asignada por la consigna (formato de email, campos vacíos, tipo de archivo): partición de equivalencia. Es una decisión del proyecto y debe seguir declarada como tal.
3. **Un caso, una intención.** Si dos resultados comparten precondición y datos, pueden ir en un solo caso, indicándolo en "Datos de prueba".
4. **Datos dinámicos.** Emails únicos por ejecución; nada de credenciales reales; la cuenta de prueba del sitio se lee en tiempo de ejecución (`tests/evidencia/cuenta-demo.ts`).

## Formato exacto de cada caso
```markdown
### CP-NN · [título en una línea]
- **Técnica:** valores límite | partición | tabla de decisión | transición de estados | temporal | autorización
- **REQ que valida:** REQ-xxx
- **Precondición:**
- **Datos de prueba:**
- **Pasos:**
  1. ...
- **Resultado esperado (según la spec):**
- **Resultado obtenido:** (lo observado, con el comando o test que lo midió y la evidencia)
- **Estado:** PASA | FALLA → posible bug (BUG-XX) | NO EJECUTADO (motivo)
```

## Numeración y trazabilidad
- Usa el siguiente número libre; no renumeres ni reutilices (comprueba el mayor con `grep "^### CP-"`).
- Todo `FALLA` enlaza un `BUG-XX` que exista en `docs/reporte-de-bugs.md`; si no existe, créalo con el formato de la consigna (REQ violado con cita textual, esperado, real, pasos, evidencia, severidad y capa) y actualiza los conteos donde aparezcan (`README.md`, `docs/estrategia.md`).
- Las capturas van en `docs/evidencia/` con nombre `cpNN-descripcion.png`.

## Al añadir o cambiar casos, actualiza siempre
1. El **Resumen** (total, PASA, FALLA, NO EJECUTADO y la tabla por técnica).
2. La **matriz REQ → CP** (casos y cobertura: Cubierto o Parcial con su motivo).
3. La **fecha de ejecución** de la cabecera y la tabla de equivalencias de capturas si aplica.
4. Comprueba que los totales cuadran con un recuento real de `### CP-` y de `- **Estado:**`.

## Prohibido
- Inventar un "Resultado obtenido" o dar por ejecutado lo que no se ejecutó.
- Modificar un caso o su esperado para que el producto "pase". La spec manda y la discrepancia es un hallazgo.
- Crear cuentas o escribir credenciales a mano en el sitio: las ejecuciones se hacen con los tests de `tests/evidencia/` (miden, no afirman).
- Usar `waitForTimeout` en los scripts de ejecución.

## Gate humano
Propone los casos nuevos (título, REQ, técnica y datos) y espera la aprobación antes de editar el documento. Tras editarlo, sugiere pasar `verificar-casos-de-prueba`. El criterio final lo decide quien usa la skill.
