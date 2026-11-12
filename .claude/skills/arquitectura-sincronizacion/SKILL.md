---
name: arquitectura-sincronizacion
description: Regla para compartir las skills de proyecto entre Antigravity y Claude Code mediante archivos puente. Úsala SIEMPRE que crees, edites, renombres o elimines una skill de proyecto (cualquier archivo en .agents/skills/ de un repositorio), cuando sea la primera skill de un proyecto nuevo, cuando cambies el name o description de una skill, o cuando el usuario pregunte cómo Claude accede a las skills de Antigravity. Al terminar de tocar la skill, ejecuta el script sincronizar_puentes.py para que Claude Code la vea.
---
# Puente a la skill original

Esta carpeta es solo un **puente** para que Claude Code registre la skill. Las instrucciones completas y los scripts están en la skill original, compartida con otros agentes (Antigravity):

`<RAIZ>\.agents\skills\arquitectura-sincronizacion\`

donde `<RAIZ>` es la carpeta del proyecto que contiene esta carpeta `.claude\` (dos niveles arriba de `skills\`).

## Qué hacer

1. **Lee completo** `<RAIZ>\.agents\skills\arquitectura-sincronizacion\SKILL.md` antes de cualquier otra acción.
2. **Síguelo tal cual**, incluidas las referencias que mencione.
3. Usa los scripts de `<RAIZ>\.agents\skills\arquitectura-sincronizacion\scripts\` (si los tiene). En ese documento, `<skill>` significa esa carpeta, **no** esta.
4. Si el archivo original no existe, detente y avisa al usuario que falta la carpeta `.agents\skills\arquitectura-sincronizacion\` en el proyecto (debe clonar el repositorio completo).

## Mantenimiento

- **No edites este archivo** para cambiar el comportamiento: edita el original en `.agents\`.
- Este puente se regenera con `sincronizar_puentes.py` (skill global `arquitectura-skills-claude-antigravity`); el `name` y el `description` deben ser iguales a los del original.
