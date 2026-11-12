---
name: arquitectura-sincronizacion
description: Regla para compartir las skills de proyecto entre Antigravity y Claude Code mediante archivos puente. Úsala SIEMPRE que crees, edites, renombres o elimines una skill de proyecto (cualquier archivo en .agents/skills/ de un repositorio), cuando sea la primera skill de un proyecto nuevo, cuando cambies el name o description de una skill, o cuando el usuario pregunte cómo Claude accede a las skills de Antigravity. Al terminar de tocar la skill, ejecuta el script sincronizar_puentes.py para que Claude Code la vea.
---

# Skills compartidas Antigravity ↔ Claude Code (archivos puente)

El usuario trabaja en **Antigravity** y crea ahí las skills de cada proyecto. **Claude Code** solo registra
skills que estén en `.claude/skills/`. Para que Claude vea las skills de Antigravity sin duplicarlas se usan
**archivos puente**: Antigravity crea el puente cada vez que crea o modifica una skill de proyecto.

## Arquitectura

| Carpeta | Contenido | Git |
|---|---|---|
| `.agents/skills/<nombre>/` | **Fuente de la verdad**: `SKILL.md` completo, `scripts/`, `references/`, `assets/`. Antigravity la lee de forma nativa. | Se versiona |
| `.claude/skills/<nombre>/SKILL.md` | **Puente**: carpeta y archivo normales, mismo `name` y `description` que el original; su cuerpo le indica a Claude leer y seguir el original. | Se versiona |

**Nunca uses junctions, symlinks ni accesos directos para `.claude/skills`**:
- Git no guarda los junctions de Windows: al clonar el repositorio, Claude no vería ninguna skill.
- En Windows PowerShell 5.1, `Remove-Item -Recurse` sobre un junction puede borrar el contenido real de `.agents/skills`.
- Backups, ZIP y sincronizadores siguen los enlaces y duplican (o pierden) el contenido.

## Procedimiento obligatorio al crear o modificar una skill de proyecto

1. Crea o edita la skill **solo** en `<raíz del proyecto>/.agents/skills/<nombre>/`.
   - El nombre de la carpeta y el `name` del frontmatter deben ser iguales (minúsculas y guiones).
   - El `description` debe decir qué hace y **cuándo usarla**: es lo que Claude usa para decidir si la activa.
2. Al terminar, genera o actualiza los puentes ejecutando:

   ```powershell
   python "$env:USERPROFILE\.gemini\config\skills\arquitectura-skills-claude-antigravity\scripts\sincronizar_puentes.py" --raiz "<raíz del proyecto>" --limpiar
   ```

   El script crea un puente por cada skill de `.agents/skills`, actualiza los que cambiaron de `name`/`description`,
   borra los puentes cuyo original ya no existe (`--limpiar`) y nunca sobrescribe una carpeta de
   `.claude/skills` que no sea un puente (la informa).
3. Revisa la salida: no debe quedar ningún "ATENCIÓN". Si el `.gitignore` ignora `.claude/skills`, vuelve a ejecutar con `--gitignore`.
4. Si el proyecto aún no tiene la copia local de esta regla (`.agents/skills/arquitectura-sincronizacion/`), créala (ver abajo) y vuelve a ejecutar el paso 2.

Para comprobar sin modificar nada: `--verificar` (sale con código 1 si falta o sobra algún puente).

**No escribas los puentes a mano con PowerShell** (`Set-Content`, `Out-File`, `>` sin `-Encoding utf8`): en Windows
PowerShell 5.1 se guardan en ANSI y las tildes llegan corruptas a Claude ("especÃ­fico", "Ãšsala"). El script
escribe en UTF-8; si detecta puentes con la descripción corrupta, los marca como desactualizados y al ejecutarlo
corrige solo su encabezado.

## Primera skill de un proyecto nuevo

Además del procedimiento anterior:
1. Crea `.agents/skills/` en la raíz del proyecto (el script crea `.claude/skills/`).
2. Copia esta skill al proyecto como `.agents/skills/arquitectura-sincronizacion/` (con su carpeta `scripts/`),
   cambiando en el frontmatter `name: arquitectura-sincronizacion`. Así la regla viaja con el repositorio y la
   conocen todos los agentes (Claude la verá por su puente). En esa copia local, el script se ejecuta desde
   `.agents\skills\arquitectura-sincronizacion\scripts\sincronizar_puentes.py`.
3. Ejecuta `sincronizar_puentes.py` (paso 2 del procedimiento).

## Migrar un proyecto que usa junction

```powershell
python "$env:USERPROFILE\.gemini\config\skills\arquitectura-skills-claude-antigravity\scripts\sincronizar_puentes.py" --raiz "<raíz>" --migrar-junction --gitignore --limpiar
```

Quita el junction con `cmd /c rmdir` (no toca `.agents/skills`), crea los puentes y deja de ignorar
`.claude/skills` en Git. Si dentro del junction había skills que no estaban en `.agents/skills`, muévelas
primero a `.agents/skills`.

## Plantilla del puente (referencia; el script la genera)

```markdown
---
name: <nombre>
description: <mismo description que el original>
---

# Puente a la skill original

Esta carpeta es solo un **puente** para que Claude Code registre la skill. Las instrucciones completas y los scripts están en la skill original, compartida con otros agentes (Antigravity):

`<RAIZ>\.agents\skills\<nombre>\`

donde `<RAIZ>` es la carpeta del proyecto que contiene esta carpeta `.claude\` (dos niveles arriba de `skills\`).

## Qué hacer

1. **Lee completo** `<RAIZ>\.agents\skills\<nombre>\SKILL.md` antes de cualquier otra acción.
2. **Síguelo tal cual**, incluidas las referencias que mencione.
3. Usa los scripts de `<RAIZ>\.agents\skills\<nombre>\scripts\` (si los tiene). En ese documento, `<skill>` significa esa carpeta, **no** esta.
4. Si el archivo original no existe, detente y avisa al usuario que falta la carpeta `.agents\skills\<nombre>\` en el proyecto (debe clonar el repositorio completo).

## Mantenimiento

- **No edites este archivo** para cambiar el comportamiento: edita el original en `.agents\`.
- Este puente se regenera con `sincronizar_puentes.py`; el `name` y el `description` deben ser iguales a los del original.
```

## Decisión global vs. local

Antes de crear una skill en un proyecto, confirma con el usuario si es una regla de *ese* repositorio. Si es
una utilidad transversal (ej. "Cómo crear un Dockerfile"), va en las skills globales
(`~/.gemini/config/skills/`) y no necesita puente.
