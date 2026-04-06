# docs/workflows/aprobacion-especificacion.md
## Workflow: Ciclo de Vida de la Especificación (Fase 7)

### Estados y Transiciones
1. **DRAFT**: La especificación está siendo redactada en spec.md.
2. **REVIEW**: El Arquitecto o Stakeholder revisa los criterios de aceptación[cite: 78, 153].
3. **APPROVED**: Plano funcional validado. Se permite pasar a la Fase 8 (Plan Técnico)[cite: 216].
4. **REJECTED**: Requiere ajustes por ambigüedad o falta de alineación con la constitución[cite: 88, 156].

### Matriz de Transición
| Origen | Acción | Destino | Actor Responsable [cite: 153] |
| :--- | :--- | :--- | :--- |
| DRAFT | Solicitar Revisión | REVIEW | Dev / IA Agent |
| REVIEW | Validar Criterios | APPROVED | Arquitecto |
| REVIEW | Detectar Vacíos | REJECTED | Arquitecto |

### Validaciones [cite: 155]
* Toda transición a **APPROVED** requiere que no existan tareas pendientes en el glosario de dominio (Fase 2).
