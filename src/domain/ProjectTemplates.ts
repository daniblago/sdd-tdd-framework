export interface ProjectTemplateFile {
  /** Path relativo dentro de la carpeta `docs/` del proyecto. */
  filename: string;
  /** Contenido inicial que se siembra al crear el proyecto. */
  content: string;
}

export const PROJECT_DOC_TEMPLATES: readonly ProjectTemplateFile[] = [
  { filename: '01-constitucion.md', content: '# 01. Constitución del Proyecto\n\nDefine los principios de gobernanza, calidad y arquitectura limpia.' },
  { filename: '02-glosario.md', content: '# 02. Glosario de Dominio\n\nLista de términos de negocio empresariales y sus definiciones (Lenguaje Ubicuo).' },
  { filename: '03-especificacion-funcional.md', content: '# 03. Especificación Funcional\n\nHistorias de usuario y criterios de aceptación detallados.' },
  { filename: '04-arquitectura-y-blueprint.md', content: '# 04. Arquitectura de Alto Nivel y Blueprint\n\nDiagramas de arquitectura C4 (Mermaid) y registros ADR.' },
  { filename: '05-modelo-datos.md', content: '# 05. Modelo de Datos y Cargas\n\nEntidades persistentes, relaciones, contratos JSON y sincronización.' },
  { filename: '06-roles-y-acceso.md', content: '# 06. Matriz de Roles y Control de Acceso\n\nMatriz RBAC (rol vs acción vs recurso).' },
  { filename: '07-flujos.md', content: '# 07. Workflows Operativos\n\nDiagramas de estados y workflows de transiciones del negocio.' },
  { filename: '08-plan-tecnico.md', content: '# 08. Plan Técnico de Implementación\n\nDefinición del stack tecnológico final y estructura de módulos.' },
  { filename: '09-backlog-tdd.md', content: '# 09. Backlog de Tareas Orientado a TDD\n\nLista de tareas unitarias descompiladas bajo el ciclo RED/GREEN/REFACTOR.' },
  { filename: '10-implementacion.md', content: '# 10. Implementación y Verificación TDD\n\nReporte de la construcción y verificación final del código.' }
] as const;
