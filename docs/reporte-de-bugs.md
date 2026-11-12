# Reporte de bugs — Academia sin Humo

Producto: https://playground.calidadsinhumo.com · Especificación: `/documentacion`  
Fecha de ejecución: 2026-11-12 · Navegador/cliente: Playwright (Chromium) y navegación manual.

Resumen: 10 discrepancias contra la spec. 6 se reprodujeron por API con `tests/api/sondeo.spec.ts` (cada test afirma lo que exige la spec y falla mientras el bug exista; los controles de límite de contraseña, 64 aceptada y 7 rechazada, pasan). 4 se encontraron por UI; sus capturas, con el defecto resaltado, están en `docs/evidencia/` y se generan con `npx playwright test tests/evidencia`.

| ID | Título | REQ | Severidad | Capa |
|---|---|---|---|---|
| BUG-01 | La sesión no se reconoce tras el login | S01, S02 | Alta | API |
| BUG-02 | La API de inscripción ignora el prerrequisito | C06, A02, A03 | Alta | API |
| BUG-03 | El cupo no baja al inscribirse | C04 | Media | API |
| BUG-04 | La contraseña de 65 caracteres se acepta | R04 | Baja | API |
| BUG-05 | Un curso Abandonado vuelve a En progreso | P02, P03 | Media | API |
| BUG-06 | Certificar dos veces duplica el certificado | P04 | Media | API |
| BUG-07 | La paginación pierde estudiantes y repite uno | N01, N02, N03 | Media | UI |
| BUG-08 | La reserva acepta un inicio a 31 días | D02 | Baja | UI |
| BUG-09 | El registro exitoso no limpia el formulario | R06 | Baja | UI |
| BUG-10 | El login se bloquea tras 4 intentos fallidos, no 5 | L03 | Media | UI |

---

### BUG-01 · La sesión no se reconoce tras el login
- **REQ violado:** REQ-S01 — "Las páginas /cursos y /mi-progreso requieren autenticación." y REQ-S02 (la sesión del estudiante debe mantenerse hasta cerrar sesión).
- **Comportamiento esperado:** tras un login exitoso, `GET /api/auth/me` devuelve el usuario autenticado.
- **Comportamiento real:** `GET /api/auth/me` responde 200 pero con `realUser: null`; el servidor no reconoce la sesión.
- **Pasos para reproducir:**
  1. `POST /api/register` con un usuario nuevo (201).
  2. `POST /api/login` con ese usuario (200).
  3. `GET /api/auth/me` en el mismo contexto.
- **Evidencia:** test `BUG? REQ-S01/S02 /api/auth/me debe devolver el usuario tras el login`; falla en `expect(body.realUser).not.toBeNull()` con `Received: null`. Request y response adjuntos en el reporte de Playwright.
- **Severidad y por qué:** Alta. Rompe la autenticación del lado del servidor y condiciona todos los flujos que dependen de la sesión (catálogo, progreso).
- **Capa donde se detecta:** API

### BUG-02 · La API de inscripción ignora el prerrequisito
- **REQ violado:** REQ-C06 — "La API de inscripción (POST /api/enroll) debe aplicar las mismas reglas de validación que la UI." y REQ-A03 (403 si el prerrequisito no está completado).
- **Comportamiento esperado:** inscribir en `playwright-cero` sin haber completado `fundamentos` responde 403.
- **Comportamiento real:** responde 200.
- **Pasos para reproducir:**
  1. Registrar y loguear un usuario nuevo (sin cursos completados).
  2. `POST /api/enroll` con `{ "courseId": "playwright-cero" }`.
- **Evidencia:** test `BUG? REQ-C06/A03 enroll con prerrequisito pendiente debe responder 403`; falla con `Expected: 403, Received: 200`.
- **Severidad y por qué:** Alta. Cualquier cliente que llame a la API se salta la regla de negocio central de inscripción, aunque la UI la bloquee.
- **Capa donde se detecta:** API

### BUG-03 · El cupo no baja al inscribirse
- **REQ violado:** REQ-C04 — "Al inscribirse exitosamente, el número de cupos disponibles debe reducirse en 1."
- **Comportamiento esperado:** el cupo libre de `programacion-qa` baja de 20 a 19 tras una inscripción exitosa.
- **Comportamiento real:** sigue en 20 después de inscribirse (la inscripción responde 200).
- **Pasos para reproducir:**
  1. Registrar y loguear un usuario nuevo.
  2. `GET /api/courses` y calcular libres = `maxStudents - enrolled` de `programacion-qa`.
  3. `POST /api/enroll` con `programacion-qa` (200).
  4. `GET /api/courses` de nuevo.
- **Evidencia:** test `BUG? REQ-C04 el cupo debe bajar en 1 tras inscribirse`; falla con `Expected: 19, Received: 20`. Adjunto `catalogo-antes-despues`.
- **Severidad y por qué:** Media. Los cupos nunca se agotan, así que la lista de espera no se activa y la información al estudiante es incorrecta.
- **Capa donde se detecta:** API

### BUG-04 · La contraseña de 65 caracteres se acepta
- **REQ violado:** REQ-R04 — "Una contraseña de 7 caracteres debe ser rechazada. Una de 65 también."
- **Comportamiento esperado:** el registro con 65 caracteres se rechaza (4xx).
- **Comportamiento real:** responde 201 y crea la cuenta.
- **Pasos para reproducir:** `POST /api/register` con una contraseña de 65 caracteres (nombre, email y edad válidos).
- **Evidencia:** test `BUG? REQ-R04 contrasena de 65 caracteres debe rechazarse`; falla con `Expected: >= 400, Received: 201`. Los controles de 64 (aceptada) y 7 (rechazada) pasan, así que el defecto es solo el límite superior.
- **Severidad y por qué:** Baja. Incumple el límite documentado, pero no compromete datos ni flujos.
- **Capa donde se detecta:** API

### BUG-05 · Un curso Abandonado vuelve a En progreso
- **REQ violado:** REQ-P02 (Abandonado: "Ninguna" transición permitida) y REQ-P03 — "Cualquier transición no listada arriba debe ser rechazada con un mensaje de error."
- **Comportamiento esperado:** tras abandonar un curso, `retomar` se rechaza (4xx) y el estado no pasa a `en-progreso`.
- **Comportamiento real:** `retomar` responde 200.
- **Pasos para reproducir:**
  1. Registrar y loguear un usuario nuevo.
  2. `POST /api/enroll` con `fundamentos` (200).
  3. `POST /api/progress` con `{ courseId: "fundamentos", action: "abandonar" }` (200).
  4. `POST /api/progress` con `{ courseId: "fundamentos", action: "retomar" }`.
- **Evidencia:** test `BUG? REQ-P02/P03 un curso Abandonado no debe pasar a En progreso`; falla con `Expected: >= 400, Received: 200`.
- **Severidad y por qué:** Media. Abandonado es un estado terminal; permitir revivirlo rompe la máquina de estados y el avance posterior hacia certificados.
- **Capa donde se detecta:** API

### BUG-06 · Certificar dos veces duplica el certificado
- **REQ violado:** REQ-P04 — "El certificado se genera una sola vez por curso. Múltiples clics en 'Certificar' no deben crear certificados duplicados."
- **Comportamiento esperado:** la segunda certificación deja el total de certificados en 1.
- **Comportamiento real:** el total pasa a 2.
- **Pasos para reproducir:**
  1. Registrar y loguear un usuario nuevo; inscribir `fundamentos`.
  2. `POST /api/progress` con las acciones `comenzar`, `completar` y `certificar` (todas 200; tras la primera certificación `certificates` es 1).
  3. Repetir `certificar`.
- **Evidencia:** test `BUG? REQ-P04 certificar dos veces no debe duplicar certificados`; falla con `Expected: 1, Received: 2`.
- **Severidad y por qué:** Media. Genera certificados duplicados, lo que afecta la integridad del registro académico.
- **Capa donde se detecta:** API

### BUG-07 · La paginación pierde estudiantes y repite uno
- **REQ violado:** REQ-N01 — "10 por página"; REQ-N02 — "Con 25 estudiantes y 10 por página son 3 páginas; ningún estudiante debe quedar inalcanzable."; REQ-N03 — "ningún registro se repite entre páginas."
- **Comportamiento esperado:** 25 estudiantes en 3 páginas de 10, 10 y 5, sin repetidos.
- **Comportamiento real:** el listado indica "página 1 de 2". La página 1 muestra 11 filas (#1 a #11) y la página 2 muestra #11 a #21 (Karen Ávila repetida). Los estudiantes #22 a #25 son inalcanzables.
- **Pasos para reproducir:**
  1. Abrir `/estudiantes`.
  2. Contar las filas de la página 1 y leer el indicador de páginas.
  3. Pulsar "Siguiente →" y comparar con la página 1.
- **Evidencia:** `docs/evidencia/cp04-pagina1.png` ("25 estudiantes · página 1 de 2", 11 filas) y `docs/evidencia/cp04-pagina2.png` (el primer registro es #11, Karen Ávila, repetido de la página 1).
- **Severidad y por qué:** Media. Cuatro estudiantes no se pueden consultar y uno aparece duplicado; el listado es poco fiable.
- **Capa donde se detecta:** UI

### BUG-08 · La reserva acepta un inicio a 31 días
- **REQ violado:** REQ-D02 — "La fecha de inicio debe estar entre hoy y 30 días en el futuro (inclusive). Una fecha a 31 días debe ser rechazada."
- **Comportamiento esperado:** una fecha de inicio a 31 días se rechaza con un mensaje de error.
- **Comportamiento real:** se muestra "Reserva confirmada".
- **Pasos para reproducir:**
  1. Abrir `/reserva`.
  2. Fecha de inicio: hoy + 31 días (ejecución del 2026-11-11: 2026-12-12); fecha de fin: tres días después.
  3. Pulsar "Reservar".
- **Evidencia:** `docs/evidencia/cp05-31-dias.png` (inicio 2026-12-12 = hoy + 31 días, mensaje "Reserva confirmada" resaltado). Control: `docs/evidencia/cp06-30-dias.png` (hoy + 30 días se acepta, como exige la spec).
- **Severidad y por qué:** Baja. Acepta una fecha fuera del rango permitido, pero no afecta a otros flujos.
- **Capa donde se detecta:** UI

### BUG-09 · El registro exitoso no limpia el formulario
- **REQ violado:** REQ-R06 — "Tras un registro exitoso, el formulario debe limpiarse completamente. Ningún campo debe conservar datos del registro anterior."
- **Comportamiento esperado:** tras el alta, los cuatro campos quedan vacíos.
- **Comportamiento real:** el alta responde 201 y aparece "¡Registro exitoso! Tu cuenta ha sido creada.", pero nombre, email, contraseña y edad conservan los valores.
- **Pasos para reproducir:**
  1. Abrir `/registro`.
  2. Rellenar: Marcela Quispe Huamán, un email `@yopmail.com` nuevo, contraseña de 11 caracteres y edad 29.
  3. Pulsar "Crear cuenta".
- **Evidencia:** `docs/evidencia/cp01-registro-antes.png` y `docs/evidencia/cp01-registro-despues.png` (los cuatro campos resaltados); test `BUG? REQ-R06 el formulario de registro debe limpiarse tras un alta exitosa` en `tests/e2e/ui-sondeo.spec.ts`, que falla con `Expected: ""`.
- **Severidad y por qué:** Baja. No afecta a los datos, pero deja la contraseña en pantalla y puede provocar un segundo registro por error.
- **Capa donde se detecta:** UI

### BUG-10 · El login se bloquea tras 4 intentos fallidos, no 5
- **REQ violado:** REQ-L03 — "después de 5 intentos fallidos consecutivos, la cuenta se bloquea por 30 segundos."
- **Comportamiento esperado:** los 4 primeros intentos fallidos dejan el botón activo; el bloqueo llega tras el 5.º.
- **Comportamiento real:** tras el 4.º intento fallido aparece "Demasiados intentos fallidos. Cuenta bloqueada por 30 segundos." y el botón queda en "Bloqueado". Un cliente legítimo pierde un intento respecto a lo que documenta la spec.
- **Pasos para reproducir:**
  1. Abrir `/login` sin bloqueo activo.
  2. Intentar entrar 4 veces con un email no registrado y contraseñas incorrectas distintas.
  3. Observar el botón tras cada intento.
- **Evidencia:** `docs/evidencia/cp02-bloqueo.png` (botón "Bloqueado tras 4 intentos (spec: 5)"). Reproducido en 3 ejecuciones con correos distintos (`BLOQUEADO_TRAS=4`, espaciadas más de 30 s) con `tests/evidencia/capturas.spec.ts`, y por el test `BUG? REQ-L03 el 5.o intento fallido debe bloquear la cuenta`.
- **Severidad y por qué:** Media. El bloqueo ocurre antes de lo especificado, y el umbral de seguridad documentado no se cumple.
- **Capa donde se detecta:** UI
- **No verificado:** que el botón se rehabilite exactamente cuando el temporizador llega a 0 (tercera viñeta de REQ-L03).

---

## Pendientes de reproducir (borrar al cerrarlos)
- REQ-L03: comprobar que el botón se habilita exactamente cuando el timer llega a 0.
