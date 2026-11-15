---
name: verificar-estabilidad-suite
description: Comprueba en solo lectura sobre el código que la suite del CI de Academia sin Humo es estable (npm run test:ci tres veces seguidas con el mismo resultado) y busca anti-patrones como waitForTimeout, skip, fixme, retries, networkidle o aserciones debilitadas, guardando un reporte en reports/.
---

# Puente a la skill original

Esta carpeta es solo un **puente** para que Claude Code registre la skill. Las instrucciones completas y los scripts están en la skill original, compartida con otros agentes (Antigravity):

`<RAIZ>\.agents\skills\verificar-estabilidad-suite\`

donde `<RAIZ>` es la carpeta del proyecto que contiene esta carpeta `.claude\` (dos niveles arriba de `skills\`).

## Qué hacer

1. **Lee completo** `<RAIZ>\.agents\skills\verificar-estabilidad-suite\SKILL.md` antes de cualquier otra acción.
2. **Síguelo tal cual**, incluidas las referencias que mencione.
3. Usa los scripts de `<RAIZ>\.agents\skills\verificar-estabilidad-suite\scripts\` (si los tiene). En ese documento, `<skill>` significa esa carpeta, **no** esta.
4. Si el archivo original no existe, detente y avisa al usuario que falta la carpeta `.agents\skills\verificar-estabilidad-suite\` en el proyecto (debe clonar el repositorio completo).

## Mantenimiento

- **No edites este archivo** para cambiar el comportamiento: edita el original en `.agents\`.
- Este puente se regenera con `sincronizar_puentes.py` (skill global `arquitectura-skills-claude-antigravity`); el `name` y el `description` deben ser iguales a los del original.
