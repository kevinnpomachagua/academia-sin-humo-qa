---
name: verificar-pom
description: Revisa un Page Object contra la rúbrica POM, ejecuta el test de
  Playwright indicado y registra evidencia sin modificar el POM ni el test.
---

# Skill: verificar un Page Object

## Entradas
- Ruta del POM.
- Ruta del test objetivo.
- Número del intento actual.

## Reglas
- Esta fase es una responsabilidad lógica separada de la generación, pero corre
  dentro del mismo agente y contexto; no es una revisión independiente.
- No edites el POM, el test ni la aplicación.
- No suavices un fallo ni inventes un resultado.

## Verificación estática
Puntúa de 1 a 3 y cita líneas concretas:
1. Locators semánticos.
2. Aserciones fuera.
3. Estructura POM.
4. Acciones limpias.
Solo 12/12 significa `CALIDAD COMPLETA` en la revisión estática.

## Verificación ejecutable
1. Ejecuta exactamente `npx playwright test <ruta-del-test>`.
2. Registra el comando, el exit code, cuántos tests pasaron y cuántos fallaron.
3. Si falla, extrae el primer error útil sin ocultarlo.

## Salida
Guarda `reports/pom-agent-report.md` con Markdown legible y esta estructura:

1. `# Reporte del Agente POM`.
2. `## Resultado de la verificación` con un bloque destacado que muestre
   `VERIFICACIÓN SUPERADA` solo si total = 12 y exit code = 0, o
   `VERIFICACIÓN FALLIDA` en cualquier otro caso.
3. Una tabla breve con intento, POM, test, evidencia HTML y URL. No coloques listas
   extensas de locators dentro de una celda.
4. `## Evidencia estática — Rúbrica POM` con un subtítulo por criterio. Para cada
   criterio muestra puntaje y evidencias mediante viñetas. Termina con el total.
5. `## Evidencia ejecutable` con un bloque de texto que incluya comando, exit code,
   tests pasados, tests fallidos y duración real.
6. `## Cambios realizados` con viñetas por intento.
7. `## Alcance de esta verificación` aclarando qué demuestra el test y qué no.
8. `## Estado del workflow` reservado para que el workflow agregue `CANDIDATO`
   o `ESCALADO` y la decisión humana pendiente.

Usa tablas solamente para datos breves. Usa subtítulos y viñetas para evidencias
largas. No inventes resultados, duración ni cantidades.

El verificador no utiliza `ACEPTADO`: esa palabra pertenece exclusivamente al
gate humano.