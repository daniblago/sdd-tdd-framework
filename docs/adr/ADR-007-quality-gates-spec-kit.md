# ADR-007: Quality Gates inspiradas en GitHub Spec-Kit

**Estado**: Aceptado
**Fecha**: 2026-05-28
**Decisores**: Daniel Felipe Blandón Gómez

## Contexto

Se evaluó [GitHub Spec-Kit](https://github.com/github/spec-kit) como posible base del
repositorio. Conclusión: son productos distintos. Spec-Kit es una **CLI** (`specify init`)
con slash commands para un dev individual en su IDE; este framework es una **app web +
backend** con orquestación de equipo (UI multi-proyecto, RBAC, sellado, descarga ZIP,
proxy multi-IA, drift enforcement). Migrar a Spec-Kit implicaría tirar todo eso.

Sin embargo, Spec-Kit formaliza tres **quality gates** que este framework no tenía como
pasos explícitos:

- `clarify` — resolver ambigüedades de la spec antes de comprometer el diseño técnico.
- `checklist` — validar la calidad del plan técnico antes de descomponer en tareas.
- `analyze` — verificar consistencia spec ↔ plan ↔ tasks antes de implementar.

Son las tres preguntas que un arquitecto senior hace antes de dar luz verde a "codeen".
El framework asumía que ya estaban resueltas implícitamente.

## Decisión

Adoptar las tres gates **dentro de las plantillas de las fases existentes**, sin crear
fases nuevas. Se evaluaron tres opciones de inversión (ver §Alternativas) y se eligió la
moderada.

Cada gate se materializa como una sección al final de la plantilla de fase
correspondiente, en [src/domain/ProjectTemplates.ts](../../src/domain/ProjectTemplates.ts):

| Gate | Plantilla | Bloquea avance a | Forma |
|------|-----------|------------------|-------|
| **Clarify** | `03-especificacion-funcional.md` | Fase 4 | Tabla de preguntas abiertas → decisión → decisor |
| **Checklist** | `08-plan-tecnico.md` | Fase 9 | Checklist de 8 criterios (testing, seguridad, observabilidad, performance, deps, rollback...) |
| **Analyze** | `09-backlog-tdd.md` | Fase 10 | Tres listas de trazabilidad (spec→tasks, plan→tasks, tasks→spec/plan) que deben quedar vacías |

[AGENT.md](../../AGENT.md) gana una sección "Quality Gates" que obliga al agente IA a no
avanzar si la gate previa no está resuelta. El [README](../../README.md) gana una tabla
de gates y una nota de posicionamiento respecto a Spec-Kit.

## Consecuencias

* **Positivas**:
  - Cada proyecto nuevo se siembra con las gates pre-incluidas (verificado en runtime:
    fases 3/8/9 las traen, fase 1 no).
  - Se captura el aprendizaje de Spec-Kit sin romper la convención de 10 fases que ya
    está internalizada en código, tests, `phases.json`, frontend y proyectos
    `workspaces/`.
  - Cero cambios de contrato HTTP → `spec:check` sigue verde, los 176 tests siguen
    pasando (la plantilla es referenciada por `CreateProjectUseCase`, no copiada literal).
  - Posiciona el framework en el ecosistema SDD sin pretender competir con la CLI.

* **Negativas / deuda asumida**:
  - **Las gates son convención documental, no enforcement automático.** Nada impide
    técnicamente guardar la Fase 4 con la gate de Clarify a medias. El cumplimiento
    depende del agente IA (vía AGENT.md) y del arquitecto humano. Convertirlas en
    enforcement duro (p.ej. el endpoint de sellado verifica que las gates estén
    completas) es candidato para una fase futura.
  - **Los proyectos existentes** (`residentapp`, `3g-truckia`) no reciben las gates
    retroactivamente — solo los proyectos creados a partir de ahora. Adoptarlas en un
    proyecto viejo es copiar/pegar manual de las secciones. No se hizo migración
    automática porque sobrescribir artefactos existentes del usuario es destructivo.

## Alternativas consideradas

- **Opción mínima**: solo una nota en el README apuntando a Spec-Kit, cero código.
  Descartada: no captura el valor de las gates.
- **Opción mayor**: tres fases nuevas (3.5, 8.5, 9.5) con plantillas propias,
  actualizando `phases.json`, frontend, tests y `spec:check`. Descartada: invasiva,
  rompe la convención de 10 fases internalizada en todo el stack, y obliga a migrar
  proyectos existentes.
- **Migrar a Spec-Kit**: descartada de raíz — es una CLI para dev individual, no una
  plataforma de orquestación de equipo.

## Referencias

- [GitHub Spec-Kit](https://github.com/github/spec-kit)
- [ADR-006](ADR-006-sdd-enforcement.md) — el drift enforcement que ya valida el contrato.
