# Casos de prueba — Academia sin Humo

- **Producto:** https://playground.calidadsinhumo.com
- **Especificación:** https://playground.calidadsinhumo.com/documentacion (REQ-R01 a REQ-U03, leída el 2026-11-11)
- **Fecha de ejecución:** 2026-11-11 · cliente: Playwright (Chromium)
- **Diseño:** a partir de la especificación, no de la pantalla. Los resultados se midieron con `tests/evidencia/ejecucion-casos.spec.ts` (API y UI); CP-20, CP-23 y CP-54 a CP-56 provienen de la evidencia de `docs/evidencia/` y de `docs/reporte-de-bugs.md`.
- **Criterio:** "Resultado obtenido" es lo observado; donde no se ejecutó se dice y no se inventa un resultado.
- **Nota sobre los endpoints:** de la API solo `/api/enroll` aparece en la spec (REQ-A01 a A03). `/api/register`, `/api/login`, `/api/courses`, `/api/progress` y `/api/auth/me` se observaron con DevTools; no vienen de la spec, y sus nombres, acciones (`comenzar`, `completar`, `certificar`, `abandonar`, `retomar`) y códigos de error son inferidos.
- **Fechas de reserva (D02/D03):** el servidor calcula "hoy" en UTC, por lo que los casos de fecha calculan "hoy" en UTC (no en hora local de Lima, que va 5 horas por detrás).
- **Nota sobre "2 MB":** la spec no define el MB; se interpreta como 2 097 152 bytes.
- **Cuenta de prueba del sitio:** los casos que necesitan login real usan la cuenta que el propio sitio publica en `/login`. Sus credenciales se leen en tiempo de ejecución (`tests/evidencia/cuenta-demo.ts`) y no se guardan ni se imprimen. La cuenta es compartida, así que otras personas pueden haber modificado su estado.

## Resumen

Total: **93** casos · PASA **56** · FALLA **35** · NO EJECUTADO **2**

| Técnica | Casos | PASA | FALLA | NO EJECUTADO |
|---|---|---|---|---|
| valores límite | 25 | 17 | 7 | 1 |
| partición | 26 | 15 | 10 | 1 |
| tabla de decisión | 16 | 8 | 8 | 0 |
| transición de estados | 15 | 11 | 4 | 0 |
| temporal | 6 | 2 | 4 | 0 |
| autorización | 5 | 3 | 2 | 0 |
| **Total** | **93** | **56** | **35** | **2** |

Cada FALLA enlaza un BUG de `docs/reporte-de-bugs.md`. De esta ejecución salieron cinco bugs nuevos, ya registrados: BUG-11 (email sin dominio o sin punto), BUG-12 (botón de login habilitado unos 5 s antes del timer), BUG-13 (Completado y Certificado pasan a En progreso), BUG-14 (cerrar sesión no reinicia el progreso) y BUG-15 (el CV acepta cualquier archivo). BUG-08 se reformuló con fechas en UTC: el servidor acepta un inicio a hoy + 31 días y rechaza hoy + 32. CP-30, CP-65, CP-66, CP-82 y CP-84 son nuevas manifestaciones de BUG-02; CP-76 y CP-87 de BUG-10. CP-46 es una observación fuera de la spec.

## Matriz de trazabilidad REQ → CP

| REQ | Casos | Cobertura | Observación |
|---|---|---|---|
| REQ-R01 | CP-17, CP-18, CP-73, CP-74, CP-75 | Parcial | solo por API; el formulario de `/registro` no se ejercitó con campos vacíos |
| REQ-R02 | CP-01, CP-02, CP-03, CP-04 | Cubierto |  |
| REQ-R03 | CP-13, CP-14, CP-15, CP-16, CP-68, CP-69, CP-70, CP-71, CP-72 | Cubierto |  |
| REQ-R04 | CP-05, CP-06, CP-07, CP-08 | Cubierto |  |
| REQ-R05 | CP-09, CP-10, CP-11, CP-12 | Cubierto |  |
| REQ-R06 | CP-20 | Cubierto |  |
| REQ-R07 | CP-19 | Cubierto |  |
| REQ-L01 | CP-22 | Parcial | solo falta la contraseña (CP-22) y por API; no se probó el email ausente ni el formulario |
| REQ-L02 | CP-21 | Cubierto |  |
| REQ-L03 | CP-23, CP-24, CP-76, CP-77, CP-78, CP-87 | Cubierto |  |
| REQ-L04 | CP-25 | Cubierto |  |
| REQ-C01 | CP-26 | Cubierto |  |
| REQ-C02 | CP-27, CP-28, CP-29, CP-30, CP-82, CP-83, CP-84, CP-85 | Parcial | las cuatro combinaciones y dos cadenas más, solo por API; la inscripción por UI se cubre en la Fase 2 (E2E) |
| REQ-C03 | CP-31, CP-65, CP-66 | Cubierto |  |
| REQ-C04 | CP-32, CP-67 | Cubierto |  |
| REQ-C05 | CP-28, CP-67 | Parcial | CP-28 y CP-67 miden el `status` de la API; el badge "Lista de espera" de la UI no se revisó |
| REQ-C06 | CP-29, CP-30 | Parcial | validado por API (CP-29, CP-30); no se comparó con la UI, que se cubre en la Fase 2 |
| REQ-P01 | CP-36 a CP-44, CP-60 a CP-64 | Parcial | indirecto: los cinco estados aparecen en las transiciones CP-36 a CP-44 y CP-60 a CP-64 |
| REQ-P02 | CP-36, CP-37, CP-38, CP-39, CP-40, CP-41, CP-42, CP-43, CP-44, CP-45, CP-60, CP-61, CP-62, CP-63, CP-64 | Parcial | 5 transiciones válidas y 9 prohibidas; no se probaron todas las combinaciones inválidas (p. ej. Abandonado → Certificado) |
| REQ-P03 | CP-41, CP-42, CP-43, CP-44, CP-60, CP-61, CP-62, CP-63, CP-64 | Cubierto |  |
| REQ-P04 | CP-45 | Cubierto |  |
| REQ-P05 | CP-27 | Parcial | solo por API (CP-27: el curso dependiente se puede inscribir); no se vio el catálogo actualizado en la UI |
| REQ-S01 | CP-46, CP-47, CP-48, CP-86 | Cubierto |  |
| REQ-S02 | CP-49 | Cubierto | una sola ejecución (CP-49) con la cuenta de prueba compartida |
| REQ-A01 | CP-35 | Cubierto |  |
| REQ-A02 | CP-28, CP-29, CP-34 | Parcial | curso inexistente, cupo y prerequisito por API; no se comparó con las reglas de la UI |
| REQ-A03 | CP-29, CP-33, CP-34, CP-35 | Cubierto |  |
| REQ-D01 | CP-53 | Diseñado, sin ejecutar |  |
| REQ-D02 | CP-50, CP-51, CP-79, CP-80, CP-93 | Cubierto |  |
| REQ-D03 | CP-52, CP-81 | Parcial | solo el caso aceptado (CP-81); el rechazo (CP-52) no se ejecutó |
| REQ-N01 | CP-54 | Cubierto |  |
| REQ-N02 | CP-55 | Cubierto |  |
| REQ-N03 | CP-56 | Cubierto |  |
| REQ-U01 | CP-57 | Cubierto |  |
| REQ-U02 | CP-57, CP-58, CP-88, CP-91, CP-92 | Cubierto |  |
| REQ-U03 | CP-59, CP-89, CP-90 | Cubierto |  |

REQ sin ningún caso: ninguno. REQ con casos diseñados pero sin ejecutar: REQ-D01.

---

### CP-01 · Nombre de 1 carácter se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-R02
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: nombre = `M` (1 carácter)
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo con error de validación en `name` (rango 2–50).
- **Resultado obtenido:** len(nombre)=1, len(pw)=11, edad=29; HTTP 422 {"name":"El nombre debe tener entre 2 y 50 caracteres"}. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-02 · Nombre de 2 caracteres se acepta
- **Técnica:** valores límite
- **REQ que valida:** REQ-R02
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: nombre = `Ro` (2 caracteres)
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Registro exitoso (201).
- **Resultado obtenido:** len(nombre)=2, len(pw)=11, edad=29; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-03 · Nombre de 50 caracteres se acepta
- **Técnica:** valores límite
- **REQ que valida:** REQ-R02
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: nombre de exactamente 50 caracteres = `Marcela Quispe Huamán de la Cruz y Mamani Flores P`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Registro exitoso (201).
- **Resultado obtenido:** len(nombre)=50, len(pw)=11, edad=29; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-04 · Nombre de 51 caracteres se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-R02
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: nombre de 51 caracteres = `Marcela Quispe Huamán de la Cruz y Mamani Flores Pi`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo con error de validación en `name`.
- **Resultado obtenido:** len(nombre)=51, len(pw)=11, edad=29; HTTP 422 {"name":"El nombre debe tener entre 2 y 50 caracteres"}. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-05 · Contraseña de 7 caracteres se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-R04
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: contraseña `Lm#26qa` (7)
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo con error en `password` (rango 8–64).
- **Resultado obtenido:** len(nombre)=21, len(pw)=7, edad=29; HTTP 422 {"password":"La contraseña debe tener al menos 8 caracteres"}. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-06 · Contraseña de 8 caracteres se acepta
- **Técnica:** valores límite
- **REQ que valida:** REQ-R04
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: contraseña `Lma#26qa` (8)
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Registro exitoso (201).
- **Resultado obtenido:** len(nombre)=21, len(pw)=8, edad=29; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-07 · Contraseña de 64 caracteres se acepta
- **Técnica:** valores límite
- **REQ que valida:** REQ-R04
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: contraseña `Lima#2026qa` + `x` hasta 64 caracteres
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Registro exitoso (201).
- **Resultado obtenido:** len(nombre)=21, len(pw)=64, edad=29; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-08 · Contraseña de 65 caracteres se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-R04
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: contraseña `Lima#2026qa` + `x` hasta 65 caracteres
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo (4xx): la spec dice "Una de 65 también" debe rechazarse.
- **Resultado obtenido:** len(nombre)=21, len(pw)=65, edad=29; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-04)

### CP-09 · Edad 15 se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-R05
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: edad = 15
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo con error en `age` (rango 16–99).
- **Resultado obtenido:** len(nombre)=21, len(pw)=11, edad=15; HTTP 422 {"age":"Debes tener al menos 16 años"}. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-10 · Edad 16 se acepta
- **Técnica:** valores límite
- **REQ que valida:** REQ-R05
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: edad = 16
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Registro exitoso (201).
- **Resultado obtenido:** len(nombre)=21, len(pw)=11, edad=16; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-11 · Edad 99 se acepta
- **Técnica:** valores límite
- **REQ que valida:** REQ-R05
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: edad = 99
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Registro exitoso (201).
- **Resultado obtenido:** len(nombre)=21, len(pw)=11, edad=99; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-12 · Edad 100 se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-R05
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: edad = 100
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo con error en `age`.
- **Resultado obtenido:** len(nombre)=21, len(pw)=11, edad=100; HTTP 422 {"age":"La edad máxima es 99"}. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-13 · Email `usuario@` (sin dominio) se rechaza
- **Técnica:** partición
- **REQ que valida:** REQ-R03
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: email = `usuario@`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo: la spec lista `usuario@` como no válido.
- **Resultado obtenido:** email=usuario@; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-11)

### CP-14 · Email `usuario` (sin @) se rechaza
- **Técnica:** partición
- **REQ que valida:** REQ-R03
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: email = `usuario`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo: la spec lista `usuario` como no válido.
- **Resultado obtenido:** email=usuario; HTTP 422 {"email":"El email no tiene un formato válido"}. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-15 · Email con dominio sin punto se rechaza
- **Técnica:** partición
- **REQ que valida:** REQ-R03
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: email = `lucia.mamani@yopmail`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo: la spec exige "un @ seguido de un dominio con punto".
- **Resultado obtenido:** email=lucia.mamani@yopmail; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-11)

### CP-16 · Email con formato válido `nombre.apellido@yopmail.com` se acepta
- **Técnica:** partición
- **REQ que valida:** REQ-R03
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: email = `lucia.mamani.<timestamp>@yopmail.com`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Registro exitoso (201).
- **Resultado obtenido:** email=lucia.mamani.179445557964516@yopmail.com; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-17 · Los cuatro campos vacíos se rechazan
- **Técnica:** partición
- **REQ que valida:** REQ-R01
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** `{name:'', email:'', password:'', age:''}`
- **Pasos:**
  1. `POST /api/register` con todo vacío.
  2. Revisar los errores devueltos.
- **Resultado esperado (según la spec):** Rechazo con un error por cada campo obligatorio (nombre, email, contraseña, edad).
- **Resultado obtenido:** HTTP 422; errores por campo: name,email,password,age. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-18 · Falta solo el email
- **Técnica:** partición
- **REQ que valida:** REQ-R01
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** Body sin la clave `email`; el resto válido.
- **Pasos:**
  1. `POST /api/register` sin `email`.
  2. Revisar errores.
- **Resultado esperado (según la spec):** Rechazo con error en `email`.
- **Resultado obtenido:** HTTP 422; errores: email. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-19 · Email ya registrado se rechaza
- **Técnica:** partición
- **REQ que valida:** REQ-R07
- **Precondición:** Ninguna; el caso crea la cuenta.
- **Datos de prueba:** Renzo Cáceres, `renzo.caceres.<timestamp>@yopmail.com`, `Lima#2026qa`, 29; luego el mismo email con nombre `Renzo Cáceres Pinto`.
- **Pasos:**
  1. `POST /api/register` (alta inicial).
  2. `POST /api/register` con el mismo email.
- **Resultado esperado (según la spec):** 1.º 201; 2.º rechazado (4xx) por email duplicado.
- **Resultado obtenido:** 1.er registro HTTP 201; 2.o con el mismo email HTTP 422. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-20 · El formulario de registro queda vacío tras un alta exitosa
- **Técnica:** partición
- **REQ que valida:** REQ-R06
- **Precondición:** Navegador en `/registro`, sin sesión.
- **Datos de prueba:** Marcela Quispe Huamán, `marcela.quispe.<timestamp>@yopmail.com`, `Lima#2026qa`, 29.
- **Pasos:**
  1. Abrir `/registro` y completar los cuatro campos.
  2. Pulsar "Crear cuenta".
  3. Leer el valor de los cuatro campos.
- **Resultado esperado (según la spec):** Mensaje de éxito y los cuatro campos vacíos.
- **Resultado obtenido:** El alta responde 201 y aparece "¡Registro exitoso!", pero nombre, email, contraseña y edad conservan los valores. Evidencia: [antes](evidencia/cp01-registro-antes.png), [después](evidencia/cp01-registro-despues.png).
- **Estado:** FALLA → posible bug (BUG-09)

### CP-21 · Login con contraseña incorrecta muestra error
- **Técnica:** partición
- **REQ que valida:** REQ-L02
- **Precondición:** Cuenta registrada (`lucia.mamani.<timestamp>@yopmail.com`).
- **Datos de prueba:** Email correcto, contraseña `Cusco#2027xx` (incorrecta).
- **Pasos:**
  1. `POST /api/login` con la contraseña incorrecta.
- **Resultado esperado (según la spec):** Error de credenciales (4xx), sin sesión.
- **Resultado obtenido:** HTTP 401 {"error":"Email o contraseña incorrectos","attempts":1,"remaining":4}. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-22 · Login sin contraseña se rechaza
- **Técnica:** partición
- **REQ que valida:** REQ-L01
- **Precondición:** Ninguna.
- **Datos de prueba:** Body solo con `email` (`renzo.caceres.<timestamp>@yopmail.com`).
- **Pasos:**
  1. `POST /api/login` sin `password`.
- **Resultado esperado (según la spec):** Rechazo (4xx): email y contraseña son obligatorios.
- **Resultado obtenido:** HTTP 400 {"error":"Email y contraseña son obligatorios"}. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-23 · Cinco intentos fallidos bloquean la cuenta (no antes)
- **Técnica:** temporal
- **REQ que valida:** REQ-L03
- **Precondición:** Navegador en `/login`, sin bloqueo activo. Cuenta inexistente (no se usa ninguna credencial real).
- **Datos de prueba:** Email `sin.cuenta.<timestamp>@yopmail.com`; contraseñas incorrectas distintas por intento.
- **Pasos:**
  1. Intentar entrar 4 veces y observar el botón tras cada intento.
  2. Intentar un 5.º intento.
  3. Observar mensaje de bloqueo y botón.
- **Resultado esperado (según la spec):** Los intentos 1–4 dejan el botón activo; tras el 5.º aparece el bloqueo de 30 s y el botón se deshabilita.
- **Resultado obtenido:** El bloqueo aparece tras el 4.º intento ("Demasiados intentos fallidos. Cuenta bloqueada por 30 segundos.", botón "Bloqueado"). Reproducido en 3 ejecuciones (`BLOQUEADO_TRAS=4`). Evidencia: [cp02-bloqueo.png](evidencia/cp02-bloqueo.png).
- **Estado:** FALLA → posible bug (BUG-10)

### CP-24 · Durante el bloqueo el botón de login está deshabilitado
- **Técnica:** temporal
- **REQ que valida:** REQ-L03
- **Precondición:** Navegador en `/login`, sin bloqueo activo (35 s desde la prueba anterior que bloqueó el login). Cuenta inexistente.
- **Datos de prueba:** Email `sin.cuenta.<timestamp>@yopmail.com`; contraseñas incorrectas distintas por intento. Espera real de 30 s, sin `waitForTimeout`.
- **Pasos:**
  1. Provocar el bloqueo con intentos fallidos.
  2. Muestrear el estado del botón cada 100 ms hasta que se habilite.
- **Resultado esperado (según la spec):** El botón permanece deshabilitado durante todo el bloqueo.
- **Resultado obtenido:** bloqueo tras 4 intentos; boton deshabilitado en 250 muestras seguidas durante 25101 ms y habilitado al final. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-25 · Mensaje de bienvenida con el nombre del usuario
- **Técnica:** partición
- **REQ que valida:** REQ-L04
- **Precondición:** Cuenta de prueba que el sitio publica en `/login` (compartida: su estado puede haber sido modificado por otras personas; no se asumen valores).
- **Datos de prueba:** cuenta de prueba del sitio (leída de /login).
- **Pasos:**
  1. Abrir `/login` y leer las credenciales del recuadro de práctica.
  2. Entrar con ellas.
  3. Leer el saludo y el nombre de usuario de la cabecera.
- **Resultado esperado (según la spec):** Mensaje de bienvenida que incluye el nombre del usuario.
- **Resultado obtenido:** saludo: "¡Hola, Ana!"; usuario en la cabecera: "Ana García · práctica". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-26 · El catálogo muestra título, descripción, nivel, duración, prerequisito y cupos
- **Técnica:** partición
- **REQ que valida:** REQ-C01
- **Precondición:** Cuenta de prueba que el sitio publica en `/login` (compartida: su estado puede haber sido modificado por otras personas; no se asumen valores).
- **Datos de prueba:** Cuenta: cuenta de prueba del sitio (leída de /login). Catálogo de `/cursos` (tantas tarjetas como cursos en `GET /api/courses`).
- **Pasos:**
  1. Iniciar sesión y abrir `/cursos` con la navegación interna.
  2. Comprobar en cada tarjeta los seis datos.
  3. Contar las tarjetas frente a `GET /api/courses`.
- **Resultado esperado (según la spec):** Cada curso muestra los seis datos y no falta ninguno del catálogo.
- **Resultado obtenido:** 12 tarjetas en la UI (la API lista 12 cursos); todas muestran los seis datos. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-27 · C02 · Prerequisito completado y cupo disponible → Inscrito
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C02, REQ-P05
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Curso destino y prerequisito según el caso (ver pasos).
- **Pasos:**
  1. Inscribir `fundamentos`, `comenzar` y `completar`.
  2. `POST /api/enroll` con `playwright-cero` (hay cupo).
  3. Leer status y `status` del cuerpo.
- **Resultado esperado (según la spec):** 200 con `status: "inscrito"`. Completar el prerequisito desbloquea el curso.
- **Resultado obtenido:** HTTP 200 status=inscrito. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-28 · C02 · Prerequisito completado y sin cupo → Lista de espera
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C02, REQ-C05, REQ-A02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso con cupo 0 localizado en `GET /api/courses` (`api-testing`, 20/20).
- **Datos de prueba:** Curso destino y prerequisito según el caso (ver pasos).
- **Pasos:**
  1. Completar `fundamentos` y `playwright-cero` (comenzar + completar).
  2. `POST /api/enroll` con `api-testing`.
- **Resultado esperado (según la spec):** 200 con `status: "lista-espera"`.
- **Resultado obtenido:** curso api-testing (20/20); HTTP 200 status=lista-espera. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-29 · C02 · Prerequisito pendiente y cupo disponible → Rechazado
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C02, REQ-C06, REQ-A02, REQ-A03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Curso destino y prerequisito según el caso (ver pasos).
- **Pasos:**
  1. Sin completar nada, `POST /api/enroll` con `playwright-cero` (requiere `fundamentos`, hay cupo).
  2. `GET /api/progress` y comprobar que `playwright-cero` no figura como inscrito.
- **Resultado esperado (según la spec):** 403 (prerequisito no completado) y el curso no queda inscrito.
- **Resultado obtenido:** HTTP 200 status=inscrito; GET /api/progress lista playwright-cero (queda inscrito). Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-02)

### CP-30 · C02 · Prerequisito pendiente y sin cupo → Rechazado
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C02, REQ-C06
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso con cupo 0 (`api-testing`, 20/20).
- **Datos de prueba:** Curso destino y prerequisito según el caso (ver pasos).
- **Pasos:**
  1. Sin completar nada, `POST /api/enroll` con `api-testing` (requiere `playwright-cero`).
- **Resultado esperado (según la spec):** Rechazo (403): la tabla dice "Rechazado", no lista de espera.
- **Resultado obtenido:** curso api-testing (20/20); HTTP 200 status=lista-espera. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-02)

### CP-31 · Estar En progreso no desbloquea el curso dependiente
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Curso `fundamentos` en En progreso; destino `playwright-cero`.
- **Pasos:**
  1. Inscribir `fundamentos` y `comenzar` (sin completar).
  2. `POST /api/enroll` con `playwright-cero`.
- **Resultado esperado (según la spec):** 403: estar en progreso no cuenta como completado.
- **Resultado obtenido:** fundamentos En progreso; enroll playwright-cero HTTP 200. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-02)

### CP-32 · El cupo disponible baja en 1 al inscribirse
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C04
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Curso `programacion-qa` (sin prerequisito, 20 cupos libres al ejecutar).
- **Pasos:**
  1. Leer cupos libres (`maxStudents - enrolled`) en `GET /api/courses`.
  2. `POST /api/enroll` con `programacion-qa`.
  3. Leer de nuevo los cupos libres.
- **Resultado esperado (según la spec):** Inscripción 200 y cupos libres = anterior − 1.
- **Resultado obtenido:** enroll HTTP 200; libres antes=20, despues=20. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-03)

### CP-33 · POST /api/enroll sin courseId → 400
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-A03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Body `{}`.
- **Pasos:**
  1. `POST /api/enroll` con body vacío.
- **Resultado esperado (según la spec):** 400.
- **Resultado obtenido:** HTTP 400. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-34 · POST /api/enroll con curso inexistente → 404
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-A03, REQ-A02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** `courseId = "curso-que-no-existe"`.
- **Pasos:**
  1. `POST /api/enroll` con ese id.
- **Resultado esperado (según la spec):** 404.
- **Resultado obtenido:** HTTP 404. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-35 · POST /api/enroll a curso sin prerequisito → 200 inscrito
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-A01, REQ-A03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** `courseId = "fundamentos"`.
- **Pasos:**
  1. `POST /api/enroll` con `{ courseId: "fundamentos" }`.
- **Resultado esperado (según la spec):** 200 con `status: "inscrito"`.
- **Resultado obtenido:** HTTP 200 status=inscrito. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-36 · Transición válida Inscrito → En progreso
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Inscrito** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=comenzar`.
- **Pasos:**
  1. Llevar `fundamentos` a Inscrito.
  2. `POST /api/progress` con `action: "comenzar"`.
  3. Leer status, estado resultante.
- **Resultado esperado (según la spec):** 200; estado En progreso.
- **Resultado obtenido:** accion "comenzar" desde inscrito: HTTP 200, estado resultante=en-progreso. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-37 · Transición válida En progreso → Completado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **En progreso** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=completar`.
- **Pasos:**
  1. Llevar `fundamentos` a En progreso.
  2. `POST /api/progress` con `action: "completar"`.
  3. Leer status, estado resultante.
- **Resultado esperado (según la spec):** 200; estado Completado.
- **Resultado obtenido:** accion "completar" desde en-progreso: HTTP 200, estado resultante=completado. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-38 · Transición válida Completado → Certificado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Completado** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=certificar`.
- **Pasos:**
  1. Llevar `fundamentos` a Completado.
  2. `POST /api/progress` con `action: "certificar"`.
  3. Leer status, estado resultante.
- **Resultado esperado (según la spec):** 200; estado Certificado.
- **Resultado obtenido:** accion "certificar" desde completado: HTTP 200, estado resultante=certificado. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-39 · Transición válida Inscrito → Abandonado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Inscrito** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=abandonar`.
- **Pasos:**
  1. Llevar `fundamentos` a Inscrito.
  2. `POST /api/progress` con `action: "abandonar"`.
  3. Leer status, estado resultante.
- **Resultado esperado (según la spec):** 200; estado Abandonado.
- **Resultado obtenido:** accion "abandonar" desde inscrito: HTTP 200, estado resultante=abandonado. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-40 · Transición válida En progreso → Abandonado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **En progreso** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=abandonar`.
- **Pasos:**
  1. Llevar `fundamentos` a En progreso.
  2. `POST /api/progress` con `action: "abandonar"`.
  3. Leer status, estado resultante.
- **Resultado esperado (según la spec):** 200; estado Abandonado.
- **Resultado obtenido:** accion "abandonar" desde en-progreso: HTTP 200, estado resultante=abandonado. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-41 · Transición prohibida Inscrito → Completado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02, REQ-P03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Inscrito** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=completar`.
- **Pasos:**
  1. Llevar `fundamentos` a Inscrito.
  2. `POST /api/progress` con `action: "completar"`.
  3. Leer status, estado resultante y mensaje de error (solo se verifica que exista, no su texto).
- **Resultado esperado (según la spec):** Rechazo (4xx) con mensaje de error; el estado sigue Inscrito.
- **Resultado obtenido:** accion "completar" desde inscrito: HTTP 422, estado resultante=inscrito, mensaje de error="Transición inválida: inscrito → completado". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-42 · Transición prohibida Abandonado → En progreso
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02, REQ-P03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Abandonado** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=retomar`.
- **Pasos:**
  1. Llevar `fundamentos` a Abandonado.
  2. `POST /api/progress` con `action: "retomar"`.
  3. Leer status, estado resultante y mensaje de error (solo se verifica que exista, no su texto).
- **Resultado esperado (según la spec):** Rechazo (4xx) con mensaje de error; Abandonado es terminal y el estado no cambia.
- **Resultado obtenido:** accion "retomar" desde abandonado: HTTP 200, estado resultante=en-progreso, mensaje de error="Transición exitosa: abandonado → en-progreso". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-05)

### CP-43 · Transición prohibida Completado → Abandonado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02, REQ-P03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Completado** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=abandonar`.
- **Pasos:**
  1. Llevar `fundamentos` a Completado.
  2. `POST /api/progress` con `action: "abandonar"`.
  3. Leer status, estado resultante y mensaje de error (solo se verifica que exista, no su texto).
- **Resultado esperado (según la spec):** Rechazo (4xx) con mensaje de error; Completado solo admite Certificado.
- **Resultado obtenido:** accion "abandonar" desde completado: HTTP 422, estado resultante=completado, mensaje de error="Transición inválida: completado → abandonado". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-44 · Transición prohibida Certificado → Abandonado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02, REQ-P03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Certificado** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=abandonar`.
- **Pasos:**
  1. Llevar `fundamentos` a Certificado.
  2. `POST /api/progress` con `action: "abandonar"`.
  3. Leer status, estado resultante y mensaje de error (solo se verifica que exista, no su texto).
- **Resultado esperado (según la spec):** Rechazo (4xx) con mensaje de error; Certificado es final.
- **Resultado obtenido:** accion "abandonar" desde certificado: HTTP 422, estado resultante=certificado, mensaje de error="Transición inválida: certificado → abandonado". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-45 · Certificar de nuevo un curso ya Certificado se rechaza y no duplica el certificado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P04, REQ-P02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. `fundamentos` ya Certificado (certificates = 1).
- **Datos de prueba:** `courseId=fundamentos`, `action=certificar` repetido.
- **Pasos:**
  1. Llevar `fundamentos` a Certificado.
  2. Repetir `certificar`.
  3. Leer status, mensaje de error y `certificates`.
- **Resultado esperado (según la spec):** Rechazo (4xx) con mensaje de error, porque Certificado es estado final (REQ-P02), y `certificates` sigue en 1.
- **Resultado obtenido:** 2.o certificar HTTP 200, certificates=2, mensaje de error="Transición exitosa: certificado → certificado". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-06)

### CP-46 · Observación: /api/auth/me devuelve al usuario tras el login
- **Técnica:** autorización
- **REQ que valida:** REQ-S01
- **Precondición:** Usuario nuevo registrado.
- **Datos de prueba:** Login con las credenciales del alta. Nota: `/api/auth/me` no está en la spec; no es un caso derivado de ella, sino una observación hecha con DevTools (REQ-S01 se cita solo como referencia de autenticación).
- **Pasos:**
  1. Registrar y hacer login.
  2. `GET /api/auth/me` en el mismo contexto.
- **Resultado esperado (según la spec):** Criterio de observación (no de la spec): 200 con el usuario autenticado, no `realUser: null`.
- **Resultado obtenido:** HTTP 200, realUser=null. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-01; observación, fuera de la spec)

### CP-47 · /cursos sin sesión pide iniciar sesión
- **Técnica:** autorización
- **REQ que valida:** REQ-S01
- **Precondición:** Navegador sin sesión.
- **Datos de prueba:** Ruta `/cursos`.
- **Pasos:**
  1. Abrir `/cursos` sin iniciar sesión.
- **Resultado esperado (según la spec):** Mensaje que pide iniciar sesión.
- **Resultado obtenido:** mensaje visible: "Necesitas iniciar sesión para acceder a esta página.". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-48 · /mi-progreso sin sesión pide iniciar sesión
- **Técnica:** autorización
- **REQ que valida:** REQ-S01
- **Precondición:** Navegador sin sesión.
- **Datos de prueba:** Ruta `/mi-progreso`.
- **Pasos:**
  1. Abrir `/mi-progreso` sin iniciar sesión.
- **Resultado esperado (según la spec):** Mensaje que pide iniciar sesión.
- **Resultado obtenido:** mensaje visible: "Necesitas iniciar sesión para acceder a esta página.". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-49 · Cerrar sesión reinicia el progreso
- **Técnica:** autorización
- **REQ que valida:** REQ-S02
- **Precondición:** Cuenta de prueba que el sitio publica en `/login` (compartida: su estado puede haber sido modificado por otras personas; no se asumen valores).
- **Datos de prueba:** Cuenta: cuenta de prueba del sitio (leída de /login); curso `fundamentos`.
- **Pasos:**
  1. Iniciar sesión, inscribir `fundamentos` y comprobar que aparece en `/mi-progreso`.
  2. Pulsar "Cerrar sesión".
  3. Entrar de nuevo con la navegación interna (sin recargar) y abrir `/mi-progreso`.
- **Resultado esperado (según la spec):** Sin cursos inscritos ("Aún no tienes cursos").
- **Resultado obtenido:** antes de cerrar sesion "Fundamentos de Testing" listado=true; tras volver a entrar sin cursos=false. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`. Cuenta compartida: otra persona pudo dejar cursos inscritos antes; el caso inscribe `fundamentos` y compara lo que queda listado.
- **Estado:** FALLA → posible bug (BUG-14)

### CP-50 · Fecha de inicio a hoy + 30 días se acepta
- **Técnica:** valores límite
- **REQ que valida:** REQ-D02
- **Precondición:** Navegador en `/reserva`. Las fechas se calculan en UTC (el servidor usa UTC para "hoy").
- **Datos de prueba:** Inicio = hoy (UTC) + 30 días; fin = 3 días después.
- **Pasos:**
  1. Completar las fechas.
  2. Pulsar "Reservar".
- **Resultado esperado (según la spec):** Reserva aceptada (límite superior inclusivo).
- **Resultado obtenido:** inicio=2026-12-12, fin=2026-12-15; "Reserva confirmada" visible. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-51 · Fecha de inicio a hoy + 31 días se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-D02
- **Precondición:** Navegador en `/reserva`. Las fechas se calculan en UTC (el servidor usa UTC para "hoy").
- **Datos de prueba:** Inicio = hoy (UTC) + 31 días; fin = 3 días después.
- **Pasos:**
  1. Completar las fechas.
  2. Pulsar "Reservar".
- **Resultado esperado (según la spec):** Rechazo con mensaje de error: la spec dice que 31 días debe rechazarse.
- **Resultado obtenido:** inicio=2026-12-13, fin=2026-12-16; "Reserva confirmada" visible. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`. Evidencia: [cp05-31-dias.png](evidencia/cp05-31-dias.png); control +30 días: [cp06-30-dias.png](evidencia/cp06-30-dias.png).
- **Estado:** FALLA → posible bug (BUG-08)

### CP-52 · Fecha de fin igual o anterior al inicio se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-D03
- **Precondición:** Navegador en `/reserva`. Las fechas se calculan en UTC (el servidor usa UTC para "hoy").
- **Datos de prueba:** Inicio = hoy (UTC) + 5 días; fin = el mismo día y fin = el día anterior (dos resultados con la misma precondición y datos; se mantienen en un solo caso).
- **Pasos:**
  1. Completar con fin = inicio y pulsar "Reservar".
  2. Repetir con fin = inicio − 1 día.
- **Resultado esperado (según la spec):** Rechazo en ambos casos.
- **Resultado obtenido:** No se ejecutó.
- **Estado:** NO EJECUTADO (se priorizó el límite aceptado, CP-81; queda pendiente en `docs/reporte-de-bugs.md`)

### CP-53 · Fechas de inicio y fin obligatorias
- **Técnica:** partición
- **REQ que valida:** REQ-D01
- **Precondición:** Navegador en `/reserva`. Las fechas se calculan en UTC (el servidor usa UTC para "hoy").
- **Datos de prueba:** Cada fecha vacía por separado (dos resultados con la misma precondición; se mantienen en un solo caso).
- **Pasos:**
  1. Dejar vacío el inicio y reservar.
  2. Repetir con el fin vacío.
- **Resultado esperado (según la spec):** Rechazo indicando el campo obligatorio.
- **Resultado obtenido:** No se ejecutó.
- **Estado:** NO EJECUTADO (no se sondeó en el tiempo disponible; queda pendiente en `docs/reporte-de-bugs.md`)

### CP-54 · Cada página muestra 10 registros
- **Técnica:** valores límite
- **REQ que valida:** REQ-N01
- **Precondición:** Navegador en `/estudiantes`, 25 estudiantes en el listado.
- **Datos de prueba:** Página 1 del listado.
- **Pasos:**
  1. Abrir `/estudiantes`.
  2. Contar las filas de la página 1.
- **Resultado esperado (según la spec):** 10 filas en la página 1.
- **Resultado obtenido:** La página 1 muestra 11 filas (#1 a #11). Evidencia: [cp04-pagina1.png](evidencia/cp04-pagina1.png).
- **Estado:** FALLA → posible bug (BUG-07)

### CP-55 · 25 estudiantes producen 3 páginas y ninguno queda inalcanzable
- **Técnica:** valores límite
- **REQ que valida:** REQ-N02
- **Precondición:** Navegador en `/estudiantes`, 25 estudiantes en el listado.
- **Datos de prueba:** 25 estudiantes, pageSize 10 → ceil(25/10) = 3.
- **Pasos:**
  1. Leer el indicador de páginas.
  2. Recorrer todas las páginas con "Siguiente".
- **Resultado esperado (según la spec):** "página 1 de 3"; páginas de 10, 10 y 5; los 25 estudiantes son alcanzables.
- **Resultado obtenido:** Indica "página 1 de 2": los estudiantes #22 a #25 son inalcanzables. Evidencia: [cp04-pagina1.png](evidencia/cp04-pagina1.png).
- **Estado:** FALLA → posible bug (BUG-07)

### CP-56 · Ningún registro se repite entre páginas
- **Técnica:** valores límite
- **REQ que valida:** REQ-N03
- **Precondición:** Navegador en `/estudiantes`, 25 estudiantes en el listado.
- **Datos de prueba:** Páginas 1 y 2 del listado.
- **Pasos:**
  1. Anotar los registros de la página 1.
  2. Pulsar "Siguiente →".
  3. Comparar con la página 2.
- **Resultado esperado (según la spec):** Ningún registro de la página 2 aparece en la página 1; la página 2 empieza en #11.
- **Resultado obtenido:** La página 2 empieza en #11 (Karen Ávila), repetido de la página 1. Evidencia: [cp04-pagina2.png](evidencia/cp04-pagina2.png).
- **Estado:** FALLA → posible bug (BUG-07)

### CP-57 · Subida de CV: un PDF válido pequeño se acepta
- **Técnica:** partición
- **REQ que valida:** REQ-U01, REQ-U02
- **Precondición:** Navegador en `/perfil` (campo `cv-input` sin atributo `accept`; el texto dice "Solo se acepta un archivo PDF de hasta 2 MB"). Archivos generados en memoria. "2 MB" se interpreta como 2 097 152 bytes porque la spec no define el MB.
- **Datos de prueba:** `CV_Lucia_Mamani_Flores.pdf`: cabecera `%PDF-1.4` y 1 200 bytes.
- **Pasos:**
  1. Abrir `/perfil`.
  2. Elegir el archivo y pulsar "Subir CV".
  3. Leer el resultado (`cv-result`).
- **Resultado esperado (según la spec):** Archivo aceptado.
- **Resultado obtenido:** PDF de 1 200 bytes; mensaje: "CV subido correctamente". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-58 · Subida de CV: imagen y texto se rechazan
- **Técnica:** partición
- **REQ que valida:** REQ-U02
- **Precondición:** Navegador en `/perfil` (campo `cv-input` sin atributo `accept`; el texto dice "Solo se acepta un archivo PDF de hasta 2 MB"). Archivos generados en memoria. "2 MB" se interpreta como 2 097 152 bytes porque la spec no define el MB.
- **Datos de prueba:** `foto_renzo.png` (cabecera PNG) y `notas.txt` (texto), ambos pequeños (dos resultados con la misma precondición y datos de la misma partición; se mantienen en un solo caso).
- **Pasos:**
  1. Subir la imagen y leer el resultado.
  2. Recargar `/perfil`, subir el texto y leer el resultado.
- **Resultado esperado (según la spec):** Ambos rechazados.
- **Resultado obtenido:** .png: mensaje: "CV subido correctamente"; .txt: mensaje: "CV subido correctamente". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`. Evidencia: [cp58-cv.png](evidencia/cp58-cv-txt.png).
- **Estado:** FALLA → posible bug (BUG-15)

### CP-59 · Subida de CV: un PDF de exactamente 2 MB (2 097 152 bytes) se acepta
- **Técnica:** valores límite
- **REQ que valida:** REQ-U03
- **Precondición:** Navegador en `/perfil` (campo `cv-input` sin atributo `accept`; el texto dice "Solo se acepta un archivo PDF de hasta 2 MB"). Archivos generados en memoria. "2 MB" se interpreta como 2 097 152 bytes porque la spec no define el MB.
- **Datos de prueba:** `CV_Renzo_Caceres.pdf`: cabecera `%PDF-1.4` y exactamente 2 097 152 bytes.
- **Pasos:**
  1. Elegir el archivo y pulsar "Subir CV".
  2. Leer el resultado.
- **Resultado esperado (según la spec):** Aceptado (el límite de 2 MB es inclusivo).
- **Resultado obtenido:** PDF de 2097152 bytes; mensaje: "CV subido correctamente". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-60 · Transición prohibida En progreso → Certificado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02, REQ-P03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **En progreso** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=certificar`.
- **Pasos:**
  1. Llevar `fundamentos` a En progreso.
  2. `POST /api/progress` con `action: "certificar"`.
  3. Leer status, estado resultante y mensaje de error (solo se verifica que exista, no su texto).
- **Resultado esperado (según la spec):** Rechazo (4xx) con mensaje de error; el estado sigue En progreso.
- **Resultado obtenido:** accion "certificar" desde en-progreso: HTTP 422, estado resultante=en-progreso, mensaje de error="Transición inválida: en-progreso → certificado". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-61 · Transición prohibida Inscrito → Certificado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02, REQ-P03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Inscrito** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=certificar`.
- **Pasos:**
  1. Llevar `fundamentos` a Inscrito.
  2. `POST /api/progress` con `action: "certificar"`.
  3. Leer status, estado resultante y mensaje de error (solo se verifica que exista, no su texto).
- **Resultado esperado (según la spec):** Rechazo (4xx) con mensaje de error; el estado sigue Inscrito.
- **Resultado obtenido:** accion "certificar" desde inscrito: HTTP 422, estado resultante=inscrito, mensaje de error="Transición inválida: inscrito → certificado". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-62 · Transición prohibida Completado → En progreso
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02, REQ-P03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Completado** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=comenzar`.
- **Pasos:**
  1. Llevar `fundamentos` a Completado.
  2. `POST /api/progress` con `action: "comenzar"`.
  3. Leer status, estado resultante y mensaje de error (solo se verifica que exista, no su texto).
- **Resultado esperado (según la spec):** Rechazo (4xx) con mensaje de error; el estado sigue Completado.
- **Resultado obtenido:** accion "comenzar" desde completado: HTTP 200, estado resultante=en-progreso, mensaje de error="Transición exitosa: completado → en-progreso". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-13)

### CP-63 · Transición prohibida Certificado → En progreso
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02, REQ-P03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Certificado** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=comenzar`.
- **Pasos:**
  1. Llevar `fundamentos` a Certificado.
  2. `POST /api/progress` con `action: "comenzar"`.
  3. Leer status, estado resultante y mensaje de error (solo se verifica que exista, no su texto).
- **Resultado esperado (según la spec):** Rechazo (4xx) con mensaje de error; Certificado es final.
- **Resultado obtenido:** accion "comenzar" desde certificado: HTTP 200, estado resultante=en-progreso, mensaje de error="Transición exitosa: certificado → en-progreso". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-13)

### CP-64 · Transición prohibida Abandonado → Completado
- **Técnica:** transición de estados
- **REQ que valida:** REQ-P02, REQ-P03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso `fundamentos` llevado al estado **Abandonado** (por `/api/enroll` y `/api/progress`).
- **Datos de prueba:** `courseId=fundamentos`, `action=completar`.
- **Pasos:**
  1. Llevar `fundamentos` a Abandonado.
  2. `POST /api/progress` con `action: "completar"`.
  3. Leer status, estado resultante y mensaje de error (solo se verifica que exista, no su texto).
- **Resultado esperado (según la spec):** Rechazo (4xx) con mensaje de error; Abandonado es terminal.
- **Resultado obtenido:** accion "completar" desde abandonado: HTTP 404, estado resultante=?, mensaje de error="No estás inscrito en este curso". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`. Rechazo con 404 ("No estás inscrito") en vez del 422 de las otras transiciones.
- **Estado:** PASA

### CP-65 · Estar Inscrito no desbloquea el curso dependiente
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Curso `fundamentos` solo Inscrito; destino `playwright-cero`.
- **Pasos:**
  1. Inscribir `fundamentos` (sin comenzar).
  2. `POST /api/enroll` con `playwright-cero`.
- **Resultado esperado (según la spec):** 403: estar inscrito no cuenta como completado.
- **Resultado obtenido:** fundamentos inscrito; enroll playwright-cero HTTP 200 status=inscrito. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-02)

### CP-66 · Un prerequisito Abandonado no desbloquea el curso dependiente
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C03
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Curso `fundamentos` Abandonado; destino `playwright-cero`.
- **Pasos:**
  1. Inscribir `fundamentos` y `abandonar`.
  2. `POST /api/enroll` con `playwright-cero`.
- **Resultado esperado (según la spec):** 403: abandonar no es completar.
- **Resultado obtenido:** fundamentos abandonado; enroll playwright-cero HTTP 200 status=inscrito. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-02)

### CP-67 · Quedar en lista de espera no reduce el cupo
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C04, REQ-C05
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos. Curso con cupo 0 (`api-testing`, 20/20).
- **Datos de prueba:** Cadena `fundamentos` → `playwright-cero` completada; destino `api-testing`.
- **Pasos:**
  1. Completar `fundamentos` y `playwright-cero`.
  2. Leer `enrolled` de `api-testing`.
  3. `POST /api/enroll` con `api-testing` (lista de espera).
  4. Leer `enrolled` otra vez.
- **Resultado esperado (según la spec):** `status: "lista-espera"` y `enrolled` sin cambios (no supera el máximo; la espera no consume cupo).
- **Resultado obtenido:** curso api-testing; status=lista-espera; enrolled antes=20, despues=20 (max 20). Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-68 · Email inválido: sin usuario antes de la @ (`@dominio.com`)
- **Técnica:** partición
- **REQ que valida:** REQ-R03
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: email = `@dominio.com`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo con error de formato en `email`. La spec solo nombra `usuario@` y `usuario`; estas variantes se derivan de "un @ seguido de un dominio con punto".
- **Resultado obtenido:** email="@dominio.com"; HTTP 422 {"email":"El email no tiene un formato válido"}. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-69 · Email inválido: dominio que empieza con punto (`a@.com`)
- **Técnica:** partición
- **REQ que valida:** REQ-R03
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: email = `a@.com`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo con error de formato en `email`. La spec solo nombra `usuario@` y `usuario`; estas variantes se derivan de "un @ seguido de un dominio con punto".
- **Resultado obtenido:** email="a@.com"; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-11)

### CP-70 · Email inválido: dominio que termina en punto (`a@b.`)
- **Técnica:** partición
- **REQ que valida:** REQ-R03
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: email = `a@b.`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo con error de formato en `email`. La spec solo nombra `usuario@` y `usuario`; estas variantes se derivan de "un @ seguido de un dominio con punto".
- **Resultado obtenido:** email="a@b."; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-11)

### CP-71 · Email inválido: doble @ (`a@@b.com`)
- **Técnica:** partición
- **REQ que valida:** REQ-R03
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: email = `a@@b.com`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo con error de formato en `email`. La spec solo nombra `usuario@` y `usuario`; estas variantes se derivan de "un @ seguido de un dominio con punto".
- **Resultado obtenido:** email="a@@b.com"; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-11)

### CP-72 · Email inválido: espacio dentro del email (`lucia mamani@yopmail.com`)
- **Técnica:** partición
- **REQ que valida:** REQ-R03
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** nombre `Marcela Quispe Huamán`, email `marcela.quispe.<timestamp>@yopmail.com`, contraseña `Lima#2026qa`, edad 29; variación: email = `lucia mamani@yopmail.com`
- **Pasos:**
  1. `POST /api/register` con los datos.
  2. Leer status y cuerpo.
- **Resultado esperado (según la spec):** Rechazo con error de formato en `email`. La spec solo nombra `usuario@` y `usuario`; estas variantes se derivan de "un @ seguido de un dominio con punto".
- **Resultado obtenido:** email="lucia mamani@yopmail.com"; HTTP 201. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-11)

### CP-73 · Falta solo el campo nombre
- **Técnica:** partición
- **REQ que valida:** REQ-R01
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** Body sin la clave `name`; el resto válido.
- **Pasos:**
  1. `POST /api/register` sin `name`.
  2. Revisar errores.
- **Resultado esperado (según la spec):** Rechazo con error en `name`.
- **Resultado obtenido:** HTTP 422; errores: name. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-74 · Falta solo el campo contraseña
- **Técnica:** partición
- **REQ que valida:** REQ-R01
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** Body sin la clave `password`; el resto válido.
- **Pasos:**
  1. `POST /api/register` sin `password`.
  2. Revisar errores.
- **Resultado esperado (según la spec):** Rechazo con error en `password`.
- **Resultado obtenido:** HTTP 422; errores: password. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-75 · Falta solo el campo edad
- **Técnica:** partición
- **REQ que valida:** REQ-R01
- **Precondición:** Ninguna sesión necesaria; `POST /api/register` con el resto de campos válidos.
- **Datos de prueba:** Body sin la clave `age`; el resto válido.
- **Pasos:**
  1. `POST /api/register` sin `age`.
  2. Revisar errores.
- **Resultado esperado (según la spec):** Rechazo con error en `age`.
- **Resultado obtenido:** HTTP 422; errores: age. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-76 · Cuenta real: 4 fallos + 1 login exitoso + 1 fallo no bloquea
- **Técnica:** temporal
- **REQ que valida:** REQ-L03
- **Precondición:** Cuenta registrada por API (Lucía Mamani Flores, `lucia.mamani.<timestamp>@yopmail.com`); 35 s desde el bloqueo anterior.
- **Datos de prueba:** 4 contraseñas incorrectas deliberadas (`Cusco#1x` a `Cusco#4x`), la contraseña real y otra incorrecta (`Cusco#5x`).
- **Pasos:**
  1. `POST /api/login` con 4 contraseñas incorrectas consecutivas.
  2. `POST /api/login` con la contraseña correcta.
  3. `POST /api/login` con una contraseña incorrecta.
- **Resultado esperado (según la spec):** Estados `401, 401, 401, 401, 200, 401`: ningún bloqueo (el acierto reinicia la cuenta de fallos consecutivos).
- **Resultado obtenido:** HTTP en orden: 401, 401, 401, 429, 429, 429 (esperado 401,401,401,401,200,401; un 429/423 indica bloqueo). Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`. La 4.ª respuesta ya es 429, es decir, el bloqueo llega con el 4.º fallo.
- **Estado:** FALLA → posible bug (BUG-10)

### CP-77 · Durante el bloqueo un timer visual cuenta los segundos restantes
- **Técnica:** temporal
- **REQ que valida:** REQ-L03
- **Precondición:** Navegador en `/login`, sin bloqueo activo (35 s desde la prueba anterior que bloqueó el login). Cuenta inexistente.
- **Datos de prueba:** Email `sin.cuenta.<timestamp>@yopmail.com`; contraseñas incorrectas distintas por intento. Espera real de 30 s, sin `waitForTimeout`.
- **Pasos:**
  1. Provocar el bloqueo.
  2. Leer el timer (recuadro "Puedes intentar de nuevo en N segundos") cada 100 ms.
- **Resultado esperado (según la spec):** El timer arranca en 30 y desciende hasta 0.
- **Resultado obtenido:** timer visible: primera lectura=30, lecturas distintas=26, decreciente=true. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-78 · El botón se habilita exactamente cuando el timer llega a 0
- **Técnica:** temporal
- **REQ que valida:** REQ-L03
- **Precondición:** Navegador en `/login`, sin bloqueo activo (35 s desde la prueba anterior que bloqueó el login). Cuenta inexistente.
- **Datos de prueba:** Email `sin.cuenta.<timestamp>@yopmail.com`; contraseñas incorrectas distintas por intento. Espera real de 30 s, sin `waitForTimeout`.
- **Pasos:**
  1. Provocar el bloqueo.
  2. Muestrear botón y timer cada 100 ms.
  3. Comparar el instante en que el botón se habilita con el valor del timer.
- **Resultado esperado (según la spec):** El botón se habilita en el mismo instante en que el timer llega a 0 (bloqueo de 30 s).
- **Resultado obtenido:** muestras con boton habilitado y timer>0: 1; tiempo entre timer=0 (o timer retirado) y boton habilitado: null ms; duracion total del bloqueo observado: 25101 ms; ultimas muestras [ms, boton deshabilitado, timer]: [[24915,true,6],[25005,true,6],[25101,false,5]]. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-12)

### CP-79 · Fecha de inicio = hoy se acepta
- **Técnica:** valores límite
- **REQ que valida:** REQ-D02
- **Precondición:** Navegador en `/reserva`. Las fechas se calculan en UTC (el servidor usa UTC para "hoy").
- **Datos de prueba:** Inicio = hoy (UTC); fin = hoy + 3 días.
- **Pasos:**
  1. Completar las fechas.
  2. Pulsar "Reservar".
- **Resultado esperado (según la spec):** Reserva aceptada (el rango empieza "entre hoy" e incluye hoy).
- **Resultado obtenido:** inicio=2026-11-12, fin=2026-11-15; "Reserva confirmada" visible. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`. Una primera medición con "hoy" en hora local de Lima (2026-11-11, ya 2026-11-12 en UTC) se rechazó; fue un falso positivo por zona horaria y por eso las fechas se calculan en UTC.
- **Estado:** PASA

### CP-80 · Fecha de inicio = ayer se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-D02
- **Precondición:** Navegador en `/reserva`. Las fechas se calculan en UTC (el servidor usa UTC para "hoy").
- **Datos de prueba:** Inicio = hoy (UTC) − 1 día; fin = hoy + 2 días.
- **Pasos:**
  1. Completar las fechas.
  2. Pulsar "Reservar".
- **Resultado esperado (según la spec):** Rechazo con mensaje de error.
- **Resultado obtenido:** inicio=2026-11-11, fin=2026-11-14; "Reserva confirmada" no aparece; mensaje: "La fecha de inicio no puede ser en el pasado". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-81 · Fecha de fin = inicio + 1 se acepta
- **Técnica:** valores límite
- **REQ que valida:** REQ-D03
- **Precondición:** Navegador en `/reserva`. Las fechas se calculan en UTC (el servidor usa UTC para "hoy").
- **Datos de prueba:** Inicio = hoy (UTC) + 5 días; fin = hoy + 6 días.
- **Pasos:**
  1. Completar las fechas.
  2. Pulsar "Reservar".
- **Resultado esperado (según la spec):** Reserva aceptada (fin posterior al inicio por un día).
- **Resultado obtenido:** inicio=2026-11-17, fin=2026-11-18; "Reserva confirmada" visible. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-82 · Cadena: Liderazgo QA sin completar Diseño de casos → Rechazado
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Curso destino y prerequisito según el caso (ver pasos).
- **Pasos:**
  1. Sin completar nada, `POST /api/enroll` con `liderazgo-qa` (requiere `diseno-casos`).
- **Resultado esperado (según la spec):** 403 (prerequisito pendiente).
- **Resultado obtenido:** diseno-casos sin completar; cupo 14/15; HTTP 200 status=inscrito. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-02)

### CP-83 · Cadena: Liderazgo QA con Diseño de casos completado → Inscrito
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Curso destino y prerequisito según el caso (ver pasos).
- **Pasos:**
  1. Completar `fundamentos` y `diseno-casos` (comenzar + completar).
  2. `POST /api/enroll` con `liderazgo-qa`.
- **Resultado esperado (según la spec):** 200 con `status: "inscrito"` (si hay cupo).
- **Resultado obtenido:** diseno-casos completado; cupo 14/15; HTTP 200 status=inscrito. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-84 · Cadena: CI/CD para QA sin completar Playwright desde cero → Rechazado
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Curso destino y prerequisito según el caso (ver pasos).
- **Pasos:**
  1. Sin completar nada, `POST /api/enroll` con `ci-cd-qa` (requiere `playwright-cero`).
- **Resultado esperado (según la spec):** 403 (prerequisito pendiente).
- **Resultado obtenido:** playwright-cero sin completar; cupo 8/15; HTTP 200 status=inscrito. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-02)

### CP-85 · Cadena: CI/CD para QA con Playwright desde cero completado → Inscrito
- **Técnica:** tabla de decisión
- **REQ que valida:** REQ-C02
- **Precondición:** Usuario nuevo registrado y con sesión iniciada (`/api/register` 201 + `/api/login` 200), sin cursos inscritos.
- **Datos de prueba:** Curso destino y prerequisito según el caso (ver pasos).
- **Pasos:**
  1. Completar `fundamentos` y `playwright-cero` (comenzar + completar).
  2. `POST /api/enroll` con `ci-cd-qa`.
- **Resultado esperado (según la spec):** 200 con `status: "inscrito"` (si hay cupo).
- **Resultado obtenido:** playwright-cero completado; cupo 8/15; HTTP 200 status=inscrito. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-86 · Con sesión, /cursos y /mi-progreso muestran su contenido
- **Técnica:** autorización
- **REQ que valida:** REQ-S01
- **Precondición:** Cuenta de prueba que el sitio publica en `/login` (compartida: su estado puede haber sido modificado por otras personas; no se asumen valores).
- **Datos de prueba:** Cuenta: cuenta de prueba del sitio (leída de /login).
- **Pasos:**
  1. Iniciar sesión.
  2. Navegar a `/cursos` y a `/mi-progreso` con los enlaces de la cabecera (una recarga completa pierde la sesión).
  3. Comprobar contenido y ausencia del aviso de inicio de sesión.
- **Resultado esperado (según la spec):** Ambas páginas muestran su contenido, sin el aviso "Necesitas iniciar sesión".
- **Resultado obtenido:** /cursos con contenido=true; /mi-progreso con contenido=true; avisos de "inicia sesion"=0. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-87 · Cuenta de prueba del sitio: 4 fallos + 1 login exitoso + 1 fallo no bloquea
- **Técnica:** temporal
- **REQ que valida:** REQ-L03
- **Precondición:** Cuenta de prueba que el sitio publica en `/login` (compartida: su estado puede haber sido modificado por otras personas; no se asumen valores). 35 s desde el bloqueo anterior. Este caso bloquea la cuenta compartida unos 30 s.
- **Datos de prueba:** Cuenta: cuenta de prueba del sitio (leída de /login); contraseñas incorrectas deliberadas (`Cusco#1x` a `Cusco#4x`, `Cusco#5x`) y la real una vez (no se imprime ni se adjunta).
- **Pasos:**
  1. Leer las credenciales de `/login`.
  2. `POST /api/login` con 4 contraseñas incorrectas consecutivas.
  3. `POST /api/login` con la contraseña real.
  4. `POST /api/login` con una incorrecta.
- **Resultado esperado (según la spec):** Estados `401, 401, 401, 401, 200, 401`: ningún bloqueo.
- **Resultado obtenido:** HTTP en orden: 401, 401, 401, 429, 429, 429 (esperado 401,401,401,401,200,401; 429 = bloqueo). Cuenta compartida: el bloqueo afecta unos 30 s a quien la use. Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`. La 4.ª respuesta ya es 429, es decir, el bloqueo llega con el 4.º fallo.
- **Estado:** FALLA → posible bug (BUG-10)

### CP-88 · Subida de CV: un .pdf cuyo contenido no es PDF se rechaza
- **Técnica:** partición
- **REQ que valida:** REQ-U02
- **Precondición:** Navegador en `/perfil` (campo `cv-input` sin atributo `accept`; el texto dice "Solo se acepta un archivo PDF de hasta 2 MB"). Archivos generados en memoria. "2 MB" se interpreta como 2 097 152 bytes porque la spec no define el MB.
- **Datos de prueba:** `CV_falso.pdf` con el texto "Esto es texto plano, no un PDF" (sin cabecera `%PDF`). Nota: la spec no define cómo se detecta un PDF; se asume que un archivo sin cabecera PDF no lo es.
- **Pasos:**
  1. Elegir el archivo y pulsar "Subir CV".
  2. Leer el resultado.
- **Resultado esperado (según la spec):** Rechazado: solo se aceptan archivos PDF.
- **Resultado obtenido:** .pdf con texto plano; mensaje: "CV subido correctamente". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`. Evidencia: [cp88-cv.png](evidencia/cp88-cv-falso.png).
- **Estado:** FALLA → posible bug (BUG-15)

### CP-89 · Subida de CV: un PDF de 2 097 153 bytes se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-U03
- **Precondición:** Navegador en `/perfil` (campo `cv-input` sin atributo `accept`; el texto dice "Solo se acepta un archivo PDF de hasta 2 MB"). Archivos generados en memoria. "2 MB" se interpreta como 2 097 152 bytes porque la spec no define el MB.
- **Datos de prueba:** `CV_Marcela_Quispe.pdf`: cabecera `%PDF-1.4` y 2 097 153 bytes (límite + 1).
- **Pasos:**
  1. Elegir el archivo y pulsar "Subir CV".
  2. Leer el resultado.
- **Resultado esperado (según la spec):** Rechazado: supera el máximo de 2 MB.
- **Resultado obtenido:** PDF de 2097153 bytes; mensaje: "CV subido correctamente". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`. Evidencia: [cp89-cv.png](evidencia/cp89-cv-2mb-mas-1.png).
- **Estado:** FALLA → posible bug (BUG-15)

### CP-90 · Subida de CV: un PDF de 2,5 MB se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-U03
- **Precondición:** Navegador en `/perfil` (campo `cv-input` sin atributo `accept`; el texto dice "Solo se acepta un archivo PDF de hasta 2 MB"). Archivos generados en memoria. "2 MB" se interpreta como 2 097 152 bytes porque la spec no define el MB.
- **Datos de prueba:** `CV_Lucia_Mamani_2_5MB.pdf`: cabecera `%PDF-1.4` y 2 621 440 bytes (2,5 MB).
- **Pasos:**
  1. Elegir el archivo y pulsar "Subir CV".
  2. Leer el resultado.
- **Resultado esperado (según la spec):** Rechazado: la spec dice que 2,5 MB debe rechazarse.
- **Resultado obtenido:** PDF de 2621440 bytes; mensaje: "CV subido correctamente". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`. Evidencia: [cp90-cv.png](evidencia/cp90-cv-2-5mb.png).
- **Estado:** FALLA → posible bug (BUG-15)

### CP-91 · Subida de CV: un archivo vacío (0 bytes) se rechaza
- **Técnica:** partición
- **REQ que valida:** REQ-U02
- **Precondición:** Navegador en `/perfil` (campo `cv-input` sin atributo `accept`; el texto dice "Solo se acepta un archivo PDF de hasta 2 MB"). Archivos generados en memoria. "2 MB" se interpreta como 2 097 152 bytes porque la spec no define el MB.
- **Datos de prueba:** `CV_vacio.pdf`, 0 bytes. Nota: la spec no nombra el archivo vacío; se asume que no es un PDF válido (observación).
- **Pasos:**
  1. Elegir el archivo y pulsar "Subir CV".
  2. Leer el resultado.
- **Resultado esperado (según la spec):** Rechazado (sin cabecera PDF no es un PDF).
- **Resultado obtenido:** PDF de 0 bytes; mensaje: "CV subido correctamente". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** FALLA → posible bug (BUG-15; la spec no nombra el archivo vacío, es observación)

### CP-92 · Subida de CV: la extensión en mayúsculas `CV.PDF` se acepta
- **Técnica:** partición
- **REQ que valida:** REQ-U02
- **Precondición:** Navegador en `/perfil` (campo `cv-input` sin atributo `accept`; el texto dice "Solo se acepta un archivo PDF de hasta 2 MB"). Archivos generados en memoria. "2 MB" se interpreta como 2 097 152 bytes porque la spec no define el MB.
- **Datos de prueba:** `CV.PDF`: cabecera `%PDF-1.4`, 2 000 bytes.
- **Pasos:**
  1. Elegir el archivo y pulsar "Subir CV".
  2. Leer el resultado.
- **Resultado esperado (según la spec):** Aceptado: es un PDF.
- **Resultado obtenido:** CV.PDF de 2 000 bytes; mensaje: "CV subido correctamente". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

### CP-93 · Fecha de inicio a hoy + 32 días se rechaza
- **Técnica:** valores límite
- **REQ que valida:** REQ-D02
- **Precondición:** Navegador en `/reserva`. Las fechas se calculan en UTC (el servidor usa UTC para "hoy").
- **Datos de prueba:** Inicio = hoy (UTC) + 32 días; fin = 3 días después.
- **Pasos:**
  1. Completar las fechas.
  2. Pulsar "Reservar".
- **Resultado esperado (según la spec):** Rechazo con mensaje de error (más allá del límite).
- **Resultado obtenido:** inicio=2026-12-14, fin=2026-12-17; "Reserva confirmada" no aparece; mensaje: "La fecha de inicio no puede superar los 30 días". Ejecutado con `tests/evidencia/ejecucion-casos.spec.ts`.
- **Estado:** PASA

## Paso por el juez

Evaluó un agente de Claude con la rúbrica de la sesión 12 (cobertura, claridad, casos límite y Gherkin adaptado a aptitud de traducción); no fue la skill propia del curso, así que es una autoevaluación asistida.

### Puntaje

| Criterio | Puntaje |
|---|---|
| Cobertura | 2 |
| Claridad | 3 |
| Casos límite | 2 |
| Gherkin (aptitud de traducción) | 2 |
| **Total** | **9/12 · banda "requiere revisión"** |

### Qué faltaba y qué casos eran débiles

- Faltaban transiciones prohibidas (En progreso → Certificado, Inscrito → Certificado, Completado → En progreso, Certificado → En progreso, Abandonado → Completado) y el prerequisito en estado Inscrito o Abandonado.
- Faltaba el bloqueo del login sin romperse con un acierto intermedio, el timer partido en sus tres comportamientos, los límites de fecha (hoy, ayer, fin = inicio + 1), la lista de espera sin consumo de cupo, más variantes de email y los campos obligatorios por separado.
- Casos débiles: CP-03 (cadena de 50 caracteres sin mostrar), CP-16 (título que no coincidía con el dato), CP-29 (no comprobaba que no quedara inscrito), CP-41 a CP-44 (no verificaban el mensaje de error), CP-45 (aceptaba un resultado ambiguo) y CP-46 (citaba REQ-S02 sin estar en la spec).
- La matriz de trazabilidad marcaba como cubiertos REQ que solo estaban cubiertos en parte.

### Qué acepté y qué rechacé

| Decisión del juez | Qué hice | Por qué |
|---|---|---|
| Transiciones prohibidas faltantes | Aceptado: CP-60 a CP-64, con verificación de que exista mensaje de error | La spec (REQ-P03) exige rechazarlas con un mensaje de error |
| Prerequisito Inscrito o Abandonado | Aceptado: CP-65 y CP-66 | REQ-C03 dice que solo Completado desbloquea |
| L03: 4 fallos + acierto + 1 fallo | Aceptado: CP-76 (cuenta registrada) y CP-87 (cuenta de prueba del sitio) | Comprueba que el contador de fallos sea consecutivo |
| CP-24 en tres comportamientos | Aceptado: CP-24, CP-77 y CP-78 con espera real de 30 s | Un solo caso mezclaba tres comprobaciones; la espera real es viable |
| D02 y D03 | Aceptado: CP-79 (hoy), CP-80 (ayer), CP-81 (fin = inicio + 1) | Son los límites que faltaban |
| C04 con lista de espera | Aceptado: CP-67 | La espera no debe consumir cupo |
| R03 y R01 | Aceptado: CP-68 a CP-72 (variantes de email) y CP-73 a CP-75 (nombre, contraseña y edad ausentes por separado) | Cada campo y formato tiene su propio resultado |
| Correcciones de CP-03, 16, 29, 41 a 46 | Aceptado | Eran imprecisiones del propio caso; en CP-45 el 2.º certificar debe rechazarse porque Certificado es estado final |
| Nota sobre los endpoints | Aceptado, en el encabezado | Solo `/api/enroll` está en la spec; el resto se observó con DevTools |
| Matriz y Resumen honestos | Aceptado: R01, L01, C02, A02, P02 y otros pasan a cobertura parcial | La cobertura solo por API no es cobertura total |
| Cadena completa de prerrequisitos (CI/CD, Liderazgo) | Aceptado tras reconsiderar: CP-82 a CP-85 | La usuaria decidió ampliarla; se hace por API con el patrón de la tabla C02 |
| U02/U03 con archivos reales y 0 bytes | Aceptado tras reconsiderar: CP-57, 58, 59, 88 a 92 | Se exploró `/perfil` y se ejecutan con archivos generados en memoria, sin PDFs reales en disco; el archivo vacío se registra como observación |
| Edad no numérica, decimal o negativa; nombre vacío o solo espacios | Rechazado | La spec no define su comportamiento; un caso mío inventaría una regla |
| Inscripción C02, C05 y C06 por UI | Rechazado | Se cubre en la Fase 2 (E2E) |
| Página 3 y navegación Siguiente/Anterior en `/estudiantes` | Rechazado | La página 3 no existe por BUG-07 |
| Doble clic en "Certificar" por UI | Rechazado | Ya está cubierto por API (BUG-06, CP-45) |
| Separar CP-52, CP-53 y CP-58 por mezclar dos resultados | Rechazado | Cada uno comparte precondición y datos; el motivo queda anotado en el caso (CP-59 sí se dejó con un solo resultado) |
| Reloj simulado de Playwright para el timer | Rechazado | Con una espera real de 30 s es viable medirlo sin simular el tiempo |

Tras los ajustes el conjunto no se volvió a pasar por el juez. El juez propone; mi criterio gana.
