# Reporte del Juez de casos de prueba

## Segunda pasada del juez sobre el conjunto ampliado (2026-11-14)

> **REVISAR** (8/12 · banda 7-9 "revisar" de la clase · sin cambio frente a la primera pasada, 8/12 · trazabilidad al REQ 2/3, fuera del total)

### Nota de alcance (léela antes de usar el puntaje)

- Es la iteración que enseñó la clase 09: se agregaron los casos aceptados, el conjunto completo volvió al juez y lo ya traducido se reutiliza. Aplica la misma skill, `.agents/skills/verificar-casos-de-prueba/SKILL.md`.
- Es una **reconstrucción** hecha a partir de las notas de la clase 09. **El juez original que construí en la clase no está en el repo.** Lo ejecutó una IA (un agente de Claude): es una IA evaluando trabajo asistido por IA, una segunda lectura con rúbrica que **no sustituye una validación humana**.
- No accedí al sitio ni volví a ejecutar ningún caso. Los esperados se contrastan con las citas del propio documento y con la copia fechada de la spec, `docs/especificacion-req.md` (2026-11-11), que es una transcripción hecha por mí; no pude compararla con el sitio vivo.
- Casos modificados: **ninguno**. Documento evaluado: `docs/casos-de-prueba.md`, 95 casos, 58 PASA y 37 FALLA. Cifras verificadas con un script (conteo de `### CP-` y de Estado, totales por técnica, matriz frente al campo "REQ que valida", FALLA frente a `docs/reporte-de-bugs.md`). Los números de línea son los de esta versión.

### Veredicto

**8/12, revisar** (cobertura 2, claridad 2, casos límite 2, Gherkin 2). Hubo mejoras reales y comprobables, pero ninguna alcanza para subir un pilar: siguen sin probarse 10 combinaciones de transición, el último cupo, la cobertura de varios REQ es solo por API, CP-64 no permite concluir y la preparación sigue apareciendo como paso en 19 casos. El conjunto no está listo para automatizar tal cual; está más cerca que en la primera pasada.

### Tabla de pilares y comparación con la pasada anterior

| Pilar | Alcance | Primera pasada | Segunda pasada | Evidencia |
|---|---|---|---|---|
| Cobertura | conjunto | 2 | 2 | Los 36 REQ de la spec tienen caso en la matriz (L35-70), y REQ-L01 ya prueba contraseña ausente (CP-22) y email ausente (CP-94, L1211). Siguen 9 REQ en "Parcial" (R01, L01, C02, C05, C06, P01, P02, P05, A02), 10 de 25 combinaciones estado × acción sin probar (declaradas en L13, no probadas), REQ-P01 sin caso que lo cite (L52) y registro, login e inscripción solo por API |
| Claridad | por caso | 2 | 2 | 93 de 95 casos se ejecutan sin preguntar al autor. CP-36 a CP-40 ya dicen "éxito (2xx, inferido)" (L504 y siguientes). Quedan dos: CP-64 (L846-856) termina en "estado resultante=?" y el propio caso admite que no demuestra que Abandonado siga igual; CP-46 (L625) usa un criterio de observación que no es de la spec. Por la regla de la skill (un solo caso que obligue a preguntar impide el 3) no sube, aunque está cerca |
| Casos límite | conjunto | 2 | 2 | Completos: nombre 1/2/50/51 (CP-01 a CP-04), contraseña 7/8/64/65 (CP-05 a CP-08), edad 15/16/99/100 (CP-09 a CP-12), inicio de reserva ayer/hoy/+30/+31/+32 (CP-50, CP-51, CP-79, CP-80, CP-93), fin = inicio y fin = inicio + 1 (CP-52, CP-81), 2 097 152 y 2 097 153 bytes (CP-59, CP-89) y ahora 2 097 151 (CP-95, L1222), más bloqueo y timer (CP-23, CP-77, CP-78). Falta el último cupo libre (declarado como inalcanzable por BUG-03, L13) y CP-95 pasa sin que el límite superior esté en juego (BUG-15), por lo que no discrimina nada |
| Gherkin (aptitud de traducción) | por caso | 2 | 2 | La preparación de CP-27, CP-28, CP-67, CP-83 y CP-85 ya está en la Precondición (L393, L405, L1103). Siguen CP-52, CP-53 y CP-58 con dos resultados en un caso (declarado; CP-52 en L696-706) y la preparación repetida como primer paso en 19 casos (CP-31, CP-36 a CP-46, CP-60 a CP-66), que además ya la dicen en su Precondición |
| **Total de la clase** | | **8/12** | **8/12** | Banda "revisar" (7-9) en ambas pasadas |
| Trazabilidad al REQ (adaptación, fuera del total) | por caso | 2 | 2 | Los 95 casos tienen campo REQ y los 37 FALLA enlazan un BUG que existe en `docs/reporte-de-bugs.md` (16 BUG distintos, BUG-01 a BUG-16, verificado); la matriz coincide con el campo de cada caso en 35 de 36 REQ y todos los REQ citados existen en la copia de la spec. CP-46 ya no cuenta para REQ-S01 (L57) pero su campo dice "Ninguno" y sigue dentro de los 95 y los 37; REQ-P01 sigue sin caso que lo cite (la matriz le asigna 14 casos que citan REQ-P02 y REQ-P03) |

Nota sobre comparabilidad: el total repite el 8/12, pero no por inercia. Cada pilar sigue en 2 por faltas que se nombran abajo, no por redondeo; si se cerraran las de arriba (CP-64 y CP-46 en claridad; los 19 pasos de preparación y los tres casos de dos resultados en Gherkin) esos dos pilares podrían llegar a 3. Cobertura y límites dependen de la spec y de BUG-03, y ahí no hay una corrección rápida.

### Lo que mejoró (con evidencia)

- **CP-24 corregido a FALLA (BUG-12)** (L352-362): ya no contradice a CP-78 ni al Resumen; el recuento es 58 PASA y 37 FALLA, coherente con los totales por técnica (26 + 27 + 16 + 15 + 6 + 5 = 95).
- **Esperados inferidos declarados** en CP-36 a CP-40 y en la nota de endpoints de la cabecera (L8): "éxito (2xx, inferido)".
- **Casos nuevos que cierran faltas reales:** CP-94 (login sin email, 400, L1211) y CP-95 (2 097 151 bytes, L1222).
- **Copia fechada de la spec** en `docs/especificacion-req.md` y enlazada en la cabecera (L4).
- **Orden de ejecución y aislamiento documentados** (L12): modo serial, usuario nuevo por caso, cuenta compartida solo en CP-25, CP-26, CP-49, CP-86 y CP-87, espera real tras el bloqueo.
- **Límites declarados donde la skill los pide** (L13): las 10 combinaciones de transición sin probar con su lista exacta, el último cupo por BUG-03, la cobertura por API de REQ-R01, L01, C02, C05 y C06, y que los códigos de `/api/progress` son observados. Comprobé que esas cuatro declaraciones están escritas; no comprobé que los motivos sean ciertos (ver el final).
- **Etiquetas y Gherkin:** "mensaje devuelto" en CP-42, CP-45, CP-62 y CP-63, y la preparación movida a la Precondición en los cinco casos de la tabla de decisión.
- **CP-64** ahora admite en su resultado la inconsistencia con CP-42 y que el estado no se leyó. Es honesto, pero no lo vuelve concluyente.

### Lo que sigue faltando (nombrado, top 5)

1. **CP-64 (L846-856) no permite concluir.** Se queda en PASA con "estado resultante=?" y 404 "No estás inscrito": no demuestra que Abandonado siga terminal (REQ-P02) y cuenta en las 58 PASA. Es la falta más concreta que queda.
2. **10 de las 25 combinaciones de transición siguen sin probar** (REQ-P02, L13): declararlas no las prueba, y de las 10 probadas con rechazo esperado 4 incumplen la regla (CP-42, CP-45, CP-62 y CP-63), de modo que las otras 10 probablemente también. La cobertura de REQ-P02 y REQ-P03 sigue siendo parcial.
3. **El último cupo libre (REQ-C04, REQ-C05) no tiene caso.** El motivo declarado (el cupo no baja al inscribirse, BUG-03) explica por qué no se puede crear ese estado, pero no demuestra que ningún curso del catálogo lo tenga ya.
4. **Preparación como paso y dos resultados por caso (Gherkin).** 19 casos repiten la preparación como paso 1 aunque ya está en su Precondición (CP-31, CP-36 a CP-46, CP-60 a CP-66), y CP-52, CP-53 y CP-58 mezclan dos comportamientos, lo que impide el "un solo When". Una traducción limpia exige separarlos o quitar el paso duplicado.
5. **CP-46 y REQ-P01 (trazabilidad).** CP-46 no cita ningún REQ y su criterio no viene de la spec, pero sigue dentro de los 95 casos y de los 37 FALLA; REQ-P01 no lo cita ningún caso. Además, CP-95 es un control que pasa por BUG-15 y no prueba el borde por sí mismo.

Otras observaciones menores que siguen en pie: registro, login e inscripción solo por API (declarado); CP-24, CP-76, CP-77, CP-78 y CP-87 exigen una espera de 35 s y no se ejecutan de forma independiente; CP-28, CP-30 y CP-67 dependen del estado de los cupos del sitio compartido (api-testing en 20/20).

### Casos traducidos a Gherkin

- **Reutilizados sin cambios:** las cinco traducciones de la primera pasada (CP-04, CP-29, CP-42, CP-52 y CP-77, más abajo en la sección "Casos traducidos a Gherkin (muestra del rol 1)") siguen vigentes; no se reescribieron.
- **Nuevos, traducidos tal cual:** CP-94 y CP-95. Datos y esperados son los del documento, no los obtenidos; no se añadió ni se quitó ningún caso. CP-95 tiene dos pasos (elegir el archivo y pulsar "Subir CV", y leer el resultado), pero una sola acción, y traduce limpio. Las dos traducciones son mías y no modifican el documento.

```gherkin
# language: es
Característica: Inicio de sesión (REQ-L01)
  # CP-94 · partición
  Escenario: Login sin email se rechaza
    Dado que no hay sesión iniciada
    Cuando envío POST /api/login con solo la contraseña "Lima#2026qa" y sin la clave email
    Entonces el login se rechaza con un 4xx
    Y el mensaje indica que email y contraseña son obligatorios

Característica: Subida de CV (REQ-U03)
  # CP-95 · valores límite
  Escenario: Un PDF de 2 097 151 bytes se acepta
    Dado que estoy en /perfil
    Y un archivo CV_Lucia_Mamani.pdf con cabecera %PDF-1.4 y 2 097 151 bytes, generado en memoria
    Cuando lo elijo y pulso "Subir CV"
    Entonces el archivo se acepta, porque el máximo es 2 MB inclusive
```

### Mi decisión

El juez propone; yo decido. Solo figuran las observaciones nuevas o que siguen abiertas. La columna "Decisión" queda vacía a propósito: no la relleno yo.

| Observación | Propuesta del juez | Decisión |
|---|---|---|
| 1. CP-64 sigue sin comprobar el estado resultante (sigue abierta: aceptada parcial en la primera pasada) | Volver a ejecutarlo leyendo `GET /api/progress` tras el 404, o rotularlo "no concluyente" y sacarlo de las 58 PASA | |
| 2. 10 de 25 combinaciones de transición sin probar (sigue abierta: rechazada con límite declarado) | Añadir al menos las que más informan: `comenzar` desde En progreso, `completar` desde Completado, `abandonar` desde Abandonado y `certificar` desde Abandonado; o aceptar el 2 en cobertura | |
| 3. Último cupo libre sin caso (sigue abierta) | Revisar `GET /api/courses` por si algún curso ya tiene exactamente 1 cupo libre; si ninguno, dejarlo como límite declarado | |
| 4. Preparación repetida como paso 1 en 19 casos (nueva) | Quitar el paso duplicado y dejar la preparación solo en la Precondición (CP-31, CP-36 a CP-46, CP-60 a CP-66) | |
| 5. CP-52, CP-53 y CP-58 con dos resultados (sigue abierta: mantenida por mí) | Mantener el motivo anotado, o separar cada uno en dos casos para conseguir un solo When | |
| 6. CP-46 sin REQ dentro de los 95 y los 37 FALLA (sigue abierta) | Mover CP-46 a una nota de observaciones fuera del recuento y recalcular totales, o mantenerlo rotulado como informativo | |
| 7. REQ-P01 sin caso que lo cite (sigue abierta: "Parcial (indirecto)") | Citar REQ-P01 en el campo REQ de los casos de estados (p. ej. CP-36) para que el campo coincida con la matriz | |
| 8. CP-95 pasa por BUG-15 sin que el borde esté en juego (nueva) | Anotarlo como control inferior (ya lo dice el caso) y repetirlo cuando BUG-15 se corrija, para que el límite superior se mida | |

### Lo que no pude confirmar

- Que los motivos de las declaraciones sean ciertos con el sitio vivo (que el último cupo no sea alcanzable, que los códigos de `/api/progress` sean los observados, que `tests/e2e/inscripcion.spec.ts` cubra la inscripción por UI): no ejecuté nada ni accedí al sitio.
- Que la copia de la spec coincida con el sitio vivo: es una transcripción hecha por mí.
- Que CP-94 y CP-95 se ejecutaron el 2026-11-14 como dice el documento: tomo el resultado como está registrado.

---

## Evaluación con el juez reconstruido según la clase (2026-11-14)

> **REVISAR** (8/12 · banda 7-9 "revisar" de la clase · trazabilidad al REQ 2/3, fuera del total)

### Nota de alcance (léela antes de usar el puntaje)

- Esta es una **reconstrucción** hecha a partir de las notas de la clase 09 (Gherkin y jueces IA, rúbrica de 4 pilares, 29/06/2026). **El juez original que construí en la clase no está en el repo.** La skill actual, `.agents/skills/verificar-casos-de-prueba/SKILL.md`, sigue la estructura enseñada: un traductor a Gherkin y un juez crítico y exigente, encadenados.
- Lo ejecutó una IA (un agente de Claude): es una IA evaluando trabajo asistido por IA. Es una segunda lectura con rúbrica y **no sustituye la decisión humana**: la columna "Decisión" la completo yo.
- No accedí al sitio ni volví a ejecutar ningún caso. Los esperados se contrastan solo con las citas que hace el propio documento ("la spec dice…") y con la consigna: la spec completa no está en el repo.
- Casos modificados: **ninguno**. Documento evaluado: `docs/casos-de-prueba.md`, 93 casos, 56 PASA y 37 FALLA (recuento verificado con un script; coincide con el Resumen y con los totales por técnica).
- Qué viene de la clase y qué es adaptación: la rúbrica, la escala 1 a 3, las bandas 10-12 / 7-9 / 4-6 y la forma de la salida son de la clase. Son adaptaciones del proyecto: traducir solo una muestra, la trazabilidad al REQ (la pide la consigna) y la regla de que un pilar por caso solo recibe 3 si ningún caso obliga a preguntar al autor.

### Veredicto

**8/12, revisar** (cobertura 2, claridad 2, casos límite 2, Gherkin 2). El conjunto es sólido en los valores límite de registro, la tabla de decisión y los estados, pero no está listo para automatizar tal cual: faltan casos concretos y hay casos con esperados inferidos o resultados que no permiten concluir.

### Puntaje por pilar

| Pilar | Alcance | Puntaje | Evidencia |
|---|---|---|---|
| Cobertura | conjunto | 2 | Los 36 REQ tienen caso (matriz L31-68) y cada zona de la consigna usa su técnica. Pero hay 9 REQ marcados "Parcial", 10 de las 25 combinaciones estado × acción sin probar (REQ-P02), REQ-P01 sin ningún caso propio (L50) y REQ-L01 sin email ausente (CP-22, L326). Registro, login e inscripción solo se ejercitan por API (CP-17 a CP-19, CP-27 a CP-35) |
| Claridad | por caso | 2 | 86 casos con 3: pasos reproducibles y esperado verificable (p. ej. CP-01 a CP-12, CP-29, CP-78). 7 casos con 2: CP-36 a CP-40 piden "200" de `/api/progress` rotulado "según la spec" aunque el encabezado (L8) declara inferidos esos códigos; CP-46 es una observación fuera de la spec (L628); CP-64 termina en "estado resultante=?" (L855) y no permite concluir que Abandonado sea terminal. Ninguno en 1 |
| Casos límite | conjunto | 2 | Completos: nombre 1/2/50/51 (CP-01 a CP-04), contraseña 7/8/64/65 (CP-05 a CP-08), edad 15/16/99/100 (CP-09 a CP-12), inicio de reserva ayer/hoy/+30/+31/+32 (CP-50, CP-51, CP-79, CP-80, CP-93), fin = inicio y fin = inicio + 1 (CP-52, CP-81), 2 097 152 y 2 097 153 bytes (CP-59, CP-89), bloqueo y timer (CP-23, CP-77, CP-78). Faltan el último cupo libre, 2 097 151 bytes y el login sin email (hallazgos 5 a 7) |
| Gherkin (aptitud de traducción) | por caso | 2 | El documento no está en Gherkin (lo fija la consigna), así que se evalúa si traduce limpio: 85 de 93 casos tienen precondición, una sola acción y un esperado. CP-52, CP-53 y CP-58 llevan dos resultados en un caso (lo declaran) y CP-27, CP-28, CP-67, CP-83 y CP-85 ponen la preparación en los Pasos y no en la Precondición |
| **Total de la clase** | | **8/12** | Banda "revisar" (7-9) |
| Trazabilidad al REQ (adaptación, fuera del total) | por caso | 2 | Los 93 casos citan REQ y cada uno de los 37 FALLA enlaza un BUG que existe en `docs/reporte-de-bugs.md` (16 BUG distintos, verificado). Restan: CP-46 cuenta como REQ-S01 sin estar en la spec, la matriz asigna REQ-P01 a casos que citan REQ-P02 y REQ-P03 (L50), y la spec no está versionada |

Nota sobre comparabilidad: el total coincide con el 8/12 de la evaluación anterior, pero no por inercia. La corrección de CP-24 (aceptada por mí) cerró el hallazgo más grave; siguen abiertas las faltas de cobertura y los esperados inferidos, que son las que sostienen el 2 en cada pilar. Tras esa corrección CP-24 mide lo mismo que CP-78 (L359); no se propone de nuevo, queda a mi criterio.

### Lo que falta (nombrado, sin maquillar)

| Falta | Casos afectados | Tipo |
|---|---|---|
| 10 de las 25 combinaciones estado × acción sin probar, p. ej. `comenzar` desde En progreso y desde Abandonado, `completar` desde Completado y Certificado, `abandonar` desde Abandonado, `certificar` desde Abandonado | REQ-P02, REQ-P03 (matriz L51) | Casos nuevos |
| Inscripción con exactamente 1 cupo libre (19/20 → inscrito; el siguiente → lista de espera) | REQ-C04, REQ-C05 (CP-28, CP-32) | Caso nuevo |
| PDF de 2 097 151 bytes (límite − 1) | REQ-U03 (CP-59, CP-89, CP-90) | Caso nuevo |
| Login sin email (solo contraseña) | REQ-L01 (CP-22) | Caso nuevo |
| Comprobar el estado con `GET /api/progress` tras el rechazo de `completar` desde Abandonado | CP-64 (L855) | Corrección |
| Marcar como inferido el "200" de `/api/progress` o limitarlo a "éxito (2xx)" | CP-36 a CP-40 | Corrección |
| Sacar CP-46 del recuento de REQ-S01 y dar a REQ-P01 un caso que lo cite | CP-46, REQ-P01 | Corrección |
| Copia fechada de las reglas REQ en `docs/` | todo el documento | Soporte |

Otras observaciones menores: CP-28, CP-30 y CP-67 dependen de que `api-testing` esté en 20/20 y CP-83 y CP-85 de que haya cupo (14/15 y 8/15) en el sitio compartido; CP-76, CP-77, CP-78 y CP-87 exigen esperar 35 s al caso anterior; en CP-42, CP-45, CP-62 y CP-63 un mensaje de éxito aparece rotulado `mensaje de error` (L582, 621, 829, 842).

### Casos traducidos a Gherkin (muestra del rol 1)

Cinco casos de zonas distintas, traducidos tal cual (sin añadir ni quitar casos; los datos y esperados son los del documento, no los obtenidos). El documento no se modificó. La traducción es mía y es una muestra, no el conjunto.

```gherkin
# language: es
Característica: Registro de cuenta (REQ-R02)
  # CP-04 · valores límite
  Escenario: Nombre de 51 caracteres se rechaza
    Dado que no hay sesión y el resto de campos del registro son válidos
    Cuando envío POST /api/register con un nombre de 51 caracteres
    Entonces el registro se rechaza con un error de validación en "name"

Característica: Inscripción con prerrequisito (REQ-C02, REQ-C06, REQ-A02, REQ-A03)
  # CP-29 · tabla de decisión
  Escenario: Prerrequisito pendiente y cupo disponible → Rechazado
    Dado un usuario nuevo con sesión iniciada y sin cursos inscritos
    Y que "playwright-cero" requiere "fundamentos" y tiene cupo
    Cuando envío POST /api/enroll con "playwright-cero" sin haber completado nada
    Entonces la respuesta es 403
    Y "playwright-cero" no figura como inscrito en GET /api/progress

Característica: Estados del progreso (REQ-P02, REQ-P03)
  # CP-42 · transición de estados
  Escenario: Transición prohibida Abandonado → En progreso
    Dado un usuario nuevo con sesión iniciada y "fundamentos" en estado Abandonado
    Cuando envío POST /api/progress con la acción "retomar"
    Entonces se rechaza con 4xx y un mensaje de error
    Y el estado de "fundamentos" sigue siendo Abandonado

Característica: Reserva de fechas (REQ-D03)
  # CP-52 · valores límite (el caso agrupa dos resultados: se señala, no se parte)
  Escenario: Fecha de fin igual o anterior al inicio se rechaza
    Dado que estoy en /reserva con el inicio en hoy (UTC) + 5 días
    Cuando pulso "Reservar" con fin igual al inicio
    Entonces la reserva se rechaza
    # Mezcla del caso original: repite los mismos pasos con fin = inicio − 1 día
    # y espera el mismo rechazo; la traducción limpia exigiría un segundo escenario.

Característica: Bloqueo de login (REQ-L03)
  # CP-77 · temporal
  Escenario: Durante el bloqueo un timer visual cuenta los segundos restantes
    Dado que estoy en /login sin bloqueo activo y con una cuenta inexistente
    Cuando provoco el bloqueo con intentos fallidos
    Entonces el timer arranca en 30 y desciende hasta 0
```

### Mi decisión

El juez propone; yo decido. La columna "Decisión" se completó el 2026-11-14 (ver la línea bajo la tabla). La observación sobre CP-24 no se repite: fue aceptada y corregida (queda registrada en la evaluación anterior, más abajo).

| Observación | Propuesta del juez | Decisión |
|---|---|---|
| 1. CP-36 a CP-40: "200" de `/api/progress` rotulado "según la spec" siendo inferido | Cambiar a "éxito (2xx, inferido)" o anotar el origen inferido en cada caso | Aceptada: el esperado pasa a "éxito (2xx, inferido)" y la cabecera declara que los códigos de `/api/progress` son observados, no especificados |
| 2. CP-64 termina en "estado resultante=?" y contradice a CP-42 (en CP-42 `retomar` desde Abandonado devuelve 200) | Añadir lectura de `GET /api/progress` tras el 404 y anotar la inconsistencia con CP-42 | Aceptada parcial: inconsistencia con CP-42 anotada y se declara que el estado no se leyó; sin re-ejecutar (la regla de fondo la cubren CP-42, BUG-05 y BUG-13) |
| 3. 10 de 25 combinaciones de transición sin probar | Añadir los casos que la spec cubra; si no, declarar el límite en la matriz con la lista exacta | Rechazada (límite declarado): la lista exacta de las 10 combinaciones está en la cabecera y en la matriz; REQ-P03 rechaza toda transición no listada |
| 4. CP-46 cuenta como REQ-S01 sin estar en la spec; REQ-P01 sin caso propio | Mover CP-46 a observaciones y recalcular totales; citar REQ-P01 en los casos de estados | Aceptada: CP-46 sale de la cobertura de REQ-S01 y queda como caso informativo fuera de la spec; REQ-P01 se mantiene "Parcial (indirecto)" |
| 5. REQ-L01 sin email ausente | Añadir un caso al estilo CP-73 a CP-75 | Aceptada: se añadió CP-94 (login sin email), PASA |
| 6. Falta el último cupo (1 libre) | Añadir un caso con un curso de 1 cupo libre, o declarar que no hay curso para ello | Rechazada (límite declarado): el borde no es alcanzable de forma controlada porque el cupo no baja al inscribirse (BUG-03) |
| 7. Falta 2 097 151 bytes | Añadir un caso al estilo CP-59 | Aceptada: se añadió CP-95 (2 097 151 bytes), PASA |
| 8. Spec no versionada | Guardar una copia fechada de las reglas REQ en `docs/` | Aceptada: la copia fechada `docs/especificacion-req.md` (2026-11-11) se enlaza en la cabecera de los casos y en el README |
| 9. Casos que dependen del estado del sitio compartido y de la espera de 35 s | Documentar en el encabezado el orden de ejecución y el aislamiento (cuenta propia, cupos esperados) | Aceptada: la cabecera documenta el modo serial, los usuarios nuevos por caso, la cuenta compartida leída en ejecución y la espera real tras el bloqueo |
| 10. Mensaje de éxito rotulado `mensaje de error` en CP-42, CP-45, CP-62 y CP-63 | Renombrar a "mensaje devuelto" y unificar el formato de Estado | Aceptada: "mensaje devuelto" en CP-42, CP-45, CP-62 y CP-63 y formato de Estado unificado, sin tocar resultados |
| 11. Aptitud Gherkin: CP-52, CP-53 y CP-58 con dos resultados; preparación en los Pasos de CP-27, CP-28, CP-67, CP-83 y CP-85 | Mantener lo declarado en CP-52, CP-53 y CP-58; mover la preparación a la Precondición en los demás | Aceptada parcial: CP-52, CP-53 y CP-58 se mantienen; la preparación pasó a la Precondición en CP-27, CP-28, CP-67, CP-83 y CP-85 |
| 12. Registro, login e inscripción solo por API (REQ-R01, L01, C02, C05, C06 en "Parcial") | Dejarlo declarado en la matriz y cubrirlo con los tests E2E, o añadir los casos de UI | Aceptada (se declara): la matriz indica cobertura por API y remite a `tests/e2e/inscripcion.spec.ts` para la UI; sin casos de UI |

Estas decisiones se evaluaron y resolvieron el 2026-11-14 con la asistencia de Claude como herramienta de soporte, validando y adoptando cada resolución bajo mi propio criterio técnico de QA. Tras ellas se añadieron CP-94 y CP-95 (ambos PASA): el documento queda en 95 casos, 58 PASA y 37 FALLA. Las cifras y los números de línea de este reporte corresponden a la versión de 93 casos.

Para iterar, como en la clase: agrega los casos que decidas aceptar, vuelve a pasar el conjunto completo por el juez (lo ya traducido se reutiliza) y repite hasta que el conjunto te parezca completo. La clase no fija un número de vueltas.

---

## Evaluación anterior (8/12, rúbrica más estricta)

Se conserva intacto lo que sigue. Es la evaluación del mismo día hecha con la versión anterior de la skill (regla fija: un pilar solo recibe 3 sin hallazgos altos ni medios). Su primera observación (CP-24) ya se aceptó y se corrigió; las cifras de 57 PASA y 36 FALLA corresponden a la versión evaluada entonces.

## Resultado de la evaluación

> **APROBADO CON OBSERVACIONES** (8/12 en la rúbrica de la sesión 12 · banda "requiere revisión" · trazabilidad 2/3)

| Dato | Valor |
|---|---|
| Documento evaluado | `docs/casos-de-prueba.md` (93 casos: 57 PASA, 36 FALLA; recuento verificado con script) |
| Skill aplicada | `.agents/skills/verificar-casos-de-prueba/SKILL.md` |
| Rúbrica | Sesión 12 (Gherkin y jueces IA, 29/06/2026): cobertura, claridad, casos límite, Gherkin; 1 a 3 cada uno. La trazabilidad al REQ es un criterio adicional que pide la consigna del proyecto final y va aparte del total |
| Fecha de la evaluación | 2026-11-14 |
| Casos modificados | **Ninguno.** El juez es de solo lectura |

## Nota de alcance (léela antes de usar el puntaje)

- Este juez lo ejecutó un agente de Claude: es una IA evaluando trabajo asistido por IA. Sirve como segunda lectura con rúbrica, **no** como validación humana.
- No accedí al sitio ni volví a ejecutar ningún caso. Los "resultados obtenidos" se toman como están registrados.
- La spec (`/documentacion` del producto) no está versionada en el repositorio. Verifiqué los esperados solo contra las citas literales que hace el propio documento ("la spec dice…") y contra la consigna; no pude contrastar el texto completo de la spec.
- El puntaje de 8/12 no es comparable con el 9/12 de la evaluación inicial (manual, previa a los ajustes y con otra instancia del agente). Esta vez apliqué una regla fija: un pilar solo recibe 3 si no tiene hallazgos altos ni medios. Que el número baje no significa que el trabajo empeorara: se añadieron 30 casos desde entonces.
- El juez propone; mi criterio gana. La columna "Decisión" queda vacía.

## Puntaje por pilar

| Pilar | Puntaje | Evidencia principal |
|---|---|---|
| Cobertura (conjunto) | 2 | Los 36 REQ tienen caso (matriz L31-70) y las cinco zonas de la consigna usan su técnica, pero 9 REQ quedan en cobertura parcial y hay combinaciones sin probar (hallazgos 4 y 6) |
| Claridad (por caso) | 2 | Pasos reproducibles en la mayoría; dudas reales en CP-64, en los esperados "según la spec" de CP-36 a CP-40 y en etiquetas confusas (hallazgos 2, 3 y 9) |
| Casos límite (conjunto) | 2 | Límite ± 1 completo en nombre, contraseña, edad, inicio de reserva y 2 MB; faltan el último cupo y 2 097 151 bytes (hallazgo 6) |
| Gherkin (aptitud de traducción) | 2 | El formato no es Gherkin (lo fija la consigna); se evalúa la aptitud. Cada caso tiene precondición, acción y esperado, pero CP-52, CP-53 y CP-58 mezclan dos comportamientos y varios casos ponen la preparación en los pasos (hallazgo 10) |
| **Total del curso** | **8/12** | Banda "requiere revisión" (7-9) |
| Trazabilidad al REQ (consigna, fuera del total) | 2 | Los 93 casos citan REQ y los 36 FALLA enlazan un BUG existente en `docs/reporte-de-bugs.md` (verificado); fallan CP-46, REQ-P01 y la spec no versionada (hallazgos 5 y 7) |

## Verificaciones con evidencia

- **Recuentos:** 93 casos numerados CP-01 a CP-93 sin saltos; PASA 57 y FALLA 36; los totales por técnica del Resumen (L17-25) coinciden con el conteo.
- **Matriz REQ → CP:** coincide con el campo "REQ que valida" de cada caso en 35 de 36 REQ. La excepción es REQ-P01: la matriz (L50) le asigna 14 casos que en realidad citan REQ-P02 y REQ-P03.
- **Bugs:** los 16 BUG citados por los FALLA existen en `docs/reporte-de-bugs.md`; ningún FALLA queda sin BUG. Las 12 capturas enlazadas existen en `docs/evidencia/`.
- **Técnica por zona (consigna):** valores límite R02/R04/R05 con 1/2/50/51, 7/8/64/65 y 15/16/99/100 (CP-01 a CP-12, completos); tabla de decisión C02 con las cuatro combinaciones (CP-27 a CP-30); transiciones válidas y prohibidas (CP-36 a CP-45, CP-60 a CP-64); L03 con 5 intentos, bloqueo, timer y botón en cero (CP-23, CP-24, CP-76 a CP-78, CP-87); S01 y S02 (CP-47 a CP-49, CP-86).
- **Transiciones:** 15 de las 25 combinaciones estado × acción están probadas (5 válidas y 10 prohibidas).

## Hallazgos por gravedad

### Alta

1. **CP-24 (L350) figura como PASA y contradice a CP-78 (L1017) y BUG-12.** CP-24 espera "el botón permanece deshabilitado durante todo el bloqueo" y mide 25 101 ms con el botón deshabilitado; CP-78 mide el mismo bloqueo y encuentra el botón habilitado con el timer aún en 5 s. El bloqueo es de 30 s (CP-24 dice "espera real de 30 s"), así que con el criterio escrito CP-24 debería ser FALLA (BUG-12) o su criterio debe redefinirse como "mientras el timer es mayor que 0 y no antes". `docs/reporte-de-bugs.md` (L210) incluso lo cita como caso que pasa. Un resultado mal clasificado altera el recuento 57/36.

### Media

2. **Esperados rotulados "según la spec" que son inferidos: CP-36 a CP-40 (L168, 181, 194, 207, 220).** Piden "200" de `/api/progress` (esperados en L503, 516, 529, 542 y 555), pero el encabezado (L8) reconoce que los códigos de ese endpoint son inferidos. Lo mismo vale para el nombre de las acciones. El esperado debería indicar "inferido" o limitarse a "éxito (2xx)", como ya hacen los casos de rechazo ("4xx").
3. **CP-64 (L845) es un PASA no concluyente.** Obtiene 404 "No estás inscrito" y "estado resultante=?": no se comprobó que Abandonado siga siendo terminal. Además contradice a CP-42 (L572), donde `retomar` desde Abandonado devuelve 200: el sistema trata al curso como no inscrito para `completar` y como inscrito para `retomar`. Falta leer el estado con `GET /api/progress` tras el rechazo.
4. **Combinaciones de transición sin probar (REQ-P02, matriz L51).** La matriz solo nombra "Abandonado → Certificado". Faltan 10 de las 25 combinaciones, entre ellas `comenzar` desde En progreso y desde Abandonado, `completar` desde Completado y desde Certificado, `abandonar` desde Abandonado y `certificar` desde Abandonado (las acciones son inferidas, así que parte de las 25 depende de la spec real).
5. **Trazabilidad inflada por CP-46 (L624) y REQ-P01.** CP-46 es una observación fuera de la spec (`/api/auth/me`), pero cuenta entre los 93 casos y los 36 FALLA y la matriz (L55) lo presenta como cobertura de REQ-S01; la cobertura real de S01 son CP-47, CP-48 y CP-86. Ningún caso cita REQ-P01 en su campo (matriz L50, declarado "indirecto").
6. **Cobertura y bordes que quedan abiertos.**
   - REQ-L01 (L40): solo existe el caso sin contraseña (CP-22 L326). El email ausente lo reconoce la propia matriz y se cerraría con un caso igual a CP-73 a CP-75.
   - Último cupo (REQ-C04/C05): CP-28 prueba 20/20 y CP-32 parte de 20 libres; falta inscribirse con exactamente 1 cupo libre (19/20 → inscrito, y el siguiente a lista de espera).
   - REQ-U03: CP-59, CP-89 y CP-90 prueban 2 097 152, +1 y 2,5 MB; falta 2 097 151 (límite − 1).
7. **La spec no está versionada.** El documento cita una URL y la fecha de lectura (L4); si el sitio cambia, los esperados "según la spec" dejan de ser verificables. No hay copia de las reglas REQ en `docs/`.

### Baja

8. **Casos que dependen de otro o de una cuenta compartida.** CP-24, CP-76, CP-77 y CP-78 exigen "35 s desde la prueba anterior" (L353, 995, 1008 y 1020), de modo que no se pueden ejecutar de forma independiente. CP-25, 26, 49, 86 y 87 usan la cuenta compartida del sitio; CP-87 la bloquea unos 30 s (L1128). La fecha de ejecución solo consta para los casos de reserva (L5).
9. **Etiquetas confusas en "Resultado obtenido".** En CP-42, CP-62 y CP-63 aparece `mensaje de error="Transición exitosa: …"` (L582, 829 y 842; también CP-45, L621): un mensaje de éxito rotulado como error. CP-52 usa "FALLA → BUG-16" (L705) y CP-91 un texto libre (L1185), frente al formato "FALLA → posible bug (BUG-xx)" del resto.
10. **Aptitud Gherkin.**
    - CP-52 (L695), CP-53 (L707) y CP-58 (L769) mezclan dos resultados en un caso; el documento lo declara y yo lo decidí así, pero rompe "un When por escenario".
    - En CP-27, CP-28, CP-67, CP-83 y CP-85 la preparación (inscribir y completar prerrequisitos) está en los Pasos y no en la Precondición, que dice "sin cursos inscritos".

## Qué falta, con casos concretos

| Falta | Casos afectados | Tipo |
|---|---|---|
| Reclasificar o redefinir el criterio | CP-24 | Corrección |
| Comprobar el estado tras el rechazo | CP-64 | Corrección |
| Marcar los esperados como inferidos | CP-36 a CP-40 | Corrección |
| Mover a "observaciones fuera de la spec" | CP-46 | Corrección |
| Email ausente en login | nuevo, REQ-L01 | Caso nuevo |
| Inscripción con 1 cupo libre | nuevo, REQ-C04/C05 | Caso nuevo |
| 2 097 151 bytes | nuevo, REQ-U03 | Caso nuevo |
| Transiciones restantes (10 de 25) | nuevos, REQ-P02/P03 | Casos nuevos |
| Copia de las reglas REQ en `docs/` | todo el documento | Soporte |

## Mi decisión

| Observación | Propuesta del juez | Decisión |
|---|---|---|
| 1. CP-24 PASA contradice CP-78 y BUG-12 | Reclasificar CP-24 a FALLA (BUG-12) o reescribir su esperado ("deshabilitado mientras el timer sea > 0"); ajustar el Resumen y la línea de BUG-12 | Aceptada: CP-24 corregido a FALLA (BUG-12), 2026-11-14 |
| 2. Esperados "200" de CP-36 a CP-40 rotulados "según la spec" | Cambiar a "éxito (2xx, inferido)" o anotar el origen inferido en cada caso | |
| 3. CP-64 no verifica el estado y contradice a CP-42 | Añadir lectura de `GET /api/progress` tras el 404 y anotar la inconsistencia con CP-42 | |
| 4. 10 de 25 combinaciones de transición sin probar | Añadir los casos que la spec cubra; si no, declarar el límite en la matriz con la lista exacta | |
| 5. CP-46 inflando REQ-S01; REQ-P01 sin caso propio | Mover CP-46 a observaciones y recalcular totales; citar REQ-P01 en los casos de estados | |
| 6a. REQ-L01 sin email ausente | Añadir un caso al estilo CP-73 a CP-75 | |
| 6b. Falta el último cupo (1 libre) | Añadir un caso con un curso de 1 cupo libre, o declarar que no hay curso para ello | |
| 6c. Falta 2 097 151 bytes | Añadir un caso al estilo CP-59 | |
| 7. Spec no versionada | Guardar una copia de las reglas REQ con fecha en `docs/` | |
| 8. Casos dependientes por tiempo y cuenta compartida | Documentar el orden de ejecución y el aislamiento (cuenta propia) en el encabezado | |
| 9. Etiquetas confusas en "Resultado obtenido" | Renombrar a "mensaje devuelto" y unificar el formato de Estado | |
| 10. Mezcla de comportamientos y preparación en los pasos | Mantener lo declarado en CP-52, CP-53 y CP-58; mover la preparación a Precondición en los casos de tabla de decisión | |

## Cambios realizados

- Ninguno sobre los casos, la spec, los tests ni el sitio. Solo se creó este reporte y la skill del juez.

## Alcance de esta evaluación

- Demuestra que el documento es coherente consigo mismo (conteos, matriz, bugs, capturas) y que cubre las zonas que pide la consigna con la técnica indicada.
- No demuestra que los resultados obtenidos sean correctos contra el sitio (no se ejecutó nada) ni que los esperados coincidan con la spec completa (no está en el repositorio).
- No sustituye mi revisión ni la de una persona con la spec abierta.

> Actualización posterior (2026-11-14): CP-24 se corrigió a FALLA (BUG-12) por decisión mía; los casos pasan a 56 PASA / 37 FALLA; las cifras de este reporte corresponden a la versión evaluada.
