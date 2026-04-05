# docs/rbac-matrix.md
## Matriz RBAC: Rol vs Acción vs Recurso [cite: 131, 137]

| Rol | Recurso | Acción (C/R/U/D) | Condición |
| :--- | :--- | :--- | :--- |
| **Arquitecto** | Specs / ADRs | CRUD | Propietario del diseño |
| **Dev** | Tasks / Code | RU | Solo tareas asignadas |
| **Stakeholder** | Specs | R | Solo lectura de validación |
| **IA Agent** | Tasks / Code | RU | Bajo supervisión humana (HITL) |
