# Reporte de bugs — Academia sin Humo

Producto: https://playground.calidadsinhumo.com · Especificación: `/documentacion`  
Fecha de ejecución: 2026-11-12 · Navegador/cliente: Playwright (Chromium) y navegación manual.

Resumen: 16 discrepancias contra la spec. BUG-01 a BUG-06 se reprodujeron por API con `tests/api/enroll.spec.ts` (BUG-02 y BUG-03) y `tests/api/sondeo.spec.ts` (BUG-01, BUG-04, BUG-05 y BUG-06): cada test afirma lo que exige la spec y se declara con `test.fail(true, 'BUG-XX…')`, así que la suite pasa mientras el bug exista y se pone roja cuando se corrija; los controles de límite de contraseña, 64 aceptada y 7 rechazada, pasan). BUG-07 a BUG-10 se encontraron por UI y sus capturas, con el defecto resaltado, están en `docs/evidencia/` (se generan con `npx playwright test tests/evidencia`). BUG-11 a BUG-16 salieron al ejecutar los casos de `docs/casos-de-prueba.md` con `tests/evidencia/ejecucion-casos.spec.ts` (BUG-16, con `tests/evidencia/ejecucion-reserva-d01-d03.spec.ts`), que miden y no afirman (terminan en verde); sus resultados se leen en la salida `CPxx|estado|resumen` y las capturas, cuando son de UI, están en `docs/evidencia/`.

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
| BUG-11 | El email sin dominio o sin punto se acepta | R03 | Baja | API |
| BUG-12 | El botón de login se habilita unos 5 s antes de que el timer llegue a 0 | L03 | Baja | UI |
| BUG-13 | Completado y Certificado pasan a En progreso | P02, P03 | Media | API |
| BUG-14 | Cerrar sesión no reinicia el progreso | S02 | Media | UI |
| BUG-15 | El CV acepta cualquier archivo, de cualquier tipo y tamaño | U02, U03 | Media | UI |
| BUG-16 | La reserva acepta un fin igual o anterior al inicio | D03 | Baja | UI |

---

### BUG-01 · La sesión no se reconoce tras el login
- **REQ violado:** REQ-S01 — "Las páginas /cursos y /mi-progreso requieren autenticación." y REQ-S02 — "Al cerrar sesión, todo el progreso del estudiante se reinicia. Al volver a iniciar sesión, el estudiante empieza sin cursos inscritos." La comprobación de `/api/auth/me` no figura en la spec: proviene de la pista de la consigna. La violación literal de REQ-S02 es BUG-14.
- **Comportamiento esperado:** tras un login exitoso, `GET /api/auth/me` devuelve el usuario autenticado.
- **Comportamiento real:** `GET /api/auth/me` responde 200 pero con `realUser: null`; el servidor no reconoce la sesión.
- **Pasos para reproducir:**
  1. `POST /api/register` con un usuario nuevo (201).
  2. `POST /api/login` con ese usuario (200).
  3. `GET /api/auth/me` en el mismo contexto.
- **Evidencia:** test `BUG-01 REQ-S01/S02 /api/auth/me debe devolver el usuario tras el login` (`tests/api/sondeo.spec.ts`, con `test.fail`); falla en `expect(body.realUser).not.toBeNull()` con `Received: null`. Request y response adjuntos en el reporte de Playwright.
- **Respuesta real** (completa en [`docs/evidencia/api/bug-01-auth-me.json`](evidencia/api/bug-01-auth-me.json)):
  ```text
  GET /api/auth/me
  → 200 {"realUser": null}
  ```
- **Severidad y por qué:** Alta. Rompe la autenticación del lado del servidor y condiciona todos los flujos que dependen de la sesión (catálogo, progreso).
- **Capa donde se detecta:** API

### BUG-02 · La API de inscripción ignora el prerrequisito
- **REQ violado:** REQ-C06 — "La API de inscripción (POST /api/enroll) debe aplicar las mismas reglas de validación que la UI." y REQ-A03 (403 si el prerrequisito no está completado).
- **Comportamiento esperado:** inscribir en `playwright-cero` sin haber completado `fundamentos` responde 403.
- **Comportamiento real:** responde 200.
- **Pasos para reproducir:**
  1. Registrar y loguear un usuario nuevo (sin cursos completados).
  2. `POST /api/enroll` con `{ "courseId": "playwright-cero" }`.
- **Evidencia:** test `REQ-C06/A03 un curso con prerrequisito pendiente se rechaza con 403` (`tests/api/enroll.spec.ts`, con `test.fail`); falla con `Expected: 403, Received: 200`. Se repite en el flujo integrado `tests/integrado/inscripcion-prerrequisito.spec.ts`: la API responde 200 y, aun así, la UI sigue mostrando el curso bloqueado ("Completa primero…") y "Mi progreso" sin cursos, es decir, la API y la interfaz no coinciden sobre el estado del estudiante.
- **Respuesta real** (completa en [`docs/evidencia/api/bug-02-enroll-prerrequisito.json`](evidencia/api/bug-02-enroll-prerrequisito.json)):
  ```text
  POST /api/enroll {"courseId": "playwright-cero"}
  → 200 {"courseId": "playwright-cero", "status": "inscrito", "displayStatus": "inscrito", "message": "Inscripción exitosa a \"Playwright desde cero\""}
  ```
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
- **Evidencia:** test `REQ-C04 el cupo del catalogo baja en 1 tras inscribirse (GET /api/courses antes y despues)` (`tests/api/enroll.spec.ts`, con `test.fail`); falla con `Expected: 19, Received: 20`. Adjunto `catalogo-antes-despues`.
- **Respuesta real** (completa en [`docs/evidencia/api/bug-03-cupo.json`](evidencia/api/bug-03-cupo.json)):
  ```text
  GET /api/courses (antes)  → programacion-qa: maxStudents=20, enrolled=0, libres=20
  POST /api/enroll {"courseId": "programacion-qa"}
  → 200 {"courseId": "programacion-qa", "status": "inscrito", "displayStatus": "inscrito"}
  GET /api/courses (después) → programacion-qa: maxStudents=20, enrolled=0, libres=20
  ```
- **Severidad y por qué:** Media. Los cupos nunca se agotan, así que la lista de espera no se activa y la información al estudiante es incorrecta.
- **Capa donde se detecta:** API

### BUG-04 · La contraseña de 65 caracteres se acepta
- **REQ violado:** REQ-R04 — "Una contraseña de 7 caracteres debe ser rechazada. Una de 65 también."
- **Comportamiento esperado:** el registro con 65 caracteres se rechaza (4xx).
- **Comportamiento real:** responde 201 y crea la cuenta.
- **Pasos para reproducir:** `POST /api/register` con una contraseña de 65 caracteres (nombre, email y edad válidos).
- **Evidencia:** test `BUG-04 REQ-R04 contrasena de 65 caracteres debe rechazarse` (`tests/api/sondeo.spec.ts`, con `test.fail`); falla con `Expected: >= 400, Received: 201`. Los controles de 64 (aceptada) y 7 (rechazada) pasan, así que el defecto es solo el límite superior.
- **Respuesta real** (completa en [`docs/evidencia/api/bug-04-password-65.json`](evidencia/api/bug-04-password-65.json)):
  ```text
  POST /api/register (contraseña de 65 caracteres)
  → 201 {"message": "Registro exitoso", "user": {"name": "Lucía Mamani Flores", "email": "lucia.mamani.17944567719547@yopmail.com", "age": 31}}
  ```
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
- **Evidencia:** test `BUG-05 REQ-P02/P03 un curso Abandonado no debe pasar a En progreso` (`tests/api/sondeo.spec.ts`, con `test.fail`); falla con `Expected: >= 400, Received: 200`.
- **Respuesta real** (completa en [`docs/evidencia/api/bug-05-abandonado-retomar.json`](evidencia/api/bug-05-abandonado-retomar.json)):
  ```text
  POST /api/progress {"courseId": "fundamentos", "action": "retomar"}
  → 200 {"courseId": "fundamentos", "previousStatus": "abandonado", "currentStatus": "en-progreso", "message": "Transición exitosa: abandonado → en-progreso"}
  ```
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
- **Evidencia:** test `BUG-06 REQ-P04 certificar dos veces no debe duplicar certificados` (`tests/api/sondeo.spec.ts`, con `test.fail`); falla con `Expected: 1, Received: 2`.
- **Respuesta real** (completa en [`docs/evidencia/api/bug-06-certificado-duplicado.json`](evidencia/api/bug-06-certificado-duplicado.json)):
  ```text
  POST /api/progress {"courseId": "fundamentos", "action": "certificar"}
  → 200 {"previousStatus": "completado", "currentStatus": "certificado", "certificates": 1}
  POST /api/progress {"courseId": "fundamentos", "action": "certificar"}
  → 200 {"previousStatus": "certificado", "currentStatus": "certificado", "certificates": 2}
  ```
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
- **Comportamiento esperado:** hoy + 30 se acepta y hoy + 31 se rechaza con un mensaje de error.
- **Comportamiento real:** el límite superior está desplazado un día. Con "hoy" calculado en UTC, que es como lo calcula el servidor: +30 se acepta, **+31 se acepta** ("Reserva confirmada") y +32 se rechaza ("La fecha de inicio no puede superar los 30 días").
- **Pasos para reproducir:**
  1. Abrir `/reserva`.
  2. Fecha de inicio: hoy (UTC) + 31 días (ejecución del 2026-11-12 UTC: 2026-12-13); fecha de fin: tres días después.
  3. Pulsar "Reservar".
- **Evidencia:** `docs/evidencia/cp05-31-dias.png` (inicio 2026-12-13 = hoy UTC + 31, "Reserva confirmada" resaltado). Controles: `docs/evidencia/cp06-30-dias.png` (+30 aceptado) y caso CP-93 (+32 rechazado); casos CP-50, CP-51 y CP-93 en `docs/casos-de-prueba.md`. Nota: una primera lectura con fechas en hora local de Lima daba un día de diferencia; por eso las fechas se calculan en UTC.
- **Severidad y por qué:** Baja. Acepta una fecha un día fuera del rango permitido, pero no afecta a otros flujos.
- **Capa donde se detecta:** UI

### BUG-09 · El registro exitoso no limpia el formulario
- **REQ violado:** REQ-R06 — "Tras un registro exitoso, el formulario debe limpiarse completamente. Ningún campo debe conservar datos del registro anterior."
- **Comportamiento esperado:** tras el alta, los cuatro campos quedan vacíos.
- **Comportamiento real:** el alta responde 201 y aparece "¡Registro exitoso! Tu cuenta ha sido creada.", pero nombre, email, contraseña y edad conservan los valores.
- **Pasos para reproducir:**
  1. Abrir `/registro`.
  2. Rellenar: Marcela Quispe Huamán, un email `@yopmail.com` nuevo, contraseña de 11 caracteres y edad 29.
  3. Pulsar "Crear cuenta".
- **Evidencia:** `docs/evidencia/cp01-registro-antes.png` y `docs/evidencia/cp01-registro-despues.png` (los cuatro campos resaltados); test `BUG-09 REQ-R06 el formulario de registro debe limpiarse tras un alta exitosa` en `tests/e2e/ui-sondeo.spec.ts`, que falla con `Expected: ""`.
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
- **Evidencia:** `docs/evidencia/cp02-bloqueo.png` (botón "Bloqueado tras 4 intentos (spec: 5)"). Reproducido en 3 ejecuciones con correos distintos (`BLOQUEADO_TRAS=4`, espaciadas más de 30 s) con `tests/evidencia/capturas.spec.ts`, y por el test `BUG-10 REQ-L03 el 5.o intento fallido debe bloquear la cuenta`.
- **Severidad y por qué:** Media. El bloqueo ocurre antes de lo especificado, y el umbral de seguridad documentado no se cumple.
- **Capa donde se detecta:** UI
- **Evidencia adicional (API):** casos CP-76 (cuenta registrada) y CP-87 (cuenta de prueba del sitio): con 4 intentos fallidos la 4.ª respuesta de `POST /api/login` ya es 429; el login correcto siguiente también devuelve 429. Secuencia observada: `401, 401, 401, 429, 429, 429`; la spec exige que 4 fallos + 1 acierto + 1 fallo no bloqueen.
- **Seguimiento:** la rehabilitación del botón se midió después y es el BUG-12.

### BUG-11 · El email sin dominio o sin punto se acepta
- **REQ violado:** REQ-R03 — "Emails como usuario@ o usuario no son válidos." y "debe contener un @ seguido de un dominio con punto".
- **Comportamiento esperado:** `usuario@` y un dominio sin punto se rechazan, igual que `usuario`.
- **Comportamiento real:** `POST /api/register` responde 201 con `usuario@` y con `lucia.mamani@yopmail`. El control `usuario` sí se rechaza con 422 ("El email no tiene un formato válido"), y `@dominio.com` también.
- **Pasos para reproducir:**
  1. `POST /api/register` con nombre `Marcela Quispe Huamán`, contraseña `Lima#2026qa`, edad 29 y el email `usuario@`.
  2. Repetir con `lucia.mamani@yopmail`.
- **Evidencia:** casos CP-13 (`usuario@` → 201) y CP-15 (`lucia.mamani@yopmail` → 201) en `docs/casos-de-prueba.md`, medidos con `tests/evidencia/ejecucion-casos.spec.ts`. También se aceptan `a@.com` (CP-69), `a@b.` (CP-70), `a@@b.com` (CP-71) y un email con espacio (CP-72); la spec no los nombra, pero contradicen "un @ seguido de un dominio con punto".
- **Respuesta real** (completa en [`docs/evidencia/api/bug-11-email-invalido.json`](evidencia/api/bug-11-email-invalido.json)):
  ```text
  POST /api/register email "usuario@"
  → 201
  POST /api/register email "lucia.mamani.179445677611913"
  → 201
  POST /api/register email "usuario"
  → 422
  ```
- **Severidad y por qué:** Baja. Entran cuentas con emails inválidos, pero no se compromete ningún flujo; sí afecta a cualquier envío posterior al email.
- **Capa donde se detecta:** API

### BUG-12 · El botón de login se habilita unos 5 s antes de que el timer llegue a 0
- **REQ violado:** REQ-L03 — "El botón se habilita exactamente cuando el timer llega a 0".
- **Comportamiento esperado:** el botón sigue deshabilitado mientras el timer muestra segundos restantes y se habilita al llegar a 0 (30 s de bloqueo).
- **Comportamiento real:** el timer arranca en 30 y baja con normalidad (26 lecturas distintas, siempre decreciente), pero el botón se habilita con el timer todavía en 5: bloqueo observado de unos 25 s.
- **Pasos para reproducir:**
  1. Abrir `/login` y provocar el bloqueo (4 intentos fallidos con un email inexistente, ver BUG-10).
  2. Observar el botón y el recuadro "Puedes intentar de nuevo en N segundos" cada 100 ms.
- **Evidencia:** caso CP-78 (muestras `[ms, botón deshabilitado, timer]`: `[24915,true,6],[25005,true,6],[25101,false,5]`) con `tests/evidencia/ejecucion-casos.spec.ts`; CP-24 y CP-77 pasan (botón deshabilitado y timer visible y decreciente). Una exploración previa con otro email también lo habilitó a los ~26 s.
- **Severidad y por qué:** Baja. El bloqueo dura menos de lo documentado, pero la protección sigue existiendo.
- **Capa donde se detecta:** UI

### BUG-13 · Completado y Certificado pasan a En progreso
- **REQ violado:** REQ-P02 (Completado solo admite Certificado; Certificado es estado final) y REQ-P03 — "Cualquier transición no listada arriba debe ser rechazada con un mensaje de error."
- **Comportamiento esperado:** `comenzar` sobre un curso Completado o Certificado se rechaza.
- **Comportamiento real:** responde 200 y el estado pasa a `en-progreso` en ambos casos.
- **Pasos para reproducir:**
  1. Registrar y loguear un usuario nuevo; inscribir `fundamentos`.
  2. `POST /api/progress` con `comenzar` y `completar` (y, para el segundo caso, `certificar`).
  3. `POST /api/progress` con `{ courseId: "fundamentos", action: "comenzar" }`.
- **Evidencia:** casos CP-62 (Completado → En progreso: 200, `en-progreso`) y CP-63 (Certificado → En progreso: 200, `en-progreso`). Mismo patrón que BUG-05. Los demás rechazos (CP-41, 43, 44, 60, 61, 64) sí devuelven error.
- **Respuesta real** (completa en [`docs/evidencia/api/bug-13-transiciones-invalidas.json`](evidencia/api/bug-13-transiciones-invalidas.json)):
  ```text
  POST /api/progress {"courseId": "fundamentos", "action": "comenzar"}
  → 200 {"previousStatus": "completado", "currentStatus": "en-progreso", "message": "Transición exitosa: completado → en-progreso"}
  POST /api/progress {"courseId": "fundamentos", "action": "comenzar"}
  → 200 {"previousStatus": "certificado", "currentStatus": "en-progreso", "message": "Transición exitosa: certificado → en-progreso"}
  ```
- **Severidad y por qué:** Media. Un certificado emitido puede volver a En progreso y generar otro después.
- **Capa donde se detecta:** API

### BUG-14 · Cerrar sesión no reinicia el progreso
- **REQ violado:** REQ-S02 — "Al cerrar sesión, todo el progreso del estudiante se reinicia. Al volver a iniciar sesión, el estudiante empieza sin cursos inscritos."
- **Comportamiento esperado:** tras cerrar sesión y volver a entrar, `/mi-progreso` muestra "Aún no tienes cursos".
- **Comportamiento real:** el curso inscrito antes de cerrar sesión sigue listado.
- **Pasos para reproducir:**
  1. Iniciar sesión con la cuenta de prueba del sitio, inscribir `fundamentos` en `/cursos` y comprobar que aparece en `/mi-progreso`.
  2. Pulsar "Cerrar sesión".
  3. Entrar de nuevo (navegación interna, sin recargar) y abrir `/mi-progreso`.
- **Evidencia:** caso CP-49 (antes: listado; después: no vacío). La cuenta de prueba es compartida y su estado puede estar modificado por otras personas; el caso inscribe un curso y comprueba lo que queda listado. Recargar la página sí borra el estado, por lo que se usó navegación interna.
- **Severidad y por qué:** Media. Incumple una regla explícita de sesión y deja datos de un estudiante visibles para el siguiente.
- **Capa donde se detecta:** UI

### BUG-15 · El CV acepta cualquier archivo, de cualquier tipo y tamaño
- **REQ violado:** REQ-U02 — "Solo se aceptan archivos PDF." y REQ-U03 — "El tamaño máximo es 2 MB (inclusive). Un archivo de 2.5 MB debe rechazarse."
- **Comportamiento esperado:** un `.png`, un `.txt`, un `.pdf` cuyo contenido no es PDF y un archivo vacío se rechazan; también uno de 2 097 153 bytes y uno de 2,5 MB.
- **Comportamiento real:** en todos los casos aparece "CV subido correctamente". Solo se comprobó el resultado visible; la spec no define el MB y aquí se interpreta como 2 097 152 bytes (ese tamaño exacto se acepta, como corresponde).
- **Pasos para reproducir:**
  1. Abrir `/perfil` y elegir un archivo `notas.txt` en el campo del CV (el input no tiene atributo `accept`).
  2. Pulsar "Subir CV".
- **Evidencia:** `docs/evidencia/cp58-cv-txt.png`, `cp88-cv-falso.png`, `cp89-cv-2mb-mas-1.png`, `cp90-cv-2-5mb.png`; casos CP-58 (`.png` y `.txt`), CP-88 (`.pdf` con texto plano), CP-89 (2 097 153 bytes), CP-90 (2,5 MB) y CP-91 (0 bytes; la spec no lo nombra, se registra como observación).
- **Severidad y por qué:** Media. Las dos reglas de la subida no se aplican, así que la pantalla confirma como correcto un archivo que debía rechazarse.
- **Capa donde se detecta:** UI

### BUG-16 · La reserva acepta un fin igual o anterior al inicio
- **REQ violado:** REQ-D03 — "La fecha de fin debe ser posterior a la de inicio. Una fecha de fin anterior o igual al inicio debe rechazarse."
- **Comportamiento esperado:** con fin igual al inicio, o anterior a él, la reserva se rechaza con un mensaje de error.
- **Comportamiento real:** con inicio = hoy + 5 (2026-11-17), tanto fin = 2026-11-17 (fin = inicio) como fin = 2026-11-16 (inicio − 1 día) muestran "Reserva confirmada". El texto "Elige cuándo empiezas. La fecha de inicio debe ser dentro de los próximos 30 días, y la de fin posterior a la de inicio." es una ayuda estática de la página, no un mensaje de error.
- **Pasos para reproducir:**
  1. Abrir `/reserva`.
  2. Fecha de inicio: hoy + 5 días (ejecución del 2026-11-12: 2026-11-17); fecha de fin: la misma fecha.
  3. Pulsar "Reservar".
  4. Repetir con la fecha de fin un día antes del inicio (2026-11-16).
- **Evidencia:** `docs/evidencia/cp52-fin-igual-inicio.png` (fin = inicio, "Reserva confirmada"); caso CP-52 en `docs/casos-de-prueba.md`, medido el 2026-11-12 con `tests/evidencia/ejecucion-reserva-d01-d03.spec.ts`. En el mismo spec, CP-53 (inicio o fin vacíos) rechaza correctamente.
- **Severidad y por qué:** Baja. Acepta un rango de fechas incoherente, pero no afecta a otros flujos (igual que BUG-08).
- **Capa donde se detecta:** UI
