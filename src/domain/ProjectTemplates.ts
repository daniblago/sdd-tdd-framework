export interface ProjectTemplateFile {
  /** Path relativo dentro de la carpeta `docs/` del proyecto. */
  filename: string;
  /** Contenido inicial que se siembra al crear el proyecto. */
  content: string;
}

const PHASE_3_CONTENT = `# 03. Especificación Funcional

Historias de usuario y criterios de aceptación detallados.

---

## Quality Gate: Clarificaciones (antes de Fase 4)

Antes de avanzar al diseño arquitectónico, resuelve cada ambigüedad detectada en
las historias o criterios de aceptación. Por cada criterio que admita más de una
interpretación o dependa de información no explicitada, añade una fila.

| # | Pregunta abierta | Decisión tomada | Decidido por |
|---|------------------|-----------------|--------------|
|   |                  |                 |              |

**Regla:** no pases a Fase 4 con preguntas abiertas. Si una pregunta no puede
responderse ahora, marca el escenario afectado como \`[fuera de alcance v1]\` en
la sección de Historias.
`;

const PHASE_8_CONTENT = `# 08. Plan Técnico de Implementación

Definición del stack tecnológico final y estructura de módulos.

---

## Quality Gate: Checklist del Plan (antes de Fase 9)

El plan técnico está completo cuando TODOS estos puntos están marcados (o el
ítem está explícitamente anotado como \`[deuda anotada]\` con su razón):

- [ ] Stack tecnológico justificado contra al menos 2 alternativas descartadas.
- [ ] Estructura de módulos respeta Clean Architecture (dominio aislado de infraestructura).
- [ ] Estrategia de testing definida: tipos de prueba, cobertura objetivo, herramientas.
- [ ] Política de logging y observabilidad declarada: qué se loggea, qué no, dónde.
- [ ] Decisiones de seguridad explícitas: autenticación, autorización, validación de input, manejo de secretos.
- [ ] Plan de migración y rollback ante cambios incompatibles.
- [ ] Performance: hot paths identificados y SLOs por endpoint si aplica.
- [ ] Dependencias externas listadas con versión y justificación.

**Regla:** no pases a Fase 9 sin marcar todos los items o registrar la deuda.
`;

const PHASE_9_CONTENT = `# 09. Backlog de Tareas Orientado a TDD

Lista de tareas unitarias descompuestas bajo el ciclo RED/GREEN/REFACTOR.

---

## Quality Gate: Análisis de Trazabilidad (antes de Fase 10)

Antes de delegar la implementación, verifica las tres direcciones de trazabilidad
y deja la evidencia abajo. **Las tres listas deben quedar vacías.**

### Spec → Tasks
Cada criterio de aceptación de Fase 3 debe tener al menos una task.
Lista los criterios SIN task asociada:

-

### Plan → Tasks
Cada módulo del plan técnico (Fase 8) debe tener tasks de creación + tests.
Lista los módulos SIN tasks:

-

### Tasks → Spec/Plan
Cada task debe referenciar el criterio de spec o módulo de plan que la justifica.
Lista las tasks huérfanas (sin referencia):

-

**Regla:** si queda cualquier ítem en cualquiera de las tres listas, NO procedas a Fase 10.
`;

export const PROJECT_DOC_TEMPLATES: readonly ProjectTemplateFile[] = [
  { filename: '01-constitucion.md', content: '# 01. Constitución del Proyecto\n\nDefine los principios de gobernanza, calidad y arquitectura limpia.' },
  { filename: '02-glosario.md', content: '# 02. Glosario de Dominio\n\nLista de términos de negocio empresariales y sus definiciones (Lenguaje Ubicuo).' },
  { filename: '03-especificacion-funcional.md', content: PHASE_3_CONTENT },
  { filename: '04-arquitectura-y-blueprint.md', content: '# 04. Arquitectura de Alto Nivel y Blueprint\n\nDiagramas de arquitectura C4 (Mermaid) y registros ADR.' },
  { filename: '05-modelo-datos.md', content: '# 05. Modelo de Datos y Cargas\n\nEntidades persistentes, relaciones, contratos JSON y sincronización.' },
  { filename: '06-roles-y-acceso.md', content: '# 06. Matriz de Roles y Control de Acceso\n\nMatriz RBAC (rol vs acción vs recurso).' },
  { filename: '07-flujos.md', content: '# 07. Workflows Operativos\n\nDiagramas de estados y workflows de transiciones del negocio.' },
  { filename: '08-plan-tecnico.md', content: PHASE_8_CONTENT },
  { filename: '09-backlog-tdd.md', content: PHASE_9_CONTENT },
  { filename: '10-implementacion.md', content: '# 10. Implementación y Verificación TDD\n\nReporte de la construcción y verificación final del código.' }
] as const;
