# ADR-008: Fase 0 — Brief de Requerimientos

**Estado**: Aceptado
**Fecha**: 2026-08-02
**Decisores**: Daniel Felipe Blandón Gómez

## Contexto

La ruta de trabajo arrancaba en la Fase 1 (Constitución), que define principios de
gobernanza y arquitectura limpia. El problema: **la Constitución ya es una decisión**.
Para escribir "el dominio no depende de la infraestructura" o "TDD obligatorio" hay que
saber antes qué se está construyendo y bajo qué restricciones.

En la práctica esa información existía siempre —en la cabeza del arquitecto, en un chat,
en un correo— pero no tenía un artefacto donde vivir. Consecuencias observadas:

- El agente de IA recibía la Constitución sin contexto de negocio, y rellenaba el vacío
  con supuestos. Es exactamente el "Vibe Coding" que el framework existe para eliminar,
  desplazado un nivel hacia arriba.
- El glosario (Fase 2) y la especificación funcional (Fase 3) se redactaban sin una
  fuente previa de la que extraer los términos de negocio.

[ADR-007](ADR-007-quality-gates-spec-kit.md) descartó explícitamente añadir fases nuevas
(alternativa "Opción mayor"), por ser invasivo y romper la convención de 10 fases. Ese
razonamiento era correcto **para el problema que ADR-007 resolvía**: las quality gates de
Spec-Kit son verificaciones sobre artefactos que ya existen, y encajan naturalmente como
secciones dentro de las plantillas.

El brief de requerimientos es de otra naturaleza: no es una verificación sobre un
artefacto previo, es **el insumo del que dependen todos los demás**. No hay fase anterior
dentro de la cual anidarlo.

## Decisión

Añadir la **Fase 0 — Brief de Requerimientos**, con plantilla `00-requerimientos.md`
sembrada en cada proyecto nuevo. La ruta pasa de 10 a **11 fases (0 a 10)** y el
Macro-Ciclo pasa de "Fases 1 a 8" a "Fases 0 a 8".

Se numera 0 y no 1-con-desplazamiento deliberadamente: renumerar las diez fases
existentes invalidaría los artefactos de todos los proyectos ya creados, la memoria del
equipo y los ADRs previos. Prefijar con 0 es aditivo — nada de lo que ya existe cambia de
identidad.

La plantilla pide dos bloques: el **qué** (propósito y requerimientos de negocio) y el
**cómo** (restricciones técnicas: base de datos, API, integraciones).

## Artefactos actualizados

Al no existir enforcement automático sobre prosa (ver §Consecuencias), la propagación es
manual y exhaustiva:

| Artefacto | Cambio |
|---|---|
| [ProjectTemplates.ts](../../src/domain/ProjectTemplates.ts) | Nueva entrada `00-requerimientos.md` al inicio del array |
| [phases.json](../../phases.json) | Nueva entrada `id: 0`, tipo `macro` |
| [App.jsx](../../sdd-frontend/src/App.jsx) | Entrada en `PHASES` + prompt de IA para la fase 0 |
| [spec.md](../../specs/001-framework-core/spec.md) | "10 fases" → "11 fases"; "siembra 10 plantillas" → 11 |
| [api-core.yaml](../../contracts/api-core.yaml) | `summary` de `POST /projects` → 11 plantillas |
| [README.md](../../README.md) | Ruta de trabajo, Macro-Ciclo, árbol de archivos |
| [TUTORIAL.md](../../TUTORIAL.md) · [AGENT.md](../../AGENT.md) | Conteo de fases y rango del Macro-Ciclo |
| Tests | `CreateProjectUseCase.test.ts` y `WorkspaceRouter.test.ts` → 11 plantillas |

## Consecuencias

* **Positivas**:
  - El artefacto de entrada del framework deja de ser implícito. La Constitución ahora se
    escribe *sobre* algo.
  - Cambio aditivo: las fases 1-10 conservan su numeración, sus nombres de archivo y su
    significado. Cero migración para proyectos existentes.
  - Coherencia código ↔ documentación verificada: no queda ninguna mención a "10 fases"
    en artefactos vivos.

* **Negativas / deuda asumida**:
  - **`spec:check` no cubre este tipo de drift.** El detector compara endpoints HTTP
    entre `api-core.yaml` y los routers de Express; la prosa que declara "N plantillas"
    no la valida nadie. Este cambio salió con la CI en verde mientras el código sembraba
    11 plantillas y la spec decía 10. Un gate que compare
    `PROJECT_DOC_TEMPLATES.length` contra el conteo declarado en spec y contrato es
    candidato natural para una fase futura.
  - **Los proyectos existentes** (`3g-truckia` y cualquiera creado antes de este cambio)
    no reciben `00-requerimientos.md` retroactivamente — solo los creados a partir de
    ahora. Coherente con el criterio de [ADR-007](ADR-007-quality-gates-spec-kit.md):
    sobrescribir artefactos del usuario es destructivo.
  - Los ADRs 005 y 007 y las entradas históricas del CHANGELOG siguen diciendo "10
    plantillas". Es correcto: son registro de decisiones en su momento, no
    documentación viva. Este ADR es el que las supersede.

## Alternativas consideradas

- **Anidar los requerimientos dentro de la Fase 1 (Constitución)**, como sección previa.
  Descartada: mezcla dos cosas de naturaleza distinta —input de negocio y ley de
  arquitectura— en un solo artefacto, y el agente de IA no puede tratarlas por separado.
- **Renumerar todo (Requerimientos = 1, Constitución = 2, …)**. Descartada: rompe los
  nombres de archivo de todos los proyectos existentes y la memoria del equipo, a cambio
  de nada más que estética en el conteo.
- **Dejarlo fuera del framework**, como paso previo informal. Es el statu quo que este
  ADR corrige: lo que no tiene artefacto no se revisa, no se versiona y no se aprueba.

## Referencias

- [ADR-007](ADR-007-quality-gates-spec-kit.md) — descartó añadir fases nuevas para el
  caso de las quality gates; este ADR argumenta por qué el brief es un caso distinto.
- [ADR-006](ADR-006-sdd-enforcement.md) — el drift enforcement cuyo alcance (endpoints,
  no prosa) explica por qué este cambio no fue detectado automáticamente.
