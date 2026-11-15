---
name: reportar-bug
description: Redacta o actualiza un hallazgo en docs/reporte-de-bugs.md con el formato de la consigna, evidencia reproducible y severidad justificada, y lo vincula con el caso de prueba y con el test que lo declara.
---

# Skill: reportar un bug del proyecto

## Cuándo usarla
Cuando un caso de prueba o un test contradice la especificación (`/documentacion`) y hay que registrar el hallazgo. No sirve para tickets de Mantis del trabajo: ese formato es otro y lo cubre la skill `mantis-bt-ticket`.

## Principio
La spec manda. Si el producto se comporta distinto de un REQ, hay un bug: no es "el test está mal". El bug se reporta con evidencia y el test no se modifica para que pase.

## Entradas
- El REQ violado (cita textual de la spec), el caso de prueba (`CP-NN`) o test que lo detectó.
- La evidencia real: response completo, log, captura o test que falla. Nada reconstruido de memoria.

## Formato exacto (uno por bug, numeración correlativa BUG-NN)
```markdown
### BUG-NN · [Título en una línea]
- **REQ violado:** REQ-xxx — "[cita textual de la spec]"
- **Comportamiento esperado:**
- **Comportamiento real:**
- **Pasos para reproducir:**
  1. ...
- **Evidencia:** (test o caso que lo reproduce, response, captura en docs/evidencia/)
- **Severidad y por qué:** Alta | Media | Baja. [razón concreta]
- **Capa donde se detecta:** UI | API | integrado
```

## Severidad (criterio aplicado en el reporte actual)
- **Alta:** rompe la autenticación o permite saltarse la regla de negocio central (inscripción sin prerrequisito, sesión no reconocida).
- **Media:** rompe la integridad de datos o de estados (estados prohibidos, certificados duplicados, cupo, paginación, reglas de sesión o de subida de archivos).
- **Baja:** incumple un límite o formato documentado sin comprometer datos ni otros flujos.
La consigna solo pide "severidad y por qué": esta escala es la del proyecto; si cambia, hay que reflejarlo en todo el reporte.

## Pasos
1. Reproduce y confirma el bug al menos dos veces con datos distintos (los usuarios se generan en cada test).
2. Busca si ya existe (`grep -n "REQ-xxx" docs/reporte-de-bugs.md`); no dupliques.
3. Redacta la entrada con el formato anterior y añade su fila a la tabla de la cabecera (ID, título, REQ, severidad, capa).
4. Enlaza el hallazgo: el `CP-NN` que falla pasa a `FALLA → posible bug (BUG-NN)` en `docs/casos-de-prueba.md`, y el test que lo reproduce se declara con `test.fail(true, 'BUG-NN: ...')` afirmando lo que exige la spec (nunca se invierte la aserción).
5. Actualiza los conteos que aparezcan en `README.md` y `docs/estrategia.md` (total de bugs y severidades), y el Resumen y la matriz de `docs/casos-de-prueba.md` si cambió el estado de algún caso.
6. Comprueba con un recuento real de `### BUG-` que la tabla y el número citado cuadran.

## Prohibido
- Reportar sin evidencia reproducible o con valores inventados.
- Inventar una cita de la spec: se copia literal de `/documentacion` (si el dato no figura en la spec, se dice, como con `/api/auth/me`).
- Cambiar la severidad para que el reporte "se vea mejor".
- Marcar un bug como corregido sin que el test con `test.fail` se ponga rojo y se retire la marca.

## Gate humano
Propone la entrada (título, REQ, severidad y razón) y espera la aprobación antes de editar el reporte. La severidad final la decide quien usa la skill.
