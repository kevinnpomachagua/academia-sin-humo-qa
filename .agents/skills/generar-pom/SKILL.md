---
name: generar-pom
description: Crea o corrige un Page Object de Playwright usando evidencia HTML,el contrato del test existente y un reporte de verificación anterior.
---

# Skill: generar o corregir un Page Object

## Entradas
- Ruta del POM objetivo.
- Ruta del test que lo utiliza.
- Ruta de la evidencia HTML.
- URL o ruta de navegación que debe usar `goto()`.
- Reporte anterior, si existe.

## Instrucciones
1. Lee primero el test para conservar los nombres públicos que necesita.
2. Lee el HTML real; no inventes etiquetas, roles ni textos.
3. Usa la URL o ruta recibida para implementar `goto()`; no la deduzcas del HTML
   ni inventes una dirección.
4. Si existe un reporte anterior, corrige solamente los defectos respaldados por
   esa evidencia.
5. Crea o edita únicamente el POM solicitado.
6. Usa locators semánticos. `getByTestId` es el último recurso.
7. Mantén `readonly page: Page` y los locators como propiedades `readonly`.
8. Expón los cinco controles exigidos por el test: nombre, email, contraseña, edad
   y botón Crear cuenta.
9. Separa `goto()` de las acciones y usa parámetros claros.
10. No pongas `expect` ni métodos de verificación dentro del POM.
11. Guarda el archivo. No digas que funciona: esa decisión pertenece al verificador.

## Salida
Informa la ruta modificada y un resumen breve de los cambios.