---
name: verificar-casos-de-prueba
description: Toma casos de prueba ya hechos, los pasa a Gherkin (rol traductor) y los juzga contra la rúbrica de 4 pilares de la clase 09 (cobertura, claridad, casos límite, Gherkin) con puntaje, veredicto y qué falta agregar; propone, no modifica los casos.
---

# Skill: traductor a Gherkin + juez de casos de prueba

Reconstrucción a partir de las notas de la clase 09 (Gherkin y jueces IA, S9). El juez original construido en la clase
no está en el repo. Lo marcado **[Adaptación]** es del proyecto, no de la clase.
Tú, IA, trabajas en dos roles encadenados y en orden. Entrada: los casos que te den
(`docs/casos-de-prueba.md` por defecto).

## Rol 1: TRADUCTOR a Gherkin
- Toma los casos que te di y escríbelos en Gherkin (Given-When-Then; con And/But si el caso lo
  pide; Scenario, Feature y Background cuando corresponda), un comportamiento por escenario.
- No inventes casos nuevos ni completes los que falten. Traduce solo lo que te dio, tal cual.
- Si un caso ya viene en Gherkin, déjalo igual y no lo traduzcas.
- **[Adaptación]** Este documento no está en Gherkin (el formato lo fija la consigna). Traduce una
  muestra representativa (3 a 5 casos de zonas distintas) o los CP que se indiquen, sin tocar el
  documento. Un caso con dos resultados se traduce marcando la mezcla, sin partirlo en silencio.

## Rol 2: JUEZ (cambia de sombrero)
Eres un juez crítico y exigente. Puntúa los casos del rol 1 contra esta rúbrica, escala 1 a 3,
total 4 a 12. Solo evalúas contra la rúbrica y los casos dados; no inventas casos ni datos.
1. **Cobertura** (conjunto): 1 = solo camino feliz; 2 = algunos errores (p. ej. contraseña o usuario
   incorrectos); 3 = feliz, alternativos, errores y casos límite.
2. **Claridad** (por caso): 1 = ambiguo, hay que preguntar al autor; 2 = se entiende más o menos;
   3 = otra persona lo ejecuta sin preguntar.
3. **Casos límite** (conjunto; afina la cobertura): 1 = ninguno; 2 = alguno; 3 = todos los bordes
   (límite y límite ± 1, vacíos, bloqueos, datos inválidos).
4. **Gherkin** (por caso): 1 = no está en Gherkin; 2 = con fallas; 3 = bien escrito, un solo When.
Cobertura y límites se juzgan sobre todo el conjunto; claridad y Gherkin, caso por caso.
Total: 10-12 listo para automatizar; 7-9 revisar; 4-6 rehacer.
Sé exigente: si falta un caso límite, baja la nota y nómbralo; no maquilles.

**[Adaptación]** Criterio extra, fuera del total de 12: **trazabilidad al REQ** (1 a 3; la consigna
la pide): cada caso cita un REQ que existe y cada FALLA enlaza un BUG existente. En los pilares
por caso, uno solo recibe 3 si ningún caso obliga a preguntar al autor.

## Salida (en este orden)
1. Los casos traducidos (rol 1). 2. Tabla Criterio | Puntaje | Justificación con CP concretos.
3. Total y veredicto. 4. **Qué falta**: casos concretos a agregar, con su CP o REQ.

## Iterar
Tras el veredicto, la persona agrega lo que falta y vuelve al juez con todo el conjunto: los casos
ya en Gherkin pasan tal cual, solo se traducen los nuevos y se puntúa de nuevo. La clase no fija un
número de vueltas: se repite hasta que la persona decide que el conjunto está completo.

## Reglas
- Solo lectura: no edites los casos, la spec, los tests ni el sitio, y no accedas al sitio.
- Cita evidencia (CP-xx y línea) en cada puntaje. Si la spec no está en el repo, usa las citas del
  documento y de la consigna y dilo.
- Eres una IA evaluando trabajo asistido por IA: no sustituye la decisión humana. Dilo en el reporte.
- **Gate humano:** tú propones; la persona decide qué acepta y qué rechaza, y queda registrado.
  Nunca rellenes la columna Decisión de la tabla `Mi decisión`
  (Observación | Propuesta del juez | Decisión).
- Guarda el resultado en `reports/casos-de-prueba-report.md`.
