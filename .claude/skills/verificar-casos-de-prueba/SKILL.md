---
name: verificar-casos-de-prueba
description: Toma casos de prueba ya hechos, los pasa a Gherkin (rol traductor) y los juzga contra la rúbrica de 4 pilares de la clase 09 (cobertura, claridad, casos límite, Gherkin) con puntaje, veredicto y qué falta agregar; propone, no modifica los casos.
---
# Puente a la skill original

Esta carpeta es solo un **puente** para que Claude Code registre la skill. Las instrucciones completas y los scripts están en la skill original, compartida con otros agentes (Antigravity):

`<RAIZ>\.agents\skills\verificar-casos-de-prueba\`

donde `<RAIZ>` es la carpeta del proyecto que contiene esta carpeta `.claude\` (dos niveles arriba de `skills\`).

## Qué hacer

1. **Lee completo** `<RAIZ>\.agents\skills\verificar-casos-de-prueba\SKILL.md` antes de cualquier otra acción.
2. **Síguelo tal cual**, incluidas las referencias que mencione.
3. Usa los scripts de `<RAIZ>\.agents\skills\verificar-casos-de-prueba\scripts\` (si los tiene). En ese documento, `<skill>` significa esa carpeta, **no** esta.
4. Si el archivo original no existe, detente y avisa al usuario que falta la carpeta `.agents\skills\verificar-casos-de-prueba\` en el proyecto (debe clonar el repositorio completo).

## Mantenimiento

- **No edites este archivo** para cambiar el comportamiento: edita el original en `.agents\`.
- Este puente se regenera con `sincronizar_puentes.py` (skill global `arquitectura-skills-claude-antigravity`); el `name` y el `description` deben ser iguales a los del original.
