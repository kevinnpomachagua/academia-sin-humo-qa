---
name: generar-estrategia-de-pruebas
description: Redacta o actualiza docs/estrategia.md de Academia sin Humo con la estructura de la consigna (riesgo principal, matriz de flujos y alcance con lo que no se demuestra), respaldando el riesgo con evidencia reproducida y dejando la matriz como criterio de quien usa la skill.
---

# Skill: generar la estrategia de pruebas

## Entradas
- Consigna: `D:\AntigravityProject\Web\TesteandoYa _QA_ IA\3_Material-Curso\_fuentes_md\S16_Proyecto-Final-Consigna.md.txt` (sección de estrategia, antes de escribir código).
- Spec: `https://playground.calidadsinhumo.com/documentacion` (REQ-xx).
- Evidencia ya reproducida: `docs/reporte-de-bugs.md`, `docs/evidencia/`, `docs/casos-de-prueba.md`.
- Estado real de la suite: `npx playwright test --list` y `npm run test:ci`.

## Gate humano
1. Inventario sin modificar nada: lee la consigna, `docs/estrategia.md` actual (si existe) y los conteos reales de tests, casos y bugs.
2. Presenta `PLAN_PENDIENTE`: riesgo candidato con su evidencia, flujos propuestos con frecuencia y valor/riesgo, alcance y qué no se demuestra.
3. Quien usa la skill decide la matriz y el alcance. No escribas nada hasta recibir `PLAN APROBADO`. La aceptación final es de quien la usa.

## Estructura obligatoria de `docs/estrategia.md`
1. `## Riesgo principal`: dos frases, con `Riesgo:` y `A quién afecta y cómo:`.
2. `## Flujos evaluados`: tabla con columnas `Flujo | Frecuencia | Valor/Riesgo | ¿Automatizo? | Capa (UI/API/integrado) | Por qué`. Se admiten columnas extra (REQ, Estado) sin quitar las seis.
3. `## Alcance elegido`: `Lo que SÍ entra:`, `Lo que NO entra, y por qué:` y `Lo que NO voy a poder demostrar con estas pruebas:`.

## Reglas
1. **El riesgo se respalda con evidencia reproducida**, no con hipótesis. Cada afirmación cita un BUG-XX o un test y se puede repetir con un comando que aparece en el documento. Si no está reproducido, se escribe como hipótesis o se omite.
2. **La matriz es criterio de quien usa la skill.** Propón valores y razones; no decidas por quien la usa qué automatizar.
3. **Las cifras salen del repo**, no de la memoria: tests (`--list`), casos (`grep -c "^### CP-"`), bugs (`grep -c "^### BUG-"`). Si cambian, actualiza el documento o avisa.
4. **Alcance parcial declarado.** Lo que queda fuera de la regresión se dice con su motivo; `Lo que NO voy a poder demostrar` nunca queda vacío.
5. Nunca digas que un verde implica un producto libre de defectos.
6. No inventes resultados ni marques como hecho lo que no tenga archivo o test que lo respalde.

## Salida
- Archivo modificado (`docs/estrategia.md`) y qué cifras se contrastaron y con qué comando.
- Decisiones que quedaron en manos de quien usa la skill.
- Entrega a `verificar-proyecto-final`; no declares éxito.
