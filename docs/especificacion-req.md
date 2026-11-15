# Especificación de Academia sin Humo (copia de trabajo)

- **Fuente de verdad:** https://playground.calidadsinhumo.com/documentacion
- **Copia tomada el:** 2026-11-11 (la página no tiene versión ni fecha propias; si cambia, esta copia deja constancia de lo que se usó para diseñar los casos y reportar los bugs).
- **Uso:** respaldo para citar los REQ; si hay diferencias con el sitio vivo, manda el sitio y esta copia se actualiza con nueva fecha.

## 1. Registro de estudiantes (`/registro`)
- **REQ-R01** El formulario requiere: nombre completo, email, contraseña y edad. Todos los campos son obligatorios.
- **REQ-R02** El nombre debe tener entre 2 y 50 caracteres.
- **REQ-R03** El email debe tener formato válido: debe contener un @ seguido de un dominio con punto (ejemplo: usuario@dominio.com). Emails como usuario@ o usuario no son válidos.
- **REQ-R04** La contraseña debe tener entre 8 y 64 caracteres (inclusive). Una contraseña de 7 caracteres debe ser rechazada. Una de 65 también.
- **REQ-R05** La edad debe estar entre 16 y 99 (inclusive).
- **REQ-R06** Tras un registro exitoso, el formulario debe limpiarse completamente. Ningún campo debe conservar datos del registro anterior.
- **REQ-R07** No se puede registrar un email que ya existe en el sistema.

## 2. Inicio de sesión (`/login`)
- **REQ-L01** El login requiere email y contraseña. Ambos son obligatorios.
- **REQ-L02** Las credenciales se validan contra los usuarios registrados. Un email no registrado o una contraseña incorrecta muestran un mensaje de error.
- **REQ-L03** Rate limiting: después de 5 intentos fallidos consecutivos, la cuenta se bloquea por 30 segundos. Durante el bloqueo: el botón de login debe estar deshabilitado; un timer visual muestra los segundos restantes; el botón se habilita exactamente cuando el timer llega a 0.
- **REQ-L04** Tras un login exitoso, el sistema muestra un mensaje de bienvenida con el nombre del usuario.

## 3. Catálogo e inscripción a cursos (`/cursos`)
- **REQ-C01** El catálogo muestra todos los cursos disponibles con: título, descripción, nivel, duración, prerequisito y cupos disponibles.
- **REQ-C02** Reglas de inscripción (tabla de decisión):

  | Prerequisito completado | Cupo disponible | Resultado esperado |
  |---|---|---|
  | Sí | Sí | Inscrito |
  | Sí | No | Lista de espera |
  | No | Sí | Rechazado (prerequisito pendiente) |
  | No | No | Rechazado |
- **REQ-C03** Un curso solo se desbloquea cuando el estudiante ha completado su prerequisito. Estar inscrito o en progreso no cuenta como completado.
- **REQ-C04** Al inscribirse exitosamente, el número de cupos disponibles debe reducirse en 1.
- **REQ-C05** Si el estudiante queda en lista de espera, el badge debe mostrar "Lista de espera" (no "Inscrito").
- **REQ-C06** La API de inscripción (`POST /api/enroll`) debe aplicar las mismas reglas de validación que la UI. Un curso con prerequisito pendiente debe ser rechazado tanto en la UI como en la API.

**Mapa de prerequisitos:** Fundamentos de Testing (sin prerequisito) → Playwright desde cero (requiere Fundamentos) y Diseño de casos de prueba (requiere Fundamentos); API Testing con Playwright y CI/CD para QA (requieren Playwright desde cero); Liderazgo QA (requiere Diseño de casos).

## 4. Progreso del estudiante (`/mi-progreso`)
- **REQ-P01** Cada curso inscrito tiene un ciclo de vida con los siguientes estados: Inscrito, En progreso, Completado, Certificado, Abandonado.
- **REQ-P02** Transiciones válidas:

  | Estado actual | Transiciones permitidas |
  |---|---|
  | Inscrito | En progreso, Abandonado |
  | En progreso | Completado, Abandonado |
  | Completado | Certificado |
  | Certificado | Ninguna (estado final) |
  | Abandonado | Ninguna (estado terminal) |
- **REQ-P03** Cualquier transición no listada arriba debe ser rechazada con un mensaje de error. Por ejemplo: Inscrito → Completado, Abandonado → En progreso.
- **REQ-P04** El certificado se genera una sola vez por curso. Múltiples clics en "Certificar" no deben crear certificados duplicados.
- **REQ-P05** Completar un curso actualiza el estado de prerequisitos en el catálogo. Los cursos que dependen del completado deben desbloquearse.

## 5. Sesión y autenticación (global)
- **REQ-S01** Las páginas `/cursos` y `/mi-progreso` requieren autenticación. Un usuario no logueado debe ver un mensaje pidiendo iniciar sesión.
- **REQ-S02** Al cerrar sesión, todo el progreso del estudiante se reinicia. Al volver a iniciar sesión, el estudiante empieza sin cursos inscritos.

## 6. API de inscripción (`/api/enroll`)
- **REQ-A01** `POST /api/enroll` acepta un body JSON con el campo `courseId`.
- **REQ-A02** La API debe validar: que el curso exista, que haya cupos, y que el prerequisito esté completado. Las mismas reglas que la UI.
- **REQ-A03** Respuestas esperadas: 200 con `status: "inscrito"` (inscripción exitosa); 200 con `status: "lista-espera"` (sin cupos); 400 (falta `courseId`); 403 (prerequisito no completado); 404 (curso no encontrado).

## 7. Reserva de fecha de inicio (`/reserva`)
- **REQ-D01** El formulario pide fecha de inicio y fecha de fin. Ambas son obligatorias.
- **REQ-D02** La fecha de inicio debe estar entre hoy y 30 días en el futuro (inclusive). Una fecha a 31 días debe ser rechazada.
- **REQ-D03** La fecha de fin debe ser posterior a la de inicio. Una fecha de fin anterior o igual al inicio debe rechazarse.

## 8. Listado paginado de estudiantes (`/estudiantes`)
- **REQ-N01** El listado muestra a los estudiantes paginados, 10 por página.
- **REQ-N02** El total de páginas es ceil(total / pageSize). Con 25 estudiantes y 10 por página son 3 páginas; ningún estudiante debe quedar inalcanzable.
- **REQ-N03** Cada página muestra exactamente pageSize registros distintos. La página 1 empieza en el primer registro y ningún registro se repite entre páginas.

## 9. Subida de CV (`/perfil`)
- **REQ-U01** El formulario permite subir un archivo como CV.
- **REQ-U02** Solo se aceptan archivos PDF. Cualquier otro tipo (imagen, texto, etc.) debe ser rechazado.
- **REQ-U03** El tamaño máximo es 2 MB (inclusive). Un archivo de 2.5 MB debe rechazarse.

## Nota sobre lo que la spec NO define
La spec no menciona los endpoints `/api/register`, `/api/login`, `/api/courses`, `/api/progress` ni `/api/auth/me`, ni los códigos de estado de `/api/progress`: lo que se sabe de ellos se observó con DevTools y se declara como observado, no como especificado, en `docs/casos-de-prueba.md`.
