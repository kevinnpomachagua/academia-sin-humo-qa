---
name: verificar-proyecto-final
description: Audita en solo lectura el repo de Academia sin Humo contra la Definición de terminado y las cinco reglas de la consigna del proyecto final, con evidencia por ítem (archivo:línea, comando o enlace), estado cumple, parcial o no cumple, y coherencia de cifras entre documentos.
---

# Skill: verificar el proyecto final

## Entradas
- Consigna: `D:\AntigravityProject\Web\TesteandoYa _QA_ IA\3_Material-Curso\_fuentes_md\S16_Proyecto-Final-Consigna.md.txt` (secciones "Definición de terminado" y "Cinco reglas que no se negocian").
- Repo: `README.md`, `docs/`, `pages/`, `tests/`, `.github/workflows/`, `reports/`, `.agents/skills/`.
- Enlace del run de CI de referencia, si quien usa la skill lo da.

## Reglas
- Solo lectura. El único archivo que escribe es `reports/proyecto-final-report.md`.
- Marca como cumple solo lo que puedas evidenciar. Un ítem que depende de quien usa la skill (revisó el workflow línea por línea, descargó el artifact) queda `parcial / pendiente de confirmación`.
- No suavices un hallazgo ni inventes un resultado. Cada ítem lleva evidencia: `archivo:línea`, comando con su salida o enlace.
- Si una consulta externa falla, escribe "no verificado" y di qué falta. No uses tokens ni inicies sesión.
- No uses la palabra `ACEPTADO`: es exclusiva de la decisión de quien usa la skill.

## Qué se audita
1. **Criterio:** estrategia con riesgo, matriz y alcance; qué NO demuestra la suite; casos con al menos dos técnicas y REQ en cada caso; veredicto del juez con lo aceptado y rechazado.
2. **Código:** E2E con Page Object y locators semánticos; al menos cuatro tests de API con status de la spec; integrado con dato compartido identificado; sin `waitForTimeout`, `skip` ni aserciones debilitadas; suite estable tres veces (usa `verificar-estabilidad-suite`).
3. **Automatización:** workflow existente, revisado y con run propio; artifact `playwright-report` descargado y revisado; sin secretos versionados (grep de tokens, cookies, `.env`, `git ls-files`).
4. **Entrega:** reporte de bugs con evidencia; README con qué se probó, qué no y qué se encontró; historial de commits (`git log --oneline | wc -l`) que muestre trabajo, no un commit gigante.
5. **Cinco reglas:** la spec manda, un test que falla puede ser la entrega, la IA propone y la persona valida, alcance declarado, sin secretos.

## Coherencia de cifras
Cuenta con comandos y compara entre `README.md`, `docs/estrategia.md`, `docs/reporte-de-bugs.md` y `docs/casos-de-prueba.md`: tests (`npx playwright test --list`), tests del CI, casos (`grep -c "^### CP-"`), bugs (`grep -c "^### BUG-"`), `test.fail` y conteos PASA/FALLA. Cada diferencia es un hallazgo.

## Reporte (`reports/proyecto-final-report.md`)
1. `# Reporte de verificación del proyecto final` y `## Resultado` con bloque `AUDITORÍA SUPERADA` o `AUDITORÍA CON HALLAZGOS` y el recuento de cumple, parcial y no cumple.
2. `## Checklist` con una tabla por bloque: ítem, estado, evidencia.
3. `## Coherencia de cifras`, `## Cinco reglas`, `## Hallazgos` (sin corregir, con recomendación), `## Pendiente de mi parte` y `## Estado` (decisión humana pendiente).
4. Nota: "Estas skills se construyeron después de escribir los tests y se aplicaron como verificación, no como generadores del código original".
