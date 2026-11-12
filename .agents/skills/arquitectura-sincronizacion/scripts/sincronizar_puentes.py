"""Crea/actualiza los archivos puente de .claude/skills a partir de las skills de .agents/skills.

Para cada `.agents/skills/<carpeta>/SKILL.md` genera `.claude/skills/<carpeta>/SKILL.md`: un puente con el
mismo `name` y `description` que el original, que indica a Claude Code leer y seguir el original.

Uso (desde la raíz del proyecto o con --raiz):
  python sincronizar_puentes.py                     crea/actualiza puentes
  python sincronizar_puentes.py --limpiar           además borra puentes cuyo original ya no existe
  python sincronizar_puentes.py --verificar         no escribe nada; sale con código 1 si algo está desincronizado
  python sincronizar_puentes.py --migrar-junction   si .claude/skills es un junction/symlink, lo quita (sin tocar
                                                    .agents/skills) y crea los puentes
  python sincronizar_puentes.py --gitignore         quita del .gitignore la regla que ignora .claude/skills

Reglas de seguridad:
- Nunca sobrescribe una carpeta de .claude/skills que no sea un puente (sin la marca
  "# Puente a la skill original"); la informa para que se mueva a .agents/skills a mano.
- Un puente existente se considera al día si su name y description coinciden con el original; si no,
  solo se reemplaza su encabezado y se conserva el cuerpo (puede tener instrucciones propias).
"""
import argparse
import json
import os
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")
MARCA = "# Puente a la skill original"
RE_FRONTMATTER = re.compile(r"^---\s*\n(.*?)\n---\s*(?:\n|$)", re.S)
RE_YAML_ESPECIAL = re.compile(r": |\s#|^['\"&*!|>%@`{\[\]]")

PLANTILLA = """---
name: {name}
description: {description}
---

# Puente a la skill original

Esta carpeta es solo un **puente** para que Claude Code registre la skill. Las instrucciones completas y los scripts están en la skill original, compartida con otros agentes (Antigravity):

`<RAIZ>\\.agents\\skills\\{carpeta}\\`

donde `<RAIZ>` es la carpeta del proyecto que contiene esta carpeta `.claude\\` (dos niveles arriba de `skills\\`).

## Qué hacer

1. **Lee completo** `<RAIZ>\\.agents\\skills\\{carpeta}\\SKILL.md` antes de cualquier otra acción.
2. **Síguelo tal cual**, incluidas las referencias que mencione.
3. Usa los scripts de `<RAIZ>\\.agents\\skills\\{carpeta}\\scripts\\` (si los tiene). En ese documento, `<skill>` significa esa carpeta, **no** esta.
4. Si el archivo original no existe, detente y avisa al usuario que falta la carpeta `.agents\\skills\\{carpeta}\\` en el proyecto (debe clonar el repositorio completo).

## Mantenimiento

- **No edites este archivo** para cambiar el comportamiento: edita el original en `.agents\\`.
- Este puente se regenera con `sincronizar_puentes.py` (skill global `arquitectura-skills-claude-antigravity`); el `name` y el `description` deben ser iguales a los del original.
"""


def leer(ruta):
    datos = open(ruta, "rb").read()
    try:
        return datos.decode("utf-8-sig")
    except UnicodeDecodeError:
        return datos.decode("cp1252")  # archivos guardados en ANSI por algunos editores


def cuerpo(texto):
    m = RE_FRONTMATTER.match(texto)
    return texto[m.end():] if m else texto


def yaml_valor(desc):
    """Pone la descripción entre comillas si tiene ': ' u otros símbolos que romperían el YAML."""
    return json.dumps(desc, ensure_ascii=False) if RE_YAML_ESPECIAL.search(desc) else desc


def leer_frontmatter(texto):
    m = RE_FRONTMATTER.match(texto)
    if not m:
        return None, None
    campos, actual, bloque = {}, None, []
    for linea in m.group(1).splitlines():
        mm = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", linea)
        if mm and not linea.startswith((" ", "\t")):
            if actual and bloque:
                campos[actual] = " ".join(x.strip() for x in bloque if x.strip())
            actual, valor, bloque = mm.group(1), mm.group(2).strip(), []
            if valor in (">", "|", ">-", "|-", ">+", "|+", ""):
                continue  # valor en bloque (líneas siguientes con sangría)
            if valor[:1] == '"':
                try:
                    valor = json.loads(valor)
                except ValueError:
                    valor = valor.strip('"')
            elif valor[:1] == "'":
                valor = valor.strip("'").replace("''", "'")
            campos[actual] = valor
            actual = None
        elif actual is not None:
            bloque.append(linea)
    if actual and bloque:
        campos[actual] = " ".join(x.strip() for x in bloque if x.strip())
    return campos.get("name"), campos.get("description")


def es_enlace(ruta):
    if os.path.islink(ruta):
        return True
    if os.name == "nt" and os.path.isdir(ruta):
        r = subprocess.run(["powershell", "-NoProfile", "-Command", f"(Get-Item -LiteralPath '{ruta}' -Force).LinkType"],
                           capture_output=True, text=True)
        return r.stdout.strip() != ""
    return False


def quitar_enlace(ruta):
    if os.name == "nt":
        subprocess.run(["cmd", "/c", "rmdir", ruta], check=True)  # quita el junction, no su destino
    else:
        os.unlink(ruta)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raiz", default=os.getcwd())
    ap.add_argument("--limpiar", action="store_true")
    ap.add_argument("--verificar", action="store_true")
    ap.add_argument("--migrar-junction", action="store_true")
    ap.add_argument("--gitignore", action="store_true")
    a = ap.parse_args()

    raiz = os.path.abspath(a.raiz)
    agentes = os.path.join(raiz, ".agents", "skills")
    claude = os.path.join(raiz, ".claude", "skills")
    if not os.path.isdir(agentes):
        sys.exit(f"No existe {agentes}: no hay skills de proyecto que sincronizar.")

    if os.path.exists(claude) and es_enlace(claude):
        if a.migrar_junction and not a.verificar:
            quitar_enlace(claude)
            print(f"Junction/symlink eliminado (sin tocar {agentes}): {claude}")
        else:
            sys.exit(f"{claude} es un enlace (junction/symlink). Ejecuta con --migrar-junction para reemplazarlo por puentes.")
    if not a.verificar:
        os.makedirs(claude, exist_ok=True)

    originales, pendientes = {}, []
    for carpeta in sorted(os.listdir(agentes)):
        sk = os.path.join(agentes, carpeta, "SKILL.md")
        if not os.path.isfile(sk):
            continue
        name, desc = leer_frontmatter(leer(sk))
        if not name or not desc:
            print(f"AVISO {carpeta}: SKILL.md sin 'name' o 'description' en el frontmatter; se omite.")
            pendientes.append(carpeta)
            continue
        if name != carpeta:
            print(f"AVISO {carpeta}: el name ('{name}') no coincide con la carpeta; conviene igualarlos.")
        originales[carpeta] = (name, desc)

    creados, actualizados, iguales, omitidos, borrados = [], [], [], [], []
    for carpeta, (name, desc) in originales.items():
        destino = os.path.join(claude, carpeta, "SKILL.md")
        if os.path.isfile(destino):
            actual = leer(destino)
            if MARCA not in actual:
                omitidos.append(carpeta)
                continue
            if leer_frontmatter(actual) == (name, desc):
                iguales.append(carpeta)
                continue
            actualizados.append(carpeta)
            contenido = f"---\nname: {name}\ndescription: {yaml_valor(desc)}\n---\n" + cuerpo(actual)
        else:
            creados.append(carpeta)
            contenido = PLANTILLA.format(name=name, description=yaml_valor(desc), carpeta=carpeta)
        if not a.verificar:
            os.makedirs(os.path.dirname(destino), exist_ok=True)
            with open(destino, "w", encoding="utf-8", newline="\n") as f:
                f.write(contenido)

    huerfanos = []
    if os.path.isdir(claude):
        for carpeta in sorted(os.listdir(claude)):
            sk = os.path.join(claude, carpeta, "SKILL.md")
            if carpeta in originales or not os.path.isfile(sk):
                continue
            if MARCA in leer(sk):
                huerfanos.append(carpeta)
                if a.limpiar and not a.verificar:
                    os.remove(sk)
                    if not os.listdir(os.path.join(claude, carpeta)):
                        os.rmdir(os.path.join(claude, carpeta))
                    borrados.append(carpeta)
            else:
                omitidos.append(carpeta)

    gi = os.path.join(raiz, ".gitignore")
    regla_gi = []
    if os.path.isfile(gi):
        lineas = leer(gi).splitlines()
        regla_gi = [l for l in lineas if l.strip().rstrip("/") in (".claude/skills", ".claude", "/.claude/skills", "/.claude")]
        if regla_gi and a.gitignore and not a.verificar:
            open(gi, "w", encoding="utf-8", newline="\n").write("\n".join(l for l in lineas if l not in regla_gi) + "\n")
            print(f".gitignore: se quitaron {regla_gi}")

    print(f"Puentes {'faltan' if a.verificar else 'creados'}: {creados or '-'}")
    print(f"Puentes {'desactualizados' if a.verificar else 'actualizados'}: {actualizados or '-'}")
    print(f"Puentes al día: {iguales or '-'}")
    if huerfanos:
        print(f"Puentes sin original: {huerfanos}" + (" (borrados)" if borrados else " (usar --limpiar para borrarlos)"))
    if omitidos:
        print(f"ATENCIÓN: carpetas en .claude/skills que NO son puentes (no se tocaron; mover a .agents/skills): {omitidos}")
    if regla_gi and not a.gitignore:
        print(f"ATENCIÓN: el .gitignore ignora .claude/skills ({regla_gi}); los puentes deben versionarse. Usa --gitignore.")
    if a.verificar and (creados or actualizados or (huerfanos and not borrados) or pendientes or omitidos):
        sys.exit(1)


if __name__ == "__main__":
    main()
