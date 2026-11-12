# Estrategia de pruebas — Academia sin Humo

> Producto bajo prueba: https://playground.calidadsinhumo.com  
> Fuente de verdad: https://playground.calidadsinhumo.com/documentacion (REQ-R01 … REQ-U03)  
> Hallazgos con evidencia: [`reporte-de-bugs.md`](reporte-de-bugs.md) · capturas en [`evidencia/`](evidencia/)

## Riesgo principal

- **Riesgo:** las reglas de negocio de inscripción y progreso no se validan en el servidor: la API acepta una inscripción sin el prerrequisito completado (BUG-02), permite que un curso Abandonado vuelva a En progreso (BUG-05) y genera certificados duplicados (BUG-06). Además, el servidor no reconoce la sesión tras el login (BUG-01).
- **A quién afecta y cómo:** al estudiante y al negocio. Cualquier cliente que llame a la API se salta los requisitos pedagógicos, y el registro académico puede acabar con certificados o avances que no corresponden al recorrido real. Ocurre siempre, aunque la interfaz bloquee el caso, porque la regla solo está en el cliente.

## Cómo se reprodujo

1. Registro de un usuario nuevo con `POST /api/register` (201) y login con `POST /api/login` (200).
2. `GET /api/auth/me` con esa sesión devuelve `realUser: null` (BUG-01, REQ-S01/S02).
3. `POST /api/enroll` con `{ "courseId": "playwright-cero" }` sin haber completado `fundamentos` responde **200**, no 403 (BUG-02, REQ-C06/A03).
4. Abandonar un curso y llamar a `POST /api/progress` con `retomar` responde 200 (BUG-05); `certificar` dos veces deja dos certificados (BUG-06).
5. Por UI se confirmaron además: formulario de registro sin limpiar (BUG-09), bloqueo de login tras 4 intentos y no 5 (BUG-10), paginación con 4 estudiantes inalcanzables y uno repetido (BUG-07) y reserva aceptada a 31 días (BUG-08).

Todo se puede repetir con `npx playwright test tests/api/sondeo.spec.ts` y `npx playwright test tests/e2e/ui-sondeo.spec.ts`.

## Flujos evaluados

Frecuencia y valor/riesgo: A = alto, M = medio, B = bajo.

| Flujo | REQ | Frecuencia | Valor/Riesgo | ¿Automatizo? | Capa (UI/API/integrado) | Por qué |
|---|---|---|---|---|---|---|
| Inscripción a un curso | C02, C03, C04, C06, A02, A03 | A | A | **Sí** | E2E (UI) + API + integrado | Es el flujo central del negocio y la API no aplica la regla del prerrequisito (BUG-02). Es el caso estrella. |
| API `POST /api/enroll` | A01, A02, A03 | A | A | **Sí** | API | Cada código (200, 400, 403, 404) tiene un resultado esperado escrito en la spec. Es barata y estable. |
| Progreso: estados y certificado | P01 a P05 | M | A | **Sí (API)** | API | Dos defectos de integridad confirmados (BUG-05, BUG-06). Se prueba por API porque no requiere navegar la UI. |
| Sesión y autenticación | S01, S02, L04 | A | A | **Sí (API)** | API | Defecto confirmado (BUG-01). Condiciona los flujos de UI que dependen de estar logueado. |
| Login y rate limiting | L01 a L03 | M | M | No (documentado) | UI | Defecto confirmado (BUG-10), pero comprobarlo exige esperas de 30 s; queda como evidencia, no como regresión. |
| Registro | R01 a R07 | M | M | No (documentado) | API + UI | Dos defectos de bajo impacto (BUG-04, BUG-09). Cada fallo es local y no afecta a otros flujos. |
| Listado paginado | N01 a N03 | B | M | No (documentado) | UI | Defecto confirmado (BUG-07), pero no toca el riesgo principal. |
| Reserva de fecha | D01 a D03 | B | B | No (documentado) | UI | Defecto confirmado (BUG-08), de bajo impacto y sin efecto sobre otros flujos. |
| Subida de CV | U01 a U03 | B | B | No | UI | Poco frecuente y de bajo impacto. No se probó. |

"No (documentado)" significa que el defecto está reportado con evidencia, pero no entra en la suite de regresión del mínimo.

## Alcance elegido

- **Lo que SÍ entra:**
  - **E2E (Fase 2):** inscripción a un curso sin prerrequisito (`Fundamentos de Testing`) desde el catálogo, con Page Object y comprobación visible del resultado.
  - **API (Fase 3):** 4 tests sobre `POST /api/enroll` (camino feliz, sin `courseId`, curso inexistente, body vacío o malformado) y la comprobación del cupo con `GET /api/courses` antes y después.
  - **Integrado (Fase 4), opción A (REQ-C06):** la API intenta inscribir a un curso con el prerrequisito pendiente, la UI muestra en qué estado queda el catálogo y la API limpia. El dato compartido es el `courseId` del curso y el usuario creado por API.
  - **CI (Fase 5):** una suite corriendo en GitHub Actions con Chromium.
  - **Reporte (Fase 6):** los hallazgos contra la spec, con el defecto resaltado en las capturas.
- **Lo que NO entra, y por qué:** registro, bloqueo de login, paginación, reserva y subida de CV como pruebas automatizadas de regresión. Se priorizó por riesgo y no por cantidad: sus defectos están documentados con evidencia, pero no afectan al riesgo principal y varios exigen esperas o archivos que encarecen la suite.
- **Lo que NO voy a poder demostrar con estas pruebas:**
  - Que el producto cumple toda la especificación: solo se cubren los flujos elegidos.
  - El comportamiento en otros navegadores (solo Chromium), el rendimiento ni la seguridad.
  - Que no haya más defectos en las zonas descartadas ni en las que no se probaron (subida de CV, rehabilitación del botón de login en el segundo 0).
  - El flujo de inscripción con sesión persistente tras recargar la página, porque la sesión no se reconoce en el servidor (BUG-01): el E2E depende de la navegación dentro de la misma sesión.
  
  Un resultado verde en este repo indica que los flujos elegidos se comportan según la spec o que el defecto está declarado como esperado, no que el producto esté libre de errores.

## Decisiones tomadas

- **Flujo E2E:** inscripción a `Fundamentos de Testing`, porque no tiene prerrequisito y sirve de base para el resto de la cadena de cursos.
- **Fase 4:** opción A (REQ-C06), la recomendada en la consigna y la que ya muestra un defecto real.
- **Criterio ante un fallo:** un test que falla porque el producto contradice la spec no se modifica para que pase. Se declara con `test.fail(true, 'BUG-XX…')` afirmando lo que exige la spec, y el hallazgo va al reporte.
